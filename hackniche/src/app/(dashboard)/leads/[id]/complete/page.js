'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  ArrowLeft, Save, Loader2, AlertCircle,
  Building2, User, IndianRupee, Calendar, Tag, Megaphone,
} from 'lucide-react';

/* ── constants ── */
const EVENT_TYPES = [
  'Wedding','Reception','Engagement','Birthday','Corporate',
  'Sangeet','Anniversary','Baby Shower','Naming Ceremony','Other',
];
const PRIORITIES = ['low','medium','high','urgent'];
const CLIENT_TYPES = ['individual','corporate'];
const LEAD_SOURCES = [
  'walk_in','phone_call','whatsapp','website','google_ads','facebook_ads',
  'instagram','youtube','justdial','wedmegood','weddingbazaar','shaadisaga',
  'sulekha','urbanclap','referral_client','referral_vendor','referral_staff',
  'newspaper','pamphlet','event_expo','repeat_customer','other',
];
const LEAD_SOURCE_LABELS = Object.fromEntries(
  LEAD_SOURCES.map(s => [s, s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())])
);

/* ── helpers ── */
function toDateInput(v) {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10);
  if (v?.seconds) return new Date(v.seconds * 1000).toISOString().slice(0, 10);
  return '';
}
function toDateTimeInput(v) {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 16);
  if (v?.seconds) return new Date(v.seconds * 1000).toISOString().slice(0, 16);
  return '';
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
    /* client */
    customer_name: '', phone: '', email: '',
    alternate_phone: '', client_type: 'individual', company_name: '',
    /* event */
    event_type: 'Wedding', event_date: '', expected_guest_count: '',
    catering_required: true, decor_required: false,
    /* budget */
    budget_min: '', budget_max: '', budget_flexibility: 'flexible',
    /* source */
    lead_source: 'walk_in', source_detail: '',
    referrer_name: '', referrer_phone: '',
    /* venue & assignment */
    hall_id: '', hall_name: '',
    assigned_to_uid: '', assigned_to_name: '',
    priority: 'medium',
    /* follow-up */
    next_followup_date: '', next_followup_type: 'call',
    /* notes */
    notes: '',
    special_requirements: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── Load lead (via API) + halls + staff in parallel ── */
  useEffect(() => {
    if (!leadId) return;
    const bId = branchId;

    Promise.all([
      fetch(`/api/leads/${leadId}?franchise_id=${franchiseId}&branch_id=${bId}`).then(r => r.json()),
      getDocs(query(collection(db, 'halls'), where('branch_id', '==', bId))),
      getDocs(query(collection(db, 'users'), where('branch_id', '==', bId))),
    ]).then(([leadData, hallsSnap, usersSnap]) => {
      const d = leadData?.lead;
      if (d) {
        setLeadName(d.customer_name || '');
        setForm({
          customer_name:        d.customer_name        || '',
          phone:                d.phone                || '',
          email:                d.email                || '',
          alternate_phone:      d.alternate_phone      || '',
          client_type:          d.client_type          || 'individual',
          company_name:         d.company_name         || '',
          event_type:           d.event_type           || 'Wedding',
          event_date:           toDateInput(d.event_date),
          expected_guest_count: d.expected_guest_count ? String(d.expected_guest_count) : '',
          catering_required:    d.catering_required !== false,
          decor_required:       d.decor_required === true,
          budget_min:           d.budget_min != null ? String(d.budget_min) : '',
          budget_max:           d.budget_max != null ? String(d.budget_max) : '',
          budget_flexibility:   d.budget_flexibility   || 'flexible',
          lead_source:          d.lead_source          || 'walk_in',
          source_detail:        d.source_detail        || '',
          referrer_name:        d.referrer_name        || '',
          referrer_phone:       d.referrer_phone       || '',
          hall_id:              d.hall_id              || '',
          hall_name:            d.hall_name            || '',
          assigned_to_uid:      d.assigned_to_uid      || userProfile?.uid  || '',
          assigned_to_name:     d.assigned_to_name     || userProfile?.name || '',
          priority:             d.priority             || 'medium',
          next_followup_date:   toDateTimeInput(d.next_followup_date),
          next_followup_type:   d.next_followup_type   || 'call',
          notes:                d.notes                || '',
          special_requirements: d.special_requirements || '',
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
  }, [leadId, branchId, franchiseId, userProfile]);

  function handleHallChange(hallId) {
    const h = halls.find(x => x.id === hallId);
    setForm(p => ({ ...p, hall_id: hallId, hall_name: h?.name || '' }));
  }
  function handleStaffChange(uid) {
    const s = staff.find(x => x.id === uid);
    setForm(p => ({ ...p, assigned_to_uid: uid, assigned_to_name: s?.name || '' }));
  }

  async function handleSubmit() {
    setError(null);
    const missing = [];
    if (!form.customer_name.trim()) missing.push('Full Name');
    if (!form.phone.trim())         missing.push('Phone');
    if (!form.event_type)           missing.push('Event Type');
    if (!form.event_date)           missing.push('Event Date');
    if (missing.length) { setError(`Required: ${missing.join(', ')}`); return; }

    if (form.budget_min && form.budget_max && Number(form.budget_max) < Number(form.budget_min)) {
      setError('Max budget cannot be less than min budget');
      return;
    }

    setSaving(true);
    try {
      const body = {
        franchise_id:          franchiseId,
        branch_id:             branchId,
        customer_name:         form.customer_name.trim(),
        phone:                 form.phone.trim(),
        email:                 form.email.trim() || null,
        alternate_phone:       form.alternate_phone.trim() || null,
        client_type:           form.client_type,
        company_name:          form.client_type === 'corporate' ? form.company_name.trim() || null : null,
        event_type:            form.event_type,
        event_date:            form.event_date,
        expected_guest_count:  form.expected_guest_count ? Number(form.expected_guest_count) : null,
        catering_required:     form.catering_required,
        decor_required:        form.decor_required,
        budget_min:            form.budget_min ? Number(form.budget_min) : null,
        budget_max:            form.budget_max ? Number(form.budget_max) : null,
        budget_flexibility:    form.budget_flexibility || null,
        lead_source:           form.lead_source        || null,
        source_detail:         form.source_detail.trim() || null,
        referrer_name:         form.lead_source?.startsWith('referral') ? form.referrer_name.trim() || null : null,
        referrer_phone:        form.lead_source?.startsWith('referral') ? form.referrer_phone.trim() || null : null,
        hall_id:               form.hall_id             || null,
        hall_name:             form.hall_name           || null,
        assigned_to_uid:       form.assigned_to_uid     || null,
        assigned_to_name:      form.assigned_to_name    || null,
        priority:              form.priority,
        next_followup_date:    form.next_followup_date  || null,
        next_followup_type:    form.next_followup_type  || null,
        notes:                 form.notes.trim()               || null,
        special_requirements:  form.special_requirements.trim() || null,
      };

      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/leads/${leadId}?franchise_id=${franchiseId}&branch_id=${branchId}`);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  /* ── loading state ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
      <Loader2 size={28} style={{ animation:'spin 1s linear infinite', color:'var(--color-accent)' }} />
    </div>
  );

  const isReferral = form.lead_source?.startsWith('referral');

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <Link href={`/leads/${leadId}`} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--color-text-muted)', marginBottom:8, textDecoration:'none' }}>
            <ArrowLeft size={14} /> Back to Lead
          </Link>
          <h1>Edit Lead{leadName ? `: ${leadName}` : ''}</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>Update lead details, budget, source, venue &amp; assignment</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/leads/${leadId}`)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, color:'#991b1b', fontSize:13 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="form-card">

        {/* ── Section 1 – Client Information ── */}
        <div className="form-section-title"><User size={14} /> Client Information</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="Rajesh Sharma" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="rajesh@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Alternate Phone</label>
            <input className="input" placeholder="+91 98765 00000" value={form.alternate_phone} onChange={e => set('alternate_phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Client Type</label>
            <select className="input" value={form.client_type} onChange={e => set('client_type', e.target.value)}>
              {CLIENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          {form.client_type === 'corporate' && (
            <div className="form-field">
              <label className="form-label">Company Name</label>
              <input className="input" placeholder="Company Ltd." value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
          )}
        </div>

        {/* ── Section 2 – Event Details ── */}
        <div className="form-section-title" style={{ marginTop:24 }}><Calendar size={14} /> Event Details</div>
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
          <div className="form-field" style={{ display:'flex', gap:20, alignItems:'center', paddingTop:24 }}>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              <input type="checkbox" checked={form.catering_required} onChange={e => set('catering_required', e.target.checked)} /> Catering Required
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              <input type="checkbox" checked={form.decor_required} onChange={e => set('decor_required', e.target.checked)} /> Décor Required
            </label>
          </div>
        </div>

        {/* ── Section 3 – Budget ── */}
        <div className="form-section-title" style={{ marginTop:24 }}><IndianRupee size={14} /> Budget</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Min Budget (₹)</label>
            <input className="input" type="number" placeholder="200000" min="0" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Max Budget (₹)</label>
            <input className="input" type="number" placeholder="500000" min="0" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Budget Flexibility</label>
            <select className="input" value={form.budget_flexibility} onChange={e => set('budget_flexibility', e.target.value)}>
              <option value="strict">Strict</option>
              <option value="flexible">Flexible</option>
              <option value="very_flexible">Very Flexible</option>
            </select>
          </div>
        </div>

        {/* ── Section 4 – Lead Source ── */}
        <div className="form-section-title" style={{ marginTop:24 }}><Megaphone size={14} /> Lead Source</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Source</label>
            <select className="input" value={form.lead_source} onChange={e => set('lead_source', e.target.value)}>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Source Detail</label>
            <input className="input" placeholder="Campaign name, ad ID…" value={form.source_detail} onChange={e => set('source_detail', e.target.value)} />
          </div>
          {isReferral && (
            <>
              <div className="form-field">
                <label className="form-label">Referrer Name</label>
                <input className="input" placeholder="Who referred?" value={form.referrer_name} onChange={e => set('referrer_name', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Referrer Phone</label>
                <input className="input" placeholder="+91 98765 11111" value={form.referrer_phone} onChange={e => set('referrer_phone', e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* ── Section 5 – Venue / Hall ── */}
        <div className="form-section-title" style={{ marginTop:24 }}><Building2 size={14} /> Venue / Hall Assignment</div>
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

        {/* ── Section 6 – Assignment & Priority ── */}
        <div className="form-section-title" style={{ marginTop:24 }}><Tag size={14} /> Assignment &amp; Priority</div>
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
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Next Follow-up</label>
            <input className="input" type="datetime-local" value={form.next_followup_date} onChange={e => set('next_followup_date', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Follow-up Type</label>
            <select className="input" value={form.next_followup_type} onChange={e => set('next_followup_type', e.target.value)}>
              <option value="call">Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="site_visit">Site Visit</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
        </div>

        {/* ── Section 7 – Notes ── */}
        <div className="form-section-title" style={{ marginTop:24 }}>Notes</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            <label className="form-label">Internal Notes</label>
            <textarea className="input" rows={3} placeholder="Any internal remarks…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize:'vertical' }} />
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Special Requirements</label>
            <textarea className="input" rows={2} placeholder="Dietary needs, accessibility, specific decoration wishes…" value={form.special_requirements} onChange={e => set('special_requirements', e.target.value)} style={{ resize:'vertical' }} />
          </div>
        </div>

        {/* ── Save bar ── */}
        <div className="form-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/leads/${leadId}`)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

