'use client';
import { invoiceData } from '@/lib/mock-data';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';

const statuses = ['All', 'Paid', 'Partial', 'Unpaid'];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? invoiceData : invoiceData.filter(i => i.status === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Billing & Invoices</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>{invoiceData.length} invoices</p></div>
        <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
      </div>

      <div className="tab-list">
        {statuses.map(s => <div key={s} className={`tab-item ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)}>{s}</div>)}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th>Event Date</th><th>Subtotal</th><th>Tax</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{inv.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{inv.client}</td>
                <td>{inv.eventDate}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(inv.subtotal/1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(inv.tax/1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(inv.total/1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>₹{(inv.paid/1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: inv.due > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{(inv.due/1000).toFixed(0)}K</td>
                <td><span className={`badge ${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Partial' ? 'badge-warning' : 'badge-red'}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
