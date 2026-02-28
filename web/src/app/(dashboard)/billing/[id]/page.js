'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Send, CreditCard, CheckCircle } from 'lucide-react';

const mock = {
  id: 'INV-00089', bookingId: 'BK-20250089', clientName: 'Suresh & Priya Menon',
  clientEmail: 'suresh@gmail.com', clientPhone: '+91-9876501234',
  issueDate: '2025-06-20', dueDate: '2025-10-01', status: 'Partially Paid',
  branch: 'Banjara Hills Branch', gstNumber: '36ABCDE9999F1Z5',
  lineItems: [
    { description: 'Hall Rental — Grand Ballroom (10:00–23:00)', qty: 1, rate: 450000, total: 450000 },
    { description: 'Royal Floral Wedding Decor Package', qty: 1, rate: 85000, total: 85000 },
    { description: 'Grand South Indian Feast (450 pax × ₹400)', qty: 450, rate: 400, total: 180000 },
    { description: 'Sound System Rental', qty: 1, rate: 25000, total: 25000 },
  ],
  discount: 15000, taxPct: 10,
  payments: [
    { date: '2025-06-12', amount: 100000, mode: 'Bank Transfer', ref: 'TXN78900' },
  ],
};

const subtotal = mock.lineItems.reduce((s, i) => s + i.total, 0);
const afterDiscount = subtotal - mock.discount;
const tax = Math.round(afterDiscount * mock.taxPct / 100);
const total = afterDiscount + tax;
const paid = mock.payments.reduce((s, p) => s + p.amount, 0);
const balance = total - paid;

const STATUS_COLORS = { Paid: { bg: '#dcfce7', color: '#15803d' }, 'Partially Paid': { bg: '#fef9c3', color: '#854d0e' }, Unpaid: { bg: '#fee2e2', color: '#991b1b' } };

export default function BillingDetailPage({ params }) {
  const sc = STATUS_COLORS[mock.status] || {};

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/billing" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Billing
          </Link>
          <h1>Invoice {mock.id}</h1>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {mock.clientName} &bull; Due: {mock.dueDate}
            <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{mock.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost"><Download size={15} /> Download PDF</button>
          <button className="btn btn-ghost"><Send size={15} /> Send to Client</button>
          {balance > 0 && <button className="btn btn-primary"><CreditCard size={15} /> Record Payment</button>}
        </div>
      </div>

      {/* Finance KPIs */}
      <div className="kpi-row" style={{ marginBottom: 28 }}>
        {[
          { label: 'Invoice Total', val: `₹${total.toLocaleString('en-IN')}` },
          { label: 'Amount Paid', val: `₹${paid.toLocaleString('en-IN')}`, good: true },
          { label: 'Balance Due', val: `₹${balance.toLocaleString('en-IN')}`, danger: balance > 0 },
          { label: 'Due Date', val: mock.dueDate },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.danger ? '#dc2626' : k.good ? '#16a34a' : 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Invoice Document */}
      <div className="card" style={{ padding: 32, maxWidth: 860 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>Prasad Food Divine</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{mock.branch}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>GST: {mock.gstNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>INVOICE</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>#{mock.id}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Date: {mock.issueDate}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Due: {mock.dueDate}</div>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderRadius: 10, marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{mock.clientName}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{mock.clientEmail}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{mock.clientPhone}</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Booking: <Link href={`/bookings/${mock.bookingId}`} style={{ color: 'var(--color-primary)' }}>{mock.bookingId}</Link></div>
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: 'var(--color-primary)', color: '#fff', fontSize: 12 }}>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Qty</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Rate</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {mock.lineItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
                <td style={{ padding: '12px 14px', color: 'var(--color-text-body)' }}>{item.description}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{item.qty}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--color-text-muted)' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>₹{item.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontSize: 13 }}><td colSpan={3} style={{ padding: '8px 14px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Subtotal</td><td style={{ padding: '8px 14px', textAlign: 'right' }}>₹{subtotal.toLocaleString('en-IN')}</td></tr>
            <tr style={{ fontSize: 13 }}><td colSpan={3} style={{ padding: '6px 14px', textAlign: 'right', color: '#16a34a' }}>Discount</td><td style={{ padding: '6px 14px', textAlign: 'right', color: '#16a34a' }}>– ₹{mock.discount.toLocaleString('en-IN')}</td></tr>
            <tr style={{ fontSize: 13 }}><td colSpan={3} style={{ padding: '6px 14px', textAlign: 'right', color: 'var(--color-text-muted)' }}>GST ({mock.taxPct}%)</td><td style={{ padding: '6px 14px', textAlign: 'right' }}>₹{tax.toLocaleString('en-IN')}</td></tr>
            <tr style={{ fontWeight: 800, fontSize: 16, borderTop: '2px solid var(--color-border)' }}><td colSpan={3} style={{ padding: '14px 14px', textAlign: 'right' }}>Total Due</td><td style={{ padding: '14px 14px', textAlign: 'right', color: 'var(--color-primary)' }}>₹{total.toLocaleString('en-IN')}</td></tr>
          </tfoot>
        </table>

        {/* Payment History */}
        <div>
          <div className="form-section-title">Payment History</div>
          {mock.payments.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle size={16} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{p.mode} — {p.ref}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.date}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#16a34a' }}>₹{p.amount.toLocaleString('en-IN')}</div>
            </div>
          ))}
          {balance > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15, fontWeight: 700, color: '#dc2626', borderTop: '2px solid var(--color-border)', marginTop: 4 }}>
              <span>Balance Due</span>
              <span>₹{balance.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
