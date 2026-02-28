/**
 * Firebase Admin SDK — singleton initializer for Next.js API routes
 *
 * Reads serviceAccountKey.json from scripts/ (never bundled client-side).
 * Call getAdminDb() / getAdminAuth() inside API route handlers only.
 */
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

function initAdmin() {
  if (admin.apps.length) return;
  try {
    const keyPath = join(process.cwd(), "scripts", "serviceAccountKey.json");
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (err) {
    console.error("[firebase-admin] Init failed:", err.message);
    throw new Error("Firebase Admin could not be initialised: " + err.message);
  }
}

export function getAdminDb() {
  initAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initAdmin();
  return admin.auth();
}

/**
 * Verify the Bearer token from the Authorization header and return
 * the full Firestore user profile (includes role, franchise_id, branch_id).
 * Returns null when the token is missing / invalid / no Firestore profile.
 */
export async function verifyRequest(request) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    const token = header.slice(7);
    const decoded = await getAdminAuth().verifyIdToken(token);
    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    return snap.exists ? { uid: decoded.uid, ...snap.data() } : null;
  } catch {
    return null;
  }
}
