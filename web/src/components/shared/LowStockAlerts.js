'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShoppingCart, Clock, X, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

/**
 * LowStockAlerts — floating alert widget for raw material inventory
 * 
 * Shows a compact notification when items are below minimum stock or expiring soon.
 * Can be placed in the dashboard layout or any page.
 *
 * Usage:
 *   <LowStockAlerts />
 *   <LowStockAlerts autoFetch={false} items={myItems} />
 */
export default function LowStockAlerts({ autoFetch = true, items: externalItems, compact = false }) {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [loading, setLoading] = useState(autoFetch);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!autoFetch) {
      // Use external items
      if (externalItems && externalItems.length > 0) {
        const low = externalItems.filter(i => (i.currentStock || 0) <= (i.minStock || 0));
        const expiring = externalItems.filter(i => {
          if (!i.expiryDate) return false;
          const days = Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000);
          return days >= 0 && days <= 7;
        });
        setAlerts({ lowStock: low, expiring });
      }
      return;
    }

    if (!userProfile) return;

    const fetchAlerts = async () => {
      try {
        const franchiseId = userProfile.franchise_id || 'pfd';
        const res = await fetch(`/api/kitchen-inventory?franchise_id=${franchiseId}`);
        const result = await res.json();

        if (result.success) {
          const data = result.data || [];
          const low = data.filter(i => (i.currentStock || 0) <= (i.minStock || 0));
          const expiring = data.filter(i => {
            if (!i.expiryDate) return false;
            const days = Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000);
            return days >= 0 && days <= 7;
          });
          setAlerts({ lowStock: low, expiring });
        }
      } catch (err) {
        console.error('Failed to fetch stock alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Re-check every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoFetch, userProfile, externalItems]);

  const totalAlerts = alerts.lowStock.length + alerts.expiring.length;

  if (loading || totalAlerts === 0 || dismissed) return null;

  // Compact mode — just a badge/button
  if (compact) {
    return (
      <Link href="/inventory" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#ef4444',
        cursor: 'pointer'
      }}>
        <AlertTriangle size={13} />
        {totalAlerts} stock alert{totalAlerts !== 1 ? 's' : ''}
      </Link>
    );
  }

  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: 12,
      border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 16px', cursor: 'pointer',
          background: 'rgba(239,68,68,0.04)', borderBottom: expanded ? '1px solid rgba(239,68,68,0.1)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={14} style={{ color: '#ef4444' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-h)' }}>
            {totalAlerts} Stock Alert{totalAlerts !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {expanded ? 'Collapse' : 'Expand'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-text-muted)' }}
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '12px 16px', maxHeight: 300, overflowY: 'auto' }}>
          {/* Low Stock */}
          {alerts.lowStock.length > 0 && (
            <div style={{ marginBottom: alerts.expiring.length > 0 ? 12 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={11} /> Low Stock ({alerts.lowStock.length})
              </div>
              {alerts.lowStock.slice(0, 5).map(item => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 8px', borderRadius: 6,
                  background: 'rgba(239,68,68,0.04)', marginBottom: 3, fontSize: 12
                }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text-h)' }}>{item.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600, fontSize: 11 }}>
                    {item.currentStock}/{item.minStock} {item.unit}
                  </span>
                </div>
              ))}
              {alerts.lowStock.length > 5 && (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: '3px 8px' }}>
                  +{alerts.lowStock.length - 5} more
                </div>
              )}
            </div>
          )}

          {/* Expiring */}
          {alerts.expiring.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Expiring Soon ({alerts.expiring.length})
              </div>
              {alerts.expiring.slice(0, 5).map(item => {
                const days = Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
                return (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 8px', borderRadius: 6,
                    background: 'rgba(245,158,11,0.04)', marginBottom: 3, fontSize: 12
                  }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-h)' }}>{item.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>
                      {days}d left
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link href="/inventory" style={{
              flex: 1, textAlign: 'center', textDecoration: 'none',
              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'var(--color-surface-2)', color: 'var(--color-text-h)',
              border: '1px solid var(--color-border)'
            }}>
              View All
            </Link>
            <Link href="/purchase-orders/create" style={{
              flex: 1, textAlign: 'center', textDecoration: 'none',
              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: '#6366f1', color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <ShoppingCart size={12} /> Reorder
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
