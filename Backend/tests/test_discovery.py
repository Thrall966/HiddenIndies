from models.discovery import DiscoveryEngine

# Unit tests for the DiscoveryEngine class, no database needed

def test_low_sample_high_rating_is_pulled_down():
    # a game rated 10 by only 2 reviews, global mean 7.5, C=10
    # (10*7.5 + 2*10) / (10+2) = 95/12 = 7.916666666666667
    score = DiscoveryEngine.compute_gem_score(10, 2, 7.5)
    assert round(score, 2) == 7.92


def test_high_sample_stays_near_own_rating():
        # a game rated 8.5 by 200 reviews doesnt move from 8.5
        # (10*7.5 + 200*8.5) / (10+200) = (75+1700)/210 = 1775/210 = 8.452
        score = DiscoveryEngine.compute_gem_score(8.5, 200, 7.5)
        assert round(score, 2) == 8.45


def test_no_reviews_equals_global_mean():
      # with zero reviews, the score should equal the global mean exactly
      # (10*7.5 + 0*R) / (10+0) = 75/10 = 7.5
      score = DiscoveryEngine.compute_gem_score(10, 0, 7.5)
      assert round(score, 2) == 7.5



def test_rating_equal_to_mean_stays_at_mean():
    # a game rated exactly the global mean stays at the mean regardless of count
    score = DiscoveryEngine.compute_gem_score(7.5, 50, 7.5)
    assert round(score, 2) == 7.5


