from __future__ import annotations

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationPriority, NotificationType
from app.services.broadcast_service import BroadcastService


class NotificationService:
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        article_id: int | None = None,
        market_symbol: str | None = None,
        metadata: dict[str, object] | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=type,
            priority=priority,
            title=title,
            message=message,
            article_id=article_id,
            market_symbol=market_symbol,
            metadata_json=metadata,
            is_sent=True,
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)

        await BroadcastService.send_user_notification(
            user_id,
            {
                "id": notification.id,
                "type": notification.type.value,
                "priority": notification.priority.value,
                "title": notification.title,
                "message": notification.message,
                "article_id": notification.article_id,
                "market_symbol": notification.market_symbol,
                "created_at": notification.created_at.isoformat(),
            },
        )
        return notification

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50,
    ) -> list[Notification]:
        query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            query = query.where(Notification.is_read.is_(False))

        query = query.order_by(Notification.created_at.desc()).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> bool:
        result = await db.execute(
            select(Notification).where(
                and_(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
            )
        )
        notification = result.scalar_one_or_none()
        if notification is None:
            return False

        notification.is_read = True
        await db.commit()
        return True

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.is_read.is_(False),
                )
            )
            .values(is_read=True)
        )
        await db.commit()
        return result.rowcount or 0
