from __future__ import annotations

from datetime import datetime, timezone

import httpx
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Automation


class AutomationService:
    """Service for managing automations."""

    @staticmethod
    async def execute_automation(db: AsyncSession, automation: Automation, trigger_data: dict) -> None:
        try:
            actions = automation.actions or []

            for action in actions:
                action_type = action.get("type")

                if action_type == "send_notification":
                    await AutomationService._send_notification(db, automation.user_id, action, trigger_data)
                elif action_type == "webhook":
                    await AutomationService._call_webhook(action, trigger_data)
                elif action_type == "create_alert":
                    await AutomationService._create_alert(db, automation.user_id, action)

            automation.execution_count += 1
            automation.last_executed_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info("Executed automation {}", automation.id)
        except Exception as exc:
            await db.rollback()
            logger.error("Error executing automation {}: {}", automation.id, str(exc))

    @staticmethod
    async def _send_notification(
        db: AsyncSession,
        user_id: int,
        action: dict,
        trigger_data: dict,
    ) -> None:
        from app.models.notification import NotificationPriority, NotificationType
        from app.services.notification_service import NotificationService

        await NotificationService.create_notification(
            db=db,
            user_id=user_id,
            type=NotificationType.CUSTOM,
            title=action.get("title", "Automation Triggered"),
            message=action.get("message", str(trigger_data)),
            priority=NotificationPriority.MEDIUM,
            metadata=trigger_data,
        )

    @staticmethod
    async def _call_webhook(action: dict, trigger_data: dict) -> None:
        webhook_url = action.get("url")
        if not webhook_url:
            return

        try:
            async with httpx.AsyncClient() as client:
                await client.post(webhook_url, json=trigger_data, timeout=10)
        except Exception as exc:
            logger.error("Webhook call failed for {}: {}", webhook_url, str(exc))

    @staticmethod
    async def _create_alert(db: AsyncSession, user_id: int, action: dict) -> None:
        from app.services.alert_service import AlertService

        alert_data = action.get("alert_data", {})
        if alert_data:
            await AlertService.create_alert(db, user_id, alert_data)
