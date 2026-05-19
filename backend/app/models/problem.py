from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON
from ..database import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    difficulty = Column(String(20), nullable=False)  # Easy, Medium, Hard
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    helper_code = Column(Text, default="")
    test_cases = Column(JSON, nullable=False)  # [{"input": "...", "expected": "..."}]

    # Ownership + visibility.
    # owner_id NULL = "official" problem (e.g. seeds), is_public=True by convention.
    # User-created problems: owner_id = creator.id, is_public default False (private to owner only).
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    is_public = Column(Boolean, nullable=False, default=False)
