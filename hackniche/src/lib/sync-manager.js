/**
 * sync-manager.js
 *
 * Bi-directional sync engine between Android Room DB and Firestore.
 *
 * Responsibilities:
 *  1. On app launch (online)  → pull fresh data from Firestore → Room DB (warm cache)
 *  2. On mutation (offline)   → write to Room DB + enqueue PendingOperation
 *  3. On mutation (online)    → write directly to Firestore + Room DB
 *  4. On reconnect            → drain the PendingOperation queue → Firestore
 *
 * Usage (call once, e.g. in auth-context or root layout):
 *   import { initSyncManager } from '@/lib/sync-manager';
 *   initSyncManager({ franchiseId, branchId });
 *
 * React hook for UI:
 *   const { online, pendingOps, syncing } = useSyncStatus();
 */

'use client';

import { Network } from '@capacitor/network';
import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where,
} from 'firebase/firestore';
import { db as firestoreDB } from '@/lib/firebase';
import {
  offlineDB, isNativeApp,
  getPendingOps, updatePendingOpStatus, deletePendingOp, clearCompletedOps,
  upsertBookings, upsertLeads, upsertBranches, upsertInventoryItems,
} from '@/lib/offline-db';
import { useState, useEffect, useCallback } from 'react';

// ── Internal state ────────────────────────────────────────────────────────────

let _online = true;
let _syncing = false;
let _networkListenerAdded = false;
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn({ online: _online, syncing: _syncing }));
}

// ── Network detection ─────────────────────────────────────────────────────────

async function setupNetworkListener() {
  if (_networkListenerAdded || !isNativeApp()) return;
  _networkListenerAdded = true;

  // Get initial status
  const status = await Network.getStatus();
  _online = status.connected;

  // Listen for changes
  Network.addListener('networkStatusChange', async (status) => {
    const wasOffline = !_online;
    _online = status.connected;
    notifyListeners();

    if (_online && wasOffline) {
      console.log('[SyncManager] Back online — draining pending queue');
      await drainPendingQueue();
    }
  });
}

// ── Cache warming: Firestore → Room DB ───────────────────────────────────────

/**
 * Download the latest data from Firestore into Room DB so it's
 * available when the device goes offline.
 *
 * @param {{ franchiseId?: string, branchId?: string }} scope
 */
