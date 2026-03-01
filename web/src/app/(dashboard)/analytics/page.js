'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { chartData, bookingData, leadData, paymentData, inventoryData, eventData, staffData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const tabs = ['Revenue', 'Bookings', 'Leads', 'Payments', 'Inventory', 'Events', 'Staff'];

export default function AnalyticsPage() {
  const { role, userProfile, loading } = useAuth();
  const [active, setActive] = useState('Revenue');
  const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-info)'];

  const isBranchManager = role === 'branch_manager';
  const effectiveBranchId = isBranchManager ? (userProfile?.branch_id || 'pfd_b1') : null;

  // Filter Data
  const filteredRevenue = useMemo(() => isBranchManager ? chartData.monthlyRevenue.filter(r => r.branchId === effectiveBranchId) : chartData.monthlyRevenue, [isBranchManager, effectiveBranchId]);
  const filteredBookings = useMemo(() => isBranchManager ? bookingData.filter(b => b.branchId === effectiveBranchId) : bookingData, [isBranchManager, effectiveBranchId]);
  const filteredLeads = useMemo(() => isBranchManager ? chartData.leadFunnel.filter(l => l.branchId === effectiveBranchId) : chartData.leadFunnel, [isBranchManager, effectiveBranchId]);
  const filteredPayments = useMemo(() => isBranchManager ? paymentData.filter(p => p.branchId === effectiveBranchId) : paymentData, [isBranchManager, effectiveBranchId]);
  const filteredInventory = useMemo(() => isBranchManager ? inventoryData.filter(i => i.branchId === effectiveBranchId) : inventoryData, [isBranchManager, effectiveBranchId]);
  const filteredEvents = useMemo(() => isBranchManager ? eventData.filter(e => e.branchId === effectiveBranchId) : eventData, [isBranchManager, effectiveBranchId]);
  const filteredStaff = useMemo(() => isBranchManager ? staffData.filter(s => s.branchId === effectiveBranchId) : staffData, [isBranchManager, effectiveBranchId]);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>{isBranchManager ? userProfile?.branch_name : "Franchise-Wide"} Reports & Insights</p>
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
                <BarChart data={filteredRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={v => `₹${(v / 100000).toFixed(1)}L`} />
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
                    <Pie
                      data={[
                        { name: 'Confirmed', value: filteredBookings.filter(b => b.status === 'Confirmed').length },
                        { name: 'Tentative', value: filteredBookings.filter(b => b.status === 'Tentative').length },
                        { name: 'Completed', value: filteredBookings.filter(b => b.status === 'Completed').length }
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label
                    >
                      {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                  <div className="kpi-card"><div className="kpi-label">Branch Bookings</div><div className="kpi-value">{filteredBookings.length}</div></div>
                  <div className="kpi-card"><div className="kpi-label">Total Volume</div><div className="kpi-value">₹{(filteredBookings.reduce((s, b) => s + b.total, 0) / 100000).toFixed(1)}L</div></div>
                </div>
              </div>
            </div>
          )}

          {active === 'Leads' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Lead Funnel</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={filteredLeads} layout="vertical">
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
                <div className="kpi-card"><div className="kpi-label">Collected</div><div className="kpi-value">₹{(filteredPayments.reduce((s, p) => s + p.amount, 0) / 100000).toFixed(1)}L</div></div>
                <div className="kpi-card"><div className="kpi-label">Transaction Count</div><div className="kpi-value">{filteredPayments.length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Success Rate</div><div className="kpi-value">98.4%</div></div>
              </div>
            </div>
          )}

          {active === 'Inventory' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Stock Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredInventory}>
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
                <div className="kpi-card"><div className="kpi-label">Total Events</div><div className="kpi-value">{filteredEvents.length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Upcoming</div><div className="kpi-value">{filteredEvents.filter(e => e.status === 'Upcoming').length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Completed</div><div className="kpi-value">{filteredEvents.filter(e => e.status === 'Completed').length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Total Guests</div><div className="kpi-value">{filteredEvents.reduce((s, e) => s + e.guests, 0).toLocaleString()}</div></div>
              </div>
            </div>
          )}

          {active === 'Staff' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>Staff Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="kpi-card"><div className="kpi-label">Total Team</div><div className="kpi-value">{filteredStaff.length}</div></div>
                <div className="kpi-card"><div className="kpi-label">Permanent</div><div className="kpi-value">{filteredStaff.filter(s => s.type === 'Permanent').length}</div></div>
                <div className="kpi-card"><div className="kpi-label">On Leave</div><div className="kpi-value">2</div></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
