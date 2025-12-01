import { useEffect, useState } from "react";
import { getUserRole } from "../utils/auth";

export default function TransactionsPage() {
  const role = getUserRole();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  if (role === "ROLE_ADMIN") {
    window.location.href = "/users";
    return null;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/wallets/me/transactions", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento delle transazioni");
        return res.json();
      })
      .then((data) => setTransactions(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h2>Le tue transazioni</h2>

      {transactions.length === 0 ? (
        <p>Nessuna transazione trovata.</p>
      ) : (
        transactions.map((t, index) => (
          <div key={index} style={{
            border: "1px solid #ddd",
            padding: 10,
            borderRadius: 5,
            marginBottom: 10
          }}>
            <p><strong>Tipo:</strong> {t.type}</p>
            <p><strong>Importo:</strong> {t.amount} €</p>
            <p><strong>Nuovo saldo:</strong> {t.newBalance} €</p>
            <p><strong>Descrizione:</strong> {t.description}</p>
            <p><strong>Data:</strong> {new Date(t.createdAt).toLocaleString()}</p>
          </div>
        ))
      )}

      <a href="/dashboard">⬅️ Torna al portafoglio</a>
    </div>
  );
}
