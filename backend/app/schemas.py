from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class InstitutionBase(BaseModel):
    name: str
    aicte_pid: Optional[str] = None
    verification_state: str = "VERIFIED"
    region: str = "Northern"
    state: str = "Rajasthan"
    district: str = "Jaipur"
    institution_type: str = "Engineering & Technology"

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: int
    active_cases_count: Optional[int] = 0
    overlaps_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class CaseBase(BaseModel):
    synthetic_case_id: str
    institution_id: int
    bureau_code: str
    category: str
    subject: str
    summary: str
    status: str = "Under Process"
    last_action: str
    opened_date: Optional[datetime] = None
    officer_assigned: str
    complainant_type: str = "Student"
    severity: str = "High"
    days_open: int = 14

class CaseResponse(CaseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PotentialOverlapResponse(BaseModel):
    id: int
    institution_id: int
    institution_name: Optional[str] = None
    institution_pid: Optional[str] = None
    verification_state: Optional[str] = None
    source_case_id: str
    candidate_case_id: str
    pid_matched: bool
    tfidf_score: float
    match_rationale: str
    rationale_list: Optional[List[str]] = []
    review_status: str
    flagged_date: datetime
    source_case: Optional[CaseResponse] = None
    candidate_case: Optional[CaseResponse] = None

    model_config = ConfigDict(from_attributes=True)

class OverlapReviewRequest(BaseModel):
    action: str  # CONFIRM_RELATED or MARK_UNRELATED
    reviewer: str = "R. Sharma (Under Secretary, Regulation Bureau)"
    note: Optional[str] = None

class CoDocketCreateRequest(BaseModel):
    institution_id: int
    primary_case_id: str
    related_case_ids: List[str]
    title: str = "CORD Co-Docket — Multi-Bureau Case Dossier"
    lead_bureau: str = "Regulation Bureau"

class CoDocketReceiptCreateRequest(BaseModel):
    pack_id: str
    review_note: str
    reviewer: str = "R. Sharma | Under Secretary, Regulation Bureau (HQ-Delhi)"
    coordination_action: str = "Joint Inquiry & Show-Cause Alignment"

class CoDocketResponse(BaseModel):
    id: int
    pack_id: str
    title: str
    institution_id: int
    institution: Optional[InstitutionBase] = None
    primary_case_id: str
    related_case_ids: List[str]
    created_at: datetime
    status: str
    lead_bureau: str
    cases: Optional[List[CaseResponse]] = []
    receipts: Optional[List[Dict[str, Any]]] = []

    model_config = ConfigDict(from_attributes=True)

class StatsResponse(BaseModel):
    total_institutions: int
    active_pids: int
    cross_bureau_overlaps_count: int
    ready_codockets_count: int
    cases_by_bureau: Dict[str, int]
    cases_by_status: Dict[str, int]
    ageing_distribution: Dict[str, int]
