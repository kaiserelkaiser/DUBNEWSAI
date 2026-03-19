from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

engine_kwargs: dict[str, object] = {
    "echo": settings.DB_ECHO,
    "pool_pre_ping": True,
}

if settings.DATABASE_URL.startswith("sqlite+aiosqlite"):
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs.update(
        {
            "pool_size": 20,
            "max_overflow": 40,
            "pool_recycle": 3600,
            "pool_timeout": 30,
            "connect_args": {
                "server_settings": {
                    "application_name": "dubnewsai",
                    "jit": "off",
                }
            },
        }
    )

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            try:
                from app.core.metrics import db_connections

                db_connections.inc()
            except Exception:
                pass
            yield session
        finally:
            try:
                from app.core.metrics import db_connections

                db_connections.dec()
            except Exception:
                pass
            await session.close()
