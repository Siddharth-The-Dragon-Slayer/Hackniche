'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  ArrowLeft, Save, Loader2, AlertCircle, Building2, Info, Users,
  Phone, Mail, Calendar, DollarSign, UserCheck, MessageSquare,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────
const EVENT_TYPES = [
  'Wedding','Reception','Engagement','Birthday','Corporate','Sangeet',
  'Anniversary','Baby Shower','Naming Ceremony','Haldi','Mehendi','Other',
];

const LEAD_SOURCES = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'justdial', label: 'JustDial' },
  { value: 'sulekha', label: 'Sulekha' },
  { value: 'indiamart', label: 'IndiaMart' },
  { value: 'referral_client', label: 'Referral — Client' },
  { value: 'referral_vendor', label: 'Referral — Vendor' },
  { value: 'referral_staff', label: 'Referral — Staff' },
  { value: 'wedding_portal', label: 'Wedding Portal' },
  { value: 'event_portal', label: 'Event Portal' },
  { value: 'newspaper_ad', label: 'Newspaper Ad' },
  { value: 'hoarding', label: 'Hoarding/Banner' },
  { value: 'pamphlet', label: 'Pamphlet/Flyer' },
  { value: 'radio', label: 'Radio' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'repeat_client', label: 'Repeat Client' },
  { value: 'other', label: 'Other' },
];

const FOLLOWUP_TYPES = ['Call', 'WhatsApp', 'Email', 'Site Visit', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];
const BUDGET_FLEXIBILITIES = ['rigid', 'moderate', 'flexible'];

