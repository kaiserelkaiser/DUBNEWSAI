from fastapi import APIRouter

from app.api.v1 import admin, alerts, analytics, auth, market, news, notifications, subscription, websocket

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(news.router)
api_router.include_router(market.router)
api_router.include_router(analytics.router)
api_router.include_router(subscription.router)
api_router.include_router(alerts.router)
api_router.include_router(notifications.router)
api_router.include_router(websocket.router)
api_router.include_router(admin.router)
