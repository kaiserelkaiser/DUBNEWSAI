"""Add user feature access grants table."""

from alembic import op
import sqlalchemy as sa


revision = "20260321_0014"
down_revision = "20260321_0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_feature_access",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("feature_key", sa.String(length=100), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("granted_by_user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["granted_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "feature_key", name="uq_user_feature_access"),
    )
    op.create_index("ix_user_feature_access_user_id", "user_feature_access", ["user_id"], unique=False)
    op.create_index("ix_user_feature_access_feature_key", "user_feature_access", ["feature_key"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_user_feature_access_feature_key", table_name="user_feature_access")
    op.drop_index("ix_user_feature_access_user_id", table_name="user_feature_access")
    op.drop_table("user_feature_access")
