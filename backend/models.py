from datetime import datetime
import json
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    incident_number = Column(String(100), index=True)
    api_product_name = Column(String(200))
    api_code = Column(String(100))
    batch_number = Column(String(100), index=True)
    manufacturing_stage = Column(String(200))
    equipment_id = Column(String(200))
    severity = Column(String(50), default="MAJOR")  # CRITICAL, MAJOR, MINOR
    status = Column(String(50), default="UNDER_INVESTIGATION")  # DRAFT, UNDER_INVESTIGATION, PENDING_QP_REVIEW, CAPA_DEFINED, CLOSED
    date_of_incident = Column(String(50))
    reported_by = Column(String(100))
    
    immediate_containment = Column(Text, default="")
    problem_description = Column(Text, default="")
    cqa_impacted = Column(String(255), default="")
    cpp_parameters = Column(Text, default="")  # JSON or text of impacted CPPs
    
    # Root Cause Final conclusions
    confirmed_root_cause = Column(Text, default="")
    root_cause_category = Column(String(50), default="")  # METHOD, MACHINE, MATERIAL, MAN, MEASUREMENT, MILIEU
    is_root_cause_confirmed = Column(Boolean, default=False)
    
    # Qualified Person Review
    qp_review_notes = Column(Text, default="")
    qp_signed_off = Column(Boolean, default=False)
    qp_signed_by = Column(String(100), default="")
    qp_signed_at = Column(String(50), default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    fishbone_nodes = relationship("FishboneNode", back_populates="investigation", cascade="all, delete-orphan")
    why_chains = relationship("WhyChain", back_populates="investigation", cascade="all, delete-orphan", order_by="WhyChain.level")
    evidence_items = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan")
    capa_items = relationship("CapaItem", back_populates="investigation", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="investigation", cascade="all, delete-orphan", order_by="AuditLog.timestamp.desc()")


class FishboneNode(Base):
    __tablename__ = "fishbone_nodes"

    id = Column(String(50), primary_key=True, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"))
    category = Column(String(50))  # MAN, MACHINE, MATERIAL, METHOD, MEASUREMENT, MILIEU
    cause = Column(String(255))
    details = Column(Text, default="")
    likelihood = Column(String(50), default="MEDIUM")  # HIGH, MEDIUM, LOW, RULED_OUT
    is_verified = Column(Boolean, default=False)
    is_root_cause = Column(Boolean, default=False)
    supporting_evidence = Column(Text, default="")

    investigation = relationship("Investigation", back_populates="fishbone_nodes")


class WhyChain(Base):
    __tablename__ = "why_chains"

    id = Column(String(50), primary_key=True, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"))
    level = Column(Integer)  # 1 to 5+
    question = Column(Text)
    answer = Column(Text)
    evidence = Column(Text, default="")
    verified = Column(Boolean, default=False)

    investigation = relationship("Investigation", back_populates="why_chains")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String(50), primary_key=True, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"))
    title = Column(String(255))
    source = Column(String(100))  # BMR Review, SCADA Log, Analytical CoA, Calibration Log, Operator Logbook, etc.
    status = Column(String(50), default="PENDING_LAB")  # CONFIRMED, CONTRADICTS, INCONCLUSIVE, PENDING_LAB
    findings = Column(Text, default="")
    is_gap = Column(Boolean, default=False)  # True if AI flagged this as missing evidence needed

    investigation = relationship("Investigation", back_populates="evidence_items")


class CapaItem(Base):
    __tablename__ = "capa_items"

    id = Column(String(50), primary_key=True, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"))
    action_type = Column(String(50))  # CORRECTIVE, PREVENTIVE
    description = Column(Text)
    rationale = Column(Text, default="")
    owner_department = Column(String(100))
    target_date = Column(String(50))
    status = Column(String(50), default="PROPOSED")  # PROPOSED, APPROVED, IN_PROGRESS, COMPLETED
    effectiveness_check = Column(Text, default="")

    investigation = relationship("Investigation", back_populates="capa_items")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    investigation_id = Column(String(50), ForeignKey("investigations.id"))
    action = Column(String(100))
    actor = Column(String(100))  # AI_ASSISTANT, QA_INVESTIGATOR, QUALIFIED_PERSON
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="audit_logs")
