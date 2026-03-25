'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Brain, AlertTriangle, Flame, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

const SENTIMENT_COLORS = { positive:'#10b981', neutral:'#f59e0b', negative:'#ef4444', unknown:'#94a3b8' };
const SCORE_COLORS = { '0–20':'#ef4444','21–40':'#f97316','41–60':'#f59e0b','61–80':'#3b82f6','81–100':'#10b981' };
const MOOD_STYLE = { positive: { bg:'#f0fdf4', border:'#86efac', icon:'🟢' }, neutral: { bg:'#fefce8', border:'#fde68a', icon:'🟡' }, warning: { bg:'#fff1f2', border:'#fecdd3', icon:'🔴' } };

export default function SalesExecutiveAIAnalytics() {
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id = userProfile?.branch_id || 'pfd_b1';
  const uid = userProfile?.uid;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/ai-insights?franchise_id=${franchise_id}&branch_id=${branch_id}&uid=${uid || ''}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) { 
      setError(e.message); 
    }
    finally { setLoading(false); }
  }, [franchise_id, branch_id, uid]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'100px 20px', minHeight:'500px' }}>
      <div style={{ textAlign:'center' }}>
        <Loader2 size={40} style={{ margin:'0 auto 16px', animation:'spin 1s linear infinite', color:'var(--color-primary)' }} />
        <p style={{ color:'var(--color-text-muted)', fontSize:13 }}>Loading AI insights...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding:'40px 20px', textAlign:'center', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:8, color:'#991b1b', fontSize:13 }}>
      <AlertTriangle style={{ margin:'0 auto 8px', display:'block' }} size={24} />
      <p style={{ margin:0, marginBottom:12, fontWeight:600 }}>Error Loading Data</p>
      <p style={{ margin:0, marginBottom:16, fontSize:12 }}>{error}</p>
      <button onClick={load} style={{ padding:'8px 16px', background:'#991b1b', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:12, fontWeight:600 }}>Retry</button>
    </div>
  );

  if (!data) return (
    <div style={{ padding:'40px 20px', textAlign:'center', background:'var(--color-subtle)', borderRadius:8, color:'var(--color-text-muted)', fontSize:13 }}>
      <p>No data available. Please try refreshing.</p>
      <button onClick={load} style={{ marginTop:12, padding:'8px 16px', background:'var(--color-primary)', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:12, fontWeight:600 }}>Load Data</button>
    </div>
  );

  const { stats, narrative } = data;
  const mood = MOOD_STYLE[narrative?.mood || 'neutral'];

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1 style={{ display:'flex', alignItems:'center', gap:10, margin:'0 0 4px 0' }}><Brain size={22} style={{ color:'var(--color-primary)' }} /> AI Analytics</h1>
            <p style={{ margin:0, color:'var(--color-text-muted)', fontSize:13 }}>{userProfile?.branch_name || 'Branch'} — AI-powered lead intelligence</p>
          </div>
          <div className="page-actions">
            <button onClick={load} className="btn btn-ghost" style={{ display:'flex', alignItems:'center', gap:6 }}><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display:'flex', flexDirection:'column', gap:24 }}>
        {/* Narrative */}
        <motion.div variants={fadeUp} style={{ background:mood.bg, border:`1.5px solid ${mood.border}`, borderRadius:14, padding:'18px 22px', display:'flex', gap:14, alignItems:'flex-start' }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{mood.icon}</span>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>AI Pipeline Insight</span>
              <button onClick={load} title="Refresh" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', padding:2 }}><RefreshCw size={13} /></button>
            </div>
            <p style={{ margin:0, fontSize:13, color:'var(--color-text)', lineHeight:1.6 }}>{narrative?.narrative}</p>
            {narrative?.priority_action && <div style={{ fontSize:12, fontWeight:600, color:'var(--color-primary)' }}>▶ {narrative.priority_action}</div>}
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
          {[
            { label:'Total Leads', value:stats.total, color:'#6366f1' },
            { label:'Avg AI Score', value:`${stats.avgScore}/100`, color:'#3b82f6' },
            { label:'Hot Leads 🔥', value:stats.hotLeads.length, color:'#f59e0b' },
            { label:'At-Risk ⚠️', value:stats.atRiskLeads.length, color:'#ef4444' },
            { label:'Scored', value:stats.totalScored, color:'#10b981' },
          ].map((k, i) => (
            <div key={i} className="kpi-card" style={{ padding:'14px 16px' }}>
              <div className="kpi-label" style={{ marginBottom:4 }}>{k.label}</div>
              <div className="kpi-value" style={{ color:k.color, fontSize:22 }}>{k.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Score + Sentiment */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Lead Score Distribution</h4>
            {stats.scoreBuckets.every(b => b.count === 0) ? (
              <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No scored leads yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.scoreBuckets} barCategoryGap="25%">
                  <XAxis dataKey="range" tick={{ fontSize:11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v) => [v, 'Leads']} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {stats.scoreBuckets.map(b => <Cell key={b.range} fill={SCORE_COLORS[b.range] || '#6366f1'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Sentiment Breakdown</h4>
            {stats.sentimentBreakdown.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No sentiment data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.sentimentBreakdown} dataKey="count" nameKey="sentiment" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} label={({ sentiment, percent }) => `${sentiment} ${Math.round(percent*100)}%`} labelLine={false}>
                    {stats.sentimentBreakdown.map(s => <Cell key={s.sentiment} fill={SENTIMENT_COLORS[s.sentiment] || '#6366f1'} />)}
                  </Pie>
                  <Legend formatter={v => v.charAt(0).toUpperCase()+v.slice(1)} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Conversion + Funnel */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Conversion by Event Type</h4>
            {stats.conversionByEvent.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.conversionByEvent} barCategoryGap="30%">
                  <XAxis dataKey="event" tick={{ fontSize:10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} />
                  <Tooltip formatter={(v, n) => [v, n === 'total' ? 'Total' : 'Converted']} />
                  <Bar dataKey="total" fill="#e0e7ff" radius={[3,3,0,0]} name="total" />
                  <Bar dataKey="converted" fill="#6366f1" radius={[3,3,0,0]} name="converted" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:12 }}>Pipeline Funnel</h4>
            {stats.funnel.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--color-text-muted)', textAlign:'center', margin:'24px 0' }}>No data.</p>
            ) : (() => {
              const max = Math.max(...stats.funnel.map(f => f.count), 1);
              return <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {stats.funnel.map(f => (
                  <div key={f.status} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--color-text-muted)', width:108, flexShrink:0, textAlign:'right' }}>{f.label}</span>
                    <div style={{ flex:1, background:'var(--color-border)', borderRadius:4, height:16, overflow:'hidden' }}>
                      <div style={{ width:`${(f.count/max)*100}%`, height:'100%', background:'#6366f1', borderRadius:4, minWidth: f.count > 0 ? 4 : 0 }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--color-text-h)', width:24, textAlign:'right' }}>{f.count}</span>
                  </div>
                ))}
              </div>;
            })()}
          </motion.div>
        </div>

        {/* Risks */}
        {stats.topRisks.length > 0 && (
          <motion.div variants={fadeUp} className="card" style={{ padding:'18px 20px' }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:'var(--color-text-h)', marginBottom:16, display:'flex', alignItems:'center', gap:6 }}><AlertTriangle size={14} color="#f59e0b" /> Top Risk Factors</h4>
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

        {/* Hot Leads */}
        {stats.hotLeads.length > 0 && (
          <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:6 }}>
              <Flame size={14} color="#f59e0b" />
              <h4 style={{ margin:0, fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>Hot Leads — Score ≥ 80</h4>
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

        {/* At-Risk Leads */}
        {stats.atRiskLeads.length > 0 && (
          <motion.div variants={fadeUp} className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:6 }}>
              <AlertTriangle size={14} color="#ef4444" />
              <h4 style={{ margin:0, fontSize:13, fontWeight:700, color:'var(--color-text-h)' }}>At-Risk Leads</h4>
            </div>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Score</th><th>Sentiment</th><th>Top Risks</th><th></th></tr></thead>
              <tbody>
                {stats.atRiskLeads.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight:600, color:'var(--color-text-h)' }}>{l.name}</td>
                    <td style={{ fontSize:12 }}>{typeof l.score === 'number' ? l.score : '—'}</td>
                    <td><span style={{ background: l.sentiment==='negative' ? '#fee2e2' : '#fef3c7', color: l.sentiment==='negative' ? '#991b1b' : '#b45309', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{l.sentiment}</span></td>
                    <td style={{ fontSize:11, color:'var(--color-text-muted)' }}>{l.risks.length > 0 ? l.risks.slice(0,2).join('; ') : '—'}</td>
                    <td><Link href={`/leads/${l.id}`} style={{ fontSize:12, color:'var(--color-accent)', fontWeight:600, textDecoration:'none' }}>Open →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
