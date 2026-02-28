'use client';
import { purchaseOrders } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PurchaseOrdersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Purchase Orders</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{purchaseOrders.length} orders</p></div>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Create PO</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>PO #</th><th>Vendor</th><th>Items</th><th>Amount</th><th>Expected</th><th>Approved By</th><th>Status</th></tr></thead>
          <tbody>
            {purchaseOrders.map(po => (
              <tr key={po.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{po.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{po.vendor}</td>
                <td>{po.items}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{po.totalAmount.toLocaleString()}</td>
                <td>{po.expectedDelivery}</td>
                <td>{po.approvedBy}</td>
                <td><span className={`badge ${po.status === 'Delivered' ? 'badge-green' : po.status === 'Sent' ? 'badge-accent' : 'badge-neutral'}`}>{po.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
