"""add test_case_fixes audit table

Revision ID: 916b9a1385ec
Revises: fd5f8e5ba5e9
Create Date: 2026-05-12 17:19:59.756894

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '916b9a1385ec'
down_revision: Union[str, Sequence[str], None] = 'fd5f8e5ba5e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "test_case_fixes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("problem_id", sa.Integer(), sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("case_index", sa.Integer(), nullable=False),
        sa.Column("old_expected", sa.Text(), nullable=False),
        sa.Column("new_expected", sa.Text(), nullable=False),
        sa.Column("applied_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_test_case_fixes_id", "test_case_fixes", ["id"])
    op.create_index("ix_test_case_fixes_user_id", "test_case_fixes", ["user_id"])
    op.create_index("ix_test_case_fixes_problem_id", "test_case_fixes", ["problem_id"])
    op.create_index("ix_test_case_fixes_problem", "test_case_fixes", ["problem_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_test_case_fixes_problem", table_name="test_case_fixes")
    op.drop_index("ix_test_case_fixes_problem_id", table_name="test_case_fixes")
    op.drop_index("ix_test_case_fixes_user_id", table_name="test_case_fixes")
    op.drop_index("ix_test_case_fixes_id", table_name="test_case_fixes")
    op.drop_table("test_case_fixes")
