import { useState } from "react";

function RegisterForm() {
  //  holds what the user types into each field
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // sends the form data to the registration endpoint
  async function handleSubmit() {
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage("Error: " + data.detail);
      }
    } catch (error) {
      setMessage("Could not reach the server.");
    }
  }

  return (
    <div>
      <h2>Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleSubmit}>Submit</button>

      <p>{message}</p>
    </div>
  );
}

export default RegisterForm;