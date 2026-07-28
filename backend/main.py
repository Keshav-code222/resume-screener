"""
ResuMap — unified FastAPI backend.

Single entry point that exposes:
  - Public anonymous scan:    POST /scan
  - Auth:                     POST /api/auth/signup, /api/auth/login
  - User:                     GET  /api/users/me
  - Resumes:                  GET  /api/resumes, POST /api/resumes/upload
  - Analyses:                 POST /api/analyses, GET /api/analyses/{id}
  - Health:                   GET  /

Run locally:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
import io
import json
import os
import uuid
from contextlib import asynccontextmanager
from typing import List

import pdfplumber
from dotenv import load_dotenv
from fastapi import (
    APIRouter, Depends, FastAPI, File, Form, HTTPException, UploadFile, status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ai import analyze_resume
from auth.dependencies import get_current_user
from auth.utils import create_access_token, get_password_hash, verify_password
from database import get_db, init_db
from models import Resume, ResumeAnalysis, Subscription, User
from resume_parser import extract_skills
from schemas import (
    Recommendation, ResumeUploadResponse, Token, UserCreate, UserOut,
)

load_dotenv()


# ---------------------------------------------------------------------------
# App + lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def _lifespan(_app: FastAPI):  # noqa: ARG001
    # Create tables if they don't exist (safe to call repeatedly).
    try:
        init_db()
    except Exception as exc:  # pragma: no cover
        # Log but don't crash — endpoints that don't need the DB still work.
        print(f"[startup] init_db failed: {exc}")
    yield


app = FastAPI(
    title="ResuMap — AI Resume Screener",
    version="2.0.0",
    description="Unified backend: auth, resume storage, AI scan.",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_RESUME_EXT = {".pdf", ".docx"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


# ---------------------------------------------------------------------------
# Public anonymous scan (no auth) — used by the legacy /scan and the
# "Try without signup" flow.
# ---------------------------------------------------------------------------
public_router = APIRouter()


@public_router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Anonymous single-shot scan. Returns AI analysis only — does not save."""
    if not file.filename or not any(
        file.filename.lower().endswith(ext) for ext in ALLOWED_RESUME_EXT
    ):
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are allowed"
        )

    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File too large (max 10MB)")

        if file.filename.lower().endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                resume_text = "".join(
                    (page.extract_text() or "") for page in pdf.pages
                )
        else:  # .docx
            from docx import Document
            doc = Document(io.BytesIO(content))
            resume_text = "\n".join(p.text for p in doc.paragraphs)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"File extraction failed: {exc}"
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the file. It may be image-only.",
        )

    try:
        result = analyze_resume(resume_text, job_description)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {exc}")

    return result


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


@auth_router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.flush()  # populate user.id

    # Free-tier subscription by default.
    db.add(Subscription(user_id=user.id, plan_type="free"))

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user_id=str(user.id))


@auth_router.post("/login", response_model=Token)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user_id=str(user.id))


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
user_router = APIRouter(prefix="/api/users", tags=["user"])


@user_router.get("/me", response_model=UserOut)
def get_me(current: User = Depends(get_current_user)):
    return current


# ---------------------------------------------------------------------------
# Resumes
# ---------------------------------------------------------------------------
resume_router = APIRouter(prefix="/api/resumes", tags=["resumes"])


def _store_file(user_id: str, original_filename: str, content: bytes) -> str:
    """Persist an upload and return its on-disk path."""
    ext = os.path.splitext(original_filename)[1].lower() or ".pdf"
    safe_name = f"{user_id}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, safe_name)
    with open(path, "wb") as fh:
        fh.write(content)
    return path


