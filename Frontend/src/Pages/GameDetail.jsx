import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function GameDetail() {
  // read the game id from the url
  const { gameId } = useParams();

  const [game, setGame] = useState(null);

  // fetch this one game when the page loads
  useEffect(() => {
    async function loadGame() {
      const response = await fetch("http://localhost:8000/games/" + gameId);
      const data = await response.json();
      setGame(data);
    }
    loadGame();
  }, [gameId]);

  // while the game is still loading, show nothing yet
  if (game === null) {
    return <div className="p-8 text-sm text-[#7a7a72]">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#2b2b2b]">{game.title}</h2>
      <div className="text-sm text-[#7a7a72] mt-1">
        {game.developer} · {game.release_year}
      </div>

      <p className="text-sm text-[#6b6b63] mt-4 leading-relaxed">
        {game.description}
      </p>

      {/* the two scores */}
      <div className="flex items-center gap-6 mt-6 text-sm">
        <span className="text-[#6b6b63]">
          ★ {game.average_rating.toFixed(1)} community
        </span>
        <span className="text-[#b8902f] font-semibold">◆ gem score</span>
        <span className="text-[#a8a8a0]">{game.review_count} reviews</span>
      </div>

      {/* reviews section, empty until we build the review feature */}
      <div className="mt-8 border-t border-[#e6e6e0] pt-6">
        <h3 className="text-sm font-semibold text-[#2b2b2b]">Reviews</h3>
        <p className="text-xs text-[#a8a8a0] mt-2">
          no reviews yet
        </p>
      </div>
    </div>
  );
}

export default GameDetail;