'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import {
  ArrowLeft, TrendingDown, Users, Utensils, AlertTriangle,
  CheckCircle2, Loader2, Eye, Play, Info, Pencil, RotateCcw,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/contexts/auth-context';

const AVAILABLE_DISHES = [
  'Biryani', 'Paneer Butter Masala', 'Dal Tadka', 'Naan/Roti',
  'Rice', 'Raita', 'Gulab Jamun', 'Mixed Veg Curry', 'Salad',
];

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function StockDeductionPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || 'pfd';

  const [guestCount, setGuestCount] = useState('');
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [eventName, setEventName] = useState('');
  const [bookingId, setBookingId] = useState('');

  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState(null);

  // Editable deduction quantities — user can override after preview
  const [editedDeductions, setEditedDeductions] = useState({}); // { materialName: qty }
  const [isEditing, setIsEditing] = useState(false);

  // Deduction history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    fetch(`/api/kitchen-inventory/stock-deduction?franchise_id=${franchiseId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setHistory(d.data || []); })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [userProfile, franchiseId]);

  const toggleDish = (dish) => {
    setSelectedDishes(prev =>
      prev.includes(dish) ? prev.filter(d => d !== dish) : [...prev, dish]
    );
    setPreview(null);
    setResult(null);
    setEditedDeductions({});
    setIsEditing(false);
  };

  const handlePreview = async () => {
    setError(null);
    if (!guestCount || parseInt(guestCount) <= 0) { setError('Enter a valid guest count'); return; }
    if (selectedDishes.length === 0) { setError('Select at least one menu item'); return; }

    setPreviewLoading(true);
    try {
      const res = await fetch('/api/kitchen-inventory/stock-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchise_id: franchiseId,
          guest_count: parseInt(guestCount),
          menu_items: selectedDishes,
          event_name: eventName || null,
          booking_id: bookingId || null,
          dry_run: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreview(data.data);
        // Initialize editable quantities from the preview
        const editMap = {};
        (data.data.materialsNeeded || []).forEach(mat => {
          editMap[mat.name] = { qty: mat.totalQty, unit: mat.unit, original: mat.totalQty };
        });
        setEditedDeductions(editMap);
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to preview');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecute = async () => {
    setError(null);
    setLoading(true);
    try {
      // Build custom_deductions from user-edited quantities
      const hasEdits = Object.entries(editedDeductions).some(
        ([, v]) => v.qty !== v.original
      );
      const customDeds = hasEdits
        ? Object.entries(editedDeductions)
            .filter(([, v]) => v.qty > 0)
            .map(([name, v]) => ({ name, totalQty: v.qty, unit: v.unit }))
        : null;

      const res = await fetch('/api/kitchen-inventory/stock-deduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchise_id: franchiseId,
          guest_count: parseInt(guestCount),
          menu_items: selectedDishes,
          event_name: eventName || null,
          booking_id: bookingId || null,
          dry_run: false,
          created_by: userProfile?.name || 'staff',
          ...(customDeds ? { custom_deductions: customDeds } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setPreview(null);
        // Re-fetch history
        fetch(`/api/kitchen-inventory/stock-deduction?franchise_id=${franchiseId}`)
          .then(r => r.json())
          .then(d => { if (d.success) setHistory(d.data || []); })
          .catch(() => {});
      } else {
        setError(data.error || 'Failed to execute');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Raw Materials
          </Link>
          <h1>Auto Stock Deduction</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Automatically deduct raw materials based on menu and guest count
          </p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={fadeUp} style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', borderRadius: 12,
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 20
      }}>
        <Info size={18} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: 'var(--color-text-h)', lineHeight: 1.6 }}>
          <strong>How it works:</strong> Select menu items and guest count → Preview the materials that will be deducted (with 10% wastage buffer) →
          <strong> Edit any quantity</strong> if the auto-calculated amount isn&apos;t accurate → Confirm to update inventory.
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column — Input */}
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="form-section-title"><Users size={14} /> Event Details</div>
            <div className="form-grid">
              <div>
                <label className="form-label">Guest Count *</label>
                <input className="input" type="number" placeholder="e.g. 200" value={guestCount}
                  onChange={e => { setGuestCount(e.target.value); setPreview(null); setResult(null); }} min="1" />
              </div>
              <div>
                <label className="form-label">Event Name</label>
                <input className="input" placeholder="e.g. Sharma Wedding" value={eventName}
                  onChange={e => setEventName(e.target.value)} />
              </div>
              <div className="form-span-2">
                <label className="form-label">Booking ID (Optional)</label>
                <input className="input" placeholder="e.g. BK-PFD-XYZ123" value={bookingId}
                  onChange={e => setBookingId(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="form-section-title"><Utensils size={14} /> Select Menu Items *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {AVAILABLE_DISHES.map(dish => {
                const selected = selectedDishes.includes(dish);
                return (
                  <button key={dish} onClick={() => toggleDish(dish)} style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: selected ? '2px solid #6366f1' : '1px solid var(--color-border)',
                    background: selected ? 'rgba(99,102,241,0.1)' : 'var(--color-surface)',
                    color: selected ? '#6366f1' : 'var(--color-text-h)',
                    transition: 'all 0.15s'
                  }}>
                    {selected && '✓ '}{dish}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 10 }}>
              Selected: {selectedDishes.length} item{selectedDishes.length !== 1 ? 's' : ''}
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={handlePreview}
              disabled={previewLoading || !guestCount || selectedDishes.length === 0}
              style={{ flex: 1 }}>
              {previewLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={14} />}
              {previewLoading ? 'Calculating…' : 'Preview Deduction'}
            </button>
            {preview && (
              <button className="btn btn-primary" onClick={handleExecute} disabled={loading} style={{ flex: 1 }}>
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                {loading ? 'Deducting…' : 'Confirm & Deduct'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Right Column — Preview / Result */}
        <motion.div variants={fadeUp}>
          {/* Preview Results */}
          {preview && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-h)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingDown size={16} style={{ color: '#6366f1' }} /> Deduction Preview
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge variant="accent">{preview.guest_count} guests</Badge>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Pencil size={12} /> Edit Quantities
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Reset all to original
                        const reset = {};
                        Object.entries(editedDeductions).forEach(([name, v]) => {
                          reset[name] = { ...v, qty: v.original };
                        });
                        setEditedDeductions(reset);
                        setIsEditing(false);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}
                    >
                      <RotateCcw size={12} /> Reset to Auto
                    </button>
                  )}
                </div>
              </div>

              {/* Accuracy note */}
              <div style={{
                fontSize: 11, color: 'var(--color-text-muted)', padding: '8px 12px', borderRadius: 8,
                background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)', marginBottom: 14,
                lineHeight: 1.5,
              }}>
                <strong>Note:</strong> Quantities include a 10% wastage/spillage buffer. 
                Click <strong>Edit Quantities</strong> to adjust any value before confirming.
              </div>

              {/* Editable Materials Needed */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Materials Required</span>
                  {isEditing && <span style={{ color: '#6366f1', fontWeight: 500, textTransform: 'none' }}>Editing — change values below</span>}
                </div>
                {preview.materialsNeeded?.map((mat, i) => {
                  const edited = editedDeductions[mat.name];
                  const currentQty = edited ? edited.qty : mat.totalQty;
                  const isChanged = edited && edited.qty !== edited.original;
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0',
                      borderBottom: '1px solid var(--color-border)', fontSize: 13,
                      background: isChanged ? 'rgba(99,102,241,0.04)' : 'transparent',
                      borderRadius: isChanged ? 4 : 0,
                      paddingLeft: isChanged ? 8 : 0, paddingRight: isChanged ? 8 : 0,
                    }}>
                      <span style={{ flex: 1 }}>
                        {mat.name}
                        {isChanged && <span style={{ fontSize: 10, color: '#6366f1', marginLeft: 6, fontWeight: 600 }}>EDITED</span>}
                      </span>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentQty}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditedDeductions(prev => ({
                                ...prev,
                                [mat.name]: { ...prev[mat.name], qty: Math.round(val * 100) / 100 }
                              }));
                            }}
                            style={{
                              width: 80, padding: '3px 6px', fontSize: 13, fontFamily: 'var(--font-mono)',
                              fontWeight: 600, textAlign: 'right', borderRadius: 6,
                              border: isChanged ? '2px solid #6366f1' : '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              color: 'var(--color-text-h)',
                            }}
                          />
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 36 }}>{mat.unit}</span>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isChanged ? '#6366f1' : 'var(--color-text-h)' }}>
                          {currentQty} {mat.unit}
                          {isChanged && (
                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 4 }}>
                              (auto: {edited.original})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
                {/* Show if any edits were made */}
                {Object.values(editedDeductions).some(v => v.qty !== v.original) && !isEditing && (
                  <div style={{ fontSize: 11, color: '#6366f1', marginTop: 8, fontWeight: 500 }}>
                    ✏️ Some quantities have been manually adjusted. The deduction will use your edited values.
                  </div>
                )}
              </div>

              {/* Deductions */}
              {preview.deductions?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginBottom: 8 }}>
                    Stock Changes ({preview.deductions.length})
                  </div>
                  {preview.deductions.map((d, i) => {
                    const edited = editedDeductions[d.material];
                    const deductQty = edited ? edited.qty : d.deductQty;
                    const newStock = Math.max(0, d.currentStock - deductQty);
                    const willBeLow = newStock <= (preview.deductions.find(x => x.material === d.material)?.minStock || 0) || d.willBeLowStock;
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px',
                        borderRadius: 6, background: willBeLow ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.04)',
                        border: `1px solid ${willBeLow ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.1)'}`,
                        marginBottom: 4, fontSize: 13
                      }}>
                        <span style={{ fontWeight: 500 }}>{d.material}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{d.currentStock}</span>
                          <span style={{ color: '#ef4444' }}>→</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: willBeLow ? '#f59e0b' : '#10b981' }}>
                            {newStock} {d.unit}
                          </span>
                          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>(-{deductQty})</span>
                          {willBeLow && <Badge variant="accent" style={{ fontSize: 10 }}>Low</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Warnings */}
              {preview.warnings?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>
                    ⚠️ Warnings ({preview.warnings.length})
                  </div>
                  {preview.warnings.map((w, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.15)', marginBottom: 4, fontSize: 12, color: '#92400e'
                    }}>
                      {w.material}: {w.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Shortages */}
              {preview.shortages?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                    ❌ Shortages ({preview.shortages.length})
                  </div>
                  {preview.shortages.map((s, i) => (
                    <div key={i} style={{
                      padding: '8px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.15)', marginBottom: 4, fontSize: 12, color: '#991b1b'
                    }}>
                      <strong>{s.material}:</strong> Need {s.needed} {s.unit}
                      {s.available !== undefined && ` (have ${s.available}, short by ${s.deficit})`}
                      {s.reason === 'Not found in inventory' && ' — Not in inventory'}
                    </div>
                  ))}
                  <Link
                    href={`/purchase-orders/create?prefill=${encodeURIComponent(JSON.stringify(
                      preview.shortages.map(s => ({
                        name: s.material,
                        qty: s.deficit || s.needed,
                        unit: s.unit,
                      }))
                    ))}`}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 10, textDecoration: 'none' }}
                  >
                    Create Purchase Order to Restock
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: 10 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)' }}>Stock Deducted Successfully</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {result.totalItemsAffected} material{result.totalItemsAffected !== 1 ? 's' : ''} updated for {result.guest_count} guests
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Deduction ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{result.deductionId}</code>
                </p>
              </div>

              {result.deductions?.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '6px 10px',
                  borderRadius: 6, background: 'rgba(16,185,129,0.04)', marginBottom: 4, fontSize: 13
                }}>
                  <span>{d.material}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{d.currentStock}</span>
                    <span style={{ color: '#ef4444' }}> → </span>
                    <span style={{ fontWeight: 600, color: d.willBeLowStock ? '#f59e0b' : '#10b981' }}>{d.newStock}</span>
                    <span style={{ fontSize: 11, color: '#ef4444' }}> (-{d.deductQty})</span>
                  </span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link href="/inventory" className="btn btn-outline btn-sm" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                  View Inventory
                </Link>
                <button className="btn btn-primary btn-sm" onClick={() => { setResult(null); setGuestCount(''); setSelectedDishes([]); setEventName(''); setBookingId(''); setEditedDeductions({}); setIsEditing(false); }} style={{ flex: 1 }}>
                  New Deduction
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!preview && !result && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <TrendingDown size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Select menu items and guest count, then click <strong>Preview Deduction</strong> to see
                which materials will be deducted.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Deduction History */}
      <motion.div variants={fadeUp} style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 14 }}>
          Deduction History
        </h2>
        {historyLoading ? (
          <div className="card" style={{ padding: 30, textAlign: 'center' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-text-muted)' }} />
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
            No deduction history yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.slice(0, 10).map((log, i) => (
              <div key={i} className="card" style={{
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 8
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>
                    {log.event_name || 'Stock Deduction'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 10 }}>
                    {log.guest_count} guests · {log.deductions?.length || 0} items
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {log.id}
                  </code>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(log.created).toLocaleDateString('en-GB')}{' '}
                    {new Date(log.created).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {log.shortages?.length > 0 && (
                    <Badge variant="red">{log.shortages.length} shortage{log.shortages.length > 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
