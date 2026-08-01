# seed script wipes all data and inserts a clean, demo-ready dataset
from database import get_db_connection
from models.user import UserAccount


def wipe_tables(cursor):
    # clear everything in the right order, resetting ids
    # CASCADE handles the foreign keys (reviews/wishlist reference users and games)
    cursor.execute("TRUNCATE reviews, wishlist, users, games RESTART IDENTITY CASCADE")
    print("tables wiped")



def seed_users(cursor):
    # create a set of demo users with known passwords, plus an admin account
    users = [
        ("admin", "admin@admin.com", "admin12345", "admin"),
        ("alex", "alex@demo.com", "password123", "user"),
        ("sam", "sam@demo.com", "password123", "user"),
        ("jordan", "jordan@demo.com", "password123", "user"),
        ("riley", "riley@demo.com", "password123", "user"),
        ("casey", "casey@demo.com", "password123", "user"),
        ("morgan", "morgan@demo.com", "password123", "user"),
        ("taylor", "taylor@demo.com", "password123", "user"),
    ]
    user_ids = {}
    for username, email, password, role in users:
        password_hash = UserAccount.hash_password(password)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING user_id",
            (username, email, password_hash, role),
        )
        user_ids[username] = cursor.fetchone()[0]

    print(f"seeded {len(users)} users")
    return user_ids

def seed_games(cursor):
    # Indie games to populate the database with, including title, developer, release year, and description
    games = [
        ("Hollow Knight", "Team Cherry", 2017, "explore a vast ruined kingdom of insects and heroes"),
        ("Celeste", "Maddy Makes Games", 2018, "help madeline survive her journey up celeste mountain"),
        ("Stardew Valley", "ConcernedApe", 2016, "build and manage your own farm in a peaceful valley"),
        ("Hades", "Supergiant Games", 2020, "defy the god of the dead in this rogue-like dungeon crawler"),
        ("Undertale", "Toby Fox", 2015, "a world where nobody has to die, if you choose so"),
        ("Outer Wilds", "Mobius Digital", 2019, "explore a solar system stuck in an endless time loop"),
        ("Disco Elysium", "ZA/UM", 2019, "a detective rpg with no combat, only dialogue and consequence"),
        ("Tunic", "Andrew Shouldice", 2022, "a small fox on a big adventure in a mysterious land"),
        ("Inscryption", "Daniel Mullins", 2021, "a dark card-based odyssey full of secrets"),
        ("Return of the Obra Dinn", "Lucas Pope", 2018, "identify the fate of a ship's lost crew"),
        ("A Short Hike", "adamgryu", 2019, "hike, climb and glide across a peaceful island park"),
        ("Signalis", "rose-engine", 2022, "a survival horror set in a lonely, dreamlike world"),
    ]
    game_ids = {}
    for title, developer, year, description in games:
        cursor.execute(
            "INSERT INTO games (title, developer, release_year, description) VALUES (%s, %s, %s, %s) RETURNING game_id",
            (title, developer, year, description),
        )
        game_ids[title] = cursor.fetchone()[0]

    print(f"seeded {len(games)} games")
    return game_ids


def seed_reviews(cursor, user_ids, game_ids):
    # each entry is a game title and a list of (username, rating) tuples
    # shaped so the algorithm has gems, good games, mixed reception, and an outlier
    reviews = [
        # good games: high ratings, many reviewers
        ("Hollow Knight", [("alex", 10), ("sam", 9), ("jordan", 10), ("riley", 9), ("casey", 10), ("morgan", 8), ("taylor", 9)]),
        ("Celeste", [("alex", 9), ("sam", 10), ("jordan", 9), ("riley", 10), ("casey", 8), ("morgan", 9)]),
        ("Hades", [("alex", 10), ("sam", 9), ("jordan", 8), ("riley", 9), ("casey", 9), ("taylor", 10)]),
        # genuine hidden gems: high ratings, few reviewers
        ("Outer Wilds", [("alex", 10), ("morgan", 10), ("taylor", 9)]),
        ("Tunic", [("sam", 9), ("riley", 10)]),
        ("A Short Hike", [("casey", 9), ("jordan", 10)]),
        # the outlier: a single glowing review
        ("Signalis", [("morgan", 10)]),
        # mixed reception: mixed ratings, moderate reviewers
        ("Stardew Valley", [("alex", 7), ("sam", 8), ("jordan", 6), ("riley", 8), ("casey", 7)]),
        ("Undertale", [("alex", 6), ("sam", 7), ("morgan", 5), ("taylor", 8)]),
        ("Disco Elysium", [("jordan", 9), ("riley", 7), ("casey", 8)]),
        ("Inscryption", [("sam", 8), ("taylor", 7), ("alex", 8)]),
        ("Return of the Obra Dinn", [("morgan", 9), ("casey", 8)]),
    ]

    count = 0
    for title, user_ratings in reviews:
        game_id = game_ids[title]
        for username, rating in user_ratings:
            user_id = user_ids[username]
            cursor.execute(
                "INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (%s, %s, %s, %s)",
                (user_id, game_id, rating, "seeded review"),
            )
            count += 1

    print(f"seeded {count} reviews")

def recompute_all_ratings(game_ids):
    # the cached average_rating and review_count are normally updated on review actionsm since we insterted reviews directly we need to recompute them for the seeded data
    from models.game import Game
    for game_id in game_ids.values():
        Game.recompute_rating(game_id)
    print("recomputed cached ratings")



def main():
    connection = get_db_connection()
    cursor = connection.cursor()

    wipe_tables(cursor)
    user_ids = seed_users(cursor)
    game_ids = seed_games(cursor)
    seed_reviews(cursor, user_ids, game_ids)

    connection.commit()
    cursor.close()
    connection.close()

    #recompute cached ratings (game.recompute_rating manages its own connection)
    recompute_all_ratings(game_ids)
    print("done")


if __name__ == "__main__":
    main()