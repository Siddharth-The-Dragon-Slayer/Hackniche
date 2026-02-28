'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import { bookingData, eventData, chartData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, CalendarDays, DollarSign, Users, TrendingUp, Clock, AlertTriangle, Zap, Phone, Calendar } from 'lucide-react';

const ACTIVE_STATUSES = ['visited','tasting_scheduled','tasting_done','menu_selected','advance_paid','decoration_scheduled'];
const STATUS_STYLE = {
  new: { bg:'#dbeafe', color:'#1d4ed8' }, visited: { bg:'#ede9fe', color:'#6d28d9' },
  tasting_scheduled: { bg:'#fef3c7', color:'#d97706' }, tasting_done: { bg:'#fde68a', color:'#b45309' },
  menu_selected: { bg:'#d1fae5', color:'#065f46' }, advance_paid: { bg:'#ecfdf5', color:'#059669' },
  decoration_scheduled: { bg:'#e0f2fe', color:'#0369a1' }, paid: { bg:'#dcfce7', color:'#16a34a' },
  lost: { bg:'#fee2e2', color:'#991b1b' },
};
const STATUS_LABEL = {
  new:'New', visited:'Visited', tasting_scheduled:'Tasting Sched.', tasting_done:'Tasting Done',
  menu_selected:'Menu Selected', advance_paid:'Advance Paid', decoration_scheduled:'Decor Sched.',
  paid:'Fully Paid', in_progress:'In Progress', completed:'Completed', lost:'Lost',
};

export default function BranchDashboard() {
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';
  const name         = userProfile?.name         || 'there';

  const [leads, setLeads]         = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLeadsLoading(false); })
      .catch(() => setLeadsLoading(false));
  }, [franchise_id, branch_id]);

  const activeLeads  = leads.filter(l => ACTIVE_STATUSES.includes(l.status) || l.status === 'new');
  const newLeads     = leads.filter(l => l.status === 'new');
  const closedLeads  = leads.filter(l => l.status === 'closed');
  const lostLeads    = leads.filter(l => l.status === 'lost');
  const convRate     = leads.length > 0 ? Math.round((closedLeads.length / leads.length) * 100) : 0;

  // Upcoming events: leads with event_date within next 30 days
  const today = new Date();
  const in30  = new Date(); in30.setDate(today.getDate() + 30);
  const upcomingLeads = leads.filter(l => {
    if (!l.event_date) return false;
    const d = new Date(l.event_date);
    return d >= today && d <= in30;
  }).sort((a,b) => new Date(a.event_date) - new Date(b.event_date));

  const kpis = [
    { icon: <Target size={20} />, label:'Active Leads', value: leadsLoading ? '…' : String(activeLeads.length), change: `${newLeads.length} new today`, positive: true },
    { icon: <CalendarDays size={20} />, label:'Upcoming Events', value: leadsLoading ? '…' : String(upcomingLeads.length), change: 'Next 30 days', positive: true },
    { icon: <DollarSign size={20} />, label:'Revenue (MTD)', value:'₹—', change: 'From bookings', positive: true },
    { icon: <TrendingUp size={20} />, label:'Conversion Rate', value: leadsLoading ? '…' : `${convRate}%`, change: `${closedLeads.length} closed`, positive: true },
    { icon: <Clock size={20} />, label:'Total Leads', value: leadsLoading ? '…' : String(leads.length), change: `${lostLeads.length} lost`, positive: true },
    { icon: <AlertTriangle size={20} />, label:'Paid / In Progress', value: leadsLoading ? '…' : String(leads.filter(l=>['paid','in_progress'].includes(l.status)).length), change: 'Committed events', positive: true },
  ];

  const upcomingEvents = eventData.filter(e => e.status === 'Upcoming');

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <h1>Branch Dashboard</h1>
          <p>{userProfile?.branch_name || 'Branch'} — Welcome back, {name}!</p>
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
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Active Leads</h3>
            <Link href="/leads" style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {leadsLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height:52, borderRadius:10, background:'var(--color-surface-2)', animation:'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : activeLeads.length === 0 ? (
            <p style={{ fontSize:14, color:'var(--color-text-muted)', textAlign:'center', padding:'24px 0' }}>No active leads. <Link href="/leads/create" style={{ color:'var(--color-primary)' }}>Create one →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeLeads.slice(0, 4).map(l => {
                const st = STATUS_STYLE[l.status] || {};
                return (
                  <Link key={l.id} href={`/leads/${l.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, borderRadius:12, background:'var(--color-primary-ghost)', gap:8 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text-h)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.customer_name}</div>
                      <div style={{ fontSize:12, color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                        <Phone size={10}/> {l.phone} · 🎉 {l.event_type}
                      </div>
                    </div>
                    <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                      {STATUS_LABEL[l.status] || l.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>Upcoming Events (Next 30 Days)</h3>
            <Link href="/leads?status=paid" style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {leadsLoading ? (
            <p style={{ color:'var(--color-text-muted)', fontSize:13 }}>Loading…</p>
          ) : upcomingLeads.length === 0 ? (
            <p style={{ fontSize:14, color:'var(--color-text-muted)', textAlign:'center', padding:'16px 0' }}>No upcoming events in next 30 days.</p>
          ) : upcomingLeads.slice(0, 4).map(l => (
            <Link key={l.id} href={`/leads/${l.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--color-border)', gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text-h)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.customer_name}</div>
                <div style={{ fontSize:12, color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                  <Calendar size={10}/> {l.event_date} · {l.expected_guest_count} guests · {l.hall_name || '—'}
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--color-text-muted)', flexShrink:0 }}>🎉 {l.event_type}</div>
            </Link>
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

