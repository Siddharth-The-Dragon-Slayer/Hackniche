'use client';
import { staffData } from '@/lib/mock-data';
import { Plus, UserPlus } from 'lucide-react';

export default function StaffPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Staff Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{staffData.length} team members</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm"><UserPlus size={14} /> Add Temp Staff</button>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Staff</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Role</th><th>Branch</th><th>Email</th><th>Type</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>
            {staffData.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-on-gold)' }}>{s.name[0]}</div>
                    {s.name}
                  </div>
                </td>
                <td><span className="badge badge-primary">{s.role.replace(/_/g, ' ')}</span></td>
                <td>{s.branch}</td><td style={{ fontSize: 13 }}>{s.email}</td>
                <td><span className={`badge ${s.type === 'Temporary' ? 'badge-warning' : 'badge-neutral'}`}>{s.type}</span></td>
                <td>{s.joined}</td>
                <td><span className="badge badge-green">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
