from database import get_db_connection



class Wishlist:
    @staticmethod
    def add(user_id, game_id):
        # add a game to a user's wishlist
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                "INSERT INTO wishlist (user_id, game_id) VALUES (%s, %s) RETURNING wishlist_id",
                (user_id, game_id),
            )
            new_id = cursor.fetchone()[0]
            connection.commit()
            return new_id
        finally:
            cursor.close()
            connection.close()


    @staticmethod
    def remove(user_id, game_id):
        # remove a game from a user's wishlist
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            cursor.execute(
                "DELETE FROM wishlist WHERE user_id = %s AND game_id = %s RETURNING wishlist_id",
                (user_id, game_id),
            )
            row = cursor.fetchone()
            connection.commit()
            return row[0] if row else None
        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def get_for_user(user_id):
        # fetch all games on a user's wishlist, with game details
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "SELECT games.game_id, games.title, games.developer, games.release_year, games.average_rating "
            "FROM wishlist JOIN games on wishlist.game_id = games.game_id "
            "WHERE wishlist.user_id = %s ORDER BY wishlist.created_at DESC",
            (user_id,),
        )
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        games = []
        for row in rows:
            games.append({
                "game_id": row[0],
                "title": row[1],
                "developer": row[2],
                "release_year": row[3],
                "average_rating": float(row[4]),
            })
        return games