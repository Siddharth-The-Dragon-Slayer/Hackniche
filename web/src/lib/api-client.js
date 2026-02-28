/**
 * api-client.js  — thin wrapper around fetch that auto-attaches the
 * current Firebase Auth ID token as a Bearer token.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/api-client";
 *   const data = await apiFetch("/api/halls", { method: "POST", body: JSON.stringify({...}) });
 */
import { auth } from "@/lib/firebase";

/**
 * Authenticated fetch — adds Authorization header automatically.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>} parsed JSON
 */
export async function apiFetch(url, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json();
}
