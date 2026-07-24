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