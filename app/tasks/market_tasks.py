import asyncio

from celery import shared_task
from loguru import logger
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.integrations.alpha_vantage_client import AlphaVantageClient
from app.models.market_data import WatchlistSymbol
from app.schemas.market_data import MarketDataResponse
from app.services.alert_service import AlertService
from app.services.broadcast_service import BroadcastService
from app.services.market_service import MarketService


@shared_task(name="update_stock_prices")
def update_stock_prices() -> None:
    asyncio.run(_update_stock_prices())


async def _update_stock_prices() -> None:
    client = AlphaVantageClient()
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(WatchlistSymbol)
                .where(WatchlistSymbol.is_active.is_(True))
                .order_by(WatchlistSymbol.priority.desc(), WatchlistSymbol.symbol.asc())
            )
            symbols = result.scalars().all()

            updated = 0
            for symbol_obj in symbols:
                market_data = await MarketService.update_stock_quote(db, symbol_obj.symbol, client)
                if market_data is not None:
                    updated += 1
                    await AlertService.check_price_alerts(db, symbol_obj.symbol, market_data.price)
                    payload = MarketDataResponse.model_validate(market_data).model_dump(mode="json")
                    await BroadcastService.broadcast_market_update(symbol_obj.symbol, payload)
                await asyncio.sleep(12)

            logger.info("Updated {} stock prices", updated)
        except Exception as exc:
            logger.error("Error in stock price update task: {}", str(exc))
        finally:
            await client.close()


@shared_task(name="update_currency_rates")
def update_currency_rates() -> None:
    asyncio.run(_update_currency_rates())


async def _update_currency_rates() -> None:
    client = AlphaVantageClient()
    async with AsyncSessionLocal() as db:
        try:
            pairs = [
                ("USD", "AED"),
                ("EUR", "AED"),
                ("GBP", "AED"),
                ("AED", "USD"),
                ("AED", "EUR"),
            ]

            for from_currency, to_currency in pairs:
                await MarketService.update_currency_rate(db, from_currency, to_currency, client)
                await asyncio.sleep(12)

            logger.info("Updated tracked currency rates")
        except Exception as exc:
            logger.error("Error in currency rate update task: {}", str(exc))
        finally:
            await client.close()
