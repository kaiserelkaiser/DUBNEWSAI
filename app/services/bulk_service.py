from __future__ import annotations

from typing import Any

from loguru import logger
from sqlalchemy import case, insert, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.news import NewsArticle


class BulkOperationService:
    """Utilities for efficient batch writes."""

    @staticmethod
    async def bulk_insert_articles(db: AsyncSession, articles: list[dict[str, Any]]) -> int:
        if not articles:
            return 0

        try:
            await db.execute(insert(NewsArticle).values(articles))
            await db.commit()
            logger.info("Bulk inserted {} articles", len(articles))
            return len(articles)
        except Exception as exc:
            logger.error("Bulk insert error: {}", str(exc))
            await db.rollback()
            return 0

    @staticmethod
    async def bulk_update_relevance_scores(
        db: AsyncSession,
        updates: list[tuple[int, int]],
    ) -> int:
        if not updates:
            return 0

        try:
            case_stmt = case(
                *[(NewsArticle.id == article_id, score) for article_id, score in updates],
                else_=NewsArticle.relevance_score,
            )
            result = await db.execute(
                update(NewsArticle)
                .where(NewsArticle.id.in_([article_id for article_id, _ in updates]))
                .values(relevance_score=case_stmt)
            )
            await db.commit()
            rowcount = result.rowcount or 0
            logger.info("Bulk updated {} relevance scores", rowcount)
            return rowcount
        except Exception as exc:
            logger.error("Bulk update error: {}", str(exc))
            await db.rollback()
            return 0
