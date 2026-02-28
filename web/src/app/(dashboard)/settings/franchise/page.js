'use client';
import { Save } from 'lucide-react';

export default function FranchiseSettingsPage() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Franchise Settings</h1>
          <p>Prasad Food Divine — Franchise Configuration</p>
        </div>
      </div>
      <div className="card form-card">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-section-title">Franchise Information</div>
          <div className="form-grid">
            <div><label className="form-label">Franchise Name</label><input className="input" defaultValue="Prasad Food Divine" /></div>
            <div><label className="form-label">Code</label><input className="input" defaultValue="PFD" /></div>
            <div><label className="form-label">Admin Email</label><input className="input" defaultValue="prasad@pfd.com" /></div>
            <div><label className="form-label">Contact Phone</label><input className="input" defaultValue="+91-9876543200" /></div>
            <div><label className="form-label">GST Number</label><input className="input" placeholder="15-char GST" /></div>
            <div><label className="form-label">Region / City</label><input className="input" defaultValue="Hyderabad" /></div>
          </div>
          <div className="form-section-title">Branding</div>
          <div className="form-grid">
            <div><label className="form-label">Logo URL</label><input className="input" placeholder="https://res.cloudinary.com/..." /></div>
            <div><label className="form-label">Primary Color</label><input className="input" defaultValue="#7B1C1C" /></div>
            <div><label className="form-label">Logo Dark Variant URL</label><input className="input" placeholder="Optional dark mode logo" /></div>
            <div><label className="form-label">Favicon URL</label><input className="input" placeholder="https://res.cloudinary.com/..." /></div>
          </div>
          <div className="form-section-title">Notifications</div>
          <div className="form-grid">
            <div><label className="form-label">Resend From Email</label><input className="input" placeholder="noreply@pfd.com" /></div>
            <div><label className="form-label">WATI Registered Phone</label><input className="input" placeholder="+91-9000000000" /></div>
          </div>
          <div className="form-section-title">Default Settings</div>
          <div className="form-grid">
            <div><label className="form-label">Default Tax %</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label className="form-label">Default Advance %</label><input className="input" type="number" defaultValue="30" /></div>
            <div><label className="form-label">Currency</label><input className="input" defaultValue="INR (₹)" disabled /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary"><Save size={16} /> Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
