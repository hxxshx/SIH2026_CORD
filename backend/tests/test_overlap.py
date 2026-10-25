import pytest
from app.services.overlap_detection import (
    evaluate_case_overlap,
    compute_tfidf_similarity,
    calculate_name_similarity,
    extract_pid
)

def test_flagship_case_overlap_detected():
    """
    Case A (DEMO-PGRC-104) and Case B (DEMO-RB-219) for Demo Institute North
    must be flagged with explainable TF-IDF signals.
    """
    case_pgrc = {
        "synthetic_case_id": "DEMO-PGRC-104",
        "bureau_code": "PGRC",
        "category": "Fee Irregularity & Faculty Deficiency",
        "subject": "Student complaint regarding unauthorized fee collection and cancelled classes",
        "summary": "Multiple B.Tech students submitted evidence of institution demanding unapproved capitation and development fees while canceling scheduled academic lectures due to unpaid adjunct faculty.",
        "status": "Under Process"
    }

    case_rb = {
        "synthetic_case_id": "DEMO-RB-219",
        "bureau_code": "Regulation Bureau",
        "category": "Unapproved Expansion & Faculty Ratio Violation",
        "subject": "Show-cause notice issued for unapproved 60-seat expansion and faculty deficiency",
        "summary": "AICTE inspection committee detected unauthorized enrollment in Computer Science exceeding sanctioned intake by 60 seats, coupled with acute faculty cadre ratio deficit violating AICTE norms.",
        "status": "Under Show-Cause"
    }

    result = evaluate_case_overlap(case_pgrc, case_rb, institution_pid="DEMO-PID-104")
    assert result is not None, "Active cases with fee/expansion/faculty overlap must be detected"
    assert result["pid_matched"] is True
    assert result["tfidf_score"] >= 0.70
    assert "✓ Verified PID Match: DEMO-PID-104" in result["match_rationale"]
    assert "Status Alert" in result["match_rationale"]

def test_unrelated_case_not_flagged():
    """
    Principle 1: Institution identity is NOT issue identity.
    Case C (DEMO-RO-302 - boundary wall demarcation, Disposed) shares the same PID
    with Demo Institute North, but must NOT be flagged as an overlap!
    """
    case_pgrc = {
        "synthetic_case_id": "DEMO-PGRC-104",
        "bureau_code": "PGRC",
        "category": "Fee Irregularity & Faculty Deficiency",
        "subject": "Student complaint regarding unauthorized fee collection and cancelled classes",
        "summary": "Multiple B.Tech students submitted evidence of unauthorized capitation fees.",
        "status": "Under Process"
    }

    case_ro_disposed = {
        "synthetic_case_id": "DEMO-RO-302",
        "bureau_code": "Regional Office",
        "category": "Campus Boundary & Infrastructure Demarcation",
        "subject": "Routine regional campus boundary wall demarcation",
        "summary": "Verification of revised revenue map and boundary wall demarcations following highway expansion.",
        "status": "Disposed"
    }

    result = evaluate_case_overlap(case_pgrc, case_ro_disposed, institution_pid="DEMO-PID-104")
    assert result is None, "Disposed or completely unrelated boundary matters must NOT be flagged as overlap"

def test_pid_extraction_and_fuzzy_name_matching():
    assert extract_pid("1-8921443") == "1-8921443"
    assert extract_pid("DEMO-PID-104") == "DEMO-PID-104"
    
    # RapidFuzz name match for ambiguous case
    name1 = "Venkateshwara College of Technology"
    name2 = "Sri Venkateshwara Inst of Tech"
    sim = calculate_name_similarity(name1, name2)
    assert sim > 0.65, f"Fuzzy matching should detect high similarity, got {sim}"
