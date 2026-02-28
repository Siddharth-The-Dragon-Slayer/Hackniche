'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { branchData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus } from 'lucide-react';

const columns = [
  { key: 'name',        label: 'Branch',   render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'franchise',   label: 'Franchise' },
  { key: 'manager',     label: 'Manager' },
  { key: 'halls',       label: 'Halls' },
  { key: 'bookingsMTD', label: 'Bookings (MTD)' },
  { key: 'revenue',     label: 'Revenue',  render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(v/100000).toFixed(1)}L</span> },
  { key: 'occupancy',   label: 'Occupancy', render: v => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-primary-ghost)', maxWidth: 60 }}>
        <div style={{ width: `${v}%`, height: '100%', background: 'var(--gradient-bar)', borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{v}%</span>
    </div>
  )},
  { key: 'status', label: 'Status', render: v => <Badge variant="green">{v}</Badge> },
];

export default function BranchesPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Branches</h1>
          <p>{branchData.length} branches</p>
        </div>
        <div className="page-actions">
          <Link href="/branches/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Branch</Link>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={branchData} keyField="id" emptyMessage="No branches found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.franchise} · {row.manager}</div>
                </div>
                <Badge variant="green">{row.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                <span>{row.halls} halls</span>
                <span>{row.bookingsMTD} bookings MTD</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(row.revenue/100000).toFixed(1)}L</span>
                <span>{row.occupancy}% occupancy</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
