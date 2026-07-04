const BASE_URL = "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("thunderai_token");
}

export function setToken(token) {
  localStorage.setItem("thunderai_token", token);
}

export function clearToken() {
  localStorage.removeItem("thunderai_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed.");
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed.");
  return data;
}

export async function fetchMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not logged in.");
  return res.json();
}

export async function sendMessage(conversationId, message, attachment) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ conversationId, message, attachment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Couldn't send message. Try again.");
  return data;
}

export async function fetchConversations() {
  const res = await fetch(`${BASE_URL}/chat`, { headers: authHeaders() });
  return res.json();
}

export async function fetchMessages(conversationId) {
  const res = await fetch(`${BASE_URL}/chat/${conversationId}`, { headers: authHeaders() });
  return res.json();
}

export async function renameConversation(conversationId, title) {
  const res = await fetch(`${BASE_URL}/chat/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function deleteConversation(conversationId) {
  const res = await fetch(`${BASE_URL}/chat/${conversationId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function debugCode(code, error, filename) {
  const res = await fetch(`${BASE_URL}/code/debug`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ code, error, filename }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Debugging failed. Try again.");
  return data;
}

export async function fetchMemories() {
  const res = await fetch(`${BASE_URL}/memory`, { headers: authHeaders() });
  return res.json();
}

export async function deleteMemory(id) {
  const res = await fetch(`${BASE_URL}/memory/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

export async function clearAllMemories() {
  const res = await fetch(`${BASE_URL}/memory`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}