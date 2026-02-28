'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, ChefHat, Utensils, Users, Leaf } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';

const CATEGORY_META = {
  veg_premium: { label: 'Premium Veg',  color: '#16a34a', bg: '#dcfce7' },
  veg_classic: { label: 'Classic Veg',  color: '#2563eb', bg: '#dbeafe' },
  veg_economy: { label: 'Economy Veg',  color: '#d97706', bg: '#fef3c7' },
  jain:        { label: 'Jain',         color: '#7c3aed', bg: '#ede9fe' },
};

export default function MenusPage() {
  const { userProfile } = useAuth();
  const [menus,   setMenus]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/menus?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMenus(data.menus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [franchise_id, branch_id]);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Menus</h1>
          <p>
            {loading ? 'Loading...' : `${menus.length} menu package${menus.length !== 1 ? 's' : ''}`}
            {' '}• Branch: <strong>{branch_id}</strong>
          </p>
        </div>
        <div className="page-actions">
          <button
            onClick={fetchMenus}
            className="btn btn-ghost btn-sm"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <Link href="/menus/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> Create Menu
          </Link>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={fadeUp} style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '14px 18px', marginBottom: 20, color: '#dc2626', fontSize: 14,
        }}>
          ⚠ {error} — <button onClick={fetchMenus} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}>retry</button>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card" style={{ padding: 24, opacity: 0.5 }}>
              <div style={{ height: 20, background: 'var(--color-border)', borderRadius: 4, marginBottom: 12, width: '60%' }} />
              <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Menu Grid */}
      {!loading && menus.length === 0 && !error && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 48, textAlign: 'center' }}>
          <ChefHat size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
            No menus found for this branch.
          </p>
          <Link href="/menus/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> Create First Menu
          </Link>
        </motion.div>
      )}

      {!loading && menus.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {menus.map((m, i) => {
            const meta = CATEGORY_META[m.category] || { label: m.category, color: '#64748b', bg: '#f1f5f9' };
            return (
              <motion.div key={m.id} variants={fadeUp} custom={i}>
                <Link href={`/menus/${m.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: 24, cursor: 'pointer', transition: 'box-shadow 0.2s', borderLeft: `4px solid ${meta.color}` }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>
                        {m.menu_name || m.name || 'Unnamed Menu'}
                      </h3>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <span style={{ background: meta.bg, color: meta.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                          {meta.label}
                        </span>
                        <span className={`badge ${m.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>

                    {m.description && (
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                        {m.description.slice(0, 100)}{m.description.length > 100 ? '...' : ''}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Price/Plate</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                          {m.price_per_plate ? `₹${m.price_per_plate}` : '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Capacity</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-h)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Users size={12} />
                          {m.serves_min ?? m.minPax ?? '—'}–{m.serves_max ?? m.maxPax ?? '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Items</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-h)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Utensils size={12} />
                          {m.total_items != null ? m.total_items : (m.courses?.reduce((s, c) => s + (c.items?.length || 0), 0) ?? '—')}
                        </div>
                      </div>
                    </div>

                    {(m.isVeg || m.isVegan || m.isJain) && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        {m.isVeg   && <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>🌿 Veg</span>}
                        {m.isVegan && <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Vegan</span>}
                        {m.isJain  && <span style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>🔶 Jain</span>}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

