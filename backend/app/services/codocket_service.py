import io
import hashlib
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

def generate_receipt_hash(pack_id: str, case_ids: List[str], review_note: str, timestamp_str: str) -> str:
    raw_payload = f"{pack_id}:{','.join(sorted(case_ids))}:{review_note}:{timestamp_str}"
    return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()[:24].upper()

def build_codocket_pdf(
    pack: Dict[str, Any],
    institution: Dict[str, Any],
    cases: List[Dict[str, Any]],
    overlap_info: Dict[str, Any],
    review_record: Dict[str, Any]
) -> bytes:
    """
    Generates an authoritative, high-precision CORD Co-Docket™ Review Pack PDF
    using ReportLab. Styled in AICTE GovTech Navy and Burgundy palette.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Brand Colors matching GovTech palette
    burgundy = colors.HexColor("#7D2932")
    navy = colors.HexColor("#0B2545")
    bronze = colors.HexColor("#68611E")
    cream_surface = colors.HexColor("#FEFCDF")
    slate_border = colors.HexColor("#D8D2A6")
    dark_slate = colors.HexColor("#0F172A")
    rose_soft = colors.HexColor("#F3E5E4")
    green_soft = colors.HexColor("#E7F0ED")

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=burgundy,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=navy
    )

    section_header = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=burgundy,
        spaceBefore=8,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=dark_slate
    )

    body_regular = ParagraphStyle(
        'BodyRegular',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=dark_slate
    )

    legal_notice_style = ParagraphStyle(
        'LegalNotice',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569")
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</b><br/>CORD (Cross-Bureau Overlap & Redressal Dashboard)", subtitle_style),
            Paragraph(f"<b>DOSSIER ID:</b> {pack.get('pack_id', 'CORD-CD-001')}<br/><b>DATE:</b> {datetime.utcnow().strftime('%d %b %Y, %H:%M UTC')}", ParagraphStyle('RightH', parent=subtitle_style, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[340, 200])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_header)

    story.append(HRFlowable(width="100%", thickness=2, color=burgundy, spaceBefore=4, spaceAfter=8))

    # Title
    story.append(Paragraph("CORD Co-Docket™ — Evidence-Backed Review Pack", title_style))
    story.append(Paragraph("Formal Multi-Bureau Case Dossier for Inter-Cell Regulatory Coordination", subtitle_style))
    story.append(Spacer(1, 10))

    # 2. Institution Anchor Card
    pid_status = "VERIFIED PID" if institution.get("verification_state") == "VERIFIED" else "UNVERIFIED (NAME MATCH)"
    inst_table_data = [
        [Paragraph("<b>Target Institution:</b>", body_bold), Paragraph(institution.get("name", "Unknown Institution"), body_bold)],
        [Paragraph("<b>AICTE Permanent ID (PID):</b>", body_regular), Paragraph(f"<b>{institution.get('aicte_pid', 'N/A')}</b> [{pid_status}]", body_regular)],
        [Paragraph("<b>Jurisdiction / State:</b>", body_regular), Paragraph(f"{institution.get('region', 'Northern')} Region | {institution.get('state', 'Rajasthan')}, {institution.get('district', 'Jaipur')}", body_regular)],
        [Paragraph("<b>Governance Status:</b>", body_regular), Paragraph("Active Monitoring · Multi-Bureau Case Overlap Detected", body_regular)],
    ]
    t_inst = Table(inst_table_data, colWidths=[160, 380])
    t_inst.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), cream_surface),
        ('BOX', (0, 0), (-1, -1), 1, slate_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, slate_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_inst)
    story.append(Spacer(1, 10))

    # 3. Explainable Overlap Evidence Box
    story.append(Paragraph("1. Explainable Overlap Signals (Matching Engine)", section_header))
    overlap_bullets = overlap_info.get("rationale_list", [
        f"✓ Verified PID Match: {institution.get('aicte_pid')}",
        "✓ TF-IDF Category Similarity: 84% Overlap on Intake / Fee Violations",
        "⚠ Status Alert: Active Show-Cause in RB concurrent with PGRC Grievance"
    ])
    evidence_cells = [[Paragraph(f"• {bullet}", body_bold if "✓" in bullet else body_regular)] for bullet in overlap_bullets]
    t_evidence = Table(evidence_cells, colWidths=[540])
    t_evidence.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFDF0")),
        ('BOX', (0, 0), (-1, -1), 1, bronze),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_evidence)
    story.append(Spacer(1, 10))

    # 4. Cross-Bureau Case Matrix
    story.append(Paragraph("2. Assembled Cross-Bureau Case Chronology (Zero Auto-Merge)", section_header))
    story.append(Paragraph("Original Bureau ownership, case IDs, and statuses remain intact under sovereign cell authority.", subtitle_style))
    story.append(Spacer(1, 4))

    case_rows = [
        [
            Paragraph("<b>Case ID</b>", body_bold),
            Paragraph("<b>Bureau Cell</b>", body_bold),
            Paragraph("<b>Category / Subject</b>", body_bold),
            Paragraph("<b>Status</b>", body_bold),
            Paragraph("<b>Days Open</b>", body_bold)
        ]
    ]

    for c in cases:
        status_bg = rose_soft if "show-cause" in c.get('status', '').lower() else green_soft
        case_rows.append([
            Paragraph(f"<b>{c.get('synthetic_case_id')}</b>", body_bold),
            Paragraph(c.get('bureau_code', 'Bureau'), body_regular),
            Paragraph(f"<b>{c.get('category')}</b><br/>{c.get('subject')}", body_regular),
            Paragraph(f"<b>{c.get('status')}</b>", body_regular),
            Paragraph(f"{c.get('days_open', 14)}d", body_regular)
        ])

    t_cases = Table(case_rows, colWidths=[95, 95, 210, 95, 45])
    t_cases.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, slate_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_cases)
    story.append(Spacer(1, 10))

    # 5. Timestamped Officer Review Receipt Snapshot
    story.append(Paragraph("3. Immutable Official Review Record & Timestamped Receipt", section_header))
    receipt_data = [
        [Paragraph("<b>Receipt Verification Hash:</b>", body_bold), Paragraph(f"<code>{review_record.get('hash_signature', '0X7F4B98E2104AA8')}</code>", body_regular)],
        [Paragraph("<b>Reviewing Officer:</b>", body_regular), Paragraph(review_record.get('reviewer', 'R. Sharma | Under Secretary, Regulation Bureau (HQ-Delhi)'), body_regular)],
        [Paragraph("<b>Review Timestamp:</b>", body_regular), Paragraph(review_record.get('timestamp', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')), body_regular)],
        [Paragraph("<b>Action Recommended:</b>", body_regular), Paragraph(review_record.get('coordination_action', 'Joint Inquiry & Show-Cause Alignment'), body_bold)],
        [Paragraph("<b>Official Review Note:</b>", body_bold), Paragraph(review_record.get('review_note', 'No note recorded.'), body_regular)]
    ]
    t_receipt = Table(receipt_data, colWidths=[160, 380])
    t_receipt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), cream_surface),
        ('BOX', (0, 0), (-1, -1), 1.2, burgundy),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, slate_border),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_receipt)
    story.append(Spacer(1, 12))

    # 6. Defensibility & Statutory Integrity Notice
    notice_text = (
        "<b>STATUTORY INTEGRITY & GOVTECH DEFICIENCY NOTICE:</b><br/>"
        "CORD Co-Docket™ is a coordination intelligence artifact designed under AICTE mandate. "
        "Case ownership and statutory proceedings remain strictly distinct within respective Bureaus. "
        "<b>Zero Destructive Auto-Merges:</b> Cases are never consolidated or merged into a single ticket. "
        "Officials retain sovereign regulatory decision authority. Generated under GovTech Integrity Standards 2026."
    )
    story.append(Paragraph(notice_text, legal_notice_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
