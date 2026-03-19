from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from celery import shared_task
from loguru import logger
from sqlalchemy import and_, select

from app.database import AsyncSessionLocal
from app.models.news import NewsArticle
from app.services.news_service import NewsService


@shared_task(name="analyze_pending_articles")
def analyze_pending_articles() -> None:
    asyncio.run(_analyze_pending_articles())


async def _analyze_pending_articles() -> None:
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(NewsArticle)
                .where(
                    and_(
                        NewsArticle.keywords.is_(None),
                        NewsArticle.is_published.is_(True),
                    )
                )
                .limit(50)
            )
            articles = result.scalars().all()
            logger.info("Found {} articles pending AI analysis", len(articles))

            processed = 0
            for article in articles:
                try:
                    updated = await NewsService.analyze_and_update_article(db, article.id)
                    if updated is not None:
                        processed += 1
                except Exception as exc:
                    logger.error("Error analyzing article {}: {}", article.id, str(exc))

            logger.info("Successfully analyzed {} articles", processed)
        except Exception as exc:
            logger.error("Error in analyze_pending_articles task: {}", str(exc))


@shared_task(name="reanalyze_low_confidence_articles")
def reanalyze_low_confidence_articles() -> None:
    asyncio.run(_reanalyze_low_confidence_articles())


async def _reanalyze_low_confidence_articles() -> None:
    async with AsyncSessionLocal() as db:
        try:
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            result = await db.execute(
                select(NewsArticle)
                .where(
                    and_(
                        NewsArticle.published_at >= week_ago,
                        NewsArticle.relevance_score < 30,
                        NewsArticle.is_published.is_(True),
                    )
                )
                .limit(20)
            )
            articles = result.scalars().all()

            for article in articles:
                await NewsService.analyze_and_update_article(db, article.id)

            logger.info("Reanalyzed {} low-confidence articles", len(articles))
        except Exception as exc:
            logger.error("Error in reanalyze_low_confidence_articles task: {}", str(exc))
