from __future__ import annotations

import hashlib
import secrets

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import check_tiered_rate_limit
from app.database import get_db
from app.dependencies import get_current_user, get_current_user_optional
from app.models.api_access import APIKey
from app.models.user import User
from app.models.white_label import WhiteLabelConfig
from app.schemas.enterprise import (
    APIKeyCreateRequest,
    APIKeyCreatedResponse,
    APIKeyResponse,
    FeatureAccessResponse,
    PlatformFeatureResponse,
    WhiteLabelConfigRequest,
    WhiteLabelConfigResponse,
)
from app.services.feature_access_service import feature_access_service
from app.services.platform_feature_service import platform_feature_service

router = APIRouter(prefix="/settings", tags=["settings"])


def _normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


@router.get("/platform-features", response_model=list[PlatformFeatureResponse])
async def list_platform_features(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> list[PlatformFeatureResponse]:
    del current_user
    features = await platform_feature_service.list_features(db)
    return [PlatformFeatureResponse.model_validate(item) for item in features]


@router.get("/feature-access", response_model=list[FeatureAccessResponse])
async def get_feature_access(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> list[FeatureAccessResponse]:
    items = await feature_access_service.get_user_feature_access(db, user=current_user)
    return [FeatureAccessResponse.model_validate(item) for item in items]


@router.get("/api-keys", response_model=list[APIKeyResponse])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _rate_limit: None = Depends(check_tiered_rate_limit),
) -> list[APIKeyResponse]:
    result = await db.execute(select(APIKey).where(APIKey.user_id == current_user.id).order_by(APIKey.created_at.desc()))
    return [APIKeyResponse.model_validate(item) for item in result.scalars().all()]


@router.post("/api-keys", response_model=APIKeyCreatedResponse)
async def create_api_key(
    payload: APIKeyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _rate_limit: None = Depends(check_tiered_rate_limit),
) -> APIKeyCreatedResponse:
    plaintext = f"dna_{secrets.token_urlsafe(24)}"
    record = APIKey(
        user_id=current_user.id,
        name=payload.name,
        key_hash=hashlib.sha256(plaintext.encode()).hexdigest(),
        rate_limit_per_hour=payload.rate_limit_per_hour,
        scopes=payload.scopes,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return APIKeyCreatedResponse.model_validate({**record.__dict__, "plaintext_key": plaintext})


@router.get("/white-label", response_model=WhiteLabelConfigResponse | None)
async def get_white_label_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _rate_limit: None = Depends(check_tiered_rate_limit),
) -> WhiteLabelConfigResponse | None:
    result = await db.execute(select(WhiteLabelConfig).where(WhiteLabelConfig.user_id == current_user.id))
    row = result.scalar_one_or_none()
    return WhiteLabelConfigResponse.model_validate(row) if row is not None else None


@router.put("/white-label", response_model=WhiteLabelConfigResponse)
async def upsert_white_label_config(
    payload: WhiteLabelConfigRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _rate_limit: None = Depends(check_tiered_rate_limit),
) -> WhiteLabelConfigResponse:
    normalized_payload = payload.model_dump()
    normalized_payload["logo_url"] = _normalize_optional_text(payload.logo_url)
    normalized_payload["custom_domain"] = _normalize_optional_text(payload.custom_domain)
    normalized_payload["subdomain"] = _normalize_optional_text(payload.subdomain)

    result = await db.execute(select(WhiteLabelConfig).where(WhiteLabelConfig.user_id == current_user.id))
    row = result.scalar_one_or_none()
    if row is None:
        row = WhiteLabelConfig(user_id=current_user.id, enabled_features=None, **normalized_payload)
        db.add(row)
    else:
        for key, value in normalized_payload.items():
            setattr(row, key, value)
        row.enabled_features = None
    await db.commit()
    await db.refresh(row)
    return WhiteLabelConfigResponse.model_validate(row)
