'use client';
import { Save } from 'lucide-react';

export default function BranchSettingsPage() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Branch Settings</h1>
          <p>Banjara Hills Branch — Configuration</p>
        </div>
      </div>

      <div className="card form-card">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-section-title">Branch Information</div>
          <div className="form-grid">
            <div><label className="form-label">Branch Name</label><input className="input" defaultValue="Banjara Hills Branch" /></div>
            <div><label className="form-label">Branch Code</label><input className="input" defaultValue="PFD-BH" /></div>
            <div><label className="form-label">Address</label><input className="input" defaultValue="Road No. 12, Banjara Hills" /></div>
            <div><label className="form-label">City</label><input className="input" defaultValue="Hyderabad" /></div>
            <div><label className="form-label">Contact Phone</label><input className="input" defaultValue="+91-40-12345678" /></div>
            <div><label className="form-label">Contact Email</label><input className="input" defaultValue="bh@prasadfooddivine.com" /></div>
            <div><label className="form-label">Opening Time</label><input className="input" type="time" defaultValue="08:00" /></div>
            <div><label className="form-label">Closing Time</label><input className="input" type="time" defaultValue="22:00" /></div>
          </div>

          <div className="form-section-title">Billing Details</div>
          <div className="form-grid">
            <div><label className="form-label">GST Number</label><input className="input" defaultValue="36ABCDE9999F1Z5" /></div>
            <div><label className="form-label">Default Tax %</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label className="form-label">Default Advance %</label><input className="input" type="number" defaultValue="30" /></div>
            <div><label className="form-label">Bank Account</label><input className="input" defaultValue="XXXXXXXX" /></div>
            <div><label className="form-label">Bank IFSC</label><input className="input" defaultValue="HDFC0000001" /></div>
            <div><label className="form-label">Bank Name</label><input className="input" defaultValue="HDFC Bank" /></div>
          </div>

          <div className="form-section-title">Notification Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['New lead notifications', 'Booking confirmations', 'Payment receipts', 'Follow-up reminders', 'Low stock alerts'].map((n, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--color-text-body)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent)' }} /> {n}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-primary"><Save size={16} /> Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
