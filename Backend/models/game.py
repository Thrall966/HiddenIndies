from database import get_db_connection


class Game:
    # constructor to hold one games data
    def __init__(self, game_id, title, developer, release_year, description, average_rating, review_count, genre):
        self.game_id = game_id
        self.title = title
        self.developer = developer
        self.release_year = release_year
        self.description = description
        self.average_rating = average_rating
        self.review_count = review_count
        self.genre = genre

    @staticmethod
    def get_all():
        # fetch every game from the database and return them as a list of Game objects
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT game_id, title, developer, release_year, description, average_rating, review_count, genre FROM games ORDER BY title")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        # turn each row into a Game object
        games = []
        for row in rows:
            games.append(Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]))
        return games
    @staticmethod
    def find_by_id(game_id):
        # fetch a single game by its id, return a Game object or None
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT game_id, title, developer, release_year, description, average_rating, review_count, genre FROM games WHERE game_id = %s", (game_id,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()

        if row is None:
            return None
        return Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7])

    @staticmethod
    def recompute_rating(game_id):
        # recalculate a game's average rating and review count from its reviews, then store them
        connection = get_db_connection()
        cursor = connection.cursor()

        # ask the database for the average rating and number of reviews for this game
        cursor.execute(
            "SELECT AVG(rating), COUNT(*) FROM reviews WHERE game_id = %s",
            (game_id,),
        )
        average, count = cursor.fetchone()

        # if there are no reviews yet, average comes back as none, so treat it as 0
        if average is None:
            average = 0

        # store the new values back onto the game row
        cursor.execute(
            "UPDATE games SET average_rating = %s, review_count = %s WHERE game_id = %s",
            (average, count, game_id),
        )
        connection.commit()
        cursor.close()
        connection.close()


    @staticmethod
    def search(term):
        # find games whose title matches the search term, case insensitive
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT game_id, title, developer, release_year, description, average_rating, review_count, genre FROM games WHERE title ILIKE %s ORDER BY title",
            ("%" + term + "%",),
        )
        rows = cursor.fetchall()
        cursor.close()
        connection.close()
        games = []
        for row in rows:
            games.append(Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]))
        return games


    @staticmethod
    def create(title, developer, release_year, description, genre):
        # insert a new game, return its new id
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO games (title, developer, release_year, description, genre) VALUES (%s, %s, %s, %s, %s) RETURNING game_id",
                (title, developer, release_year, description, genre),
            )
            new_id = cursor.fetchone()[0]
            connection.commit()
            return new_id
        finally:
            cursor.close()
            connection.close()



    @staticmethod
    def update(game_id, title, developer, release_year, description, genre):
        # update to an existing game, return the game_id or None if it did not exist
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                "UPDATE games SET title = %s, developer = %s, release_year = %s, description = %s, genre = %s WHERE game_id = %s RETURNING game_id",
                (title, developer, release_year, description, genre, game_id),
            )
            row = cursor.fetchone()
            connection.commit()
            return row[0] if row else None
        finally:
            cursor.close()
            connection.close()



    @staticmethod
    def delete(game_id):
        # delete a game, reutn the game_id or None if it did not exist
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                "DELETE FROM games WHERE game_id = %s RETURNING game_id",
                (game_id,),
            )
            row = cursor.fetchone()
            connection.commit()
            return row[0] if row else None
        finally:
            cursor.close()
            connection.close()


    @staticmethod
    def get_by_genre(genre):
        # find all games in a single genre
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT game_id, title, developer, release_year, description, average_rating, review_count, genre FROM games WHERE genre = %s ORDER BY title",
            (genre,),
        )
        rows = cursor.fetchall()
        cursor.close()
        connection.close()
        games = []
        for row in rows:
            games.append(Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]))
        return games
