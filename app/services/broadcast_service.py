from __future__ import annotations

from datetime import datetime, timezone

from loguru import logger

from app.core.redis_publisher import redis_publisher
from app.core.websocket import manager


class BroadcastService:
    """Broadcast real-time updates to WebSocket clients and Redis."""

    @staticmethod
    async def broadcast_new_article(article_data: dict[str, object]) -> None:
        message = {
            "type": "new_article",
            "data": article_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await manager.broadcast(message)
        await redis_publisher.publish_news_update(article_data)
        logger.info("Broadcasted new article {}", article_data.get("id"))

    @staticmethod
    async def broadcast_market_update(symbol: str, market_data: dict[str, object]) -> None:
        message = {
            "type": "market_update",
            "symbol": symbol,
            "data": market_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await manager.broadcast_to_room(message, f"symbol_{symbol.upper()}")
        await redis_publisher.publish_market_update(market_data)
        logger.debug("Broadcasted market update for {}", symbol)

    @staticmethod
    async def send_user_notification(user_id: int, notification: dict[str, object]) -> None:
        message = {
            "type": "notification",
            "data": notification,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        if manager.is_user_connected(user_id):
            await manager.send_personal_message(message, user_id)

        await redis_publisher.publish_alert(user_id, notification)
        logger.info("Sent notification to user {}", user_id)

    @staticmethod
    async def broadcast_trending_update(trends: list[dict[str, object]]) -> None:
        message = {
            "type": "trending_update",
            "data": trends,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await manager.broadcast_to_room(message, "trending")
        logger.info("Broadcasted trending update")

    @staticmethod
    async def broadcast_alert(alert_data: dict[str, object]) -> None:
        message = {
            "type": "breaking_alert",
            "data": alert_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await manager.broadcast(message)
        logger.warning("Broadcasted breaking alert {}", alert_data.get("title"))
