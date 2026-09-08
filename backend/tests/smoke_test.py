import pytest
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_full_resume_flow(client):
    """
    Smoke test verifying the core user journey:
    Signup -> Login -> Upload Resume -> Analyze Resume.
    """
    # Test Data
    user_payload = {
        "email": "smoke-test@example.com",
        "password": "securepassword123",
        "full_name": "Smoke Tester"
    }
    job_payload = {
        "job_title": "Software Engineer",
        "job_description": "Looking for a Python expert with FastAPI experience."
    }

    # 1. SIGNUP
    signup_res = await client.post("/api/auth/signup", json=user_payload)
    assert signup_res.status_code == 201
    signup_data = signup_res.json()
    assert "access_token" in signup_data

    # 2. LOGIN
    login_res = await client.post("/api/auth/login", json={
        "email": user_payload["email"],
        "password": user_payload["password"]
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 3. UPLOAD
    # We stub out the PDF extraction and the AI-driven skill extraction to avoid
    # needing a real PDF and calling the AI.
    with patch("main._extract_text", return_value="This is a stubbed resume content for smoke testing."), \
         patch("main.extract_skills", return_value=["Python", "FastAPI"]):

        with open("backend/tests/test_data/sample_resume.pdf", "rb") as f:
            upload_res = await client.post(
                "/api/resumes/upload",
                files={"file": ("sample_resume.pdf", f, "application/pdf")},
                headers=headers
            )

        assert upload_res.status_code == 201
        resume_id = upload_res.json()["resume_id"]
        assert resume_id is not None

    # 4. ANALYZE
    # Stub the AI analysis result
    stub_analysis = {
        "overall_score": 85,
        "missing_keywords": ["Kubernetes"],
        "top_suggestions": [
            {"type": "gap", "priority": "medium", "text": "Add Kubernetes", "action": "Learn K8s"}
        ],
        "verdict": "Strong candidate"
    }

    with patch("main.analyze_resume", return_value=stub_analysis):
        analysis_res = await client.post(
            "/api/analyses",
            json={
                "resume_id": resume_id,
                "job_title": job_payload["job_title"],
                "job_description": job_payload["job_description"]
            },
            headers=headers
        )

        assert analysis_res.status_code == 201
        analysis_data = analysis_res.json()
        assert analysis_data["match_score"] == 85
        assert analysis_data["verdict"] == "Strong candidate"
        assert "analysis_id" in analysis_data
