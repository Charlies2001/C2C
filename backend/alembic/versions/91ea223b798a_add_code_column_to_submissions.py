"""add code column to submissions

Revision ID: 91ea223b798a
Revises: 916b9a1385ec
Create Date: 2026-05-14 10:42:47.980224

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91ea223b798a'
down_revision: Union[str, Sequence[str], None] = '916b9a1385ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "submissions",
        sa.Column("code", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("submissions", "code")
