'use client';
import { useState } from 'react';
import Link from 'next/link';
import { bookingData } from '@/lib/mock-data';
import { Plus, Search, Filter, Download, CalendarDays } from 'lucide-react';

const statuses = ['All', 'Confirmed', 'Tentative', 'Completed', 'Cancelled'];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? bookingData : bookingData.filter(b => b.status === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Bookings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>{bookingData.length} total bookings</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/calendar" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><CalendarDays size={14} /> Calendar</Link>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <Link href="/bookings/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New Booking</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search bookings..." style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div className="tab-list">
        {statuses.map(s => (
          <div key={s} className={`tab-item ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)}>{s}</div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Client</th><th>Event</th><th>Hall</th><th>Date</th><th>Guests</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{b.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{b.client}</td>
                <td>{b.eventType}</td><td>{b.hall}</td><td>{b.date}</td><td>{b.guests}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(b.total/1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: b.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{(b.balance/1000).toFixed(0)}K</td>
                <td><span className={`badge ${b.status === 'Confirmed' ? 'badge-green' : b.status === 'Completed' ? 'badge-primary' : 'badge-accent'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
