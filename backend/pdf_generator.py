import io
from typing import List, Dict, Any
from fpdf import FPDF
from datetime import datetime, timezone

class AnalysisPDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 16)
        self.set_text_color(184, 184, 176) # Gold-ish / Silver-ish from theme
        self.cell(0, 10, "ResuMap Analysis Report", ln=True, align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()} | Generated on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", align="C")

def generate_analysis_pdf(data: Dict[str, Any]) -> bytes:
    """
    Generates a professional PDF report for a resume analysis.

    Data expected:
      - job_title: str
      - match_score: float
      - verdict: str
      - missing_skills: List[str]
      - recommendations: List[Dict]
    """
    pdf = AnalysisPDF()
    pdf.add_page()

    # --- Summary Section ---
    pdf.set_font("helvetica", "B", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, f"Target Role: {data.get('job_title', 'N/A')}", ln=True)

    # Score Bubble
    pdf.ln(5)
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 20, f"Match Score: {data.get('match_score', 0)}%", ln=True, align="C")

    # Verdict
    pdf.ln(5)
    pdf.set_font("helvetica", "I", 12)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 10, f"Verdict: {data.get('verdict', 'No verdict provided.')}", align="C")

    pdf.ln(10)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(10)

    # --- Missing Skills Section ---
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, "Critical Skill Gaps", ln=True)

    pdf.set_font("helvetica", "", 11)
    missing = data.get('missing_skills', [])
    if missing:
        for skill in missing:
            pdf.cell(5)
            pdf.cell(0, 8, f"- {skill}", ln=True)
    else:
        pdf.cell(0, 8, "No critical skill gaps identified!", ln=True)

    pdf.ln(10)

    # --- Recommendations Section ---
    pdf.set_font("helvetica", "B", 14)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, "Tailored Recommendations", ln=True)
    pdf.ln(5)

    recs = data.get('recommendations', [])
    if recs:
        for rec in recs:
            # Recommendation Header
            pdf.set_font("helvetica", "B", 11)
            priority = rec.get('priority', 'medium').capitalize()
            rec_type = rec.get('type', 'gap').capitalize()

            # Priority color coding (simple)
            if priority == "High":
                pdf.set_text_color(200, 0, 0)
            else:
                pdf.set_text_color(0, 0, 0)

            pdf.cell(0, 8, f"[{priority} Priority] {rec_type}:", ln=True)

            # Recommendation Body
            pdf.set_font("helvetica", "", 11)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 7, rec.get('text', ''))

            # Action Item
            pdf.set_font("helvetica", "I", 10)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 7, f"Suggested Action: {rec.get('action', '')}", ln=True)

            pdf.ln(4)
            pdf.line(10, pdf.get_y(), 100, pdf.get_y())
            pdf.ln(5)
    else:
        pdf.set_font("helvetica", "", 11)
        pdf.cell(0, 8, "No specific recommendations at this time.", ln=True)

    # Output to bytes
    pdf_output = pdf.output()
    if isinstance(pdf_output, str): # Older fpdf2 versions might return string
        return pdf_output.encode('latin-1')
    return pdf_output
