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

        # global mean is average of all game's average ratings that have reviews
        rated_games = [row for row in rows if row[6] > 0]
        if len(rated_games) == 0:
            global_mean = 0
        else:
            global_mean = sum(float(row[5]) for row in rated_games) / len(rated_games)


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


