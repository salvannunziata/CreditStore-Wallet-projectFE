import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/users/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      alert("Errore nella registrazione");
      return;
    }

    const loginResponse = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.token) {
      alert("Registrazione riuscita, ma login automatico fallito");
      return;
    }

    localStorage.setItem("token", loginData.token);


    navigate("/dashboard");
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Registrazione</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

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
          Registrati
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <p>Hai già un account?</p>
        <button onClick={() => navigate("/login")}>Vai al Login</button>
      </div>
    </div>
  );
}
