import { createContext, useState, useContext } from "react";

// holds auth state
const AuthContext = createContext();

// wraps the app and provides auth state to everything inside it
export function AuthProvider({ children }) {
  // read any existing login from localStorage when the app first loads
  const [username, setUsername] = useState(localStorage.getItem("username"));

  // called on successful login
  function login(token, name) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", name);
    setUsername(name);
  }

  // called on logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// a small helper so components can read the auth state easily
export function useAuth() {
  return useContext(AuthContext);
}