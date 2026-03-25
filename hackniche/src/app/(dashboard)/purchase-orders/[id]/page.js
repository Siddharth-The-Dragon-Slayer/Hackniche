'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, CheckCircle, FileText, Download } from 'lucide-react';

const mock = {
  id: 'PO-00021', vendor: 'Royal Supplies Co.', branch: 'Banjara Hills', status: 'Sent',
  createdAt: '2025-06-18', expectedDelivery: '2025-06-25', paymentTerms: 'Net 30',
  items: [
    { name: 'Round Dinner Plate', sku: 'CRK-RDP-001', unit: 'pcs', qty: 100, unitPrice: 180, total: 18000 },
    { name: 'Stainless Steel Fork', sku: 'CTL-SSF-002', unit: 'pcs', qty: 200, unitPrice: 45, total: 9000 },
    { name: 'Linen Napkins', sku: 'LIN-NPN-003', unit: 'dozens', qty: 20, unitPrice: 600, total: 12000 },
  ],
};
const subtotal = mock.items.reduce((s, i) => s + i.total, 0);
const tax = subtotal * 0.18;
const total = subtotal + tax;

const STATUS_COLORS = { Draft: { bg: '#f3f4f6', color: '#374151' }, Sent: { bg: '#dbeafe', color: '#1d4ed8' }, Received: { bg: '#dcfce7', color: '#15803d' }, Cancelled: { bg: '#fee2e2', color: '#991b1b' } };

export default function PurchaseOrderDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const sc = STATUS_COLORS[mock.status] || {};

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/purchase-orders" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Purchase Orders
          </Link>
          <h1>Purchase Order {mock.id}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {mock.vendor} &bull; {mock.branch}
            <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{mock.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost"><Download size={15} /> Download PDF</button>
          {mock.status === 'Sent' && <button className="btn btn-primary"><CheckCircle size={15} /> Mark Received</button>}
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Line Items', val: mock.items.length },
          { label: 'Expected Delivery', val: mock.expectedDelivery },
          { label: 'Payment Terms', val: mock.paymentTerms },
          { label: 'Total', val: `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {['Overview', 'Items'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Order Details</div>
          <div className="info-grid">
            <div className="info-item"><span className="form-label">Vendor</span><span>{mock.vendor}</span></div>
            <div className="info-item"><span className="form-label">Branch</span><span>{mock.branch}</span></div>
            <div className="info-item"><span className="form-label">Created</span><span>{mock.createdAt}</span></div>
            <div className="info-item"><span className="form-label">Expected Delivery</span><span>{mock.expectedDelivery}</span></div>
            <div className="info-item"><span className="form-label">Payment Terms</span><span>{mock.paymentTerms}</span></div>
          </div>
        </div>
      )}

      {tab === 'Items' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Item</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>SKU</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {mock.items.map((it, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{it.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{it.sku}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{it.qty} {it.unit}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{it.unitPrice.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>₹{it.total.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--color-border)', fontSize: 13 }}>
                <td colSpan={4} style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Subtotal</td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ fontSize: 13 }}>
                <td colSpan={4} style={{ padding: '6px 16px', textAlign: 'right', color: 'var(--color-text-muted)' }}>GST (18%)</td>
                <td style={{ padding: '6px 16px', textAlign: 'right' }}>₹{Math.round(tax).toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ fontWeight: 700, fontSize: 15 }}>
                <td colSpan={4} style={{ padding: '12px 16px', textAlign: 'right' }}>Total</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{Math.round(total).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
