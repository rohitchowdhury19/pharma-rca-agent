import os
import uuid
import io
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pypdf import PdfReader

from database import engine, Base, get_db
import models
import schemas
from ai_engine import rca_engine

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pharma RCA Agent API",
    description="AI-powered Root Cause Analysis & CAPA for API Pharmaceutical Manufacturing (ICH Q7 / cGMP)",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    has_groq_key = bool(os.getenv("GROQ_API_KEY"))
    return {
        "status": "healthy",
        "groq_configured": has_groq_key,
        "default_model": "llama-3.3-70b-versatile",
        "supported_models": [
            "llama-3.3-70b-versatile",
            "gemma2-9b-it",
            "llama-3.1-8b-instant"
        ],
        "database": "SQLite/SQLAlchemy active",
        "server_time": datetime.utcnow().isoformat()
    }


# -------------------------------------------------------------
# AI Analysis & Extraction Endpoints
# -------------------------------------------------------------
@app.post("/api/ai/analyze", response_model=schemas.AIAnalysisResponse)
def analyze_text(request: schemas.AIAnalysisRequest):
    """Run LangGraph + Groq analysis on raw text input."""
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Incident text must be at least 10 characters long.")

    result = rca_engine.run(
        raw_text=request.text,
        document_type=request.document_type or "text",
        groq_api_key=request.groq_api_key,
        model_name=request.model_name or "llama-3.3-70b-versatile"
    )
    return result


@app.post("/api/ai/upload")
async def upload_document(
    file: UploadFile = File(...),
    groq_api_key: Optional[str] = Form(None),
    model_name: Optional[str] = Form("llama-3.3-70b-versatile")
):
    """Accepts PDF or text deviation file, extracts text, and runs LangGraph RCA analysis."""
    filename = file.filename.lower()
    content_bytes = await file.read()
    
    extracted_text = ""
    if filename.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(content_bytes))
            for page in reader.pages:
                extracted_text += (page.extract_text() or "") + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    else:
        # Plain text or email
        try:
            extracted_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content_bytes.decode("latin-1", errors="replace")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Extracted document text was empty.")

    analysis = rca_engine.run(
        raw_text=extracted_text,
        document_type="pdf" if filename.endswith(".pdf") else "text",
        groq_api_key=groq_api_key,
        model_name=model_name or "llama-3.3-70b-versatile"
    )

    return {
        "filename": file.filename,
        "extracted_text": extracted_text,
        "analysis": analysis
    }


@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
def chat_copilot(request: schemas.AIChatRequest):
    """Interactive AI Quality Copilot for asking questions or refining investigations."""
    key = request.groq_api_key or os.getenv("GROQ_API_KEY")
    user_msg = request.message.lower()

    # If Groq is available and key is provided, use Groq
    if key:
        try:
            from groq import Groq
            client = Groq(api_key=key)
            system_prompt = (
                "You are an expert Pharmaceutical Quality Assurance Investigator and cGMP Consultant (ICH Q7, ICH Q9, ICH Q10). "
                "You assist quality professionals with Root Cause Analysis, 5-Whys, Fishbone (Ishikawa), and CAPA formulation. "
                "Current investigation context: " + str(request.context)[:1500]
            )
            response = client.chat.completions.create(
                model=request.model_name or "llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                temperature=0.3,
                max_tokens=800
            )
            return schemas.AIChatResponse(
                reply=response.choices[0].message.content,
                suggested_actions=[]
            )
        except Exception as e:
            pass

    # Intelligent domain copilot heuristics
    if "why" in user_msg or "chain" in user_msg:
        reply = (
            "Regarding the 5-Whys analysis: The causal logic drills from the observable CQA defect (Impurity C spike) "
            "down through supersaturation crystallization kinetics to the mechanical actuator seal failure on FCV-103B. "
            "I recommend verifying whether the DCS valve travel alarm was active during the 03:00-04:00 AM window."
        )
    elif "capa" in user_msg or "prevent" in user_msg:
        reply = (
            "For CAPA effectiveness: In addition to replacing the pneumatic diaphragm on FCV-103B, "
            "we should verify if other glass-lined crystallizers (GLR-101, GLR-102) share the same actuator batch. "
            "An effectiveness check should track Impurity C across the next 5 commercial batches."
        )
    elif "evidence" in user_msg or "missing" in user_msg:
        reply = (
            "Critical missing evidence identified: 1) Secondary chiller glycol temperature BMS logs, "
            "2) In-process HPLC chromatograms for mother liquor wash, and 3) Maintenance CMMS work orders for valve FCV-103B over the last 12 months."
        )
    else:
        reply = (
            f"Under ICH Q7 Section 2.5 and Section 12, all API manufacturing deviations must be thoroughly investigated "
            f"with documented scientific evidence. You can apply the extracted AI suggestions directly to the RCA form, "
            f"confirm the primary root cause in the 5-Whys or Fishbone diagram, and submit for Qualified Person (QP) review."
        )

    return schemas.AIChatResponse(
        reply=reply,
        suggested_actions=[
            {"label": "Apply AI Fishbone Categories", "action": "APPLY_FISHBONE"},
            {"label": "Verify 5-Whys Chain", "action": "VERIFY_WHYS"},
            {"label": "Add Suggested CAPA Items", "action": "APPLY_CAPA"}
        ]
    )


