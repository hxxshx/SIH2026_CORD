from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PotentialOverlap, Case, Institution, AuditEvent, CoDocketPack
from ..schemas import PotentialOverlapResponse, OverlapReviewRequest
from ..services.overlap_detection import evaluate_case_overlap

router = APIRouter(prefix="/api/overlaps", tags=["Overlaps"])

@router.get("", response_model=List[PotentialOverlapResponse])
def list_overlaps(
    status: Optional[str] = Query(None, description="Filter by review_status"),
    db: Session = Depends(get_db)
):
    query = db.query(PotentialOverlap)
    if status and status != "All":
        query = query.filter(PotentialOverlap.review_status == status)
    
    overlaps = query.all()
    results = []
    for o in overlaps:
        inst = db.query(Institution).filter(Institution.id == o.institution_id).first()
        src_c = db.query(Case).filter(Case.synthetic_case_id == o.source_case_id).first()
        cand_c = db.query(Case).filter(Case.synthetic_case_id == o.candidate_case_id).first()
        
        results.append({
            "id": o.id,
            "institution_id": o.institution_id,
            "institution_name": inst.name if inst else "Unknown",
            "institution_pid": inst.aicte_pid if inst else None,
            "verification_state": inst.verification_state if inst else "UNKNOWN",
            "source_case_id": o.source_case_id,
            "candidate_case_id": o.candidate_case_id,
            "pid_matched": o.pid_matched,
            "tfidf_score": o.tfidf_score,
            "match_rationale": o.match_rationale,
            "rationale_list": [r.strip() for r in o.match_rationale.split("|")] if o.match_rationale else [],
            "review_status": o.review_status,
            "flagged_date": o.flagged_date,
            "source_case": src_c,
            "candidate_case": cand_c
        })
    return results

@router.post("/{overlap_id}/review")
def review_overlap(
    overlap_id: int,
    req: OverlapReviewRequest,
    db: Session = Depends(get_db)
):
    overlap = db.query(PotentialOverlap).filter(PotentialOverlap.id == overlap_id).first()
    if not overlap:
        raise HTTPException(status_code=404, detail="Overlap record not found")
    
    new_status = "CONFIRMED_RELATED" if req.action.upper() == "CONFIRM_RELATED" else "MARKED_UNRELATED"
    overlap.review_status = new_status
    overlap.reviewed_by = req.reviewer
    overlap.reviewed_at = datetime.utcnow()
    
    # Audit log
    audit = AuditEvent(
        user_id=req.reviewer,
        action=f"OVERLAP_REVIEW_{new_status}",
        entity="PotentialOverlap",
        entity_id=str(overlap.id),
        details=f"Reviewer decision: {new_status}. Note: {req.note or 'N/A'}"
    )
    db.add(audit)

    # If confirmed related, ensure a CoDocketPack exists for this institution
    if new_status == "CONFIRMED_RELATED":
        existing_pack = db.query(CoDocketPack).filter(
            CoDocketPack.institution_id == overlap.institution_id,
            CoDocketPack.primary_case_id == overlap.source_case_id
        ).first()
        if not existing_pack:
            inst = db.query(Institution).filter(Institution.id == overlap.institution_id).first()
            inst_name = inst.name if inst else "Institution"
            new_pack = CoDocketPack(
                pack_id=f"CORD-CD-{overlap.institution_id:03d}",
                title=f"Coordinated Dossier: {inst_name} ({overlap.source_case_id} & {overlap.candidate_case_id})",
                institution_id=overlap.institution_id,
                primary_case_id=overlap.source_case_id,
                related_case_ids=[overlap.candidate_case_id],
                status="READY_FOR_REVIEW",
                lead_bureau="Regulation Bureau"
            )
            db.add(new_pack)

    db.commit()
    return {
        "status": "success",
        "overlap_id": overlap.id,
        "review_status": overlap.review_status,
        "reviewed_by": overlap.reviewed_by,
        "reviewed_at": overlap.reviewed_at
    }

@router.post("/scan")
def scan_and_detect_overlaps(db: Session = Depends(get_db)):
    """
    Evaluates cases within each institution using the deterministic PID + TF-IDF model.
    """
    institutions = db.query(Institution).all()
    detected_count = 0

    for inst in institutions:
        cases = db.query(Case).filter(Case.institution_id == inst.id).all()
        # Pairwise comparison
        for i in range(len(cases)):
            for j in range(i + 1, len(cases)):
                c1 = cases[i]
                c2 = cases[j]
                
                # Check if already recorded
                existing = db.query(PotentialOverlap).filter(
                    PotentialOverlap.institution_id == inst.id,
                    ((PotentialOverlap.source_case_id == c1.synthetic_case_id) & (PotentialOverlap.candidate_case_id == c2.synthetic_case_id)) |
                    ((PotentialOverlap.source_case_id == c2.synthetic_case_id) & (PotentialOverlap.candidate_case_id == c1.synthetic_case_id))
                ).first()
                if existing:
                    continue

                case1_dict = {
                    "synthetic_case_id": c1.synthetic_case_id,
                    "bureau_code": c1.bureau_code,
                    "status": c1.status,
                    "category": c1.category,
                    "subject": c1.subject,
                    "summary": c1.summary
                }
                case2_dict = {
                    "synthetic_case_id": c2.synthetic_case_id,
                    "bureau_code": c2.bureau_code,
                    "status": c2.status,
                    "category": c2.category,
                    "subject": c2.subject,
                    "summary": c2.summary
                }

                evaluation = evaluate_case_overlap(case1_dict, case2_dict, institution_pid=inst.aicte_pid)
                if evaluation:
                    overlap = PotentialOverlap(
                        institution_id=inst.id,
                        source_case_id=evaluation["source_case_id"],
                        candidate_case_id=evaluation["candidate_case_id"],
                        pid_matched=evaluation["pid_matched"],
                        tfidf_score=evaluation["tfidf_score"],
                        match_rationale=evaluation["match_rationale"],
                        review_status="FLAGGED_PENDING_REVIEW"
                    )
                    db.add(overlap)
                    detected_count += 1

    db.commit()
    return {"status": "scan_complete", "new_overlaps_detected": detected_count}
