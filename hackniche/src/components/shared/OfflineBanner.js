'use client';

/**
 * OfflineBanner
 *
 * Shows a persistent status bar at the top of the screen when:
 *  - The device is offline
 *  - There are pending operations waiting to sync
 *  - A sync is actively in progress
 *
 * Renders nothing on web (non-Capacitor) or when everything is fine.
 */

import { useSyncStatus } from '@/lib/sync-manager';
import { isNativeApp } from '@/lib/offline-db';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const { online, syncing, pendingOps } = useSyncStatus();
  const [visible, setVisible] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // Only relevant on native
  const native = isNativeApp();

  useEffect(() => {
    if (!native) return;
    if (!online || pendingOps > 0 || syncing) {
      setVisible(true);
      setJustSynced(false);
    } else {
      // Was there something to sync? Show a brief "synced" confirmation
      if (visible) {
        setJustSynced(true);
        const t = setTimeout(() => { setVisible(false); setJustSynced(false); }, 2500);
        return () => clearTimeout(t);
      }
    }
  }, [online, pendingOps, syncing, visible, native]);

  if (!native || !visible) return null;

  if (justSynced) {
    return (
      <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2
                      bg-green-600 text-white text-xs font-medium py-1.5 px-4
                      animate-in slide-in-from-top duration-300">
        <CheckCircle className="w-3.5 h-3.5" />
        All changes synced
      </div>
    );
  }

  if (!online) {
    return (
      <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2
                      bg-amber-500 text-white text-xs font-medium py-1.5 px-4">
        <WifiOff className="w-3.5 h-3.5" />
        You&apos;re offline
        {pendingOps > 0 && (
          <span className="ml-1 bg-white/20 rounded px-1.5 py-0.5">
            {pendingOps} change{pendingOps !== 1 ? 's' : ''} queued
          </span>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2
                      bg-blue-600 text-white text-xs font-medium py-1.5 px-4
                      animate-in slide-in-from-top duration-300">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Syncing {pendingOps} change{pendingOps !== 1 ? 's' : ''}…
      </div>
    );
  }

  return null;
}
