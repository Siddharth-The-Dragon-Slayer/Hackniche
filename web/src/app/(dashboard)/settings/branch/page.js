'use client';
import { Save } from 'lucide-react';

export default function BranchSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Branch Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Banjara Hills Branch — Configuration</p>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Branch Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Branch Name</label><input className="input" defaultValue="Banjara Hills Branch" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Branch Code</label><input className="input" defaultValue="PFD-BH" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Address</label><input className="input" defaultValue="Road No. 12, Banjara Hills" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>City</label><input className="input" defaultValue="Hyderabad" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Contact Phone</label><input className="input" defaultValue="+91-40-12345678" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Contact Email</label><input className="input" defaultValue="bh@prasadfooddivine.com" /></div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Billing Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>GST Number</label><input className="input" defaultValue="36ABCDE9999F1Z5" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Default Tax %</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Bank Account</label><input className="input" defaultValue="XXXXXXXX" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Bank IFSC</label><input className="input" defaultValue="HDFC0000001" /></div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['New lead notifications', 'Booking confirmations', 'Payment receipts', 'Follow-up reminders', 'Low stock alerts'].map((n, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--color-text-body)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent)' }} /> {n}
              </label>
            ))}
          </div>

          <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> Save Settings</button>
        </form>
      </div>
    </div>
  );
}
