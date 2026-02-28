'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import {
  ArrowLeft, Phone, Mail, Calendar, Users, Building2, RefreshCw,
  CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2, AlertCircle, Trash2,
  MessageSquare, Plus, Save,
} from 'lucide-react';

// â”€â”€ STATUS CONFIG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PIPELINE_STAGES = [
  { key: 'new',                   label: 'New Lead',              icon: 'ðŸ“ž', desc: 'Lead captured' },
  { key: 'visited',               label: 'Property Visit',        icon: 'ðŸ›ï¸', desc: 'Site visit done' },
  { key: 'tasting_scheduled',     label: 'Tasting Scheduled',     icon: 'ðŸ½ï¸', desc: 'Food tasting scheduled' },
  { key: 'tasting_done',          label: 'Tasting Done',          icon: 'âœ…', desc: 'Tasting completed' },
  { key: 'menu_selected',         label: 'Menu Selected',         icon: 'ðŸ“‹', desc: 'Menu finalized' },
  { key: 'advance_paid',          label: 'Advance Paid',          icon: 'ðŸ’°', desc: '30-50% advanced received' },
  { key: 'decoration_scheduled',  label: 'DÃ©cor Scheduled',       icon: 'ðŸŽ¨', desc: 'Vendor/dÃ©cor finalized' },
  { key: 'paid',                  label: 'Full Payment Done',     icon: 'âœ…', desc: 'Remaining amount received' },
  { key: 'in_progress',           label: 'Event In Progress',     icon: 'ðŸŽ‰', desc: 'Event happening now' },
  { key: 'completed',             label: 'Event Completed',       icon: 'ðŸ†', desc: 'Event finished successfully' },
  { key: 'settlement_pending',    label: 'Settlement Pending',    icon: 'ðŸ§¾', desc: 'Final bill settlement' },
  { key: 'settlement_complete',   label: 'Settlement Complete',   icon: 'âœ”ï¸', desc: 'All dues cleared' },
  { key: 'feedback_pending',      label: 'Feedback Pending',      icon: 'â­', desc: 'Collect customer review' },
  { key: 'closed',                label: 'Closed',                icon: 'ðŸ”’', desc: 'Lead closed' },
];

const STATUS_STYLE = {
  new:                   { bg: '#dbeafe', color: '#1d4ed8' },
  visited:               { bg: '#ede9fe', color: '#6d28d9' },
  tasting_scheduled:     { bg: '#fef3c7', color: '#d97706' },
  tasting_done:          { bg: '#fde68a', color: '#b45309' },
  menu_selected:         { bg: '#d1fae5', color: '#065f46' },
  advance_paid:          { bg: '#ecfdf5', color: '#059669' },
  decoration_scheduled:  { bg: '#e0f2fe', color: '#0369a1' },
  paid:                  { bg: '#dcfce7', color: '#16a34a' },
  in_progress:           { bg: '#fef9c3', color: '#a16207' },
  completed:             { bg: '#bbf7d0', color: '#15803d' },
  settlement_pending:    { bg: '#fed7aa', color: '#c2410c' },
  settlement_complete:   { bg: '#d1fae5', color: '#065f46' },
  feedback_pending:      { bg: '#e0e7ff', color: '#4338ca' },
  closed:                { bg: '#f0fdf4', color: '#166534' },
  lost:                  { bg: '#fee2e2', color: '#991b1b' },
};

const STAGE_ORDER = PIPELINE_STAGES.map(s => s.key);

// Role â†’ which stages they can update
const ROLE_STAGE_ACCESS = {
  receptionist:    ['follow_ups'],
  sales_executive: ['new','visited','tasting_scheduled','tasting_done','menu_selected','follow_ups'],
  kitchen_manager: ['tasting_scheduled','tasting_done','menu_selected'],
  accountant:      ['menu_selected','advance_paid','decoration_scheduled','paid','settlement_pending','settlement_complete'],
  branch_manager:  STAGE_ORDER,
  franchise_admin: STAGE_ORDER,
  super_admin:     STAGE_ORDER,
};

