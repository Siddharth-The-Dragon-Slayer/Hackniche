'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { CalendarDays, CreditCard, Clock, MapPin, Users, Plus, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

// Simplified pipeline stages shown to customers
const CUSTOMER_STAGES = [
  { key: 'new',                label: 'Enquiry Received' },
  { key: 'visited',            label: 'Site Visit Done' },
  { key: 'tasting_done',       label: 'Tasting Done' },
  { key: 'menu_selected',      label: 'Menu Finalised' },
  { key: 'advance_paid',       label: 'Booking Confirmed' },
  { key: 'decoration_scheduled', label: 'Decor Planned' },
  { key: 'paid',               label: 'Fully Paid' },
  { key: 'completed',          label: 'Event Done' },
];
const STAGE_ORDER = CUSTOMER_STAGES.map(s => s.key);

const STATUS_STYLE = {
  new:                  { bg:'#dbeafe', color:'#1d4ed8' },
  visited:              { bg:'#ede9fe', color:'#6d28d9' },
  tasting_scheduled:    { bg:'#fef3c7', color:'#d97706' },
  tasting_done:         { bg:'#fde68a', color:'#b45309' },
  menu_selected:        { bg:'#d1fae5', color:'#065f46' },
  advance_paid:         { bg:'#ecfdf5', color:'#059669' },
  decoration_scheduled: { bg:'#e0f2fe', color:'#0369a1' },
  paid:                 { bg:'#dcfce7', color:'#16a34a' },
  in_progress:          { bg:'#fef3c7', color:'#b45309' },
  completed:            { bg:'#f0fdf4', color:'#15803d' },
  closed:               { bg:'#f1f5f9', color:'#475569' },
  lost:                 { bg:'#fee2e2', color:'#991b1b' },
};

function statusLabel(s) {
  const m = { new:'Enquiry Received', visited:'Site Visited', tasting_scheduled:'Tasting Scheduled', tasting_done:'Tasting Done', menu_selected:'Menu Finalised', advance_paid:'Booking Confirmed', decoration_scheduled:'Decor Planned', paid:'Fully Paid', in_progress:'In Progress', completed:'Event Done', closed:'Closed', lost:'Cancelled' };
  return m[s] || s;
}

