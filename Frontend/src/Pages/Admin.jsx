import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Admin() {
    const { logout, setAuthMessage } = useAuth();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [title, setTitle] = useState("");
    const [developer, setDeveloper] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [uploadingCover, setUploadingCover] = useState(false);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDeveloper, setEditDeveloper] = useState("");
    const [editYear, setEditYear] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editGenre, setEditGenre] = useState("");
    const [editCoverUrl, setEditCoverUrl] = useState("");
    const [users, setUsers] = useState([]);
    const [gameToDelete, setGameToDelete] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    


    // load all games so the admin can manage them
    useEffect(() => {
     async function loadGames() {
        const response = await fetch("http://localhost:8000/games");
        const data = await response.json();
        setGames(data);
    }
    loadGames();
}, []);

     useEffect(() => {
        async function loadUsers() {
            const token = localStorage.getItem("token");
            const response = await fetch ("http://localhost:8000/admin/users", { 
                headers: { Authorization: "Bearer " + token },
            });
            if (response.ok) {
                setUsers(await response.json());
            } else if 
                (response.status === 401) {
                    setAuthMessage("Your session has expired. Please log in again.");
                    logout();
                    navigate("/login");
        }
    }
    loadUsers();
}, []);

    // upload a cover image to cloudinary and store the url via setter
    async function uploadCover(event, setter) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        setUploadingCover(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "cloudinary");
        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/hiaob1yl/image/upload", 
                { method: "POST", body: formData }
            );
            const data = await response.json();
            if (data.secure_url) {
                setter(data.secure_url);
            } else {
                setMessage("Could not upload cover image.");
            }
        } catch (error) {
            setMessage("Could not reach the image service.");
        }
        setUploadingCover(false);
    }

    // create a new game via the admin endpoint
    async function createGame() {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/admin/games", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
        title: title,
        developer: developer,
        release_year: Number(releaseYear),
        description: description,
        genre: genre,
        cover_url: coverUrl,
    }),
});

if (response.ok) {
    const data = await response.json();
    setGames([
        ...games,
        {
            game_id: data.game_id,
            title: title,
            developer: developer,
            release_year: Number(releaseYear),
            description: description,
            average_rating: 0,
            review_count: 0,
            genre: genre,
        },
    ]);
    setTitle("");
    setDeveloper("");
    setReleaseYear("");
    setDescription("");
    setGenre("");
    setMessage("Game added.");
} else {
    const data = await response.json();
    setMessage(data.detail || "Could not add game.");
}
    }


   // delete a game via the admin endpoint
   async function deleteGame(gameId) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8000/admin/games/" + gameId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
    });
    
    if (response.ok) {
        // remove it from the list
        setGames(games.filter((g) => g.game_id !== gameId));
        setMessage("Game deleted.");
    } else {
        const data = await response.json();
        setMessage(data.detail === "string" ? data.detail : "Could not delete game.");
    }
     setGameToDelete(null); // close the confirmation modal
}

   // start editing a game, fill the form with its current values
   function startEditGame(game) {
    setEditingId(game.game_id);
    setEditTitle(game.title);
    setEditDeveloper(game.developer);
    setEditYear(String(game.release_year));
    setEditDescription(game.description);
    setEditGenre(game.genre);
    setEditCoverUrl(game.cover_url || "");
   }

   // save the edited game via the admin endpoint
   async function saveGame(gameId) {
    const token = localStorage.getItem("token");
    const response = await fetch ("http://localhost:8000/admin/games/" + gameId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
            title: editTitle,
            developer: editDeveloper,
            release_year : Number(editYear),
            description: editDescription,
            genre: editGenre,
            cover_url: editCoverUrl,
        }),
    });

    if (response.ok) {
        // update the game in the list with the new values
        setGames(
            games.map((g) =>
                g.game_id === gameId
            ?{
                ...g,
                title: editTitle,
                developer: editDeveloper,
                release_year: Number(editYear),
                description: editDescription,
                genre: editGenre,
            }
            :g
        )
    );
    setEditingId(null);
    setMessage("Game updated.");
} else {
    const data = await response.json();
    setMessage(data.detail || "Could not update game.");
}
   }

    // delete a user via the admin endpoint
    async function deleteUser(userId, mode) {
        const token = localStorage.getItem("token");
        const response = await fetch ("http://localhost:8000/admin/users/" + userId + "?mode=" + mode, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token },
        });
        if (response.ok) {
            // reload the users so the list reflects the anonymised account
            const refreshed = await fetch("http://localhost:8000/admin/users", {
                headers: { Authorization: "Bearer " + token },
            });
            if (refreshed.ok) {
            setUsers(await refreshed.json());
        }
            setMessage("User deleted. ");
    } else {
        const data = await response.json();
        setMessage(data.detail || "Could not delete user. ");
    }
        setUserToDelete(null); // close the confirmation modal
    }


