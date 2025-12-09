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

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 700, margin: "50px auto" }}>
      <h2>Le tue transazioni</h2>

      {transactions.length === 0 ? (
        <p>Nessuna transazione trovata.</p>
      ) : (
        transactions.map((t, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
              backgroundColor: "#f9f9f9"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>
                {t.type === "WITHDRAW" ? (
                  <span style={{ color: "red" }}>− Prelievo</span>
                ) : (
                  <span style={{ color: "green" }}>＋ Deposito</span>
                )}
              </strong>
              <span style={{ fontSize: "0.9em", color: "#555" }}>
                {formatDateTime(t.createdAt)}
              </span>
            </div>
            <p style={{ margin: "8px 0" }}>
              <strong>Importo:</strong> {t.amount} €
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Nuovo saldo:</strong> {t.newBalance} €
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Descrizione:</strong> {t.description || "-"}
            </p>
          </div>
        ))
      )}

      <a href="/dashboard" style={{ textDecoration: "none", color: "#007bff" }}>
        ⬅️ Torna al portafoglio
      </a>
    </div>
  );
}
