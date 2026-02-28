'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Download, Search, RefreshCw, Phone, Calendar, Users, Building2, AlertCircle, Loader2 } from 'lucide-react';

// ── STATUS CONFIG ──────────────────────────────────────────────────────────
const STATUS_LABELS = {
  new: 'New', visited: 'Visited', tasting_scheduled: 'Tasting Sched.',
  tasting_done: 'Tasting Done', menu_selected: 'Menu Selected',
  advance_paid: 'Advance Paid', decoration_scheduled: 'Decor Sched.',
  paid: 'Fully Paid', in_progress: 'In Progress', completed: 'Completed',
  settlement_pending: 'Settlement', settlement_complete: 'Settled',
  feedback_pending: 'Feedback', closed: 'Closed', lost: 'Lost',
};

const STATUS_STYLE = {
  new:                   { bg: '#dbeafe', color: '#1d4ed8' },
  visited:               { bg: '#ede9fe', color: '#6d28d9' },
  tasting_scheduled:     { bg: '#fef3c7', color: '#d97706' },
  tasting_done:          { bg: '#fde68a', color: '#b45309' },
  menu_selected:         { bg: '#d1fae5', color: '#065f46' },
  advance_paid:          { bg: '#ecfdf5', color: '#059669' },
  decoration_scheduled:  { bg: '#e0f2fe', color: '#0369a1' },
  paid:                  { bg: '#dcfce7', color: '#16a34a' },
  in_progress:           { bg: '#fef9c3', color: '#a16207' },
  completed:             { bg: '#bbf7d0', color: '#15803d' },
  settlement_pending:    { bg: '#fed7aa', color: '#c2410c' },
  settlement_complete:   { bg: '#d1fae5', color: '#065f46' },
  feedback_pending:      { bg: '#e0e7ff', color: '#4338ca' },
  closed:                { bg: '#f0fdf4', color: '#166534' },
  lost:                  { bg: '#fee2e2', color: '#991b1b' },
};

const TAB_GROUPS = [
  { key: 'all',       label: 'All' },
  { key: 'new',       label: 'New' },
  { key: 'active',    label: 'Active', statuses: ['visited','tasting_scheduled','tasting_done','menu_selected','advance_paid','decoration_scheduled'] },
  { key: 'paid',      label: 'Paid',   statuses: ['paid','in_progress'] },
  { key: 'done',      label: 'Done',   statuses: ['completed','settlement_pending','settlement_complete','feedback_pending','closed'] },
  { key: 'lost',      label: 'Lost' },
];

const CAN_CREATE = ['receptionist','sales_executive','branch_manager','franchise_admin','super_admin'];

export default function LeadsPage() {
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';
  const role         = userProfile?.role         || 'guest';

  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setLeads(data.leads || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [franchise_id, branch_id]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter(l => {
    const grp = TAB_GROUPS.find(g => g.key === activeTab);
    const matchesTab = activeTab === 'all' ? true
      : grp?.statuses ? grp.statuses.includes(l.status)
      : l.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      l.customer_name?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.event_type?.toLowerCase().includes(q) ||
      l.hall_name?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const tabCounts = TAB_GROUPS.map(g => ({
    ...g,
    count: g.key === 'all' ? leads.length
      : g.statuses ? leads.filter(l => g.statuses.includes(l.status)).length
      : leads.filter(l => l.status === g.key).length,
  }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Leads</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {loading ? 'Loading…' : `${leads.length} total · ${leads.filter(l=>l.status==='new').length} new · ${leads.filter(l=>l.status==='closed').length} closed`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchLeads} disabled={loading}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />} Refresh
          </button>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          {CAN_CREATE.includes(role) && (
            <Link href="/leads/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <Plus size={14} /> New Lead
            </Link>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp} style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:8, color:'#991b1b', fontSize:13 }}>
          <AlertCircle size={15} /> {error}
          <button onClick={fetchLeads} style={{ marginLeft:'auto', fontSize:12, textDecoration:'underline', background:'none', border:'none', color:'#991b1b', cursor:'pointer' }}>Retry</button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} style={{ position:'relative', marginBottom:16 }}>
        <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
        <input className="input" placeholder="Search by name, phone, event type…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:36 }} />
      </motion.div>

      <motion.div variants={fadeUp} style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:20 }}>
        {tabCounts.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
            background: activeTab===t.key ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: activeTab===t.key ? '#fff' : 'var(--color-text-muted)', transition:'all 0.15s',
          }}>
            {t.label} {t.count > 0 && <span style={{ marginLeft:4, background: activeTab===t.key ? 'rgba(255,255,255,0.25)' : 'var(--color-border)', borderRadius:10, padding:'1px 7px', fontSize:11 }}>{t.count}</span>}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <motion.div variants={fadeUp} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ background:'var(--color-surface-2)', borderRadius:12, height:160, animation:'pulse 1.5s ease-in-out infinite' }} />)}
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} style={{ textAlign:'center', padding:'64px 0', color:'var(--color-text-muted)' }}>
          <Users size={40} style={{ margin:'0 auto 12px', opacity:0.3 }} />
          <p style={{ fontSize:15, fontWeight:600 }}>No leads found</p>
          <p style={{ fontSize:13, marginTop:4 }}>{search ? 'Try a different search term.' : 'Create your first lead to get started.'}</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.06, delayChildren:0.02 } } }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}
        >
          {filtered.map(lead => {
            const st = STATUS_STYLE[lead.status] || {};
            return (
              <motion.div key={lead.id} variants={fadeUp}
                style={{ background:'var(--color-surface)', borderRadius:12, border:'1px solid var(--color-border)', padding:20, cursor:'pointer', borderLeft:`4px solid ${st.color||'var(--color-border)'}` }}
                whileHover={{ boxShadow:'0 4px 20px rgba(0,0,0,0.10)' }}
              >
                <Link href={`/leads/${lead.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`} style={{ textDecoration:'none', color:'inherit' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--color-text-h)', marginBottom:2 }}>{lead.customer_name}</div>
                      <div style={{ fontSize:12, color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:4 }}><Phone size={11} /> {lead.phone}</div>
                    </div>
                    <span style={{ background:st.bg, color:st.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:12, color:'var(--color-text-muted)', marginBottom:12 }}>
                    <span>🎉 {lead.event_type || '—'}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={11} /> {lead.event_date || '—'}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={11} /> {lead.expected_guest_count || '—'} guests</span>
                    {lead.hall_name && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Building2 size={11} /> {lead.hall_name}</span>}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--color-border)', paddingTop:10 }}>
                    <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>{lead.assigned_to_name ? `Assigned: ${lead.assigned_to_name}` : 'Unassigned'}</span>
                    <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>{lead.budget_range ? `₹${lead.budget_range}` : 'Budget: —'}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
