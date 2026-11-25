import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_path = os.path.join(os.path.dirname(__file__), "DEV-2026-0418_Atorvastatin_OOS_Impurity.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#1e293b'),
        alignment=1 # Center
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
        alignment=1 # Center
    )
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    story = []

    # Header
    story.append(Paragraph("<b>GLOBAL PHARMACEUTICAL MANUFACTURING & QUALITY ASSURANCE</b>", title_style))
    story.append(Paragraph("Active Pharmaceutical Ingredient (API) Division • GxP Deviation Report", subtitle_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=10))

    # Metadata Table
    meta_data = [
        [Paragraph("<b>Deviation Number:</b>", body_style), Paragraph("DEV-2026-0418", body_style),
         Paragraph("<b>Date of Occurrence:</b>", body_style), Paragraph("2026-11-20", body_style)],
        [Paragraph("<b>Product Name:</b>", body_style), Paragraph("Atorvastatin Calcium Trihydrate", body_style),
         Paragraph("<b>API Code:</b>", body_style), Paragraph("API-ATC-03", body_style)],
        [Paragraph("<b>Batch Number:</b>", body_style), Paragraph("ATC260901", body_style),
         Paragraph("<b>Batch Size:</b>", body_style), Paragraph("200.0 kg (Nominal)", body_style)],
        [Paragraph("<b>Manufacturing Stage:</b>", body_style), Paragraph("Step-4 Condensation & Crystallization", body_style),
         Paragraph("<b>Critical Equipment:</b>", body_style), Paragraph("Glass-Lined Reactor GLR-103", body_style)],
        [Paragraph("<b>Severity Rating:</b>", body_style), Paragraph("<font color='#dc2626'><b>CRITICAL (CQA Impact)</b></font>", body_style),
         Paragraph("<b>Reported By:</b>", body_style), Paragraph("Dr. Sarah Jenkins (QC Lead)", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[110, 160, 110, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Section 1: Incident Description
    story.append(Paragraph("1. INCIDENT DESCRIPTION & PROBLEM STATEMENT", section_heading))
    desc_p1 = (
        "On November 20, 2026 at 03:22 AM during the critical cooling crystallization operation of Atorvastatin Calcium "
        "Batch ATC260901 in reactor GLR-103, SCADA temperature telemetry recorded an abrupt, uncontrolled thermal drop "
        "from 45.0°C to 15.0°C within 90 minutes (cooling rate of ~3.1°C/min). The registered manufacturing recipe SOP-API-CR-02 "
        "specifies a strictly controlled linear cooling ramp of 1.2 - 1.5°C/min over 4 hours to avoid unseeded spontaneous supersaturation."
    )
    desc_p2 = (
        "Subsequent analytical release testing performed by Quality Control under Certificate of Analysis CoA-ATC-260901-01 "
        "identified an Out-of-Specification (OOS) result for Related Substance Impurity C at 0.28% w/w, exceeding the registered "
        "ICH Q7 specification limit of Not More Than (NMT) 0.15% w/w. All other release attributes (Assay 99.1%, KF Moisture 4.2%, "
        "Residual Solvents: Acetone 420 ppm) were conforming."
    )
    story.append(Paragraph(desc_p1, body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(desc_p2, body_style))
    story.append(Spacer(1, 10))

    # Section 2: Critical Process Parameters and CQA Evaluation
    story.append(Paragraph("2. IMPACTED CQAs AND PROCESS PARAMETERS", section_heading))
    param_data = [
        [Paragraph("<b>Parameter / Attribute</b>", body_style), Paragraph("<b>Validated Specification</b>", body_style),
         Paragraph("<b>Observed Value</b>", body_style), Paragraph("<b>Disposition</b>", body_style)],
        [Paragraph("Related Substance Impurity C", body_style), Paragraph("NMT 0.15% w/w", body_style),
         Paragraph("0.28% w/w", body_style), Paragraph("<font color='#dc2626'><b>OOS / Non-conforming</b></font>", body_style)],
        [Paragraph("Crystallization Cooling Ramp", body_style), Paragraph("1.2 - 1.5 °C/min (4 hrs)", body_style),
         Paragraph("3.1 °C/min (1.5 hrs)", body_style), Paragraph("<font color='#dc2626'><b>Process Excursion</b></font>", body_style)],
        [Paragraph("HPLC Assay (Dry Basis)", body_style), Paragraph("98.0 - 102.0%", body_style),
         Paragraph("99.1%", body_style), Paragraph("Conforming", body_style)],
        [Paragraph("Residual Acetone (GC-HS)", body_style), Paragraph("NMT 5000 ppm", body_style),
         Paragraph("420 ppm", body_style), Paragraph("Conforming", body_style)],
        [Paragraph("Water Content (Karl Fischer)", body_style), Paragraph("3.5 - 5.5% w/w", body_style),
         Paragraph("4.2% w/w", body_style), Paragraph("Conforming", body_style)],
    ]
    param_table = Table(param_data, colWidths=[150, 130, 130, 130])
    param_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(param_table)
    story.append(Spacer(1, 10))

    # Section 3: Immediate Containment Actions
    story.append(Paragraph("3. IMMEDIATE CONTAINMENT ACTIONS TAKEN", section_heading))
    containment_text = (
        "1. Immediate physical quarantine of Batch ATC260901 with QA Hold Tags applied at the isolation suite.<br/>"
        "2. Downstream centrifugation and vacuum drying equipment (CF-202, RCVD-101) locked out from further production.<br/>"
        "3. Mother liquor and wet cake composite samples secured and submitted for orthogonal LC-MS structural profiling.<br/>"
        "4. Upstream synthetic intermediates (KSM-1 and KSM-2 lots) held at ambient storage under nitrogen blanket."
    )
    story.append(Paragraph(containment_text, body_style))
    story.append(Spacer(1, 10))

    # Section 4: Preliminary Investigation & Physical Findings
    story.append(Paragraph("4. PRELIMINARY INVESTIGATION & ENGINEERING FINDINGS", section_heading))
    findings_text = (
        "• <b>Cooling Control Valve FCV-103B:</b> Maintenance instrumentation technicians inspected the secondary coolant loop. "
        "Pneumatic valve positioner registered 100% full-open travel despite DCS control output calling for 25% modulation. "
        "Subsequent physical disassembly revealed a circumferential micro-tear in the pneumatic return diaphragm.<br/>"
        "• <b>Raw Material Verification:</b> Key Starting Material Lot KSM-2-8841 was independently re-tested by QC; "
        "purity was verified at 99.4% with zero uncharacteristic impurity precursor peaks.<br/>"
        "• <b>Chromatography System Suitability:</b> HPLC run sequence QC-HPLC-20261120 met all USP compliance criteria "
        "(RSD < 1.0%, tailing factor 1.1, resolution between main peak and Impurity C = 2.4)."
    )
    story.append(Paragraph(findings_text, body_style))
    story.append(Spacer(1, 15))

    # Signature Block
    sig_data = [
        [Paragraph("<b>Investigator / QA Specialist:</b>", body_style), Paragraph("Sarah Jenkins, Ph.D.", body_style),
         Paragraph("<b>Date:</b>", body_style), Paragraph("2026-11-20", body_style)],
        [Paragraph("<b>Head of API Manufacturing:</b>", body_style), Paragraph("David Kowalski, P.E.", body_style),
         Paragraph("<b>Date:</b>", body_style), Paragraph("2026-11-20", body_style)],
        [Paragraph("<b>Qualified Person (QP) / QA Director:</b>", body_style), Paragraph("Pending Formal RCA Review", body_style),
         Paragraph("<b>Status:</b>", body_style), Paragraph("UNDER INVESTIGATION", body_style)],
    ]
    sig_table = Table(sig_data, colWidths=[140, 160, 80, 160])
    sig_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94a3b8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
    ]))
    story.append(sig_table)

    doc.build(story)
    print(f"Generated sample PDF at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf()
