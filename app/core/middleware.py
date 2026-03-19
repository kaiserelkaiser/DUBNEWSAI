import time
import uuid
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import logger


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        bound_logger = logger.bind(request_id=request_id)
        request.state.request_id = request_id
        request.state.logger = bound_logger

        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}"

        bound_logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time=f"{process_time:.4f}s",
        )
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


class OptionalAuthMiddleware(BaseHTTPMiddleware):
    """Tag requests as public or protected based on path.

    Actual authentication enforcement is handled by endpoint dependencies;
    this middleware only annotates ``request.state.is_public_path``.
    """

    PUBLIC_PATHS: set[str] = {
        "/api/v1/news",
        "/api/v1/news/",
        "/api/v1/market/overview",
        "/api/v1/market/stocks",
        "/api/v1/market/real-estate-companies",
        "/api/v1/analytics/trends",
        "/api/v1/analytics/sentiment-distribution",
        "/health",
        "/metrics",
    }

    PUBLIC_PREFIXES: list[str] = [
        "/api/v1/news/",
        "/api/v1/market/symbol/",
        "/docs",
        "/redoc",
        "/openapi.json",
    ]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        is_public = path in self.PUBLIC_PATHS or any(
            path.startswith(prefix) for prefix in self.PUBLIC_PREFIXES
        )
        request.state.is_public_path = is_public

        response = await call_next(request)
        return response


