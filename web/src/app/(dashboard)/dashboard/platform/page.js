'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, GitBranch, TrendingUp, DollarSign, Users, AlertTriangle, Loader } from 'lucide-react';

export default function PlatformDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [franchiseData, setFranchiseData] = useState([]);
  const [chartData, setChartData] = useState({ monthlyRevenue: [], branchRevenue: [] });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch('/api/dashboard/stats');
        setPlatformStats(data.platformStats);
        setFranchiseData(data.franchiseData);
        setChartData(data.chartData);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--color-danger)' }}>
          <h3 style={{ color: 'var(--color-danger)', marginBottom: 8 }}>Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !platformStats) {
    return (
      <div style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={40} style={{ marginBottom: 16, animation: 'spin 1s linear infinite' }} />
          <p>Loading platform dashboard...</p>
        </div>
      </div>
    );
  }
  const kpis = [
    { icon: <Building2 size={20} />, label: 'Franchises', value: platformStats.totalFranchises, change: null },
    { icon: <GitBranch size={20} />, label: 'Branches', value: platformStats.totalBranches, change: null },
    { icon: <DollarSign size={20} />, label: 'Revenue (MTD)', value: `₹${(platformStats.totalRevenueMTD / 100000).toFixed(1)}L`, change: null },
    { icon: <TrendingUp size={20} />, label: 'Bookings (MTD)', value: platformStats.totalBookingsMTD, change: null },
    { icon: <Users size={20} />, label: 'Conversion Rate', value: `${platformStats.globalConversionRate}%`, change: null },
    { icon: <AlertTriangle size={20} />, label: 'Outstanding Dues', value: `₹${(platformStats.totalOutstandingDues / 100000).toFixed(1)}L`, change: null },
  ];
  const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)'];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Platform Overview</h1>
          <p>Super Admin Dashboard — All franchises and branches</p>
        </div>
        <div className="page-actions">
          <Link href="/franchises/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>+ Add Franchise</Link>
        </div>
      </div>

      {/* KPIs */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="kpi-row" style={{ marginBottom: 32 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="kpi-label">{k.label}</div>
              <div style={{ color: 'var(--color-primary)', opacity: 0.6 }}>{k.icon}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            {k.change && <div className="kpi-change positive">↑ {k.change}</div>}
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="card-grid-2" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 20 }}>Revenue by Branch</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData.branchRevenue} dataKey="revenue" nameKey="branch" cx="50%" cy="50%" outerRadius={90} label={({ branch }) => branch}>
                {chartData.branchRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${(v/100000).toFixed(1)}L`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Franchise Table */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Franchises</h3>
          <Link href="/franchises" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>View All</Link>
        </div>
        <table className="data-table">
          <thead><tr><th>Franchise</th><th>City</th><th>Admin</th><th>Branches</th><th>Revenue</th><th>Status</th></tr></thead>
          <tbody>
            {franchiseData.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{f.name}</td>
                <td>{f.city}</td><td>{f.admin}</td><td>{f.branches}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{(f.revenue / 100000).toFixed(1)}L</td>
                <td><span className="badge badge-green">{f.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
