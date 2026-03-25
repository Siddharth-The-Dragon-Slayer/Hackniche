'use client';
import { motion } from 'framer-motion';
import { staffData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const ROLE_V = { platform_admin: 'red', franchise_owner: 'accent', branch_manager: 'primary', staff: 'neutral' };

const columns = [
  { key: 'name',   label: 'Name',   render: (v) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{(v||'?')[0]}</div>
      <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span>
    </div>
  )},
  { key: 'email',  label: 'Email',  render: v => <span style={{ fontSize: 13 }}>{v}</span> },
  { key: 'role',   label: 'Role',   render: v => <Badge variant={ROLE_V[v] || 'neutral'}>{v?.replace(/_/g, ' ')}</Badge> },
  { key: 'branch', label: 'Branch' },
  { key: 'status', label: 'Status', render: v => <Badge variant={v === 'Active' ? 'green' : 'neutral'}>{v}</Badge> },
];

export default function UsersPage() {
  // Using staffData as user proxy since no userData export exists
  const data = staffData || [];
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Users</h1>
          <p>{data.length} registered users</p>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={data} keyField="id" emptyMessage="No users found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{(row.name||'?')[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.email}</div>
                </div>
                <Badge variant={row.status === 'Active' ? 'green' : 'neutral'}>{row.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge variant={ROLE_V[row.role] || 'neutral'}>{row.role?.replace(/_/g, ' ')}</Badge>
                {row.branch && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.branch}</span>}
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
