from sqlalchemy import Column, Integer, String, Text, JSON
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
