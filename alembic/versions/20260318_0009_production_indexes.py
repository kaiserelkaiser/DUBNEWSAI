"""Add production indexes and partition-prep DDL."""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260318_0009"
down_revision = "20260318_0008"
branch_labels = None
depends_on = None


INDEX_STATEMENTS = [
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_published_category_date
    ON news_articles(is_published, category, published_at DESC)
    WHERE is_published = true
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_relevance_published
    ON news_articles(relevance_score DESC, published_at DESC)
    WHERE is_published = true
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_sentiment_category
    ON news_articles(sentiment, category, published_at DESC)
    WHERE is_published = true
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_fulltext_search
    ON news_articles USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')))
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_symbol_timestamp_desc
    ON market_data(symbol, data_timestamp DESC)
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_type_timestamp
    ON market_data(market_type, data_timestamp DESC)
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active
    ON users(email)
    WHERE is_active = true
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_active_type
    ON alerts(is_active, alert_type)
    WHERE is_active = true
    """,
    """
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_symbol_active
    ON alerts(symbol, is_active)
    WHERE is_active = true AND symbol IS NOT NULL
    """,
]

DROP_STATEMENTS = [
    "DROP INDEX CONCURRENTLY IF EXISTS idx_alerts_symbol_active",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_alerts_active_type",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_active",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_market_type_timestamp",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_market_symbol_timestamp_desc",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_news_fulltext_search",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_news_sentiment_category",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_news_relevance_published",
    "DROP INDEX CONCURRENTLY IF EXISTS idx_news_published_category_date",
]


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    with op.get_context().autocommit_block():
        for statement in INDEX_STATEMENTS:
            op.execute(statement)

        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_partitioned_table partitioned
                    JOIN pg_class relation ON relation.oid = partitioned.partrelid
                    WHERE relation.relname = 'news_articles'
                ) THEN
                    EXECUTE '
                        CREATE TABLE IF NOT EXISTS news_articles_2026_03
                        PARTITION OF news_articles
                        FOR VALUES FROM (''2026-03-01'') TO (''2026-04-01'')
                    ';
                END IF;
            END
            $$;
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    with op.get_context().autocommit_block():
        op.execute("DROP TABLE IF EXISTS news_articles_2026_03")
        for statement in DROP_STATEMENTS:
            op.execute(statement)
