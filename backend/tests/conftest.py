import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import FastAPI

from main import app
from database import Base, get_db

# Use a temporary file-based SQLite database for tests to ensure the schema persists
TEST_DATABASE_URL = "sqlite:///test_sql_app.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override for get_db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create schema once per session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def client():
    """
    Provide an AsyncClient that uses the FastAPI app as the transport.
    Applies the database override for all requests.
    """
    # Apply override
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    # Clean up override after test
    app.dependency_overrides.clear()
