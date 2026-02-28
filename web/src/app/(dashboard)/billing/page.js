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
import { RefreshCw, Loader2, AlertCircle, FileText, DollarSign, Clock, CreditCard, Printer, Eye } from 'lucide-react';

const STATUS_V = { draft:'neutral', sent:'warning', partially_paid:'warning', paid:'green', overdue:'red', cancelled:'red' };
const STATUS_L = { draft:'Draft', sent:'Sent', partially_paid:'Partial', paid:'Paid', overdue:'Overdue', cancelled:'Cancelled' };
const TAB_GROUPS = [
  { key:'all', label:'All' },
  { key:'draft', label:'Draft', statuses:['draft'] },
  { key:'unpaid', label:'Unpaid', statuses:['sent','partially_paid','overdue'] },
  { key:'paid', label:'Paid', statuses:['paid'] },
  { key:'cancelled', label:'Cancelled', statuses:['cancelled'] },
];
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmt     = n => '₹'+Number(n||0).toLocaleString('en-IN');

const makeColumns = (fid, bid, onPrint) => [
  { key:'invoice_number', label:'Invoice #', render:v=><span style={{fontFamily:'var(--font-mono)',fontWeight:600,fontSize:13}}>{v}</span>},
  { key:'customer_name', label:'Customer', render:(v,r)=><div><div style={{fontWeight:600}}>{v}</div>{r.phone&&<div style={{fontSize:11,color:'var(--color-text-muted)'}}>{r.phone}</div>}</div>},
  { key:'issue_date', label:'Date', render:v=>fmtDate(v) },
  { key:'total', label:'Total', render:v=>fmt(v) },
  { key:'amount_paid', label:'Paid', render:v=>fmt(v) },
  { key:'balance', label:'Balance', render:v=><span style={{color:v>0?'#dc2626':'#16a34a',fontWeight:600}}>{fmt(v)}</span>},
  { key:'due_date', label:'Due', render:v=>{ if(!v) return '—'; const od=new Date(v)<new Date(); return <span style={{color:od?'#dc2626':'inherit',fontWeight:od?600:400}}>{od?'⚠ ':''}{fmtDate(v)}</span>;}},
  { key:'status', label:'Status', render:v=><Badge variant={STATUS_V[v]||'neutral'}>{STATUS_L[v]||v}</Badge>},
  { 
    key:'actions', 
    label:'Actions', 
    render:(v,row)=>(
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <button 
          className="btn btn-ghost btn-xs" 
          onClick={(e)=>{e.stopPropagation();window.open(`/billing/${row.id}?franchise_id=${fid}&branch_id=${bid}`,'_blank');}}
          title="View invoice"
          style={{padding:'4px 8px'}}
        >
          <Eye size={14}/>
        </button>
        <button 
          className="btn btn-ghost btn-xs" 
          onClick={(e)=>{e.stopPropagation();onPrint(row.id);}}
          title="Print/PDF"
          style={{padding:'4px 8px'}}
        >
          <Printer size={14}/>
        </button>
      </div>
    )
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || 'pfd';
  const bid = userProfile?.branch_id    || 'pfd_b1';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('all');

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/billing?franchise_id=${fid}&branch_id=${bid}`);
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setInvoices(d.invoices || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [fid, bid]);
  useEffect(() => { fetch_(); }, [fetch_]);

  const tabF = invoices.filter(inv => {
    if (tab === 'all') return true;
    const g = TAB_GROUPS.find(t => t.key === tab);
    return g?.statuses?.includes(inv.status);
  });
  const filtered = tabF.filter(inv => {
    if (!search) return true;
    const q = search.toLowerCase();
    return inv.customer_name?.toLowerCase().includes(q) || inv.phone?.includes(q) || inv.invoice_number?.toLowerCase().includes(q);
  });
  const tabs = TAB_GROUPS.map(g => ({ key:g.key, label:g.label, count: g.key==='all' ? invoices.length : invoices.filter(i=>g.statuses?.includes(i.status)).length }));

  const totalRev     = invoices.reduce((s,i) => s + (i.amount_paid||0), 0);
  const totalBalance = invoices.reduce((s,i) => s + (i.balance||0), 0);
  const overdue      = invoices.filter(i => i.status==='overdue'||(['sent','partially_paid'].includes(i.status)&&i.due_date&&new Date(i.due_date)<new Date())).length;

  const handlePrint = (invoiceId) => {
    const url = `/billing/${invoiceId}?franchise_id=${fid}&branch_id=${bid}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  const columns = makeColumns(fid, bid, handlePrint);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:24}}>
        <div className="page-header-left">
          <h1>Billing & Invoices</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:14}}>{loading?'Loading…':`${invoices.length} invoices · ${overdue} overdue`}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetch_} disabled={loading}><RefreshCw size={14}/>Refresh</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          { label:'Total Revenue',   val:fmt(totalRev),     icon:<DollarSign size={14}/> },
          { label:'Outstanding',     val:fmt(totalBalance), icon:<Clock size={14}/>, warn:totalBalance>0 },
          { label:'Overdue',         val:overdue,           icon:<AlertCircle size={14}/>, warn:overdue>0 },
          { label:'Invoices',        val:invoices.length,   icon:<FileText size={14}/> },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px'}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:k.warn?'#dc2626':'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>{k.icon}{k.val}</div>
          </div>
        ))}
      </motion.div>

      {error&&<motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={15}/>{error}</motion.div>}

      <motion.div variants={fadeUp}><SearchRow placeholder="Search by invoice #, name, phone…" value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:0}}/></motion.div>
      <motion.div variants={fadeUp}><Tabs tabs={tabs} activeTab={tab} onChange={setTab}/></motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={filtered} keyField="id" loading={loading}
          emptyMessage={search?'No invoices match.':'No invoices yet. Create one from a booking.'}
          onRowClick={row=>router.push(`/billing/${row.id}?franchise_id=${fid}&branch_id=${bid}`)}
          mobileRender={row=>(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <div><div style={{fontWeight:600,fontSize:14}}>{row.invoice_number}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{row.customer_name}</div></div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <Badge variant={STATUS_V[row.status]||'neutral'}>{STATUS_L[row.status]||row.status}</Badge>
                  <button 
                    className="btn btn-ghost btn-xs" 
                    onClick={(e)=>{e.stopPropagation();handlePrint(row.id);}}
                    title="Print/PDF"
                    style={{padding:'4px'}}
                  >
                    <Printer size={14}/>
                  </button>
                </div>
              </div>
              <div style={{display:'flex',gap:12,fontSize:12,color:'var(--color-text-muted)'}}>
                <span>Total: {fmt(row.total)}</span><span>Paid: {fmt(row.amount_paid)}</span><span style={{color:row.balance>0?'#dc2626':'#16a34a',fontWeight:600}}>Bal: {fmt(row.balance)}</span>
              </div>
            </div>
          )}/>
      </motion.div>
    </motion.div>
  );
}