def _extract_text(filename: str, content: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "".join((page.extract_text() or "") for page in pdf.pages)
    if filename.lower().endswith(".docx"):
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    raise HTTPException(status_code=400, detail="Unsupported file type")


@resume_router.get("", response_model=List[dict])
def list_resumes(
    current: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    rows = (
        db.query(Resume)
        .filter(Resume.user_id == current.id)
        .order_by(Resume.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "file_name": r.file_name,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@resume_router.post(
    "/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED
)
async def upload_resume(
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not any(
        file.filename.lower().endswith(ext) for ext in ALLOWED_RESUME_EXT
    ):
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are allowed"
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    try:
        text = _extract_text(file.filename, content)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {exc}")

    skills = extract_skills(text)
    path = _store_file(str(current.id), file.filename, content)

    # Mark previous resumes as not current.
    db.query(Resume).filter(
        Resume.user_id == current.id, Resume.is_current.is_(True)
    ).update({Resume.is_current: False})

    resume = Resume(
        user_id=current.id,
        file_name=file.filename,
        file_path=path,
        raw_text=text,
        is_current=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeUploadResponse(
        resume_id=str(resume.id),
        skills=skills,
        word_count=len(text.split()),
    )


# ---------------------------------------------------------------------------
# Analyses
# ---------------------------------------------------------------------------
analysis_router = APIRouter(prefix="/api/analyses", tags=["analyses"])


def _to_recommendations(suggestions: List[str]) -> List[Recommendation]:
    return [
        Recommendation(
            type="content", priority="high", text=s, action="Update resume"
        )
        for s in suggestions
    ]


@analysis_router.post("", status_code=status.HTTP_201_CREATED)
def create_analysis(
    payload: dict,  # {"resume_id", "job_title", "job_description"}
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_id = payload.get("resume_id")
    job_title = payload.get("job_title", "")
    job_description = payload.get("job_description", "")

    if not resume_id or not job_description:
        raise HTTPException(
            status_code=400,
            detail="resume_id and job_description are required",
        )

    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        result = analyze_resume(resume.raw_text or "", job_description)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {exc}")

    score = float(result.get("overall_score", 0) or 0)
    missing = result.get("missing_keywords", []) or []
    suggestions = result.get("top_suggestions", []) or []
    recommendations = _to_recommendations(suggestions)
    verdict = result.get("verdict", "")

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        job_title=job_title,
        job_description=job_description,
        match_score=score,
        missing_skills=missing,
        recommendations=[r.model_dump() for r in recommendations],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "analysis_id": str(analysis.id),
        "resume_id": str(resume.id),
        "job_title": job_title,
        "match_score": score,
        "missing_skills": missing,
        "recommendations": [r.model_dump() for r in recommendations],
        "verdict": verdict,
        "created_at": analysis.generated_at.isoformat() if analysis.generated_at else None,
    }


@analysis_router.get("")
def list_analyses(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all analyses owned by the current user (most recent first)."""
    rows = (
        db.query(ResumeAnalysis)
        .join(Resume, ResumeAnalysis.resume_id == Resume.id)
        .filter(Resume.user_id == current.id)
        .order_by(ResumeAnalysis.generated_at.desc())
        .all()
    )

    def _maybe_load(value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return value
        return value

    return [
        {
            "id": str(a.id),
            "resume_id": str(a.resume_id),
            "job_title": a.job_title,
            "match_score": float(a.match_score or 0),
            "missing_skills": _maybe_load(a.missing_skills) or [],
            "recommendations": _maybe_load(a.recommendations) or [],
            "generated_at": a.generated_at.isoformat() if a.generated_at else None,
        }
        for a in rows
    ]


@analysis_router.get("/{analysis_id}")
def get_analysis(
    analysis_id: str,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(ResumeAnalysis)
        .join(Resume, ResumeAnalysis.resume_id == Resume.id)
        .filter(
            ResumeAnalysis.id == analysis_id, Resume.user_id == current.id
        )
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    def _maybe_load(value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return value
        return value

    return {
        "id": str(analysis.id),
        "resume_id": str(analysis.resume_id),
        "job_title": analysis.job_title,
        "job_description": analysis.job_description,
        "match_score": float(analysis.match_score or 0),
        "missing_skills": _maybe_load(analysis.missing_skills) or [],
        "recommendations": _maybe_load(analysis.recommendations) or [],
        "verdict": None,
        "generated_at": analysis.generated_at.isoformat() if analysis.generated_at else None,
    }


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "service": "ResuMap API",
        "version": app.version,
        "status": "ok",
        "endpoints": [
            "POST /scan",
            "POST /api/auth/signup",
            "POST /api/auth/login",
            "GET  /api/users/me",
            "GET  /api/resumes",
            "POST /api/resumes/upload",
            "POST /api/analyses",
            "GET  /api/analyses/{id}",
        ],
    }


app.include_router(public_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(resume_router)
app.include_router(analysis_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
