from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel, enum_kwargs

if TYPE_CHECKING:
    from app.models.user import User


class AlertType(str, enum.Enum):
    PRICE_ABOVE = "price_above"
    PRICE_BELOW = "price_below"
    PRICE_CHANGE_PERCENT = "price_change_percent"
    KEYWORD_MATCH = "keyword_match"
    SENTIMENT_THRESHOLD = "sentiment_threshold"
    VOLUME_SPIKE = "volume_spike"
    NEW_ARTICLE_CATEGORY = "new_article_category"
    TREND_DETECTED = "trend_detected"


class AlertFrequency(str, enum.Enum):
    INSTANT = "instant"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    TRIGGERED = "triggered"
    EXPIRED = "expired"
    PAUSED = "paused"


class Alert(BaseModel):
    __tablename__ = "alerts"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    alert_type: Mapped[AlertType] = mapped_column(
        SqlEnum(AlertType, name="alert_type", **enum_kwargs(AlertType)),
        nullable=False,
        index=True,
    )
    status: Mapped[AlertStatus] = mapped_column(
        SqlEnum(AlertStatus, name="alert_status", **enum_kwargs(AlertStatus)),
        default=AlertStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    symbol: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    keywords: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    threshold_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    conditions: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    frequency: Mapped[AlertFrequency] = mapped_column(
        SqlEnum(AlertFrequency, name="alert_frequency", **enum_kwargs(AlertFrequency)),
        default=AlertFrequency.INSTANT,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    webhook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    trigger_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_triggered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="alerts")
    triggers: Mapped[list["AlertTrigger"]] = relationship(
        "AlertTrigger",
        back_populates="alert",
        cascade="all, delete-orphan",
    )


class AlertTrigger(BaseModel):
    __tablename__ = "alert_triggers"

    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_data: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notification_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    webhook_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    alert: Mapped["Alert"] = relationship("Alert", back_populates="triggers")


class Automation(BaseModel):
    __tablename__ = "automations"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    trigger_type: Mapped[str] = mapped_column(String(50), nullable=False)
    trigger_conditions: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    actions: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    execution_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="automations")
