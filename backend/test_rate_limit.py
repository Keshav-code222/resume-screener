"""
Rate-limit smoke test (RECOMMENDATIONS.md item #3).

Verifies slowapi per-IP limits on the public/costly endpoints:
    POST /scan            -> 10/minute
    POST /api/auth/login  -> 20/minute

No pytest dependency — run directly:
    ./venv/Scripts/python test_rate_limit.py

Requests that hit the endpoint body but fail (invalid PDF -> 500, bad login ->
401) still count toward the limit, so this test never calls the AI/LLM and
never creates users.
"""
import sys

from fastapi.testclient import TestClient

import main
from main import app

# The endpoints under test all fail before the LLM is reached (invalid PDF /
# wrong password), but pin it anyway so this can never spend Groq quota.
main.analyze_resume = lambda resume_text, job_description: {
    "overall_score": 85,
    "missing_keywords": ["react"],
    "top_suggestions": ["Add React"],
    "verdict": "Strong match",
}

client = TestClient(app)

# Two distinct simulated client IPs.
IP_A = "203.0.113.10"
IP_B = "198.51.100.20"
HEADERS_A = {"X-Forwarded-For": IP_A}
HEADERS_B = {"X-Forwarded-For": IP_B}


def _scan(headers, xff_ip=None):
    files = {"file": ("resume.pdf", b"not a real pdf", "application/pdf")}
    data = {"job_description": "Software Engineer"}
    return client.post("/scan", files=files, data=data, headers=headers)


def _login(headers):
    return client.post(
        "/api/auth/login",
        json={"email": "ratelimit-test@example.com", "password": "wrong-pass"},
        headers=headers,
    )


failures = []


def check(name, condition, detail):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {name}")
    if not condition:
        failures.append(f"{name}: {detail}")


# --- /scan: 10/minute -------------------------------------------------------
print("[1] POST /scan allows 10/min, blocks the 11th, per-IP")
statuses = [_scan(HEADERS_A).status_code for _ in range(10)]
check(
    "IP A: first 10 /scan requests not limited",
    all(s != 429 for s in statuses),
    f"got {statuses}",
)
eleventh = _scan(HEADERS_A).status_code
check("IP A: 11th /scan request -> 429", eleventh == 429, f"got {eleventh}")
other_ip = _scan(HEADERS_B).status_code
check(
    "IP B: fresh IP still allowed (isolation)",
    other_ip != 429,
    f"got {other_ip}",
)

# --- /api/auth/login: 20/minute --------------------------------------------
print("[2] POST /api/auth/login allows 20/min, blocks the 21st, per-IP")
statuses = [_login(HEADERS_A).status_code for _ in range(20)]
check(
    "IP A: first 20 login requests not limited",
    all(s != 429 for s in statuses),
    f"got {statuses}",
)
twenty_first = _login(HEADERS_A).status_code
check("IP A: 21st login request -> 429", twenty_first == 429, f"got {twenty_first}")
other_ip = _login(HEADERS_B).status_code
check(
    "IP B: fresh IP still allowed (isolation)",
    other_ip != 429,
    f"got {other_ip}",
)

print()
if failures:
    print("RATE LIMIT TEST FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("RATE LIMIT TEST PASSED")
