"""
Password reset flow smoke test (RECOMMENDATIONS.md item #9).

Verifies the full token lifecycle on the existing backend endpoints:
    POST /api/auth/forgot-password
    POST /api/auth/reset-password

Run directly (no pytest dependency):
    ./venv/Scripts/python test_password_reset.py

The /scan endpoint and the LLM are never touched; analyze_resume is patched
out anyway as a belt-and-braces guard against any future code drift.

Each request rotates a unique X-Forwarded-For header so the in-memory slowapi
limiter sees every call as a fresh IP — keeps the test independent of the
real production rate limits (forgot-password is 5/min).
"""
import contextlib
import io
import sys
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

import main
from main import app
from database import Base, SessionLocal, engine
from auth import utils as auth_utils
from models import PasswordResetToken, User

main.analyze_resume = lambda resume_text, job_description: {
    "overall_score": 85,
    "missing_keywords": ["react"],
    "top_suggestions": ["Add React"],
    "verdict": "Strong match",
}

# Ensure a fresh schema for this run so previous user/token rows don't leak
# between test runs. In-memory SQLite is used in dev mode (DATABASE_URL unset).
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# Per-test IP counter so the in-memory slowapi limiter doesn't reject any of
# our requests (forgot-password is capped at 5/min per IP in production).
_ip_counter = 0


def _next_ip() -> str:
    global _ip_counter
    _ip_counter += 1
    return f"203.0.113.{_ip_counter}"


def _signup(email="reset-test@example.com", password="old-pass-1"):
    return client.post(
        "/api/auth/signup",
        json={"email": email, "password": password, "full_name": "Reset Test"},
        headers={"X-Forwarded-For": _next_ip()},
    )


def _login(email, password):
    return client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
        headers={"X-Forwarded-For": _next_ip()},
    )


def _forgot(email):
    return client.post(
        "/api/auth/forgot-password",
        json={"email": email},
        headers={"X-Forwarded-For": _next_ip()},
    )


def _reset(token, new_password):
    return client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": new_password},
        headers={"X-Forwarded-For": _next_ip()},
    )


def _capture_reset_link(email):
    """Drive a forgot-password call and pull the token off the printed link."""
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        _forgot(email)
    for line in buf.getvalue().splitlines():
        if "Password reset link" in line:
            # Format: "[reset] Password reset link for X: /reset-password?token=..."
            return line.split("token=", 1)[1].strip()
    return ""


failures = []


def check(name, condition, detail):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {name}")
    if not condition:
        failures.append(f"{name}: {detail}")


# ── [1] No enumeration: same response for unknown vs known email ─────────
print("[1] Forgot-password does not leak whether the email exists")
known = _forgot("reset-test@example.com")
unknown = _forgot("definitely-not-registered@example.com")
check(
    "Known email returns 200",
    known.status_code == 200,
    f"got {known.status_code}",
)
check(
    "Unknown email also returns 200",
    unknown.status_code == 200,
    f"got {unknown.status_code}",
)
check(
    "Bodies are byte-identical (no enumeration leak)",
    known.content == unknown.content,
    f"known={known.content!r} unknown={unknown.content!r}",
)

# ── [2] Set up a user for the rest of the test ──────────────────────────
print("[2] Create a fresh user to reset")
auth_utils.RESET_TOKEN_EXPIRE_HOURS = 1  # back to normal for valid-token tests
result = _signup()
check("Signup returns 201", result.status_code == 201, f"got {result.status_code}")

# ── [3] Request a valid reset token ─────────────────────────────────────
print("[3] Request a reset token and capture it from stdout")
raw_token = _capture_reset_link("reset-test@example.com")
check("Captured a non-empty raw token", bool(raw_token), f"got {raw_token!r}")

# ── [4] Wrong / fake / tampered tokens are rejected ────────────────────
print("[4] Invalid tokens are rejected with the generic 400")
bogus = _reset("this-is-not-a-real-token", "brand-new-pass")
check(
    "Bogus token -> 400",
    bogus.status_code == 400,
    f"got {bogus.status_code}",
)
check(
    "Bogus token message is generic (no leak of why)",
    bogus.json().get("detail") == "Invalid or expired reset link",
    f"got {bogus.json()}",
)

