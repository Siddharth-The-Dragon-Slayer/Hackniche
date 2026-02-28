'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { invoiceData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Download } from 'lucide-react';

const STATUSES = ['All', 'Paid', 'Partial', 'Unpaid'];
const STATUS_V = { Paid: 'green', Partial: 'accent', Unpaid: 'red' };

const columns = [
  { key: 'id',        label: 'Invoice #', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'client',    label: 'Client',    render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'eventDate', label: 'Event Date' },
  { key: 'subtotal',  label: 'Subtotal',  render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'tax',       label: 'Tax',       render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'total',     label: 'Total',     render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'paid',      label: 'Paid',      render: v => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'due',       label: 'Due',       render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: v > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'status',    label: 'Status',    render: v => <Badge variant={STATUS_V[v] || 'neutral'}>{v}</Badge> },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? invoiceData : invoiceData.filter(i => i.status === activeTab);
  const tabs = STATUSES.map(s => ({ key: s, label: s, count: s === 'All' ? invoiceData.length : invoiceData.filter(i => i.status === s).length }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Billing & Invoices</h1>
          <p>{invoiceData.length} invoices</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={filtered} keyField="id" emptyMessage="No invoices found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.client}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{row.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={STATUS_V[row.status] || 'neutral'}>{row.status}</Badge>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 4 }}>₹{(row.total/1000).toFixed(0)}K</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
                <span>{row.eventDate}</span>
                <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>Paid: ₹{(row.paid/1000).toFixed(0)}K</span>
                {row.due > 0 && <span style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>Due: ₹{(row.due/1000).toFixed(0)}K</span>}
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
