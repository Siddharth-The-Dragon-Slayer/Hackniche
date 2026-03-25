'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

export default function CreateFranchisePage() {
  const router = useRouter();
  const [staffType, setStaffType] = useState('permanent');
  const [form, setForm] = useState({
    name: '', code: '', adminEmail: '', adminPhone: '', adminName: '',
    adminPassword: '', region: '', city: '', gstNumber: '', address: '',
    currency: 'INR', logoUrl: '', logoDarkUrl: '', primaryColor: '#7B1C1C',
    defaultTaxPct: '10', defaultAdvancePct: '30', defaultCancellationPolicy: '',
    resendFromEmail: '', watiPhone: '', notifyNewLead: true, notifyBooking: true, notifyPayment: true,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/franchises" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Franchises
          </Link>
          <h1>Add New Franchise</h1>
          <p>Register a new franchise on the platform</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
        {/* Section 1 — Franchise Information */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Franchise Information</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Franchise Name *</label>
              <input className="input" placeholder="e.g. Prasad Food Divine" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Franchise Code *</label>
              <input className="input" placeholder="e.g. PFD (auto-generated)" value={form.code} onChange={e => set('code', e.target.value)} />
              <span className="form-hint">Unique identifier — 3-6 uppercase letters</span>
            </div>
            <div>
              <label className="form-label">Region</label>
              <input className="input" placeholder="e.g. South India" value={form.region} onChange={e => set('region', e.target.value)} />
            </div>
            <div>
              <label className="form-label">City *</label>
              <input className="input" placeholder="e.g. Hyderabad" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Address</label>
              <textarea className="input" rows={2} placeholder="Full registered address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="form-label">GST Number</label>
              <input className="input" placeholder="15-character GST" maxLength={15} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Default Tax %</label>
              <input className="input" type="number" min={0} max={100} value={form.defaultTaxPct} onChange={e => set('defaultTaxPct', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Default Advance %</label>
              <input className="input" type="number" min={0} max={100} value={form.defaultAdvancePct} onChange={e => set('defaultAdvancePct', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Default Cancellation Policy</label>
              <textarea className="input" rows={2} placeholder="Describe the standard cancellation terms..." value={form.defaultCancellationPolicy} onChange={e => set('defaultCancellationPolicy', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2 — Branding / Logo */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Branding</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Logo URL</label>
              <input className="input" placeholder="https://res.cloudinary.com/..." value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} />
              <span className="form-hint">Upload via Cloudinary then paste URL</span>
            </div>
            <div>
              <label className="form-label">Logo Dark Variant URL</label>
              <input className="input" placeholder="Optional — for dark mode" value={form.logoDarkUrl} onChange={e => set('logoDarkUrl', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Primary Brand Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} style={{ width: 44, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                <input className="input" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Franchise Admin */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Franchise Admin Account</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Admin Full Name *</label>
              <input className="input" placeholder="Full name" value={form.adminName} onChange={e => set('adminName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Admin Email *</label>
              <input className="input" type="email" placeholder="admin@franchise.com" value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Admin Phone</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.adminPhone} onChange={e => set('adminPhone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Temporary Password *</label>
              <input className="input" type="password" placeholder="Min. 8 characters" value={form.adminPassword} onChange={e => set('adminPassword', e.target.value)} />
              <span className="form-hint">Admin will be prompted to change on first login</span>
            </div>
          </div>
        </div>

        {/* Section 4 — Notification Preferences */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Notification Preferences</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Resend From Email</label>
              <input className="input" type="email" placeholder="noreply@franchise.com" value={form.resendFromEmail} onChange={e => set('resendFromEmail', e.target.value)} />
            </div>
            <div>
              <label className="form-label">WATI Registered Phone</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.watiPhone} onChange={e => set('watiPhone', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {[
              ['notifyNewLead', 'New lead notifications'],
              ['notifyBooking', 'Booking confirmations'],
              ['notifyPayment', 'Payment receipts'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-body)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Link href="/franchises" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/franchises')}>
            <Save size={16} /> Create Franchise
          </button>
        </div>
      </form>
    </div>
  );
}
