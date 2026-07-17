from fastapi.testclient import TestClient
from main import app
import bcrypt
from main import hash_password

client = TestClient(app)

def test_password_is_hashed_with_bcrypt():
    plain = "mypassword123"
    hashed = hash_password(plain)
    # Hash must not be the plain password
    assert hashed != plain
    # bcrypt hashes start with $2b$
    assert hashed.startswith("$2b")
    # bcrypt must be able to verify the plain password against the hash
    assert bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def test_successful_registration():
    response = client.post("/register", json={
        "username": "mohammed",
        "email": "mohammed@test.com",
        "password": "1234"
    })
    assert response.status_code == 200


def test_duplicate_email_rejected():
    # First registration should succeed
    client.post("/register", json={
        "username": "bob",
        "email": "bob@test.com",
        "password": "1234"
    })
    # Second registration with the same email should be rejected
    response = client.post("/register", json={
        "username": "bob2",
        "email": "bob@test.com",
        "password": "5678"
    })
    assert response.status_code == 409


def test_missing_field_rejected():
    # Empty username should be rejected
    response = client.post("/register", json={
        "username": "",
        "email": "carol@test.com",
        "password": "1234"
    })
    assert response.status_code == 400