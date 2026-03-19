from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status

from app.core.rate_limit import check_tiered_rate_limit
from app.dependencies import get_current_user, get_current_user_optional
from app.models.user import User, UserRole


async def require_premium(current_user: User = Depends(get_current_user)) -> User:
    """Require the authenticated user to hold a premium or admin role."""
    if current_user.role not in (UserRole.PREMIUM, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for this feature",
        )
    return current_user


async def check_rate_limit(
    request: Request,
    current_user: User | None = Depends(get_current_user_optional),
) -> None:
    """Apply public/free/premium-aware rate limiting."""
    del current_user
    await check_tiered_rate_limit(request)