return (
<div className="p-8 max-w-3xl">
    {/* confirmation modal for deleting a game */}
            {gameToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg">
                        <div className="text-lg font-semibold text-[#2b2b2b] mb-3">
                            Delete "{gameToDelete.title}"?
                        </div>
                        <div className="text-sm text-[#6a6a60] mb-6">
                            Deleting this game will also permanently remove all of its
                            reviews and ratings. This action cannot be undone.
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setGameToDelete(null)}
                                className="text-sm text-[#6a6a60] hover:underline px-3 py-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteGame(gameToDelete.game_id)}
                                className="text-sm text-white bg-[#c0392b] hover:bg-[#a93226] rounded px-4 py-1"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* confirmation modal for deleting a user */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg">
            <div className="text-lg font-semibold text-[#2b2b2b] mb-3">
              Delete "{userToDelete.username}"?
            </div>
            <div className="text-sm text-[#6a6a60] mb-5">
              Choose how to delete this user's account.
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => deleteUser(userToDelete.user_id, "anonymise")}
                className="text-sm px-4 py-2 border border-[#c0392b] text-[#c0392b] rounded-md text-left"
              >
                Anonymise the account, remove personal details but keep the
                ratings
              </button>
              <button
                onClick={() => deleteUser(userToDelete.user_id, "full")}
                className="text-sm px-4 py-2 bg-[#c0392b] text-white rounded-md text-left"
              >
                Delete everything, remove the account and all of its ratings and
                reviews permanently
              </button>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-sm px-4 py-2 border border-[#d8d8d0] text-[#6b6b63] rounded-md self-start"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    <h2 className="text-xl font-semibold text-[#2b2b2b] mb-6">Admin Manage Catalogue </h2>
    <p className="text-xs text-[#7a7a72]">{games.length} games in the catalogue</p>

    {/* add a new game */}
    <div className="bg-white border border-[#e6e6e0] rounded-lg p-5 mb-6">
        <div className="text-xs font-mono text-[#9a9a90] mb-3">ADD A GAME</div>
        <div className="flex flex-col gap-3">
            <input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
            />
            <input
                placeholder="developer"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
            />
            <input
                type="number"
                placeholder="release year"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
            />
             <textarea
                placeholder="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-[1.5px] border-[#d8d8d0] rounded-md px-3 py-2 text-sm outline-none focus:border-[#2b2b2b] min-h-[60px]"
            />
            <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
            >
                <option value="">Select genre</option>
                {["Adventure", "Card Game", "Horror", "Metroidvania", "Platformer", "Puzzle", "RPG", "Roguelike", "Simulation"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>
            {/* cover image upload */}
            <div className="flex items-center gap-3">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="cover preview"
                  className="w-16 h-20 object-cover rounded border border-[#d8d8d0]"
                />
              ) : (
                <div className="w-16 h-20 rounded border border-[#d8d8d0] bg-[#f0f0ea] flex items-center justify-center text-[10px] text-[#9a9a90] text-center">
                  no cover
                </div>
              )}
              <label className="text-xs text-[#2b2b2b] underline cursor-pointer">
                {uploadingCover ? "uploading..." : "upload cover image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadCover(e, setCoverUrl)}
                  className="hidden"
                />
              </label>
            </div>
            <button
                onClick={createGame}
                className="h-[38px] px-4 bg-[#2b2b2b] text-white text-sm font-semibold rounded-md hover:bg-black transition self-start"
            >
                Add game
            </button>
            {message && (
                <div className="text-xs text-[#6b6b63]">{message}</div>
            )}
        </div>
    </div>
    {/* edit form, only shows when a game is being edited */}
    {editingId !== null && (
      <div className="bg-white border border-[#b8902f] rounded-lg p-5 mb-6">
        <div className="text-xs font-mono text-[#9a9a90] mb-3">EDIT GAME</div>
        <div className="flex flex-col gap-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
          />
          <input
            value={editDeveloper}
            onChange={(e) => setEditDeveloper(e.target.value)}
            className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
          />
          <input
            type="number"
            value={editYear}
            onChange={(e) => setEditYear(e.target.value)}
            className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="border-[1.5px] border-[#d8d8d0] rounded-md px-3 py-2 text-sm outline-none focus:border-[#2b2b2b] min-h-[60px]"
          />
            <select
            value={editGenre}
            onChange={(e) => setEditGenre(e.target.value)}
            className="h-[38px] border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
          >
            <option value="">Select genre</option>
            {["Adventure", "Card Game", "Horror", "Metroidvania", "Platformer", "Puzzle", "RPG", "Roguelike", "Simulation"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {/* cover image upload for editing */}
          <div className="flex items-center gap-3">
            {editCoverUrl ? (
              <img
                src={editCoverUrl}
                alt="cover preview"
                className="w-16 h-20 object-cover rounded border border-[#d8d8d0]"
              />
            ) : (
              <div className="w-16 h-20 rounded border border-[#d8d8d0] bg-[#f0f0ea] flex items-center justify-center text-[10px] text-[#9a9a90] text-center">
                no cover
              </div>
            )}
            <label className="text-xs text-[#2b2b2b] underline cursor-pointer">
              {uploadingCover ? "uploading..." : "upload cover image"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadCover(e, setEditCoverUrl)}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveGame(editingId)}
              className="h-[38px] px-4 bg-[#2b2b2b] text-white text-sm font-semibold rounded-md hover:bg-black transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="h-[38px] px-4 border border-[#d8d8d0] text-[#6b6b63] text-sm rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    {/* list of games with delete*/}
    <div className="bg-white border border-[#e6e6e0] rounded-lg p-5">
        <div className="text-xs font-mono text-[#9a9a90] mb-3">ALL GAMES</div>
        <div className="flex flex-col gap-2">
            {games.map((game) => (
                <div
                key={game.game_id}
                className="flex items-center justify-between border border-[#e6e6e0] rounded-md p-3"
                >
                    <div>
                        <div className="text-sm font-semibold text-[#2b2b2b]">{game.title}</div>
                        <div className="text-xs text-[#7a7a72]">{game.developer} · {game.release_year}</div>
                        </div>
                        <div className="flex gap-3">
                        <button
                        onClick={() => startEditGame(game)}
                        className="text-xs text-[#2b2b2b] hover:underline"
                        >
                            Edit
                        </button>
                        <button
                        onClick={() => setGameToDelete(game)}
                        className="text-xs text-[#c0392b] hover:underline"
                        >
                            Delete
                            </button>
                            </div>
                            </div>
            ))}
            </div>
            </div>
            {/* list of users */}
    <div className="bg-white border border-[#e6e6e0] rounded-lg p-5 mt-6">
        <div className="text-xs font-mono text-[#9a9a90] mb-3">ALL USERS</div>
        <div className="flex flex-col gap-2">
            {/* only show non deleted users */}
            {users.filter((user) => !user.is_deleted).map((user) => ( 
                <div
                  key={user.user_id}
                  className="flex items-center justify-between border border-[#e6e6e0] rounded-md p-3"
                >
                    <div>
                        <div className="text-sm font-semibold text-[#2b2b2b]">{user.username}</div>
                        <div className="text-xs text-[#7a7a72]">{user.email} · {user.role}</div>
                    </div>
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="text-xs text-[#c0392b] hover:underline"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    </div>
 </div>
);
}

export default Admin;