import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import AuthForm from "./pages/AuthForm";
import Discover from "./pages/Discover";
import Browse from "./pages/Browse";
import MyLists from "./pages/MyLists";
import GameDetail from "./pages/GameDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

// every page sits inside the same shell, so the header is always present
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#ececdf]">
      <Header />
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* browse is the home page, open to everyone */}
          <Route path="/" element={<Browse />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
          <Route path="/profile" element={<Profile />} />

          {/* logging in is only needed for personal features */}
          <Route path="/lists" element={<MyLists />} />

          {/* auth screens */}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/register" element={<AuthForm />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;