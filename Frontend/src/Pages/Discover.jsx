import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Discover() {
  const [games, setGames] = useState([]);

  // fetch the gem ranked games when the page loads
  useEffect(() => {
    async function loadDiscover() {
      const response = await fetch("http://localhost:8000/discover");
      const data = await response.json();
      setGames(data);
    }
    loadDiscover();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-1">Hidden Gems</h2>
      <p className="text-xs text-[#7a7a72] mb-6">
        ranked by gem score highly rated games weighted by how many have discovered them
      </p>

      <div className="flex flex-col gap-3">
        {games.map((game, index) => (
          <Link
            key={game.game_id}
            to={"/game/" + game.game_id}
            className="bg-white border border-[#e6e6e0] rounded-lg p-4 flex items-center gap-4 hover:border-[#b8902f] transition"
          >
            {/* rank number */}
            <div className="text-lg font-bold text-[#a8a8a0] w-8 text-center">
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="font-semibold text-[#2b2b2b]">{game.title}</div>
              <div className="text-xs text-[#7a7a72]">
                {game.developer} · {game.release_year}
              </div>
            </div>

            {/* the two scores, gem emphasised */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[#6b6b63]">
                ★ {game.average_rating.toFixed(1)}
              </span>
              <span className="text-[#b8902f] font-semibold">
                ◆ {game.gem_score.toFixed(2)}
              </span>
              <span className="text-[#a8a8a0]">
                {game.review_count} reviews
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Discover;