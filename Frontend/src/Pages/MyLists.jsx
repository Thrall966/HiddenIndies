import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MyLists() {
  const [wishlist, setWishlist] = useState([]);

  // load the user's wishlist when the page opens
  useEffect(() => {
    async function loadWishlist() {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/wishlist", {
        headers: { Authorization: "Bearer " + token },
    });
    if (response.ok) {
      setWishlist(await response.json());
    }
  }
  loadWishlist();
}, []);




// remove a game from the wishlist
  async function removeFromWishlist(gameId) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/wishlist/" + gameId, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    if (response.ok) {
      // drop it from the list so it disappears immediately
      setWishlist(wishlist.filter((g) => g.game_id !== gameId));
    }
  }

  
return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <p className="text-sm text-[#7a7a72]">your wishlist is empty</p>
      ) : (
        <div className="flex flex-col gap-2">
          {wishlist.map((game) => (
            <Link
              key={game.game_id}
              to={"/game/" + game.game_id}
              className="flex items-center justify-between bg-white border border-[#e6e6e0] rounded-md p-3 hover:border-[#b8902f] transition"
            >
              <div>
                <div className="text-sm font-semibold text-[#2b2b2b]">{game.title}</div>
                <div className="text-xs text-[#7a7a72]">{game.developer} · {game.release_year}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#6b6b63]">★ {game.average_rating}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(game.game_id);
                  }}
                  className="text-xs text-[#c0392b] hover:underline"
                >
                  Remove
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyLists;