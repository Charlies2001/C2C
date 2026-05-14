"""Per-problem submission history. Append-only: every Submit click writes one row."""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, Text, func
from sqlalchemy.orm import relationship

from ..database import Base


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        Index("ix_submissions_user_problem", "user_id", "problem_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    passed_count = Column(Integer, nullable=False)
    total_count = Column(Integer, nullable=False)
    all_passed = Column(Boolean, nullable=False)
    # Source code snapshot at submission time. Nullable for rows created before this column existed.
    code = Column(Text, nullable=True)
    submitted_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User")
