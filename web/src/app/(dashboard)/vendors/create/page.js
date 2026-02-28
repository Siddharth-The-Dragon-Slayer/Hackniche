'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const CATEGORIES = ['Catering', 'Decoration', 'Photography', 'Music & DJ', 'Lighting', 'Flowers', 'Security', 'Transport', 'Tenting', 'Other'];

export default function CreateVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', category: '', contactName: '', phone: '', email: '', website: '',
    address: '', city: '', gstNumber: '', panNumber: '', bankAccount: '', bankIfsc: '', bankName: '',
    rateType: 'Fixed', baseRate: '', notes: '', branchIds: [],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/vendors" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Vendors
          </Link>
          <h1>Add New Vendor</h1>
          <p>Register an external vendor or service provider</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Vendor Information</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Vendor / Company Name *</label>
              <input className="input" placeholder="e.g. Krishna Caterers" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Primary Contact Name</label>
              <input className="input" placeholder="Contact person" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone *</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="vendor@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input className="input" placeholder="https://vendor.com" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
            <div>
              <label className="form-label">City</label>
              <input className="input" placeholder="Hyderabad" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Address</label>
              <textarea className="input" rows={2} placeholder="Full address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Financial & Legal Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">GST Number</label>
              <input className="input" placeholder="15-character GST" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">PAN Number</label>
              <input className="input" placeholder="ABCDE1234F" value={form.panNumber} onChange={e => set('panNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank Name</label>
              <input className="input" placeholder="HDFC Bank" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank Account</label>
              <input className="input" value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Bank IFSC</label>
              <input className="input" placeholder="HDFC0000001" value={form.bankIfsc} onChange={e => set('bankIfsc', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Rate Type</label>
              <select className="input" value={form.rateType} onChange={e => set('rateType', e.target.value)}>
                <option>Fixed</option>
                <option>Per Person</option>
                <option>Per Hour</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="form-label">Base Rate (₹)</label>
              <input className="input" type="number" placeholder="0.00" value={form.baseRate} onChange={e => set('baseRate', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Additional Notes</div>
          <textarea className="input" rows={4} placeholder="Contract terms, special notes, preferred working conditions..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
        </div>

        <div className="form-actions">
          <Link href="/vendors" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/vendors')}>
            <Save size={16} /> Save Vendor
          </button>
        </div>
      </form>
    </div>
  );
}
