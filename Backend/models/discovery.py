from database import get_db_connection

class DiscoveryEngine:
    # tuning constant: how many reviews before a game's own average is trusted
    C = 10

    @staticmethod
    def compute_gem_score(game_rating, game_review_count, global_mean):
        # Bayesian weighted average between the global mean and the game's own rating
        C = DiscoveryEngine.C
        v = game_review_count
        R = float(game_rating)
        m = float(global_mean)
        return (C * m + v * R) / (C + v)

    @staticmethod
    def get_ranked_games():
        # fetch all games from database, compute each one gem score, return them ranked
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT game_id, title, developer, release_year, description, average_rating, review_count FROM games")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        # computed by the shared method so the logic lives in one place
        global_mean = DiscoveryEngine.get_global_mean()


        # build a list of games with their gem scores
        games = []
        for row in rows:
            gem_score = DiscoveryEngine.compute_gem_score(row[5], row[6], global_mean)
            games.append({
                "game_id": row[0],
                "title": row[1],
                "developer": row[2],
                "release_year": row[3],
                "description": row[4],
                "average_rating": float(row[5]),
                "review_count": row[6],
                "gem_score": round(gem_score, 2),
            })

        # rank by gem score, highest first
        games.sort(key=lambda g: g["gem_score"], reverse=True)
        return games


    @staticmethod
    def get_global_mean():
        # the global mean is the average of all rated games average ratings
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT average_rating, review_count FROM games")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()


        rated_games = [row for row in rows if row[1] > 0]
        if len(rated_games) == 0:
            return 0
        return sum(float(row[0]) for row in rated_games) / len(rated_games)




    @staticmethod
    def get_gem_score_for_game(game_id):
        # compute the gem score for a single game by its id
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT average_rating, review_count FROM games WHERE game_id = %s", (game_id,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()

        if row is None:
            return None

        global_mean = DiscoveryEngine.get_global_mean()
        gem_score = DiscoveryEngine.compute_gem_score(row[0], row[1], global_mean)
        return round(gem_score, 2)