'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { inventoryData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, AlertTriangle, Package } from 'lucide-react';

const columns = [
  { key: 'name',        label: 'Item',      render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'category',    label: 'Category' },
  { key: 'unit',        label: 'Unit' },
  { key: 'currentStock', label: 'In Stock', render: (v, row) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: v < row.minStock ? 'var(--color-danger)' : 'var(--color-text-h)' }}>{v}</span> },
  { key: 'minStock',    label: 'Min Level', render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span> },
  { key: 'pricePerUnit', label: 'Price/Unit', render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{v}</span> },
  { key: 'stockValue',  label: 'Value',      render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{v.toLocaleString()}</span> },
  { key: 'status',      label: 'Status',     render: v => <Badge variant={v === 'Low Stock' ? 'red' : 'green'}>{v}</Badge> },
];

export default function InventoryPage() {
  const lowCount = inventoryData.filter(i => i.status === 'Low Stock').length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Inventory</h1>
          <p>{inventoryData.length} items · {lowCount} low stock</p>
        </div>
        <div className="page-actions">
          <Link href="/purchase-orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><Package size={14} /> Purchase Orders</Link>
          <Link href="/inventory/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Item</Link>
        </div>
      </motion.div>

      {lowCount > 0 && (
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', marginBottom: 20 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}><strong>{lowCount} items</strong> are below minimum stock level. Consider creating purchase orders.</span>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={inventoryData}
          keyField="id"
          emptyMessage="No inventory items found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{row.category} · {row.unit}</div>
                </div>
                <Badge variant={row.status === 'Low Stock' ? 'red' : 'green'}>{row.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: row.currentStock < row.minStock ? 'var(--color-danger)' : 'var(--color-text-h)', fontWeight: 600 }}>Stock: {row.currentStock}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Min: {row.minStock}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{row.stockValue.toLocaleString()}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
