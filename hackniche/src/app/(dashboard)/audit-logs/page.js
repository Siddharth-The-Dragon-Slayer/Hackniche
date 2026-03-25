'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { auditLogs } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import SearchRow from '@/components/ui/SearchRow';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Download } from 'lucide-react';

const columns = [
  { key: 'date',   label: 'Timestamp', render: v => <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{v}</span> },
  { key: 'user',   label: 'User',      render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'role',   label: 'Role',      render: v => <Badge variant="primary">{v.replace(/_/g, ' ')}</Badge> },
  { key: 'action', label: 'Action',    render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-ghost)' }}>{v}</span> },
  { key: 'entity', label: 'Entity' },
];

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const filtered = auditLogs.filter(l => !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <p>Immutable activity trail</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <SearchRow placeholder="Search by user, action, entity..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={filtered} keyField="id" emptyMessage="No logs found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.user}</span>
                <Badge variant="primary">{row.role.replace(/_/g, ' ')}</Badge>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-ghost)', display: 'inline-block', marginBottom: 4 }}>{row.action}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{row.entity} · {row.date}</div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
