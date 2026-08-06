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


def _ensure_resume_analyses_columns():
    """Lightweight migration for existing databases.

    create_all() only creates whole tables — it never adds columns to a table
    that already exists. When a column is introduced after the first deploy
    (e.g. `verdict`), we ALTER the table if the column is missing.
    """
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if "resume_analyses" not in insp.get_table_names():
        return
    existing = {c["name"] for c in insp.get_columns("resume_analyses")}
    if "verdict" not in existing:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE resume_analyses ADD COLUMN verdict TEXT"))
        print("[database] Added missing 'verdict' column to resume_analyses")


def init_db():
    """Create all tables. Called on FastAPI startup."""
    Base.metadata.create_all(bind=engine)
    _ensure_resume_analyses_columns()
