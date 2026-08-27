"""
Compare-endpoints smoke test (RECOMMENDATIONS.md item #10).

Verifies the authenticated POST /api/analyses/compare endpoint that powers
the Dashboard history comparison view. The endpoint returns a side-by-side
view of 2-6 analyses owned by the current user, plus a missing-skill matrix
that shows "which skills are valued where" across the selected roles.

Coverage:
  - Happy path: 2 analyses -> 200 with `analyses` + `skill_matrix`
  - Skill matrix sorted by how many roles flagged each skill (desc)
  - Skill normalization: "Kubernetes" and "kubernetes" merge into one row
  - Dedupe: duplicate ids in the request still produce 2 distinct roles
  - Resume file name is surfaced on each analysis (so the UI can show
    which resume variant produced the score)
  - Min enforcement: 1 id -> 400
  - Min enforcement: 2 identical ids -> 400 (dedup drops below 2)
  - Max enforcement: 7 ids -> 400
  - Auth required: no token -> 401
  - Cross-user ownership: bob's id in alice's request -> 404 (no leak)
  - Schema validation: malformed body (missing analysis_ids) -> 422

No pytest dependency — run directly:
    ./venv/Scripts/python test_compare_endpoint.py

Uses SQLite (the default when DATABASE_URL is unset) so it doesn't need
Postgres. Two users are created in-memory against the same DB so we can
prove the ownership check.

Stubbed: `analyze_resume` is replaced so this never calls Groq. The
analyses carry hand-crafted missing-skill lists so the matrix logic is
exercised deterministically.
"""
import os
import sys
import uuid

# Force SQLite even if the dev .env points at Postgres — this test owns
# its data and must not touch the dev DB.
os.environ["DATABASE_URL"] = ""
# Stub out JWT secret so auth doesn't fall through to its prod check.
os.environ["JWT_SECRET"] = "test-secret-for-compare-smoke-test-only"

from fastapi.testclient import TestClient

import main
from main import app
from database import Base, engine

# Never reach the real LLM. The compare endpoint doesn't re-run analysis,
# but we still need analyze_resume importable because main.py references it.
main.analyze_resume = lambda resume_text, job_description: {
    "overall_score": 78,
    "missing_keywords": [],
    "top_suggestions": [],
    "verdict": "stub",
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


def upload(token, name="resume.pdf"):
    res = client.post(
        "/api/resumes/upload",
        files={"file": (name, b"%PDF-stub", "application/pdf")},
        headers=auth(token),
    )
    assert res.status_code == 201, res.text
    return res.json()["resume_id"]


def analyze_with_skills(token, resume_id, job_title, missing):
    """Bypass the AI stub for analyze_resume by writing the row directly.

    The analyze endpoint uses main.analyze_resume (already stubbed above),
    so we inject missing-skill variation via a thin SQLAlchemy patch.
    """
    from models import Resume, ResumeAnalysis
    from database import SessionLocal

    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            job_title=job_title,
            job_description=f"jd for {job_title}",
            match_score=72.0,
            missing_skills=missing,
            recommendations=[],
            verdict=f"verdict for {job_title}",
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return str(analysis.id)
    finally:
        db.close()


print("[setup] signup + upload for two users")
tok_a = signup("alice@example.com")
tok_b = signup("bob@example.com")
resume_a1 = upload(tok_a, "alice-v1.pdf")
resume_a2 = upload(tok_a, "alice-v2.pdf")
resume_b = upload(tok_b, "bob.pdf")

# Create analyses with varied missing skills. The matrix ordering test
# depends on these counts (across backend-dev + sre):
#   "kubernetes" -> 2 (backend-dev, sre)
#   "python"      -> 2 (backend-dev, data-eng)
#   "aws"         -> 1 (sre only)
#   "go"          -> 1 (backend-dev only)
#   "terraform"   -> 1 (sre only)
# Kubernetes + python tie at the top; secondary sort by skill name (a < g
# < k < p < t alphabetically) so aws, go, kubernetes, python, terraform
# after the count-desc tiebreaker between kubernetes and python.
analysis_backend = analyze_with_skills(
    tok_a, resume_a1, "Backend Dev",
    ["Kubernetes", "python", "Go"],
)
analysis_sre = analyze_with_skills(
    tok_a, resume_a1, "SRE",
    ["kubernetes", "aws", "Terraform"],
)
analysis_data = analyze_with_skills(
    tok_a, resume_a2, "Data Engineer",
    ["python", "sql", "Airflow"],
)
analysis_extra = analyze_with_skills(
    tok_a, resume_a2, "QA Engineer",
    ["Selenium", "pytest"],
)
analysis_bob = analyze_with_skills(
    tok_b, resume_b, "Backend Dev (bob)",
    ["kubernetes"],
)

# --- Happy path -----------------------------------------------------------
print("[1] Happy path: 2 analyses")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, analysis_sre]},
    headers=auth(tok_a),
)
check("owner compare -> 200", r.status_code == 200, f"got {r.status_code}: {r.text}")
data = r.json() if r.status_code == 200 else {}
check("returns 2 analyses", len(data.get("analyses", [])) == 2,
      f"got {data.get('analyses')}")
check("role order matches request order",
      [a["id"] for a in data.get("analyses", [])]
      == [analysis_backend, analysis_sre],
      "ids should preserve client order")
check("resume_file_name present on each role",
      all(a.get("resume_file_name") == "alice-v1.pdf"
          for a in data.get("analyses", [])),
      "both analyses ran against alice-v1.pdf")

