import React, { useEffect, useState } from "react";
import { getUserRole } from "../utils/auth";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const role = getUserRole();
  const token = localStorage.getItem("token");

  if (role !== "ROLE_ADMIN") {
    return <p style={{ color: "red" }}>Accesso negato. Solo gli admin possono vedere questa pagina.</p>;
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/users", {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        const enriched = await Promise.all(
          data.map(async (u) => {
            try {
              const wRes = await fetch(`http://localhost:8080/wallets/${u.id}`, {
                headers: { Authorization: "Bearer " + token }
              });
              if (!wRes.ok) return { ...u, balance: "N/D" };
              const wallet = await wRes.json();
              return { ...u, balance: wallet.balance };
            } catch {
              return { ...u, balance: "N/D" };
            }
          })
        );
        setUsers(enriched.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        setError(e.message);
      }
    };
    loadUsers();
  }, [token]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const toggleExpanded = (userId, view) => {
    if (expandedUser && expandedUser.id === userId && expandedUser.view === view) {
      setExpandedUser(null);
      setTransactions([]);
      setAmount("");
      setDescription("");
    } else {
      setExpandedUser({ id: userId, view });
      if (view !== "transactions") {
        setTransactions([]);
      }
    }
  };

  const loadTransactions = async (userId) => {
    const willClose =
      expandedUser && expandedUser.id === userId && expandedUser.view === "transactions";
    if (willClose) {
      toggleExpanded(userId, "transactions");
      return;
    }
    toggleExpanded(userId, "transactions");
    try {
      const res = await fetch(`http://localhost:8080/wallets/${userId}/transactions`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    }
  };

  const refreshBalance = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/wallets/${userId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) return;
      const wallet = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, balance: wallet.balance } : u))
      );
    } catch {}
  };

  const handleDeposit = async (userId) => {
    const confirmAction = window.confirm("Sei sicuro di voler effettuare il deposito?");
    if (!confirmAction) return;
    try {
      const res = await fetch(`http://localhost:8080/wallets/${userId}/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ amount, description })
      });
      if (!res.ok) throw new Error("Errore nel deposito");
      await refreshBalance(userId);
      setAmount("");
      setDescription("");
      setExpandedUser(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleWithdraw = async (userId) => {
    const confirmAction = window.confirm("Sei sicuro di voler effettuare il prelievo?");
    if (!confirmAction) return;
    try {
      const res = await fetch(`http://localhost:8080/wallets/${userId}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ amount, description })
      });
      if (!res.ok) throw new Error("Errore nel prelievo");
      await refreshBalance(userId);
      setAmount("");
      setDescription("");
      setExpandedUser(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8080/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error("Errore nell'eliminazione utente");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (expandedUser?.id === userId) setExpandedUser(null);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "50px auto" }}>
      <h2>Lista utenti</h2>
      <input
        type="text"
        placeholder="Cerca utente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 10 }}>Nome</th>
            <th style={{ padding: 10 }}>Email</th>
            <th style={{ padding: 10 }}>Saldo</th>
            <th style={{ padding: 10 }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <React.Fragment key={u.id}>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: 10 }}>{u.name}</td>
                <td style={{ padding: 10 }}>{u.email}</td>
                <td style={{ padding: 10 }}>{u.balance} €</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => loadTransactions(u.id)} style={{ marginRight: 10 }}>📜 Transazioni</button>
                  <button onClick={() => toggleExpanded(u.id, "deposit")} style={{ marginRight: 10 }}>➕ Deposito</button>
                  <button onClick={() => toggleExpanded(u.id, "withdraw")} style={{ marginRight: 10 }}>➖ Prelievo</button>
                  <button onClick={() => handleDelete(u.id)} style={{ color: "red" }}>🗑️ Delete</button>
                </td>
              </tr>
              {expandedUser && expandedUser.id === u.id && (
                <tr>
                  <td colSpan="4" style={{ background: "#f9f9f9", padding: 15 }}>
                    {expandedUser.view === "transactions" && (
                      <div>
                        <h4>Transazioni utente {u.name}</h4>
                        {transactions.length === 0 ? (
                          <p>Nessuna transazione disponibile</p>
                        ) : (
                          <table style={{ width: "100%", marginTop: 10 }}>
                            <thead>
                              <tr>
                                <th>Tipo</th>
                                <th>Importo</th>
                                <th>Data/Ora</th>
                                <th>Descrizione</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((t) => (
                                <tr key={t.id}>
                                  <td>{t.type}</td>
                                  <td>{t.amount} €</td>
                                  <td>{formatDateTime(t.createdAt)}</td>
                                  <td>{t.description || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                    {expandedUser.view === "deposit" && (
                      <div>
                        <h4>Deposito utente {u.name}</h4>
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="number"
                            placeholder="Importo"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ marginRight: 10 }}
                          />
                          <input
                            type="text"
                            placeholder="Descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ marginRight: 10, width: "40%" }}
                          />
                          <button onClick={() => handleDeposit(u.id)}>Conferma Deposito</button>
                        </div>
                      </div>
                    )}
                    {expandedUser.view === "withdraw" && (
                      <div>
                        <h4>Prelievo utente {u.name}</h4>
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="number"
                            placeholder="Importo"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ marginRight: 10 }}
                          />
                          <input
                            type="text"
                            placeholder="Descrizione"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ marginRight: 10, width: "40%" }}
                          />
                          <button onClick={() => handleWithdraw(u.id)}>Conferma Prelievo</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
