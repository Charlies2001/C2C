"""add problem ownership (owner_id + is_public)

Revision ID: c4f2a1e3d7b9
Revises: 91ea223b798a
Create Date: 2026-05-19

User-created problems used to land in the same global table as seed problems,
so any "AI 出题" / 题库导入 result was visible to all users. This migration
introduces a per-row owner + public flag. We backfill all existing rows as
is_public=True so the migration itself is non-disruptive; the application
layer then enforces the new defaults (private-by-owner) for any future
creates.

Uses batch mode so it works on both SQLite (local/dev/CI) and PostgreSQL
(production / Neon) — SQLite doesn't support ALTER TABLE to add constraints
in-place.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "c4f2a1e3d7b9"
down_revision: Union[str, Sequence[str], None] = "91ea223b798a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("problems") as batch:
        batch.add_column(sa.Column("owner_id", sa.Integer(), nullable=True))
        batch.add_column(
            sa.Column(
                "is_public",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )
        batch.create_index("ix_problems_owner_id", ["owner_id"], unique=False)
        batch.create_foreign_key(
            "fk_problems_owner_id_users",
            "users",
            ["owner_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # Backfill: every existing problem becomes is_public=True so the
    # migration itself does not change any visibility. Operator can manually
    # flip leaking user-created problems to is_public=False after deploy.
    op.execute("UPDATE problems SET is_public = TRUE")

    # Drop the server_default — the model sets is_public explicitly on every
    # insert going forward (default False at app level).
    with op.batch_alter_table("problems") as batch:
        batch.alter_column("is_public", server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("problems") as batch:
        batch.drop_constraint("fk_problems_owner_id_users", type_="foreignkey")
        batch.drop_index("ix_problems_owner_id")
        batch.drop_column("is_public")
        batch.drop_column("owner_id")
