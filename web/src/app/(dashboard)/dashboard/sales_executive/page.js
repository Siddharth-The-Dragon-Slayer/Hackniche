'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import {
  Plus, Target, Clock, CheckCircle2, TrendingUp,
  Brain, AlertTriangle, Flame, RefreshCw, Loader2,
} from 'lucide-react';

const PIPELINE_STATUSES = ['new','visited','tasting_scheduled','tasting_done','menu_selected'];
const CLOSED_STATUSES   = ['advance_paid','decoration_scheduled','paid','in_progress','completed','settlement_pending','settlement_complete','feedback_pending','closed'];

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
  { key:'new',               label:'New',            color:'#6366f1' },
  { key:'visited',           label:'Visited',        color:'#8b5cf6' },
  { key:'tasting_scheduled', label:'Tasting Sched.', color:'#f59e0b' },
  { key:'tasting_done',      label:'Tasting Done',   color:'#d97706' },
  { key:'menu_selected',     label:'Menu Selected',  color:'#10b981' },
];
const SENTIMENT_COLORS = { positive:'#10b981', neutral:'#f59e0b', negative:'#ef4444', unknown:'#94a3b8' };
const SCORE_COLORS = { '0–20':'#ef4444','21–40':'#f97316','41–60':'#f59e0b','61–80':'#3b82f6','81–100':'#10b981' };
const MOOD_STYLE   = {
  positive:{ bg:'#f0fdf4', border:'#86efac', icon:'🟢' },
  neutral: { bg:'#fefce8', border:'#fde68a', icon:'🟡' },
  warning: { bg:'#fff1f2', border:'#fecdd3', icon:'🔴' },
};

