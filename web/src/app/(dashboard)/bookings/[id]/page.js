'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Download, CreditCard, CheckSquare, Image, Calendar, Users, DollarSign, FileText, CheckCircle, Circle } from 'lucide-react';

const TABS = ['Overview', 'Payments', 'Invoice', 'Event Checklist', 'Decor'];

const mock = {
  id: 'BK-20250089', clientName: 'Suresh & Priya Menon', phone: '+91-9876501234', email: 'suresh@gmail.com',
  eventType: 'Wedding', eventDate: '2025-11-22', guestCount: 450, hall: 'Grand Ballroom',
  branch: 'Banjara Hills Branch', status: 'Confirmed', assignedTo: 'Ramesh Kumar',
  startTime: '10:00', endTime: '23:00',
  packageName: 'Premium Banquet', menuName: 'South Indian Feast',
  baseAmount: 450000, decorAmount: 85000, menuAmount: 180000, discount: 15000,
  taxPct: 10, advancePaid: 100000,
  payments: [
    { id: 'PAY-001', date: '2025-06-12', amount: 100000, mode: 'Bank Transfer', ref: 'TXN78900', status: 'Confirmed' },
    { id: 'PAY-002', date: '2025-10-01', amount: 300000, mode: 'Cheque', ref: 'CHQ00123', status: 'Pending' },
  ],
  checklist: [
    { item: 'Venue booking confirmed', done: true },
    { item: 'Advance payment received', done: true },
    { item: 'Menu finalised with client', done: true },
    { item: 'Decor design approved', done: false },
    { item: 'Catering team briefed', done: false },
    { item: 'Sound & lighting arranged', done: false },
    { item: 'Florist confirmed', done: false },
    { item: 'Final headcount confirmed', done: false },
  ],
};

const subtotal = mock.baseAmount + mock.decorAmount + mock.menuAmount - mock.discount;
const tax = Math.round(subtotal * mock.taxPct / 100);
const total = subtotal + tax;
const balance = total - mock.advancePaid;

const STATUS_COLORS = { Confirmed: { bg: '#dcfce7', color: '#15803d' }, Pending: { bg: '#fef9c3', color: '#854d0e' }, Cancelled: { bg: '#fee2e2', color: '#991b1b' }, Completed: { bg: '#dbeafe', color: '#1d4ed8' } };

