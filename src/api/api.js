const API_URL = "http://localhost:8080";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const text = await response.text(); 

  try {
    return JSON.parse(text); 
  } catch {
    return { error: text }; 
  }
}

export async function getMyWallet() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/wallets/me`, {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function getAllUsers() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    headers: { Authorization: "Bearer " + token }
  });

  const text = await response.text();
  try { return JSON.parse(text); }
  catch { return { error: text }; }
}



