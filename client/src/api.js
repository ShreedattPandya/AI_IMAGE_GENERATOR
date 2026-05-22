import { API_BASE } from "./config.js";

const API = API_BASE;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ── Auth ──
export async function loginUser(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function signupUser(name, email, password, confirmPassword) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data;
}

// ── Explore ──
export async function fetchExplore({ page = 1, limit = 20, search = "", model = "", sort = "newest" } = {}) {
  const params = new URLSearchParams({ page, limit, search, model, sort });
  const res = await fetch(`${API}/api/explore?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load gallery");
  return res.json();
}

export async function fetchImageDetail(id) {
  const res = await fetch(`${API}/api/explore/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load image");
  return res.json();
}

// ── Image Actions ──
export async function generateImage(body) {
  const res = await fetch(`${API}/api/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data;
}

export async function fetchMyImages() {
  const res = await fetch(`${API}/api/my-images`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load your images");
  return res.json();
}

export async function likeImage(id) {
  const res = await fetch(`${API}/api/images/${id}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to like");
  return data;
}

export async function trackDownload(id) {
  const res = await fetch(`${API}/api/images/${id}/download`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function deleteImage(id) {
  const res = await fetch(`${API}/api/images/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

// legacy compat
export async function fetchHistory() {
  return fetchMyImages();
}
