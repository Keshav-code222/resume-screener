import pdfplumber
import io
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

# We only need the AI analysis function now
from ai import analyze_resume

router = APIRouter()

@router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # 1. Check if the file is a PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 2. Extract Text from PDF
    try:
        pdf_bytes = await file.read()
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            resume_text = "".join([page.extract_text() or "" for page in pdf.pages])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF. It might be an image scan.")

    # 3. AI Analysis (Calling your Groq/AI logic)
    try:
        result = analyze_resume(resume_text, job_description)
        return result
    except Exception as e:
        # This catches any issues with your AI prompt or API keys
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")