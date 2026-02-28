'use client';
import { pricingRules } from '@/lib/mock-data';
import { Plus, Calendar } from 'lucide-react';

export default function DynamicPricingPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Dynamic Pricing</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{pricingRules.length} active rules</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Rule</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 32 }}>
        {pricingRules.map(r => (
          <div key={r.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>{r.name}</h3>
              <span className="badge badge-green">{r.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Type</div><span className="badge badge-accent">{r.type}</span></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Multiplier</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: r.multiplier > 1 ? 'var(--color-danger)' : 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                  {r.multiplier > 1 ? `+${((r.multiplier - 1) * 100).toFixed(0)}%` : `-${((1 - r.multiplier) * 100).toFixed(0)}%`}
                </div>
              </div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Period</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{r.startDate ? `${r.startDate} — ${r.endDate}` : 'Recurring'}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Halls</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{r.halls}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