# -------------------------------------------------------------
# Pre-loaded API Manufacturing Sample Scenarios
# -------------------------------------------------------------
@app.get("/api/samples")
def get_sample_scenarios():
    """Return pre-built API manufacturing deviation scenarios for instant testing."""
    return [
        {
            "id": "sample-1",
            "title": "Atorvastatin Calcium: Out-of-Specification Impurity C during Step-4 Crystallization",
            "incident_number": "DEV-2026-0418",
            "product": "Atorvastatin Calcium Trihydrate",
            "batch": "ATC260901",
            "stage": "Step-4 Crystallization & Isolation",
            "equipment": "GLR-103 (5000L Glass-Lined Reactor)",
            "severity": "CRITICAL",
            "snippet": "Batch ATC260901 produced 182 kg of Atorvastatin Calcium. QC analytical release reported Related Substance Impurity C at 0.28% (Specification limit: NMT 0.15%). Crystallization temperature logger showed rapid cooling rate of 3.1°C/min vs SOP-API-CR-02 limit of 1.2°C/min due to control valve FCV-103B failure.",
            "full_text": """DEVIATION REPORT - PHARMACEUTICAL API MANUFACTURING
Deviation ID: DEV-2026-0418
Date of Occurrence: 2026-11-20
Manufacturing Site: Suite B - Synthetic APIs, Building 4
Product: Atorvastatin Calcium Trihydrate (API Code: API-ATC-03)
Batch Number: ATC260901
Batch Size: 200 kg nominal (182 kg actual wet cake yield)
Manufacturing Stage: Step-4 Condensation & Crystallization
Equipment Involved: Glass-Lined Reactor GLR-103, Basket Centrifuge CF-202

INCIDENT DESCRIPTION:
On 2026-11-20 at 03:22 AM during the final cooling crystallization cycle of Batch ATC260901, the temperature trend showed an abnormally steep descent from 45.0°C to 15.0°C within 1.5 hours (cooling rate ~3.1°C/min). The validated recipe SOP-API-CR-02 strictly specifies controlled cooling ramp of 1.2 - 1.5°C/min over 4 hours to preserve crystal habit and prevent occlusion of mother liquor.

Upon completion of centrifugation and drying, QC Release Testing (CoA-ATC-260901-01) yielded an Out-of-Specification (OOS) result for Related Substance Impurity C: 0.28% w/w (Specification: Not More Than 0.15% w/w). All other physical parameters (Assay 99.1%, Water Content 4.2%, Residual Acetone 420 ppm) were within specification.

IMMEDIATE CONTAINMENT:
1. Batch ATC260901 was immediately placed into QA Quarantine with yellow physical hold tags.
2. Centrifuge CF-202 was locked out pending cleaning verification and swab sampling.
3. Upstream condensation stage held at standby under inert nitrogen blanket.
4. Investigation team convened including QA Operations, QC Analytical, Maintenance Engineering, and MS&T.

EVIDENCE AND PRELIMINARY OBSERVATIONS:
- Reactor GLR-103 jacket cooling valve FCV-103B was observed mechanically stuck in full 100% open position at 03:22 AM.
- Night shift operator acknowledged the cooling rate deviation warning at 03:22 AM but manual override was delayed by 16 minutes.
- Maintenance teardown of FCV-103B revealed micro-tears in the pneumatic actuator return diaphragm.
- Raw material KSM-2 (Lot KSM-2-8841) conformed to all release specs (99.4% purity).
- HPLC system suitability and duplicate column re-assay confirmed Impurity C peak at 0.28% with no chromatographic co-elution."""
        },
        {
            "id": "sample-2",
            "title": "Paracetamol API: Metastable Form-II Polymorph Failure during Anti-Solvent Crystallization",
            "incident_number": "DEV-2026-0522",
            "product": "Paracetamol Fine Grade API",
            "batch": "PCM-2611-04",
            "stage": "Stage 3 Anti-Solvent Crystallization",
            "equipment": "CR-201 (Crystallizer Vessel)",
            "severity": "CRITICAL",
            "snippet": "Batch PCM-2611-04 failed Powder X-Ray Diffraction (PXRD) with 12% metastable Form-II crystal habit detected. Coriolis mass flow controller MFC-201 calibration drifted +18%, doubling water anti-solvent feed rate.",
            "full_text": """DEVIATION REPORT - PHARMACEUTICAL API MANUFACTURING
Deviation ID: DEV-2026-0522
Date of Occurrence: 2026-11-21
Manufacturing Site: Plant 1, Crystallization Suite A
Product: Paracetamol Fine Grade API (API Code: API-PCM-01)
Batch Number: PCM-2611-04
Manufacturing Stage: Stage 3 Anti-Solvent Crystallization
Equipment: Crystallizer CR-201, Mass Flow Controller MFC-201

INCIDENT SUMMARY:
During routine release testing of Batch PCM-2611-04, Powder X-Ray Diffraction (PXRD) analysis identified an uncharacteristic diffraction peak at 2θ = 12.1°, corresponding to 12% metastable Form-II polymorph (Specification requirement: 100% Monoclinic Form-I, Form-II absent). 

INVESTIGATION HIGHLIGHTS:
- Process parameters require controlled water anti-solvent dosing at 20 L/min into the ethanolic solution over 50 minutes.
- SCADA loss-in-weight logs from the water supply tank indicated that 500 kg of water was delivered in only 22 minutes (~45 L/min).
- The Mass Flow Controller MFC-201 indicated 20 L/min on the DCS display, concealing the over-dosing.
- Bench calibration of MFC-201 following the incident confirmed an internal electronic zero-offset and gain error of +18% following recent hot CIP sanitization.
- Seeding was completed at 38°C; high local supersaturation from rapid water dosing caused spontaneous secondary nucleation of the metastable Form-II polymorph."""
        },
        {
            "id": "sample-3",
            "title": "Azithromycin Dihydrate: Vacuum Drying OOS Residual Acetone & Low Cake Yield",
            "incident_number": "DEV-2026-0610",
            "product": "Azithromycin Dihydrate API",
            "batch": "AZM-2603-09",
            "stage": "Step-5 Rotary Vacuum Cone Drying (RCVD)",
            "equipment": "VCD-102 (Vacuum Cone Dryer)",
            "severity": "MAJOR",
            "snippet": "Batch AZM-2603-09 exhibited residual acetone of 7,200 ppm (ICH limit NMT 5,000 ppm) and 18% lower yield. Vacuum pump VP-102 mechanical seal blew nitrogen leak, elevating drying chamber pressure to 280 mbar.",
            "full_text": """DEVIATION REPORT - PHARMACEUTICAL API MANUFACTURING
Deviation ID: DEV-2026-0610
Date of Occurrence: 2026-11-22
Product: Azithromycin Dihydrate (API Code: API-AZM-02)
Batch Number: AZM-2603-09
Manufacturing Stage: Rotary Vacuum Cone Drying (RCVD)
Equipment: Rotary Vacuum Cone Dryer VCD-102, Dry Vacuum Pump VP-102

INCIDENT SUMMARY:
Following a 24-hour drying cycle at 40°C, QC headspace GC testing revealed Residual Acetone at 7,200 ppm, exceeding the ICH Q3C Class 3 limit of NMT 5,000 ppm. Total batch yield was 142 kg versus historical average of 174 kg.

OBSERVATIONS:
- Dryer chamber vacuum log demonstrated that chamber pressure degraded from < 20 mbar to 280 mbar midway through the drying cycle.
- Liquid nitrogen cold trap exhibited thermal warming due to coolant supply valve obstruction.
- Inspection of vacuum pump VP-102 shaft seal identified graphite seal ring fracture, allowing ambient air and nitrogen ingress.
- Loss of vacuum lowered the volatility gradient, preventing residual acetone desorption from the dihydrate crystal lattice."""
        }
    ]


