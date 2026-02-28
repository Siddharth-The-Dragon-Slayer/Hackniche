'use client';
import { Save } from 'lucide-react';

export default function GlobalSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Global Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Platform-wide configuration — Super Admin only</p>
      </div>
      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Platform Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Platform Name</label><input className="input" defaultValue="BanquetOS" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Support Email</label><input className="input" defaultValue="support@codinggurus.com" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Default Timezone</label><select className="select"><option>Asia/Kolkata (IST)</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Date Format</label><select className="select"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select></div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>API Keys</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Gemini API Key</label><input className="input" type="password" defaultValue="sk-xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Resend API Key</label><input className="input" type="password" defaultValue="re_xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>WATI Token</label><input className="input" type="password" defaultValue="wati_xxxxxxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>OneSignal App ID</label><input className="input" defaultValue="xxxxxxxx-xxxx" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Cloudinary Cloud Name</label><input className="input" defaultValue="your-cloud" /></div>
          </div>
          <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> Save Settings</button>
        </form>
      </div>
    </div>
  );
}
