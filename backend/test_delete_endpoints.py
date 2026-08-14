"""
Delete-endpoints smoke test (RECOMMENDATIONS.md item #5).

Verifies the new authenticated DELETE endpoints:
    DELETE /api/resumes/{id}     -> cascades analyses, removes file
    DELETE /api/analyses/{id}    -> analysis only

Ownership:
    - Other-user resource returns 404 (no leak of "exists but not yours").
    - Missing resource returns 404.
    - Success returns 204.

No pytest dependency — run directly:
    ./venv/Scripts/python test_delete_endpoints.py

Uses SQLite (the default when DATABASE_URL is unset) so it doesn't need
Postgres. Two users are created in-memory against the same DB so we can
prove the ownership check.

Stubbed: `analyze_resume` is replaced so this never calls Groq.
"""
import os
import sys
import uuid

# Force SQLite even if the dev .env points at Postgres — this test owns
# its data and must not touch the dev DB.
os.environ["DATABASE_URL"] = ""
# Stub out JWT secret so auth doesn't fall through to its prod check.
os.environ["JWT_SECRET"] = "test-secret-for-delete-smoke-test-only"

from fastapi.testclient import TestClient

import main
from main import app
from database import Base, engine

# Never reach the real LLM.
main.analyze_resume = lambda resume_text, job_description: {
    "overall_score": 78,
    "missing_keywords": ["python"],
    "top_suggestions": ["Add Python"],
    "verdict": "Decent match",
}

# Stub PDF/DOCX extraction so the test doesn't need real binary fixtures.
class _FakePage:
    def extract_text(self):
        return "stub resume content"


class _FakePdf:
    pages = [_FakePage()]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


import io as _io

import pdfplumber as _pdfplumber
_pdfplumber.open = lambda _buf: _FakePdf()


class _FakeDocxPara:
    text = "stub"


class _FakeDocx:
    paragraphs = [_FakeDocxPara()]


from docx import Document as _Document
_Document.__init__ = lambda self, _buf: None
_Document.paragraphs = property(lambda self: _FakeDocx().paragraphs)

# Fresh schema so the test is hermetic.
Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

client = TestClient(app)

failures = []


def check(name, condition, detail):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {name}")
    if not condition:
        failures.append(f"{name}: {detail}")


def signup(email):
    res = client.post(
        "/api/auth/signup",
        json={"email": email, "password": "supersecret", "full_name": "Test"},
    )
    assert res.status_code == 201, res.text
    return res.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def upload(token):
    res = client.post(
        "/api/resumes/upload",
        files={"file": ("resume.pdf", b"%PDF-stub", "application/pdf")},
        headers=auth(token),
    )
    assert res.status_code == 201, res.text
    return res.json()["resume_id"]


def analyze(token, resume_id):
    res = client.post(
        "/api/analyses",
        json={"resume_id": resume_id, "job_title": "SWE", "job_description": "Python"},
        headers=auth(token),
    )
    assert res.status_code == 201, res.text
    return res.json()["analysis_id"]


# Two users so we can test the cross-user 404.
print("[setup] signup + upload + analyze for two users")
tok_a = signup("alice@example.com")
tok_b = signup("bob@example.com")
resume_a = upload(tok_a)
resume_b = upload(tok_b)
analysis_a = analyze(tok_a, resume_a)

# --- Analysis delete -------------------------------------------------------
print("[1] DELETE /api/analyses/{id}")
r = client.delete(f"/api/analyses/{analysis_a}", headers=auth(tok_a))
check("owner delete -> 204", r.status_code == 204, f"got {r.status_code}")

r = client.get(f"/api/analyses/{analysis_a}", headers=auth(tok_a))
check("deleted analysis -> 404 on GET", r.status_code == 404, f"got {r.status_code}")

r = client.delete(f"/api/analyses/{analysis_a}", headers=auth(tok_a))
check("double-delete -> 404", r.status_code == 404, f"got {r.status_code}")

# Cross-user: bob tries to delete something alice would have owned.
fake_id = str(uuid.uuid4())
r = client.delete(f"/api/analyses/{fake_id}", headers=auth(tok_b))
check("non-existent analysis -> 404", r.status_code == 404, f"got {r.status_code}")

# Resume B is bob's; alice should not be able to delete it.
r = client.delete(f"/api/resumes/{resume_b}", headers=auth(tok_a))
check("other user's resume -> 404 (no leak)", r.status_code == 404, f"got {r.status_code}")
# Bob still has his resume.
r = client.get("/api/resumes", headers=auth(tok_b))
check(
    "bob's resume survived alice's attempt",
    any(x["id"] == resume_b for x in r.json()),
    f"got {r.json()}",
)

# --- Resume delete (with cascade) ------------------------------------------
print("[2] DELETE /api/resumes/{id} cascades analyses")
# Create a fresh resume + analysis for alice so we can verify cascade.
resume_c = upload(tok_a)
analysis_c = analyze(tok_a, resume_c)

r = client.delete(f"/api/resumes/{resume_c}", headers=auth(tok_a))
check("owner resume delete -> 204", r.status_code == 204, f"got {r.status_code}")

r = client.get(f"/api/analyses/{analysis_c}", headers=auth(tok_a))
check("cascade: analysis under deleted resume -> 404", r.status_code == 404, f"got {r.status_code}")

r = client.get("/api/resumes", headers=auth(tok_a))
check(
    "deleted resume removed from list",
    not any(x["id"] == resume_c for x in r.json()),
    f"got {r.json()}",
)

# Cross-user resume delete.
r = client.delete(f"/api/resumes/{resume_b}", headers=auth(tok_a))
check("other user's resume delete -> 404", r.status_code == 404, f"got {r.status_code}")

# Missing id.
r = client.delete(f"/api/resumes/{uuid.uuid4()}", headers=auth(tok_a))
check("missing resume id -> 404", r.status_code == 404, f"got {r.status_code}")

# --- /scan still works (public endpoint unaffected) -----------------------
print("[3] Public /scan still works")
r = client.post(
    "/scan",
    files={"file": ("resume.pdf", b"%PDF-stub", "application/pdf")},
    data={"job_description": "Python dev"},
)
# Stubbed analyze_resume returns 200 (PDF extraction stubbed above).
check(
    "/scan route still registered and returns AI result",
    r.status_code == 200 and "overall_score" in r.json(),
    f"got {r.status_code}: {r.text}",
)

print()
if failures:
    print("DELETE TEST FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("DELETE TEST PASSED")
