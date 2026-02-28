'use client';
import Link from 'next/link';
import { franchiseData } from '@/lib/mock-data';
import { Plus } from 'lucide-react';

export default function FranchisesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Franchises</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{franchiseData.length} franchises</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Franchise</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {franchiseData.map(f => (
          <div key={f.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--color-text-on-gold)' }}>{f.code[0]}</div>
              <span className="badge badge-green">{f.status}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>{f.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Code:</span> {f.code}</div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>City:</span> {f.city}</div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Admin:</span> {f.admin}</div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Branches:</span> {f.branches}</div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--color-text-muted)' }}>Revenue:</span> <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(f.revenue/100000).toFixed(1)}L</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