const STAFF_ROLES = ['sales_executive', 'branch_manager', 'franchise_admin', 'receptionist', 'super_admin'];
const CAN_CREATE = ['receptionist', 'sales_executive', 'branch_manager', 'franchise_admin', 'super_admin'];

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function CreateLead() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const role = userProfile?.role || 'guest';
  const isStaff = CAN_CREATE.includes(role);
  const isCustomer = role === 'customer';
  const franchise_id = userProfile?.franchise_id || 'pfd';

  // Form state
  const [form, setForm] = useState({
    customer_name: '', phone: '', email: '',
    client_type: 'individual', company_name: '',
    event_type: 'Wedding', event_date: '',
    expected_guest_count: '',
    budget_min: '', budget_max: '', budget_flexibility: 'moderate',
    hall_id: '', hall_name: '',
    lead_source: 'walk_in', source_detail: '',
    referrer_name: '', referrer_phone: '',
    assigned_to_uid: '', assigned_to_name: '',
    priority: 'medium',
    next_followup_date: '', next_followup_type: 'Call',
    catering_required: true, decor_required: true,
    notes: '',
    branch_id: userProfile?.branch_id || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Data
  const [branches, setBranches] = useState([]);
  const [halls, setHalls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from userProfile for customer
  useEffect(() => {
    if (!userProfile) return;
    if (isCustomer) {
      setForm(p => ({
        ...p,
        customer_name: userProfile.name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
      }));
    }
    if (isStaff && userProfile.branch_id) {
      setForm(p => ({ ...p, branch_id: userProfile.branch_id }));
    }
  }, [userProfile, isCustomer, isStaff]);

  // Load branches (customers pick a branch)
  useEffect(() => {
    if (!isCustomer) return;
    getDocs(collection(db, 'branches'))
      .then(snap => setBranches(
        snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      )).catch(() => {});
  }, [isCustomer]);

  // Load halls when branch changes
  useEffect(() => {
    const bid = form.branch_id || userProfile?.branch_id;
    if (!bid) return;
    setHalls([]);
    getDocs(query(collection(db, 'halls'), where('branch_id', '==', bid)))
      .then(snap => setHalls(
        snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      )).catch(() => {});
  }, [form.branch_id, userProfile?.branch_id]);

  // Load staff for assignment
  useEffect(() => {
    const bid = form.branch_id || userProfile?.branch_id;
    if (!isStaff || !bid) return;
    getDocs(query(collection(db, 'users'), where('branch_id', '==', bid)))
      .then(snap => setStaff(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(u => STAFF_ROLES.includes(u.role))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      )).catch(() => {});
  }, [form.branch_id, userProfile?.branch_id, isStaff]);

  function handleHallChange(hallId) {
    const h = halls.find(h => h.id === hallId);
    setForm(p => ({ ...p, hall_id: hallId, hall_name: h?.name || '' }));
  }

  function handleStaffChange(uid) {
    const u = staff.find(s => s.id === uid);
    setForm(p => ({ ...p, assigned_to_uid: uid, assigned_to_name: u?.name || '' }));
  }

  async function handleSubmit() {
    setError(null);
    const missing = [];
    if (!form.customer_name.trim()) missing.push('Full Name');
    if (!form.phone.trim())         missing.push('Phone');
    if (missing.length) { setError(`Required: ${missing.join(', ')}`); return; }

    // Phone format basic check
    const cleanPhone = form.phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) { setError('Phone number must be at least 10 digits'); return; }

    setSaving(true);
    const bid = form.branch_id || userProfile?.branch_id || 'pfd_b1';
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchise_id,
          branch_id: bid,
          customer_name: form.customer_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          client_type: form.client_type,
          company_name: form.company_name || null,
          event_type: form.event_type || null,
          event_date: form.event_date || null,
          expected_guest_count: form.expected_guest_count ? Number(form.expected_guest_count) : null,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          budget_flexibility: form.budget_flexibility,
          hall_id: form.hall_id || null,
          hall_name: form.hall_name || null,
          lead_source: form.lead_source || 'walk_in',
          source_detail: form.source_detail || null,
          referrer_name: form.referrer_name || null,
          referrer_phone: form.referrer_phone || null,
          assigned_to_uid: form.assigned_to_uid || null,
          assigned_to_name: form.assigned_to_name || null,
          priority: form.priority,
          next_followup_date: form.next_followup_date || null,
          next_followup_type: form.next_followup_type || null,
          catering_required: form.catering_required,
          decor_required: form.decor_required,
          notes: form.notes || null,
          customer_uid: isCustomer ? userProfile?.uid : null,
          created_by_uid: userProfile?.uid || null,
          created_by_name: userProfile?.name || null,
          created_by_role: role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError(`${data.message || data.error}. Existing lead ID: ${data.existing_lead_id}`);
          setSaving(false);
          return;
        }
        throw new Error(data.error || 'Failed to submit');
      }

      if (isCustomer) {
        setSubmitted(true);
      } else {
        router.push(`/leads/${data.id}?franchise_id=${franchise_id}&branch_id=${bid}`);
      }
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  // Success screen for customers
  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', padding: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <MessageSquare size={36} style={{ color: '#16a34a' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>Enquiry Submitted!</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
          Thank you! Our team will review your enquiry and contact you shortly.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard/customer" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
          <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setForm(p => ({ ...p, event_type: 'Wedding', event_date: '', expected_guest_count: '', notes: '' })); }}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const backHref = isCustomer ? '/dashboard/customer' : '/leads';
  const backLabel = isCustomer ? 'Back to Dashboard' : 'Back to Leads';
  const pageTitle = isCustomer ? 'Submit Event Enquiry' : 'Create New Lead';
  const isReferral = form.lead_source?.startsWith('referral_');

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1>{pageTitle}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {isCustomer ? 'Tell us about your event' : 'Capture lead details, assign, and schedule follow-up'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => router.push(backHref)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'Submitting…' : isCustomer ? 'Submit Enquiry' : 'Create Lead'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="form-card">

        {/* ── SECTION 1: Client Details ────────────────────────────────── */}
        <div className="form-section-title"><Users size={14} /> Client Details</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="Rajesh Kumar" value={form.customer_name}
              onChange={e => set('customer_name', e.target.value)}
              readOnly={isCustomer && !!userProfile?.name}
              style={isCustomer && userProfile?.name ? { background: 'var(--color-surface-2)' } : {}} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input className="input" placeholder="+91-9876543210" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              readOnly={isCustomer && !!userProfile?.phone}
              style={isCustomer && userProfile?.phone ? { background: 'var(--color-surface-2)' } : {}} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="rajesh@email.com" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </div>
          {isStaff && (
            <div className="form-field">
              <label className="form-label">Client Type</label>
              <select className="input" value={form.client_type} onChange={e => set('client_type', e.target.value)}>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          )}
          {form.client_type === 'corporate' && (
            <div className="form-field form-span-2">
              <label className="form-label">Company Name</label>
              <input className="input" placeholder="Company Pvt. Ltd." value={form.company_name}
                onChange={e => set('company_name', e.target.value)} />
            </div>
          )}
        </div>
        {/* Branch selector for customers — must be before Event Requirements so halls load */}
        {isCustomer && (
          <>
            <div className="form-section-title" style={{ marginTop: 24 }}><Building2 size={14} /> Preferred Venue</div>
            <div className="form-grid">
              <div className="form-field form-span-2">
                <label className="form-label">Branch / Venue (Optional)</label>
                <select className="input" value={form.branch_id} onChange={e => set('branch_id', e.target.value)}>
                  <option value="">No preference — team will suggest</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {/* ── SECTION 2: Event Requirements ────────────────────────────── */}
        <div className="form-section-title" style={{ marginTop: 24 }}><Calendar size={14} /> Event Requirements</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Event Type</label>
            <select className="input" value={form.event_type} onChange={e => set('event_type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Preferred Date</label>
            <input className="input" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-field">
            <label className="form-label">Expected Guests</label>
            <input className="input" type="number" placeholder="250" min="1" value={form.expected_guest_count}
              onChange={e => set('expected_guest_count', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Hall Preference</label>
            {halls.length === 0 ? (
              <select className="input" disabled><option>{form.branch_id ? 'No halls found' : 'Select a branch first'}</option></select>
            ) : (
              <select className="input" value={form.hall_id} onChange={e => handleHallChange(e.target.value)}>
                <option value="">TBD — decide later</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} — Cap: {h.capacity_seating || h.capacity_floating || '?'} | {fmt(h.base_price)}/day
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-field">
            <label className="form-label">Catering Required?</label>
            <select className="input" value={form.catering_required ? 'yes' : 'no'} onChange={e => set('catering_required', e.target.value === 'yes')}>
              <option value="yes">Yes</option>
              <option value="no">No — self-arranged</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Decor Required?</label>
            <select className="input" value={form.decor_required ? 'yes' : 'no'} onChange={e => set('decor_required', e.target.value === 'yes')}>
              <option value="yes">Yes</option>
              <option value="no">No — self-arranged</option>
            </select>
          </div>
        </div>

        {/* ── SECTION 3: Budget ────────────────────────────────────────── */}
        <div className="form-section-title" style={{ marginTop: 24 }}><DollarSign size={14} /> Budget</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Minimum Budget (₹)</label>
            <input className="input" type="number" placeholder="200000" value={form.budget_min}
              onChange={e => set('budget_min', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Maximum Budget (₹)</label>
            <input className="input" type="number" placeholder="500000" value={form.budget_max}
              onChange={e => set('budget_max', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Flexibility</label>
            <select className="input" value={form.budget_flexibility} onChange={e => set('budget_flexibility', e.target.value)}>
              {BUDGET_FLEXIBILITIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* ── SECTION 4: Lead Source ───────────────────────────────────── */}
        {isStaff && (
          <>
            <div className="form-section-title" style={{ marginTop: 24 }}><Info size={14} /> Lead Source</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Source</label>
                <select className="input" value={form.lead_source} onChange={e => set('lead_source', e.target.value)}>
                  {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Source Detail</label>
                <input className="input" placeholder="e.g. Google ad campaign name, specific page…"
                  value={form.source_detail} onChange={e => set('source_detail', e.target.value)} />
              </div>
              {isReferral && (
                <>
                  <div className="form-field">
                    <label className="form-label">Referrer Name</label>
                    <input className="input" placeholder="Who referred?" value={form.referrer_name}
                      onChange={e => set('referrer_name', e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Referrer Phone</label>
                    <input className="input" placeholder="+91-..." value={form.referrer_phone}
                      onChange={e => set('referrer_phone', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── SECTION 5: Assignment & Follow-up ────────────────────────── */}
        {isStaff && (
          <>
            <div className="form-section-title" style={{ marginTop: 24 }}><UserCheck size={14} /> Assignment &amp; Follow-up</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Assign To</label>
                {staff.length > 0 ? (
                  <select className="input" value={form.assigned_to_uid} onChange={e => handleStaffChange(e.target.value)}>
                    <option value="">Unassigned</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role?.replace(/_/g, ' ')})</option>)}
                  </select>
                ) : (
                  <input className="input" placeholder="Sales exec name" value={form.assigned_to_name}
                    onChange={e => set('assigned_to_name', e.target.value)} />
                )}
              </div>
              <div className="form-field">
                <label className="form-label">Priority</label>
                <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Next Follow-up Date</label>
                <input className="input" type="date" value={form.next_followup_date}
                  onChange={e => set('next_followup_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-field">
                <label className="form-label">Follow-up Type</label>
                <select className="input" value={form.next_followup_type} onChange={e => set('next_followup_type', e.target.value)}>
                  {FOLLOWUP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── SECTION 6: Notes ─────────────────────────────────────────── */}
        <div className="form-section-title" style={{ marginTop: 24 }}><MessageSquare size={14} /> {isCustomer ? 'Additional Info' : 'Notes'}</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            <label className="form-label">{isCustomer ? 'Special Requirements / Preferences' : 'Internal Notes'}</label>
            <textarea className="input" rows={3} placeholder={isCustomer ? 'Any special requirements, dietary preferences, theme ideas…' : 'Any special requirements, preferences, or observations…'}
              value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions" style={{ marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={() => router.push(backHref)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Submitting…' : isCustomer ? 'Submit Enquiry' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
