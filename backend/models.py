"""
SQLAlchemy models — mirror schema.sql (UUID PKs, JSON columns, FKs).
"""
# type: ignore  # Pylance false-positive on Column(_uuid_type(), **kwargs)
import os
import uuid
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, Numeric, JSON, Index,  # noqa: F401
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID  # noqa: F401
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


def _json_type():
    """
    JSONB on Postgres, plain JSON on SQLite.
    SQLAlchemy's generic JSON works on both, but on Postgres it maps to
    JSON not JSONB — barely matters for our usage. Return JSONB when the
    database is Postgres (detected via DATABASE_URL).
    """
    if os.getenv("DATABASE_URL", "").startswith("postgres"):
        from sqlalchemy.dialects.postgresql import JSONB  # noqa: F811
        return JSONB  # type: ignore
    return JSON


def _uuid_type():
    # Postgres UUID in production, fall back to String(36) for SQLite dev.
    # as_uuid=False returns UUIDs as plain strings, matching the SQLite path so
    # every schema can keep `id: str` on both backends.
    db_url = os.getenv("DATABASE_URL", "")
    if db_url.startswith("postgres"):
        from sqlalchemy.dialects.postgresql import UUID as _PG  # noqa: F811
        return _PG(as_uuid=False)
    return String(36)


def _uuid_col(**kwargs):
    # SQLite can't auto-generate UUIDs, so provide a Python-side default.
    if "default" not in kwargs and "server_default" not in kwargs:
        kwargs.setdefault("default", lambda: str(uuid.uuid4()))
    return Column(_uuid_type(), **kwargs)


def _uuid_fk(column: str, ondelete: str | None = None, **kwargs):
    return Column(_uuid_type(), ForeignKey(column, ondelete=ondelete), **kwargs)


class User(Base):
    __tablename__ = "users"

    id = _uuid_col(primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    resumes = relationship(
        "Resume", back_populates="owner", cascade="all, delete-orphan"
    )
    subscription = relationship(
        "Subscription",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Resume(Base):
    __tablename__ = "resumes"

    id = _uuid_col(primary_key=True, index=True)
    user_id = _uuid_fk(
        "users.id", ondelete="CASCADE", nullable=False, index=True
    )
    file_name = Column(String(255), nullable=True)
    file_path = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_current = Column(Boolean, default=True)

    owner = relationship("User", back_populates="resumes")
    analyses = relationship(
        "ResumeAnalysis",
        back_populates="resume",
        cascade="all, delete-orphan",
    )


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = _uuid_col(primary_key=True, index=True)
    resume_id = _uuid_fk(
        "resumes.id", ondelete="CASCADE", nullable=False, index=True
    )
    job_title = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=True)
    match_score = Column(Numeric(5, 2), nullable=True)
    missing_skills = Column(_json_type(), nullable=True)
    recommendations = Column(_json_type(), nullable=True)
    verdict = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="analyses")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = _uuid_col(primary_key=True, index=True)
    user_id = _uuid_fk(
        "users.id", ondelete="CASCADE", nullable=False, unique=True
    )
    plan_type = Column(String(50), default="free")
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="subscription")


class PasswordResetToken(Base):
    """One-time password reset tokens.

    We store a SHA-256 hash of the random token (never the raw token), so a
    database leak doesn't yield working reset links. Tokens expire after
    RESET_TOKEN_EXPIRE_HOURS (set in auth/utils.py) and are deleted after use.
    """
    __tablename__ = "password_reset_tokens"

    id = _uuid_col(primary_key=True, index=True)
    user_id = _uuid_fk(
        "users.id", ondelete="CASCADE", nullable=False, index=True
    )
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")

    __table_args__ = (
        # Lookup is by hash; the unique index doubles as the fast path.
        Index("ix_password_reset_tokens_user_expiry", "user_id", "expires_at"),
    )
