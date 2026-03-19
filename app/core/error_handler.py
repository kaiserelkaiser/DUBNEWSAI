from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.logging import logger
from app.core.monitoring import BetterStackMonitor


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught exceptions and forward them to monitoring."""
    request_id = getattr(request.state, "request_id", "-")
    client_host = request.client.host if request.client else "-"

    await BetterStackMonitor.send_error(
        title=f"{type(exc).__name__} on {request.url.path}",
        message=str(exc),
        severity="error",
    )

    logger.exception(
        "Unhandled exception while processing request",
        path=request.url.path,
        method=request.method,
        client=client_host,
        request_id=request_id,
        error_type=type(exc).__name__,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Our team has been notified.",
            "request_id": request_id,
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return a structured validation response."""
    logger.warning(
        "Validation error",
        path=request.url.path,
        method=request.method,
        request_id=getattr(request.state, "request_id", "-"),
        errors=exc.errors(),
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "detail": exc.errors(),
            "request_id": getattr(request.state, "request_id", "-"),
        },
    )


async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy exceptions separately so operational issues are clearer."""
    await BetterStackMonitor.send_error(
        title=f"Database error on {request.url.path}",
        message=str(exc),
        severity="critical",
    )

    logger.exception(
        "Database exception while processing request",
        path=request.url.path,
        method=request.method,
        request_id=getattr(request.state, "request_id", "-"),
    )

    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": "Database error",
            "detail": "Database is temporarily unavailable. Please try again later.",
            "request_id": getattr(request.state, "request_id", "-"),
        },
    )
