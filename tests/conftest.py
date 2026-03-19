import asyncio
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB_PATH = Path("test_dubnewsai.db")

os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{TEST_DB_PATH.as_posix()}")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("LOG_LEVEL", "WARNING")

from app.main import app  # noqa: E402
from app.models.base import Base  # noqa: E402
from app.database import engine  # noqa: E402


async def reset_database() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)


@pytest.fixture(autouse=True)
def fresh_database() -> None:
    asyncio.run(reset_database())
    yield


@pytest.fixture(scope="session", autouse=True)
def cleanup_database() -> None:
    yield
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client

