from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Case, Institution
from ..schemas import CaseResponse

router = APIRouter(prefix="/api/cases", tags=["Cases"])

@router.get("", response_model=List[CaseResponse])
def list_cases(
    bureau: Optional[str] = Query(None, description="Filter by Bureau"),
    status: Optional[str] = Query(None, description="Filter by status"),
    institution_id: Optional[int] = Query(None, description="Filter by institution"),
    search: Optional[str] = Query(None, description="Search case id, subject, or category"),
    db: Session = Depends(get_db)
):
    query = db.query(Case)
    if bureau and bureau != "All":
        query = query.filter(Case.bureau_code.ilike(f"%{bureau}%"))
    if status and status != "All":
        query = query.filter(Case.status.ilike(f"%{status}%"))
    if institution_id:
        query = query.filter(Case.institution_id == institution_id)
    
    cases = query.all()
    if search:
        s = search.strip().lower()
        cases = [
            c for c in cases
            if s in c.synthetic_case_id.lower()
            or s in c.subject.lower()
            or s in c.category.lower()
            or s in c.summary.lower()
        ]

    return cases

@router.get("/{synthetic_case_id}")
def get_case(synthetic_case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.synthetic_case_id == synthetic_case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    institution = db.query(Institution).filter(Institution.id == case.institution_id).first()
    return {
        "case": case,
        "institution": institution
    }
