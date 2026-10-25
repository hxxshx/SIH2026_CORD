from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    aicte_pid = Column(String(64), nullable=True, index=True)
    verification_state = Column(String(64), default="VERIFIED")  # VERIFIED, UNVERIFIED_PENDING_REVIEW, UNVERIFIED_NAME_MATCH
    region = Column(String(64), default="Northern")
    state = Column(String(64), default="Rajasthan")
    district = Column(String(64), default="Jaipur")
    institution_type = Column(String(128), default="Engineering & Technology")

    cases = relationship("Case", back_populates="institution", cascade="all, delete-orphan")
    overlaps = relationship("PotentialOverlap", back_populates="institution")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    synthetic_case_id = Column(String(64), unique=True, nullable=False, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False, index=True)
    bureau_code = Column(String(32), nullable=False, index=True)  # PGRC, Regulation Bureau (RB), Regional Office (RO), Approval Bureau (AB)
    category = Column(String(128), nullable=False)
    subject = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    status = Column(String(64), nullable=False, default="Under Process")  # Under Process, Pending Review, Under Show-Cause, Inquiry Pending, Disposed
    last_action = Column(String(255), default="Received complaint dossier")
    opened_date = Column(DateTime, default=datetime.utcnow)
    officer_assigned = Column(String(128), default="R. Sharma (Under Secretary)")
    complainant_type = Column(String(64), default="Student")  # Student, Faculty, Citizen, Anonymous
    severity = Column(String(32), default="High")  # Critical, High, Medium, Low
    days_open = Column(Integer, default=14)

    institution = relationship("Institution", back_populates="cases")


class PotentialOverlap(Base):
    __tablename__ = "potential_overlaps"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    source_case_id = Column(String(64), ForeignKey("cases.synthetic_case_id"), nullable=False)
    candidate_case_id = Column(String(64), ForeignKey("cases.synthetic_case_id"), nullable=False)
    pid_matched = Column(Boolean, default=True)
    tfidf_score = Column(Float, default=0.0)
    match_rationale = Column(Text, nullable=False)
    review_status = Column(String(64), default="FLAGGED_PENDING_REVIEW")  # FLAGGED_PENDING_REVIEW, CONFIRMED_RELATED, MARKED_UNRELATED
    flagged_date = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(String(128), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    institution = relationship("Institution", back_populates="overlaps")
    source_case = relationship("Case", foreign_keys=[source_case_id])
    candidate_case = relationship("Case", foreign_keys=[candidate_case_id])


class CoDocketPack(Base):
    __tablename__ = "codocket_packs"

    id = Column(Integer, primary_key=True, index=True)
    pack_id = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    primary_case_id = Column(String(64), nullable=False)
    related_case_ids = Column(JSON, default=list)  # List of string case IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(64), default="READY_FOR_REVIEW")  # READY_FOR_REVIEW, COORDINATED, CLOSED
    lead_bureau = Column(String(64), default="Regulation Bureau")

    institution = relationship("Institution")
    receipts = relationship("CoDocketReceipt", back_populates="pack")


class CoDocketReceipt(Base):
    __tablename__ = "codocket_receipts"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(String(64), unique=True, nullable=False, index=True)
    pack_id = Column(String(64), ForeignKey("codocket_packs.pack_id"), nullable=False)
    displayed_snapshot = Column(JSON, nullable=False)  # Immutable snapshot of cases shown at review time
    review_note = Column(Text, nullable=False)
    reviewer = Column(String(128), default="R. Sharma (Regulation Bureau, HQ-Delhi)")
    timestamp = Column(DateTime, default=datetime.utcnow)
    hash_signature = Column(String(128), nullable=False)
    coordination_action = Column(String(128), default="Joint Inquiry Recommended")

    pack = relationship("CoDocketPack", back_populates="receipts")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(128), default="Officer R. Sharma")
    action = Column(String(128), nullable=False)
    entity = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
