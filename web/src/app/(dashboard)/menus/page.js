'use client';
import { menuData } from '@/lib/mock-data';
import { Plus } from 'lucide-react';

export default function MenusPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Menus</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{menuData.length} menu packages</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Create Menu</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {menuData.map(m => (
          <div key={m.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{m.name}</h3>
              <span className={`badge badge-green`}>{m.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Type</div><span className="badge badge-primary">{m.type}</span></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Price/Plate</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>₹{m.pricePerPlate}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Min Plates</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{m.minPlates}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Applicable</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{m.applicableTo}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
