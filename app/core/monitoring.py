from datetime import datetime, timezone

import httpx

from app.config import get_settings
from app.core.logging import logger

settings = get_settings()


class BetterStackMonitor:
    """Send heartbeats and error logs to Better Stack when configured."""

    HEARTBEAT_URL = "https://uptime.betterstack.com/api/v1/heartbeat/{check_id}"
    LOGS_URL = "https://in.logs.betterstack.com"

    @staticmethod
    async def send_heartbeat(check_id: str) -> None:
        """Ping a Better Stack heartbeat check."""
        if not check_id:
            return

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.get(BetterStackMonitor.HEARTBEAT_URL.format(check_id=check_id))
        except Exception:
            logger.debug("Better Stack heartbeat failed", check_id=check_id)

    @staticmethod
    async def send_error(title: str, message: str, severity: str = "error") -> None:
        """Ship a structured error log to Better Stack."""
        if not settings.BETTERSTACK_SOURCE_TOKEN:
            return

        headers = {
            "Authorization": f"Bearer {settings.BETTERSTACK_SOURCE_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "dt": datetime.now(timezone.utc).isoformat(),
            "severity": severity,
            "title": title,
            "message": message,
            "service": settings.APP_NAME,
            "environment": settings.ENVIRONMENT,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(BetterStackMonitor.LOGS_URL, json=payload, headers=headers)
        except Exception:
            logger.debug("Better Stack error log failed", title=title, severity=severity)
