import pdfplumber
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ai import analyze_resume

router = APIRouter()

@router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Check if file is a PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Extract text from PDF
    pdf_bytes = await file.read()
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        resume_text = ""
        for page in pdf.pages:
            resume_text += page.extract_text() or ""

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Analyze with Claude
    result = analyze_resume(resume_text, job_description)

    return result