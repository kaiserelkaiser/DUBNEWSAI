from __future__ import annotations

import asyncio
from time import time

from fastapi import Request
from loguru import logger
from prometheus_client import Counter, Gauge, Histogram

try:
    import psutil
except ImportError:  # pragma: no cover - optional dependency
    psutil = None


http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["method", "endpoint"],
)

active_connections = Gauge(
    "websocket_active_connections",
    "Active WebSocket connections",
)

cache_hits = Counter("cache_hits_total", "Cache hits")
cache_misses = Counter("cache_misses_total", "Cache misses")
articles_processed = Counter("articles_processed_total", "Articles processed")
market_updates = Counter("market_updates_total", "Market data updates")

cpu_usage = Gauge("system_cpu_usage_percent", "CPU usage")
memory_usage = Gauge("system_memory_usage_percent", "Memory usage")
db_connections = Gauge("database_connections_active", "Active DB sessions")


class MetricsCollector:
    @staticmethod
    async def collect_system_metrics() -> None:
        while True:
            try:
                if psutil is not None:
                    cpu_usage.set(psutil.cpu_percent())
                    memory_usage.set(psutil.virtual_memory().percent)
            except Exception as exc:
                logger.error("Error collecting system metrics: {}", str(exc))

            await asyncio.sleep(10)

    @staticmethod
    def track_request(method: str, endpoint: str, status: int, duration: float) -> None:
        http_requests_total.labels(method=method, endpoint=endpoint, status=str(status)).inc()
        http_request_duration_seconds.labels(method=method, endpoint=endpoint).observe(duration)


async def metrics_middleware(request: Request, call_next):
    start_time = time()
    response = await call_next(request)
    duration = time() - start_time
    MetricsCollector.track_request(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
        duration=duration,
    )
    return response
