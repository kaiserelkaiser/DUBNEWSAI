"""Add platform feature registry for admin visibility controls."""

from alembic import op
import sqlalchemy as sa


revision = "20260321_0013"
down_revision = "20260320_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "platform_features",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("feature_key", sa.String(length=100), nullable=False),
        sa.Column("label", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), server_default="platform", nullable=False),
        sa.Column("is_visible", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="100", nullable=False),
        sa.Column("updated_by_user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["updated_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("feature_key"),
    )
    op.create_index("ix_platform_features_feature_key", "platform_features", ["feature_key"], unique=False)
    op.create_index("ix_platform_features_updated_by_user_id", "platform_features", ["updated_by_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_platform_features_updated_by_user_id", table_name="platform_features")
    op.drop_index("ix_platform_features_feature_key", table_name="platform_features")
    op.drop_table("platform_features")
