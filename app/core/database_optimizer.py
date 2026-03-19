from __future__ import annotations

import re
import time

from loguru import logger
from sqlalchemy import event, text
from sqlalchemy.engine import Engine


class DatabaseOptimizer:
    """Database performance helpers."""

    _logging_configured = False

    @classmethod
    def setup_query_logging(cls) -> None:
        if cls._logging_configured:
            return

        @event.listens_for(Engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):  # pragma: no cover
            del cursor, parameters, context, executemany
            conn.info.setdefault("query_start_time", []).append(time.time())

        @event.listens_for(Engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):  # pragma: no cover
            del cursor, parameters, context, executemany
            total = time.time() - conn.info["query_start_time"].pop(-1)
            if total > 1.0:
                logger.warning("Slow query ({:.2f}s): {}", total, statement[:200])

        cls._logging_configured = True

    @staticmethod
    async def analyze_table(db, table_name: str) -> None:
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", table_name):
            raise ValueError("Invalid table name")

        await db.execute(text(f"ANALYZE {table_name}"))
        logger.info("Analyzed table {}", table_name)

    @staticmethod
    async def vacuum_table(db, table_name: str) -> None:
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", table_name):
            raise ValueError("Invalid table name")

        await db.execute(text(f"VACUUM {table_name}"))
        logger.info("Vacuumed table {}", table_name)
