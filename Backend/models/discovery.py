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