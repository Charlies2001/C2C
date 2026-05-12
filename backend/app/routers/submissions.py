"""Per-problem submission history. Append-only writes from the Submit button."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models.problem import Problem
from ..models.submission import Submission
from ..models.user import User

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


class SubmissionCreate(BaseModel):
    problem_id: int
    passed_count: int = Field(ge=0)
    total_count: int = Field(ge=1)


class SubmissionResponse(BaseModel):
    id: int
    problem_id: int
    passed_count: int
    total_count: int
    all_passed: bool
    submitted_at: str

    class Config:
        from_attributes = True


def _serialize(s: Submission) -> SubmissionResponse:
    return SubmissionResponse(
        id=s.id,
        problem_id=s.problem_id,
        passed_count=s.passed_count,
        total_count=s.total_count,
        all_passed=s.all_passed,
        submitted_at=s.submitted_at.isoformat() if s.submitted_at else "",
    )


@router.post("", response_model=SubmissionResponse)
def create_submission(
    req: SubmissionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.passed_count > req.total_count:
        raise HTTPException(status_code=400, detail="passed_count > total_count")
    if not db.query(Problem).filter(Problem.id == req.problem_id).first():
        raise HTTPException(status_code=404, detail="题目不存在")
    sub = Submission(
        user_id=user.id,
        problem_id=req.problem_id,
        passed_count=req.passed_count,
        total_count=req.total_count,
        all_passed=req.passed_count == req.total_count,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _serialize(sub)


@router.get("", response_model=list[SubmissionResponse])
def list_submissions(
    problem_id: int = Query(..., ge=1),
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Submission)
        .filter(Submission.user_id == user.id, Submission.problem_id == problem_id)
        .order_by(Submission.submitted_at.desc(), Submission.id.desc())
        .limit(limit)
        .all()
    )
    return [_serialize(s) for s in rows]
