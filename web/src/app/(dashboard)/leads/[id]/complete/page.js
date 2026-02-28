'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Loader2, AlertCircle, Building2, User } from 'lucide-react';

const EVENT_TYPES = ['Wedding','Reception','Engagement','Birthday','Corporate','Sangeet','Anniversary','Baby Shower','Naming Ceremony','Other'];
const BUDGET_RANGES = ['0-200000','200000-500000','500000-1000000','1000000-2000000','2000000+'];

function formatBudget(r) {
  if (!r) return '';
  return r.replace(/^(\d+)-(\d+)$/, '₹$1 – ₹$2').replace(/^(\d+)\+$/, '₹$1 & above');
}

export default function CompleteLead() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const params = useParams();
  const leadId = params?.id;

  const franchiseId = userProfile?.franchise_id || 'pfd';
  const branchId    = userProfile?.branch_id    || 'pfd_b1';

  const [halls, setHalls]         = useState([]);
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [leadName, setLeadName]   = useState('');

  const [form, setForm] = useState({
    customer_name: '', phone: '', email: '',
    event_type: 'Wedding', event_date: '',
    expected_guest_count: '',
    budget_range: '',
    hall_id: '', hall_name: '',
    assigned_to_uid: '', assigned_to_name: '',
    notes: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Load lead + halls + staff in parallel
  useEffect(() => {
    if (!leadId) return;
    const bId = branchId;

    Promise.all([
      getDoc(doc(db, 'leads', leadId)),
      getDocs(query(collection(db, 'halls'), where('branch_id', '==', bId))),
      getDocs(query(collection(db, 'users'), where('branch_id', '==', bId))),
    ]).then(([leadSnap, hallsSnap, usersSnap]) => {
      if (leadSnap.exists()) {
        const d = leadSnap.data();
        setLeadName(d.customer_name || '');
        setForm({
          customer_name:       d.customer_name       || '',
          phone:               d.phone               || '',
          email:               d.email               || '',
          event_type:          d.event_type          || 'Wedding',
          event_date:          d.event_date          || '',
          expected_guest_count: d.expected_guest_count ? String(d.expected_guest_count) : '',
          budget_range:        d.budget_range        || '',
          hall_id:             d.hall_id             || '',
          hall_name:           d.hall_name           || '',
          assigned_to_uid:     d.assigned_to_uid     || userProfile?.uid  || '',
          assigned_to_name:    d.assigned_to_name    || userProfile?.name || '',
          notes:               d.notes               || '',
        });
      }
      setHalls(
        hallsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
      const STAFF_ROLES = ['sales_executive','branch_manager','franchise_admin','receptionist'];
      setStaff(
        usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(u => STAFF_ROLES.includes(u.role))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      );
    }).catch(() => setError('Failed to load lead data'))
      .finally(() => setLoading(false));
  }, [leadId, branchId, userProfile]);

  function handleHallChange(hallId) {
    const h = halls.find(h => h.id === hallId);
    setForm(p => ({ ...p, hall_id: hallId, hall_name: h?.name || '' }));
  }

  function handleStaffChange(uid) {
    const s = staff.find(s => s.id === uid);
    setForm(p => ({ ...p, assigned_to_uid: uid, assigned_to_name: s?.name || '' }));
  }

  async function handleSubmit() {
    setError(null);
    const missing = [];
    if (!form.customer_name.trim()) missing.push('Full Name');
    if (!form.phone.trim())         missing.push('Phone');
    if (!form.event_type)           missing.push('Event Type');
    if (!form.event_date)           missing.push('Event Date');
    if (!form.budget_range)         missing.push('Budget Range');
    if (!form.hall_id)              missing.push('Hall Selection');
    if (missing.length) { setError(`Required: ${missing.join(', ')}`); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchise_id:         franchiseId,
          branch_id:            branchId,
          customer_name:        form.customer_name.trim(),
          phone:                form.phone.trim(),
          email:                form.email.trim() || null,
          event_type:           form.event_type,
          event_date:           form.event_date,
          expected_guest_count: form.expected_guest_count ? Number(form.expected_guest_count) : null,
          budget_range:         form.budget_range || null,
          hall_id:              form.hall_id      || null,
          hall_name:            form.hall_name    || null,
          assigned_to_uid:      form.assigned_to_uid   || null,
          assigned_to_name:     form.assigned_to_name  || null,
          notes:                form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/leads/${leadId}?franchise_id=${franchiseId}&branch_id=${branchId}`);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <Loader2 size={28} style={{ animation:'spin 1s linear infinite', color:'var(--color-accent)' }} />
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <Link href={`/leads/${leadId}`} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--color-text-muted)', marginBottom:8, textDecoration:'none' }}>
            <ArrowLeft size={14} /> Back to Lead
          </Link>
          <h1>Edit Lead{leadName ? `: ${leadName}` : ''}</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>Update all lead details and assign venue &amp; budget</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/leads/${leadId}`)} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, color:'#991b1b', fontSize:13 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="form-card">

        {/* Section 1: Customer Info */}
        <div className="form-section-title"><User size={14} /> Customer Information</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="Rajesh Sharma" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input className="input" placeholder="+91-9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="rajesh@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>

        {/* Section 2: Event Details */}
        <div className="form-section-title" style={{ marginTop:24 }}>Event Details</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Event Type *</label>
            <select className="input" value={form.event_type} onChange={e => set('event_type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Event Date *</label>
            <input className="input" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Expected Guests</label>
            <input className="input" type="number" placeholder="250" min="1" value={form.expected_guest_count} onChange={e => set('expected_guest_count', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Budget Range (₹) *</label>
            <select className="input" value={form.budget_range} onChange={e => set('budget_range', e.target.value)}>
              <option value="">Select range…</option>
              {BUDGET_RANGES.map(r => <option key={r} value={r}>{formatBudget(r)}</option>)}
            </select>
          </div>
        </div>

        {/* Section 3: Venue */}
        <div className="form-section-title" style={{ marginTop:24 }}><Building2 size={14} /> Venue / Hall Assignment *</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            {halls.length === 0 ? (
              <select className="input" disabled><option>No halls available for this branch</option></select>
            ) : (
              <select className="input" value={form.hall_id} onChange={e => handleHallChange(e.target.value)}>
                <option value="">Select a hall…</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} — Seating: {h.capacity_seating} | Floating: {h.capacity_floating} | ₹{h.base_price?.toLocaleString('en-IN')}/day
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Section 4: Assignment */}
        <div className="form-section-title" style={{ marginTop:24 }}>Assignment</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Assign To</label>
            {staff.length > 0 ? (
              <select className="input" value={form.assigned_to_uid} onChange={e => handleStaffChange(e.target.value)}>
                <option value="">Unassigned</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role?.replace(/_/g,' ')})</option>
                ))}
              </select>
            ) : (
              <input className="input" placeholder="Assignee name" value={form.assigned_to_name} onChange={e => set('assigned_to_name', e.target.value)} />
            )}
          </div>
          <div className="form-field">
            <label className="form-label">Notes / Remarks</label>
            <input className="input" placeholder="Any special notes…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/leads/${leadId}`)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving || !form.budget_range || !form.hall_id}>
            {saving ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

