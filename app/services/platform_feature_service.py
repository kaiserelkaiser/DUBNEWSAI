from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform_feature import PlatformFeature

DEFAULT_PLATFORM_FEATURES = [
    {
        "feature_key": "dashboard",
        "label": "Dashboard",
        "description": "Main intelligence overview and daily command surface.",
        "category": "core",
        "sort_order": 10,
    },
    {
        "feature_key": "news",
        "label": "News Feed",
        "description": "Curated Dubai and UAE news intelligence feed.",
        "category": "core",
        "sort_order": 20,
    },
    {
        "feature_key": "market",
        "label": "Market",
        "description": "Market overview, predictions, and property valuation workflows.",
        "category": "intelligence",
        "sort_order": 30,
    },
    {
        "feature_key": "portfolios",
        "label": "Investor Suite",
        "description": "Portfolio management, watchlists, and scoring workflows.",
        "category": "intelligence",
        "sort_order": 40,
    },
    {
        "feature_key": "competitors",
        "label": "Competitors",
        "description": "Competitive intelligence, tracking, and threat analysis.",
        "category": "intelligence",
        "sort_order": 50,
    },
    {
        "feature_key": "analytics",
        "label": "Analytics",
        "description": "Market analytics, insight maps, and opportunity surfaces.",
        "category": "intelligence",
        "sort_order": 60,
    },
    {
        "feature_key": "executive",
        "label": "Executive",
        "description": "Executive dashboards, priorities, and strategy views.",
        "category": "leadership",
        "sort_order": 70,
    },
    {
        "feature_key": "teams",
        "label": "Teams",
        "description": "Collaboration spaces, shared items, and activity streams.",
        "category": "collaboration",
        "sort_order": 80,
    },
    {
        "feature_key": "alerts",
        "label": "Alerts",
        "description": "Alert rules, signal watching, and action prompts.",
        "category": "operations",
        "sort_order": 90,
    },
    {
        "feature_key": "settings",
        "label": "Settings",
        "description": "Workspace configuration, API keys, and white-label controls.",
        "category": "operations",
        "sort_order": 100,
    },
    {
        "feature_key": "admin_providers",
        "label": "Provider Admin",
        "description": "Operational control center for providers and source health.",
        "category": "admin",
        "sort_order": 110,
    },
]


class PlatformFeatureService:
    async def ensure_defaults(self, db: AsyncSession) -> list[PlatformFeature]:
        result = await db.execute(select(PlatformFeature))
        existing = {row.feature_key: row for row in result.scalars().all()}

        dirty = False
        for item in DEFAULT_PLATFORM_FEATURES:
            row = existing.get(item["feature_key"])
            if row is None:
                row = PlatformFeature(is_visible=True, **item)
                db.add(row)
                existing[item["feature_key"]] = row
                dirty = True
                continue

            for field in ("label", "description", "category", "sort_order"):
                if getattr(row, field) != item[field]:
                    setattr(row, field, item[field])
                    dirty = True

        if dirty:
            await db.commit()

        result = await db.execute(select(PlatformFeature).order_by(PlatformFeature.sort_order.asc(), PlatformFeature.id.asc()))
        return list(result.scalars().all())

    async def list_features(self, db: AsyncSession) -> list[PlatformFeature]:
        return await self.ensure_defaults(db)

    async def update_feature_visibility(
        self,
        db: AsyncSession,
        feature_key: str,
        *,
        is_visible: bool,
        updated_by_user_id: int | None,
    ) -> PlatformFeature:
        await self.ensure_defaults(db)
        result = await db.execute(select(PlatformFeature).where(PlatformFeature.feature_key == feature_key))
        row = result.scalar_one_or_none()
        if row is None:
            raise ValueError("Feature not found")

        row.is_visible = is_visible
        row.updated_by_user_id = updated_by_user_id
        await db.commit()
        await db.refresh(row)
        return row


platform_feature_service = PlatformFeatureService()
