/**
 * offline-db.js
 *
 * JavaScript wrapper around the native Android Room DB exposed by
 * `OfflinePlugin` via Capacitor.
 *
 * On non-Android platforms (web browser, iOS) every call is a no-op
 * that returns empty results — data comes purely from Firestore there.
 *
 * Usage:
 *   import { offlineDB, isNativeApp } from '@/lib/offline-db';
 *
 *   if (isNativeApp()) {
 *     await offlineDB.upsertBookings(firestoreBookings);
 *     const cached = await offlineDB.getBookings({ branchId });
 *   }
 */

import { Capacitor } from '@capacitor/core';

// ── Platform detection ────────────────────────────────────────────────────────

/** Returns true when running inside the Capacitor Android/iOS bridge */
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/** Returns the raw OfflineDB plugin or null on web */
function getPlugin() {
  if (!isNativeApp()) return null;
  try {
    return Capacitor.Plugins?.OfflineDB ?? null;
  } catch {
    return null;
  }
}

// ── Tiny helper so every method follows the same safe pattern ─────────────────

async function call(method, args = {}) {
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    return await plugin[method](args);
  } catch (err) {
    console.warn(`[OfflineDB] ${method} error:`, err);
    return null;
  }
}

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * Bulk-upsert bookings fetched from Firestore (cache-warm operation).
 * @param {Object[]} items  Array of booking documents
 */
export async function upsertBookings(items) {
  return call('upsertBookings', { items });
}

/**
 * Insert / update a single booking (used for local mutations made offline).
 * @param {Object} data  Booking document
 */
export async function upsertBooking(data) {
  return call('upsertBooking', { data });
}

/**
 * Retrieve bookings from Room DB.
 * @param {{ branchId?: string, franchiseId?: string }} opts
 * @returns {Promise<Object[]>}
 */
export async function getBookings({ branchId, franchiseId } = {}) {
  const res = await call('getBookings', { branchId, franchiseId });
  return res?.items ?? [];
}

export async function getBookingById(id) {
  const res = await call('getBookingById', { id });
  return res?.item ?? null;
}

export async function deleteBooking(id) {
  return call('deleteBooking', { id });
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function upsertLeads(items) {
  return call('upsertLeads', { items });
}

export async function upsertLead(data) {
  return call('upsertLead', { data });
}

/**
 * @param {{ branchId?: string, franchiseId?: string }} opts
 * @returns {Promise<Object[]>}
 */
export async function getLeads({ branchId, franchiseId } = {}) {
  const res = await call('getLeads', { branchId, franchiseId });
  return res?.items ?? [];
}

export async function deleteLead(id) {
  return call('deleteLead', { id });
}

// ── Branches ──────────────────────────────────────────────────────────────────

export async function upsertBranches(items) {
  return call('upsertBranches', { items });
}

export async function upsertBranch(data) {
  return call('upsertBranch', { data });
}

/**
 * @param {{ franchiseId?: string }} opts
 * @returns {Promise<Object[]>}
 */
export async function getBranches({ franchiseId } = {}) {
  const res = await call('getBranches', { franchiseId });
  return res?.items ?? [];
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function upsertInventoryItems(items) {
  return call('upsertInventoryItems', { items });
}

export async function upsertInventoryItem(data) {
  return call('upsertInventoryItem', { data });
}

/**
 * @param {{ branchId?: string }} opts
 * @returns {Promise<Object[]>}
 */
export async function getInventory({ branchId } = {}) {
  const res = await call('getInventory', { branchId });
  return res?.items ?? [];
}

// ── Pending Operations (offline mutation queue) ───────────────────────────────

/**
 * Queue a mutation to be synced with Firestore when the network returns.
 * @param {{ collection: string, docId?: string, operation: 'CREATE'|'UPDATE'|'DELETE', payload: Object }} op
 * @returns {Promise<{ id: number }|null>}
 */
export async function enqueuePendingOp({ collection, docId = '', operation, payload }) {
  return call('enqueuePendingOp', { collection, docId, operation, payload });
}

/**
 * Returns all pending operations (status = 'pending') in FIFO order.
 * @returns {Promise<Array>}
 */
export async function getPendingOps() {
  const res = await call('getPendingOps');
  return res?.items ?? [];
}

/** How many operations are still pending sync */
export async function pendingCount() {
  const res = await call('pendingCount');
  return res?.count ?? 0;
}

export async function updatePendingOpStatus(id, status) {
  return call('updatePendingOpStatus', { id, status });
}

export async function deletePendingOp(id) {
  return call('deletePendingOp', { id });
}

export async function clearCompletedOps() {
  return call('clearCompletedOps');
}

// ── Convenience: named export of the whole API ────────────────────────────────

export const offlineDB = {
  isAvailable: isNativeApp,
  // bookings
  upsertBookings,
  upsertBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  // leads
  upsertLeads,
  upsertLead,
  getLeads,
  deleteLead,
  // branches
  upsertBranches,
  upsertBranch,
  getBranches,
  // inventory
  upsertInventoryItems,
  upsertInventoryItem,
  getInventory,
  // pending ops
  enqueuePendingOp,
  getPendingOps,
  pendingCount,
  updatePendingOpStatus,
  deletePendingOp,
  clearCompletedOps,
};
