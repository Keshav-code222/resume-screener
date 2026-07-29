"""
JWT + password utilities — used by auth endpoints.
Uses bcrypt directly (passlib has compatibility issues with bcrypt >= 4.1).
"""
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# .env can have JWT_SECRET (FastAPI) or SECRET_KEY (legacy Flask).
SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "your-super-secret-key-change-this-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 days


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
