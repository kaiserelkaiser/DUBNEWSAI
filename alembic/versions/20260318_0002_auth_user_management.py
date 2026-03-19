"""Expand users for authentication and add preferences."""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260318_0002"
down_revision = "20260318_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'premium'")

    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.alter_column("full_name", existing_type=sa.String(length=255), nullable=True)

    op.create_table(
        "user_preferences",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("preferred_language", sa.String(length=16), nullable=False, server_default="en"),
        sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"),
        sa.Column("notification_settings", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("dashboard_settings", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_preferences_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_preferences")),
        sa.UniqueConstraint("user_id", name=op.f("uq_user_preferences_user_id")),
    )
    op.create_index(op.f("ix_user_preferences_id"), "user_preferences", ["id"], unique=False)

    op.execute(
        """
        INSERT INTO user_preferences (user_id, preferred_language, timezone, notification_settings, dashboard_settings, created_at, updated_at)
        SELECT id, 'en', 'UTC', '{}', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM users
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_preferences_id"), table_name="user_preferences")
    op.drop_table("user_preferences")

    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("full_name", existing_type=sa.String(length=255), nullable=False)
        batch_op.drop_column("is_verified")
