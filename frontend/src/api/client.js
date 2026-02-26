import { getAccessToken } from "../auth/auth";

export const API_BASE = "http://127.0.0.1:8000/api";

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const msg =
      payload?.detail ||
      payload?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return res.json();
}