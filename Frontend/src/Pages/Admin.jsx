import { useState, useEffect } from "react";

function Admin() {
    const [games, setGames] = useState([]);
    const [title, setTitle] = useState("");
    const [developer, setDeveloper] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDeveloper, setEditDeveloper] = useState("");
    const [editYear, setEditYear] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [users, setUsers] = useState([]);


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
        }
    }
    loadUsers();
}, []);

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
        },
    ]);
    setTitle("");
    setDeveloper("");
    setReleaseYear("");
    setDescription("");
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
        setMessage(data.detail || "Could not delete game.");
    }
}

   // start editing a game, fill the form with its current values
   function startEditGame(game) {
    setEditingId(game.game_id);
    setEditTitle(game.title);
    setEditDeveloper(game.developer);
    setEditYear(String(game.release_year));
    setEditDescription(game.description);
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
    async function deleteUser(userId) {
        const token = localStorage.getItem("token");
        const response = await fetch ("http://localhost:8000/admin/users/" + userId, {
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
        
    }












return (
<div className="p-8 max-w-3xl">
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
                        onClick={() => deleteGame(game.game_id)}
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
                      onClick={() => deleteUser(user.user_id)}
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