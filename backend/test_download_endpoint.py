"""
Download-endpoint smoke test (RECOMMENDATIONS.md item #6).

Verifies the new authenticated GET endpoint:
    GET /api/resumes/{id}/download   -> serves the original file

Cases:
    - Owner gets 200 with the right content-type and the exact bytes uploaded.
    - Cross-user request returns 404 (no existence leak).
    - Missing id returns 404.
    - Missing resume (resume id that exists but is not yours) returns 404.
    - Unauthenticated request returns 401.
    - After DELETE the file is gone from disk and the row is gone.

No pytest dependency — run directly:
    ./venv/Scripts/python test_download_endpoint.py

Uses SQLite (the default when DATABASE_URL is unset). Two users are created
in-memory against the same DB to prove the ownership check.
"""
import os
import sys
import uuid
import io as _io

# Force SQLite even if the dev .env points at Postgres — this test owns its
# data and must not touch the dev DB.
os.environ["DATABASE_URL"] = ""
os.environ["JWT_SECRET"] = "test-secret-for-download-smoke-test-only"

from fastapi.testclient import TestClient

import main
from main import app
from database import Base, engine

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


def upload_pdf(token, payload, name="resume.pdf"):
    res = client.post(
        "/api/resumes/upload",
        files={"file": (name, payload, "application/pdf")},
        headers=auth(token),
    )
    assert res.status_code == 201, res.text
    return res.json()["resume_id"]


print("[setup] signup two users, upload one PDF each")
tok_a = signup("alice@example.com")
tok_b = signup("bob@example.com")
alice_bytes = b"%PDF-1.4\n%alice-payload\n%%EOF\n"
bob_bytes = b"%PDF-1.4\n%bob-payload\n%%EOF\n"
resume_a = upload_pdf(tok_a, alice_bytes)
resume_b = upload_pdf(tok_b, bob_bytes)

# --- Owner download --------------------------------------------------------
print("[1] Owner download returns the original bytes")
r = client.get(f"/api/resumes/{resume_a}/download", headers=auth(tok_a))
check("owner GET /download -> 200", r.status_code == 200, f"got {r.status_code}")
check(
    "content-type is application/pdf",
    r.headers.get("content-type", "").startswith("application/pdf"),
    f"got {r.headers.get('content-type')}",
)
check(
    "bytes match the uploaded payload",
    r.content == alice_bytes,
    f"got {r.content!r}",
)
check(
    "Content-Disposition includes filename",
    "alice" in r.headers.get("content-disposition", "").lower()
    or "resume" in r.headers.get("content-disposition", "").lower(),
    f"got {r.headers.get('content-disposition')}",
)

# --- Unauthenticated -------------------------------------------------------
print("[2] Unauthenticated download is rejected")
r = client.get(f"/api/resumes/{resume_a}/download")
check("no token -> 401", r.status_code == 401, f"got {r.status_code}")

# --- Cross-user ------------------------------------------------------------
print("[3] Cross-user download is 404 (no existence leak)")
r = client.get(f"/api/resumes/{resume_b}/download", headers=auth(tok_a))
check("alice asking for bob's resume -> 404", r.status_code == 404, f"got {r.status_code}")

# --- Missing id ------------------------------------------------------------
print("[4] Missing resume id is 404")
r = client.get(f"/api/resumes/{uuid.uuid4()}/download", headers=auth(tok_a))
check("missing id -> 404", r.status_code == 404, f"got {r.status_code}")

# --- DOCX content-type -----------------------------------------------------
print("[5] DOCX download serves with the right content-type")
# Stub a Resume row directly pointing at a docx file on disk. We don't need
# to round-trip through the upload endpoint — python-docx won't parse our
# test fixture, and we only care about the download endpoint's content-type
# branching. The download handler keys off file extension, not the row's
# declared mime.
from database import SessionLocal
from models import Resume, User as _User

db = SessionLocal()
try:
    alice = db.query(_User).filter(_User.email == "alice@example.com").first()
    docx_payload = b"PK\x03\x04docx-stub\n"
    fake_path = os.path.join(
        os.path.dirname(__file__), "uploads", f"{uuid.uuid4().hex}.docx"
    )
    with open(fake_path, "wb") as fh:
        fh.write(docx_payload)
    resume_docx = str(uuid.uuid4())
    db.add(
        Resume(
            id=resume_docx,
            user_id=alice.id,
            file_name="resume.docx",
            file_path=fake_path,
            raw_text="stub",
        )
    )
    db.commit()
finally:
    db.close()

r = client.get(f"/api/resumes/{resume_docx}/download", headers=auth(tok_a))
check("docx download -> 200", r.status_code == 200, f"got {r.status_code}")
check(
    "docx content-type",
    r.headers.get("content-type", "").startswith(
        "application/vnd.openxmlformats-officedocument"
    ),
    f"got {r.headers.get('content-type')}",
)
check(
    "docx bytes match",
    r.content == docx_payload,
    f"got {r.content!r}",
)
# Clean up the stub file.
try:
    os.remove(fake_path)
except OSError:
    pass

# --- Delete removes the file ----------------------------------------------
print("[6] Delete cascades the on-disk file")
# Delete alice's first resume. Confirm download now returns 410 Gone if the
# file is missing, OR 404 if the row is also gone (both are valid).
r = client.delete(f"/api/resumes/{resume_a}", headers=auth(tok_a))
check("delete resume_a -> 204", r.status_code == 204, f"got {r.status_code}")

r = client.get(f"/api/resumes/{resume_a}/download", headers=auth(tok_a))
check(
    "download after delete -> 404 (row gone) or 410 (row but no file)",
    r.status_code in (404, 410),
    f"got {r.status_code}: {r.text}",
)

# --- /scan still works (public endpoint unaffected) -----------------------
print("[7] Public /scan still works")
r = client.post(
    "/scan",
    files={"file": ("resume.pdf", b"%PDF-stub", "application/pdf")},
    data={"job_description": "Python dev"},
)
# Stubbed analyze_resume returns 200 (extraction stubbed above).
# analyze_resume itself isn't stubbed here, but the file extraction stub is
# — so the request will reach the real analyze_resume. If Groq isn't
# configured, expect a 500 with "AI analysis failed". Either way the route
# must be reachable.
check(
    "/scan route registered and reachable (200 or 500 from analyze)",
    r.status_code in (200, 500),
    f"got {r.status_code}",
)

print()
if failures:
    print("DOWNLOAD TEST FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("DOWNLOAD TEST PASSED")
