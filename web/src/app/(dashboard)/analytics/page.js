'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { chartData, bookingData, leadData, paymentData, inventoryData, eventData, staffData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const tabs = ['Revenue', 'Bookings', 'Leads', 'Payments', 'Inventory', 'Events', 'Staff'];

export default function AnalyticsPage() {
  const [active, setActive] = useState('Revenue');
  const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-info)'];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>Reports and insights</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export Report</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
      <div className="tab-list">
        {tabs.map(t => <div key={t} className={`tab-item ${active === t ? 'active' : ''}`} onClick={() => setActive(t)}>{t}</div>)}
      </div>
      </motion.div>

      <motion.div variants={fadeUp}>
      <div className="card" style={{ padding: 24 }}>
        {active === 'Revenue' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip formatter={v => `₹${(v/100000).toFixed(1)}L`} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {active === 'Bookings' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Booking Status Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={[{ name: 'Confirmed', value: bookingData.filter(b => b.status === 'Confirmed').length }, { name: 'Tentative', value: bookingData.filter(b => b.status === 'Tentative').length }, { name: 'Completed', value: bookingData.filter(b => b.status === 'Completed').length }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                <div className="kpi-card"><div className="kpi-label">Total Bookings</div><div className="kpi-value">{bookingData.length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Total Revenue</div><div className="kpi-value">₹{(bookingData.reduce((s, b) => s + b.total, 0) / 100000).toFixed(1)}L</div></div>
              </div>
            </div>
          </div>
        )}

        {active === 'Leads' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Lead Funnel</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.leadFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {active === 'Payments' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="kpi-card"><div className="kpi-label">Total Collected</div><div className="kpi-value">₹{(paymentData.reduce((s, p) => s + p.amount, 0) / 100000).toFixed(1)}L</div></div>
              <div className="kpi-card"><div className="kpi-label">Payments Count</div><div className="kpi-value">{paymentData.length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Avg Payment</div><div className="kpi-value">₹{(paymentData.reduce((s, p) => s + p.amount, 0) / paymentData.length / 1000).toFixed(0)}K</div></div>
            </div>
          </div>
        )}

        {active === 'Inventory' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Stock Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <Tooltip />
                <Bar dataKey="currentStock" fill="var(--color-primary)" name="Current" radius={[6, 6, 0, 0]} />
                <Bar dataKey="minStock" fill="var(--color-accent)" name="Min Level" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {active === 'Events' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Event Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="kpi-card"><div className="kpi-label">Total Events</div><div className="kpi-value">{eventData.length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Upcoming</div><div className="kpi-value">{eventData.filter(e => e.status === 'Upcoming').length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Completed</div><div className="kpi-value">{eventData.filter(e => e.status === 'Completed').length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Total Guests</div><div className="kpi-value">{eventData.reduce((s, e) => s + e.guests, 0).toLocaleString()}</div></div>
            </div>
          </div>
        )}

        {active === 'Staff' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Staff Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="kpi-card"><div className="kpi-label">Total Staff</div><div className="kpi-value">{staffData.length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Permanent</div><div className="kpi-value">{staffData.filter(s => s.type === 'Permanent').length}</div></div>
              <div className="kpi-card"><div className="kpi-label">Temporary</div><div className="kpi-value">{staffData.filter(s => s.type === 'Temporary').length}</div></div>
            </div>
          </div>
        )}
      </div>
      </motion.div>
    </motion.div>
  );
}
