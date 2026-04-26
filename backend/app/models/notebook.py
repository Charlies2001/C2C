"""Notebooks: user-curated collections of problems with editable notes/answers."""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from ..database import Base


class Notebook(Base):
    __tablename__ = "notebooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(String(500), nullable=False, default="")
    color = Column(String(20), nullable=False, default="violet")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    items = relationship(
        "NotebookItem",
        back_populates="notebook",
        cascade="all, delete-orphan",
        order_by="NotebookItem.position",
        lazy="selectin",
    )


class NotebookItem(Base):
    __tablename__ = "notebook_items"
    __table_args__ = (
        # A problem can be added once per notebook (avoid accidental dup)
        UniqueConstraint("notebook_id", "problem_id", name="uq_notebook_problem"),
    )

    id = Column(Integer, primary_key=True, index=True)
    notebook_id = Column(Integer, ForeignKey("notebooks.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    note = Column(Text, nullable=False, default="")
    # User's solution / answer code (editable). Empty when "without answer" was chosen.
    answer_code = Column(Text, nullable=False, default="")
    include_answer = Column(Boolean, nullable=False, default=True)
    position = Column(Integer, nullable=False, default=0, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    notebook = relationship("Notebook", back_populates="items")
    problem = relationship("Problem", lazy="joined")
