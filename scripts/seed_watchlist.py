import asyncio
import sys
from pathlib import Path

from sqlalchemy import select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import AsyncSessionLocal
from app.models.market_data import MarketType, StockExchange, WatchlistSymbol


async def seed_watchlist() -> None:
    async with AsyncSessionLocal() as db:
        symbols = [
            WatchlistSymbol(
                symbol="EMAAR",
                name="Emaar Properties",
                market_type=MarketType.STOCK,
                exchange=StockExchange.DFM,
                is_real_estate_company=True,
                priority=10,
            ),
            WatchlistSymbol(
                symbol="DAMAC",
                name="Damac Properties",
                market_type=MarketType.STOCK,
                exchange=StockExchange.DFM,
                is_real_estate_company=True,
                priority=9,
            ),
            WatchlistSymbol(
                symbol="ALDAR",
                name="Aldar Properties",
                market_type=MarketType.STOCK,
                exchange=StockExchange.ADX,
                is_real_estate_company=True,
                priority=9,
            ),
            WatchlistSymbol(
                symbol="DEYAAR",
                name="Deyaar Development",
                market_type=MarketType.STOCK,
                exchange=StockExchange.DFM,
                is_real_estate_company=True,
                priority=7,
            ),
            WatchlistSymbol(
                symbol="DFM",
                name="Dubai Financial Market General Index",
                market_type=MarketType.INDEX,
                exchange=StockExchange.DFM,
                priority=10,
            ),
            WatchlistSymbol(
                symbol="SPG",
                name="Simon Property Group",
                market_type=MarketType.STOCK,
                exchange=StockExchange.NYSE,
                is_real_estate_company=True,
                priority=5,
            ),
        ]

        created = 0
        for symbol in symbols:
            existing = await db.execute(select(WatchlistSymbol).where(WatchlistSymbol.symbol == symbol.symbol))
            if existing.scalar_one_or_none() is None:
                db.add(symbol)
                created += 1

        await db.commit()
        print(f"Seeded {created} watchlist symbols")


if __name__ == "__main__":
    asyncio.run(seed_watchlist())
