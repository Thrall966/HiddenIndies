import os

# Point the tests at the test database before anything else is imported
os.environ["DB_NAME"] = "hiddenindies_test"

import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db_connection

client = TestClient(app)


# Wipe the test database before each test to ensure a clean state
@pytest.fixture(autouse=True)
def clean_test_database():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("TRUNCATE TABLE users RESTART IDENTITY;")
    connection.commit()
    cursor.close()
    connection.close()


# register a user so we have someone to log in as
def register_test_user():
    client.post("/register", json={
        "username": "loginuser",
        "email": "loginuser@test.com",
        "password": "correctpassword"
    })


def test_successful_login_returns_token():
    register_test_user()
    response = client.post("/login", json={
        "email": "loginuser@test.com",
        "password": "correctpassword"
    })
    assert response.status_code == 200
    # The response must actually contain a token
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_wrong_password_rejected():
    register_test_user()
    response = client.post("/login", json={
        "email": "loginuser@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_unknown_email_rejected():
    response = client.post("/login", json={
        "email": "doesnotexist@test.com",
        "password": "anypassword"
    })
    assert response.status_code == 401


def test_missing_fields_rejected():
    response = client.post("/login", json={
        "email": "",
        "password": ""
    })
    assert response.status_code == 400