export default function BookingDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const [checklist, setChecklist] = useState(mock.checklist);
  const b = mock;
  const sc = STATUS_COLORS[b.status] || {};

  const toggleCheck = (i) => setChecklist(prev => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Bookings
          </Link>
          <h1>{b.clientName}</h1>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {b.id} &bull; {b.eventType} — {b.eventDate} &bull; {b.hall}
            <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{b.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/bookings/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
          <Link href={`/billing/${params?.id}`} className="btn btn-ghost"><FileText size={15} /> Invoice</Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Amount', val: `₹${total.toLocaleString('en-IN')}` },
          { label: 'Advance Paid', val: `₹${b.advancePaid.toLocaleString('en-IN')}` },
          { label: 'Balance Due', val: `₹${balance.toLocaleString('en-IN')}`, highlight: balance > 0 },
          { label: 'Guest Count', val: b.guestCount },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.highlight ? '#dc2626' : 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Booking Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Client Phone</span><span><a href={`tel:${b.phone}`}>{b.phone}</a></span></div>
                <div className="info-item"><span className="form-label">Email</span><span><a href={`mailto:${b.email}`}>{b.email}</a></span></div>
                <div className="info-item"><span className="form-label">Event Date</span><span>{b.eventDate}</span></div>
                <div className="info-item"><span className="form-label">Timings</span><span>{b.startTime} – {b.endTime}</span></div>
                <div className="info-item"><span className="form-label">Guest Count</span><span>{b.guestCount}</span></div>
                <div className="info-item"><span className="form-label">Hall</span><span>{b.hall}</span></div>
                <div className="info-item"><span className="form-label">Package</span><span>{b.packageName}</span></div>
                <div className="info-item"><span className="form-label">Menu</span><span>{b.menuName}</span></div>
                <div className="info-item"><span className="form-label">Assigned To</span><span>{b.assignedTo}</span></div>
                <div className="info-item"><span className="form-label">Branch</span><span>{b.branch}</span></div>
              </div>
            </div>
            <div className="card" style={{ padding: 24, marginTop: 16 }}>
              <div className="form-section-title">Financial Summary</div>
              {[
                ['Base Amount', b.baseAmount],
                ['Decor Package', b.decorAmount],
                ['Menu / Catering', b.menuAmount],
                ['Discount', -b.discount],
                ['Subtotal', subtotal],
                [`Tax (${b.taxPct}%)`, tax],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: l === 'Subtotal' ? 700 : 400, color: v < 0 ? '#16a34a' : 'var(--color-text-h)' }}>
                    {v < 0 ? `– ₹${Math.abs(v).toLocaleString('en-IN')}` : `₹${v.toLocaleString('en-IN')}`}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 16, fontWeight: 700 }}>
                <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#dc2626', fontWeight: 600 }}>
                <span>Balance Due</span><span>₹{balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" style={{ width: '100%' }}><CreditCard size={14} /> Record Payment</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}><Download size={14} /> Download Invoice</button>
                <button className="btn btn-ghost" style={{ width: '100%', color: '#dc2626' }}>Cancel Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments */}
      {tab === 'Payments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary"><CreditCard size={14} /> Record Payment</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Payment ID</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Reference</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {b.payments.map(p => {
                  const ps = STATUS_COLORS[p.status] || {};
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.id}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{p.date}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{p.mode}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{p.ref}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: ps.bg, color: ps.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice */}
      {tab === 'Invoice' && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>Prasad Food Divine</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Banjara Hills, Hyderabad — GST: 36ABCDE9999F1Z5</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Invoice #{b.id}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>
          <div style={{ marginBottom: 20, padding: 16, background: 'var(--color-surface-2)', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Bill To: {b.clientName}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{b.email} &bull; {b.phone}</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: 'var(--color-primary)', color: '#fff', fontSize: 12, textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[['Hall Rental — ' + b.hall, b.baseAmount], ['Decor Package', b.decorAmount], ['Catering — ' + b.menuName, b.menuAmount]].map(([d, a]) => (
                <tr key={d} style={{ borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
                  <td style={{ padding: '10px 14px', color: 'var(--color-text-body)' }}>{d}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{a.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                <td style={{ padding: '8px 14px' }}>Discount</td>
                <td style={{ padding: '8px 14px', textAlign: 'right', color: '#16a34a' }}>– ₹{b.discount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                <td style={{ padding: '8px 14px' }}>Tax ({b.taxPct}%)</td>
                <td style={{ padding: '8px 14px', textAlign: 'right' }}>₹{tax.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ fontWeight: 700, fontSize: 16, borderTop: '2px solid var(--color-border)' }}>
                <td style={{ padding: '12px 14px' }}>Total</td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{total.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div className="form-actions">
            <button className="btn btn-ghost"><Download size={14} /> Download PDF</button>
            <button className="btn btn-primary">Send to Client</button>
          </div>
        </div>
      )}

      {/* Event Checklist */}
      {tab === 'Event Checklist' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ margin: 0 }}>Event Checklist</div>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{checklist.filter(c => c.done).length}/{checklist.length} done</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {checklist.map((c, i) => (
              <div key={i} className="checklist-item" onClick={() => toggleCheck(i)}>
                {c.done ? <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} /> : <Circle size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                <span style={{ fontSize: 14, color: c.done ? 'var(--color-text-muted)' : 'var(--color-text-body)', textDecoration: c.done ? 'line-through' : 'none' }}>{c.item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decor */}
      {tab === 'Decor' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Image size={40} style={{ margin: '0 auto 12px' }} />
          <p>Decor selections and AI-generated previews for this booking.</p>
          <Link href="/decor" className="btn btn-primary" style={{ marginTop: 12 }}>Browse Decor</Link>
        </div>
      )}
    </div>
  );
}
