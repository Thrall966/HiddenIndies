from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


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