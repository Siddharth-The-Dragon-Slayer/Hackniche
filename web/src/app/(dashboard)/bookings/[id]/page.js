'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import Badge from '@/components/ui/Badge';
import RazorpayButton from '@/components/shared/RazorpayButton';
import EMIPanel from '@/components/shared/EMIPanel';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { onSnapshot, collection, query, where, getDocs, doc as fireDoc } from 'firebase/firestore';
import {
  ArrowLeft, RefreshCw, Loader2, AlertCircle, Calendar, Users,
  Building2, CreditCard, Plus, Trash2, CheckCircle2, PlayCircle,
  CheckSquare, UserPlus, Truck, FileText, DollarSign, Clock,
  Phone, Mail, MapPin, Image as ImageIcon, ShieldAlert,
} from 'lucide-react';

const STATUS_V = { confirmed:'green', in_progress:'primary', completed:'accent', cancelled:'red' };
const STATUS_L = { confirmed:'Confirmed', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
const fmtDate  = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDT    = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const fmt      = n => '₹'+Number(n||0).toLocaleString('en-IN');
const PAYMENT_MODES = ['cash','upi','bank_transfer','cheque','card','other'];

function InfoRow({label,value,hl}){ return <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--color-border)',fontSize:13}}><span style={{color:'var(--color-text-muted)'}}>{label}</span><span style={{fontWeight:hl?700:500,color:hl?'#15803d':'var(--color-text-body)'}}>{value||'—'}</span></div>; }

export default function BookingDetailPage(){
  const router = useRouter();
  const params = useParams();
  const sp     = useSearchParams();
  const {userProfile} = useAuth();
  const fid = sp?.get('franchise_id') || userProfile?.franchise_id || 'pfd';
  const bid = sp?.get('branch_id')    || userProfile?.branch_id    || 'pfd_b1';
  const id  = params?.id;

  const [bk,setBk]         = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError]     = useState(null);
  const [saving,setSaving]   = useState(false);
  const [toast,setToast]     = useState(null);
  const [tab,setTab]         = useState('overview');
  const [dialog,setDialog]   = useState(null);
  const [staffList,setStaffList] = useState([]);

  /* ── dialog forms ── */
  const [payForm,setPayForm] = useState({amount:'',date:'',mode:'cash',ref:'',note:''});
  const [chkForm,setChkForm] = useState({task:'',assigned_to:'',due_date:''});
  const [vndForm,setVndForm] = useState({vendor_name:'',vendor_type:'',cost:'',contact_phone:'',notes:''});
  const [stfForm,setStfForm] = useState({name:'',role:''});

  const show = (m,err) => { setToast({m,err}); setTimeout(()=>setToast(null),4000); };
  const closeD = () => setDialog(null);

  const fetchB = useCallback(async()=>{
    if(!id) return; setLoading(true); setError(null);
    try{
      const r=await fetch(`/api/bookings/${id}`);const d=await r.json();
      if(!r.ok) throw new Error(d.error);
      setBk(d.booking);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[id]);
  useEffect(()=>{fetchB();},[fetchB]);

  /* ── Load staff for dropdowns ── */
  useEffect(()=>{
    if(!bid) return;
    getDocs(query(collection(db,'users'),where('branch_id','==',bid)))
      .then(s=>setStaffList(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||'').localeCompare(b.name||''))))
      .catch(()=>{});
  },[bid]);

  async function doAction(body){
    setSaving(true);
    try{
      const r=await fetch(`/api/bookings/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({franchise_id:fid,branch_id:bid,...body})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error);
      show(d.message); closeD(); fetchB();
    }catch(e){show(e.message,true);}finally{setSaving(false);}
  }

  /* handlers */
  const handlePay=()=>{if(!payForm.amount){show('Amount required',true);return;}doAction({action:'add_payment',amount:Number(payForm.amount),date:payForm.date,mode:payForm.mode,ref:payForm.ref,note:payForm.note});setPayForm({amount:'',date:'',mode:'cash',ref:'',note:''});};
  const handleChk=()=>{if(!chkForm.task){show('Task required',true);return;}doAction({action:'add_checklist_item',...chkForm});setChkForm({task:'',assigned_to:'',due_date:''});};
  const handleVnd=()=>{if(!vndForm.vendor_name){show('Name required',true);return;}doAction({action:'add_vendor',...vndForm,cost:Number(vndForm.cost||0)});setVndForm({vendor_name:'',vendor_type:'',cost:'',contact_phone:'',notes:''});};
  const handleStf=()=>{if(!stfForm.name){show('Name required',true);return;}doAction({action:'assign_staff',...stfForm});setStfForm({name:'',role:''});};

  const handleCreateInvoice = async()=>{
    setSaving(true);
    try{
      const r=await fetch('/api/billing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({franchise_id:fid,branch_id:bid,booking_id:id})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error);
      show(`Invoice ${d.invoice_number} created`);
      router.push(`/billing/${d.invoice_id}?franchise_id=${fid}&branch_id=${bid}`);
    }catch(e){show(e.message,true);}finally{setSaving(false);}
  };

  const handleSendReminder = async()=>{
    setSaving(true);
    try{
      const r=await fetch('/api/payments/send-balance-reminder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({booking_id:id,franchise_id:fid,branch_id:bid})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error);
      show(`✅ Reminder sent! Email: ${d.results?.email}`);
    }catch(e){show(e.message,true);}finally{setSaving(false);}
  };

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,gap:12,color:'var(--color-text-muted)'}}><Loader2 size={24} style={{animation:'spin 1s linear infinite'}}/>Loading…</div>;
  if(error) return <div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-muted)'}}><AlertCircle size={40} style={{margin:'0 auto 12px',color:'#ef4444',opacity:.7}}/><p>{error}</p><button className="btn btn-ghost" onClick={fetchB}>Retry</button></div>;

  const b=bk;
  const pay=b.payments||{};
  const TABS=[
    {key:'overview',  label:'Overview',  icon:<FileText size={13}/>},
    {key:'payments',  label:'Payments',  icon:<CreditCard size={13}/>,count:pay.payment_history?.length||0},
    {key:'emi',       label:'EMI',       icon:<DollarSign size={13}/>,count:b.emi_plan?.installments?.filter(i=>i.status==='paid').length||0},
    {key:'checklist', label:'Checklist', icon:<CheckSquare size={13}/>,count:b.checklist?.length||0},
    {key:'vendors',   label:'Vendors',   icon:<Truck size={13}/>,count:b.vendors?.length||0},
    {key:'staff',     label:'Staff',     icon:<UserPlus size={13}/>,count:b.staff_assigned?.length||0},
    {key:'gallery',   label:'Photo Gallery', icon:<ImageIcon size={13}/>},
  ];

  return(
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {toast&&<div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,background:toast.err?'#fee2e2':'#dcfce7',color:toast.err?'#991b1b':'#15803d',border:`1px solid ${toast.err?'#fca5a5':'#86efac'}`,boxShadow:'0 4px 16px rgba(0,0,0,.12)'}}>{toast.m}</div>}

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:20}}>
        <div className="page-header-left">
          <Link href="/bookings" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'var(--color-text-muted)',marginBottom:8,textDecoration:'none'}}><ArrowLeft size={14}/>Back to Bookings</Link>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <h1 style={{margin:0}}>{b.customer_name}</h1>
            <Badge variant={STATUS_V[b.status]||'neutral'}>{STATUS_L[b.status]||b.status}</Badge>
          </div>
          <p style={{fontSize:13,color:'var(--color-text-muted)',marginTop:4}}>🎉 {b.event_type||'Event'} · {fmtDate(b.event_date)} · {b.expected_guest_count||'?'} guests{b.hall_name&&` · ${b.hall_name}`}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={fetchB} disabled={saving}><RefreshCw size={14}/></button>
          {b.lead_id&&<Link href={`/leads/${b.lead_id}?franchise_id=${fid}&branch_id=${bid}`} className="btn btn-outline btn-sm" style={{textDecoration:'none'}}>View Lead</Link>}
          {b.status==='confirmed'&&<button className="btn btn-primary btn-sm" onClick={()=>doAction({action:'update_status',new_status:'in_progress'})} disabled={saving}><PlayCircle size={13}/>Start Event</button>}
          {b.status==='in_progress'&&<button className="btn btn-primary btn-sm" onClick={()=>doAction({action:'update_status',new_status:'completed'})} disabled={saving}><CheckCircle2 size={13}/>Complete</button>}
          <button className="btn btn-accent btn-sm" onClick={handleCreateInvoice} disabled={saving}><FileText size={13}/>Invoice</button>
          {pay.balance_due>0&&<button className="btn btn-outline btn-sm" onClick={handleSendReminder} disabled={saving}><Mail size={13}/>Send Reminder</button>}
          {pay.balance_due>0&&(
            <RazorpayButton
              amount={pay.balance_due}
              invoiceId={b.invoice_id}
              leadId={b.lead_id||id}
              customerName={b.customer_name}
              customerEmail={b.email}
              customerPhone={b.phone}
              description={`${b.event_type||'Event'} — ${b.customer_name}`}
              paymentType={pay.total_paid>0?'balance':'advance'}
              franchiseId={fid}
              branchId={bid}
              recordedByUid={userProfile?.uid}
              recordedByName={userProfile?.name}
              className="btn-sm"
              onSuccess={(pid)=>{show(`✅ Payment successful! ID: ${pid}`);fetchB();}}
              onError={(msg)=>show(msg,true)}
            >
              Pay ₹{Number(pay.balance_due).toLocaleString('en-IN')}
            </RazorpayButton>
          )}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          {label:'Quote',val:fmt(pay.quote_total),icon:<DollarSign size={14}/>},
          {label:'Paid',val:fmt(pay.total_paid),icon:<CreditCard size={14}/>},
          {label:'Balance',val:fmt(pay.balance_due),icon:<Clock size={14}/>,warn:pay.balance_due>0},
          {label:'Checklist',val:`${(b.checklist||[]).filter(c=>c.status==='done').length}/${(b.checklist||[]).length}`,icon:<CheckSquare size={14}/>},
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px'}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:k.warn?'#dc2626':'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>{k.icon}{k.val}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} style={{display:'flex',gap:2,borderBottom:'1px solid var(--color-border)',marginBottom:20,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'9px 13px',fontSize:13,fontWeight:tab===t.key?700:400,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap',borderBottom:tab===t.key?'2px solid var(--color-primary)':'2px solid transparent',color:tab===t.key?'var(--color-primary)':'var(--color-text-muted)'}}>
            {t.icon}{t.label}{t.count>0&&<span style={{background:'var(--color-border)',borderRadius:10,padding:'1px 6px',fontSize:10}}>{t.count}</span>}
          </button>
        ))}
      </motion.div>

      {/* ═══ OVERVIEW ═══ */}
      {tab==='overview'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>
          <div className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>Customer</div>
            <InfoRow label="Name" value={b.customer_name}/>
            <InfoRow label="Phone" value={b.phone}/>
            <InfoRow label="Email" value={b.email}/>
          </div>
          <div className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>Event</div>
            <InfoRow label="Type" value={b.event_type}/>
            <InfoRow label="Date" value={fmtDate(b.event_date)}/>
            <InfoRow label="Time" value={b.event_start_time&&b.event_end_time?`${b.event_start_time} – ${b.event_end_time}`:'—'}/>
            <InfoRow label="Hall" value={b.hall_name}/>
            <InfoRow label="Guests" value={b.final_guest_count||b.expected_guest_count}/>
          </div>
          {b.menu&&<div className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>Menu</div>
            <InfoRow label="Name" value={b.menu.name}/><InfoRow label="₹/Plate" value={fmt(b.menu.per_plate_cost)}/><InfoRow label="Plates" value={b.menu.plates}/><InfoRow label="Total" value={fmt(b.menu.total)} hl/>
          </div>}
          {b.decor&&<div className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>Decoration</div>
            <InfoRow label="Theme" value={b.decor.theme}/><InfoRow label="Partner" value={b.decor.partner}/><InfoRow label="Cost" value={fmt(b.decor.cost)} hl/>
          </div>}
          {b.notes&&<div className="card" style={{padding:18,gridColumn:'span 2'}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>Notes</div>
            <p style={{fontSize:13,color:'var(--color-text-body)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{b.notes}</p>
          </div>}
        </div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {tab==='payments'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600}}>Payment History ({pay.payment_history?.length||0})</div>
            <div style={{display:'flex',gap:8}}>
              {pay.balance_due>0&&(
                <RazorpayButton
                  amount={pay.balance_due}
                  invoiceId={b.invoice_id}
                  leadId={b.lead_id||id}
                  customerName={b.customer_name}
                  customerEmail={b.email}
                  customerPhone={b.phone}
                  description={`${b.event_type||'Event'} — ${b.customer_name}`}
                  paymentType={pay.total_paid>0?'balance':'advance'}
                  franchiseId={fid}
                  branchId={bid}
                  recordedByUid={userProfile?.uid}
                  recordedByName={userProfile?.name}
                  className="btn-sm"
                  onSuccess={(pid)=>{show(`✅ Payment successful! ID: ${pid}`);fetchB();}}
                  onError={(msg)=>show(msg,true)}
                >
                  Pay Online ₹{Number(pay.balance_due).toLocaleString('en-IN')}
                </RazorpayButton>
              )}
              <button className="btn btn-outline btn-sm" onClick={()=>setDialog('pay')}><Plus size={13}/>Record Cash/UPI</button>
            </div>
          </div>
          <div className="card" style={{padding:16,marginBottom:16,background:'#f0fdf4',border:'1px solid #86efac'}}>
            <div style={{display:'flex',gap:24,fontSize:13,flexWrap:'wrap'}}>
              <span>Quote: <strong>{fmt(pay.quote_total)}</strong></span>
              <span>Paid: <strong style={{color:'#16a34a'}}>{fmt(pay.total_paid)}</strong></span>
              <span>Balance: <strong style={{color:pay.balance_due>0?'#dc2626':'#16a34a'}}>{fmt(pay.balance_due)}</strong></span>
            </div>
          </div>
          {(pay.payment_history||[]).length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:'var(--color-text-muted)'}}><CreditCard size={32} style={{margin:'0 auto 10px',opacity:.3}}/><p>No payments recorded yet.</p></div>
            :<div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[...(pay.payment_history||[])].reverse().map((p,i)=>(
                <div key={i} className="card" style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:'#16a34a'}}>{fmt(p.amount)}</div>
                    <div style={{fontSize:12,color:'var(--color-text-muted)'}}>{fmtDate(p.date)} · {p.mode?.replace(/_/g,' ')} · {p.type}</div>
                    {p.ref&&<div style={{fontSize:11,color:'var(--color-text-muted)'}}>Ref: {p.ref}</div>}
                  </div>
                  <Badge variant={p.type==='advance'?'warning':'green'}>{p.type}</Badge>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ═══ EMI ═══ */}
      {tab==='emi'&&(
        <EMIPanel
          booking={b}
          bookingId={id}
          franchiseId={fid}
          branchId={bid}
          userProfile={userProfile}
          onRefresh={fetchB}
        />
      )}

      {/* ═══ CHECKLIST ═══ */}
      {tab==='checklist'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600}}>Checklist ({(b.checklist||[]).filter(c=>c.status==='done').length}/{(b.checklist||[]).length})</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setDialog('chk')}><Plus size={13}/>Add Task</button>
          </div>
          {(b.checklist||[]).length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:'var(--color-text-muted)'}}><CheckSquare size={32} style={{margin:'0 auto 10px',opacity:.3}}/><p>No checklist items yet.</p></div>
            :<div style={{display:'flex',flexDirection:'column',gap:6}}>
              {(b.checklist||[]).map(c=>(
                <div key={c.id} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,opacity:c.status==='done'?.7:1}}>
                  <button style={{background:'none',border:'none',cursor:'pointer',fontSize:18,lineHeight:1}} onClick={()=>doAction({action:'toggle_checklist',item_id:c.id})} disabled={saving}>{c.status==='done'?'✅':'⬜'}</button>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:13,textDecoration:c.status==='done'?'line-through':'none'}}>{c.task}</div>
                    <div style={{fontSize:11,color:'var(--color-text-muted)'}}>{c.assigned_to&&`→ ${c.assigned_to}`} {c.due_date&&`• Due ${fmtDate(c.due_date)}`}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{color:'#dc2626'}} onClick={()=>doAction({action:'remove_checklist_item',item_id:c.id})} disabled={saving}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ═══ VENDORS ═══ */}
      {tab==='vendors'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600}}>Vendors ({(b.vendors||[]).length})</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setDialog('vnd')}><Plus size={13}/>Add Vendor</button>
          </div>
          {(b.vendors||[]).length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:'var(--color-text-muted)'}}><Truck size={32} style={{margin:'0 auto 10px',opacity:.3}}/><p>No vendors assigned yet.</p></div>
            :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {(b.vendors||[]).map(v=>(
                <div key={v.id} className="card" style={{padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div><div style={{fontWeight:600,fontSize:14}}>{v.vendor_name}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{v.vendor_type}</div></div>
                    <button className="btn btn-ghost btn-sm" style={{color:'#dc2626'}} onClick={()=>doAction({action:'remove_vendor',vendor_id:v.id})} disabled={saving}><Trash2 size={12}/></button>
                  </div>
                  <div style={{fontSize:12,color:'var(--color-text-muted)',marginTop:6}}>
                    {v.cost>0&&<span>Cost: {fmt(v.cost)} </span>}
                    {v.contact_phone&&<span>· <Phone size={10}/> {v.contact_phone}</span>}
                  </div>
                  {v.notes&&<div style={{fontSize:11,color:'var(--color-text-muted)',marginTop:3}}>{v.notes}</div>}
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ═══ STAFF ═══ */}
      {tab==='staff'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:600}}>Staff Assigned ({(b.staff_assigned||[]).length})</div>
            <button className="btn btn-primary btn-sm" onClick={()=>setDialog('stf')}><Plus size={13}/>Assign Staff</button>
          </div>
          {(b.staff_assigned||[]).length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:'var(--color-text-muted)'}}><UserPlus size={32} style={{margin:'0 auto 10px',opacity:.3}}/><p>No staff assigned.</p></div>
            :<div style={{display:'flex',flexDirection:'column',gap:6}}>
              {(b.staff_assigned||[]).map((s,i)=>(
                <div key={i} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div><div style={{fontWeight:600,fontSize:14}}>{s.name}</div><div style={{fontSize:12,color:'var(--color-text-muted)'}}>{s.role}</div></div>
                  <button className="btn btn-ghost btn-sm" style={{color:'#dc2626'}} onClick={()=>doAction({action:'remove_staff',name:s.name})} disabled={saving}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* ═══ GALLERY ═══ */}
      {tab==='gallery' && <GalleryTab bookingId={b.booking_id || id} />}

      {/* ══════ DIALOGS ══════ */}
      {dialog==='pay'&&<Dlg title="Record Payment" onClose={closeD}>
        <FG><Fld l="Amount (₹) *"><input className="input" type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))}/></Fld><Fld l="Date"><input className="input" type="date" value={payForm.date} onChange={e=>setPayForm(p=>({...p,date:e.target.value}))}/></Fld><Fld l="Mode"><select className="input" value={payForm.mode} onChange={e=>setPayForm(p=>({...p,mode:e.target.value}))}>{PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}</select></Fld><Fld l="Ref #"><input className="input" value={payForm.ref} onChange={e=>setPayForm(p=>({...p,ref:e.target.value}))}/></Fld><Fld l="Note" s><input className="input" value={payForm.note} onChange={e=>setPayForm(p=>({...p,note:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeD} onOk={handlePay} ok="Record"/>
      </Dlg>}
      {dialog==='chk'&&<Dlg title="Add Checklist Item" onClose={closeD}>
        <FG><Fld l="Task *" s><input className="input" value={chkForm.task} onChange={e=>setChkForm(p=>({...p,task:e.target.value}))}/></Fld><Fld l="Assigned To">{staffList.length>0?<select className="input" value={chkForm.assigned_to} onChange={e=>setChkForm(p=>({...p,assigned_to:e.target.value}))}><option value="">Select staff…</option>{staffList.map(s=><option key={s.id} value={s.name}>{s.name} ({s.role?.replace(/_/g,' ')||'Staff'})</option>)}</select>:<input className="input" value={chkForm.assigned_to} onChange={e=>setChkForm(p=>({...p,assigned_to:e.target.value}))} placeholder="Staff name"/>}</Fld><Fld l="Due Date"><input className="input" type="date" value={chkForm.due_date} onChange={e=>setChkForm(p=>({...p,due_date:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeD} onOk={handleChk} ok="Add"/>
      </Dlg>}
      {dialog==='vnd'&&<Dlg title="Add Vendor" onClose={closeD}>
        <FG><Fld l="Name *"><input className="input" value={vndForm.vendor_name} onChange={e=>setVndForm(p=>({...p,vendor_name:e.target.value}))}/></Fld><Fld l="Type"><input className="input" placeholder="Florist, Caterer…" value={vndForm.vendor_type} onChange={e=>setVndForm(p=>({...p,vendor_type:e.target.value}))}/></Fld><Fld l="Cost (₹)"><input className="input" type="number" value={vndForm.cost} onChange={e=>setVndForm(p=>({...p,cost:e.target.value}))}/></Fld><Fld l="Phone"><input className="input" value={vndForm.contact_phone} onChange={e=>setVndForm(p=>({...p,contact_phone:e.target.value}))}/></Fld><Fld l="Notes" s><input className="input" value={vndForm.notes} onChange={e=>setVndForm(p=>({...p,notes:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeD} onOk={handleVnd} ok="Add Vendor"/>
      </Dlg>}
      {dialog==='stf'&&<Dlg title="Assign Staff" onClose={closeD}>
        <FG><Fld l="Staff *">{staffList.length>0?<select className="input" value={stfForm.name} onChange={e=>{const s=staffList.find(x=>x.name===e.target.value);setStfForm({name:e.target.value,role:s?.role||''});}}><option value="">Select staff…</option>{staffList.map(s=><option key={s.id} value={s.name}>{s.name} ({s.role?.replace(/_/g,' ')||'Staff'})</option>)}</select>:<input className="input" value={stfForm.name} onChange={e=>setStfForm(p=>({...p,name:e.target.value}))} placeholder="Staff name"/>}</Fld><Fld l="Role"><input className="input" placeholder="Manager, Chef…" value={stfForm.role} onChange={e=>setStfForm(p=>({...p,role:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeD} onOk={handleStf} ok="Assign"/>
      </Dlg>}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

/* Tiny reusable dialog helpers */
function FG({children}){return <div className="form-grid" style={{marginBottom:12}}>{children}</div>;}
function Fld({l,s,children}){return <div className={`form-field${s?' form-span-2':''}`}><label className="form-label">{l}</label>{children}</div>;}
function DA({saving,onCancel,onOk,ok}){return <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={onOk} disabled={saving}>{saving?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:null}{ok}</button></div>;}
function Dlg({title,children,onClose}){return <div style={{position:'fixed',inset:0,zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}><div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}}/><div style={{position:'relative',background:'var(--color-bg-card)',borderRadius:12,padding:24,maxWidth:520,width:'92%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.25)',zIndex:1}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>{title}</h3>{children}</div></div>;}

function GalleryTab({ bookingId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    // Real-time listener for photos subcollection
    const photosRef = collection(db, 'bookings', bookingId, 'photos');
    const q = query(photosRef);
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                           .sort((a,b) => (b.uploaded_at || '').localeCompare(a.uploaded_at || ''));
      
      // Notify admin if a NEW flagged photo is detected
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newPhoto = change.doc.data();
          if (newPhoto.status === 'flagged') {
            console.log("🚩 [AI OVERSIGHT] Flagged image received by Admin:", {
              id: change.doc.id,
              url: newPhoto.url,
              reason: newPhoto.ai_result?.reason,
              recommendation: newPhoto.ai_result?.recommendation
            });
            toast.error(`AI OVERSIGHT: New flagged photo detected! Reason: ${newPhoto.ai_result?.reason || 'Policy violation'}`, {
              duration: 8000,
              position: 'top-right',
            });
          } else {
            toast.success(`New photo uploaded by ${newPhoto.uploader_name || 'a guest'}`);
          }
        }
      });

      setPhotos(pData);
      setLoading(false);
    }, (err) => {
      console.error("Gallery listener failed:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  const handleAction = async (photoId, action) => {
    setActing(photoId);
    try {
      const res = await fetch(`/api/gallery/${bookingId}/photos/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error('Action failed');
      // No need to call fetchPhotos() here, onSnapshot handles the real-time update
    } catch (err) {
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0' }}><Loader2 className="animate-spin inline mr-2" />Loading gallery...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Guest Photo Gallery ({photos.length})</h3>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>AI Oversight is active. Check flagged items below.</p>
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '2px dashed var(--color-border)', borderRadius: 12 }}>
          <ImageIcon size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ color: 'var(--color-text-muted)' }}>No photos uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {photos.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', border: p.status === 'flagged' ? '2px solid #ef4444' : '1px solid var(--color-border)' }}>
              <div style={{ position: 'relative', aspectHeight: '4/3' }}>
                <img src={p.thumbnail_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                {p.status === 'flagged' && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldAlert size={12} /> AI FLAG: {p.ai_result?.recommendation?.toUpperCase() || 'REVIEW'}
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>By {p.uploader_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{new Date(p.uploaded_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={p.status === 'approved' ? 'green' : p.status === 'flagged' ? 'red' : 'neutral'}>
                    {p.status}
                  </Badge>
                </div>

                {p.ai_result && (
                  <div style={{ fontSize: 11, background: 'var(--color-bg-alt)', padding: 8, borderRadius: 6, marginBottom: 12, borderLeft: `3px solid ${p.ai_flagged ? '#ef4444' : '#22c55e'}` }}>
                    <strong>AI Note:</strong> {p.ai_result.reason}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {p.status !== 'approved' && (
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ flex: 1, fontSize: 11 }}
                      onClick={() => handleAction(p.id, 'approve')}
                      disabled={acting === p.id}
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1, fontSize: 11, color: '#dc2626' }}
                    onClick={() => handleAction(p.id, 'delete')}
                    disabled={acting === p.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

