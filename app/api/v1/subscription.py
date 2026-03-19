from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.subscription import SubscriptionPlan
from app.models.user import User
from app.services.subscription_service import SubscriptionService

settings = get_settings()
router = APIRouter(prefix="/subscription", tags=["subscription"])


class CheckoutRequest(BaseModel):
    plan: SubscriptionPlan


@router.post("/checkout")
async def create_checkout_session(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    return await SubscriptionService.create_checkout_session(
        db=db,
        user_id=current_user.id,
        plan=payload.plan,
        success_url=f"{settings.FRONTEND_URL}/subscription/success",
        cancel_url=f"{settings.FRONTEND_URL}/subscription/cancelled",
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    try:
        import stripe  # type: ignore
    except ImportError as exc:  # pragma: no cover - depends on environment
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe dependency is not installed",
        ) from exc

    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")

    try:
        event = await SubscriptionService._stripe_call(
            stripe.Webhook.construct_event,
            payload,
            signature,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid payload") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    await SubscriptionService.handle_webhook(event["type"], event["data"]["object"], db)
    return {"status": "success"}


@router.get("/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return await SubscriptionService.get_subscription_status(db, current_user.id)


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    return await SubscriptionService.cancel_subscription(db, current_user.id)
