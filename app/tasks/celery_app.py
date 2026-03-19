from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "dubnewsai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.news_tasks", "app.tasks.market_tasks", "app.tasks.ai_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "fetch-newsapi-every-15-minutes": {
        "task": "fetch_newsapi_articles",
        "schedule": crontab(minute="*/15"),
    },
    "fetch-rss-every-30-minutes": {
        "task": "fetch_rss_feeds",
        "schedule": crontab(minute="*/30"),
    },
    "cleanup-old-articles-daily": {
        "task": "cleanup_old_articles",
        "schedule": crontab(hour=2, minute=0),
    },
    "update-stock-prices-every-5-minutes": {
        "task": "update_stock_prices",
        "schedule": crontab(minute="*/5"),
    },
    "update-currency-rates-every-hour": {
        "task": "update_currency_rates",
        "schedule": crontab(minute=0),
    },
    "analyze-pending-articles-every-10-minutes": {
        "task": "analyze_pending_articles",
        "schedule": crontab(minute="*/10"),
    },
    "reanalyze-low-confidence-daily": {
        "task": "reanalyze_low_confidence_articles",
        "schedule": crontab(hour=3, minute=0),
    },
}

celery_app.autodiscover_tasks(["app.tasks"])
app = celery_app
