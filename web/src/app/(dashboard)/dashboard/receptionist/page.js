'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Phone, Calendar, Clock, Users, Target, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_STYLE = {
  new:               { bg:'#dbeafe', color:'#1d4ed8' },
  visited:           { bg:'#ede9fe', color:'#6d28d9' },
  tasting_scheduled: { bg:'#fef3c7', color:'#d97706' },
  tasting_done:      { bg:'#fde68a', color:'#b45309' },
  menu_selected:     { bg:'#d1fae5', color:'#065f46' },
  advance_paid:      { bg:'#ecfdf5', color:'#059669' },
  lost:              { bg:'#fee2e2', color:'#991b1b' },
};

const STATUS_LABEL = {
  new:'New Enquiry', visited:'Visited', tasting_scheduled:'Tasting Sched.',
  tasting_done:'Tasting Done', menu_selected:'Menu Selected',
  advance_paid:'Advance Paid', lost:'Lost',
};

export default function ReceptionistDashboard() {
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';
  const name         = userProfile?.name         || 'there';

  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [franchise_id, branch_id]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-poll every 30 s — keep receptionist dashboard live.
  useEffect(() => {
    const id = setInterval(fetchLeads, 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const newLeads      = leads.filter(l => l.status === 'new');
  const activeLeads   = leads.filter(l => ['new','visited','tasting_scheduled','tasting_done','menu_selected'].includes(l.status));
  const todayStr      = new Date().toISOString().slice(0, 10);
  const todayFollowUps = leads.flatMap(l =>
    (l.follow_ups || [])
      .filter(f => f.date === todayStr)
      .map(f => ({ ...f, lead_id: l.id, customer_name: l.customer_name, phone: l.phone, event_type: l.event_type }))
  );

  const kpis = [
    { icon: <Target size={20}/>,   label: 'New Enquiries',   value: loading ? '…' : newLeads.length,    color: '#6366f1' },
    { icon: <Clock size={20}/>,    label: 'Active Leads',    value: loading ? '…' : activeLeads.length,  color: '#f59e0b' },
    { icon: <Phone size={20}/>,    label: "Today's Follow-ups", value: loading ? '…' : todayFollowUps.length, color: '#ef4444' },
    { icon: <Users size={20}/>,    label: 'Total in Branch', value: loading ? '…' : leads.length,        color: '#10b981' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom:32 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Receptionist Dashboard</h1>
            <p>{userProfile?.branch_name || 'Branch'} — Welcome back, {name}!</p>
          </div>
          <div className="page-actions">
            <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              <Plus size={16} /> New Lead
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Banner */}
      <motion.div variants={fadeUp}>
        <div className="card" style={{ padding:24, marginBottom:24, background:'var(--gradient-primary)', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Ready to capture a new enquiry?</div>
            <div style={{ fontSize:13, opacity:0.85 }}>Walk-in customers, phone calls, or website enquiries — log them all here.</div>
          </div>
          <Link href="/leads/create" style={{ textDecoration:'none', background:'#fff', color:'var(--color-primary)', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <Plus size={16} /> Create Lead
          </Link>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="kpi-row" style={{ marginBottom:32 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="kpi-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div className="kpi-label">{k.label}</div>
              <div style={{ color:k.color, opacity:0.6 }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color:k.color }}>{k.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* New & Pending Follow-up Leads */}
        <motion.div variants={fadeUp} className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text-h)' }}>New Enquiries</h3>
            <Link href="/leads?status=new" style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>View All →</Link>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:24 }}><Loader2 size={20} style={{ animation:'spin 1s linear infinite', color:'var(--color-text-muted)' }}/></div>
          ) : newLeads.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--color-text-muted)', textAlign:'center', padding:'20px 0' }}>No new enquiries. <Link href="/leads/create" style={{ color:'var(--color-primary)' }}>Create one →</Link></p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {newLeads.slice(0, 5).map(l => (
                <Link key={l.id} href={`/leads/${l.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`}
                  style={{ textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:10, background:'var(--color-primary-ghost)', gap:8 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text-h)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.customer_name}</div>
                    <div style={{ fontSize:11, color:'var(--color-text-muted)', display:'flex', gap:6, marginTop:2 }}>
                      <Phone size={10}/> {l.phone} · 🎉 {l.event_type}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color:'var(--color-text-muted)', flexShrink:0 }} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's Follow-ups */}
        <motion.div variants={fadeUp} className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text-h)' }}>Today&apos;s Follow-ups</h3>
            <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>{todayStr}</span>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:24 }}><Loader2 size={20} style={{ animation:'spin 1s linear infinite', color:'var(--color-text-muted)' }}/></div>
          ) : todayFollowUps.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--color-text-muted)', textAlign:'center', padding:'20px 0' }}>No follow-ups scheduled for today.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {todayFollowUps.slice(0, 5).map((f, i) => (
                <Link key={i} href={`/leads/${f.lead_id}?franchise_id=${franchise_id}&branch_id=${branch_id}`}
                  style={{ textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:10, background:'#fef3c7', gap:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#92400e' }}>{f.customer_name}</div>
                    <div style={{ fontSize:11, color:'#b45309' }}>{f.type} · {f.notes?.slice(0,40)}{f.notes?.length > 40 ? '…' : ''}</div>
                  </div>
                  <ChevronRight size={14} style={{ color:'#b45309', flexShrink:0 }} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* All Active Leads List */}
        <motion.div variants={fadeUp} className="card" style={{ padding:24, gridColumn:'span 2' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text-h)' }}>All Active Branch Leads</h3>
            <Link href="/leads" style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>Full List →</Link>
          </div>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:24 }}><Loader2 size={20} style={{ animation:'spin 1s linear infinite', color:'var(--color-text-muted)' }}/></div>
          ) : activeLeads.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--color-text-muted)', textAlign:'center', padding:'20px 0' }}>No active leads.</p>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th><th>Phone</th><th>Event</th><th>Event Date</th><th>Guests</th><th>Hall</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeLeads.map(l => {
                    const st = STATUS_STYLE[l.status] || {};
                    return (
                      <tr key={l.id}>
                        <td style={{ fontWeight:600, color:'var(--color-text-h)' }}>{l.customer_name}</td>
                        <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{l.phone}</td>
                        <td>{l.event_type}</td>
                        <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{l.event_date || '—'}</td>
                        <td>{l.expected_guest_count}</td>
                        <td>{l.hall_name || '—'}</td>
                        <td><span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{STATUS_LABEL[l.status] || l.status}</span></td>
                        <td>
                          <Link href={`/leads/${l.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ color:'var(--color-accent)', fontSize:12, textDecoration:'none', fontWeight:600 }}>View →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
