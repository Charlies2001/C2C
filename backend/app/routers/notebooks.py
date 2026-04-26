"""Notebooks: user-curated collections of problems with editable notes/answers."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models.notebook import Notebook, NotebookItem
from ..models.problem import Problem
from ..models.user import User

router = APIRouter(prefix="/api/notebooks", tags=["notebooks"])


# ─── Schemas ───

class NotebookCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
    color: str = Field(default="violet", max_length=20)


class NotebookUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    color: str | None = Field(default=None, max_length=20)


class NotebookSummary(BaseModel):
    id: int
    name: str
    description: str
    color: str
    item_count: int
    created_at: str | None = None
    updated_at: str | None = None


class ItemAdd(BaseModel):
    problem_id: int
    include_answer: bool = True
    answer_code: str = Field(default="", max_length=20000)
    note: str = Field(default="", max_length=50000)


class ItemUpdate(BaseModel):
    note: str | None = Field(default=None, max_length=50000)
    answer_code: str | None = Field(default=None, max_length=20000)
    include_answer: bool | None = None
    position: int | None = None


class ItemResponse(BaseModel):
    id: int
    problem_id: int
    problem_title: str
    problem_slug: str
    problem_difficulty: str
    problem_category: str
    note: str
    answer_code: str
    include_answer: bool
    position: int
    created_at: str | None = None
    updated_at: str | None = None


class NotebookDetail(BaseModel):
    id: int
    name: str
    description: str
    color: str
    items: list[ItemResponse]
    created_at: str | None = None
    updated_at: str | None = None


# ─── Helpers ───

def _own_notebook_or_404(db: Session, user: User, notebook_id: int) -> Notebook:
    nb = db.query(Notebook).filter(Notebook.id == notebook_id, Notebook.user_id == user.id).first()
    if nb is None:
        raise HTTPException(status_code=404, detail="笔记本不存在")
    return nb


def _serialize_item(item: NotebookItem) -> ItemResponse:
    p = item.problem
    return ItemResponse(
        id=item.id,
        problem_id=item.problem_id,
        problem_title=p.title if p else "(已删除)",
        problem_slug=p.slug if p else "",
        problem_difficulty=p.difficulty if p else "",
        problem_category=p.category if p else "",
        note=item.note or "",
        answer_code=item.answer_code or "",
        include_answer=item.include_answer,
        position=item.position,
        created_at=item.created_at.isoformat() if item.created_at else None,
        updated_at=item.updated_at.isoformat() if item.updated_at else None,
    )


def _serialize_summary(nb: Notebook) -> NotebookSummary:
    return NotebookSummary(
        id=nb.id,
        name=nb.name,
        description=nb.description or "",
        color=nb.color or "violet",
        item_count=len(nb.items),
        created_at=nb.created_at.isoformat() if nb.created_at else None,
        updated_at=nb.updated_at.isoformat() if nb.updated_at else None,
    )


# ─── Notebook CRUD ───

@router.get("/", response_model=list[NotebookSummary])
def list_notebooks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Notebook).filter(Notebook.user_id == user.id).order_by(Notebook.updated_at.desc()).all()
    return [_serialize_summary(n) for n in rows]


@router.post("/", response_model=NotebookSummary, status_code=201)
def create_notebook(req: NotebookCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nb = Notebook(user_id=user.id, name=req.name, description=req.description, color=req.color)
    db.add(nb)
    db.commit()
    db.refresh(nb)
    return _serialize_summary(nb)


@router.get("/{notebook_id}", response_model=NotebookDetail)
def get_notebook(notebook_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nb = _own_notebook_or_404(db, user, notebook_id)
    return NotebookDetail(
        id=nb.id,
        name=nb.name,
        description=nb.description or "",
        color=nb.color or "violet",
        items=[_serialize_item(i) for i in nb.items],
        created_at=nb.created_at.isoformat() if nb.created_at else None,
        updated_at=nb.updated_at.isoformat() if nb.updated_at else None,
    )


@router.put("/{notebook_id}", response_model=NotebookSummary)
def update_notebook(
    notebook_id: int,
    req: NotebookUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    nb = _own_notebook_or_404(db, user, notebook_id)
    if req.name is not None:
        nb.name = req.name
    if req.description is not None:
        nb.description = req.description
    if req.color is not None:
        nb.color = req.color
    db.commit()
    db.refresh(nb)
    return _serialize_summary(nb)


@router.delete("/{notebook_id}", status_code=204)
def delete_notebook(notebook_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nb = _own_notebook_or_404(db, user, notebook_id)
    db.delete(nb)
    db.commit()


# ─── Item CRUD ───

@router.post("/{notebook_id}/items", response_model=ItemResponse, status_code=201)
def add_item(
    notebook_id: int,
    req: ItemAdd,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    nb = _own_notebook_or_404(db, user, notebook_id)
    if not db.query(Problem).filter(Problem.id == req.problem_id).first():
        raise HTTPException(status_code=404, detail="题目不存在")
    existing = db.query(NotebookItem).filter(
        NotebookItem.notebook_id == nb.id, NotebookItem.problem_id == req.problem_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="该题目已在笔记本中")
    next_pos = (db.query(NotebookItem).filter(NotebookItem.notebook_id == nb.id).count()) + 1
    item = NotebookItem(
        notebook_id=nb.id,
        problem_id=req.problem_id,
        note=req.note,
        answer_code=req.answer_code,
        include_answer=req.include_answer,
        position=next_pos,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_item(item)


@router.put("/{notebook_id}/items/{item_id}", response_model=ItemResponse)
def update_item(
    notebook_id: int,
    item_id: int,
    req: ItemUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _own_notebook_or_404(db, user, notebook_id)
    item = db.query(NotebookItem).filter(
        NotebookItem.id == item_id, NotebookItem.notebook_id == notebook_id
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="条目不存在")
    if req.note is not None:
        item.note = req.note
    if req.answer_code is not None:
        item.answer_code = req.answer_code
    if req.include_answer is not None:
        item.include_answer = req.include_answer
    if req.position is not None:
        item.position = req.position
    db.commit()
    db.refresh(item)
    return _serialize_item(item)


@router.delete("/{notebook_id}/items/{item_id}", status_code=204)
def delete_item(
    notebook_id: int,
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _own_notebook_or_404(db, user, notebook_id)
    item = db.query(NotebookItem).filter(
        NotebookItem.id == item_id, NotebookItem.notebook_id == notebook_id
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="条目不存在")
    db.delete(item)
    db.commit()
