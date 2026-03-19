import datetime

from fastapi import Request
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.cache import cache
from app.core.security import decode_token
from app.config import get_settings

settings = get_settings()


def custom_rate_limit_key(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "", 1)
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass

    return f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=custom_rate_limit_key, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


class RateLimitService:
    """Redis-backed helpers for more advanced rate checks."""

    @staticmethod
    async def check_rate_limit(
        key: str,
        limit: int,
        window: int = 60,
    ) -> tuple[bool, dict[str, int]]:
        current_count = await cache.increment(f"ratelimit:{key}")

        if current_count == 1:
            await cache.expire(f"ratelimit:{key}", window)

        remaining = max(0, limit - current_count)
        return current_count <= limit, {
            "limit": limit,
            "remaining": remaining,
            "reset": window,
        }

    @staticmethod
    async def check_api_key_limit(api_key: str, limit: int = 1000) -> bool:
        key = f"api_key_limit:{api_key}:daily"
        current = await cache.increment(key)
        if current == 1:
            now = datetime.datetime.utcnow()
            end_of_day = datetime.datetime.combine(
                now.date() + datetime.timedelta(days=1),
                datetime.time.min,
            )
            seconds_until_reset = int((end_of_day - now).total_seconds())
            await cache.expire(key, seconds_until_reset)

        return current <= limit


async def check_tiered_rate_limit(request: Request) -> None:
    """Apply tiered rate limits: premium > registered > public."""
    from app.dependencies import get_current_user_optional, security
    from app.database import get_db

    # Resolve the optional user
    credentials = await security(request)
    user = None
    if credentials is not None:
        async for db in get_db():
            user = await get_current_user_optional(credentials, db)
            break

    if user is not None:
        from app.models.user import UserRole

        if user.role in (UserRole.PREMIUM, UserRole.ADMIN):
            limit_key = f"premium:{user.id}"
            limit = 1000
        else:
            limit_key = f"user:{user.id}"
            limit = 100
    else:
        ip = get_remote_address(request) or "unknown"
        limit_key = f"public:{ip}"
        limit = 60

    is_allowed, info = await RateLimitService.check_rate_limit(
        limit_key, limit, window=3600,
    )

    if not is_allowed:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {info['reset']}s",
        )

