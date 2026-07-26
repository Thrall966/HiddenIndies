import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Profile() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">My Account</h2>

      <div className="bg-white border border-[#e6e6e0] rounded-lg p-5 mb-6">
        <div className="text-xs font-mono text-[#9a9a90]">USERNAME</div>
        <div className="text-sm text-[#2b2b2b] mt-1">{username}</div>
      </div>

      {/* danger zone, delete account */}
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