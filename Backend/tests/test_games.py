import os

# point the tests at the test database before anything else is imported
os.environ["DB_NAME"] = "hiddenindies_test"

import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db_connection

client = TestClient(app)


# wipe the games table before each test so tests are repeatable
@pytest.fixture(autouse=True)
def clean_test_database():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("TRUNCATE TABLE reviews, games RESTART IDENTITY CASCADE;")
    connection.commit()
    cursor.close()
    connection.close()


# helper to insert a game directly, returning its new id
def insert_game(title, developer):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO games (title, developer, release_year, description) VALUES (%s, %s, %s, %s) RETURNING game_id",
        (title, developer, 2020, "a test game"),
    )
    new_id = cursor.fetchone()[0]
    connection.commit()
    cursor.close()
    connection.close()
    return new_id


def test_browse_returns_all_games():
    insert_game("Game One", "Dev A")
    insert_game("Game Two", "Dev B")

    response = client.get("/games")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_browse_returns_empty_when_no_games():
    response = client.get("/games")
    assert response.status_code == 200
    assert response.json() == []


def test_get_single_game_returns_correct_game():
    game_id = insert_game("Hollow Knight", "Team Cherry")

    response = client.get("/games/" + str(game_id))
    assert response.status_code == 200
    assert response.json()["title"] == "Hollow Knight"


def test_get_nonexistent_game_returns_404():
    response = client.get("/games/9999")
    assert response.status_code == 404