# -------------------------------------------------------------
# Investigation CRUD Endpoints
# -------------------------------------------------------------
@app.get("/api/investigations", response_model=List[schemas.InvestigationSchema])
def list_investigations(db: Session = Depends(get_db)):
    """Retrieve all investigations ordered by updated date."""
    items = db.query(models.Investigation).order_by(models.Investigation.updated_at.desc()).all()
    return items


@app.get("/api/investigations/{inv_id}", response_model=schemas.InvestigationSchema)
def get_investigation(inv_id: str, db: Session = Depends(get_db)):
    """Retrieve single investigation with all related RCA trees, evidence, and CAPAs."""
    item = db.query(models.Investigation).filter(models.Investigation.id == inv_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return item


@app.post("/api/investigations", response_model=schemas.InvestigationSchema)
def create_investigation(data: schemas.InvestigationCreate, db: Session = Depends(get_db)):
    """Create a new investigation record with fishbone nodes, why chains, evidence, and CAPAs."""
    inv_id = f"INV-{uuid.uuid4().hex[:8].upper()}"

    db_inv = models.Investigation(
        id=inv_id,
        title=data.title,
        incident_number=data.incident_number,
        api_product_name=data.api_product_name,
        api_code=data.api_code,
        batch_number=data.batch_number,
        manufacturing_stage=data.manufacturing_stage,
        equipment_id=data.equipment_id,
        severity=data.severity,
        status=data.status,
        date_of_incident=data.date_of_incident,
        reported_by=data.reported_by,
        immediate_containment=data.immediate_containment,
        problem_description=data.problem_description,
        cqa_impacted=data.cqa_impacted,
        cpp_parameters=data.cpp_parameters,
        confirmed_root_cause=data.confirmed_root_cause,
        root_cause_category=data.root_cause_category,
        is_root_cause_confirmed=data.is_root_cause_confirmed,
        qp_review_notes=data.qp_review_notes,
        qp_signed_off=data.qp_signed_off,
        qp_signed_by=data.qp_signed_by,
        qp_signed_at=data.qp_signed_at,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_inv)

    # Add Fishbone nodes
    if data.fishbone_nodes:
        for node in data.fishbone_nodes:
            db_node = models.FishboneNode(
                id=f"FB-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                category=node.category,
                cause=node.cause,
                details=node.details,
                likelihood=node.likelihood,
                is_verified=node.is_verified,
                is_root_cause=node.is_root_cause,
                supporting_evidence=node.supporting_evidence
            )
            db.add(db_node)

    # Add 5 Whys
    if data.why_chains:
        for why in data.why_chains:
            db_why = models.WhyChain(
                id=f"WHY-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                level=why.level,
                question=why.question,
                answer=why.answer,
                evidence=why.evidence,
                verified=why.verified
            )
            db.add(db_why)

    # Add Evidence
    if data.evidence_items:
        for ev in data.evidence_items:
            db_ev = models.EvidenceItem(
                id=f"EV-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                title=ev.title,
                source=ev.source,
                status=ev.status,
                findings=ev.findings,
                is_gap=ev.is_gap
            )
            db.add(db_ev)

    # Add CAPA
    if data.capa_items:
        for capa in data.capa_items:
            db_capa = models.CapaItem(
                id=f"CAPA-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                action_type=capa.action_type,
                description=capa.description,
                rationale=capa.rationale,
                owner_department=capa.owner_department,
                target_date=capa.target_date,
                status=capa.status,
                effectiveness_check=capa.effectiveness_check
            )
            db.add(db_capa)

    # Create Initial Audit Log
    db_audit = models.AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:6].upper()}",
        investigation_id=inv_id,
        action="INVESTIGATION_CREATED",
        actor="QA_INVESTIGATOR",
        details="Initial investigation created with AI-populated evidence and RCA structure.",
        timestamp=datetime.utcnow()
    )
    db.add(db_audit)

    db.commit()
    db.refresh(db_inv)
    return db_inv


