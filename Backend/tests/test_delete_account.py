import os

os.environ["DB_NAME"] = "hiddenindies_test"

import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db_connection

client = TestClient(app)


# wipe the tables before each test
@pytest.fixture(autouse=True)
def clean_test_database():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("TRUNCATE TABLE reviews, users RESTART IDENTITY CASCADE;")
    connection.commit()
    cursor.close()
    connection.close()


# helper to register a user and return their login token
def register_and_login(username, email, password):
    client.post("/register", json={"username": username, "email": email, "password": password})
    response = client.post("/login", json={"email": email, "password": password})
    return response.json()["access_token"]


# helper to insert a game directly, returning its id
def insert_game(title):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO games (title, developer, release_year, description) VALUES (%s, %s, %s, %s) RETURNING game_id",
        (title, "Dev", 2020, "a game"),
    )
    game_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    connection.close()
    return game_id


def test_delete_account_anonymises_user():
    token = register_and_login("deleteme", "deleteme@test.com", "pass123")

    response = client.delete("/account", headers={"Authorization": "Bearer " + token})
    assert response.status_code == 200

    # the users row should be anonymised: null email, is_deleted true
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT username, email, is_deleted FROM users WHERE username LIKE %s", ("deleted_user_%",))
    row = cursor.fetchone()
    cursor.close()
    connection.close()

    assert row is not None
    assert row[1] is None          # email nulled
    assert row[2] is True          # is_deleted true


def test_deleted_user_cannot_log_in():
    token = register_and_login("gone", "gone@test.com", "pass123")
    client.delete("/account", headers={"Authorization": "Bearer " + token})

    # trying to log in with the old credentials should now fail
    response = client.post("/login", json={"email": "gone@test.com", "password": "pass123"})
    assert response.status_code == 401


def test_review_survives_deletion_with_blank_text():
    game_id = insert_game("Test Game")
    token = register_and_login("reviewer", "reviewer@test.com", "pass123")

    # write a review, then delete the account
    client.post(
        "/games/" + str(game_id) + "/reviews",
        json={"rating": 8, "review_text": "great game"},
        headers={"Authorization": "Bearer " + token},
    )
    client.delete("/account", headers={"Authorization": "Bearer " + token})

    # the review should still exist with its rating but blank text
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT rating, review_text FROM reviews WHERE game_id = %s", (game_id,))
    row = cursor.fetchone()
    cursor.close()
    connection.close()

    assert row is not None
    assert row[0] == 8             # rating kept
    assert row[1] == ""            # text blanked


def test_two_deleted_users_same_game_no_collision():
    game_id = insert_game("Shared Game")

    # two users both review the same game
    token1 = register_and_login("userone", "one@test.com", "pass123")
    client.post("/games/" + str(game_id) + "/reviews", json={"rating": 6, "review_text": "ok"},
                headers={"Authorization": "Bearer " + token1})

    token2 = register_and_login("usertwo", "two@test.com", "pass123")
    client.post("/games/" + str(game_id) + "/reviews", json={"rating": 9, "review_text": "loved it"},
                headers={"Authorization": "Bearer " + token2})

    # deleting both should succeed with no collision 
    r1 = client.delete("/account", headers={"Authorization": "Bearer " + token1})
    r2 = client.delete("/account", headers={"Authorization": "Bearer " + token2})
    assert r1.status_code == 200
    assert r2.status_code == 200

    # both reviews should survive
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM reviews WHERE game_id = %s", (game_id,))
    count = cursor.fetchone()[0]
    cursor.close()
    connection.close()

    assert count == 2