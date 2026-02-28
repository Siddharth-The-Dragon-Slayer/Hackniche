'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { staffData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Plus, UserPlus } from 'lucide-react';

const TYPE_VARIANT = { Temporary: 'accent', Permanent: 'neutral' };

const columns = [
  { key: 'name', label: 'Name', render: (v) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{v[0]}</div>
      <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span>
    </div>
  )},
  { key: 'role',   label: 'Role',   render: v => <Badge variant="primary">{v.replace(/_/g, ' ')}</Badge> },
  { key: 'branch', label: 'Branch' },
  { key: 'email',  label: 'Email',  render: v => <span style={{ fontSize: 13 }}>{v}</span> },
  { key: 'type',   label: 'Type',   render: v => <Badge variant={TYPE_VARIANT[v] || 'neutral'}>{v}</Badge> },
  { key: 'joined', label: 'Joined' },
  { key: 'status', label: 'Status', render: v => <Badge variant="green">{v}</Badge> },
];

export default function StaffPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Staff Management</h1>
          <p>{staffData.length} team members</p>
        </div>
        <div className="page-actions">
          <Link href="/staff/create?type=temporary" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><UserPlus size={14} /> Add Temp</Link>
          <Link href="/staff/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Staff</Link>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={staffData}
          keyField="id"
          emptyMessage="No staff members found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{row.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.role.replace(/_/g, ' ')} · {row.branch}</div>
                </div>
                <Badge variant="green">{row.status}</Badge>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>{row.email}</span>
                <Badge variant={TYPE_VARIANT[row.type] || 'neutral'}>{row.type}</Badge>
                <span>Joined {row.joined}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
