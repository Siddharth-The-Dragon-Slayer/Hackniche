'use client';
import { motion } from 'framer-motion';
import { CalendarDays, CreditCard, Star, Clock, MapPin, Users } from 'lucide-react';
import { bookingData, eventData, reviewData, hallData } from '@/lib/mock-data';

export default function CustomerDashboard() {
  const upcoming = eventData.filter(e => e.status === 'Upcoming');
  const myBookings = bookingData;
  const totalSpent = myBookings.reduce((s, b) => s + b.advance, 0);
  const pending = myBookings.reduce((s, b) => s + b.balance, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Welcome back!</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>Here&apos;s your booking overview</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: <CalendarDays size={20} />, label: 'My Bookings', value: myBookings.length, color: 'var(--color-primary)' },
          { icon: <Clock size={20} />, label: 'Upcoming Events', value: upcoming.length, color: 'var(--color-accent)' },
          { icon: <CreditCard size={20} />, label: 'Total Paid', value: `₹${(totalSpent / 1000).toFixed(0)}K`, color: 'var(--color-success)' },
          { icon: <CreditCard size={20} />, label: 'Pending', value: `₹${(pending / 1000).toFixed(0)}K`, color: pending > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>{kpi.icon}</div>
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Events */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Upcoming Events</h2>
      {upcoming.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No upcoming events</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
          {upcoming.map(ev => (
            <motion.div key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>{ev.name}</h3>
                <span className="badge badge-green">{ev.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--color-text-body)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CalendarDays size={14} style={{ color: 'var(--color-accent)' }} /> {ev.date}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} style={{ color: 'var(--color-accent)' }} /> {ev.hall}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={14} style={{ color: 'var(--color-accent)' }} /> {ev.guests} guests</div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--color-text-muted)' }}>
                  <span>Preparation</span><span>{ev.checklistDone}/{ev.checklistTotal}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--color-primary-ghost)' }}>
                  <div style={{ width: `${(ev.checklistDone / ev.checklistTotal) * 100}%`, height: '100%', background: 'var(--gradient-bar)', borderRadius: 3 }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking History */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Booking History</h2>
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Booking</th><th>Event</th><th>Hall</th><th>Date</th><th>Guests</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {myBookings.map(b => (
              <tr key={b.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{b.id}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{b.eventType}</td>
                <td>{b.hall}</td><td>{b.date}</td><td>{b.guests}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(b.total / 1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>₹{(b.advance / 1000).toFixed(0)}K</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: b.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>₹{(b.balance / 1000).toFixed(0)}K</td>
                <td><span className={`badge ${b.status === 'Confirmed' ? 'badge-green' : b.status === 'Tentative' ? 'badge-warning' : b.status === 'Completed' ? 'badge-accent' : 'badge-red'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Available Halls */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)', margin: '32px 0 16px' }}>Available Venues</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        {hallData.map(h => (
          <div key={h.id} className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{h.name}</h3>
            <span className="badge badge-accent" style={{ marginBottom: 12 }}>{h.type}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 13 }}>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Capacity:</span> {h.capacity}</div>
              <div><span style={{ color: 'var(--color-text-muted)' }}>Branch:</span> {h.branch}</div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--color-text-muted)' }}>Base Price:</span> <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-accent)' }}>₹{h.basePrice.toLocaleString()}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave a Review */}
      <div className="card" style={{ padding: 32, textAlign: 'center', background: 'var(--color-primary-ghost)' }}>
        <Star size={32} style={{ color: 'var(--color-star)', marginBottom: 12 }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Share Your Experience</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 16 }}>Help us improve by leaving a review for your recent events</p>
        <button className="btn btn-primary">Write a Review</button>
      </div>
    </div>
  );
}
