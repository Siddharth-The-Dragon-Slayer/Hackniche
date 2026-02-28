'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { branchData, chartData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, DollarSign, TrendingUp, Users, CalendarDays } from 'lucide-react';

export default function FranchiseDashboard() {
  const kpis = [
    { icon: <Building2 size={20} />, label: 'Branches', value: '3', change: null },
    { icon: <DollarSign size={20} />, label: 'Revenue (MTD)', value: '₹28.4L', change: '+12.5%' },
    { icon: <CalendarDays size={20} />, label: 'Bookings (MTD)', value: '42', change: '+18%' },
    { icon: <Users size={20} />, label: 'Active Staff', value: '24', change: null },
    { icon: <TrendingUp size={20} />, label: 'Avg Occupancy', value: '65%', change: '+5.4%' },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Franchise Dashboard</h1>
          <p>Prasad Food Divine — Franchise Admin View</p>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="kpi-row" style={{ marginBottom: 32 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="kpi-label">{k.label}</div>
              <div style={{ color: 'var(--color-primary)', opacity: 0.5 }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ fontSize: 24 }}>{k.value}</div>
            {k.change && <div className="kpi-change positive">↑ {k.change}</div>}
          </motion.div>
        ))}
      </motion.div>

      <div className="card-grid-2" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip formatter={v => `₹${(v/100000).toFixed(1)}L`} />
              <Bar dataKey="revenue" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Lead Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chartData.leadFunnel.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, width: 80, color: 'var(--color-text-muted)' }}>{s.stage}</span>
                <div style={{ flex: 1, height: 24, background: 'var(--color-primary-ghost)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(s.count / 48) * 100}%`, height: '100%', background: 'var(--gradient-bar)', borderRadius: 6, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-h)', width: 28 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Branches</h3>
          <Link href="/branches" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Manage</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>Branch</th><th>City</th><th>Manager</th><th>Halls</th><th>Bookings</th><th>Revenue</th><th>Occupancy</th></tr></thead>
          <tbody>
            {branchData.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{b.name}</td>
                <td>{b.city}</td><td>{b.manager}</td><td>{b.halls}</td><td>{b.bookingsMTD}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(b.revenue / 100000).toFixed(1)}L</td>
                <td><span className={`badge ${b.occupancy > 70 ? 'badge-green' : 'badge-accent'}`}>{b.occupancy}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