@app.put("/api/investigations/{inv_id}", response_model=schemas.InvestigationSchema)
def update_investigation(inv_id: str, data: schemas.InvestigationUpdate, db: Session = Depends(get_db)):
    """Update fields and child records of an investigation."""
    item = db.query(models.Investigation).filter(models.Investigation.id == inv_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found")

    update_dict = data.dict(exclude_unset=True)
    child_keys = {"fishbone_nodes", "why_chains", "evidence_items", "capa_items"}
    scalar_updates = {k: v for k, v in update_dict.items() if k not in child_keys}
    
    for field, val in scalar_updates.items():
        setattr(item, field, val)

    item.updated_at = datetime.utcnow()

    # Sync Fishbone Nodes if supplied
    if data.fishbone_nodes is not None:
        db.query(models.FishboneNode).filter(models.FishboneNode.investigation_id == inv_id).delete()
        for node in data.fishbone_nodes:
            db.add(models.FishboneNode(
                id=f"FB-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                category=node.category,
                cause=node.cause,
                details=node.details,
                likelihood=node.likelihood,
                is_verified=node.is_verified,
                is_root_cause=node.is_root_cause,
                supporting_evidence=node.supporting_evidence
            ))

    # Sync Why Chains if supplied
    if data.why_chains is not None:
        db.query(models.WhyChain).filter(models.WhyChain.investigation_id == inv_id).delete()
        for why in data.why_chains:
            db.add(models.WhyChain(
                id=f"WHY-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                level=why.level,
                question=why.question,
                answer=why.answer,
                evidence=why.evidence,
                verified=why.verified
            ))

    # Sync Evidence Items if supplied
    if data.evidence_items is not None:
        db.query(models.EvidenceItem).filter(models.EvidenceItem.investigation_id == inv_id).delete()
        for ev in data.evidence_items:
            db.add(models.EvidenceItem(
                id=f"EV-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                title=ev.title,
                source=ev.source,
                status=ev.status,
                findings=ev.findings,
                is_gap=ev.is_gap
            ))

    # Sync CAPA Items if supplied
    if data.capa_items is not None:
        db.query(models.CapaItem).filter(models.CapaItem.investigation_id == inv_id).delete()
        for capa in data.capa_items:
            db.add(models.CapaItem(
                id=f"CAPA-{uuid.uuid4().hex[:6].upper()}",
                investigation_id=inv_id,
                action_type=capa.action_type,
                description=capa.description,
                rationale=capa.rationale,
                owner_department=capa.owner_department,
                target_date=capa.target_date,
                status=capa.status,
                effectiveness_check=capa.effectiveness_check
            ))

    # Log update
    db_audit = models.AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:6].upper()}",
        investigation_id=inv_id,
        action="RECORD_UPDATED",
        actor="QA_INVESTIGATOR",
        details=f"Updated investigation fields and associated RCA/CAPA records.",
        timestamp=datetime.utcnow()
    )
    db.add(db_audit)

    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/investigations/{inv_id}")
