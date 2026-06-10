import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.services.gemini_service import gemini_service

# Use a separate test database file
TEST_DB_FILE = "./test_learning_system.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the dependency override
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Create the database tables for testing, and delete the file afterward."""
    # Ensure a clean database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Tear down - drop all tables and remove database file if it exists
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "online"

def test_register_user(client):
    response = client.post(
        "/register",
        json={"name": "Alice Tester", "email": "alice@example.com", "password": "mypassword123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Alice Tester"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data

def test_register_duplicate_email(client):
    # Registering duplicate user should fail
    response = client.post(
        "/register",
        json={"name": "Duplicate Alice", "email": "alice@example.com", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_oauth2_form(client):
    response = client.post(
        "/login",
        data={"username": "alice@example.com", "password": "mypassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_json(client):
    response = client.post(
        "/login-json",
        json={"email": "alice@example.com", "password": "mypassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post(
        "/login-json",
        json={"email": "alice@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_unauthenticated_protected_routes(client):
    # Submit quiz without auth
    response = client.post("/quiz/submit", json={"score": 85.0})
    assert response.status_code == 401

    # Get progress without auth
    response = client.get("/progress")
    assert response.status_code == 401

    # Get recommendation without auth
    response = client.get("/recommendation")
    assert response.status_code == 401

    # Chat without auth
    response = client.post("/chat", json={"message": "Hello"})
    assert response.status_code == 401

def test_quiz_submissions_and_recommendations(client):
    # Log in to get token
    login_response = client.post(
        "/login-json",
        json={"email": "alice@example.com", "password": "mypassword123"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Submit Beginner quiz score (< 40)
    response = client.post("/quiz/submit", json={"score": 35.0}, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "quiz_result" in data
    assert "recommendation" in data
    assert data["quiz_result"]["score"] == 35.0
    assert "Category: Beginner" in data["recommendation"]["recommendation_text"]

    # 2. Submit Intermediate quiz score (40 - 70)
    response = client.post("/quiz/submit", json={"score": 65.5}, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["quiz_result"]["score"] == 65.5
    assert "Category: Intermediate" in data["recommendation"]["recommendation_text"]

    # 3. Submit Advanced quiz score (> 70)
    response = client.post("/quiz/submit", json={"score": 92.0}, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["quiz_result"]["score"] == 92.0
    assert "Category: Advanced" in data["recommendation"]["recommendation_text"]

    # Test GET /progress
    progress_response = client.get("/progress", headers=headers)
    assert progress_response.status_code == 200
    p_data = progress_response.json()
    
    assert len(p_data["history"]) == 3
    stats = p_data["stats"]
    assert stats["total_quizzes"] == 3
    assert stats["highest_score"] == 92.0
    # Average of (35 + 65.5 + 92) / 3 = 64.17
    assert stats["average_score"] == 64.17

    # Test GET /recommendation (should return the latest, which is Advanced)
    rec_response = client.get("/recommendation", headers=headers)
    assert rec_response.status_code == 200
    r_data = rec_response.json()
    assert "Category: Advanced" in r_data["recommendation_text"]

    # Test GET /recommendation/history
    rec_history_response = client.get("/recommendation/history", headers=headers)
    assert rec_history_response.status_code == 200
    r_history = rec_history_response.json()
    assert len(r_history) == 3

    # Test POST /chat with authenticated user
    chat_response = client.post(
        "/chat",
        json={"message": "Explain recursion"},
        headers=headers
    )
    assert chat_response.status_code == 200
    c_data = chat_response.json()
    assert "reply" in c_data
    assert "Explain recursion" in c_data["reply"]

    # Test GET /me profile
    me_response = client.get("/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["name"] == "Alice Tester"
    assert me_data["email"] == "alice@example.com"

