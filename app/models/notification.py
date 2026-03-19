from __future__ import annotations

import enum
from typing import Any, TYPE_CHECKING

from sqlalchemy import Boolean, Enum as SqlEnum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel, enum_kwargs

if TYPE_CHECKING:
    from app.models.news import NewsArticle
    from app.models.user import User


class NotificationType(str, enum.Enum):
    NEWS_ALERT = "news_alert"
    MARKET_ALERT = "market_alert"
    PRICE_ALERT = "price_alert"
    SYSTEM = "system"
    CUSTOM = "custom"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[NotificationType] = mapped_column(
        SqlEnum(NotificationType, name="notification_type", **enum_kwargs(NotificationType)),
        nullable=False,
        index=True,
    )
    priority: Mapped[NotificationPriority] = mapped_column(
        SqlEnum(NotificationPriority, name="notification_priority", **enum_kwargs(NotificationPriority)),
        default=NotificationPriority.MEDIUM,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    article_id: Mapped[int | None] = mapped_column(
        ForeignKey("news_articles.id", ondelete="SET NULL"),
        nullable=True,
    )
    market_symbol: Mapped[str | None] = mapped_column(String(20), nullable=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
    article: Mapped["NewsArticle | None"] = relationship("NewsArticle", foreign_keys=[article_id])
