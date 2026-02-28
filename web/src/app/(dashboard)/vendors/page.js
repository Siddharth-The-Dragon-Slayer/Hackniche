'use client';
import { vendorData } from '@/lib/mock-data';
import { Plus, Star } from 'lucide-react';

export default function VendorsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Vendors</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{vendorData.length} registered vendors</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Vendor</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {vendorData.map(v => (
          <div key={v.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{v.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: 4 }}>{v.type}</span>
              </div>
              <span className={`badge ${v.status === 'Active' ? 'badge-green' : 'badge-neutral'}`}>{v.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Contact</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{v.contact}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Phone</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{v.phone}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rate/Event</div><div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--color-text-h)' }}>{v.rate > 0 ? `₹${v.rate.toLocaleString()}` : 'Variable'}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rating</div><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="var(--color-star)" color="var(--color-star)" /><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>{v.rating}</span></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
