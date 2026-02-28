'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Target, Clock, CheckCircle2, TrendingUp, Phone, Calendar, ChevronRight, Loader2 } from 'lucide-react';

const PIPELINE_STATUSES   = ['new','visited','tasting_scheduled','tasting_done','menu_selected'];
const CLOSED_STATUSES     = ['advance_paid','decoration_scheduled','paid','in_progress','completed','settlement_pending','settlement_complete','feedback_pending','closed'];

const STATUS_STYLE = {
  new:               { bg:'#dbeafe', color:'#1d4ed8' },
  visited:           { bg:'#ede9fe', color:'#6d28d9' },
  tasting_scheduled: { bg:'#fef3c7', color:'#d97706' },
  tasting_done:      { bg:'#fde68a', color:'#b45309' },
  menu_selected:     { bg:'#d1fae5', color:'#065f46' },
  advance_paid:      { bg:'#ecfdf5', color:'#059669' },
  paid:              { bg:'#dcfce7', color:'#16a34a' },
  lost:              { bg:'#fee2e2', color:'#991b1b' },
};
const STATUS_LABEL = {
  new:'New', visited:'Visited', tasting_scheduled:'Tasting Sched.', tasting_done:'Tasting Done',
  menu_selected:'Menu Selected', advance_paid:'Advance Paid', paid:'Fully Paid', lost:'Lost',
};

const PIPELINE_COLS = [
  { key:'new',               label:'New',             color:'#6366f1' },
  { key:'visited',           label:'Visited',         color:'#8b5cf6' },
  { key:'tasting_scheduled', label:'Tasting Sched.',  color:'#f59e0b' },
  { key:'tasting_done',      label:'Tasting Done',    color:'#d97706' },
  { key:'menu_selected',     label:'Menu Selected',   color:'#10b981' },
];

