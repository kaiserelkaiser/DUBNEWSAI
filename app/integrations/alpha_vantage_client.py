from loguru import logger

from app.config import get_settings
from app.integrations.base_client import BaseAPIClient

settings = get_settings()


class AlphaVantageClient(BaseAPIClient):
    def __init__(self) -> None:
        super().__init__(
            base_url="https://www.alphavantage.co/query",
            api_key=settings.ALPHA_VANTAGE_KEY or None,
            use_bearer_auth=False,
        )

    async def get_quote(self, symbol: str) -> dict:
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.api_key,
        }
        try:
            response = await self.get("", params=params)
            return response.get("Global Quote", {})
        except Exception as exc:
            logger.error("Error fetching quote for {}: {}", symbol, str(exc))
            return {}

    async def get_currency_exchange_rate(self, from_currency: str, to_currency: str) -> dict:
        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
            "apikey": self.api_key,
        }
        try:
            response = await self.get("", params=params)
            return response.get("Realtime Currency Exchange Rate", {})
        except Exception as exc:
            logger.error("Error fetching currency rate for {}/{}: {}", from_currency, to_currency, str(exc))
            return {}

    async def get_time_series_daily(self, symbol: str) -> dict:
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "apikey": self.api_key,
        }
        try:
            return await self.get("", params=params)
        except Exception as exc:
            logger.error("Error fetching daily series for {}: {}", symbol, str(exc))
            return {}
