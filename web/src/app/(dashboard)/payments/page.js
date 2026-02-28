'use client';
import { paymentData } from '@/lib/mock-data';
import { Plus, Download } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Payments</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{paymentData.length} payments recorded</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Record Payment</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Booking</th><th>Client</th><th>Amount</th><th>Date</th><th>Mode</th><th>Reference</th><th>Collected By</th></tr></thead>
          <tbody>
            {paymentData.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.id}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.bookingId}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{p.client}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-success)' }}>₹{(p.amount/1000).toFixed(0)}K</td>
                <td>{p.date}</td>
                <td><span className="badge badge-neutral">{p.mode}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.reference}</td>
                <td>{p.collectedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
