import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.security import get_password_hash
from app.database import AsyncSessionLocal
from app.models.news import NewsArticle, NewsCategory, NewsSentiment, NewsSource
from app.models.user import User, UserRole
from app.models.user_preference import UserPreference
from app.services.news_service import NewsService


async def seed() -> None:
    seed_admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@dubnewsai.com")
    seed_admin_name = os.getenv("SEED_ADMIN_NAME", "DUBNEWSAI Admin")
    seed_admin_password = os.getenv("SEED_ADMIN_PASSWORD")

    async with AsyncSessionLocal() as session:
        admin_result = await session.execute(select(User).where(User.email == seed_admin_email))
        admin_user = admin_result.scalar_one_or_none()
        if admin_user is None:
            if not seed_admin_password:
                raise RuntimeError("SEED_ADMIN_PASSWORD is required to create the seed admin user.")
            admin_user = User(
                email=seed_admin_email,
                full_name=seed_admin_name,
                hashed_password=get_password_hash(seed_admin_password),
                role=UserRole.ADMIN,
            )
            session.add(admin_user)
            await session.flush()
            session.add(UserPreference(user_id=admin_user.id))

        sample_url = "https://dubnewsai.local/sample/dubai-property-market-opens-strong"
        article_result = await session.execute(select(NewsArticle).where(NewsArticle.url == sample_url))
        if article_result.scalar_one_or_none() is None:
            session.add(
                NewsArticle(
                    title="Dubai Property Market Opens Strong",
                    description="Sample seed article for local development and smoke testing.",
                    content="This initial seed keeps local environments from starting completely empty.",
                    url=sample_url,
                    url_hash=NewsService.generate_url_hash(sample_url),
                    source=NewsSource.MANUAL,
                    source_name="DUBNEWSAI",
                    author=admin_user.full_name,
                    category=NewsCategory.REAL_ESTATE,
                    sentiment=NewsSentiment.POSITIVE,
                    sentiment_score=40,
                    keywords=["sample", "market"],
                    entities={
                        "persons": [],
                        "organizations": [],
                        "locations": ["Dubai"],
                        "money": [],
                        "dates": [],
                        "other": [],
                    },
                    published_at=datetime.now(timezone.utc),
                    relevance_score=75,
                    is_featured=True,
                )
            )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
