from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from ..database import get_db
from ..models.problem import Problem
from ..schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse, ProblemListItem

router = APIRouter(prefix="/api/problems", tags=["problems"])

@router.get("/", response_model=list[ProblemListItem])
def list_problems(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Problem)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    if category:
        query = query.filter(Problem.category == category)
    return query.all()

@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.post("/", response_model=ProblemResponse, status_code=201)
def create_problem(problem: ProblemCreate, db: Session = Depends(get_db)):
    db_problem = Problem(**problem.model_dump())
    db.add(db_problem)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"slug '{problem.slug}' 已存在，请使用不同的 slug")
    db.refresh(db_problem)
    return db_problem

@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(problem_id: int, problem: ProblemUpdate, db: Session = Depends(get_db)):
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    update_data = problem.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_problem, key, value)
    db.commit()
    db.refresh(db_problem)
    return db_problem

@router.delete("/{problem_id}", status_code=204)
def delete_problem(problem_id: int, db: Session = Depends(get_db)):
    db_problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not db_problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    db.delete(db_problem)
    db.commit()
