"""
SQLAlchemy engine + session factory. Reads DATABASE_URL from the environment.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # SQLite fallback for local development
    import pathlib
    DB_DIR = pathlib.Path(__file__).parent
    DATABASE_URL = f"sqlite:///{DB_DIR / 'sql_app.db'}"
    print(f"[database] No DATABASE_URL set — using SQLite: {DATABASE_URL}")

# SQLAlchemy needs postgresql+psycopg2 for the Postgres driver we ship.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Import models AFTER Base is defined so they register on Base.metadata.
import models  # noqa: E402, F401


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on FastAPI startup."""
    Base.metadata.create_all(bind=engine)
