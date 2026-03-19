from __future__ import annotations

from datetime import datetime, timedelta, timezone

import httpx
from loguru import logger
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertFrequency, AlertStatus, AlertTrigger, AlertType
from app.models.news import NewsArticle
from app.models.notification import NotificationPriority, NotificationType
from app.services.notification_service import NotificationService


class AlertService:
    @staticmethod
    async def create_alert(db: AsyncSession, user_id: int, alert_data: dict) -> Alert:
        alert = Alert(user_id=user_id, **alert_data)
        db.add(alert)
        await db.commit()
        await db.refresh(alert)
        logger.info("Created alert {} for user {}", alert.id, user_id)
        return alert

    @staticmethod
    async def check_price_alerts(db: AsyncSession, symbol: str, current_price: float) -> None:
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.symbol == symbol,
                    Alert.is_active.is_(True),
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.alert_type.in_([AlertType.PRICE_ABOVE, AlertType.PRICE_BELOW]),
                )
            )
        )
        alerts = result.scalars().all()

        for alert in alerts:
            triggered = False
            message = ""

            if alert.alert_type == AlertType.PRICE_ABOVE and alert.threshold_value is not None:
                if current_price >= alert.threshold_value:
                    triggered = True
                    message = f"{symbol} price is above {alert.threshold_value}: {current_price}"

            if alert.alert_type == AlertType.PRICE_BELOW and alert.threshold_value is not None:
                if current_price <= alert.threshold_value:
                    triggered = True
                    message = f"{symbol} price is below {alert.threshold_value}: {current_price}"

            if triggered:
                await AlertService._trigger_alert(
                    db,
                    alert,
                    {
                        "symbol": symbol,
                        "current_price": current_price,
                        "threshold": alert.threshold_value,
                    },
                    message,
                )

    @staticmethod
    async def check_keyword_alerts(db: AsyncSession, article: NewsArticle) -> None:
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.is_active.is_(True),
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.alert_type == AlertType.KEYWORD_MATCH,
                    Alert.keywords.is_not(None),
                )
            )
        )
        alerts = result.scalars().all()
        article_text = f"{article.title} {article.description or ''}".lower()

        for alert in alerts:
            if not alert.keywords:
                continue

            matched_keywords = [keyword for keyword in alert.keywords if keyword.lower() in article_text]
            if matched_keywords:
                await AlertService._trigger_alert(
                    db,
                    alert,
                    {
                        "article_id": article.id,
                        "article_title": article.title,
                        "matched_keywords": matched_keywords,
                    },
                    f"Article matches keywords: {', '.join(matched_keywords)}",
                )

    @staticmethod
    async def check_sentiment_alerts(db: AsyncSession, article: NewsArticle) -> None:
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.is_active.is_(True),
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.alert_type == AlertType.SENTIMENT_THRESHOLD,
                )
            )
        )
        alerts = result.scalars().all()

        for alert in alerts:
            threshold = alert.threshold_value
            if threshold is None:
                continue

            if abs(article.sentiment_score) >= threshold:
                sentiment_label = "positive" if article.sentiment_score > 0 else "negative"
                await AlertService._trigger_alert(
                    db,
                    alert,
                    {
                        "article_id": article.id,
                        "article_title": article.title,
                        "sentiment_score": article.sentiment_score,
                    },
                    f"Article has {sentiment_label} sentiment score: {article.sentiment_score}",
                )

    @staticmethod
    async def check_category_alerts(db: AsyncSession, article: NewsArticle) -> None:
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.is_active.is_(True),
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.alert_type == AlertType.NEW_ARTICLE_CATEGORY,
                    Alert.category == article.category.value,
                )
            )
        )
        alerts = result.scalars().all()

        for alert in alerts:
            if not AlertService._frequency_allows_trigger(alert):
                continue

            await AlertService._trigger_alert(
                db,
                alert,
                {
                    "article_id": article.id,
                    "article_title": article.title,
                    "category": article.category.value,
                },
                f"New {article.category.value} article: {article.title}",
            )

    @staticmethod
    def _frequency_allows_trigger(alert: Alert) -> bool:
        if alert.last_triggered_at is None:
            return True

        last_triggered_at = alert.last_triggered_at
        if last_triggered_at.tzinfo is None:
            last_triggered_at = last_triggered_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        if alert.frequency == AlertFrequency.HOURLY:
            return now - last_triggered_at >= timedelta(hours=1)
        if alert.frequency == AlertFrequency.DAILY:
            return now - last_triggered_at >= timedelta(days=1)
        if alert.frequency == AlertFrequency.WEEKLY:
            return now - last_triggered_at >= timedelta(weeks=1)
        return True

    @staticmethod
    async def _trigger_alert(db: AsyncSession, alert: Alert, trigger_data: dict, message: str) -> None:
        try:
            trigger = AlertTrigger(
                alert_id=alert.id,
                trigger_data=trigger_data,
                message=message,
            )
            db.add(trigger)

            alert.trigger_count += 1
            alert.last_triggered_at = datetime.now(timezone.utc)

            if alert.expires_at is not None:
                expires_at = alert.expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at <= datetime.now(timezone.utc):
                    alert.status = AlertStatus.EXPIRED
                    alert.is_active = False

            if alert.frequency == AlertFrequency.INSTANT:
                alert.status = AlertStatus.TRIGGERED

            await db.commit()
            await db.refresh(trigger)

            if alert.notification_enabled:
                await NotificationService.create_notification(
                    db=db,
                    user_id=alert.user_id,
                    type=NotificationType.CUSTOM,
                    title=alert.name,
                    message=message,
                    priority=NotificationPriority.HIGH,
                    metadata=trigger_data,
                )
                trigger.notification_sent = True

            if alert.webhook_url:
                webhook_sent = await AlertService._send_webhook(
                    alert.webhook_url,
                    {
                        "alert_id": alert.id,
                        "alert_name": alert.name,
                        "message": message,
                        "trigger_data": trigger_data,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )
                trigger.webhook_sent = webhook_sent

            await db.commit()
            logger.info("Alert {} triggered for user {}", alert.id, alert.user_id)
        except Exception as exc:
            await db.rollback()
            logger.error("Error triggering alert {}: {}", alert.id, str(exc))

    @staticmethod
    async def _send_webhook(webhook_url: str, data: dict) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(webhook_url, json=data, timeout=10)
                response.raise_for_status()
            logger.info("Webhook sent to {}", webhook_url)
            return True
        except Exception as exc:
            logger.error("Webhook error for {}: {}", webhook_url, str(exc))
            return False

    @staticmethod
    async def get_user_alerts(db: AsyncSession, user_id: int) -> list[Alert]:
        result = await db.execute(
            select(Alert).where(Alert.user_id == user_id).order_by(Alert.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def delete_alert(db: AsyncSession, alert_id: int, user_id: int) -> bool:
        result = await db.execute(
            select(Alert).where(
                and_(
                    Alert.id == alert_id,
                    Alert.user_id == user_id,
                )
            )
        )
        alert = result.scalar_one_or_none()
        if alert is None:
            return False

        await db.delete(alert)
        await db.commit()
        return True
