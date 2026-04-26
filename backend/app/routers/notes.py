"""Per-problem personal notes (one note per user × problem)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models.note import ProblemNote
from ..models.problem import Problem
from ..models.user import User

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteResponse(BaseModel):
    problem_id: int
    content: str
    updated_at: str | None = None

    class Config:
        from_attributes = True


class NoteUpdate(BaseModel):
    content: str = Field(default="", max_length=50000)


def _serialize(note: ProblemNote | None, problem_id: int) -> NoteResponse:
    if note is None:
        return NoteResponse(problem_id=problem_id, content="", updated_at=None)
    return NoteResponse(
        problem_id=problem_id,
        content=note.content or "",
        updated_at=note.updated_at.isoformat() if note.updated_at else None,
    )


@router.get("/{problem_id}", response_model=NoteResponse)
def get_note(
    problem_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(ProblemNote)
        .filter(ProblemNote.user_id == user.id, ProblemNote.problem_id == problem_id)
        .first()
    )
    return _serialize(note, problem_id)


@router.put("/{problem_id}", response_model=NoteResponse)
def upsert_note(
    problem_id: int,
    req: NoteUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not db.query(Problem).filter(Problem.id == problem_id).first():
        raise HTTPException(status_code=404, detail="题目不存在")
    note = (
        db.query(ProblemNote)
        .filter(ProblemNote.user_id == user.id, ProblemNote.problem_id == problem_id)
        .first()
    )
    if note is None:
        note = ProblemNote(user_id=user.id, problem_id=problem_id, content=req.content)
        db.add(note)
    else:
        note.content = req.content
    db.commit()
    db.refresh(note)
    return _serialize(note, problem_id)
