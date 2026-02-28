'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { purchaseOrders } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus } from 'lucide-react';

const STATUS_V = { Delivered: 'green', Pending: 'accent', Ordered: 'primary', Cancelled: 'red' };

const columns = [
  { key: 'id',       label: 'PO #',      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'vendor',   label: 'Vendor',    render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'items',    label: 'Items',     render: v => Array.isArray(v) ? v.length + ' items' : v },
  { key: 'total',    label: 'Total',     render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'orderDate',label: 'Ordered' },
  { key: 'expectedDelivery', label: 'Expected' },
  { key: 'status',   label: 'Status',    render: v => <Badge variant={STATUS_V[v] || 'neutral'}>{v}</Badge> },
];

export default function PurchaseOrdersPage() {
  const data = purchaseOrders || [];
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Purchase Orders</h1>
          <p>{data.length} purchase orders</p>
        </div>
        <div className="page-actions">
          <Link href="/purchase-orders/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New PO</Link>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={data} keyField="id" emptyMessage="No purchase orders found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.vendor}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={STATUS_V[row.status] || 'neutral'}>{row.status}</Badge>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 4 }}>₹{(row.total/1000).toFixed(0)}K</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12 }}>
                <span>Ordered: {row.orderDate}</span>
                <span>Expected: {row.expectedDelivery}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