function stageProgress(status) {
  const idx = STAGE_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function CustomerDashboard() {
  const { userProfile } = useAuth();
  const uid  = userProfile?.uid;
  const name = userProfile?.name || 'there';

  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    if (!uid) return;
    fetch(`/api/leads?customer_uid=${uid}`)
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [uid]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-poll every 30 s so customers see their booking confirmed status live.
  useEffect(() => {
    const id = setInterval(fetchLeads, 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const activeLeads    = leads.filter(l => !['closed','lost','completed'].includes(l.status));
  const completedLeads = leads.filter(l => l.status === 'completed' || l.status === 'closed');

  const today  = new Date();
  const in30   = new Date(); in30.setDate(today.getDate() + 30);
  const upcoming = leads.filter(l => {
    if (!l.event_date) return false;
    const d = new Date(l.event_date);
    return d >= today && d <= in30;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:700, color:'var(--color-text-h)' }}>Welcome back, {name}!</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:14, marginTop:4 }}>Track your event enquiries and bookings</p>
        </div>
        <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
          <Plus size={16} /> New Enquiry
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:32 }}>
        {[
          { icon:<CalendarDays size={20}/>, label:'Total Enquiries',  value: loading ? '...' : leads.length,          color:'var(--color-primary)' },
          { icon:<Clock size={20}/>,        label:'Active',           value: loading ? '...' : activeLeads.length,    color:'var(--color-accent)' },
          { icon:<CalendarDays size={20}/>, label:'Upcoming (30d)',   value: loading ? '...' : upcoming.length,       color:'var(--color-success)' },
          { icon:<CreditCard size={20}/>,   label:'Completed Events', value: loading ? '...' : completedLeads.length, color:'#64748b' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }} className="kpi-card">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-primary-ghost)', display:'flex', alignItems:'center', justifyContent:'center', color:kpi.color }}>{kpi.icon}</div>
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color:kpi.color }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Active Enquiries */}
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>My Active Enquiries</h2>
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[1,2].map(i => <div key={i} style={{ height:120, borderRadius:14, background:'var(--color-surface-2)', animation:'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : activeLeads.length === 0 ? (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <p style={{ color:'var(--color-text-muted)', marginBottom:16 }}>No active enquiries yet.</p>
          <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration:'none' }}>Submit Your First Enquiry</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:32 }}>
          {activeLeads.map((lead, idx) => {
            const st = STATUS_STYLE[lead.status] || {};
            const progress = stageProgress(lead.status);
            const pct = Math.round((progress / (STAGE_ORDER.length - 1)) * 100);
            return (
              <motion.div key={lead.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.08 }} className="card" style={{ padding:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, gap:8, flexWrap:'wrap' }}>
                  <div>
                    <h3 style={{ fontSize:16, fontWeight:700, color:'var(--color-text-h)', marginBottom:4 }}>{lead.event_type}</h3>
                    <div style={{ display:'flex', gap:12, fontSize:13, color:'var(--color-text-muted)', flexWrap:'wrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><CalendarDays size={12}/> {lead.event_date || '--'}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={12}/> {lead.expected_guest_count} guests</span>
                      {lead.hall_name && <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={12}/> {lead.hall_name}</span>}
                    </div>
                  </div>
                  <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>
                    {statusLabel(lead.status)}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--color-text-muted)', marginBottom:4 }}>
                    <span>Enquiry</span><span>Booking</span><span>Event</span>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--color-primary-ghost)' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:'var(--gradient-bar)', borderRadius:3, transition:'width 0.5s' }} />
                  </div>
                </div>

                {/* Mini pipeline dots */}
                <div style={{ display:'flex', gap:4, alignItems:'center', overflowX:'auto', paddingBottom:4 }}>
                  {CUSTOMER_STAGES.map((stage, i) => {
                    const done = i <= progress;
                    const current = i === progress;
                    return (
                      <div key={stage.key} style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        {i > 0 && <div style={{ width:16, height:2, background: done ? 'var(--color-primary)' : 'var(--color-border)' }} />}
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          {done
                            ? <CheckCircle2 size={14} style={{ color: current ? 'var(--color-primary)' : 'var(--color-success)' }} />
                            : <Circle size={14} style={{ color:'var(--color-border)' }} />
                          }
                          {current && <span style={{ fontSize:9, color:'var(--color-primary)', fontWeight:700, whiteSpace:'nowrap' }}>{stage.label}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {lead.assigned_to_name && (
                  <div style={{ marginTop:12, fontSize:12, color:'var(--color-text-muted)', paddingTop:12, borderTop:'1px solid var(--color-border)' }}>
                    Your point of contact: <strong style={{ color:'var(--color-text-h)' }}>{lead.assigned_to_name}</strong>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed/Past Events */}
      {completedLeads.length > 0 && (
        <>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--color-text-h)', marginBottom:16 }}>Past Events</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16, marginBottom:32 }}>
            {completedLeads.map(lead => (
              <div key={lead.id} className="card" style={{ padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'var(--color-text-h)' }}>{lead.event_type}</h3>
                  <span style={{ background:'#f0fdf4', color:'#15803d', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:700 }}>Done</span>
                </div>
                <div style={{ fontSize:13, color:'var(--color-text-muted)', display:'flex', flexDirection:'column', gap:4 }}>
                  <span><CalendarDays size={12} style={{ display:'inline', marginRight:4 }}/>{lead.event_date}</span>
                  <span><Users size={12} style={{ display:'inline', marginRight:4 }}/>{lead.expected_guest_count} guests{lead.hall_name ? ' - ' + lead.hall_name : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA if no leads at all */}
      {!loading && leads.length === 0 && (
        <div className="card" style={{ padding:40, textAlign:'center', background:'var(--color-primary-ghost)' }}>
          <h3 style={{ fontSize:20, fontWeight:700, color:'var(--color-text-h)', marginBottom:8, fontFamily:'var(--font-display)' }}>Planning an Event?</h3>
          <p style={{ color:'var(--color-text-muted)', fontSize:14, maxWidth:400, margin:'0 auto 20px' }}>
            Submit an enquiry and our team will help you plan the perfect event at any of our venues.
          </p>
          <Link href="/leads/create" className="btn btn-primary" style={{ textDecoration:'none' }}>Submit an Enquiry →</Link>
        </div>
      )}
    </div>
  );
}
