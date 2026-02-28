'use client';
import { auditLogs } from '@/lib/mock-data';
import { Search, Download } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Audit Logs</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Immutable activity trail</p></div>
        <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search logs by user, action, entity..." style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{log.date}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{log.user}</td>
                <td><span className="badge badge-primary">{log.role.replace(/_/g, ' ')}</span></td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-ghost)' }}>{log.action}</span></td>
                <td>{log.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
