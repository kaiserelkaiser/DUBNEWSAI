from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.admin.providers import router as providers_router
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.news import NewsArticle
from app.models.user import User
from app.schemas.enterprise import PlatformFeatureResponse, PlatformFeatureUpdateRequest
from app.services.platform_feature_service import platform_feature_service
from app.tasks.news_tasks import fetch_newsapi_articles, fetch_rss_feeds

router = APIRouter(prefix="/admin", tags=["admin"])
router.include_router(providers_router)


@router.get("/stats")
async def get_admin_stats(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    total_users = await db.scalar(select(func.count()).select_from(User))
    total_news = await db.scalar(select(func.count()).select_from(NewsArticle))
    return {
        "users": total_users or 0,
        "news_articles": total_news or 0,
    }


@router.post("/trigger-news-fetch", status_code=status.HTTP_202_ACCEPTED)
async def trigger_news_fetch(_: User = Depends(get_current_admin)) -> dict[str, str]:
    newsapi_task = fetch_newsapi_articles.delay()
    rss_task = fetch_rss_feeds.delay()
    return {
        "status": "queued",
        "newsapi_task_id": newsapi_task.id,
        "rss_task_id": rss_task.id,
    }


@router.get("/platform-features", response_model=list[PlatformFeatureResponse])
async def list_platform_features(
    _: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[PlatformFeatureResponse]:
    features = await platform_feature_service.list_features(db)
    return [PlatformFeatureResponse.model_validate(item) for item in features]


@router.put("/platform-features/{feature_key}", response_model=PlatformFeatureResponse)
async def update_platform_feature(
    feature_key: str,
    payload: PlatformFeatureUpdateRequest,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> PlatformFeatureResponse:
    try:
        feature = await platform_feature_service.update_feature_visibility(
            db,
            feature_key,
            is_visible=payload.is_visible,
            updated_by_user_id=current_admin.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return PlatformFeatureResponse.model_validate(feature)
