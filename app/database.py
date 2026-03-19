from collections.abc import AsyncGenerator
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

engine_kwargs: dict[str, object] = {
    "echo": settings.DB_ECHO,
    "pool_pre_ping": True,
}

is_sqlite = settings.DATABASE_URL.startswith("sqlite+aiosqlite")
uses_pgbouncer = "pooler.supabase.com" in settings.DATABASE_URL or ":6543/" in settings.DATABASE_URL

if is_sqlite:
    engine_kwargs["poolclass"] = NullPool
else:
    connect_args: dict[str, object] = {
        "prepared_statement_cache_size": 0,
        "server_settings": {
            "application_name": "dubnewsai",
            "jit": "off",
        },
    }

    if uses_pgbouncer:
        connect_args["prepared_statement_name_func"] = lambda: f"__asyncpg_{uuid4()}__"
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs.update(
            {
                "pool_size": 20,
                "max_overflow": 40,
                "pool_recycle": 3600,
                "pool_timeout": 30,
            }
        )

    engine_kwargs["connect_args"] = connect_args

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
