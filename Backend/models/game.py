from database import get_db_connection


class Game:
    # constructor to hold one games data
    def __init__(self, game_id, title, developer, release_year, description, average_rating, review_count):
        self.game_id = game_id
        self.title = title
        self.developer = developer
        self.release_year = release_year
        self.description = description
        self.average_rating = average_rating
        self.review_count = review_count

    @staticmethod
    def get_all():
        # fetch every game from the database and return them as a list of Game objects
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT game_id, title, developer, release_year, description, average_rating, review_count FROM games ORDER BY title")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        # turn each row into a Game object
        games = []
        for row in rows:
            games.append(Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
        return games
    @staticmethod
    def find_by_id(game_id):
        # fetch a single game by its id, return a Game object or None
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT game_id, title, developer, release_year, description, average_rating, review_count FROM games WHERE game_id = %s", (game_id,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()

        if row is None:
            return None
        return Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6])

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
            "SELECT game_id, title, developer, release_year, description, average_rating, review_count FROM games WHERE title ILIKE %s ORDER BY title",
            ("%" + term + "%",),
        )
        rows = cursor.fetchall()
        cursor.close()
        connection.close()
        games = []
        for row in rows:
            games.append(Game(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
        return games
