"""Add subscription and payment history tables."""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260318_0008"
down_revision = "20260318_0007"
branch_labels = None
depends_on = None


subscription_plan_enum = sa.Enum(
    "free",
    "premium_monthly",
    "premium_yearly",
    name="subscription_plan",
)
subscription_status_enum = sa.Enum(
    "active",
    "cancelled",
    "past_due",
    "expired",
    name="subscription_status",
)


def upgrade() -> None:
    op.create_table(
        "subscriptions",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("plan", subscription_plan_enum, nullable=False, server_default="free"),
        sa.Column("status", subscription_status_enum, nullable=False, server_default="active"),
        sa.Column("stripe_customer_id", sa.String(length=100), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(length=100), nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("trial_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("trial_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_subscriptions")),
        sa.UniqueConstraint("user_id", name=op.f("uq_subscriptions_user_id")),
        sa.UniqueConstraint("stripe_customer_id", name=op.f("uq_subscriptions_stripe_customer_id")),
        sa.UniqueConstraint("stripe_subscription_id", name=op.f("uq_subscriptions_stripe_subscription_id")),
    )
    op.create_index(op.f("ix_subscriptions_id"), "subscriptions", ["id"], unique=False)
    op.create_index(op.f("ix_subscriptions_user_id"), "subscriptions", ["user_id"], unique=False)

    op.create_table(
        "payment_history",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
        sa.Column("stripe_payment_intent_id", sa.String(length=100), nullable=True),
        sa.Column("stripe_invoice_id", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["subscription_id"], ["subscriptions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_payment_history")),
    )
    op.create_index(op.f("ix_payment_history_id"), "payment_history", ["id"], unique=False)
    op.create_index(op.f("ix_payment_history_subscription_id"), "payment_history", ["subscription_id"], unique=False)
    op.create_index(op.f("ix_payment_history_user_id"), "payment_history", ["user_id"], unique=False)

    subscriptions_table = sa.table(
        "subscriptions",
        sa.column("user_id", sa.Integer),
        sa.column("plan", sa.String),
        sa.column("status", sa.String),
        sa.column("amount", sa.Float),
        sa.column("currency", sa.String),
    )
    users_table = sa.table("users", sa.column("id", sa.Integer))
    bind = op.get_bind()

    user_rows = bind.execute(sa.select(users_table.c.id)).all()
    for user_row in user_rows:
        bind.execute(
            subscriptions_table.insert().values(
                user_id=user_row.id,
                plan="free",
                status="active",
                amount=0.0,
                currency="USD",
            )
        )


def downgrade() -> None:
    op.drop_index(op.f("ix_payment_history_user_id"), table_name="payment_history")
    op.drop_index(op.f("ix_payment_history_subscription_id"), table_name="payment_history")
    op.drop_index(op.f("ix_payment_history_id"), table_name="payment_history")
    op.drop_table("payment_history")

    op.drop_index(op.f("ix_subscriptions_user_id"), table_name="subscriptions")
    op.drop_index(op.f("ix_subscriptions_id"), table_name="subscriptions")
    op.drop_table("subscriptions")
