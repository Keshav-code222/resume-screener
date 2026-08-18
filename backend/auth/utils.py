"""
JWT + password utilities — used by auth endpoints.
Uses bcrypt directly (passlib has compatibility issues with bcrypt >= 4.1).
"""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# .env can have JWT_SECRET (FastAPI) or SECRET_KEY (legacy Flask).
SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")

# Production runs on Postgres (DATABASE_URL set); local dev uses SQLite.
# Never let production fall back to a known secret — that makes every JWT
# forgeable. Fail hard at import time instead.
IS_PRODUCTION = bool(os.getenv("DATABASE_URL", "").startswith("postgres"))
if not SECRET_KEY:
    if IS_PRODUCTION:
        raise RuntimeError(
            "JWT_SECRET must be set in production — refusing to boot with a "
            "hardcoded default secret."
        )
    SECRET_KEY = "dev-only-insecure-secret-change-me"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days

# Password reset tokens live this long. Long enough for a user to find their
# email, short enough that a leaked link expires fast.
RESET_TOKEN_EXPIRE_HOURS = 1


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8") if isinstance(hashed_password, str) else hashed_password,
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Password reset tokens ─────────────────────────────────────────────────

def _hash_reset_token(raw_token: str) -> str:
    """SHA-256 hex digest of a raw reset token.

    SHA-256 is appropriate here (not bcrypt): the token already has 256 bits of
    entropy from secrets.token_urlsafe, so a slow hash buys nothing. Storing
    the hash means a DB leak doesn't yield working reset links.
    """
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_reset_token() -> tuple[str, str, datetime]:
    """Return (raw_token, token_hash, expires_at).

    The raw token is what gets emailed/URL'd to the user; only the hash is
    persisted. expires_at is timezone-aware (UTC).
    """
    raw = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)
    return raw, _hash_reset_token(raw), expires


def reset_token_matches(raw_token: str, token_hash: str) -> bool:
    """Constant-time comparison of a candidate token against a stored hash."""
    return hmac.compare_digest(_hash_reset_token(raw_token), token_hash)
