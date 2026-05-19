from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.exc import IntegrityError
from typing import Optional

from ..database import get_db
from ..models.problem import Problem
from ..models.test_case_fix import TestCaseFix
from ..models.user import User
from ..schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse, ProblemListItem
from ..auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/problems", tags=["problems"])


class TestCaseFixRequest(BaseModel):
    index: int = Field(ge=0)
    expected: str = Field(max_length=20000)


def _visible_to(query, user: Optional[User]):
    """Filter a problems query to rows the given user is allowed to see.

    Public problems (seeds + anything operator marked is_public) are visible
    to everyone including guests. Private problems are visible only to their
    owner. Admins see everything.
    """
    if user and getattr(user, "role", None) == "admin":
        return query
    if user:
        return query.filter(or_(Problem.is_public.is_(True), Problem.owner_id == user.id))
    return query.filter(Problem.is_public.is_(True))


def _can_modify(problem: Problem, user: User) -> bool:
    """Owner can edit/delete own problems. Admin can edit/delete any. Official
    seeds (owner_id IS NULL) are admin-only."""
    if getattr(user, "role", None) == "admin":
        return True
    return problem.owner_id is not None and problem.owner_id == user.id


@router.get("/", response_model=list[ProblemListItem])
def list_problems(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    query = _visible_to(db.query(Problem), user)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    if category:
        query = query.filter(Problem.category == category)
    return query.order_by(Problem.id).all()


@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(
    problem_id: int,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    # Return 404 (not 403) for private problems the user shouldn't see —
    # avoids leaking the existence of other users' titles via ID enumeration.
    if not problem.is_public:
        if not user or (user.role != "admin" and problem.owner_id != user.id):
            raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.post("/", response_model=ProblemResponse, status_code=201)
def create_problem(problem: ProblemCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_problem = Problem(
        **problem.model_dump(),
        owner_id=user.id,
        is_public=False,  # private to creator by default; explicit publish later if we add that feature
    )
    db.add(db_problem)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"slug '{problem.slug}' 已存在，请使用不同的 slug")
    db.refresh(db_problem)
    return db_problem


@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(problem_id: int, problem: ProblemUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if not _can_modify(db_problem, user):
        raise HTTPException(status_code=403, detail="只有题目作者或管理员可以修改此题")
    update_data = problem.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_problem, key, value)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@router.delete("/{problem_id}", status_code=204)
def delete_problem(problem_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if not _can_modify(db_problem, user):
        raise HTTPException(status_code=403, detail="只有题目作者或管理员可以删除此题")
    db.delete(db_problem)
    db.commit()


@router.patch("/{problem_id}/test-cases", response_model=ProblemResponse)
def fix_test_case(
    problem_id: int,
    req: TestCaseFixRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Patch a single test_case's `expected` value. Audit-logged in test_case_fixes.

    Any authenticated user can patch test cases on problems they can see —
    this is part of the "质疑测试用例" feature. The audit trail records who
    did it.
    """
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    # User must be able to see the problem to patch it
    if not db_problem.is_public and db_problem.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=404, detail="Problem not found")
    cases = list(db_problem.test_cases or [])
    if req.index >= len(cases):
        raise HTTPException(status_code=400, detail="test case index 越界")
    old_expected = cases[req.index].get("expected", "")
    if old_expected == req.expected:
        # no-op; don't pollute audit
        return db_problem
    cases[req.index] = {**cases[req.index], "expected": req.expected}
    db_problem.test_cases = cases
    flag_modified(db_problem, "test_cases")
    db.add(
        TestCaseFix(
            user_id=user.id,
            problem_id=problem_id,
            case_index=req.index,
            old_expected=old_expected,
            new_expected=req.expected,
        )
    )
    db.commit()
    db.refresh(db_problem)
    return db_problem
