import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {useState} from "react";


function Header() {
  const { username, role, logout, avatarUrl } = useAuth();
  const navigate = useNavigate();


  const [searchTerm, setSearchTerm] = useState("");

  // on enter, go to browse with the search term in the url
  function handleSearch(e) {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate("/browse?search=" + encodeURIComponent(searchTerm.trim()));
    }
  }

  function handleLogout() {
    logout();
    navigate("/browse");
  }
  // shared styling for each nav link, with a gold underline when active
  function navClass({ isActive }) {
    return isActive
      ? "text-[#2b2b2b] font-semibold border-b-2 border-[#b8902f] pb-0.5"
      : "text-[#6b6b63] hover:text-[#2b2b2b] pb-0.5";
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-[#ececea] bg-white">
      {/* brand, clicking it goes home to browse */}
      <Link to="/" className="text-lg font-bold text-[#2b2b2b]">
        HiddenIndies
      </Link>

      {/* search box */}
      <div className="flex-1 max-w-[340px] h-8 rounded-2xl border-[1.5px] border-[#d8d8d0] flex items-center px-3.5 gap-2">
        <span className="text-[#bdbdb4] text-xs">⌕</span>
        <input
          placeholder="search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="flex-1 text-xs font-mono text-[#6b6b63] placeholder-[#bdbdb4] outline-none bg-transparent"
        />
      </div>

      {/* nav links */}
      <div className="ml-auto flex items-center gap-5 text-sm">
        <NavLink to="/browse" className={navClass}>
          Browse
        </NavLink>
        <NavLink to="/discover" className={navClass}>
          Discover
        </NavLink>
        {username && (
        <NavLink to="/lists" className={navClass}>
          My Lists
        </NavLink>
        )}
        {role === "admin" && (
          <NavLink to="/admin" className={navClass}>
            Admin
          </NavLink>
        )}

        {/* show username and logout when logged in, otherwise a login link */}
        {username ? (
          <div className="ml-2 flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 text-sm text-[#2b2b2b] font-semibold">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#e6e6e0]" />
              )}
              {username}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-[#6b6b63] underline"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="ml-2 px-3 py-1.5 rounded-md bg-[#2b2b2b] text-white text-xs font-semibold"
          >
            Log in
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;