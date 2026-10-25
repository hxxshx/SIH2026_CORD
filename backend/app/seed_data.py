from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Institution, Case, PotentialOverlap, CoDocketPack, CoDocketReceipt, AuditEvent
from .services.overlap_detection import evaluate_case_overlap
from .services.codocket_service import generate_receipt_hash

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Institution).count() > 0:
        return

    # 1. Institutions
    institutions_data = [
        {
            "id": 1,
            "name": "Demo Institute North",
            "aicte_pid": "DEMO-PID-104",
            "verification_state": "VERIFIED",
            "region": "Northern",
            "state": "Rajasthan",
            "district": "Jaipur",
            "institution_type": "Engineering & Technology"
        },
        {
            "id": 2,
            "name": "Venkateshwara College of Technology",
            "aicte_pid": None,  # Ambiguous Identity Test Case
            "verification_state": "UNVERIFIED_PENDING_REVIEW",
            "region": "South-Central",
            "state": "Telangana",
            "district": "Hyderabad",
            "institution_type": "Engineering & Technology"
        },
        {
            "id": 3,
            "name": "Apex Institute of Engineering & Research",
            "aicte_pid": "1-8921443",
            "verification_state": "VERIFIED",
            "region": "Western",
            "state": "Maharashtra",
            "district": "Pune",
            "institution_type": "Engineering & Technology"
        },
        {
            "id": 4,
            "name": "National College of Pharmaceutical Sciences",
            "aicte_pid": "1-7712390",
            "verification_state": "VERIFIED",
            "region": "Central",
            "state": "Madhya Pradesh",
            "district": "Bhopal",
            "institution_type": "Pharmacy"
        },
        {
            "id": 5,
            "name": "Modern Institute of Management Studies",
            "aicte_pid": "1-9041235",
            "verification_state": "VERIFIED",
            "region": "South-Western",
            "state": "Karnataka",
            "district": "Bengaluru",
            "institution_type": "Management"
        },
        {
            "id": 6,
            "name": "Global Academy of Polytechnic Education",
            "aicte_pid": "1-4512998",
            "verification_state": "VERIFIED",
            "region": "Northern",
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "institution_type": "Polytechnic / Diploma"
        },
        {
            "id": 7,
            "name": "Surya Institute of Applied Sciences",
            "aicte_pid": "1-3312891",
            "verification_state": "VERIFIED",
            "region": "Southern",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "institution_type": "Applied Arts & Crafts"
        },
        {
            "id": 8,
            "name": "Delhi Advanced Institute of Management & Technology",
            "aicte_pid": "1-1029481",
            "verification_state": "VERIFIED",
            "region": "North-Western",
            "state": "Delhi",
            "district": "New Delhi",
            "institution_type": "Management"
        }
    ]

    for inst_dict in institutions_data:
        inst = Institution(**inst_dict)
        db.add(inst)
    db.commit()

    # 2. Cases
    now = datetime.utcnow()
    cases_data = [
        # Flagship Test Case: Demo Institute North (Institution 1)
        {
            "synthetic_case_id": "DEMO-PGRC-104",
            "institution_id": 1,
            "bureau_code": "PGRC",
            "category": "Fee Irregularity & Faculty Deficiency",
            "subject": "Student complaint regarding unauthorized fee collection and cancelled classes",
            "summary": "Multiple B.Tech students submitted evidence of institution demanding unapproved capitation and development fees while canceling scheduled academic lectures due to unpaid adjunct faculty.",
            "status": "Under Process",
            "last_action": "Complainant statement and bank fee receipts received for scrutiny",
            "opened_date": now - timedelta(days=22),
            "officer_assigned": "K. Sengupta (PGRC Cell)",
            "complainant_type": "Student",
            "severity": "High",
            "days_open": 22
        },
        {
            "synthetic_case_id": "DEMO-RB-219",
            "institution_id": 1,
            "bureau_code": "Regulation Bureau",
            "category": "Unapproved Expansion & Faculty Ratio Violation",
            "subject": "Show-cause notice issued for unapproved 60-seat expansion and faculty deficiency",
            "summary": "AICTE inspection committee detected unauthorized enrollment in Computer Science exceeding sanctioned intake by 60 seats, coupled with acute faculty cadre ratio deficit violating AICTE norms.",
            "status": "Under Show-Cause",
            "last_action": "Show-cause notice served to Management; response awaited within 15 days",
            "opened_date": now - timedelta(days=14),
            "officer_assigned": "R. Sharma (Under Secretary, Regulation)",
            "complainant_type": "Anonymous / Vigilance",
            "severity": "Critical",
            "days_open": 14
        },
        {
            "synthetic_case_id": "DEMO-RO-302",
            "institution_id": 1,
            "bureau_code": "Regional Office",
            "category": "Campus Boundary & Infrastructure Demarcation",
            "subject": "Routine regional campus boundary wall demarcation",
            "summary": "Verification of revised revenue map and boundary wall demarcations following adjacent municipal highway expansion. No grievance or regulatory penalty involved.",
            "status": "Disposed",
            "last_action": "Clearance certificate issued by RO Jaipur; matter officially closed",
            "opened_date": now - timedelta(days=95),
            "officer_assigned": "M. L. Verma (RO NWRO)",
            "complainant_type": "Citizen / Land Revenue",
            "severity": "Low",
            "days_open": 95
        },

        # Ambiguous Identity Test Case: Venkateshwara College (Institution 2)
        {
            "synthetic_case_id": "DEMO-PGRC-512",
            "institution_id": 2,
            "bureau_code": "PGRC",
            "category": "Caution Deposit & Certificate Retention",
            "subject": "Grievance over non-refund of caution deposit and withheld original degree certificates",
            "summary": "Graduating batch alleged administrative office refused release of original diplomas and transcripts pending extra development fee clearance not stipulated in AICTE approval.",
            "status": "Under Process",
            "last_action": "Notice dispatched to Registrar; explanation required",
            "opened_date": now - timedelta(days=34),
            "officer_assigned": "P. N. Rao (PGRC Cell)",
            "complainant_type": "Student",
            "severity": "High",
            "days_open": 34
        },
        {
            "synthetic_case_id": "DEMO-AB-411",
            "institution_id": 2,
            "bureau_code": "Approval Bureau",
            "category": "Unapproved Course Intake",
            "subject": "Surprise scrutiny report on unapproved intake in AI & Data Science diploma",
            "summary": "Expert visiting committee flagged admission of 45 students in new technology program without mandatory Letter of Approval (LoA) from AICTE Approval Bureau.",
            "status": "Inquiry Pending",
            "last_action": "Hearing scheduled before Standing Appellate Committee (SAC)",
            "opened_date": now - timedelta(days=40),
            "officer_assigned": "Dr. V. Murthy (Approval Bureau)",
            "complainant_type": "Council Vigilance",
            "severity": "Critical",
            "days_open": 40
        },

        # Apex Institute (Institution 3)
        {
            "synthetic_case_id": "APEX-RB-891",
            "institution_id": 3,
            "bureau_code": "Regulation Bureau",
            "category": "Faculty Shortfall & Cadre Imbalance",
            "subject": "Regulation Bureau notice on faculty cadre deficiency in Mechanical Dept",
            "summary": "Cadre ratio compliance audit revealed 4 vacant professor posts filled by visiting tutors, falling below the 1:15/1:20 mandatory teaching cadre mandate.",
            "status": "Under Show-Cause",
            "last_action": "Institution submitted interim recruitment notification draft",
            "opened_date": now - timedelta(days=19),
            "officer_assigned": "R. Sharma (Under Secretary, Regulation)",
            "complainant_type": "Faculty Association",
            "severity": "High",
            "days_open": 19
        },
        {
            "synthetic_case_id": "APEX-PGRC-442",
            "institution_id": 3,
            "bureau_code": "PGRC",
            "category": "Salary Non-Disbursement & 7th CPC Violation",
            "subject": "Faculty complaint regarding delayed salary and unpaid 7th CPC increments",
            "summary": "14 permanent assistant professors alleged 4 months delayed salary and non-implementation of AICTE prescribed Seventh Pay Commission pay matrix.",
            "status": "Under Process",
            "last_action": "Institution finance officer summoned for reconciliation",
            "opened_date": now - timedelta(days=26),
            "officer_assigned": "S. K. Kadam (PGRC Cell)",
            "complainant_type": "Faculty",
            "severity": "High",
            "days_open": 26
        },

        # National College of Pharmacy (Institution 4)
        {
            "synthetic_case_id": "NCP-AB-339",
            "institution_id": 4,
            "bureau_code": "Approval Bureau",
            "category": "Laboratory Equipment Deficiency",
            "subject": "Deficiency in Pharmacology laboratory and missing animal house accreditation",
            "summary": "Scrutiny of Extension of Approval (EoA) documents showed failure to maintain certified CPCSEA registered animal house facility for Pharm.D coursework.",
            "status": "Pending Review",
            "last_action": "Compliance rectifying documents uploaded by college",
            "opened_date": now - timedelta(days=52),
            "officer_assigned": "T. R. Joshi (Approval Bureau)",
            "complainant_type": "Expert Committee",
            "severity": "Medium",
            "days_open": 52
        },
        {
            "synthetic_case_id": "NCP-RO-112",
            "institution_id": 4,
            "bureau_code": "Regional Office",
            "category": "Routine Campus Safety Audit",
            "subject": "Annual fire safety and disaster management compliance certificate renewal",
            "summary": "Standard verification of municipal fire safety NOC and evacuation exit markings.",
            "status": "Disposed",
            "last_action": "Fire safety renewal NOC accepted into central repository",
            "opened_date": now - timedelta(days=110),
            "officer_assigned": "A. K. Mishra (RO Central)",
            "complainant_type": "Institutional Submission",
            "severity": "Low",
            "days_open": 110
        },

        # Modern Institute of Management (Institution 5)
        {
            "synthetic_case_id": "MIMS-RB-501",
            "institution_id": 5,
            "bureau_code": "Regulation Bureau",
            "category": "Dual Affiliation & Course Duplication",
            "subject": "Inquiry on unauthorized concurrent PGDM and MBA program admissions",
            "summary": "Regulation Bureau received intelligence regarding institution running identical curriculum under state university affiliation and standalone PGDM banner.",
            "status": "Inquiry Pending",
            "last_action": "Joint inspection team constituted by Member Secretary",
            "opened_date": now - timedelta(days=17),
            "officer_assigned": "R. Sharma (Regulation Bureau)",
            "complainant_type": "Anonymous / Whistleblower",
            "severity": "Critical",
            "days_open": 17
        },
        {
            "synthetic_case_id": "MIMS-PGRC-602",
            "institution_id": 5,
            "bureau_code": "PGRC",
            "category": "Syllabus Misalignment & Excessive Exam Fees",
            "subject": "Student petition against sudden syllabus revision and exorbitant re-exam fee",
            "summary": "Management students filed collective grievance regarding Rs 5,000 per paper supplementary exam fees and arbitrary internal assessment weightages.",
            "status": "Under Process",
            "last_action": "Grievance redressal cell seeking college governing body response",
            "opened_date": now - timedelta(days=21),
            "officer_assigned": "B. G. Rao (PGRC Cell)",
            "complainant_type": "Student",
            "severity": "Medium",
            "days_open": 21
        },

        # Global Academy of Polytechnic (Institution 6)
        {
            "synthetic_case_id": "GAP-RO-771",
            "institution_id": 6,
            "bureau_code": "Regional Office",
            "category": "Hostel Sanitation & Water Purity",
            "subject": "Periodic regional health and sanitation inspection report",
            "summary": "Inspection conducted following municipal water pipeline leakage. Safe drinking water filter systems installed and certified.",
            "status": "Disposed",
            "last_action": "Satisfactory compliance report recorded",
            "opened_date": now - timedelta(days=78),
            "officer_assigned": "D. Singh (RO Northern)",
            "complainant_type": "Parent Representative",
            "severity": "Low",
            "days_open": 78
        },

        # Surya Institute (Institution 7)
        {
            "synthetic_case_id": "SIAS-PGRC-882",
            "institution_id": 7,
            "bureau_code": "PGRC",
            "category": "Hostel Timings & Library Digital Access",
            "subject": "Student grievance on digital journal access restrictions and hostel curfew",
            "summary": "Postgraduate students petitioned for 24x7 digital library access and relaxed curfew timings for academic research projects.",
            "status": "Under Process",
            "last_action": "Institution agreed to extend e-library access hours",
            "opened_date": now - timedelta(days=11),
            "officer_assigned": "K. Sengupta (PGRC)",
            "complainant_type": "Student",
            "severity": "Low",
            "days_open": 11
        },

        # Delhi Advanced Institute (Institution 8)
        {
            "synthetic_case_id": "DAIMT-RB-902",
            "institution_id": 8,
            "bureau_code": "Regulation Bureau",
            "category": "Over-Admission & Sanctioned Quota Breach",
            "subject": "Show-cause on excess student admissions beyond sanctioned capacity",
            "summary": "Admissions verification portal revealed 168 students admitted into MBA program against an approved intake capacity of 120 seats.",
            "status": "Under Show-Cause",
            "last_action": "Show-cause notice served; principal summoned for personal hearing",
            "opened_date": now - timedelta(days=8),
            "officer_assigned": "R. Sharma (Regulation Bureau)",
            "complainant_type": "State Entrance Cell",
            "severity": "Critical",
            "days_open": 8
        },
        {
            "synthetic_case_id": "DAIMT-PGRC-903",
            "institution_id": 8,
            "bureau_code": "PGRC",
            "category": "Admission Fee Without Official AICTE Receipt",
            "subject": "Student complaint regarding offline cash collection for management quota seats",
            "summary": "Parent complaint filed alleging college demanded Rs 1,50,000 cash donation receipted under 'miscellaneous alumni development fund' during direct admissions.",
            "status": "Under Process",
            "last_action": "Affidavit and audio recording received from complainant",
            "opened_date": now - timedelta(days=12),
            "officer_assigned": "M. S. Bedi (PGRC)",
            "complainant_type": "Parent",
            "severity": "Critical",
            "days_open": 12
        }
    ]

    for case_dict in cases_data:
        case = Case(**case_dict)
        db.add(case)
    db.commit()

    # 3. Seed Potential Overlaps
    # Flagship Overlap: Demo Institute North (DEMO-PGRC-104 vs DEMO-RB-219)
    overlap1 = PotentialOverlap(
        institution_id=1,
        source_case_id="DEMO-PGRC-104",
        candidate_case_id="DEMO-RB-219",
        pid_matched=True,
        tfidf_score=0.84,
        match_rationale="✓ Verified PID Match: DEMO-PID-104 | ✓ TF-IDF Category Similarity: 84% Overlap on Fees / Admissions & Faculty Deficit | ⚠ Status Alert: Active Show-Cause in [Regulation Bureau] concurrent with Under Process in [PGRC]",
        review_status="FLAGGED_PENDING_REVIEW",
        flagged_date=now - timedelta(days=13)
    )
    db.add(overlap1)

    # Ambiguous Identity Overlap: Venkateshwara College (DEMO-PGRC-512 vs DEMO-AB-411)
    overlap2 = PotentialOverlap(
        institution_id=2,
        source_case_id="DEMO-PGRC-512",
        candidate_case_id="DEMO-AB-411",
        pid_matched=False,
        tfidf_score=0.76,
        match_rationale="⚠ Identity Unverified - Human Validation Required (Fuzzy Matched: 92% Name Similarity) | ✓ TF-IDF Category Similarity: 76% Overlap on Unapproved Admissions & Fee Withholding | ⚠ Status Alert: Active Inquiry Pending in [Approval Bureau] concurrent with Under Process in [PGRC]",
        review_status="FLAGGED_PENDING_REVIEW",
        flagged_date=now - timedelta(days=30)
    )
    db.add(overlap2)

    # Apex Institute Overlap (APEX-RB-891 vs APEX-PGRC-442)
    overlap3 = PotentialOverlap(
        institution_id=3,
        source_case_id="APEX-RB-891",
        candidate_case_id="APEX-PGRC-442",
        pid_matched=True,
        tfidf_score=0.81,
        match_rationale="✓ Verified PID Match: 1-8921443 | ✓ TF-IDF Category Similarity: 81% Overlap on Faculty Shortfall & Salary Non-Disbursement | ⚠ Status Alert: Active Under Show-Cause in [Regulation Bureau] concurrent with Under Process in [PGRC]",
        review_status="FLAGGED_PENDING_REVIEW",
        flagged_date=now - timedelta(days=16)
    )
    db.add(overlap3)

    # Delhi Advanced Institute Overlap (DAIMT-RB-902 vs DAIMT-PGRC-903)
    overlap4 = PotentialOverlap(
        institution_id=8,
        source_case_id="DAIMT-RB-902",
        candidate_case_id="DAIMT-PGRC-903",
        pid_matched=True,
        tfidf_score=0.88,
        match_rationale="✓ Verified PID Match: 1-1029481 | ✓ TF-IDF Category Similarity: 88% Overlap on Excess Admissions & Unauthorized Fee Demand | ⚠ Status Alert: Active Show-Cause in [Regulation Bureau] concurrent with Under Process in [PGRC]",
        review_status="FLAGGED_PENDING_REVIEW",
        flagged_date=now - timedelta(days=7)
    )
    db.add(overlap4)

    # 4. Pre-seed a CoDocketPack for Demonstration
    pack1 = CoDocketPack(
        pack_id="CORD-CD-104",
        title="Joint Regulatory Review Pack: Demo Institute North (Fees & Faculty Intake Overlap)",
        institution_id=1,
        primary_case_id="DEMO-PGRC-104",
        related_case_ids=["DEMO-RB-219"],
        status="READY_FOR_REVIEW",
        lead_bureau="Regulation Bureau",
        created_at=now - timedelta(days=2)
    )
    db.add(pack1)

    # Seed an Audit Event
    audit1 = AuditEvent(
        user_id="Officer R. Sharma",
        action="SYSTEM_INIT_SEED",
        entity="System",
        entity_id="CORD-CORE",
        details="Initialized synthetic AICTE multi-bureau demo registry with 8 institutions and 14 cases."
    )
    db.add(audit1)

    db.commit()
