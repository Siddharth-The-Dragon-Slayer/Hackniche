'use client';
import { Save } from 'lucide-react';

export default function GlobalSettingsPage() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Global Settings</h1>
          <p>Platform-wide configuration — Super Admin only</p>
        </div>
      </div>
      <div className="card form-card">
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-section-title">Platform Configuration</div>
          <div className="form-grid">
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Platform Name</label><input className="input" defaultValue="BanquetEase" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Support Email</label><input className="input" defaultValue="support@codinggurus.com" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Default Timezone</label><select className="select"><option>Asia/Kolkata (IST)</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Date Format</label><select className="select"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select></div>
          </div>
          <div className="form-section-title">API Keys</div>
          <div className="form-grid">
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Gemini API Key</label><input className="input" type="password" defaultValue="sk-xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Resend API Key</label><input className="input" type="password" defaultValue="re_xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>WATI Token</label><input className="input" type="password" defaultValue="wati_xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>OneSignal App ID</label><input className="input" defaultValue="xxxxxxxx-xxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Cloudinary Cloud Name</label><input className="input" defaultValue="your-cloud" /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary"><Save size={16} /> Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}
