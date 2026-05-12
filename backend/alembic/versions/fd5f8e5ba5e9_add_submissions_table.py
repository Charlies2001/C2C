"""add submissions table

Revision ID: fd5f8e5ba5e9
Revises: b0ab8f9d3cf6
Create Date: 2026-05-12 13:46:43.491230

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd5f8e5ba5e9'
down_revision: Union[str, Sequence[str], None] = 'b0ab8f9d3cf6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "submissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("passed_count", sa.Integer(), nullable=False),
        sa.Column("total_count", sa.Integer(), nullable=False),
        sa.Column("all_passed", sa.Boolean(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_submissions_id", "submissions", ["id"])
    op.create_index("ix_submissions_user_id", "submissions", ["user_id"])
    op.create_index("ix_submissions_problem_id", "submissions", ["problem_id"])
    op.create_index("ix_submissions_user_problem", "submissions", ["user_id", "problem_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_submissions_user_problem", table_name="submissions")
    op.drop_index("ix_submissions_problem_id", table_name="submissions")
    op.drop_index("ix_submissions_user_id", table_name="submissions")
    op.drop_index("ix_submissions_id", table_name="submissions")
    op.drop_table("submissions")
