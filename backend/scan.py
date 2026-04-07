import pdfplumber
import io
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import get_current_user
from models import User, Scan
from ai import analyze_resume

router = APIRouter()

@router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Extract Text
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    pdf_bytes = await file.read()
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        resume_text = "".join([page.extract_text() or "" for page in pdf.pages])

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text")

    # 2. AI Analysis
    result = analyze_resume(resume_text, job_description)

    # 3. Save to Database
    new_scan = Scan(
        user_id=current_user.id,
        job_description=job_description[:500], 
        analysis_result=json.dumps(result) # Convert dict to string for DB
    )
    db.add(new_scan)
    db.commit()

    return result