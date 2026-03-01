'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import SearchRow from '@/components/ui/SearchRow';
import { Plus, Download, RefreshCw, Loader2, AlertCircle, Calendar, Users, Building2, CreditCard } from 'lucide-react';
import Link from 'next/link';

const STATUS_V = { confirmed:'green', in_progress:'primary', completed:'accent', cancelled:'red' };
const STATUS_L = { confirmed:'Confirmed', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
const TAB_GROUPS = [
  { key:'all', label:'All' },
  { key:'confirmed', label:'Confirmed', statuses:['confirmed'] },
  { key:'in_progress', label:'In Progress', statuses:['in_progress'] },
  { key:'completed', label:'Completed', statuses:['completed'] },
  { key:'cancelled', label:'Cancelled', statuses:['cancelled'] },
];
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmt     = n => '₹'+Number(n||0).toLocaleString('en-IN');

const columns = [
  { key:'customer_name', label:'Customer', render:(v,r)=><div><div style={{fontWeight:600,color:'var(--color-text-h)'}}>{v}</div><div style={{fontSize:11,color:'var(--color-text-muted)'}}>{r.phone}</div></div>},
  { key:'event_type', label:'Event', render:v=>v||'—' },
  { key:'event_date', label:'Date', render:v=>fmtDate(v) },
  { key:'hall_name', label:'Hall', render:v=>v||'—' },
  { key:'expected_guest_count', label:'Guests', render:v=>v||'—' },
  { key:'payments', label:'Paid / Total', render:v=>v?<span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{fmt(v.total_paid)} / {fmt(v.quote_total)}</span>:'—' },
  { key:'status', label:'Status', render:v=><Badge variant={STATUS_V[v]||'neutral'}>{STATUS_L[v]||v}</Badge> },
];

export default function BookingsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || 'pfd';
  const bid = userProfile?.branch_id || 'pfd_b1';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('all');

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    try {
      const r = await fetch(`/api/bookings?franchise_id=${fid}&branch_id=${bid}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setBookings(d.bookings || []);
    } catch (e) { if (!silent) setError(e.message); }
    finally { if (!silent) setLoading(false); }
  }, [fid, bid]);
  useEffect(() => { fetch_(); }, [fetch_]);

  // Auto-poll every 30 s — silently refresh so newly converted bookings
  // appear for every logged-in user without a manual refresh.
  useEffect(() => {
    const id = setInterval(() => fetch_(true), 30_000);
    return () => clearInterval(id);
  }, [fetch_]);

  const tabFiltered = bookings.filter(b => {
    if (tab === 'all') return true;
    const g = TAB_GROUPS.find(t => t.key === tab);
    return g?.statuses?.includes(b.status);
  });
  const filtered = tabFiltered.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.customer_name?.toLowerCase().includes(q) || b.phone?.includes(q) || b.hall_name?.toLowerCase().includes(q) || b.event_type?.toLowerCase().includes(q);
  });
  const tabs = TAB_GROUPS.map(g => ({
    key: g.key, label: g.label,
    count: g.key === 'all' ? bookings.length : bookings.filter(b => g.statuses?.includes(b.status)).length,
  }));

  // KPI summary
  const confirmed  = bookings.filter(b => b.status === 'confirmed').length;
  const inProgress = bookings.filter(b => b.status === 'in_progress').length;
  const totalRev   = bookings.reduce((s, b) => s + (b.payments?.total_paid || 0), 0);
  const totalBal   = bookings.reduce((s, b) => s + (b.payments?.balance_due || 0), 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:24}}>
        <div className="page-header-left">
          <h1>Bookings</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:14}}>
            {loading ? 'Loading…' : `${bookings.length} total · ${confirmed} confirmed · ${inProgress} in progress`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetch_} disabled={loading}><RefreshCw size={14}/>Refresh</button>
          <Link href="/bookings/create" className="btn btn-primary btn-sm" style={{textDecoration:'none'}}><Plus size={14}/>New Booking</Link>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          { label:'Confirmed',   val:confirmed,                icon:<Calendar size={14}/> },
          { label:'In Progress', val:inProgress,               icon:<Building2 size={14}/> },
          { label:'Revenue',     val:fmt(totalRev),            icon:<CreditCard size={14}/> },
          { label:'Outstanding', val:fmt(totalBal),            icon:<CreditCard size={14}/>, warn:totalBal>0 },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px'}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:k.warn?'#dc2626':'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>{k.icon}{k.val}</div>
          </div>
        ))}
      </motion.div>

      {error && <motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={15}/>{error}</motion.div>}

      <motion.div variants={fadeUp}><SearchRow placeholder="Search by name, phone, hall, event…" value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:0}}/></motion.div>
      <motion.div variants={fadeUp}><Tabs tabs={tabs} activeTab={tab} onChange={setTab}/></motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={filtered} keyField="id" loading={loading}
          emptyMessage={search?'No bookings match.':'No bookings yet.'}
          onRowClick={row=>router.push(`/bookings/${row.id}?franchise_id=${fid}&branch_id=${bid}`)}
          mobileRender={row=>(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <div><div style={{fontWeight:600,fontSize:14}}>{row.customer_name}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{row.phone}</div></div>
                <Badge variant={STATUS_V[row.status]||'neutral'}>{STATUS_L[row.status]||row.status}</Badge>
              </div>
              <div style={{display:'flex',gap:12,fontSize:12,color:'var(--color-text-muted)',flexWrap:'wrap'}}>
                <span>🎉 {row.event_type||'—'}</span><span><Calendar size={11}/> {fmtDate(row.event_date)}</span>
                <span><Users size={11}/> {row.expected_guest_count||'?'}</span>
                <span style={{fontWeight:500}}>{fmt(row.payments?.total_paid||0)} / {fmt(row.payments?.quote_total||0)}</span>
              </div>
            </div>
          )}/>
      </motion.div>
    </motion.div>
  );
}
