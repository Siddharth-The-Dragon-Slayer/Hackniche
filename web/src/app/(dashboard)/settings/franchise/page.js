'use client';
import { Save } from 'lucide-react';

export default function FranchiseSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Franchise Settings</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Prasad Food Divine — Franchise Configuration</p>
      </div>
      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Franchise Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Franchise Name</label><input className="input" defaultValue="Prasad Food Divine" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Code</label><input className="input" defaultValue="PFD" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Admin Email</label><input className="input" defaultValue="prasad@pfd.com" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Contact Phone</label><input className="input" defaultValue="+91-9876543200" /></div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Branding</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Logo URL</label><input className="input" placeholder="https://res.cloudinary.com/..." /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Primary Color</label><input className="input" defaultValue="#7B1C1C" /></div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Default Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Default Tax %</label><input className="input" type="number" defaultValue="10" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Currency</label><input className="input" defaultValue="INR (₹)" disabled /></div>
          </div>
          <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> Save Settings</button>
        </form>
      </div>
    </div>
  );
}