def delete_investigation(inv_id: str, db: Session = Depends(get_db)):
    """Delete an investigation record."""
    item = db.query(models.Investigation).filter(models.Investigation.id == inv_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    db.delete(item)
    db.commit()
    return {"message": f"Investigation {inv_id} deleted successfully"}


@app.post("/api/investigations/{inv_id}/sign-off", response_model=schemas.InvestigationSchema)
def qp_sign_off(
    inv_id: str,
    qp_name: str = Form(...),
    notes: str = Form(""),
    db: Session = Depends(get_db)
):
    """Qualified Person (QP) regulatory review and sign-off per EU Annex 16 / 21 CFR 211."""
    item = db.query(models.Investigation).filter(models.Investigation.id == inv_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found")

    item.qp_signed_off = True
    item.qp_signed_by = qp_name
    item.qp_signed_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    item.qp_review_notes = notes
    item.status = "CAPA_DEFINED"
    item.updated_at = datetime.utcnow()

    db_audit = models.AuditLog(
        id=f"LOG-{uuid.uuid4().hex[:6].upper()}",
        investigation_id=inv_id,
        action="QP_REGULATORY_SIGNOFF",
        actor="QUALIFIED_PERSON",
        details=f"Qualified Person {qp_name} formally reviewed and approved RCA and CAPA plan.",
        timestamp=datetime.utcnow()
    )
    db.add(db_audit)

    db.commit()
    db.refresh(item)
    return item


# -------------------------------------------------------------
# Mount Frontend Static Assets for Unified Delivery
# -------------------------------------------------------------
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

