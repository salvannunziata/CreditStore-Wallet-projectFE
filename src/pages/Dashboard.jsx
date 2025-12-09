import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = getUserRole();
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserName(payload.sub || payload.name || "Utente");

    if (role === "ROLE_ADMIN") {
      navigate("/users");
      return;
    }

    fetch("http://localhost:8080/wallets/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento del wallet");
        return res.json();
      })
      .then((data) => setWallet(data))
      .catch((err) => setError(err.message));
  }, [navigate, role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!wallet) return <p>Caricamento...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h2>Benvenuto, {userName} 👋</h2>
      <div
        style={{
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: "#f9f9f9"
        }}
      >
        <p style={{ fontSize: "1.2em" }}>
          <strong>Saldo attuale:</strong> {wallet.balance} €
        </p>
      </div>
      <a href="/dashboard/transactions" style={{ textDecoration: "none", color: "#007bff" }}>
        📜 Vedi tutte le transazioni
      </a>
      <div style={{ marginTop: 30 }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
