import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Case, Institution

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/cases.csv")
def export_cases_csv(db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Case ID",
        "Institution Name",
        "AICTE PID",
        "Bureau",
        "Category",
        "Subject",
        "Status",
        "Severity",
        "Days Open",
        "Assigned Officer",
        "Complainant Type",
        "Last Action"
    ])
    
    cases = db.query(Case).all()
    for c in cases:
        inst = db.query(Institution).filter(Institution.id == c.institution_id).first()
        writer.writerow([
            c.synthetic_case_id,
            inst.name if inst else "N/A",
            inst.aicte_pid if inst else "UNVERIFIED",
            c.bureau_code,
            c.category,
            c.subject,
            c.status,
            c.severity,
            c.days_open,
            c.officer_assigned,
            c.complainant_type,
            c.last_action
        ])
        
    csv_bytes = output.getvalue().encode('utf-8')
    headers = {
        "Content-Disposition": "attachment; filename=AICTE_CORD_Case_Register.csv"
    }
    return Response(content=csv_bytes, media_type="text/csv", headers=headers)
