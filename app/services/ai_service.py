from __future__ import annotations

import asyncio
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ai_models import get_ai_models
from app.core.cache import cache
from app.models.news import NewsArticle, NewsCategory


class AIService:
    @staticmethod
    async def analyze_article(article: NewsArticle) -> dict[str, Any]:
        """Run sentiment, entity, keyword, and relevance analysis for an article."""
        ai_models = get_ai_models()

        text = ". ".join(
            part.strip()
            for part in [article.title, article.description or "", article.content or ""]
            if part and part.strip()
        )

        sentiment_result = await asyncio.to_thread(ai_models.analyze_sentiment, text, True)
        entities = await asyncio.to_thread(ai_models.extract_entities, text)
        keywords = await asyncio.to_thread(ai_models.extract_keywords, text, 10)

        relevance_score = AIService._calculate_relevance_score(
            article=article,
            sentiment=sentiment_result,
            entities=entities,
            keywords=keywords,
        )

        return {
            "sentiment": sentiment_result["sentiment"],
            "sentiment_score": sentiment_result["sentiment_score"],
            "confidence": sentiment_result["confidence"],
            "entities": entities,
            "keywords": keywords,
            "relevance_score": relevance_score,
        }

    @staticmethod
    def _calculate_relevance_score(
        article: NewsArticle,
        sentiment: dict[str, Any],
        entities: dict[str, list[str]],
        keywords: list[str],
    ) -> int:
        score = 50

        real_estate_keywords = {
            "property",
            "real estate",
            "housing",
            "apartment",
            "villa",
            "rent",
            "rental",
            "sale",
            "market",
            "dubai",
            "developer",
            "construction",
            "mortgage",
            "off-plan",
        }
        keyword_matches = sum(
            1
            for keyword in keywords
            if any(target in keyword.lower() for target in real_estate_keywords)
        )
        score += min(keyword_matches * 5, 25)

        dubai_mentioned = any("dubai" in location.lower() for location in entities.get("locations", []))
        if dubai_mentioned:
            score += 15

        known_companies = {
            "emaar",
            "damac",
            "aldar",
            "nakheel",
            "sobha",
            "azizi",
            "meraas",
            "dubai properties",
        }
        company_matches = sum(
            1
            for organization in entities.get("organizations", [])
            if any(company in organization.lower() for company in known_companies)
        )
        score += min(company_matches * 10, 20)

        published_at = article.published_at
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)

        hours_old = (datetime.now(timezone.utc) - published_at).total_seconds() / 3600
        if hours_old < 6:
            score += 10
        elif hours_old < 24:
            score += 5

        if article.category == NewsCategory.REAL_ESTATE:
            score += 10
        elif article.category != NewsCategory.GENERAL:
            score += 5

        if abs(int(sentiment.get("sentiment_score", 0))) > 70:
            score += 10

        return max(0, min(100, score))

    @staticmethod
    async def detect_trends(db: AsyncSession, days: int = 7) -> list[dict[str, int | str]]:
        cached_trends = await cache.get_cached_analytics_trends(days)
        if cached_trends is not None:
            return cached_trends

        from_date = datetime.now(timezone.utc) - timedelta(days=days)
        result = await db.execute(
            select(NewsArticle).where(
                and_(
                    NewsArticle.published_at >= from_date,
                    NewsArticle.is_published.is_(True),
                )
            )
        )
        articles = result.scalars().all()

        all_keywords: list[str] = []
        for article in articles:
            if article.keywords:
                all_keywords.extend(article.keywords)

        keyword_counts = Counter(all_keywords)
        trends = [
            {
                "keyword": keyword,
                "count": count,
                "trend_score": count * 10,
            }
            for keyword, count in keyword_counts.most_common(20)
            if count > 3
        ]
        await cache.cache_analytics_trends(days, trends, ttl=300)
        return trends

    @staticmethod
    async def get_sentiment_distribution(
        db: AsyncSession,
        category: NewsCategory | None = None,
        days: int = 7,
    ) -> dict[str, int | float]:
        category_key = category.value if category is not None else None
        cached_distribution = await cache.get_cached_analytics_sentiment(category_key, days)
        if cached_distribution is not None:
            return cached_distribution

        from_date = datetime.now(timezone.utc) - timedelta(days=days)

        query = (
            select(NewsArticle.sentiment, func.count(NewsArticle.id).label("count"))
            .where(
                and_(
                    NewsArticle.published_at >= from_date,
                    NewsArticle.is_published.is_(True),
                )
            )
            .group_by(NewsArticle.sentiment)
        )

        if category is not None:
            query = query.where(NewsArticle.category == category)

        result = await db.execute(query)
        rows = result.all()

        distribution: dict[str, int | float] = {
            "positive": 0,
            "neutral": 0,
            "negative": 0,
            "total": 0,
            "positive_percent": 0.0,
            "neutral_percent": 0.0,
            "negative_percent": 0.0,
        }

        for sentiment, count in rows:
            if sentiment is None:
                continue
            distribution[sentiment.value] = count
            distribution["total"] += count

        total = int(distribution["total"])
        if total > 0:
            for key in ("positive", "neutral", "negative"):
                distribution[f"{key}_percent"] = round((int(distribution[key]) / total) * 100, 2)

        await cache.cache_analytics_sentiment(category_key, days, distribution, ttl=300)
        return distribution

    @staticmethod
    async def get_recommendations(
        db: AsyncSession,
        user_preferences: dict[str, Any] | None = None,
        limit: int = 10,
    ) -> list[NewsArticle]:
        del user_preferences

        result = await db.execute(
            select(NewsArticle)
            .where(NewsArticle.is_published.is_(True))
            .order_by(NewsArticle.relevance_score.desc(), NewsArticle.published_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
