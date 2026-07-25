from fastapi import APIRouter , HTTPException
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