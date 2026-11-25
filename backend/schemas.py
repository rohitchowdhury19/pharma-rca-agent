from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Fishbone
class FishboneNodeBase(BaseModel):
    category: str  # MAN, MACHINE, MATERIAL, METHOD, MEASUREMENT, MILIEU
    cause: str
    details: Optional[str] = ""
    likelihood: Optional[str] = "MEDIUM"  # HIGH, MEDIUM, LOW, RULED_OUT
    is_verified: Optional[bool] = False
    is_root_cause: Optional[bool] = False
    supporting_evidence: Optional[str] = ""

class FishboneNodeCreate(FishboneNodeBase):
    pass

class FishboneNodeSchema(FishboneNodeBase):
    id: str
    investigation_id: str

    class Config:
        from_attributes = True

# 5 Whys
class WhyChainBase(BaseModel):
    level: int
    question: str
    answer: str
    evidence: Optional[str] = ""
    verified: Optional[bool] = False

class WhyChainCreate(WhyChainBase):
    pass

class WhyChainSchema(WhyChainBase):
    id: str
    investigation_id: str

    class Config:
        from_attributes = True

# Evidence
class EvidenceItemBase(BaseModel):
    title: str
    source: str
    status: Optional[str] = "PENDING_LAB"  # CONFIRMED, CONTRADICTS, INCONCLUSIVE, PENDING_LAB
    findings: Optional[str] = ""
    is_gap: Optional[bool] = False

class EvidenceItemCreate(EvidenceItemBase):
    pass

class EvidenceItemSchema(EvidenceItemBase):
    id: str
    investigation_id: str

    class Config:
        from_attributes = True

# CAPA
class CapaItemBase(BaseModel):
    action_type: str  # CORRECTIVE, PREVENTIVE
    description: str
    rationale: Optional[str] = ""
    owner_department: str
    target_date: str
    status: Optional[str] = "PROPOSED"
    effectiveness_check: Optional[str] = ""

class CapaItemCreate(CapaItemBase):
    pass

class CapaItemSchema(CapaItemBase):
    id: str
    investigation_id: str

    class Config:
        from_attributes = True

# Audit Log
class AuditLogSchema(BaseModel):
    id: str
    investigation_id: str
    action: str
    actor: str
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Investigation
class InvestigationBase(BaseModel):
    title: str
    incident_number: Optional[str] = ""
    api_product_name: Optional[str] = ""
    api_code: Optional[str] = ""
    batch_number: Optional[str] = ""
    manufacturing_stage: Optional[str] = ""
    equipment_id: Optional[str] = ""
    severity: Optional[str] = "MAJOR"
    status: Optional[str] = "UNDER_INVESTIGATION"
    date_of_incident: Optional[str] = ""
    reported_by: Optional[str] = ""
    immediate_containment: Optional[str] = ""
    problem_description: Optional[str] = ""
    cqa_impacted: Optional[str] = ""
    cpp_parameters: Optional[str] = ""
    confirmed_root_cause: Optional[str] = ""
    root_cause_category: Optional[str] = ""
    is_root_cause_confirmed: Optional[bool] = False
    qp_review_notes: Optional[str] = ""
    qp_signed_off: Optional[bool] = False
    qp_signed_by: Optional[str] = ""
    qp_signed_at: Optional[str] = ""

class InvestigationCreate(InvestigationBase):
    fishbone_nodes: Optional[List[FishboneNodeBase]] = []
    why_chains: Optional[List[WhyChainBase]] = []
    evidence_items: Optional[List[EvidenceItemBase]] = []
    capa_items: Optional[List[CapaItemBase]] = []

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    incident_number: Optional[str] = None
    api_product_name: Optional[str] = None
    api_code: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    equipment_id: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    date_of_incident: Optional[str] = None
    reported_by: Optional[str] = None
    immediate_containment: Optional[str] = None
    problem_description: Optional[str] = None
    cqa_impacted: Optional[str] = None
    cpp_parameters: Optional[str] = None
    confirmed_root_cause: Optional[str] = None
    root_cause_category: Optional[str] = None
    is_root_cause_confirmed: Optional[bool] = None
    qp_review_notes: Optional[str] = None
    qp_signed_off: Optional[bool] = None
    qp_signed_by: Optional[str] = None
    qp_signed_at: Optional[str] = None
    fishbone_nodes: Optional[List[FishboneNodeBase]] = None
    why_chains: Optional[List[WhyChainBase]] = None
    evidence_items: Optional[List[EvidenceItemBase]] = None
    capa_items: Optional[List[CapaItemBase]] = None

class InvestigationSchema(InvestigationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    fishbone_nodes: List[FishboneNodeSchema] = []
    why_chains: List[WhyChainSchema] = []
    evidence_items: List[EvidenceItemSchema] = []
    capa_items: List[CapaItemSchema] = []
    audit_logs: List[AuditLogSchema] = []

    class Config:
        from_attributes = True

# AI Schemas
class AIAnalysisRequest(BaseModel):
    text: str
    document_type: Optional[str] = "text"  # pdf, text, email
    groq_api_key: Optional[str] = None
    model_name: Optional[str] = "llama-3.3-70b-versatile"
    focus_mode: Optional[str] = "full"  # full, extraction, causal, evidence, capa

class AIAnalysisResponse(BaseModel):
    incident_info: Dict[str, Any]
    fishbone_categories: Dict[str, List[Dict[str, Any]]]
    five_whys: List[Dict[str, Any]]
    evidence_gaps: List[Dict[str, Any]]
    potential_root_causes: List[Dict[str, Any]]
    capa_recommendations: List[Dict[str, Any]]
    summary_narrative: str
    confidence_score: float
    model_used: str

class AIChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]
    groq_api_key: Optional[str] = None
    model_name: Optional[str] = "llama-3.3-70b-versatile"

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[Dict[str, Any]]] = []
    applied_patches: Optional[Dict[str, Any]] = None
