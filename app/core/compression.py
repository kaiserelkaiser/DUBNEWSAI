from __future__ import annotations

import gzip

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class SmartCompressionMiddleware(BaseHTTPMiddleware):
    """Compress response bodies when worthwhile and supported by the client."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if "gzip" not in request.headers.get("accept-encoding", "").lower():
            return response
        if response.headers.get("content-encoding"):
            return response
        if response.status_code < 200 or response.status_code in {204, 304}:
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        if len(body) < 1000:
            headers = dict(response.headers)
            headers.pop("content-length", None)
            return Response(
                content=body,
                status_code=response.status_code,
                headers=headers,
                media_type=response.media_type,
            )

        compressed = gzip.compress(body)
        headers = dict(response.headers)
        headers["content-encoding"] = "gzip"
        headers["vary"] = "accept-encoding"
        headers["content-length"] = str(len(compressed))

        return Response(
            content=compressed,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type,
        )