# --- Skill matrix --------------------------------------------------------
print("[2] Skill matrix ordering + normalization")
matrix = data.get("skill_matrix", [])
check("matrix has 5 unique skills", len(matrix) == 5, f"got {len(matrix)}")
# Counts: kubernetes=2, python=2, aws=1, go=1, terraform=1
# After count-desc tiebreaker: kubernetes + python first (both 2),
# then the count-1 rows alphabetically (aws, go, terraform).
check("matrix sorted by count desc, name asc",
      [m["skill"] for m in matrix]
      == ["kubernetes", "python", "aws", "go", "terraform"],
      f"got {[m['skill'] for m in matrix]}")
# Kubernetes was capitalized in backend but lower in sre — should dedupe.
check("kubernetes (mixed case) merges into one row",
      sum(1 for m in matrix if m["skill"] == "kubernetes") == 1,
      "case-insensitive dedupe failed")

# --- 4-role matrix -------------------------------------------------------
print("[3] Larger compare: 4 analyses with overlapping skills")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [
        analysis_backend,
        analysis_sre,
        analysis_data,
        analysis_extra,
    ]},
    headers=auth(tok_a),
)
check("4-role compare -> 200", r.status_code == 200,
      f"got {r.status_code}: {r.text}")
data = r.json() if r.status_code == 200 else {}
check("returns 4 analyses", len(data.get("analyses", [])) == 4,
      f"got {data.get('analyses')}")
# Resume file names: backend + sre ran on alice-v1.pdf, data + extra on
# alice-v2.pdf.
check("role cards carry distinct resume file names",
      [a.get("resume_file_name") for a in data.get("analyses", [])]
      == ["alice-v1.pdf", "alice-v1.pdf", "alice-v2.pdf", "alice-v2.pdf"],
      "resume_file_name per role failed")

# --- Dedupe of duplicate ids ---------------------------------------------
print("[4] Duplicate ids in request")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, analysis_backend, analysis_sre]},
    headers=auth(tok_a),
)
check("dedupe preserves 2 distinct roles -> 200", r.status_code == 200,
      f"got {r.status_code}: {r.text}")
data = r.json() if r.status_code == 200 else {}
check("deduped response has 2 roles",
      len(data.get("analyses", [])) == 2,
      f"got {len(data.get('analyses', []))}")

# --- Min enforcement -----------------------------------------------------
print("[5] Min enforcement: 1 id")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend]},
    headers=auth(tok_a),
)
check("1 id -> 400", r.status_code == 400, f"got {r.status_code}")

print("[6] Min enforcement: dedup drops below 2")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, analysis_backend]},
    headers=auth(tok_a),
)
check("two-identical-ids -> 400", r.status_code == 400, f"got {r.status_code}")

# --- Max enforcement -----------------------------------------------------
print("[7] Max enforcement: 7 ids")
seven = [analysis_backend, analysis_sre, analysis_data,
         analysis_extra, analysis_bob, analysis_backend, analysis_sre]
# We can't pass bob's id to alice — use bob's auth to give us 7 unique ids.
r_bob_own = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_bob] * 7},
    headers=auth(tok_b),
)
# Bob has only 1 analysis; duplicate dedupes to 1, so we expect 400.
check("7-of-same -> 400 (dedup below 2)", r_bob_own.status_code == 400,
      f"got {r_bob_own.status_code}")

# To exercise the >6 branch we need 7 distinct ids. Create them for bob.
bob_analyses = []
for i in range(6):
    aid = analyze_with_skills(
        tok_b, resume_b, f"role-{i}", [f"skill-{i}"]
    )
    bob_analyses.append(aid)
# Now bob has 7 analyses total (1 original + 6 new).
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": bob_analyses[:7]},
    headers=auth(tok_b),
)
check("7 distinct ids -> 400 (over max)", r.status_code == 400,
      f"got {r.status_code}")

# --- Auth required -------------------------------------------------------
print("[8] Auth required")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, analysis_sre]},
)
check("no token -> 401", r.status_code == 401, f"got {r.status_code}")

# --- Cross-user ownership ------------------------------------------------
print("[9] Cross-user ownership")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, analysis_bob]},
    headers=auth(tok_a),
)
# Alice doesn't own analysis_bob — endpoint should return 404 (no leak).
check("cross-user id -> 404", r.status_code == 404, f"got {r.status_code}")

# Bogus id that belongs to no one.
fake_id = str(uuid.uuid4())
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": [analysis_backend, fake_id]},
    headers=auth(tok_a),
)
check("unknown id -> 404", r.status_code == 404, f"got {r.status_code}")

# --- Schema validation ---------------------------------------------------
print("[10] Schema validation")
r = client.post(
    "/api/analyses/compare",
    json={"wrong_field": [analysis_backend, analysis_sre]},
    headers=auth(tok_a),
)
check("missing analysis_ids -> 422", r.status_code == 422, f"got {r.status_code}")

r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": "not-a-list"},
    headers=auth(tok_a),
)
check("non-list analysis_ids -> 422", r.status_code == 422, f"got {r.status_code}")

# --- 6-role boundary -----------------------------------------------------
print("[11] 6-role boundary (max)")
r = client.post(
    "/api/analyses/compare",
    json={"analysis_ids": bob_analyses[:6]},
    headers=auth(tok_b),
)
check("exactly 6 ids -> 200", r.status_code == 200,
      f"got {r.status_code}: {r.text}")
data = r.json() if r.status_code == 200 else {}
check("returns 6 analyses", len(data.get("analyses", [])) == 6,
      f"got {len(data.get('analyses', []))}")

print()
if failures:
    print("COMPARE TEST FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("COMPARE TEST PASSED")
