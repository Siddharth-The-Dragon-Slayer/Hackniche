'use client';
import { branchData } from '@/lib/mock-data';
import { Plus } from 'lucide-react';

export default function BranchesPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Branches</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{branchData.length} branches</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Branch</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Branch</th><th>Franchise</th><th>Manager</th><th>Halls</th><th>Bookings (MTD)</th><th>Revenue</th><th>Occupancy</th><th>Status</th></tr></thead>
          <tbody>
            {branchData.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{b.name}</td>
                <td>{b.franchise}</td><td>{b.manager}</td><td>{b.halls}</td><td>{b.bookingsMTD}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(b.revenue/100000).toFixed(1)}L</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-primary-ghost)', maxWidth: 60 }}>
                    <div style={{ width: `${b.occupancy}%`, height: '100%', background: 'var(--gradient-bar)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{b.occupancy}%</span>
                </div></td>
                <td><span className="badge badge-green">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
