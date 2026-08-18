import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

function Browse() {
  // holds the list of games once fetched
  const [games, setGames] = useState([]);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "";

  // runs once when the page loads, fetches the games
  useEffect(() => {
    async function loadGames() {
      // include the search term and genre in the request if there are any
      const url = genre
        ? "http://localhost:8000/games?genre=" + encodeURIComponent(genre)
          : search
          ? "http://localhost:8000/games?search=" + encodeURIComponent(search)
        : "http://localhost:8000/games";
      const response = await fetch(url);
      const data = await response.json();
      setGames(data);
    }
    loadGames();
  }, [search, genre]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">Browse Games</h2>


      <div className="flex gap-8">
      {/* genre sidebar */}
      <aside className="w-48 shrink-0">
      <h3 className="text-sm font-semibold text-[#2b2b2b] mb-3">Genres</h3>
     

      {/* all games clears the genre filter */}
      <Link
        to="/browse"
        className={"block text-sm py-1 hover:text-[#b8902f] transition " + (genre === "" ? "text-[#b8902f] font-semibold" : "text-[#6b6b63]")}
        >
        All Games
        </Link>

        {/* one clickable item per genre, sets the genre in the url */}
        {["Adventure", "Card Game", "Horror", "Metroidvania", "Platformer", "Puzzle", "RPG", "Roguelike", "Simulation"].map((g) => (
          <Link
            key={g}
            to={"/browse?genre=" + encodeURIComponent(g)}
            className={"block text-sm py-1 hover:text-[#b8902f] transition " + (genre === g ? "text-[#b8902f] font-semibold" : "text-[#6b6b63]")}
          >
            {g}
          </Link>
        ))}
      </aside>
      {/* game grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link
              key={game.game_id}
              to={"/game/" + game.game_id}
              className="bg-white border border-[#e6e6e0] rounded-lg p-4 block hover:border-[#b8902f] transition"
            >
              {game.cover_url ? (
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 rounded-md mb-3 bg-[#f0f0ea] flex items-center justify-center text-xs text-[#9a9a90]">
                  no cover
                </div>
              )}
              <div className="font-semibold text-[#2b2b2b]">{game.title}</div>
              <div className="text-xs text-[#7a7a72] mt-0.5">
                {game.developer} · {game.release_year}
              </div>
              <p className="text-xs text-[#6b6b63] mt-2 line-clamp-2">
                {game.description}
              </p>
            {/* Average rating score */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className="text-[#6b6b63]">
                ★ {game.average_rating.toFixed(1)}
              </span>
              <span className="text-[#a8a8a0]">
                {game.review_count} reviews
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
</div>        
  );
}

export default Browse;