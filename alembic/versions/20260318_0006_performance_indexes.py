"""Add performance-focused indexes for news queries."""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260318_0006"
down_revision = "20260318_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "idx_news_published_relevance",
        "news_articles",
        ["published_at", "relevance_score"],
        unique=False,
    )
    op.create_index(
        "idx_news_category_published_desc",
        "news_articles",
        ["category", "published_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_news_category_published_desc", table_name="news_articles")
    op.drop_index("idx_news_published_relevance", table_name="news_articles")
