import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

function GameDetail() {
  // read the game id from the url
  const { gameId } = useParams();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { username } = useAuth();

  // state for the review form
    const [rating, setRating] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [formMessage, setFormMessage] = useState("");

  // feedback message for add to wishlist button
  const [wishlistMessage, setWishlistMessage] = useState("");

  // fetch this one game when the page loads
  useEffect(() => {
    async function loadGame() {
      const response = await fetch("http://localhost:8000/games/" + gameId);
      const data = await response.json();
      setGame(data);
    }
    async function loadReviews() {
      const response = await fetch("http://localhost:8000/games/" + gameId + "/reviews");
      const data = await response.json();
      setReviews(data);
    }
    loadGame();
    loadReviews();
  }, [gameId]);

  // submit a new review to a protected endpoint
  async function submitReview() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/games/" + gameId + "/reviews", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ rating: Number(rating), review_text: reviewText }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormMessage("Review submitted successfully!");
        setRating("");
        setReviewText("");
        const refreshed = await fetch("http://localhost:8000/games/" + gameId + "/reviews");
        setReviews(await refreshed.json());
        } else {
            setFormMessage(data.detail);
        }
    } catch (error) {
        setFormMessage("Could not submit review.");
    }
    }

// add this game to user's wishlist
async function addToWishlist() {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:8000/wishlist/" + gameId, {
      method: "POST",
      headers: {Authorization: "Bearer " + token },
    });
    const data = await response.json();
    if (response.ok) {
      setWishlistMessage("Added to wishlist.");
    } else {
      setWishlistMessage(data.detail || "Could not add to wishlist.");
}
  } catch (error) {
    setWishlistMessage("Could not reach the server.");
  }
}


  // while the game is still loading, show nothing yet
  if (game === null) {
    return <div className="p-8 text-sm text-[#7a7a72]">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#2b2b2b]">{game.title}</h2>
      <div className="text-sm text-[#7a7a72] mt-1">
        {game.developer} · {game.release_year} · {game.genre}
      </div>

      <p className="text-sm text-[#6b6b63] mt-4 leading-relaxed">
        {game.description}
      </p>

      {/* the two scores */}
      <div className="flex items-center gap-6 mt-6 text-sm">
        <span className="text-[#6b6b63]">
          ★ {game.average_rating.toFixed(1)} community
        </span>
        <span className="text-[#b8902f] font-semibold">◆ {game.gem_score} gem score</span>
        <span className="text-[#a8a8a0]">{game.review_count} reviews</span>
      </div>
      {/* add to wishlist, only for logged in users */}
      {username && (
        <div className="mt-4">
        <button
        onClick={addToWishlist}
        className="text-xs px-4 py-2 border border-[#b8902f] text-[#b8902f] rounded-md hover:bg-[#b8902f] hover:text-white transition"
        >
          Add to wishlist
        </button>
        {wishlistMessage && (
          <span className="text-xs text-[#6b6b63] ml-3">{wishlistMessage}</span>
        )}
        </div>
      )}

      {/* reviews section */}
      <div className="mt-8 border-t border-[#e6e6e0] pt-6">
        <h3 className="text-sm font-semibold text-[#2b2b2b] mb-4">
          Reviews ({reviews.length})
        </h3>
        {/* review form while logged in, or ask for login */}
        {username ? (
            <div className="bg-white border border-[#e6e6e0] rounded-lg p-4 mb-6">
                <div className="text-xs font-mono text-[#9a9a90] mb-2">
                    WRITE A REVIEW
                </div>
                <div className="flex gap-3 items-start">
                    <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1-10"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-20 h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
                    />
                    <textarea
                        placeholder="your thoughts on this game..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="flex-1 min-h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 py-2 text-sm outline-none focus:border-[#2b2b2b]"
                    />
                    <button
                        onClick={submitReview}
                        className="h-[38px] px-4 bg-[#2b2b2b] text-white text-sm font-semibold rounded-md hover:bg-black transition"
                        >
                        Submit
                    </button>
                </div>
                {formMessage && (
                    <div className="text-xs text-[#6b6b63] mt-2">{formMessage}</div>
                )}
            </div>
        ) : (
            <div className="bg-[#f1f1ea] rounded-lg p-4 mb-6 text-xs text-[#6b6b63]">
                <Link to="/login" className="text-[#2b2b2b] underline font-semibold">
                    Log in
                </Link>{" "}
                to write a review.
            </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-xs text-[#a8a8a0]">no reviews yet</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white border border-[#e6e6e0] rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {review.avatar_url ? (
                      <img
                        src={review.avatar_url}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#e6e6e0]" />
                    )}
                    <span className="text-sm font-semibold text-[#2b2b2b]">
                      {review.username}
                    </span>
                  </div>
                  <span className="text-xs text-[#6b6b63]">
                    ★ {review.rating}/10
                  </span>
                </div>
                <p className="text-xs text-[#6b6b63] mt-2">
                  {review.review_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameDetail;