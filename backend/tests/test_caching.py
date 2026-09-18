import pytest
from unittest.mock import patch, MagicMock
from main import app
from models import AnalysisCache

async def test_analysis_caching_public_scan(client):
    """
    Verify that the public /scan endpoint caches results.
    """
    # Mock data
    resume_text = "Experienced software engineer with Python and React skills."
    job_description = "Looking for a software engineer skilled in Python and React."
    mock_result = {
        "overall_score": 85.0,
        "missing_keywords": ["AWS", "Docker"],
        "top_suggestions": [{"type": "gap", "priority": "high", "text": "Add AWS experience", "action": "Add certification"}],
        "verdict": "Strong match",
    }

    # We need to mock 'main.analyze_resume' since that's what scan_resume calls.
    with patch("main.analyze_resume") as mock_ai:
        mock_ai.return_value = mock_result

        # First call - should hit AI
        with open("test_resume.pdf", "wb") as f:
            f.write(b"dummy pdf content")

        # Note: /scan uses UploadFile, so we use files={} in httpx
        # But the actual content is extracted. To ensure consistent resume_text for the mock,
        # we'd need to mock _extract_text too, because a dummy pdf won't result in our 'resume_text'.

        with patch("main._extract_text", return_value=resume_text):
            # Request 1
            response1 = await client.post(
                "/scan",
                files={"file": ("resume.pdf", b"dummy", "application/pdf")},
                data={"job_description": job_description},
            )
            assert response1.status_code == 200
            assert response1.json()["overall_score"] == 85.0
            assert mock_ai.call_count == 1

            # Request 2 - should hit cache
            response2 = await client.post(
                "/scan",
                files={"file": ("resume.pdf", b"dummy", "application/pdf")},
                data={"job_description": job_description},
            )
            assert response2.status_code == 200
            assert response2.json()["overall_score"] == 85.0
            assert mock_ai.call_count == 1  # Still 1!

            # Request 3 - different JD, should hit AI again
            response3 = await client.post(
                "/scan",
                files={"file": ("resume.pdf", b"dummy", "application/pdf")},
                data={"job_description": "Different JD"},
            )
            assert response3.status_code == 200
            assert mock_ai.call_count == 2

async def test_analysis_caching_private_create(client, db):
    """
    Verify that the private /api/analyses endpoint caches results.
    """
    # Setup: Need a user and a resume in the DB
    from models import User, Resume
    user = User(email="test@example.com", password_hash="hash")
    db.add(user)
    db.commit()

    resume = Resume(user_id=user.id, raw_text="Experienced software engineer.", is_current=True)
    db.add(resume)
    db.commit()

    resume_id = str(resume.id)
    job_description = "Looking for a software engineer."
    mock_result = {
        "overall_score": 70.0,
        "missing_keywords": ["Java"],
        "top_suggestions": [],
        "verdict": "Fair match",
    }

    with patch("main.analyze_resume") as mock_ai:
        mock_ai.return_value = mock_result

        # Mock auth token
        token = "mock-token"
        # In a real test we'd need to mock get_current_user, but for simplicity
        # we can override the dependency or use a known valid token if we have one.
        # Since we are in a test, let's override get_current_user.
        from auth.dependencies import get_current_user
        app.dependency_overrides[get_current_user] = lambda: user

        # Request 1
        response1 = await client.post(
            "/api/analyses",
            json={"resume_id": resume_id, "job_title": "Engineer", "job_description": job_description},
        )
        assert response1.status_code == 201
        assert mock_ai.call_count == 1

        # Request 2 - same resume, same JD
        response2 = await client.post(
            "/api/analyses",
            json={"resume_id": resume_id, "job_title": "Engineer", "job_description": job_description},
        )
        assert response2.status_code == 201
        assert mock_ai.call_count == 1 # Cached!

        # Request 3 - different JD
        response3 = await client.post(
            "/api/analyses",
            json={"resume_id": resume_id, "job_title": "Engineer", "job_description": "Different JD"},
        )
        assert response3.status_code == 201
        assert mock_ai.call_count == 2

        app.dependency_overrides.clear()