export async function warmCache({ franchiseId, branchId } = {}) {
  if (!isNativeApp()) return;

  try {
    const tasks = [];

    // Branches
    if (franchiseId) {
      tasks.push(
        getDocs(query(collection(firestoreDB, 'branches'), where('franchise_id', '==', franchiseId)))
          .then((snap) => upsertBranches(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
          .catch((e) => console.warn('[SyncManager] warmCache branches:', e))
      );
    }

    // Bookings
    if (branchId) {
      tasks.push(
        getDocs(query(collection(firestoreDB, 'bookings'), where('branch_id', '==', branchId)))
          .then((snap) => upsertBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
          .catch((e) => console.warn('[SyncManager] warmCache bookings:', e))
      );
    } else if (franchiseId) {
      tasks.push(
        getDocs(query(collection(firestoreDB, 'bookings'), where('franchise_id', '==', franchiseId)))
          .then((snap) => upsertBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
          .catch((e) => console.warn('[SyncManager] warmCache bookings franchise:', e))
      );
    }

    // Leads
    if (branchId) {
      tasks.push(
        getDocs(query(collection(firestoreDB, 'leads'), where('branch_id', '==', branchId)))
          .then((snap) => upsertLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
          .catch((e) => console.warn('[SyncManager] warmCache leads:', e))
      );
    }

    // Inventory
    if (branchId) {
      tasks.push(
        getDocs(query(collection(firestoreDB, 'inventory'), where('branch_id', '==', branchId)))
          .then((snap) => upsertInventoryItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
          .catch((e) => console.warn('[SyncManager] warmCache inventory:', e))
      );
    }

    await Promise.allSettled(tasks);
    console.log('[SyncManager] Cache warm complete');
  } catch (err) {
    console.warn('[SyncManager] warmCache error:', err);
  }
}

// ── Pending queue drain: Room DB → Firestore ──────────────────────────────────

/**
 * Process all pending offline mutations and push them to Firestore.
 * Called automatically when the network comes back.
 */
export async function drainPendingQueue() {
  if (!isNativeApp() || _syncing) return;
  _syncing = true;
  notifyListeners();

  try {
    const ops = await getPendingOps();
    if (ops.length === 0) {
      console.log('[SyncManager] No pending ops');
      return;
    }

    console.log(`[SyncManager] Processing ${ops.length} pending op(s)`);

    for (const op of ops) {
      try {
        await updatePendingOpStatus(op.id, 'syncing');

        const colRef = collection(firestoreDB, op.collection);

        if (op.operation === 'CREATE') {
          const docRef = op.docId ? doc(colRef, op.docId) : doc(colRef);
          await setDoc(docRef, op.payload);
        } else if (op.operation === 'UPDATE') {
          await updateDoc(doc(colRef, op.docId), op.payload);
        } else if (op.operation === 'DELETE') {
          await deleteDoc(doc(colRef, op.docId));
        }

        await updatePendingOpStatus(op.id, 'done');
        console.log(`[SyncManager] Synced op ${op.id} (${op.operation} ${op.collection}/${op.docId})`);
      } catch (err) {
        console.warn(`[SyncManager] Failed op ${op.id}:`, err.message);
        await updatePendingOpStatus(op.id, 'pending'); // will retry next time
      }
    }

    await clearCompletedOps();
  } finally {
    _syncing = false;
    notifyListeners();
  }
}

// ── Mutation helpers (used instead of direct Firestore calls when offline) ────

/**
 * Write a document — goes to Firestore if online, Room DB + PendingOp if offline.
 *
 * @param {string} collectionName   e.g. 'bookings'
 * @param {string} docId            Firestore document ID
 * @param {Object} data             Document payload
 * @param {'CREATE'|'UPDATE'} op    Operation type (default: UPDATE)
 */
export async function offlineAwareWrite(collectionName, docId, data, op = 'UPDATE') {
  if (_online) {
    // Online: write straight to Firestore
    const ref = doc(collection(firestoreDB, collectionName), docId);
    if (op === 'CREATE') {
      await setDoc(ref, data);
    } else {
      await updateDoc(ref, data);
    }
  } else {
    // Offline: queue for later sync
    await offlineDB.enqueuePendingOp({
      collection: collectionName,
      docId,
      operation: op,
      payload: data,
    });
    console.log(`[SyncManager] Queued offline ${op} for ${collectionName}/${docId}`);
  }

  // Mirror to Room DB in both cases for consistent local reads
  if (isNativeApp()) {
    const entity = { id: docId, ...data };
    switch (collectionName) {
      case 'bookings':   await offlineDB.upsertBooking({ ...entity, isSynced: _online }); break;
      case 'leads':      await offlineDB.upsertLead({ ...entity, isSynced: _online }); break;
      case 'branches':   await offlineDB.upsertBranch({ ...entity, isSynced: _online }); break;
      case 'inventory':  await offlineDB.upsertInventoryItem({ ...entity, isSynced: _online }); break;
    }
  }
}

/**
 * Delete a document — goes to Firestore if online, queues DELETE op if offline.
 */
export async function offlineAwareDelete(collectionName, docId) {
  if (_online) {
    await deleteDoc(doc(collection(firestoreDB, collectionName), docId));
  } else {
    await offlineDB.enqueuePendingOp({
      collection: collectionName,
      docId,
      operation: 'DELETE',
      payload: {},
    });
  }

  // Remove from local Room DB
  if (isNativeApp()) {
    switch (collectionName) {
      case 'bookings':  await offlineDB.deleteBooking(docId); break;
      case 'leads':     await offlineDB.deleteLead(docId); break;
    }
  }
}

// ── Initialisation ────────────────────────────────────────────────────────────

/**
 * Call once after the user logs in.
 * @param {{ franchiseId?: string, branchId?: string }} scope
 */
export async function initSyncManager(scope = {}) {
  if (!isNativeApp()) return;
  await setupNetworkListener();
  if (_online) {
    await warmCache(scope);
    await drainPendingQueue(); // handle any ops left from previous session
  }
}

// ── React hook ────────────────────────────────────────────────────────────────

/**
 * useSyncStatus()
 *
 * Returns live sync state. Works on both web (always online, 0 pending) and native.
 *
 * @returns {{ online: boolean, syncing: boolean, pendingOps: number }}
 */
export function useSyncStatus() {
  const [state, setState] = useState({ online: true, syncing: false });
  const [pendingOps, setPendingOps] = useState(0);

  const refresh = useCallback(async () => {
    if (!isNativeApp()) return;
    const n = await offlineDB.pendingCount();
    setPendingOps(n);
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;

    // Subscribe to sync manager changes
    const listener = (s) => {
      setState(s);
      refresh();
    };
    _listeners.add(listener);

    // Seed initial state
    setState({ online: _online, syncing: _syncing });
    refresh();

    return () => _listeners.delete(listener);
  }, [refresh]);

  return { online: state.online, syncing: state.syncing, pendingOps };
}
