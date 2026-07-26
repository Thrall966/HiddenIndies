from fastapi import APIRouter , HTTPException, Depends
from models.game import Game
from models.review import Review
from models.user import UserAccount
from models.discovery import DiscoveryEngine
from auth_utils import get_current_user
from pydantic import BaseModel
import psycopg2

router = APIRouter()


# browse controller, returns all games in the catalogue
@router.get("/games")
def get_games():
    games = Game.get_all()

    # turn each Game object into a plain dictionary the frontend can read as json
    result = []
    for game in games:
        result.append({
            "game_id": game.game_id,
            "title": game.title,
            "developer": game.developer,
            "release_year": game.release_year,
            "description": game.description,
            "average_rating": float(game.average_rating),
            "review_count": game.review_count,
        })
    return result

# view game details controller, returns a single game by its id
@router.get("/games/{game_id}")
def get_game(game_id: int):
    game = Game.find_by_id(game_id)

    # if no game with that id exists, return a 404
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found.")

    return {
        "game_id": game.game_id,
        "title": game.title,
        "developer": game.developer,
        "release_year": game.release_year,
        "description": game.description,
        "average_rating": float(game.average_rating),
        "review_count": game.review_count,
    }

# returns all reviews for a single game
@router.get("/games/{game_id}/reviews")
def get_reviews(game_id: int):
    reviews = Review.get_for_game(game_id)

    # turn each Review object into a plain dictionary for json
    result = []
    for review in reviews:
        result.append({
            "review_id": review.review_id,
            "username": review.username,
            "rating": review.rating,
            "review_text": review.review_text,
            "created_at": str(review.created_at),
        })
    return result


# discover controller, returns games ranked by their gem score
@router.get("/discover")
def discover():
    return DiscoveryEngine.get_ranked_games()


# shape of the data the review form sends
class ReviewRequest(BaseModel):
    rating: int
    review_text: str


# write review controller, protected so only logged-in users can post
@router.post("/games/{game_id}/reviews")
def create_review(game_id: int, payload: ReviewRequest, user_email: str = Depends(get_current_user)):
    # verify the game exists
    game = Game.find_by_id(game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found.")

    # validate the rating range
    if payload.rating < 1 or payload.rating > 10:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 10.")

    # find out who the logged-in user is
    user = UserAccount.find_by_email(user_email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found.")

    # create and save the review, catch if user already has a review for this game
    review = Review(user.user_id, game_id, payload.rating, payload.review_text)
    try:
        review.save()
    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="You have already submitted a review for this game.")
    

    # update the games average rating and review count
    Game.recompute_rating(game_id)

    return {"message": "Review submitted."}