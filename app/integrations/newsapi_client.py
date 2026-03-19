from datetime import datetime, timedelta, timezone

from loguru import logger

from app.config import get_settings
from app.integrations.base_client import BaseAPIClient

settings = get_settings()


class NewsAPIClient(BaseAPIClient):
    def __init__(self) -> None:
        super().__init__(
            base_url="https://newsapi.org/v2",
            api_key=settings.NEWSAPI_KEY or None,
            use_bearer_auth=False,
        )

    async def fetch_dubai_real_estate_news(
        self,
        days_back: int = 1,
        page_size: int = 100,
    ) -> list[dict]:
        from_date = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%d")
        params = {
            "q": 'Dubai AND (real estate OR property OR housing OR "property market")',
            "language": "en",
            "sortBy": "publishedAt",
            "from": from_date,
            "pageSize": page_size,
            "apiKey": self.api_key,
        }

        try:
            response = await self.get("/everything", params=params)
            articles = response.get("articles", [])
            logger.info("Fetched {} articles from NewsAPI", len(articles))
            return articles
        except Exception as exc:
            logger.error("Error fetching NewsAPI articles: {}", str(exc))
            return []

    async def fetch_by_category(self, category: str, country: str = "ae") -> list[dict]:
        params = {
            "country": country,
            "category": category,
            "pageSize": 100,
            "apiKey": self.api_key,
        }
        try:
            response = await self.get("/top-headlines", params=params)
            return response.get("articles", [])
        except Exception as exc:
            logger.error("Error fetching category news from NewsAPI: {}", str(exc))
            return []
