from fastapi import APIRouter
from models.game import Game

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