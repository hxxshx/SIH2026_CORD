import pytest
from app.services.codocket_service import build_codocket_pdf, generate_receipt_hash

def test_codocket_pdf_generation():
    pack = {
        "pack_id": "CORD-CD-104",
        "title": "Joint Regulatory Review Pack: Demo Institute North",
        "status": "READY_FOR_REVIEW",
        "lead_bureau": "Regulation Bureau"
    }

    institution = {
        "name": "Demo Institute North",
        "aicte_pid": "DEMO-PID-104",
        "verification_state": "VERIFIED",
        "region": "Northern",
        "state": "Rajasthan",
        "district": "Jaipur"
    }

    cases = [
        {
            "synthetic_case_id": "DEMO-PGRC-104",
            "bureau_code": "PGRC",
            "category": "Fee Irregularity",
            "subject": "Student complaint regarding unauthorized fee collection",
            "status": "Under Process",
            "days_open": 22
        },
        {
            "synthetic_case_id": "DEMO-RB-219",
            "bureau_code": "Regulation Bureau",
            "category": "Unapproved Expansion",
            "subject": "Show-cause notice for 60-seat expansion",
            "status": "Under Show-Cause",
            "days_open": 14
        }
    ]

    overlap_info = {
        "rationale_list": [
            "✓ Verified PID Match: DEMO-PID-104",
            "✓ TF-IDF Category Similarity: 84% Overlap on Intake / Fees",
            "⚠ Status Alert: Active Show-Cause in RB concurrent with PGRC Grievance"
        ]
    }

    review_record = {
        "receipt_id": "RCPT-CORD-CD-104-998811",
        "hash_signature": "0X9A4B7C12FE31",
        "reviewer": "R. Sharma (Under Secretary, Regulation Bureau)",
        "timestamp": "2026-10-24 14:00:00 UTC",
        "coordination_action": "Joint Hearing Recommended",
        "review_note": "Evidence confirms cross-bureau overlap. Recommended coordinating with PGRC before final order."
    }

    pdf_bytes = build_codocket_pdf(pack, institution, cases, overlap_info, review_record)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF"), "Generated file must be a valid PDF document"

def test_receipt_hash_reproducibility():
    hash1 = generate_receipt_hash("CORD-CD-104", ["DEMO-PGRC-104", "DEMO-RB-219"], "Approved joint hearing", "2026-10-24 12:00:00")
    hash2 = generate_receipt_hash("CORD-CD-104", ["DEMO-PGRC-104", "DEMO-RB-219"], "Approved joint hearing", "2026-10-24 12:00:00")
    assert hash1 == hash2
    assert len(hash1) == 24
