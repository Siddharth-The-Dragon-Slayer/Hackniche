'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { chartData, bookingData, leadData, paymentData, inventoryData, eventData, staffData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Loader2, AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';

const tabs = ['Revenue', 'Bookings', 'Leads', 'Payments', 'Inventory', 'Events', 'Staff'];
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
  const [active, setActive] = useState('Revenue');
  const { userProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || 'pfd';
  const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-info)'];

  // Live inventory analytics
  const [invData, setInvData] = useState(null);
  const [invLoading, setInvLoading] = useState(false);

  useEffect(() => {
    if (active !== 'Inventory' || invData) return;
    let cancelled = false;
    const loadData = async () => {
      setInvLoading(true);
      try {
        const res = await fetch(`/api/kitchen-inventory/analytics?franchise_id=${franchiseId}`);
        const d = await res.json();
        if (!cancelled && d.success) setInvData(d.data);
      } catch (err) {
        console.error('Analytics fetch:', err);
      } finally {
        if (!cancelled) setInvLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [active, franchiseId, invData]);

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
            {invLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-text-muted)' }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>Loading live inventory data...</p>
              </div>
            ) : !invData ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 30 }}>No inventory data available</p>
            ) : (
              <>
                {/* KPI Row */}
                <div className="kpi-row" style={{ marginBottom: 24 }}>
                  <div className="kpi-card">
                    <div className="kpi-label">Total Materials</div>
                    <div className="kpi-value">{invData.inventory.totalItems}</div>
                  </div>
                  <div className="kpi-card" style={{ borderLeft: invData.inventory.lowStockCount > 0 ? '3px solid #ef4444' : undefined }}>
                    <div className="kpi-label">Low Stock</div>
                    <div className="kpi-value" style={{ color: invData.inventory.lowStockCount > 0 ? '#ef4444' : undefined }}>{invData.inventory.lowStockCount}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Inventory Value</div>
                    <div className="kpi-value">{fmt(invData.inventory.totalValue)}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">PO Spend</div>
                    <div className="kpi-value">{fmt(invData.purchaseOrders.totalValue)}</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Guests Served</div>
                    <div className="kpi-value">{(invData.consumption.totalGuestsServed || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Stock Levels Bar Chart */}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 12 }}>
                  <Package size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  Stock Levels
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(invData.inventory.stockLevels || []).slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                    <Tooltip />
                    <Bar dataKey="currentStock" fill="var(--color-primary)" name="Current" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="minStock" fill="var(--color-accent)" name="Min Level" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Category & Vendor row */}
                <div className="card-grid-2" style={{ marginTop: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-h)' }}>Category Breakdown</h3>
                    {invData.inventory.categoryBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={invData.inventory.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                            {invData.inventory.categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={v => fmt(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No category data</p>}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-h)' }}>
                      <ShoppingCart size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                      Top Vendors
                    </h3>
                    {invData.purchaseOrders.topVendors?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {invData.purchaseOrders.topVendors.map(v => (
                          <div key={v.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, background: 'var(--color-surface-2)', fontSize: 13 }}>
                            <span style={{ fontWeight: 600 }}>{v.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({v.orderCount} POs)</span></span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)' }}>{fmt(v.totalValue)}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No vendor data</p>}
                  </div>
                </div>

                {/* Most Used Materials */}
                {invData.consumption.topUsedMaterials?.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-h)' }}>Most Consumed Materials</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={invData.consumption.topUsedMaterials.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} width={120} />
                        <Tooltip formatter={(v, _, { payload }) => [`${v} ${payload.unit}`, 'Total Used']} />
                        <Bar dataKey="totalUsed" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Low Stock Alert Table */}
                {invData.inventory.lowStockItems?.length > 0 && (
                  <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} /> Low Stock Items ({invData.inventory.lowStockItems.length})
                    </h4>
                    {invData.inventory.lowStockItems.map(i => (
                      <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                        <span>{i.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>{i.currentStock}/{i.minStock} {i.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
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
