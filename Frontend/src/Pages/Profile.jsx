import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Profile() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState("");
  const [editText, setEditText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);

// fetch the logged in user's own reviews when the page loads
useEffect(() => {
    async function loadMyReviews() {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/my-reviews", {
            headers: { Authorization: "Bearer " + token },
        });
        if (response.ok) {
            setReviews(await response.json());
        }
        
    }
    loadMyReviews();
}, []);



  // call the protected delete-account endpoint
  async function deleteAccount() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/account", {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (response.ok) {
        // log out and send them to browse
        logout();
        navigate("/browse");
      } else {
        const data = await response.json();
        setMessage(data.detail || "Could not delete account.");
      }
    } catch (error) {
      setMessage("Could not reach the server.");
    }
  }
  // delete one of the user's reviews
 async function deleteReview(reviewId) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/reviews/" + reviewId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
    });
    if (response.ok) {
        // remove the deleted review from the list
        setReviews(reviews.filter((r) => r.review_id !== reviewId));
    }
}
  // start editing a review, filling form with its current values
  function startEdit(review) {
    setEditingId(review.review_id);
    setEditRating(String(review.rating));
    setEditText(review.review_text);
  }

   // save the edited review
   async function saveEdit(reviewId) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/reviews/" + reviewId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
    },
    body: JSON. stringify({
        rating: Number(editRating),
        review_text: editText,
    }),
   });
   if (response.ok) {
    // update the review in the list with the new values
    setReviews(
        reviews.map((r) =>
            r.review_id === reviewId
             ? { ...r, rating: Number(editRating), review_text: editText }
             :r
    )
);
// leave edit mode
setEditingId(null);
   }
}



  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">My Account</h2>

      <div className="bg-white border border-[#e6e6e0] rounded-lg p-5 mb-6">
        <div className="text-xs font-mono text-[#9a9a90]">USERNAME</div>
        <div className="text-sm text-[#2b2b2b] mt-1">{username}</div>
      </div>

      {/* the user's reviews */}
      <div className="bg-white border border-[#e6e6e0] rounded-lg p-5 mb-6">
        <div className="text-xs font-mono text-[#9a9a90] mb-3">MY REVIEWS</div>

        {reviews.length === 0 ? (
            <p className="text-xs text-[#a8a8a0]">you have not written any reviews yet</p>
        ) : (
        <div className="flex flex-col gap-3">
            {reviews.map((review)  => (
              <div
                key={review.review_id}
                className="border border-[#e6e6e0] rounded-md p-3"
              >
                {editingId === review.review_id ? (
                  // edit mode, show the form
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold text-[#2b2b2b]">
                      {review.game_title}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editRating}
                      onChange={(e) => setEditRating(e.target.value)}
                      className="w-20 h-[34px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
                    />
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border-[1.5px] border-[#d8d8d0] rounded-md px-3 py-2 text-sm outline-none focus:border-[#2b2b2b] min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(review.review_id)}
                        className="text-xs px-3 py-1.5 bg-[#2b2b2b] text-white rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1.5 border border-[#d8d8d0] text-[#6b6b63] rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // normal mode, show the review
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#2b2b2b]">
                        {review.game_title}
                      </span>
                      <span className="text-xs text-[#6b6b63]">
                        ★ {review.rating}/10
                      </span>
                    </div>
                    <p className="text-xs text-[#6b6b63] mt-1">{review.review_text}</p>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => startEdit(review)}
                        className="text-xs text-[#2b2b2b] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReview(review.review_id)}
                        className="text-xs text-[#c0392b] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
        )}
        </div>
                       
        

      {/* delete account */}
      <div className="bg-white border border-[#e6e6e0] rounded-lg p-5">
        <div className="text-sm font-semibold text-[#c0392b] mb-1">
          Delete account
        </div>
        <p className="text-xs text-[#6b6b63] mb-4">
          this permanently deletes your account. your reviews will be anonymised
          but their ratings kept. this cannot be undone.
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs px-4 py-2 border border-[#c0392b] text-[#c0392b] rounded-md hover:bg-[#c0392b] hover:text-white transition"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#2b2b2b]">Are you sure?</span>
            <button
              onClick={deleteAccount}
              className="text-xs px-4 py-2 bg-[#c0392b] text-white rounded-md"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-4 py-2 border border-[#d8d8d0] text-[#6b6b63] rounded-md"
            >
              Cancel
            </button>
          </div>
        )}

        {message && (
          <div className="text-xs text-[#c0392b] mt-3">{message}</div>
        )}
      </div>
    </div>
  );
}

export default Profile;