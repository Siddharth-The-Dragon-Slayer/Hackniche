'use client';
import { motion } from 'framer-motion';
import { paymentData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Download } from 'lucide-react';

const columns = [
  { key: 'id',          label: 'ID',          render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'bookingId',   label: 'Booking',     render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'client',      label: 'Client',      render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'amount',      label: 'Amount',      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-success)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'date',        label: 'Date' },
  { key: 'mode',        label: 'Mode',        render: v => <Badge variant="neutral">{v}</Badge> },
  { key: 'reference',   label: 'Reference',   render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'collectedBy', label: 'Collected By' },
];

export default function PaymentsPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Payments</h1>
          <p>{paymentData.length} payments recorded</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Record Payment</button>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={paymentData} keyField="id" emptyMessage="No payments found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.client}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{row.bookingId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)', fontSize: 16 }}>₹{(row.amount/1000).toFixed(0)}K</div>
                  <Badge variant="neutral">{row.mode}</Badge>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12 }}>
                <span>{row.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{row.reference}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
