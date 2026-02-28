'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateLeadPage() {
  return (
    <div>
      <Link href="/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Leads</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 24 }}>Create New Lead</h1>

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Client Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Full Name *</label><input className="input" placeholder="Rajesh Kumar" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Phone *</label><input className="input" placeholder="+91-9876543210" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Email</label><input className="input" type="email" placeholder="rajesh@email.com" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Alternative Phone</label><input className="input" placeholder="+91-9876543211" /></div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Event Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Event Type *</label>
              <select className="select"><option>Wedding</option><option>Reception</option><option>Engagement</option><option>Birthday</option><option>Corporate</option><option>Sangeet</option><option>Anniversary</option><option>Other</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Preferred Date</label><input className="input" type="date" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Expected Guests</label><input className="input" type="number" placeholder="500" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Source *</label>
              <select className="select"><option>Walk-in</option><option>Phone Call</option><option>Instagram</option><option>Facebook</option><option>Google Ads</option><option>Referral (Client)</option><option>Referral (Vendor)</option><option>WeddingWire</option><option>JustDial</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Budget Range Min</label><input className="input" type="number" placeholder="300000" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Budget Range Max</label><input className="input" type="number" placeholder="600000" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Preferred Hall</label>
              <select className="select"><option>No preference</option><option>Grand Ballroom</option><option>Open Air Lawn</option><option>Royal Hall</option><option>Rooftop Terrace</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Assign To *</label>
              <select className="select"><option>Kavya Singh</option><option>Anil Verma</option></select></div>
          </div>

          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Notes</label>
            <textarea className="input" rows={4} placeholder="Any specific requirements or notes..." style={{ resize: 'vertical' }} /></div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-primary">Create Lead</button>
            <Link href="/leads" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
