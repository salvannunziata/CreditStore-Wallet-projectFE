import { useEffect, useState } from "react";
import { getUserRole } from "../utils/auth";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const role = getUserRole();

  if (role !== "ROLE_ADMIN") {
    return <p style={{ color: "red" }}>Accesso negato. Solo gli admin possono vedere questa pagina.</p>;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/users", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sorted);
      });
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900, margin: "50px auto" }}>
      <h2>Lista utenti</h2>

      <input
        type="text"
        placeholder="Cerca utente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 10 }}>Nome</th>
            <th style={{ padding: 10 }}>Email</th>
            <th style={{ padding: 10 }}>Azioni</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: 10 }}>{u.name}</td>
              <td style={{ padding: 10 }}>{u.email}</td>
              <td style={{ padding: 10 }}>
                <a href={`/wallet/${u.id}/transactions`} style={{ marginRight: 10 }}>📜 Transazioni</a>
                <a href={`/wallet/${u.id}/deposit`} style={{ marginRight: 10 }}>➕ Deposito</a>
                <a href={`/wallet/${u.id}/withdraw`} style={{ marginRight: 10 }}>➖ Prelievo</a>
                <a href={`/users/update/${u.id}`} style={{ marginRight: 10 }}>✏️ Update</a>
                <a href={`/users/delete/${u.id}`} style={{ color: "red" }}>🗑️ Delete</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
