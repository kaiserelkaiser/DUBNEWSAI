"""Add real-time notifications and reshape alerts."""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260318_0005"
down_revision = "20260318_0004"
branch_labels = None
depends_on = None


notification_type_enum = sa.Enum(
    "news_alert",
    "market_alert",
    "price_alert",
    "system",
    "custom",
    name="notification_type",
    create_type=False,
)
notification_priority_enum = sa.Enum(
    "low",
    "medium",
    "high",
    "urgent",
    name="notification_priority",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        notification_type_enum.create(bind, checkfirst=True)
        notification_priority_enum.create(bind, checkfirst=True)

    op.create_table(
        "notifications",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", notification_type_enum, nullable=False),
        sa.Column("priority", notification_priority_enum, nullable=False, server_default="medium"),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("article_id", sa.Integer(), nullable=True),
        sa.Column("market_symbol", sa.String(length=20), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_sent", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["article_id"], ["news_articles.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notifications")),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)
    op.create_index(op.f("ix_notifications_type"), "notifications", ["type"], unique=False)
    op.create_index(op.f("ix_notifications_is_read"), "notifications", ["is_read"], unique=False)

    with op.batch_alter_table("alerts") as batch_op:
        batch_op.add_column(sa.Column("symbol", sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column("keyword", sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column("threshold_value", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
        batch_op.add_column(
            sa.Column("notification_enabled", sa.Boolean(), nullable=False, server_default=sa.true())
        )
        batch_op.add_column(
            sa.Column("conditions", sa.JSON(), nullable=False, server_default=sa.text("'{}'"))
        )
        batch_op.create_index(op.f("ix_alerts_user_id"), ["user_id"], unique=False)
        batch_op.create_index(op.f("ix_alerts_is_active"), ["is_active"], unique=False)

    connection = op.get_bind()
    connection.execute(sa.text("UPDATE alerts SET conditions = COALESCE(payload, '{}')"))

    with op.batch_alter_table("alerts") as batch_op:
        batch_op.drop_column("title")
        batch_op.drop_column("message")
        batch_op.drop_column("is_read")
        batch_op.drop_column("payload")


def downgrade() -> None:
    with op.batch_alter_table("alerts") as batch_op:
        batch_op.add_column(sa.Column("title", sa.String(length=255), nullable=False, server_default="Alert"))
        batch_op.add_column(sa.Column("message", sa.Text(), nullable=False, server_default="Alert"))
        batch_op.add_column(sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column("payload", sa.JSON(), nullable=False, server_default=sa.text("'{}'")))

    connection = op.get_bind()
    connection.execute(sa.text("UPDATE alerts SET payload = COALESCE(conditions, '{}')"))
    connection.execute(
        sa.text(
            "UPDATE alerts SET title = COALESCE(keyword, symbol, alert_type, 'Alert'), "
            "message = COALESCE(keyword, symbol, alert_type, 'Alert')"
        )
    )

    with op.batch_alter_table("alerts") as batch_op:
        batch_op.drop_index(op.f("ix_alerts_is_active"))
        batch_op.drop_index(op.f("ix_alerts_user_id"))
        batch_op.drop_column("conditions")
        batch_op.drop_column("notification_enabled")
        batch_op.drop_column("is_active")
        batch_op.drop_column("threshold_value")
        batch_op.drop_column("keyword")
        batch_op.drop_column("symbol")

    op.drop_index(op.f("ix_notifications_is_read"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_type"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        notification_priority_enum.drop(bind, checkfirst=True)
        notification_type_enum.drop(bind, checkfirst=True)