// ── AI Insights panel ─────────────────────────────────────────────────────
function AIInsightsPanel({ franchise_id, branch_id, uid }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/leads/ai-insights?franchise_id=${franchise_id}&branch_id=${branch_id}&uid=${uid || ''}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) { setError(e.message); }
    finally    { setLoading(false); }
  }, [franchise_id, branch_id, uid]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
      <Loader2 size={28} style={{ animation:'spin 1s linear infinite', color:'var(--color-primary)' }} />
    </div>
  );
  if (error) return (
    <div style={{ padding:32, textAlign:'center', color:'#ef4444', fontSize:13 }}>
      Error: {error}
      <button onClick={load} style={{ marginLeft:8, background:'none', border:'none', color:'var(--color-primary)', cursor:'pointer', fontSize:13 }}>Retry</button>
    </div>
  );
  if (!data) return null;

  const { stats, narrative } = data;
  const mood = MOOD_STYLE[narrative?.mood || 'neutral'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Groq narrative card */}
      <motion.div variants={fadeUp} style={{ background:mood.bg, border:`1.5px solid ${mood.border}`, borderRadius:14, padding:'18px 22px', display:'flex', gap:14, alignItems:'flex-start' }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{mood.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>AI Pipeline Insight</span>
            <button onClick={load} title="Refresh" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', padding:2 }}>
              <RefreshCw size={13} />
            </button>
          </div>
          <p style={{ margin:0, fontSize:13, color:'var(--color-text)', lineHeight:1.6 }}>{narrative?.narrative}</p>
          {narrative?.priority_action && (
            <div style={{ marginTop:8, fontSize:12, fontWeight:600, color:'var(--color-primary)' }}>
              ▶ {narrative.priority_action}
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI strip */}
      <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
        {[
          { label:'Total Leads',  value:stats.total,               color:'#6366f1' },
          { label:'Avg AI Score', value:`${stats.avgScore}/100`,   color:'#3b82f6' },
          { label:'Hot Leads 🔥', value:stats.hotLeads.length,     color:'#f59e0b' },
          { label:'At-Risk ⚠️',   value:stats.atRiskLeads.length,  color:'#ef4444' },
          { label:'Scored',       value:stats.totalScored,         color:'#10b981' },
        ].map((k, i) => (
          <div key={i} className="kpi-card" style={{ padding:'14px 16px' }}>
            <div className="kpi-label" style={{ marginBottom:4 }}>{k.label}</div>
            <div className="kpi-value" style={{ color:k.color, fontSize:22 }}>{k.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Score distribution + Sentiment */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Lead Score Distribution</h4>
          {stats.scoreBuckets.every(b => b.count === 0)
            ? <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No scored leads yet.</p>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.scoreBuckets} barCategoryGap="25%">
                  <XAxis dataKey="range" tick={{ fontSize:11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v) => [v, 'Leads']} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {stats.scoreBuckets.map(b => <Cell key={b.range} fill={SCORE_COLORS[b.range] || '#6366f1'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </motion.div>

        <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Sentiment Breakdown</h4>
          {stats.sentimentBreakdown.length === 0
            ? <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No sentiment data.</p>
            : <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.sentimentBreakdown} dataKey="count" nameKey="sentiment"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}
                    label={({ sentiment, percent }) => `${sentiment} ${Math.round(percent*100)}%`}
                    labelLine={false}>
                    {stats.sentimentBreakdown.map(s => <Cell key={s.sentiment} fill={SENTIMENT_COLORS[s.sentiment] || '#6366f1'} />)}
                  </Pie>
                  <Legend formatter={v => v.charAt(0).toUpperCase()+v.slice(1)} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
          }
        </motion.div>
      </div>

      {/* Conversion by Event + Pipeline Funnel */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Conversion by Event Type</h4>
          {stats.conversionByEvent.length === 0
            ? <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No data.</p>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.conversionByEvent} barCategoryGap="30%">
                  <XAxis dataKey="event" tick={{ fontSize:10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v, n) => [v, n === 'total' ? 'Total' : 'Converted']} />
                  <Bar dataKey="total"     fill="#e0e7ff" radius={[3,3,0,0]} name="total" />
                  <Bar dataKey="converted" fill="#6366f1" radius={[3,3,0,0]} name="converted" />
                </BarChart>
              </ResponsiveContainer>
          }
        </motion.div>

        <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:12 }}>Pipeline Funnel</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {stats.funnel.length === 0
              ? <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No data.</p>
              : (() => {
                  const max = Math.max(...stats.funnel.map(f => f.count), 1);
                  return stats.funnel.map(f => (
                    <div key={f.status} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:11, color:'var(--color-text-muted)', width:108, flexShrink:0, textAlign:'right' }}>{f.label}</span>
                      <div style={{ flex:1, background:'var(--color-border)', borderRadius:4, height:16, overflow:'hidden' }}>
                        <div style={{ width:`${(f.count/max)*100}%`, height:'100%', background:'#6366f1', borderRadius:4, transition:'width 0.4s', minWidth: f.count > 0 ? 4 : 0 }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--color-text-h)', width:24, textAlign:'right' }}>{f.count}</span>
                    </div>
                  ));
                })()
            }
          </div>
        </motion.div>
      </div>

      {/* Top Risk Factors */}
      {stats.topRisks.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
          <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
            <AlertTriangle size={14} color="#f59e0b" /> Top Risk Factors Across Leads
          </h4>
          <ResponsiveContainer width="100%" height={Math.max(stats.topRisks.length * 36, 120)}>
            <BarChart data={stats.topRisks} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize:11 }} />
              <YAxis type="category" dataKey="factor" width={220} tick={{ fontSize:11 }} />
              <Tooltip formatter={(v) => [v, 'Leads']} />
              <Bar dataKey="count" fill="#f97316" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Hot Leads table */}
      {stats.hotLeads.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:6 }}>
            <Flame size={14} color="#f59e0b" />
            <h4 style={{ margin:0, fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>Hot Leads — Score ≥ 80, Not Yet Converted</h4>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Score</th><th>Label</th><th>Event</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {stats.hotLeads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600, color:'var(--color-text-h)' }}>{l.name}</td>
                  <td><span style={{ background:'#fef3c7', color:'#b45309', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{l.score}</span></td>
                  <td style={{ fontSize:11 }}>{l.label}</td>
                  <td style={{ fontSize:12 }}>{l.event}</td>
                  <td><span style={{ background:'#d1fae5', color:'#065f46', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{l.status}</span></td>
                  <td><Link href={`/leads/${l.id}`} style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>Open →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* At-Risk Leads table */}
      {stats.atRiskLeads.length > 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:6 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <h4 style={{ margin:0, fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>At-Risk Leads</h4>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Score</th><th>Sentiment</th><th>Risk Factors</th><th></th></tr></thead>
            <tbody>
              {stats.atRiskLeads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600, color:'var(--color-text-h)' }}>{l.name}</td>
                  <td style={{ fontSize:12 }}>{typeof l.score === 'number' ? l.score : '—'}</td>
                  <td>
                    <span style={{ background: l.sentiment==='negative' ? '#fee2e2' : '#fef3c7', color: l.sentiment==='negative' ? '#991b1b' : '#b45309', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>
                      {l.sentiment}
                    </span>
                  </td>
                  <td style={{ fontSize:11, color:'var(--color-text-muted)' }}>{l.risks.length > 0 ? l.risks.slice(0,2).join('; ') : '—'}</td>
                  <td><Link href={`/leads/${l.id}`} style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>Open →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function SalesExecutiveDashboard() {
  const { userProfile }     = useAuth();
  const franchise_id        = userProfile?.franchise_id || 'pfd';
  const branch_id           = userProfile?.branch_id    || 'pfd_b1';
  const uid                 = userProfile?.uid;
  const name                = userProfile?.name || 'there';

  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('mine');
  const [mainTab, setMainTab]     = useState('dashboard'); // 'dashboard' | 'ai_insights'

  const fetchLeads = useCallback(() => {
    fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [franchise_id, branch_id]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => {
    const id = setInterval(fetchLeads, 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const myLeads       = leads.filter(l => l.assigned_to_uid === uid);
  const shownLeads    = activeTab === 'mine' ? myLeads : leads;
  const pipelineLeads = shownLeads.filter(l => PIPELINE_STATUSES.includes(l.status));
  const closedLeads   = shownLeads.filter(l => CLOSED_STATUSES.includes(l.status));
  const lostLeads     = shownLeads.filter(l => l.status === 'lost');
  const convRate      = shownLeads.length > 0 ? Math.round((closedLeads.length / shownLeads.length) * 100) : 0;

  const kpis = [
    { icon:<Target size={20}/>,      label:'My Open Leads',   value: loading ? '…' : myLeads.filter(l => PIPELINE_STATUSES.includes(l.status)).length, color:'#6366f1' },
    { icon:<Clock size={20}/>,       label:'In Pipeline',     value: loading ? '…' : pipelineLeads.length, color:'#f59e0b' },
    { icon:<CheckCircle2 size={20}/>,label:'Closed (Won)',    value: loading ? '…' : closedLeads.length,   color:'#10b981' },
    { icon:<TrendingUp size={20}/>,  label:'Conversion Rate', value: loading ? '…' : `${convRate}%`,       color:'#3b82f6' },
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

      {/* Main tab bar */}
      <motion.div variants={fadeUp} style={{ display:'flex', gap:0, borderBottom:'2px solid var(--color-border)', marginBottom:28 }}>
        {[
          { key:'dashboard',   label:'Dashboard',   icon:<TrendingUp size={14}/> },
          { key:'ai_insights', label:'AI Insights', icon:<Brain size={14}/> },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => setMainTab(key)}
            style={{
              padding:'10px 20px', fontSize:13, fontWeight: mainTab===key ? 700 : 500,
              background:'none', border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              borderBottom: mainTab===key ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom:-2, color: mainTab===key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}>
            {icon} {label}
          </button>
        ))}
      </motion.div>

      {/* ── Dashboard Tab ─────────────────────────────────────────── */}
      {mainTab === 'dashboard' && (
        <>
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

          {/* Sub-tab: My Leads vs All Branch */}
          <motion.div variants={fadeUp} style={{ display:'flex', gap:4, borderBottom:'1px solid var(--color-border)', marginBottom:24 }}>
            {[['mine','My Leads'],['all','All Branch Leads']].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding:'10px 18px', fontSize:13, fontWeight: activeTab===key ? 700 : 400, background:'none', border:'none', cursor:'pointer', borderBottom: activeTab===key ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab===key ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {label} {!loading && <span style={{ fontSize:11, opacity:0.7 }}>({key==='mine' ? myLeads.length : leads.length})</span>}
              </button>
            ))}
          </motion.div>

          {/* Pipeline Breakdown */}
          <motion.div variants={fadeUp} style={{ marginBottom:28 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--color-text-h)', marginBottom:12 }}>Pipeline Breakdown</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10 }}>
              {PIPELINE_COLS.map(col => {
                const count = shownLeads.filter(l => l.status === col.key).length;
                return (
                  <Link key={col.key} href={`/leads?status=${col.key}`}
                    style={{ textDecoration:'none', background:'var(--color-surface)', border:`2px solid ${count > 0 ? col.color : 'var(--color-border)'}`, borderRadius:12, padding:'14px 16px', textAlign:'center', display:'block' }}>
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

          {/* Open Pipeline table */}
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
                No open leads. <Link href="/leads/create" style={{ color:'var(--color-primary)' }}>Create one →</Link>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Customer</th><th>Phone</th><th>Event</th><th>Event Date</th><th>Guests</th><th>Assigned To</th><th>Status</th><th></th></tr>
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
        </>
      )}

      {/* ── AI Insights Tab ────────────────────────────────────────── */}
      {mainTab === 'ai_insights' && (
        <AIInsightsPanel franchise_id={franchise_id} branch_id={branch_id} uid={uid} />
      )}
    </motion.div>
  );
}
