from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    plan = Column(String, default="free")
    scans_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    resume_text = Column(Text)
    job_description = Column(Text)
    overall_score = Column(Float)
    feedback = Column(Text)
    created_at = Column(DateTime, server_default=func.now())