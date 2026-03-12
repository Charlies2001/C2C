from pydantic import BaseModel
from typing import Optional

class TestCase(BaseModel):
    input: str
    expected: str

class ProblemBase(BaseModel):
    title: str
    slug: str
    difficulty: str
    category: str
    description: str
    starter_code: str
    helper_code: str = ""
    test_cases: list[TestCase]

class ProblemCreate(ProblemBase):
    pass

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    starter_code: Optional[str] = None
    helper_code: Optional[str] = None
    test_cases: Optional[list[TestCase]] = None

class ProblemResponse(ProblemBase):
    id: int

    class Config:
        from_attributes = True

class ProblemListItem(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str

    class Config:
        from_attributes = True
