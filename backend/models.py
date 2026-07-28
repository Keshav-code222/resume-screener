"""
SQLAlchemy models — mirror schema.sql (UUID PKs, JSON columns, FKs).
"""
# type: ignore  # Pylance false-positive on Column(_uuid_type(), **kwargs)
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, Numeric,  # noqa: F401
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB  # noqa: F401
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


def _uuid_type():
    # Postgres UUID in production, fall back to String(36) for SQLite dev.
    try:
        return PG_UUID(as_uuid=True)
    except Exception:  # pragma: no cover
        return String(36)


def _uuid_col(**kwargs):
    return Column(_uuid_type(), **kwargs)


def _uuid_fk(*args, **kwargs):
    return Column(_uuid_type(), ForeignKey(*args), **kwargs)


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
    missing_skills = Column(JSONB, nullable=True)
    recommendations = Column(JSONB, nullable=True)
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
