"""Audit log for test-case auto-fixes triggered by the "dispute this case" flow."""
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, Text, func
from sqlalchemy.orm import relationship

from ..database import Base


class TestCaseFix(Base):
    __tablename__ = "test_case_fixes"
    __table_args__ = (
        Index("ix_test_case_fixes_problem", "problem_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    case_index = Column(Integer, nullable=False)
    old_expected = Column(Text, nullable=False)
    new_expected = Column(Text, nullable=False)
    applied_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User")
