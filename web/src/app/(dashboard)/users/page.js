'use client';
import { staffData } from '@/lib/mock-data';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Users & Staff</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{staffData.length} users across all branches</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Add User</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Branch</th><th>Email</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            {staffData.map(s => (
              <tr key={s.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-on-gold)' }}>{s.name[0]}</div>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{s.name}</span>
                </div></td>
                <td><span className="badge badge-primary">{s.role.replace(/_/g, ' ')}</span></td>
                <td>{s.branch}</td><td style={{ fontSize: 13 }}>{s.email}</td>
                <td><span className={`badge ${s.type === 'Temporary' ? 'badge-warning' : 'badge-neutral'}`}>{s.type}</span></td>
                <td><span className="badge badge-green">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
