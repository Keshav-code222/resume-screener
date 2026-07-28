"""
SQLAlchemy engine + session factory. Reads DATABASE_URL from the environment.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Imported at module level so the SQLAlchemy Base.metadata registry is
# populated before any caller calls create_all(). The models themselves
# import Base from here.
from . import models  # noqa: F401  (registers tables on Base.metadata)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to backend/.env (see .env.example)."
    )

# SQLAlchemy needs postgresql+psycopg2 for the Postgres driver we ship.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on FastAPI startup."""
    Base.metadata.create_all(bind=engine)
