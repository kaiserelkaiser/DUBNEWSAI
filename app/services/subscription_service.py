from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.models.subscription import PaymentHistory, Subscription, SubscriptionPlan, SubscriptionStatus
from app.models.user import User, UserRole

settings = get_settings()


class SubscriptionService:
    PLANS: dict[SubscriptionPlan, dict[str, Any]] = {
        SubscriptionPlan.PREMIUM_MONTHLY: {
            "name": "Premium Monthly",
            "price": 9.99,
            "currency": "USD",
            "interval": "month",
            "stripe_price_id": settings.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        },
        SubscriptionPlan.PREMIUM_YEARLY: {
            "name": "Premium Yearly",
            "price": 99.00,
            "currency": "USD",
            "interval": "year",
            "stripe_price_id": settings.STRIPE_PREMIUM_YEARLY_PRICE_ID,
        },
    }

    @staticmethod
    def _require_stripe():
        try:
            import stripe  # type: ignore
        except ImportError as exc:  # pragma: no cover - depends on environment
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stripe dependency is not installed",
            ) from exc

        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stripe is not configured",
            )

        stripe.api_key = settings.STRIPE_SECRET_KEY
        return stripe

    @staticmethod
    async def _stripe_call(func, *args, **kwargs):
        return await asyncio.to_thread(func, *args, **kwargs)

    @staticmethod
    async def _get_or_create_subscription(db: AsyncSession, user_id: int) -> Subscription:
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription is not None:
            return subscription

        subscription = Subscription(
            user_id=user_id,
            plan=SubscriptionPlan.FREE,
            status=SubscriptionStatus.ACTIVE,
            amount=0.0,
            currency="USD",
        )
        db.add(subscription)
        await db.flush()
        return subscription

    @staticmethod
    def _coerce_datetime(timestamp: int | float | None) -> datetime | None:
        if timestamp is None:
            return None
        return datetime.fromtimestamp(timestamp, tz=timezone.utc)

    @staticmethod
    def _plan_from_price_id(price_id: str | None) -> SubscriptionPlan | None:
        if not price_id:
            return None
        for plan, config in SubscriptionService.PLANS.items():
            if config["stripe_price_id"] == price_id:
                return plan
        return None

    @staticmethod
    def _status_from_stripe(stripe_status: str | None) -> SubscriptionStatus:
        if stripe_status in {"active", "trialing"}:
            return SubscriptionStatus.ACTIVE
        if stripe_status in {"past_due", "unpaid"}:
            return SubscriptionStatus.PAST_DUE
        if stripe_status in {"canceled"}:
            return SubscriptionStatus.CANCELLED
        return SubscriptionStatus.EXPIRED

    @staticmethod
    async def create_checkout_session(
        db: AsyncSession,
        user_id: int,
        plan: SubscriptionPlan,
        success_url: str,
        cancel_url: str,
    ) -> dict[str, str]:
        if plan == SubscriptionPlan.FREE:
            raise HTTPException(status_code=400, detail="Free plan does not require checkout")

        stripe = SubscriptionService._require_stripe()
        plan_config = SubscriptionService.PLANS.get(plan)
        if not plan_config or not plan_config["stripe_price_id"]:
            raise HTTPException(status_code=503, detail="Selected plan is not configured")

        result = await db.execute(
            select(User)
            .options(selectinload(User.subscription))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        subscription = user.subscription or await SubscriptionService._get_or_create_subscription(db, user.id)

        customer_id = subscription.stripe_customer_id
        if not customer_id:
            customer = await SubscriptionService._stripe_call(
                stripe.Customer.create,
                email=user.email,
                name=user.full_name,
                metadata={"user_id": str(user.id)},
            )
            customer_id = customer.id
            subscription.stripe_customer_id = customer_id

        session = await SubscriptionService._stripe_call(
            stripe.checkout.Session.create,
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": plan_config["stripe_price_id"],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": str(user_id), "plan": plan.value},
        )

        await db.commit()
        return {"session_id": session.id, "url": session.url}

    @staticmethod
    async def handle_webhook(event_type: str, data: dict[str, Any], db: AsyncSession) -> None:
        if event_type == "checkout.session.completed":
            await SubscriptionService._handle_checkout_completed(data, db)
        elif event_type == "customer.subscription.updated":
            await SubscriptionService._handle_subscription_updated(data, db)
        elif event_type == "customer.subscription.deleted":
            await SubscriptionService._handle_subscription_deleted(data, db)
        elif event_type == "invoice.payment_succeeded":
            await SubscriptionService._handle_payment_succeeded(data, db)

    @staticmethod
    async def _handle_checkout_completed(data: dict[str, Any], db: AsyncSession) -> None:
        stripe = SubscriptionService._require_stripe()
        metadata = data.get("metadata") or {}
        user_id = int(metadata["user_id"])
        plan = SubscriptionPlan(metadata["plan"])

        user = await db.get(User, user_id)
        if user is None:
            logger.warning("Checkout completed for missing user {}", user_id)
            return

        subscription = await SubscriptionService._get_or_create_subscription(db, user_id)
        stripe_subscription = await SubscriptionService._stripe_call(
            stripe.Subscription.retrieve,
            data["subscription"],
        )

        user.role = UserRole.PREMIUM
        subscription.plan = plan
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.stripe_customer_id = data.get("customer")
        subscription.stripe_subscription_id = data.get("subscription")
        subscription.current_period_start = SubscriptionService._coerce_datetime(
            stripe_subscription.get("current_period_start")
        )
        subscription.current_period_end = SubscriptionService._coerce_datetime(
            stripe_subscription.get("current_period_end")
        )
        subscription.amount = float(SubscriptionService.PLANS[plan]["price"])
        subscription.currency = str(SubscriptionService.PLANS[plan]["currency"])
        subscription.cancel_at_period_end = False
        subscription.trial_start = SubscriptionService._coerce_datetime(
            stripe_subscription.get("trial_start")
        )
        subscription.trial_end = SubscriptionService._coerce_datetime(
            stripe_subscription.get("trial_end")
        )

        await db.commit()
        logger.info("Activated subscription for user {} on plan {}", user_id, plan.value)

    @staticmethod
    async def _handle_subscription_updated(data: dict[str, Any], db: AsyncSession) -> None:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == data.get("id"))
        )
        subscription = result.scalar_one_or_none()
        if subscription is None:
            logger.warning("Received subscription update for unknown Stripe subscription {}", data.get("id"))
            return

        user = await db.get(User, subscription.user_id)
        status = SubscriptionService._status_from_stripe(data.get("status"))
        plan = SubscriptionService._plan_from_price_id(
            (((data.get("items") or {}).get("data") or [{}])[0].get("price") or {}).get("id")
        )

        subscription.status = status
        if plan is not None:
            subscription.plan = plan
            subscription.amount = float(SubscriptionService.PLANS[plan]["price"])
            subscription.currency = str(SubscriptionService.PLANS[plan]["currency"])
        subscription.current_period_start = SubscriptionService._coerce_datetime(
            data.get("current_period_start")
        )
        subscription.current_period_end = SubscriptionService._coerce_datetime(
            data.get("current_period_end")
        )
        subscription.cancel_at_period_end = bool(data.get("cancel_at_period_end", False))
        subscription.trial_start = SubscriptionService._coerce_datetime(data.get("trial_start"))
        subscription.trial_end = SubscriptionService._coerce_datetime(data.get("trial_end"))

        if user is not None:
            user.role = (
                UserRole.PREMIUM
                if status == SubscriptionStatus.ACTIVE and subscription.plan != SubscriptionPlan.FREE
                else UserRole.USER
            )

        await db.commit()

    @staticmethod
    async def _handle_subscription_deleted(data: dict[str, Any], db: AsyncSession) -> None:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == data.get("id"))
        )
        subscription = result.scalar_one_or_none()
        if subscription is None:
            return

        user = await db.get(User, subscription.user_id)
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.plan = SubscriptionPlan.FREE
        subscription.cancel_at_period_end = True
        subscription.current_period_end = SubscriptionService._coerce_datetime(
            data.get("current_period_end")
        )
        if user is not None:
            user.role = UserRole.USER

        await db.commit()

    @staticmethod
    async def _handle_payment_succeeded(data: dict[str, Any], db: AsyncSession) -> None:
        stripe_subscription_id = data.get("subscription")
        if not stripe_subscription_id:
            return

        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == stripe_subscription_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription is None:
            return

        payment = PaymentHistory(
            user_id=subscription.user_id,
            subscription_id=subscription.id,
            amount=float((data.get("amount_paid") or 0) / 100),
            currency=str((data.get("currency") or subscription.currency or "usd")).upper(),
            stripe_payment_intent_id=data.get("payment_intent"),
            stripe_invoice_id=data.get("id"),
            status="succeeded",
        )
        db.add(payment)
        await db.commit()

    @staticmethod
    async def get_subscription_status(db: AsyncSession, user_id: int) -> dict[str, Any]:
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription is None:
            return {
                "plan": SubscriptionPlan.FREE,
                "status": None,
                "current_period_end": None,
                "cancel_at_period_end": False,
            }

        return {
            "plan": subscription.plan,
            "status": subscription.status,
            "current_period_end": subscription.current_period_end,
            "cancel_at_period_end": subscription.cancel_at_period_end,
        }

    @staticmethod
    async def cancel_subscription(db: AsyncSession, user_id: int) -> dict[str, str]:
        stripe = SubscriptionService._require_stripe()
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription is None or not subscription.stripe_subscription_id:
            raise HTTPException(status_code=404, detail="No active subscription")

        await SubscriptionService._stripe_call(
            stripe.Subscription.modify,
            subscription.stripe_subscription_id,
            cancel_at_period_end=True,
        )
        subscription.cancel_at_period_end = True
        await db.commit()
        return {"message": "Subscription will be cancelled at end of billing period"}
