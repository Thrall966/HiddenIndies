from database import get_db_connection


class Review:
    # constructor to hold one review's data
    def __init__(self, user_id, game_id, rating, review_text, review_id=None, created_at=None, username=None):
        self.user_id = user_id
        self.game_id = game_id
        self.rating = rating
        self.review_text = review_text
        self.review_id = review_id
        self.created_at = created_at
        self.username = username

    def save(self):
        # inserting review into the database
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO reviews (user_id, game_id, rating, review_text) VALUES (%s, %s, %s, %s) RETURNING review_id",
            (self.user_id, self.game_id, self.rating, self.review_text),
        )
        self.review_id = cursor.fetchone()[0]
        connection.commit()
        cursor.close()
        connection.close()
        return self

    @staticmethod
    def get_for_game(game_id):
        # fetch all reviews for one game, newest first including the author's username
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT reviews.review_id, reviews.user_id, reviews.game_id, reviews.rating, reviews.review_text, reviews.created_at, users.username "
            "FROM reviews JOIN users ON reviews.user_id = users.user_id "
            "WHERE reviews.game_id = %s ORDER BY reviews.created_at DESC",
            (game_id,),
        )
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        reviews = []
        for row in rows:
            reviews.append(Review(
                review_id=row[0],
                user_id=row[1],
                game_id=row[2],
                rating=row[3],
                review_text=row[4],
                created_at=row[5],
                username=row[6],
            ))
        return reviews