import { useState, useEffect } from "react";

function Browse() {
  // holds the list of games once fetched
  const [games, setGames] = useState([]);

  // runs once when the page loads, fetches the games
  useEffect(() => {
    async function loadGames() {
      const response = await fetch("http://localhost:8000/games");
      const data = await response.json();
      setGames(data);
    }
    loadGames();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">Browse Games</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div
            key={game.game_id}
            className="bg-white border border-[#e6e6e0] rounded-lg p-4"
          >
            <div className="font-semibold text-[#2b2b2b]">{game.title}</div>
            <div className="text-xs text-[#7a7a72] mt-0.5">
              {game.developer} · {game.release_year}
            </div>
            <p className="text-xs text-[#6b6b63] mt-2 line-clamp-2">
              {game.description}
            </p>

            {/* the two scores from the wireframe */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="text-[#6b6b63]">
                ★ {game.average_rating.toFixed(1)}
              </span>
              <span className="text-[#b8902f] font-semibold">
                ◆ gem
              </span>
              <span className="text-[#a8a8a0]">
                {game.review_count} reviews
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Browse;