export default function SalesExecutiveDashboard() {
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';
  const uid          = userProfile?.uid;
  const name         = userProfile?.name || 'there';

  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('mine');

  useEffect(() => {
    fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [franchise_id, branch_id]);

  const myLeads     = leads.filter(l => l.assigned_to_uid === uid);
  const shownLeads  = activeTab === 'mine' ? myLeads : leads;
  const pipelineLeads = shownLeads.filter(l => PIPELINE_STATUSES.includes(l.status));
  const closedLeads   = shownLeads.filter(l => CLOSED_STATUSES.includes(l.status));
  const lostLeads     = shownLeads.filter(l => l.status === 'lost');

  const convRate = shownLeads.length > 0
    ? Math.round((closedLeads.length / shownLeads.length) * 100)
    : 0;

  const kpis = [
    { icon:<Target size={20}/>,      label:'My Open Leads',     value: loading ? '…' : myLeads.filter(l => PIPELINE_STATUSES.includes(l.status)).length, color:'#6366f1' },
    { icon:<Clock size={20}/>,       label:'In Pipeline',       value: loading ? '…' : pipelineLeads.length, color:'#f59e0b' },
    { icon:<CheckCircle2 size={20}/>,label:'Closed (Won)',      value: loading ? '…' : closedLeads.length,   color:'#10b981' },
    { icon:<TrendingUp size={20}/>,  label:'Conversion Rate',   value: loading ? '…' : `${convRate}%`,       color:'#3b82f6' },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom:32 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Sales Dashboard</h1>
            <p>{userProfile?.branch_name || 'Branch'} — {name}</p>
          </div>
          <div className="page-actions">
            <Link href="/leads" className="btn btn-ghost" style={{ textDecoration:'none' }}>All Leads</Link>
            <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
              <Plus size={16} /> New Lead
            </Link>
          </div>
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

      {/* Tab toggle: My Leads vs All Branch Leads */}
      <motion.div variants={fadeUp} style={{ display:'flex', gap:4, borderBottom:'1px solid var(--color-border)', marginBottom:24 }}>
        {[['mine','My Leads'],['all','All Branch Leads']].map(([key,label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding:'10px 18px', fontSize:13, fontWeight: activeTab===key ? 700 : 400, background:'none', border:'none', cursor:'pointer', borderBottom: activeTab===key ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab===key ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            {label} {!loading && <span style={{ fontSize:11, opacity:0.7 }}>({activeTab===key ? (key==='mine' ? myLeads.length : leads.length) : (key==='mine' ? myLeads.length : leads.length)})</span>}
          </button>
        ))}
      </motion.div>

      {/* Pipeline Stage Summary Cards */}
      <motion.div variants={fadeUp} style={{ marginBottom:28 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'var(--color-text-h)', marginBottom:12 }}>Pipeline Breakdown</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10 }}>
          {PIPELINE_COLS.map(col => {
            const count = shownLeads.filter(l => l.status === col.key).length;
            return (
              <Link key={col.key} href={`/leads?status=${col.key}`}
                style={{ textDecoration:'none', background:'var(--color-surface)', border:`2px solid ${count > 0 ? col.color : 'var(--color-border)'}`, borderRadius:12, padding:'14px 16px', textAlign:'center', transition:'transform 0.1s', display:'block' }}>
                <div style={{ fontSize:24, fontWeight:800, color: count > 0 ? col.color : 'var(--color-text-muted)' }}>{loading ? '…' : count}</div>
                <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>{col.label}</div>
              </Link>
            );
          })}
          <div style={{ background:'var(--color-surface)', border:'2px solid var(--color-border)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:24, fontWeight:800, color:'#10b981' }}>{loading ? '…' : closedLeads.length}</div>
            <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>Won / Closed</div>
          </div>
          <div style={{ background:'var(--color-surface)', border:'2px solid var(--color-border)', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:24, fontWeight:800, color:'#ef4444' }}>{loading ? '…' : lostLeads.length}</div>
            <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>Lost</div>
          </div>
        </div>
      </motion.div>

      {/* Active Pipeline Leads */}
      <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--color-text-h)' }}>Open Pipeline ({pipelineLeads.length})</h3>
          <Link href="/leads" style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>View All →</Link>
        </div>
        {loading ? (
          <div style={{ padding:32, display:'flex', justifyContent:'center' }}>
            <Loader2 size={22} style={{ animation:'spin 1s linear infinite', color:'var(--color-text-muted)' }} />
          </div>
        ) : pipelineLeads.length === 0 ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--color-text-muted)', fontSize:13 }}>
            No open leads in pipeline. <Link href="/leads/create" style={{ color:'var(--color-primary)' }}>Create one →</Link>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th><th>Phone</th><th>Event</th><th>Event Date</th><th>Guests</th><th>Assigned To</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {pipelineLeads.map(l => {
                  const st = STATUS_STYLE[l.status] || {};
                  const isMine = l.assigned_to_uid === uid;
                  return (
                    <tr key={l.id} style={{ background: isMine ? 'var(--color-primary-ghost)' : undefined }}>
                      <td style={{ fontWeight:600, color:'var(--color-text-h)' }}>
                        {l.customer_name}
                        {isMine && <span style={{ marginLeft:6, fontSize:9, background:'#dbeafe', color:'#1d4ed8', borderRadius:8, padding:'1px 5px', fontWeight:700 }}>YOU</span>}
                      </td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{l.phone}</td>
                      <td>{l.event_type}</td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{l.event_date || '—'}</td>
                      <td>{l.expected_guest_count}</td>
                      <td style={{ fontSize:12 }}>{l.assigned_to_name || <span style={{ color:'var(--color-text-muted)', fontStyle:'italic' }}>Unassigned</span>}</td>
                      <td><span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{STATUS_LABEL[l.status] || l.status}</span></td>
                      <td>
                        <Link href={`/leads/${l.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ color:'var(--color-accent)', fontSize:12, textDecoration:'none', fontWeight:600 }}>Open →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
