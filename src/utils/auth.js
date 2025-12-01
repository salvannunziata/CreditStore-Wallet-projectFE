// src/utils/auth.js
export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch (e) {
    console.error("Errore nel parsing del token:", e);
    return null;
  }
}

