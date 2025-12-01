import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    const token = data.token;

    localStorage.setItem("token", token);

    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;

    if (role === "ROLE_ADMIN") {
      navigate("/users");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Accedi
        </button>
      </form>
    <div style={{ marginTop: "20px" }}>
      <p>Non hai un account?</p>
        <button onClick={() => navigate("/register")}>
        Registrati
        </button>
    </div>

    </div>
    
  );
}
