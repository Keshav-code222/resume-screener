import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal, init_db
from models import User, Resume, ResumeAnalysis
from auth.utils import create_access_token

client = TestClient(app)

def setup_module():
    init_db()

@pytest.fixture
def auth_header():
    db = SessionLocal()
    email = f"test_{uuid.uuid4().hex}@example.com"
    user = User(email=email, password_hash="fake", full_name="Test User")
    db.add(user)
    db.commit()
    token = create_access_token({"sub": str(user.id)})
    db.close()
    return {"Authorization": f"Bearer {token}", "user_email": email}

def test_fix_recommendation_success(auth_header):
    db = SessionLocal()
    user = db.query(User).filter(User.email == auth_header["user_email"]).first()

    resume = Resume(
        user_id=user.id,
        file_name="test.pdf",
        file_path="test.pdf",
        raw_text="Experienced software engineer with Python and JS.",
        is_current=True
    )
    db.add(resume)
    db.commit()

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        job_title="DevOps Engineer",
        job_description="Needs Kubernetes and Docker experience.",
        match_score=50,
        missing_skills=["kubernetes"],
        recommendations=[{"type": "gap", "priority": "high", "text": "Add Kubernetes experience", "action": "Update resume"}],
        verdict="Needs more cloud skills"
    )
    db.add(analysis)
    db.commit()
    analysis_id = str(analysis.id)
    db.close()

    response = client.post(
        f"/api/analyses/{analysis_id}/fix",
        json={"recommendation_index": 0},
        headers={"Authorization": auth_header["Authorization"]}
    )

    assert response.status_code == 200
    data = response.json()
    assert "original_recommendation" in data
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0
    assert "content" in data["suggestions"][0]

def test_fix_recommendation_unauthorized(auth_header):
    db = SessionLocal()
    other_email = f"other_{uuid.uuid4().hex}@example.com"
    other_user = User(email=other_email, password_hash="fake")
    db.add(other_user)
    db.commit()

    resume = Resume(user_id=other_user.id, file_name="other.pdf", raw_text="Text")
    db.add(resume)
    db.commit()

    analysis = ResumeAnalysis(resume_id=resume.id, job_title="Title", job_description="JD")
    db.add(analysis)
    db.commit()
    analysis_id = str(analysis.id)
    db.close()

    response = client.post(
        f"/api/analyses/{analysis_id}/fix",
        json={"recommendation_index": 0},
        headers={"Authorization": auth_header["Authorization"]}
    )

    assert response.status_code == 404

def test_fix_recommendation_invalid_index(auth_header):
    db = SessionLocal()
    user = db.query(User).filter(User.email == auth_header["user_email"]).first()
    resume = Resume(user_id=user.id, file_name="test_idx.pdf", raw_text="Text")
    db.add(resume)
    db.commit()
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        job_title="T",
        job_description="J",
        recommendations=[{"text": "Rec 1"}]
    )
    db.add(analysis)
    db.commit()
    analysis_id = str(analysis.id)
    db.close()

    response = client.post(
        f"/api/analyses/{analysis_id}/fix",
        json={"recommendation_index": 99},
        headers={"Authorization": auth_header["Authorization"]}
    )

    assert response.status_code == 400
