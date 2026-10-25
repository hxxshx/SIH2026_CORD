from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Institution, Case, PotentialOverlap
from ..schemas import InstitutionResponse
from ..services.overlap_detection import calculate_name_similarity

router = APIRouter(prefix="/api/institutions", tags=["Institutions"])

@router.get("", response_model=List[InstitutionResponse])
def get_institutions(
    search: Optional[str] = Query(None, description="Search by PID, name or region"),
    db: Session = Depends(get_db)
):
    query = db.query(Institution)
    all_insts = query.all()
    
    result = []
    for inst in all_insts:
        # Count active cases and overlaps
        cases_count = db.query(Case).filter(Case.institution_id == inst.id).count()
        overlaps_count = db.query(PotentialOverlap).filter(PotentialOverlap.institution_id == inst.id).count()
        
        inst_dict = {
            "id": inst.id,
            "name": inst.name,
            "aicte_pid": inst.aicte_pid,
            "verification_state": inst.verification_state,
            "region": inst.region,
            "state": inst.state,
            "district": inst.district,
            "institution_type": inst.institution_type,
            "active_cases_count": cases_count,
            "overlaps_count": overlaps_count
        }

        if search:
            s = search.strip().lower()
            pid_match = inst.aicte_pid and s in inst.aicte_pid.lower()
            name_match = s in inst.name.lower()
            fuzzy_match = calculate_name_similarity(s, inst.name) > 0.65
            if pid_match or name_match or fuzzy_match:
                result.append(inst_dict)
        else:
            result.append(inst_dict)

    return result

@router.get("/{institution_id}")
def get_institution_detail(institution_id: int, db: Session = Depends(get_db)):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    cases = db.query(Case).filter(Case.institution_id == institution_id).all()
    overlaps = db.query(PotentialOverlap).filter(PotentialOverlap.institution_id == institution_id).all()
    
    return {
        "institution": {
            "id": inst.id,
            "name": inst.name,
            "aicte_pid": inst.aicte_pid,
            "verification_state": inst.verification_state,
            "region": inst.region,
            "state": inst.state,
            "district": inst.district,
            "institution_type": inst.institution_type
        },
        "cases": [
            {
                "id": c.id,
                "synthetic_case_id": c.synthetic_case_id,
                "institution_id": c.institution_id,
                "bureau_code": c.bureau_code,
                "category": c.category,
                "subject": c.subject,
                "summary": c.summary,
                "status": c.status,
                "last_action": c.last_action,
                "opened_date": c.opened_date,
                "officer_assigned": c.officer_assigned,
                "complainant_type": c.complainant_type,
                "severity": c.severity,
                "days_open": c.days_open
            }
            for c in cases
        ],
        "overlaps": [
            {
                "id": o.id,
                "institution_id": o.institution_id,
                "source_case_id": o.source_case_id,
                "candidate_case_id": o.candidate_case_id,
                "pid_matched": o.pid_matched,
                "tfidf_score": o.tfidf_score,
                "match_rationale": o.match_rationale,
                "rationale_list": [r.strip() for r in o.match_rationale.split("|")] if o.match_rationale else [],
                "review_status": o.review_status,
                "flagged_date": o.flagged_date
            }
            for o in overlaps
        ]
    }
