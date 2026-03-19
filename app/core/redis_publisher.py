from __future__ import annotations

import json
from datetime import datetime, timezone

import redis.asyncio as redis
from loguru import logger

from app.config import get_settings

settings = get_settings()


class RedisPublisher:
    """Publish real-time events to Redis pub/sub channels."""

    def __init__(self) -> None:
        self.redis_client: redis.Redis | None = None

    async def connect(self) -> None:
        if self.redis_client is not None:
            return

        try:
            client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
            await client.ping()
            self.redis_client = client
            logger.info("Redis publisher connected")
        except Exception as exc:
            self.redis_client = None
            logger.warning("Redis publisher unavailable: {}", str(exc))

    async def disconnect(self) -> None:
        if self.redis_client is None:
            return

        close_method = getattr(self.redis_client, "aclose", None)
        if close_method is not None:
            await close_method()
        else:  # pragma: no cover - compatibility path
            await self.redis_client.close()

        self.redis_client = None
        logger.info("Redis publisher disconnected")

    async def publish_event(self, channel: str, event_type: str, data: dict[str, object]) -> None:
        if self.redis_client is None:
            await self.connect()
        if self.redis_client is None:
            return

        message = {
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        try:
            await self.redis_client.publish(channel, json.dumps(message))
            logger.debug("Published event to {}: {}", channel, event_type)
        except Exception as exc:
            logger.error("Error publishing event to {}: {}", channel, str(exc))

    async def publish_news_update(self, article_data: dict[str, object]) -> None:
        await self.publish_event("news_updates", "new_article", article_data)

    async def publish_market_update(self, market_data: dict[str, object]) -> None:
        await self.publish_event("market_updates", "market_tick", market_data)

    async def publish_alert(self, user_id: int, alert_data: dict[str, object]) -> None:
        await self.publish_event(f"user_alerts_{user_id}", "alert", alert_data)


redis_publisher = RedisPublisher()