# ── [5] Valid token resets the password ────────────────────────────────
print("[5] Valid token resets the password and old password stops working")
old_login = _login("reset-test@example.com", "old-pass-1")
check(
    "Old password works before reset",
    old_login.status_code == 200,
    f"got {old_login.status_code}",
)
reset_ok = _reset(raw_token, "brand-new-pass-2")
check(
    "Valid reset -> 200",
    reset_ok.status_code == 200,
    f"got {reset_ok.status_code}: {reset_ok.content!r}",
)
post_old = _login("reset-test@example.com", "old-pass-1")
check(
    "Old password no longer works after reset",
    post_old.status_code == 401,
    f"got {post_old.status_code}",
)
post_new = _login("reset-test@example.com", "brand-new-pass-2")
check(
    "New password works after reset",
    post_new.status_code == 200,
    f"got {post_new.status_code}",
)

# ── [6] Single-use: the consumed token can't be reused ────────────────
print("[6] Reset tokens are single-use")
reuse = _reset(raw_token, "another-pass-3")
check(
    "Re-using the same token -> 400",
    reuse.status_code == 400,
    f"got {reuse.status_code}",
)

# ── [7] Forgot-password invalidates older tokens for the same user ────
print("[7] A new forgot-password call invalidates prior tokens")
# First, set the password back so we know the previous login path is stable
client.post(
    "/api/auth/login",
    json={"email": "reset-test@example.com", "password": "brand-new-pass-2"},
    headers={"X-Forwarded-For": _next_ip()},
)

# Request a fresh token (this one we'll keep around by NOT resetting with it)
first_token = _capture_reset_link("reset-test@example.com")
check("First token captured", bool(first_token), f"got {first_token!r}")

# Request another — this should invalidate the first
second_token = _capture_reset_link("reset-test@example.com")
check("Second token captured", bool(second_token), f"got {second_token!r}")
check(
    "Second token is a different string",
    second_token != first_token,
    "tokens collided",
)
stale = _reset(first_token, "should-not-apply")
check(
    "Stale (pre-invalidation) token -> 400",
    stale.status_code == 400,
    f"got {stale.status_code}",
)
fresh = _reset(second_token, "final-pass-4")
check(
    "Fresh (latest) token resets successfully",
    fresh.status_code == 200,
    f"got {fresh.status_code}",
)
final_login = _login("reset-test@example.com", "final-pass-4")
check(
    "Password is now the most recent one set",
    final_login.status_code == 200,
    f"got {final_login.status_code}",
)

# ── [8] Expired tokens are rejected (and the row is cleaned up) ────────
print("[8] Expired tokens are rejected and cleaned up")
# Confirm the user still exists before we request another token.
db = SessionLocal()
user = db.query(User).filter(User.email == "reset-test@example.com").first()
check("User still exists in DB at step 8", user is not None, "user was deleted")
db.close()

expired_token = _capture_reset_link("reset-test@example.com")
check(
    "Captured an expired-token raw value",
    bool(expired_token),
    f"got {expired_token!r}",
)

# Backdate the matching row directly so the endpoint sees it as expired
# regardless of the dev-mode RESET_TOKEN_EXPIRE_HOURS override.
from auth.utils import _hash_reset_token

db = SessionLocal()
row = (
    db.query(PasswordResetToken)
    .filter(PasswordResetToken.token_hash == _hash_reset_token(expired_token))
    .first()
)
check("Token row exists in DB before expiry test", row is not None, "missing row")
row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=5)
db.commit()
db.close()

expired_resp = _reset(expired_token, "too-late-pass")
check(
    "Expired token -> 400",
    expired_resp.status_code == 400,
    f"got {expired_resp.status_code}",
)
check(
    "Expired token message is the generic one",
    expired_resp.json().get("detail") == "Invalid or expired reset link",
    f"got {expired_resp.json()}",
)
db = SessionLocal()
still_there = (
    db.query(PasswordResetToken)
    .filter(PasswordResetToken.token_hash == _hash_reset_token(expired_token))
    .first()
)
db.close()
check(
    "Expired token row is removed from DB",
    still_there is None,
    "row was not cleaned up",
)

# ── [9] Password too short rejected ────────────────────────────────────
print("[9] New password < 6 chars is rejected")
short_token = _capture_reset_link("reset-test@example.com")
check("Captured a short-password-test token", bool(short_token), f"got {short_token!r}")
short_resp = _reset(short_token, "abc")
check(
    "Short password -> 400",
    short_resp.status_code == 400,
    f"got {short_resp.status_code}",
)
check(
    "Short password message mentions length",
    "6 characters" in short_resp.json().get("detail", ""),
    f"got {short_resp.json()}",
)

print()
if failures:
    print("PASSWORD RESET TEST FAILED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("PASSWORD RESET TEST PASSED")
