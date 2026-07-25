import os

# Point the code to the test database before anything else is imported
os.environ["DB_NAME"] = "hiddenindies_test"

import pytest
from fastapi.testclient import TestClient
from main import app
from models.user import UserAccount
from database import get_db_connection

client = TestClient(app)


# Wipe the test database before each test to ensure a clean state
@pytest.fixture(autouse=True)
def clean_test_database():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("TRUNCATE TABLE reviews, users RESTART IDENTITY CASCADE;")
    connection.commit()
    cursor.close()
    connection.close()


def test_successful_registration():
    response = client.post("/register", json={
        "username": "mohammed",
        "email": "mohammed@test.com",
        "password": "1234"
    })
    assert response.status_code == 200


def test_duplicate_email_rejected():
    client.post("/register", json={
        "username": "bob",
        "email": "bob@test.com",
        "password": "1234"
    })
    response = client.post("/register", json={
        "username": "bob2",
        "email": "bob@test.com",
        "password": "5678"
    })
    assert response.status_code == 409


def test_missing_field_rejected():
    response = client.post("/register", json={
        "username": "",
        "email": "carol@test.com",
        "password": "1234"
    })
    assert response.status_code == 400


def test_password_is_hashed_with_bcrypt():
    import bcrypt
    plain = "mypassword123"
    hashed = UserAccount.hash_password(plain)
    assert hashed != plain
    assert hashed.startswith("$2b$")
    assert bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))