function canUpdateStage(role, stageKey) {
  const allowed = ROLE_STAGE_ACCESS[role] || [];
  return allowed.includes(stageKey) || allowed.includes('follow_ups');
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function InfoRow({ label, value, href }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'10px 0', borderBottom:'1px solid var(--color-border)' }}>
      <span style={{ fontSize:11, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
      {href
        ? <a href={href} style={{ fontSize:14, color:'var(--color-primary)' }}>{value || 'â€”'}</a>
        : <span style={{ fontSize:14, color:'var(--color-text-body)' }}>{value || 'â€”'}</span>
      }
    </div>
  );
}

function StageCard({ stage, stageData, isCurrentOrPast, isCurrent, onSave, saving, role }) {
  const [open, setOpen]     = useState(isCurrent);
  const [form, setForm]     = useState(stageData || {});
  const canEdit = (ROLE_STAGE_ACCESS[role] || []).includes(stage.key);

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }

  const stageIndex = STAGE_ORDER.indexOf(stage.key);

  return (
    <div style={{
      border:'1px solid var(--color-border)', borderRadius:10, overflow:'hidden',
      borderLeft: isCurrent ? '3px solid var(--color-primary)' : isCurrentOrPast ? '3px solid #16a34a' : '3px solid var(--color-border)',
      marginBottom:8,
    }}>
      {/* Stage header */}
      <button onClick={() => setOpen(p => !p)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'12px 16px', background:'var(--color-surface)', border:'none', cursor:'pointer', textAlign:'left',
      }}>
        <span style={{ fontSize:18, lineHeight:1 }}>{isCurrentOrPast ? (isCurrent ? 'ðŸ”µ' : 'âœ…') : 'âšª'}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'var(--color-text-h)' }}>{stage.label}</div>
          <div style={{ fontSize:11, color:'var(--color-text-muted)' }}>{stage.desc}</div>
        </div>
        {isCurrentOrPast && (
          <span style={{ fontSize:11, background: isCurrent ? '#dbeafe' : '#dcfce7', color: isCurrent ? '#1d4ed8' : '#15803d', borderRadius:20, padding:'2px 8px', fontWeight:700 }}>
            {isCurrent ? 'Current' : 'Done'}
          </span>
        )}
        {open ? <ChevronUp size={16} style={{ color:'var(--color-text-muted)', flexShrink:0 }} />
               : <ChevronDown size={16} style={{ color:'var(--color-text-muted)', flexShrink:0 }} />}
      </button>

      {/* Stage body */}
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--color-border)', background:'var(--color-surface-2)' }}>
          {/* Show existing data if done */}
          {isCurrentOrPast && stageData && !isCurrent && (
            <div style={{ padding:'12px 0' }}>
              {Object.entries(stageData).filter(([,v]) => v && typeof v !== 'object').map(([k, v]) => (
                <div key={k} style={{ display:'flex', gap:8, fontSize:13, padding:'4px 0' }}>
                  <span style={{ color:'var(--color-text-muted)', minWidth:120, textTransform:'capitalize' }}>{k.replace(/_/g,' ')}:</span>
                  <span style={{ color:'var(--color-text-body)', fontWeight:500 }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stage forms â€” only show if canEdit */}
          {canEdit && (
            <div style={{ paddingTop:12 }}>
              {stage.key === 'visited' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Visit Date *</label><input className="input" type="date" value={form.date||''} onChange={e=>setF('date',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Visited By</label><input className="input" placeholder="Staff name" value={form.visited_by||''} onChange={e=>setF('visited_by',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Customer Rating (1-5)</label><input className="input" type="number" min="1" max="5" value={form.rating_from_customer||''} onChange={e=>setF('rating_from_customer',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={e=>setF('notes',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'tasting_scheduled' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Scheduled Date *</label><input className="input" type="datetime-local" value={form.scheduled_date||''} onChange={e=>setF('scheduled_date',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Scheduled By</label><input className="input" placeholder="Staff name" value={form.scheduled_by||''} onChange={e=>setF('scheduled_by',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Menu options to present (comma-separated IDs)</label><input className="input" placeholder="pfd_menu_veg_premium, pfd_menu_veg_classic" value={form.menu_options_to_present||''} onChange={e=>setF('menu_options_to_present',e.target.value)}/></div>
                </div>
              )}
              {stage.key === 'tasting_done' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Conducted At</label><input className="input" type="datetime-local" value={form.conducted_at||''} onChange={e=>setF('conducted_at',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Customer Rating (1-5)</label><input className="input" type="number" min="1" max="5" value={form.tasting_score||''} onChange={e=>setF('tasting_score',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Preferred Menu</label><input className="input" placeholder="pfd_menu_veg_premium" value={form.preferred_menu||''} onChange={e=>setF('preferred_menu',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Feedback</label><textarea className="input" rows={2} value={form.feedback||''} onChange={e=>setF('feedback',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'menu_selected' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Finalized Menu ID</label><input className="input" placeholder="pfd_menu_veg_premium" value={form.finalized_menu_id||''} onChange={e=>setF('finalized_menu_id',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Price Per Plate (â‚¹)</label><input className="input" type="number" value={form.price_per_plate||''} onChange={e=>setF('price_per_plate',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Final Guest Count</label><input className="input" type="number" value={form.final_guest_count||''} onChange={e=>setF('final_guest_count',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Total Food Cost (â‚¹)</label><input className="input" type="number" value={form.total_food_cost||''} onChange={e=>setF('total_food_cost',e.target.value)}/></div>
                </div>
              )}
              {stage.key === 'advance_paid' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Advance Amount (â‚¹)</label><input className="input" type="number" value={form.amount||''} onChange={e=>setF('amount',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Payment Mode</label><select className="input" value={form.payment_mode||''} onChange={e=>setF('payment_mode',e.target.value)}><option value="">Selectâ€¦</option>{['Cash','UPI','Bank Transfer','Cheque','Card'].map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="form-field"><label className="form-label">Reference / UTR</label><input className="input" placeholder="Transaction ref" value={form.payment_ref||''} onChange={e=>setF('payment_ref',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Confirmed By</label><input className="input" value={form.confirmed_by||''} onChange={e=>setF('confirmed_by',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Hall Rent (â‚¹)</label><input className="input" type="number" value={form.hall_base_rent||''} onChange={e=>setF('hall_base_rent',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Total Quote (â‚¹)</label><input className="input" type="number" value={form.total_quote||''} onChange={e=>setF('total_quote',e.target.value)}/></div>
                </div>
              )}
              {stage.key === 'decoration_scheduled' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Confirmed Event Date</label><input className="input" type="date" value={form.final_confirmed_date||''} onChange={e=>setF('final_confirmed_date',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Decoration Type</label><input className="input" placeholder="Floral, Balloon, etc." value={form.decoration_type||''} onChange={e=>setF('decoration_type',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Decorator Vendor</label><input className="input" value={form.vendor||''} onChange={e=>setF('vendor',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Special Requests</label><textarea className="input" rows={2} value={form.special_requests||''} onChange={e=>setF('special_requests',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'paid' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Remaining Amount (â‚¹)</label><input className="input" type="number" value={form.remaining_amount||''} onChange={e=>setF('remaining_amount',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Payment Mode</label><select className="input" value={form.payment_mode||''} onChange={e=>setF('payment_mode',e.target.value)}><option value="">Selectâ€¦</option>{['Cash','UPI','Bank Transfer','Cheque','Card'].map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="form-field"><label className="form-label">Reference / UTR</label><input className="input" value={form.payment_ref||''} onChange={e=>setF('payment_ref',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Paid By</label><input className="input" value={form.paid_by||''} onChange={e=>setF('paid_by',e.target.value)}/></div>
                </div>
              )}
              {stage.key === 'in_progress' && (
                <div className="form-field"><label className="form-label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={e=>setF('notes',e.target.value)} style={{resize:'vertical'}}/></div>
              )}
              {stage.key === 'completed' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Rating (1-5)</label><input className="input" type="number" min="1" max="5" value={form.rating||''} onChange={e=>setF('rating',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Staff Feedback</label><textarea className="input" rows={2} value={form.staff_feedback||''} onChange={e=>setF('staff_feedback',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'settlement_pending' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Extra Charges (â‚¹)</label><input className="input" type="number" value={form.extra_charges||''} onChange={e=>setF('extra_charges',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Refund Amount (â‚¹)</label><input className="input" type="number" value={form.refund_amount||''} onChange={e=>setF('refund_amount',e.target.value)}/></div>
                  <div className="form-field form-span-2"><label className="form-label">Damage Notes</label><textarea className="input" rows={2} value={form.damage_notes||''} onChange={e=>setF('damage_notes',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'settlement_complete' && (
                <div className="form-field"><label className="form-label">Settlement Date</label><input className="input" type="date" value={form.settled_date||''} onChange={e=>setF('settled_date',e.target.value)}/></div>
              )}
              {stage.key === 'feedback_pending' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-field"><label className="form-label">Customer Rating (1-5)</label><input className="input" type="number" min="1" max="5" value={form.rating||''} onChange={e=>setF('rating',e.target.value)}/></div>
                  <div className="form-field"><label className="form-label">Repeat Booking?</label><select className="input" value={form.repeat_booking||''} onChange={e=>setF('repeat_booking',e.target.value)}><option value="">Selectâ€¦</option><option value="true">Yes</option><option value="false">No</option></select></div>
                  <div className="form-field form-span-2"><label className="form-label">Review Text</label><textarea className="input" rows={3} value={form.review_text||''} onChange={e=>setF('review_text',e.target.value)} style={{resize:'vertical'}}/></div>
                </div>
              )}
              {stage.key === 'closed' && (
                <div className="form-field"><label className="form-label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={e=>setF('notes',e.target.value)} style={{resize:'vertical'}}/></div>
              )}

              {/* Advance to this stage */}
              {stage.key !== 'new' && (
                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                  <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => onSave(stage, form)}>
                    {saving ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={13} />}
                    {isCurrent ? 'Update Stage' : `Advance to "${stage.label}"`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LeadDetailPage({ params, searchParams }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const franchise_id = searchParams?.franchise_id || userProfile?.franchise_id || 'pfd';
  const branch_id    = searchParams?.branch_id    || userProfile?.branch_id    || 'pfd_b1';
  const role         = userProfile?.role          || 'guest';

  const [lead, setLead]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [tab, setTab]         = useState('overview');

  // Follow-up form
  const [fuOpen, setFuOpen] = useState(false);
  const [fuForm, setFuForm] = useState({ date:'', type:'Call', notes:'' });

  const fetchLead = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/leads/${params.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      setLead(data.lead);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [params.id, franchise_id, branch_id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  async function updateLead(updates) {
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchise_id, branch_id, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSaveMsg('Saved!');
      fetchLead();
    } catch (e) { setSaveMsg(`Error: ${e.message}`); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(null), 3000); }
  }

  async function handleStageAdvance(stage, stageForm) {
    const nextStatus = stage.key;
    const stageKey   = stage.key === 'visited'           ? 'visited'
      : stage.key === 'tasting_scheduled'                ? 'food_tasting'
      : stage.key === 'tasting_done'                     ? 'food_tasting'
      : stage.key === 'menu_selected'                    ? 'menu_finalization'
      : stage.key === 'advance_paid'                     ? 'booking_confirmed'
      : stage.key === 'decoration_scheduled'             ? 'event_finalization'
      : stage.key === 'paid'                             ? 'final_payment'
      : stage.key === 'in_progress' || stage.key === 'completed' ? 'event_execution'
      : stage.key === 'settlement_pending' || stage.key === 'settlement_complete' ? 'post_event_settlement'
      : stage.key === 'feedback_pending' || stage.key === 'closed' ? 'feedback'
      : null;

    const updates = { status: nextStatus };
    if (stageKey) updates[stageKey] = stageForm;
    await updateLead(updates);
  }

  async function handleAddFollowUp() {
    if (!fuForm.date || !fuForm.type) { setSaveMsg('Date and type are required'); return; }
    const newFu = {
      id: Date.now(),
      date: fuForm.date,
      type: fuForm.type,
      notes: fuForm.notes,
      status: 'Done',
      logged_by: userProfile?.name || 'Staff',
      logged_at: new Date().toISOString(),
    };
    const existing = lead?.follow_ups || [];
    await updateLead({ follow_ups: [...existing, newFu] });
    setFuForm({ date:'', type:'Call', notes:'' });
    setFuOpen(false);
  }

  async function handleMarkLost() {
    if (!confirm('Mark this lead as Lost? This cannot be undone easily.')) return;
    await updateLead({ status: 'lost' });
  }

  async function handleDelete() {
    if (!confirm(`Delete lead for ${lead?.customer_name}? This is permanent.`)) return;
    setSaving(true);
    await fetch(`/api/leads/${params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ franchise_id, branch_id }),
    });
    router.push('/leads');
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12, color:'var(--color-text-muted)' }}>
        <Loader2 size={24} style={{ animation:'spin 1s linear infinite' }} /> Loading leadâ€¦
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign:'center', padding:'64px 0', color:'var(--color-text-muted)' }}>
        <AlertCircle size={40} style={{ margin:'0 auto 12px', color:'#ef4444', opacity:0.7 }} />
        <p style={{ fontSize:15, fontWeight:600 }}>{error}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16 }}>
          <button className="btn btn-ghost" onClick={fetchLead}>Retry</button>
          <Link href="/leads" className="btn btn-primary" style={{ textDecoration:'none' }}>â† Back to Leads</Link>
        </div>
      </div>
    );
  }

  const l = lead;
  const currentStageIndex = STAGE_ORDER.indexOf(l.status);
  const st = STATUS_STYLE[l.status] || {};

  // Stage data map for rendering in pipeline tab
  const STAGE_DATA_MAP = {
    visited:               l.visited,
    tasting_scheduled:     l.food_tasting,
    tasting_done:          l.food_tasting,
    menu_selected:         l.menu_finalization,
    advance_paid:          l.booking_confirmed,
    decoration_scheduled:  l.event_finalization,
    paid:                  l.final_payment,
    in_progress:           l.event_execution,
    completed:             l.event_execution,
    settlement_pending:    l.post_event_settlement,
    settlement_complete:   l.post_event_settlement,
    feedback_pending:      l.feedback,
    closed:                l.feedback,
  };

  const TABS = ['overview','pipeline','follow-ups'];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom:24 }}>
        <div className="page-header-left">
          <Link href="/leads" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--color-text-muted)', marginBottom:8, textDecoration:'none' }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>
          <h1>{l.customer_name}</h1>
          <p style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', fontSize:14, color:'var(--color-text-muted)' }}>
            ðŸŽ‰ {l.event_type} &bull; <Calendar size={13} /> {l.event_date || 'â€”'} &bull; <Users size={13} /> {l.expected_guest_count} guests
            <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>
              {PIPELINE_STAGES.find(s=>s.key===l.status)?.label || l.status}
            </span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={fetchLead} disabled={saving}>
            <RefreshCw size={14} /> Refresh
          </button>
          {['branch_manager','franchise_admin','super_admin'].includes(role) && (
            <button className="btn btn-ghost btn-sm" style={{ color:'#dc2626' }} onClick={handleMarkLost}>Mark Lost</button>
          )}
          {['branch_manager','franchise_admin','super_admin'].includes(role) && (
            <button className="btn btn-ghost btn-sm" style={{ color:'#dc2626' }} onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </motion.div>

      {saveMsg && (
        <motion.div variants={fadeUp} style={{
          background: saveMsg.startsWith('Error') ? '#fee2e2' : '#dcfce7',
          border: `1px solid ${saveMsg.startsWith('Error') ? '#fca5a5' : '#86efac'}`,
          borderRadius:8, padding:'10px 16px', marginBottom:16,
          color: saveMsg.startsWith('Error') ? '#991b1b' : '#15803d', fontSize:13,
        }}>
          {saveMsg}
        </motion.div>
      )}

      {/* KPI Row */}
      <motion.div variants={fadeUp} className="kpi-row" style={{ marginBottom:24 }}>
        {[
          { label:'Phone', val:l.phone, icon:<Phone size={16}/> },
          { label:'Hall', val:l.hall_name||'â€”', icon:<Building2 size={16}/> },
          { label:'Budget', val:l.budget_range ? `â‚¹${l.budget_range}` : 'â€”', icon:null },
          { label:'Assigned To', val:l.assigned_to_name||'Unassigned', icon:null },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'14px 18px' }}>
            <div style={{ fontSize:11, color:'var(--color-text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.label}</div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--color-text-h)', display:'flex', alignItems:'center', gap:6 }}>
              {k.icon}{k.val}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tab Bar */}
      <motion.div variants={fadeUp} style={{ display:'flex', gap:4, borderBottom:'1px solid var(--color-border)', marginBottom:24, overflowX:'auto' }}>
        {[['overview','Overview'],['pipeline','Pipeline'],['follow-ups','Follow-ups']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:'10px 16px', fontSize:13, fontWeight: tab===key ? 700 : 400,
            background:'none', border:'none', cursor:'pointer',
            borderBottom: tab===key ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab===key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            whiteSpace:'nowrap',
          }}>
            {label} {key==='follow-ups' && l.follow_ups?.length > 0 && (
              <span style={{ background:'var(--color-border)', borderRadius:10, padding:'1px 6px', fontSize:11, marginLeft:4 }}>{l.follow_ups.length}</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* â”€â”€ OVERVIEW TAB â”€â”€ */}
      {tab === 'overview' && (
        <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } }} style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>
          <motion.div variants={fadeUp} className="card" style={{ padding:24 }}>
            <div className="form-section-title">Customer & Event Details</div>
            <InfoRow label="Customer Name" value={l.customer_name} />
            <InfoRow label="Phone"         value={l.phone}         href={`tel:${l.phone}`} />
            <InfoRow label="Email"         value={l.email}         href={l.email ? `mailto:${l.email}` : null} />
            <InfoRow label="Event Type"    value={l.event_type} />
            <InfoRow label="Event Date"    value={l.event_date} />
            <InfoRow label="Expected Guests" value={l.expected_guest_count} />
            <InfoRow label="Budget Range"  value={l.budget_range ? `â‚¹${l.budget_range}` : null} />
            <InfoRow label="Hall"          value={l.hall_name || l.hall_id} />
            <InfoRow label="Assigned To"   value={l.assigned_to_name} />
            <InfoRow label="Created"       value={l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN') : 'â€”'} />
          </motion.div>

          <motion.div variants={fadeUp} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="card" style={{ padding:20 }}>
              <div className="form-section-title" style={{ marginBottom:12 }}>Current Stage</div>
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{PIPELINE_STAGES.find(s=>s.key===l.status)?.icon || 'ðŸ“Œ'}</div>
                <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:700 }}>
                  {PIPELINE_STAGES.find(s=>s.key===l.status)?.label || l.status}
                </span>
                <p style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:8 }}>
                  Stage {currentStageIndex + 1} of {PIPELINE_STAGES.length}
                </p>
                {/* Progress bar */}
                <div style={{ background:'var(--color-border)', borderRadius:4, height:6, marginTop:12, overflow:'hidden' }}>
                  <div style={{ width:`${((currentStageIndex+1)/PIPELINE_STAGES.length)*100}%`, height:'100%', background:'var(--color-primary)', borderRadius:4, transition:'width 0.4s' }} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding:20 }}>
              <div className="form-section-title" style={{ marginBottom:12 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent:'flex-start' }} onClick={() => { setTab('follow-ups'); setFuOpen(true); }}>
                  <MessageSquare size={14} /> Log Follow-up
                </button>
                <button className="btn btn-ghost btn-sm" style={{ justifyContent:'flex-start' }} onClick={() => setTab('pipeline')}>
                  <CheckCircle2 size={14} /> Advance Stage
                </button>
                <Link href={`/leads/create`} className="btn btn-ghost btn-sm" style={{ textDecoration:'none', justifyContent:'flex-start' }}>
                  <Plus size={14} /> New Lead
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* â”€â”€ PIPELINE TAB â”€â”€ */}
      {tab === 'pipeline' && (
        <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.04 } } }}>
          <motion.div variants={fadeUp} style={{ marginBottom:12, display:'flex', gap:8, alignItems:'center' }}>
            <div className="form-section-title" style={{ margin:0 }}>Lead Pipeline</div>
            <span style={{ fontSize:12, color:'var(--color-text-muted)' }}>Click each stage to expand details and update.</span>
          </motion.div>
          {PIPELINE_STAGES.map((stage) => {
            const stageIdx = STAGE_ORDER.indexOf(stage.key);
            const isCurrentOrPast = stageIdx <= currentStageIndex;
            const isCurrent = stage.key === l.status;
            return (
              <motion.div key={stage.key} variants={fadeUp}>
                <StageCard
                  stage={stage}
                  stageData={STAGE_DATA_MAP[stage.key]}
                  isCurrentOrPast={isCurrentOrPast}
                  isCurrent={isCurrent}
                  onSave={handleStageAdvance}
                  saving={saving}
                  role={role}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* â”€â”€ FOLLOW-UPS TAB â”€â”€ */}
      {tab === 'follow-ups' && (
        <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.06 } } }}>
          <motion.div variants={fadeUp} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="form-section-title" style={{ margin:0 }}>Follow-up Log</div>
            <button className="btn btn-primary btn-sm" onClick={() => setFuOpen(p=>!p)}>
              <Plus size={14} /> Add Follow-up
            </button>
          </motion.div>

          {/* Add Follow-up Form */}
          {fuOpen && (
            <motion.div variants={fadeUp} className="card" style={{ padding:20, marginBottom:16, border:'1px solid var(--color-primary)', borderRadius:10 }}>
              <div className="form-section-title" style={{ marginBottom:12 }}>Log Follow-up</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:12, alignItems:'end' }}>
                <div className="form-field">
                  <label className="form-label">Date *</label>
                  <input className="input" type="date" value={fuForm.date} onChange={e=>setFuForm(p=>({...p,date:e.target.value}))}/>
                </div>
                <div className="form-field">
                  <label className="form-label">Type *</label>
                  <select className="input" value={fuForm.type} onChange={e=>setFuForm(p=>({...p,type:e.target.value}))}>
                    {['Call','Visit','Email','WhatsApp','Meeting'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Notes</label>
                  <input className="input" placeholder="What was discussed?" value={fuForm.notes} onChange={e=>setFuForm(p=>({...p,notes:e.target.value}))}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleAddFollowUp}>
                  {saving ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> : <Save size={13}/>} Save Follow-up
                </button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setFuOpen(false)}>Cancel</button>
              </div>
            </motion.div>
          )}

          {/* Follow-ups list */}
          {(!l.follow_ups || l.follow_ups.length === 0) ? (
            <motion.div variants={fadeUp} style={{ textAlign:'center', padding:'48px 0', color:'var(--color-text-muted)' }}>
              <MessageSquare size={32} style={{ margin:'0 auto 10px', opacity:0.3 }}/>
              <p>No follow-ups yet.</p>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--color-surface-2)', fontSize:11, color:'var(--color-text-muted)', textTransform:'uppercase' }}>
                    {['Date','Type','Notes','Logged By'].map(h=>(
                      <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...l.follow_ups].reverse().map((f, i) => (
                    <tr key={f.id || i} style={{ borderTop:'1px solid var(--color-border)', fontSize:14 }}>
                      <td style={{ padding:'12px 16px', whiteSpace:'nowrap', color:'var(--color-text-body)' }}>{f.date}</td>
                      <td style={{ padding:'12px 16px' }}><span style={{ background:'#e0e7ff', color:'#4338ca', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{f.type}</span></td>
                      <td style={{ padding:'12px 16px', color:'var(--color-text-muted)', fontSize:13 }}>{f.notes || 'â€”'}</td>
                      <td style={{ padding:'12px 16px', color:'var(--color-text-muted)', fontSize:12 }}>{f.logged_by || 'â€”'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}