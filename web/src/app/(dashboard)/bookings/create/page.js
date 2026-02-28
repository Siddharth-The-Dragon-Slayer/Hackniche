'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateBookingPage() {
  return (
    <div>
      <Link href="/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24, textDecoration: 'none' }}><ArrowLeft size={16} /> Back to Bookings</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 24 }}>Create Booking</h1>

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Client & Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Link to Lead</label>
              <select className="select"><option>Select lead...</option><option>Rajesh Kumar (L001)</option><option>Priya Sharma (L002)</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Client Name *</label><input className="input" placeholder="Rajesh Kumar" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Phone *</label><input className="input" placeholder="+91-9876543210" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Event Type *</label>
              <select className="select"><option>Wedding</option><option>Reception</option><option>Engagement</option><option>Birthday</option><option>Corporate</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Event Date *</label><input className="input" type="date" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Time Slot</label>
              <select className="select"><option>Full Day</option><option>Morning</option><option>Evening</option></select></div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Hall & Guests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Hall *</label>
              <select className="select"><option>Grand Ballroom</option><option>Open Air Lawn</option><option>Royal Hall</option><option>Rooftop Terrace</option></select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Expected Guests</label><input className="input" type="number" placeholder="500" /></div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Base Price</label><input className="input" type="number" placeholder="150000" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Catering Total</label><input className="input" type="number" placeholder="425000" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Decor Total</label><input className="input" type="number" placeholder="53000" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Discount</label><input className="input" type="number" placeholder="0" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Tax %</label><input className="input" type="number" placeholder="10" /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Advance Paid</label><input className="input" type="number" placeholder="150000" /></div>
          </div>

          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>Special Requirements</label>
            <textarea className="input" rows={4} placeholder="Dietary restrictions, setup preferences, etc." style={{ resize: 'vertical' }} /></div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-primary">Create Booking</button>
            <Link href="/bookings" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
