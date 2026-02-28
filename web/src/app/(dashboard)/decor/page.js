'use client';
import { decorData } from '@/lib/mock-data';
import { Plus, Palette } from 'lucide-react';

export default function DecorPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Decor Packages</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{decorData.length} packages</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Create Package</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {decorData.map(d => (
          <div key={d.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{d.name}</h3>
                <span className="badge badge-accent" style={{ marginTop: 6 }}>{d.theme}</span>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={20} style={{ color: 'var(--color-accent)' }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>₹{d.price.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {d.suitableFor.map(s => <span key={s} className="badge badge-neutral">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
