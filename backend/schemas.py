"""
Pydantic request/response models for the unified API.
"""
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr


# ----- Auth -----
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[str] = None


# ----- Resumes -----
class ResumeOut(BaseModel):
    id: str
    file_name: Optional[str] = None
    created_at: Any
    skills: List[str] = []
    word_count: int = 0

    class Config:
        from_attributes = True


class ResumeUploadResponse(BaseModel):
    resume_id: str
    skills: List[str] = []
    word_count: int = 0


# ----- Analyses -----
class Recommendation(BaseModel):
    type: str # "strength", "gap", "action"
    priority: str # "low", "medium", "high"
    text: str
    action: Optional[str] = None


class CreateAnalysisRequest(BaseModel):
    resume_id: str
    job_title: str
    job_description: str


class CompareAnalysesRequest(BaseModel):
    """Body for POST /api/analyses/compare — 2-6 analysis ids the current
    user owns. Returns a side-by-side view (scores + per-role missing-skill
    matrix) for the Dashboard history comparison panel."""
    analysis_ids: List[str]


class AnalysisOut(BaseModel):
    analysis_id: Optional[str] = None
    resume_id: Optional[str] = None
    job_title: Optional[str] = None
    match_score: float
    missing_skills: List[str] = []
    recommendations: List[Recommendation] = []
    verdict: Optional[str] = None
    created_at: Optional[Any] = None

    class Config        :
        from_attributes = True


# ----- Public scan -----
class PublicScanRequest(BaseModel):
    """Body for the unauthenticated /scan endpoint (multipart uses Form()).
    Kept here for documentation; the real endpoint reads from a form upload.
    """
    pass


# ----- Password reset -----
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
