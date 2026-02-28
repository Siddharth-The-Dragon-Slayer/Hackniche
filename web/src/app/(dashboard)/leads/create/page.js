'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Save, Loader2, AlertCircle, Building2, Sparkles, Info } from 'lucide-react';

const EVENT_TYPES = ['Wedding','Reception','Engagement','Birthday','Corporate','Sangeet','Anniversary','Baby Shower','Naming Ceremony','Other'];
const BUDGET_RANGES = ['0-200000','200000-500000','500000-1000000','1000000-2000000','2000000+'];
const FRANCHISE_ID_DEFAULT = 'pfd';

// Roles that can create leads
const RECEPTIONIST_ROLES = ['receptionist', 'customer'];
const SALES_EXEC_ROLES = ['sales_executive', 'branch_manager', 'franchise_admin', 'super_admin'];

export default function CreateLeadPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const role         = userProfile?.role          || 'customer';
  const isCustomer   = role === 'customer';
  const isReceptionist = role === 'receptionist';
  const isSalesExec = SALES_EXEC_ROLES.includes(role);
  const isBasicCapture = isCustomer || isReceptionist;

  // For staff: use their own branch; for customers: they pick a branch
  const franchise_id = userProfile?.franchise_id  || FRANCHISE_ID_DEFAULT;
  const assignerName = userProfile?.name          || '';
  const assignerUid  = userProfile?.uid           || '';

  const [halls,    setHalls]    = useState([]);
  const [branches, setBranches] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [usersInBranch, setUsersInBranch] = useState([]); // For sales exec assignment

  const [form, setForm] = useState({
    customer_name: '', phone: '', email: '',
    event_type: 'Wedding', event_date: '',
    expected_guest_count: '', 
    // Sales exec only fields
    budget_range: '',
    branch_id: '', hall_id: '', hall_name: '',
    assigned_to_uid: '', assigned_to_name: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Sync userProfile into form once it loads (avoids async race on initial render)
  useEffect(() => {
    if (!userProfile) return;
    setForm(prev => ({
      ...prev,
      customer_name: prev.customer_name || (isBasicCapture ? userProfile.name  || '' : ''),
      phone:         prev.phone         || (isBasicCapture ? userProfile.phone || '' : ''),
      email:         prev.email         || (isBasicCapture ? userProfile.email || '' : ''),
      branch_id:     prev.branch_id     || (!isBasicCapture ? userProfile.branch_id || '' : ''),
      assigned_to_uid:  prev.assigned_to_uid  || (!isBasicCapture ? userProfile.uid  || '' : ''),
      assigned_to_name: prev.assigned_to_name || (!isBasicCapture ? userProfile.name || '' : ''),
    }));
  }, [userProfile, isBasicCapture]);

  // Customers: load ALL branches (no composite index needed — no orderBy)
  useEffect(() => {
    if (!isCustomer) return;
    getDocs(collection(db, 'branches'))
      .then(snap => setBranches(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      ))
      .catch(() => {});
  }, [isCustomer]);

  // Load halls whenever branch_id changes (for sales exec)
  useEffect(() => {
    const bid = form.branch_id || (isSalesExec ? userProfile?.branch_id : null);
    if (!bid) return;
    setHalls([]);
    getDocs(query(collection(db, 'halls'), where('branch_id', '==', bid)))
      .then(snap => setHalls(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      ))
      .catch(() => {});
  }, [form.branch_id, isSalesExec, userProfile?.branch_id]);

  // Load users in the branch (for sales exec to assign leads)
  useEffect(() => {
    const bid = form.branch_id || (isSalesExec ? userProfile?.branch_id : null);
    if (!isSalesExec || !bid) return;
    getDocs(query(collection(db, 'users'), where('branch_id', '==', bid)))
      .then(snap => setUsersInBranch(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(u => SALES_EXEC_ROLES.includes(u.role) || u.role === 'receptionist')
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      ))
      .catch(() => {});
  }, [form.branch_id, isSalesExec, userProfile?.branch_id]);

  function handleHallChange(hall_id) {
    const h = halls.find(h => h.id === hall_id);
    setForm(p => ({ ...p, hall_id, hall_name: h?.name || '' }));
  }

  async function handleSubmit() {
    setSaveError(null);
    const missing = [];
    if (!form.customer_name.trim())   missing.push('Full Name');
    if (!form.phone.trim())           missing.push('Phone');
    if (!form.event_type)             missing.push('Event Type');
    if (!form.event_date)             missing.push('Event Date');
    if (!form.expected_guest_count)   missing.push('Expected Guests');
    
    // Sales exec must fill all fields
    if (isSalesExec) {
      if (!form.branch_id) missing.push('Branch/Venue');
      if (!form.budget_range) missing.push('Budget Range');
    }
    
    if (missing.length) { setSaveError(`Required: ${missing.join(', ')}`); return; }

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
          event_type: form.event_type,
          event_date: form.event_date,
          expected_guest_count: Number(form.expected_guest_count),
          // Only sales exec fills these out initially
          budget_range: isSalesExec ? form.budget_range || null : null,
          hall_id: isSalesExec ? form.hall_id || null : null,
          hall_name: isSalesExec ? form.hall_name || null : null,
          assigned_to_uid: isSalesExec ? form.assigned_to_uid || null : null,
          assigned_to_name: isSalesExec ? form.assigned_to_name || null : null,
          // Customer self‑service: tie the doc to their UID so they can track it
          customer_uid: isCustomer ? assignerUid : null,
          // Flag to indicate if this is initial capture or sales exec input
          created_by_role: role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit enquiry');

      if (isBasicCapture) {
        setSubmitted(true);
      } else {
        router.push(`/leads/${data.id}?franchise_id=${franchise_id}&branch_id=${bid}`);
      }
    } catch (e) {
      setSaveError(e.message);
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center', padding:32 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <Sparkles size={36} style={{ color:'#16a34a' }} />
        </div>
        <h2 style={{ fontSize:24, fontWeight:700, color:'var(--color-text-h)', marginBottom:8, fontFamily:'var(--font-display)' }}>Enquiry Submitted!</h2>
        <p style={{ color:'var(--color-text-muted)', fontSize:15, maxWidth:420, lineHeight:1.6, marginBottom:24 }}>
          Thank you! Our team will review your enquiry and get back to you shortly. You can track the status of your event from your dashboard.
        </p>
        <div style={{ display:'flex', gap:12 }}>
          <Link href="/dashboard/customer" className="btn btn-primary" style={{ textDecoration:'none' }}>Go to My Dashboard</Link>
          <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setForm(f => ({ ...f, event_date:'', expected_guest_count:'', budget_range:'', hall_id:'', hall_name:'' })); }}>
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const backHref = isBasicCapture ? '/dashboard/customer' : '/leads';
  const backLabel = isBasicCapture ? 'Back to Dashboard' : 'Back to Leads';
  const pageTitle = isBasicCapture ? 'Submit Event Enquiry' : 'Create New Lead';
  const pageSubtitle = isBasicCapture 
    ? 'Tell us about your event and our team will get back to you' 
    : 'Capture basic enquiry and coordinate with sales team';
  const submitButtonLabel = isBasicCapture ? 'Submit Enquiry' : 'Create Lead';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href={backHref} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--color-text-muted)', marginBottom:8, textDecoration:'none' }}>
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1>{pageTitle}</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:14 }}>
            {pageSubtitle}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => router.push(backHref)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'Submitting…' : submitButtonLabel}
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, color:'#991b1b', fontSize:13 }}>
          <AlertCircle size={15} /> {saveError}
        </div>
      )}

      {isSalesExec && (
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'flex-start', gap:8, color:'#1e40af', fontSize:13 }}>
          <Info size={15} style={{ marginTop:2, flexShrink:0 }} />
          <div>
            <strong>Sales Executive Flow:</strong> Fill in all details (venue, budget, and assignment) to complete the lead capture.
          </div>
        </div>
      )}

      {isBasicCapture && (
        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'flex-start', gap:8, color:'#166534', fontSize:13 }}>
          <Info size={15} style={{ marginTop:2, flexShrink:0 }} />
          <div>
            <strong>Basic Enquiry:</strong> Provide your event details. A sales executive will contact you shortly to finalize the venue and budget.
          </div>
        </div>
      )}

      <div className="form-card">
        {/* Branch selector — for sales executives only */}
        {isSalesExec && (
          <>
            <div className="form-section-title">Select Branch / Venue</div>
            <div className="form-grid">
              <div className="form-field form-span-2">
                <label className="form-label">Branch *</label>
                <select className="input" value={form.branch_id} onChange={e => { set('branch_id', e.target.value); set('hall_id', ''); set('hall_name', ''); }}>
                  <option value="">Choose a branch…</option>
                  {branches.length === 0 ? (
                    // Auto-select current branch for staff
                    userProfile?.branch_id && (
                      <option key={userProfile.branch_id} value={userProfile.branch_id}>
                        {userProfile.branch_name || `Branch ${userProfile.branch_id}`}
                      </option>
                    )
                  ) : (
                    branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} — {b.city} ({b.address?.slice(0,40)}…)</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Customer branch selector — for customer basic capture only */}
        {isCustomer && (
          <>
            <div className="form-section-title">Select Branch / Venue</div>
            <div className="form-grid">
              <div className="form-field form-span-2">
                <label className="form-label">Preferred Branch / Venue (Optional)</label>
                <select className="input" value={form.branch_id} onChange={e => { set('branch_id', e.target.value); set('hall_id', ''); set('hall_name', ''); }}>
                  <option value="">No preference - sales team will contact you with options</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Customer Information */}
        <div className="form-section-title" style={{ marginTop: isCustomer ? 24 : 0 }}>Your Information</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input
              className="input"
              placeholder="Rajesh Sharma"
              value={form.customer_name}
              onChange={e => set('customer_name', e.target.value)}
              readOnly={isCustomer && !!userProfile?.name}
              style={isCustomer && userProfile?.name ? { background:'var(--color-surface-2)', cursor:'default' } : {}}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input
              className="input"
              placeholder="+91-9876543210"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              readOnly={isCustomer && !!userProfile?.phone}
              style={isCustomer && userProfile?.phone ? { background:'var(--color-surface-2)', cursor:'default' } : {}}
            />
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="rajesh@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              readOnly={isCustomer && !!userProfile?.email}
              style={isCustomer && userProfile?.email ? { background:'var(--color-surface-2)', cursor:'default' } : {}}
            />
          </div>
        </div>

        {/* Event Details */}
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
            <label className="form-label">Expected Guests *</label>
            <input className="input" type="number" placeholder="250" min="1" value={form.expected_guest_count} onChange={e => set('expected_guest_count', e.target.value)} />
          </div>
          {isSalesExec && (
            <div className="form-field">
              <label className="form-label">Budget Range (₹) *</label>
              <select className="input" value={form.budget_range} onChange={e => set('budget_range', e.target.value)}>
                <option value="">Select range…</option>
                {BUDGET_RANGES.map(r => <option key={r} value={r}>{r.replace('-',' – ₹').replace('+',' & above').replace(/^(\d+)/, '₹$1')}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Hall Selection — sales exec only */}
        {isSalesExec && (
          <>
            <div className="form-section-title" style={{ marginTop:24, display:'flex', alignItems:'center', gap:8 }}>
              <Building2 size={16} /> Hall / Venue Assignment
            </div>
            <div className="form-grid">
              <div className="form-field form-span-2">
                <label className="form-label">Suggested Hall</label>
                {!form.branch_id && !userProfile?.branch_id ? (
                  <select className="input" disabled><option>Select a branch first to see halls</option></select>
                ) : halls.length === 0 ? (
                  <select className="input" disabled><option>Loading halls…</option></select>
                ) : (
                  <select className="input" value={form.hall_id} onChange={e => handleHallChange(e.target.value)}>
                    <option value="">TBD - to be decided after discussion</option>
                    {halls.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} — Seating: {h.capacity_seating} | Floating: {h.capacity_floating} | ₹{h.base_price?.toLocaleString('en-IN')}/day
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </>
        )}

        {/* Assignment — sales exec only */}
        {isSalesExec && (
          <>
            <div className="form-section-title" style={{ marginTop:24 }}>Assignment</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Assigned To (Name)</label>
                <input className="input" placeholder="Sales executive name" value={form.assigned_to_name} onChange={e => set('assigned_to_name', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Assigned To (UID)</label>
                <input className="input" placeholder="User UID (optional)" value={form.assigned_to_uid} onChange={e => set('assigned_to_uid', e.target.value)} />
              </div>
            </div>
          </>
        )}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => router.push(backHref)} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={15} />}
            {saving ? 'Submitting…' : isCustomer ? 'Submit Enquiry' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
