'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, TrendingDown, TrendingUp, Package } from 'lucide-react';

const mock = {
  id: 'INV-0042', name: 'Round Dinner Plate', sku: 'CRK-RDP-001', category: 'Crockery',
  unit: 'pcs', brand: 'Borosil', location: 'Shelf A-3', status: 'OK',
  totalStock: 320, minStockAlert: 50, costPerUnit: 180, branch: 'Banjara Hills',
  ledger: [
    { date: '2025-06-01', type: 'Opening', qty: 320, balance: 320, ref: '' },
    { date: '2025-06-10', type: 'Used', qty: -80, balance: 240, ref: 'EVENT-089' },
    { date: '2025-06-11', type: 'Returned', qty: 75, balance: 315, ref: 'EVENT-089' },
    { date: '2025-06-15', type: 'Used', qty: -45, balance: 270, ref: 'EVENT-092' },
    { date: '2025-06-20', type: 'Purchase', qty: 100, balance: 370, ref: 'PO-00021' },
  ],
};

const TYPE_STYLE = { Used: { bg: '#fee2e2', color: '#991b1b' }, Returned: { bg: '#dcfce7', color: '#15803d' }, Purchase: { bg: '#dbeafe', color: '#1d4ed8' }, Opening: { bg: '#f0f4ff', color: '#3730a3' }, Adjustment: { bg: '#fef9c3', color: '#854d0e' } };

export default function InventoryDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Inventory
          </Link>
          <h1>{mock.name}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {mock.category} &bull; SKU: {mock.sku} &bull; {mock.branch}
            <span style={{ background: mock.totalStock > mock.minStockAlert ? '#dcfce7' : '#fee2e2', color: mock.totalStock > mock.minStockAlert ? '#15803d' : '#991b1b', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {mock.totalStock > mock.minStockAlert ? 'In Stock' : 'Low Stock'}
            </span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost">Adjust Stock</button>
          <Link href={`/inventory/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Current Stock', val: `${mock.totalStock} ${mock.unit}` },
          { label: 'Min Alert', val: `${mock.minStockAlert} ${mock.unit}` },
          { label: 'Cost / Unit', val: `₹${mock.costPerUnit}` },
          { label: 'Total Value', val: `₹${(mock.totalStock * mock.costPerUnit).toLocaleString('en-IN')}` },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {['Overview', 'Stock Ledger'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Item Details</div>
          <div className="info-grid">
            <div className="info-item"><span className="form-label">Brand</span><span>{mock.brand}</span></div>
            <div className="info-item"><span className="form-label">Unit</span><span>{mock.unit}</span></div>
            <div className="info-item"><span className="form-label">Location</span><span>{mock.location}</span></div>
            <div className="info-item"><span className="form-label">Min Stock Alert</span><span>{mock.minStockAlert} {mock.unit}</span></div>
          </div>
        </div>
      )}

      {tab === 'Stock Ledger' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Stock Movement History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Balance</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {mock.ledger.map((row, i) => {
                const s = TYPE_STYLE[row.type] || {};
                return (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{row.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{row.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: row.qty < 0 ? '#dc2626' : '#16a34a' }}>
                      {row.qty > 0 ? `+${row.qty}` : row.qty} {mock.unit}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{row.balance} {mock.unit}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{row.ref || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
