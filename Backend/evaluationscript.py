from models.discovery import DiscoveryEngine

# Evaluation script comparing raw average ranking against the bayesian gem score
# run from the backend folder with the seeded database in place

def main():
    global_mean = DiscoveryEngine.get_global_mean()
    print("global mean accross rated games:", round(global_mean, 2))
    print()

    # get the games ranked by gem score from the real algorithm
    gem_ranked = DiscoveryEngine.get_ranked_games()

    # build a raw average ranking of the same games, highest average first
    raw_ranked = sorted(gem_ranked, key=lambda g: g["average_rating"], reverse=True)

    #  print the raw average ranking
    print ("ranked by raw average rating")
    for position, game in enumerate(raw_ranked, start=1):
        print(position, game["title"], game["average_rating"], "avg", game["review_count"], "reviews")
    print()

    # print the gem score ranking
    print ("ranked by gem score")
    for position, game in enumerate(gem_ranked, start=1):
        print(position, game["title"], game["gem_score"], "gem", game["average_rating"], "avg", game["review_count"], "reviews")
if __name__ == "__main__":
    main()