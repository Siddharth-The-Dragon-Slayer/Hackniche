'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import Badge from '@/components/ui/Badge';
import { RefreshCw, Loader2, AlertCircle, CreditCard, DollarSign, Clock, TrendingUp } from 'lucide-react';

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmt     = n => '₹'+Number(n||0).toLocaleString('en-IN');

export default function PaymentsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || 'pfd';
  const bid = userProfile?.branch_id    || 'pfd_b1';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/billing?franchise_id=${fid}&branch_id=${bid}`);
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setInvoices(d.invoices || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [fid, bid]);
  useEffect(() => { fetch_(); }, [fetch_]);

  // Flatten all payments from all invoices
  const allPayments = invoices.flatMap(inv =>
    (inv.payments || []).map(p => ({ ...p, invoice_number: inv.invoice_number, invoice_id: inv.id, customer_name: inv.customer_name }))
  ).sort((a, b) => new Date(b.date || b.recorded_at || 0) - new Date(a.date || a.recorded_at || 0));

  const totalCollected = allPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0);
  const thisMonth = allPayments.filter(p => { const d = new Date(p.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
  const monthTotal = thisMonth.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:24}}>
        <div className="page-header-left">
          <h1>Payments</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:14}}>{loading?'Loading…':`${allPayments.length} payments across ${invoices.length} invoices`}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetch_} disabled={loading}><RefreshCw size={14}/>Refresh</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          { label:'Total Collected', val:fmt(totalCollected), icon:<DollarSign size={14}/> },
          { label:'Outstanding',     val:fmt(totalOutstanding), icon:<Clock size={14}/>, warn:totalOutstanding>0 },
          { label:'This Month',      val:fmt(monthTotal), icon:<TrendingUp size={14}/> },
          { label:'Transactions',    val:allPayments.length, icon:<CreditCard size={14}/> },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px'}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:k.warn?'#dc2626':'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>{k.icon}{k.val}</div>
          </div>
        ))}
      </motion.div>

      {error && <motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={15}/>{error}</motion.div>}

      <motion.div variants={fadeUp}>
        {allPayments.length===0
          ?<div style={{textAlign:'center',padding:'60px 0',color:'var(--color-text-muted)'}}><CreditCard size={40} style={{margin:'0 auto 12px',opacity:.3}}/><p style={{fontSize:15}}>No payments recorded yet.</p><p style={{fontSize:13}}>Payments will show here once invoices receive payments.</p></div>
          :<div style={{display:'flex',flexDirection:'column',gap:6}}>
            {allPayments.map((p,i)=>(
              <div key={i} className="card" style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>router.push(`/billing/${p.invoice_id}?franchise_id=${fid}&branch_id=${bid}`)}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:15,color:'#16a34a'}}>{fmt(p.amount)}</span>
                    <Badge variant="accent">{p.mode?.replace(/_/g,' ')||'cash'}</Badge>
                    {p.type&&<Badge variant="neutral">{p.type}</Badge>}
                  </div>
                  <div style={{fontSize:12,color:'var(--color-text-muted)',display:'flex',gap:10,flexWrap:'wrap'}}>
                    <span>{fmtDate(p.date)}</span>
                    <span>{p.customer_name}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11}}>{p.invoice_number}</span>
                    {p.ref&&<span>Ref: {p.ref}</span>}
                    {p.received_by&&<span>by {p.received_by}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </motion.div>
    </motion.div>
  );
}
