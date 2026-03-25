'use client';
/**
 * EMIPanel — shown in the booking detail payments tab
 * Allows creating an EMI plan and paying each installment via Razorpay.
 */

import { useState } from 'react';
import { generateEMISchedule, getEMISummary } from '@/lib/emi-calculator';
import RazorpayButton from './RazorpayButton';
import { Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLOR = { paid: '#16a34a', pending: '#b8953f', overdue: '#dc2626' };
const STATUS_ICON  = { paid: <CheckCircle2 size={14}/>, pending: <Clock size={14}/>, overdue: <AlertTriangle size={14}/> };

export default function EMIPanel({ booking, bookingId, franchiseId, branchId, userProfile, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    num_installments: '3',
    start_date: new Date().toISOString().slice(0, 10),
    frequency: 'monthly',
  });

  const pay = booking?.payments || {};
  const emiPlan = booking?.emi_plan;
  const balanceDue = pay.balance_due ?? ((pay.quote_total || 0) - (pay.total_paid || 0));
  const emiAmount = balanceDue; // EMI covers the remaining balance

  const preview = form.num_installments && form.start_date
    ? generateEMISchedule(emiAmount, Number(form.num_installments), form.start_date, form.frequency)
    : [];

  const summary = emiPlan ? getEMISummary(emiPlan.installments) : null;

  const handleCreatePlan = async () => {
    setSaving(true); setError(null);
    try {
      const r = await fetch('/api/payments/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_plan',
          booking_id: bookingId,
          franchise_id: franchiseId,
          branch_id: branchId,
          total_amount: emiAmount,
          num_installments: Number(form.num_installments),
          start_date: form.start_date,
          frequency: form.frequency,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setShowCreate(false);
      onRefresh?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // If no balance due, nothing to EMI
  if (balanceDue <= 0 && !emiPlan) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
        <CheckCircle2 size={28} style={{ margin: '0 auto 8px', color: '#16a34a' }} />
        No balance due — EMI not needed.
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      {emiPlan && summary && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, padding: '12px 16px', background: 'var(--color-surface)', borderRadius: 8, fontSize: 13 }}>
          <span>Total: <strong>{fmt(summary.total)}</strong></span>
          <span style={{ color: '#16a34a' }}>Paid: <strong>{fmt(summary.paid)}</strong> ({summary.paidCount}/{emiPlan.num_installments})</span>
          <span style={{ color: '#dc2626' }}>Pending: <strong>{fmt(summary.pending)}</strong></span>
          {summary.overdueCount > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠ {summary.overdueCount} overdue</span>}
        </div>
      )}

      {/* Create plan button */}
      {!emiPlan && !showCreate && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Balance due: <strong style={{ color: '#dc2626' }}>{fmt(balanceDue)}</strong> — split into installments
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={13} /> Create EMI Plan
          </button>
        </div>
      )}

      {/* Create plan form */}
      {showCreate && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 10, padding: 20, marginBottom: 16, border: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>New EMI Plan — {fmt(emiAmount)}</div>

          <div className="form-grid" style={{ marginBottom: 12 }}>
            <div className="form-field">
              <label className="form-label">No. of Installments</label>
              <select className="input" value={form.num_installments} onChange={e => setForm(p => ({ ...p, num_installments: e.target.value }))}>
                {[2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} installments</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Frequency</label>
              <select className="input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">First Installment Date</label>
              <input className="input" type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>Preview</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {preview.map(inst => (
                  <div key={inst.installment_number} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 10px', background: 'var(--color-bg-card)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Installment {inst.installment_number}</span>
                    <span>{fmtDate(inst.due_date)}</span>
                    <strong>{fmt(inst.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleCreatePlan} disabled={saving}>
              {saving ? 'Creating…' : 'Confirm Plan'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Installment list with pay buttons */}
      {emiPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {emiPlan.installments.map(inst => {
            const isOverdue = inst.status === 'pending' && inst.due_date && new Date(inst.due_date) < new Date();
            const status = inst.status === 'pending' && isOverdue ? 'overdue' : inst.status;

            return (
              <div key={inst.installment_number} className="card" style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderLeft: `3px solid ${STATUS_COLOR[status] || 'var(--color-border)'}`,
                opacity: status === 'paid' ? 0.75 : 1,
              }}>
                <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: STATUS_COLOR[status], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {inst.installment_number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{fmt(inst.amount)}</span>
                    <span style={{ fontSize: 11, color: STATUS_COLOR[status], display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, textTransform: 'capitalize' }}>
                      {STATUS_ICON[status]} {status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Due: {fmtDate(inst.due_date)}
                    {inst.paid_at && ` · Paid: ${fmtDate(inst.paid_at)}`}
                    {inst.payment_id && ` · Ref: ${inst.payment_id.slice(-8)}`}
                  </div>
                </div>

                {/* Pay button for pending/overdue installments */}
                {status !== 'paid' && (
                  <RazorpayButton
                    amount={inst.amount}
                    leadId={bookingId}
                    customerName={booking?.customer_name}
                    customerEmail={booking?.email}
                    customerPhone={booking?.phone}
                    description={`EMI ${inst.installment_number}/${emiPlan.num_installments} — ${booking?.event_type || 'Event'}`}
                    paymentType={`emi_${inst.installment_number}`}
                    franchiseId={franchiseId}
                    branchId={branchId}
                    recordedByUid={userProfile?.uid}
                    recordedByName={userProfile?.name}
                    className="btn-sm"
                    onSuccess={async (paymentId) => {
                      // The verify route already recorded the payment
                      // Now mark the installment as paid via EMI route
                      await fetch('/api/payments/emi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'pay_installment',
                          booking_id: bookingId,
                          franchise_id: franchiseId,
                          branch_id: branchId,
                          installment_number: inst.installment_number,
                          // We need the order/signature — pass via custom flow
                          razorpay_order_id: 'verified',
                          razorpay_payment_id: paymentId,
                          razorpay_signature: 'pre_verified',
                        }),
                      });
                      onRefresh?.();
                    }}
                    onError={(msg) => setError(msg)}
                  >
                    Pay EMI {inst.installment_number}
                  </RazorpayButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
