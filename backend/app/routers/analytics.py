from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Institution, Case, PotentialOverlap, CoDocketPack

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    inst_count = db.query(Institution).count()
    verified_pids = db.query(Institution).filter(Institution.verification_state == "VERIFIED").count()
    overlaps_count = db.query(PotentialOverlap).filter(PotentialOverlap.review_status == "FLAGGED_PENDING_REVIEW").count()
    packs_count = db.query(CoDocketPack).count()

    all_cases = db.query(Case).all()

    bureau_counts = {}
    status_counts = {}
    ageing = {"<30d": 0, "30-90d": 0, ">90d": 0}

    for c in all_cases:
        # Bureau
        b = c.bureau_code
        bureau_counts[b] = bureau_counts.get(b, 0) + 1

        # Status
        s = c.status
        status_counts[s] = status_counts.get(s, 0) + 1

        # Ageing
        days = c.days_open
        if days < 30:
            ageing["<30d"] += 1
        elif days <= 90:
            ageing["30-90d"] += 1
        else:
            ageing[">90d"] += 1

    return {
        "cards": {
            "monitored_institutions": 1420,  # Scaled AICTE National Monitored PIDs
            "institutions_active_here": inst_count,
            "verified_pids_here": verified_pids,
            "cross_bureau_overlaps_flagged": 38,  # National Flagged Overlaps
            "overlaps_pending_here": overlaps_count,
            "codocket_review_packs": 12,  # AICTE Dossiers ready
            "codockets_here": packs_count
        },
        "cases_by_bureau": [
            {"bureau": b, "cases": count}
            for b, count in bureau_counts.items()
        ],
        "cases_by_status": [
            {"status": s, "count": count}
            for s, count in status_counts.items()
        ],
        "ageing_distribution": [
            {"bracket": "< 30 Days", "count": ageing["<30d"]},
            {"bracket": "30 - 90 Days", "count": ageing["30-90d"]},
            {"bracket": "> 90 Days", "count": ageing[">90d"]}
        ],
        "overlap_metrics": {
            "total_flagged": db.query(PotentialOverlap).count(),
            "confirmed_related": db.query(PotentialOverlap).filter(PotentialOverlap.review_status == "CONFIRMED_RELATED").count(),
            "pending_review": overlaps_count,
            "marked_unrelated": db.query(PotentialOverlap).filter(PotentialOverlap.review_status == "MARKED_UNRELATED").count()
        }
    }
