'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateBranchPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', code: '', franchiseId: 'PFD', address: '', city: '', state: '', pincode: '',
    phone: '', email: '', openingTime: '08:00', closingTime: '23:00',
    gstNumber: '', taxPct: '10', advancePct: '30', cancellationPolicy: '',
    bankAccount: '', bankIfsc: '', bankName: '',
    managerName: '', managerEmail: '', managerPhone: '', managerPassword: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/branches" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Branches
          </Link>
          <h1>Add New Branch</h1>
          <p>Register a new branch for your franchise</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        {/* Section 1 — Branch Info */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Branch Information</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Branch Name *</label>
              <input className="input" placeholder="e.g. Banjara Hills Branch" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Branch Code</label>
              <input className="input" placeholder="e.g. PFD-BH (auto-generated)" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Franchise *</label>
              <select className="input" value={form.franchiseId} onChange={e => set('franchiseId', e.target.value)}>
                <option value="PFD">Prasad Food Divine</option>
                <option value="SKF">Sri Krishna Foods</option>
              </select>
            </div>
            <div>
              <label className="form-label">City *</label>
              <input className="input" placeholder="e.g. Hyderabad" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="input" placeholder="e.g. Telangana" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label className="form-label">PIN Code</label>
              <input className="input" placeholder="500034" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Address *</label>
              <textarea className="input" rows={2} placeholder="Full street address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input className="input" type="tel" placeholder="+91-40-XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input className="input" type="email" placeholder="branch@franchise.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Opening Time</label>
              <input className="input" type="time" value={form.openingTime} onChange={e => set('openingTime', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Closing Time</label>
              <input className="input" type="time" value={form.closingTime} onChange={e => set('closingTime', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2 — Financial Details */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Financial Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">GST Number</label>
              <input className="input" placeholder="15-character GST" maxLength={15} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Default Tax %</label>
              <input className="input" type="number" min={0} max={100} value={form.taxPct} onChange={e => set('taxPct', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Default Advance %</label>
              <input className="input" type="number" min={0} max={100} value={form.advancePct} onChange={e => set('advancePct', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank Name</label>
              <input className="input" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank Account Number</label>
              <input className="input" placeholder="Account number" value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank IFSC</label>
              <input className="input" placeholder="HDFC0000001" value={form.bankIfsc} onChange={e => set('bankIfsc', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Cancellation Policy</label>
              <textarea className="input" rows={2} placeholder="Describe cancellation terms..." value={form.cancellationPolicy} onChange={e => set('cancellationPolicy', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3 — Branch Manager */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Branch Manager Account</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Manager Full Name *</label>
              <input className="input" placeholder="Full name" value={form.managerName} onChange={e => set('managerName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Manager Email *</label>
              <input className="input" type="email" placeholder="manager@branch.com" value={form.managerEmail} onChange={e => set('managerEmail', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Manager Phone</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.managerPhone} onChange={e => set('managerPhone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Temporary Password *</label>
              <input className="input" type="password" placeholder="Min. 8 characters" value={form.managerPassword} onChange={e => set('managerPassword', e.target.value)} />
              <span className="form-hint">Manager will be prompted to change on first login</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/branches" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/branches')}>
            <Save size={16} /> Create Branch
          </button>
        </div>
      </form>
    </div>
  );
}
