import { createContext, useState, useContext, useEffect } from "react";

// holds auth state
const AuthContext = createContext();

// wraps the app and provides auth state to everything inside it
export function AuthProvider({ children }) {
  // read any existing login from localStorage when the app first loads
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [authMessage, setAuthMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // called on successful login
  function login(token, name, userRole) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", name);
    localStorage.setItem("role", userRole);
    setUsername(name);
    setRole(userRole);
    setAuthMessage("");
  }

  // called on logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUsername(null);
    setRole(null);
  }


// load the logged in user's avatar when the app starts
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  async function loadAvatar() {
    const response = await fetch("http://localhost:8000/account/avatar", {
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setAvatarUrl(data.avatar_url);
    }
  }
  loadAvatar();
}, [username]);



  return (
    <AuthContext.Provider value={{ username, role, login, logout, authMessage, setAuthMessage, avatarUrl, setAvatarUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

// a small helper so components can read the auth state easily
export function useAuth() {
  return useContext(AuthContext);
}