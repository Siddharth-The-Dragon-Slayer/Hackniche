'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { bookingData, leadData, eventData, chartData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, CalendarDays, DollarSign, Users, TrendingUp, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function BranchDashboard() {
  const kpis = [
    { icon: <Target size={20} />, label: 'Active Leads', value: '24', change: '+5 this week', positive: true },
    { icon: <CalendarDays size={20} />, label: 'Bookings (MTD)', value: '12', change: '+3 vs last month', positive: true },
    { icon: <DollarSign size={20} />, label: 'Revenue (MTD)', value: '₹12.0L', change: '+18.5%', positive: true },
    { icon: <TrendingUp size={20} />, label: 'Conversion Rate', value: '22.4%', change: '+4.2%', positive: true },
    { icon: <Clock size={20} />, label: 'Upcoming Events', value: '3', change: 'Next: Apr 15', positive: true },
    { icon: <AlertTriangle size={20} />, label: 'Overdue Follow-ups', value: '5', change: '2 critical', positive: false },
  ];

  const upcomingEvents = eventData.filter(e => e.status === 'Upcoming');
  const hotLeads = leadData.filter(l => l.aiScore >= 70).slice(0, 3);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Branch Dashboard</h1>
          <p>Banjara Hills Branch — Welcome back, Arjun!</p>
        </div>
        <div className="page-actions">
          <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Zap size={16} /> New Lead
          </Link>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="kpi-row" style={{ marginBottom: 32 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="kpi-label">{k.label}</div>
              <div style={{ color: 'var(--color-primary)', opacity: 0.5 }}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-change ${k.positive ? 'positive' : 'negative'}`}>{k.positive ? '↑' : '⚠'} {k.change}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={v => `₹${(v/100000).toFixed(1)}L`} />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Hot Leads</h3>
            <Link href="/leads" style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hotLeads.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, background: 'var(--color-primary-ghost)', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.client}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{l.eventType} · {l.guests} guests</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: l.aiScore >= 70 ? 'var(--color-success)' : 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{l.aiScore}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Upcoming Events</h3>
            <Link href="/events" style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {upcomingEvents.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.hall} · {e.guests} guests · {e.date}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{e.checklistDone}/{e.checklistTotal} done</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Recent Bookings</h3>
            <Link href="/bookings" style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {bookingData.slice(0, 3).map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.client}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{b.hall} · {b.date}</div>
              </div>
              <span className={`badge ${b.status === 'Confirmed' ? 'badge-green' : 'badge-accent'}`} style={{ flexShrink: 0 }}>{b.status}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

