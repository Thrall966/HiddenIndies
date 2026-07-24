import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AuthForm() {
  // which tab is active register or login
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "register");

  // form field state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // feedback state
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // switch between log in and register, clearing any old message
  function switchMode(newMode) {
    setMode(newMode);
    setMessage("");
    setIsError(false);
  }

  // sends the form to the backend, /register or /login depending on mode
  async function handleSubmit() {
    const endpoint = mode === "register" ? "/register" : "/login";

    // register sends three fields, login only needs email and password
    const body =
      mode === "register"
        ? { username, email, password }
        : { email, password };

    try {
      const response = await fetch("http://localhost:8000" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        if (mode === "register") {
          setMessage(data.message);
        } else {
          // store the token and username so the app knows who is logged in
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("username", data.username);
          navigate("/browse");
        }
      } else {
        setIsError(true);
        setMessage(data.detail);
      }
    } catch (error) {
      setIsError(true);
      setMessage("Could not reach the server.");
    }
  }

  return (
    <div className="min-h-screen bg-[#ececdf] flex items-center justify-center p-6">
      {/* card */}
      <div className="bg-white border border-[#e6e6e0] rounded shadow-lg w-full max-w-md min-h-[520px]">
        <div className="px-8 py-10 flex flex-col items-center">
          {/* brand */}
          <div className="text-2xl font-bold text-[#2b2b2b]">HiddenIndies</div>
          <div className="text-xs text-[#a8a8a0] mt-1 font-mono">
            find the games nobody's talking about
          </div>

          {/* log in / register toggle */}
          <div className="flex gap-1 mt-6 bg-[#f1f1ea] rounded-lg p-1 w-80">
            <button
              onClick={() => switchMode("login")}
              className={
                "flex-1 text-center py-2 rounded-md text-sm transition " +
                (mode === "login"
                  ? "bg-white font-semibold text-[#2b2b2b] shadow-sm"
                  : "text-[#a8a8a0]")
              }
            >
              Log in
            </button>
            <button
              onClick={() => switchMode("register")}
              className={
                "flex-1 text-center py-2 rounded-md text-sm transition " +
                (mode === "register"
                  ? "bg-white font-semibold text-[#2b2b2b] shadow-sm"
                  : "text-[#a8a8a0]")
              }
            >
              Register
            </button>
          </div>

          {/* fields, wrapped in a form so pressing enter submits */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="w-80 mt-6 flex flex-col gap-3.5"
          >
            {/* username only shows when registering */}
            {mode === "register" && (
              <div>
                <div className="text-[11px] font-mono text-[#9a9a90] mb-1.5">
                  USERNAME
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-[38px] w-full border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
                />
              </div>
            )}

            <div>
              <div className="text-[11px] font-mono text-[#9a9a90] mb-1.5">
                EMAIL
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[38px] w-full border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
              />
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#9a9a90] mb-1.5">
                PASSWORD
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[38px] w-full border-[1.5px] border-[#d8d8d0] rounded-md px-3 text-sm outline-none focus:border-[#2b2b2b]"
              />
            </div>

            {/* submit */}
            <button
              type="submit"
              className="h-[42px] bg-[#2b2b2b] text-white font-semibold text-sm rounded-md mt-1 hover:bg-black transition"
            >
              {mode === "register" ? "Create account" : "Log in"}
            </button>

            {/* switch link */}
            <div className="text-center text-xs text-[#9a9a90]">
              {mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => switchMode("login")}
                    className="text-[#2b2b2b] underline cursor-pointer"
                  >
                    Log in
                  </span>
                </>
              ) : (
                <>
                  No account yet?{" "}
                  <span
                    onClick={() => switchMode("register")}
                    className="text-[#2b2b2b] underline cursor-pointer"
                  >
                    Register
                  </span>
                </>
              )}
            </div>

            {/* feedback message */}
            {message && (
              <div
                className={
                  "text-center text-xs mt-1 " +
                  (isError ? "text-[#c0392b]" : "text-[#2b2b2b]")
                }
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;