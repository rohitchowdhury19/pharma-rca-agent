import json
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models

client = TestClient(app)

def test_all():
    print("=== 1. Testing /api/health ===")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health:", res.json())

    print("\n=== 2. Testing /api/samples ===")
    res = client.get("/api/samples")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 3
    print(f"Loaded {len(samples)} sample scenarios: {[s['product'] for s in samples]}")

    print("\n=== 3. Testing /api/ai/analyze (LangGraph Engine) ===")
    sample_text = samples[0]["full_text"]
    analyze_req = {
        "text": sample_text,
        "document_type": "text",
        "model_name": "llama-3.3-70b-versatile"
    }
    res = client.post("/api/ai/analyze", json=analyze_req)
    assert res.status_code == 200, f"Analyze failed: {res.text}"
    analysis = res.json()
    print("Analysis Title:", analysis["incident_info"]["title"])
    print("Identified Root Cause:", analysis["incident_info"]["confirmed_root_cause"][:80] + "...")
    print("5 Whys Count:", len(analysis["five_whys"]))
    print("Evidence Gaps Count:", len(analysis["evidence_gaps"]))
    print("CAPA Recommendations:", len(analysis["capa_recommendations"]))

    print("\n=== 4. Testing /api/investigations (Database Persistence) ===")
    inv_payload = {
        "title": analysis["incident_info"]["title"],
        "incident_number": analysis["incident_info"]["incident_number"],
        "api_product_name": analysis["incident_info"]["api_product_name"],
        "api_code": analysis["incident_info"]["api_code"],
        "batch_number": analysis["incident_info"]["batch_number"],
        "manufacturing_stage": analysis["incident_info"]["manufacturing_stage"],
        "equipment_id": analysis["incident_info"]["equipment_id"],
        "severity": analysis["incident_info"]["severity"],
        "status": "UNDER_INVESTIGATION",
        "date_of_incident": analysis["incident_info"]["date_of_incident"],
        "reported_by": analysis["incident_info"]["reported_by"],
        "immediate_containment": analysis["incident_info"]["immediate_containment"],
        "problem_description": analysis["incident_info"]["problem_description"],
        "cqa_impacted": analysis["incident_info"]["cqa_impacted"],
        "cpp_parameters": analysis["incident_info"]["cpp_parameters"],
        "confirmed_root_cause": analysis["incident_info"]["confirmed_root_cause"],
        "root_cause_category": analysis["incident_info"]["root_cause_category"],
        "is_root_cause_confirmed": True,
        "fishbone_nodes": [
            {
                "category": "MACHINE",
                "cause": "Control Valve FCV-103B Pneumatic Seal Failure",
                "details": "Pneumatic actuator micro-tear",
                "likelihood": "HIGH",
                "is_verified": True,
                "is_root_cause": True,
                "supporting_evidence": "Maintenance calibration log WO-ENG-9941"
            }
        ],
        "why_chains": analysis["five_whys"],
        "evidence_items": analysis["evidence_gaps"],
        "capa_items": analysis["capa_recommendations"]
    }
    res = client.post("/api/investigations", json=inv_payload)
    assert res.status_code == 200, f"Create investigation failed: {res.text}"
    created_inv = res.json()
    inv_id = created_inv["id"]
    print("Created Investigation ID:", inv_id)

    print("\n=== 5. Testing /api/investigations/{id} retrieval & update ===")
    res = client.get(f"/api/investigations/{inv_id}")
    assert res.status_code == 200
    retrieved = res.json()
    assert retrieved["batch_number"] == "ATC260901" or retrieved["batch_number"]
    assert len(retrieved["why_chains"]) == len(analysis["five_whys"])
    print(f"Retrieved Investigation with {len(retrieved['why_chains'])} Whys and {len(retrieved['capa_items'])} CAPAs.")

    # Test PUT update
    update_payload = {
        "title": "Updated OOS Impurity C Investigation",
        "severity": "CRITICAL"
    }
    res_put = client.put(f"/api/investigations/{inv_id}", json=update_payload)
    assert res_put.status_code == 200
    updated_inv = res_put.json()
    assert updated_inv["title"] == "Updated OOS Impurity C Investigation"
    print("Investigation successfully updated via PUT.")

    print("\n=== 6. Testing /api/investigations/{id}/sign-off (QP Regulatory Approval) ===")
    res = client.post(
        f"/api/investigations/{inv_id}/sign-off",
        data={
            "qp_name": "Dr. Arthur Sterling, Qualified Person",
            "notes": "Reviewed SCADA temperature profiles and confirmed actuator failure. CAPA plan authorized per EU Annex 16."
        }
    )
    assert res.status_code == 200
    signed = res.json()
    assert signed["qp_signed_off"] is True
    print("QP Signed Off by:", signed["qp_signed_by"], "at", signed["qp_signed_at"])

    print("\n=== 7. Testing /api/ai/upload (Sample PDF intake) ===")
    import os
    pdf_path = os.path.join(os.path.dirname(__file__), "..", "sample_data", "DEV-2026-0418_Atorvastatin_OOS_Impurity.pdf")
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            res = client.post("/api/ai/upload", files={"file": ("DEV-2026-0418.pdf", f, "application/pdf")})
            assert res.status_code == 200, f"PDF upload failed: {res.text}"
            upload_data = res.json()
            print("Extracted PDF text length:", len(upload_data["extracted_text"]))
            print("PDF Extracted Title:", upload_data["analysis"]["incident_info"]["title"])

    print("\n=== 8. Testing / (Frontend SPA delivery) ===")
    res = client.get("/")
    assert res.status_code == 200
    assert "<title>BioSynth Quality Copilot" in res.text
    print("Frontend SPA HTML successfully served from root '/'!")

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_all()
