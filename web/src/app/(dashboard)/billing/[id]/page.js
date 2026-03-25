'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import Badge from '@/components/ui/Badge';
import RazorpayButton from '@/components/shared/RazorpayButton';
import {
  ArrowLeft, RefreshCw, Loader2, AlertCircle, FileText, DollarSign,
  CreditCard, Plus, Send, Printer, Clock,
} from 'lucide-react';

const STATUS_V = { draft:'neutral', sent:'warning', partially_paid:'warning', paid:'green', overdue:'red', cancelled:'red' };
const STATUS_L = { draft:'Draft', sent:'Sent', partially_paid:'Partial', paid:'Paid', overdue:'Overdue', cancelled:'Cancelled' };
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmt     = n => '₹'+Number(n||0).toLocaleString('en-IN');
const PAYMENT_MODES = ['cash','upi','bank_transfer','cheque','card','other'];

function InfoRow({label,value,hl}){ return <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--color-border)',fontSize:13}}><span style={{color:'var(--color-text-muted)'}}>{label}</span><span style={{fontWeight:hl?700:500,color:hl?'#15803d':'var(--color-text-body)'}}>{value||'—'}</span></div>; }

export default function InvoiceDetailPage(){
  const router=useRouter(); const params=useParams(); const sp=useSearchParams();
  const {userProfile}=useAuth();
  const fid=sp?.get('franchise_id')||userProfile?.franchise_id||'pfd';
  const bid=sp?.get('branch_id')||userProfile?.branch_id||'pfd_b1';
  const id=params?.id;

  const [inv,setInv]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [dialog,setDialog]=useState(null);
  const [payForm,setPayForm]=useState({amount:'',date:'',mode:'cash',ref:'',received_by:'',note:''});

  const show=(m,err)=>{setToast({m,err});setTimeout(()=>setToast(null),4000);};
  const closeD=()=>setDialog(null);

  const fetchI=useCallback(async()=>{
    if(!id) return; setLoading(true); setError(null);
    try{ const r=await fetch(`/api/billing/${id}`);const d=await r.json(); if(!r.ok) throw new Error(d.error); setInv(d.invoice); }
    catch(e){setError(e.message);} finally{setLoading(false);}
  },[id]);
  useEffect(()=>{fetchI();},[fetchI]);

  async function doAction(body){
    setSaving(true);
    try{
      const r=await fetch(`/api/billing/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({franchise_id:fid,branch_id:bid,...body})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error);
      show(d.message); closeD(); fetchI();
    }catch(e){show(e.message,true);}finally{setSaving(false);}
  }

  const handlePay=()=>{if(!payForm.amount){show('Amount required',true);return;}doAction({action:'add_payment',amount:Number(payForm.amount),date:payForm.date,mode:payForm.mode,ref:payForm.ref,received_by:payForm.received_by,note:payForm.note});setPayForm({amount:'',date:'',mode:'cash',ref:'',received_by:'',note:''});};
  const handleSend=()=>doAction({action:'send'});

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,gap:12,color:'var(--color-text-muted)'}}><Loader2 size={24} style={{animation:'spin 1s linear infinite'}}/>Loading…</div>;
  if(error) return <div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-muted)'}}><AlertCircle size={40} style={{margin:'0 auto 12px',color:'#ef4444',opacity:.7}}/><p>{error}</p><button className="btn btn-ghost" onClick={fetchI}>Retry</button></div>;

  const i=inv;
  return(
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {toast&&<div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,background:toast.err?'#fee2e2':'#dcfce7',color:toast.err?'#991b1b':'#15803d',border:`1px solid ${toast.err?'#fca5a5':'#86efac'}`,boxShadow:'0 4px 16px rgba(0,0,0,.12)'}}>{toast.m}</div>}

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:20}}>
        <div className="page-header-left">
          <Link href="/billing" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'var(--color-text-muted)',marginBottom:8,textDecoration:'none'}}><ArrowLeft size={14}/>Invoices</Link>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <h1 style={{margin:0}}>{i.invoice_number}</h1>
            <Badge variant={STATUS_V[i.status]||'neutral'}>{STATUS_L[i.status]||i.status}</Badge>
          </div>
          <p style={{fontSize:13,color:'var(--color-text-muted)',marginTop:4}}>{i.customer_name} · {fmtDate(i.issue_date)}{i.due_date&&` · Due ${fmtDate(i.due_date)}`}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={fetchI} disabled={saving}><RefreshCw size={14}/></button>
          <button className="btn btn-outline btn-sm" onClick={()=>window.print()} title="Print or save as PDF"><Printer size={13}/>Print/PDF</button>
          {i.status==='draft'&&<button className="btn btn-outline btn-sm" onClick={handleSend} disabled={saving}><Send size={13}/>Mark Sent</button>}
          {i.booking_id&&<Link href={`/bookings/${i.booking_id}?franchise_id=${fid}&branch_id=${bid}`} className="btn btn-outline btn-sm" style={{textDecoration:'none'}}>Booking</Link>}
          {i.lead_id&&<Link href={`/leads/${i.lead_id}?franchise_id=${fid}&branch_id=${bid}`} className="btn btn-outline btn-sm" style={{textDecoration:'none'}}>Lead</Link>}
          {i.status!=='paid'&&i.status!=='cancelled'&&<button className="btn btn-primary btn-sm" onClick={()=>setDialog('pay')}><Plus size={13}/>Record Payment</button>}
          {i.status!=='paid'&&i.status!=='cancelled'&&i.balance>0&&(
            <RazorpayButton
              amount={i.balance}
              invoiceId={id}
              leadId={i.lead_id}
              customerName={i.customer_name}
              customerEmail={i.email}
              customerPhone={i.phone}
              description={`Payment for ${i.invoice_number}`}
              paymentType={i.amount_paid > 0 ? 'balance' : 'advance'}
              franchiseId={fid}
              branchId={bid}
              recordedByUid={userProfile?.uid}
              recordedByName={userProfile?.name}
              className="btn-sm"
              onSuccess={(paymentId) => { show(`✅ Payment successful! ID: ${paymentId}`); fetchI(); }}
              onError={(msg) => show(msg, true)}
            >
              Pay Online ₹{Number(i.balance).toLocaleString('en-IN')}
            </RazorpayButton>
          )}
        </div>
      </motion.div>

      {/* Print-only invoice header */}
      <div className="print-invoice-header">
        <div style={{marginBottom:30,paddingBottom:20,borderBottom:'2px solid #333'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:32,fontWeight:800,color:'#5b21b6',letterSpacing:'-1px',marginBottom:4}}>BanquetEase</div>
              <div style={{fontSize:13,color:'#444',marginBottom:16}}>Banquet Management System</div>
              <div style={{fontSize:12,color:'#000',lineHeight:1.7}}>
                <div><strong>Franchise:</strong> {fid.toUpperCase()}</div>
                <div><strong>Branch:</strong> {bid}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:28,fontWeight:700,marginBottom:8,color:'#000'}}>INVOICE</div>
              <div style={{fontSize:14,marginBottom:4,color:'#000'}}><strong>Invoice #:</strong> {i.invoice_number}</div>
              <div style={{fontSize:14,marginBottom:4,color:'#000'}}><strong>Date:</strong> {fmtDate(i.issue_date)}</div>
              {i.due_date&&<div style={{fontSize:14,marginBottom:4,color:'#000'}}><strong>Due Date:</strong> {fmtDate(i.due_date)}</div>}
              <div style={{fontSize:14,marginTop:8,padding:'4px 12px',background:'#e5e7eb',color:'#000',borderRadius:4,display:'inline-block',border:'1px solid #999'}}>{STATUS_L[i.status]||i.status}</div>
            </div>
          </div>
        </div>
        <div style={{marginBottom:30,padding:16,background:'#fff',border:'1px solid #999',borderRadius:8}}>
          <div style={{fontSize:11,color:'#333',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8,fontWeight:600}}>Bill To:</div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4,color:'#000'}}>{i.customer_name}</div>
          {i.phone&&<div style={{fontSize:13,color:'#000',marginBottom:2}}>Phone: {i.phone}</div>}
          {i.email&&<div style={{fontSize:13,color:'#000',marginBottom:2}}>Email: {i.email}</div>}
          {i.customer_address&&<div style={{fontSize:13,color:'#333',marginTop:4}}>{i.customer_address}</div>}
        </div>
      </div>

      {/* Summary card */}
      <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:20,background:i.balance<=0?'#f0fdf4':'#fffbeb',border:`1px solid ${i.balance<=0?'#86efac':'#fde68a'}`}}>
        <div style={{display:'flex',gap:32,fontSize:14,flexWrap:'wrap'}}>
          <span>Subtotal: <strong>{fmt(i.subtotal)}</strong></span>
          <span>Tax ({i.tax_rate}%): <strong>{fmt(i.tax_amount)}</strong></span>
          {i.discount>0&&<span>Discount: <strong style={{color:'#dc2626'}}>-{fmt(i.discount)}</strong></span>}
          <span style={{fontSize:16}}>Total: <strong>{fmt(i.total)}</strong></span>
          <span>Paid: <strong style={{color:'#16a34a'}}>{fmt(i.amount_paid)}</strong></span>
          <span>Balance: <strong style={{color:i.balance>0?'#dc2626':'#16a34a'}}>{fmt(i.balance)}</strong></span>
        </div>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Line items */}
        <motion.div variants={fadeUp} className="card" style={{padding:18}}>
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:12}}>Line Items</div>
          {(i.line_items||[]).length===0
            ?<p style={{fontSize:13,color:'var(--color-text-muted)'}}>No line items.</p>
            :<table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid var(--color-border)'}}><th style={{textAlign:'left',padding:'6px 0',color:'var(--color-text-muted)',fontSize:11,textTransform:'uppercase'}}>Description</th><th style={{textAlign:'right',padding:'6px 0',color:'var(--color-text-muted)',fontSize:11}}>Qty</th><th style={{textAlign:'right',padding:'6px 0',color:'var(--color-text-muted)',fontSize:11}}>Rate</th><th style={{textAlign:'right',padding:'6px 0',color:'var(--color-text-muted)',fontSize:11}}>Amount</th></tr></thead>
              <tbody>
                {i.line_items.map((li,idx)=>(
                  <tr key={idx} style={{borderBottom:'1px solid var(--color-border)'}}>
                    <td style={{padding:'6px 0'}}>{li.description}</td>
                    <td style={{textAlign:'right',padding:'6px 0'}}>{li.quantity}</td>
                    <td style={{textAlign:'right',padding:'6px 0'}}>{fmt(li.rate)}</td>
                    <td style={{textAlign:'right',padding:'6px 0',fontWeight:600}}>{fmt(li.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </motion.div>

        {/* Customer + details */}
        <motion.div variants={fadeUp} className="card" style={{padding:18}}>
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:12}}>Details</div>
          <InfoRow label="Customer" value={i.customer_name}/>
          <InfoRow label="Phone" value={i.phone}/>
          <InfoRow label="Email" value={i.email}/>
          <InfoRow label="Issued" value={fmtDate(i.issue_date)}/>
          <InfoRow label="Due" value={fmtDate(i.due_date)}/>
          {i.paid_date&&<InfoRow label="Paid" value={fmtDate(i.paid_date)} hl/>}
          {i.notes&&<InfoRow label="Notes" value={i.notes}/>}
        </motion.div>
      </div>

      {/* Payment history */}
      <motion.div variants={fadeUp}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Payment History ({(i.payments||[]).length})</div>
        {(i.payments||[]).length===0
          ?<div className="card" style={{padding:'32px 16px',textAlign:'center',color:'var(--color-text-muted)'}}><CreditCard size={28} style={{margin:'0 auto 8px',opacity:.3}}/><p style={{fontSize:13}}>No payments yet.</p></div>
          :<div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[...(i.payments||[])].reverse().map((p,idx)=>(
              <div key={idx} className="card" style={{padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:14,color:'#16a34a'}}>{fmt(p.amount)}</div>
                  <div style={{fontSize:12,color:'var(--color-text-muted)'}}>{fmtDate(p.date)} · {p.mode?.replace(/_/g,' ')}{p.received_by&&` · by ${p.received_by}`}</div>
                  {p.ref&&<div style={{fontSize:11,color:'var(--color-text-muted)'}}>Ref: {p.ref}</div>}
                  {p.note&&<div style={{fontSize:11,color:'var(--color-text-muted)',fontStyle:'italic'}}>{p.note}</div>}
                </div>
                <Badge variant="green">Payment</Badge>
              </div>
            ))}
          </div>
        }
      </motion.div>

      {/* Print-only footer */}
      <div className="print-invoice-footer">
        <div style={{marginTop:40,paddingTop:20,borderTop:'1px solid #333',fontSize:12,color:'#000',textAlign:'center',lineHeight:1.8}}>
          <div style={{marginBottom:8,fontWeight:600}}>Thank you for your business!</div>
          <div>For any queries, please contact your branch manager.</div>
          <div style={{marginTop:12,fontSize:11,color:'#333'}}>
            This is a computer-generated invoice. Generated on {new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
          </div>
        </div>
      </div>

      {/* Payment dialog */}
      {dialog==='pay'&&<Dlg title="Record Payment" onClose={closeD}>
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:6,padding:'8px 12px',fontSize:12,color:'#1e40af',marginBottom:14}}>Balance: {fmt(i.balance)}</div>
        <FG><Fld l="Amount (₹) *"><input className="input" type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))}/></Fld><Fld l="Date"><input className="input" type="date" value={payForm.date} onChange={e=>setPayForm(p=>({...p,date:e.target.value}))}/></Fld><Fld l="Mode"><select className="input" value={payForm.mode} onChange={e=>setPayForm(p=>({...p,mode:e.target.value}))}>{PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}</select></Fld><Fld l="Ref #"><input className="input" value={payForm.ref} onChange={e=>setPayForm(p=>({...p,ref:e.target.value}))}/></Fld><Fld l="Received By"><input className="input" value={payForm.received_by} onChange={e=>setPayForm(p=>({...p,received_by:e.target.value}))}/></Fld><Fld l="Note" s><input className="input" value={payForm.note} onChange={e=>setPayForm(p=>({...p,note:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeD} onOk={handlePay} ok="Record Payment"/>
      </Dlg>}

      <style jsx>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        
        /* Hide print elements on screen */
        .print-invoice-header,
        .print-invoice-footer {
          display: none;
        }
        
        @media print {
          /* Show print-only elements */
          .print-invoice-header,
          .print-invoice-footer {
            display: block !important;
          }
          
          /* Hide navigation and actions */
          :global(.sidebar), :global(.page-actions), 
          :global(nav), :global(footer), :global(button),
          :global(a[href*="billing"]) {
            display: none !important;
          }
          
          /* Hide page header (use print header instead) */
          :global(.page-header) {
            display: none !important;
          }
          
          /* Page setup */
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          html, body {
            background: white !important;
            margin: 0;
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Remove shadows */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Cards - white background with dark text */
          :global(.card) {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            background: #fff !important;
            color: #000 !important;
          }
          
          :global(.card) div,
          :global(.card) span,
          :global(.card) p,
          :global(.card) td,
          :global(.card) th {
            color: #000 !important;
          }
          
          /* Grid layout - convert to block for print */
          div[style*="display:grid"] {
            display: block !important;
          }
          
          div[style*="display:grid"] > div {
            margin-bottom: 1.5rem;
            break-inside: avoid;
          }
          
          /* Tables - ensure text visibility */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            background: white !important;
          }
          
          table th {
            background: #e5e7eb !important;
            color: #000 !important;
            font-weight: 700;
            border: 1px solid #999 !important;
            padding: 10px 8px !important;
          }
          
          table td {
            background: white !important;
            color: #000 !important;
            border: 1px solid #999 !important;
            padding: 8px !important;
          }
          
          /* Badge styling for print */
          :global(.badge), div[style*="badge"] {
            border: 1px solid #333 !important;
            background: #f3f4f6 !important;
            color: #000 !important;
            padding: 3px 10px !important;
            border-radius: 4px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
          }
          
          /* Summary card - white bg with visible text */
          div[style*="background:#f0fdf4"], div[style*="background:#fffbeb"] {
            background: #fff !important;
            border: 2px solid #333 !important;
            padding: 20px !important;
            margin-bottom: 2rem !important;
            border-radius: 8px;
          }
          
          div[style*="background:#f0fdf4"] span, 
          div[style*="background:#fffbeb"] span {
            font-size: 13px !important;
            color: #000 !important;
          }
          
          div[style*="background:#f0fdf4"] strong, 
          div[style*="background:#fffbeb"] strong {
            color: #000 !important;
          }
          
          /* Payment history */
          div[style*="flexDirection:column"] > div {
            break-inside: avoid;
            margin-bottom: 0.5rem;
          }
          
          /* Avoid page breaks */
          h1, h2, h3, h4,
          div[style*="fontWeight:700"] {
            page-break-after: avoid;
          }
          
          /* Strong text */
          strong {
            font-weight: 700 !important;
          }
          
          /* Preserve important colors for amounts */
          div[style*="color:#16a34a"], 
          span[style*="color:#16a34a"],
          strong[style*="color:#16a34a"] {
            color: #059669 !important;
            font-weight: 700 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          span[style*="color:#dc2626"], 
          strong[style*="color:#dc2626"],
          div[style*="color:#991b1b"] {
            color: #dc2626 !important;
            font-weight: 700 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Footer text */
          div[style*="fontSize:11"] {
            font-size: 10px !important;
          }
          
          /* Spacing improvements */
          :global(.card) + :global(.card) {
            margin-top: 1rem;
          }
          
          /* Print header spacing */
          .print-invoice-header {
            margin-bottom: 2rem !important;
            background: white !important;
          }
          
          .print-invoice-header div {
            color: #000 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-invoice-header div[style*="color:#5b21b6"] {
            color: #5b21b6 !important;
          }
          
          .print-invoice-footer {
            margin-top: 2rem !important;
            background: white !important;
          }
          
          .print-invoice-footer div {
            color: #000 !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

function FG({children}){return <div className="form-grid" style={{marginBottom:12}}>{children}</div>;}
function Fld({l,s,children}){return <div className={`form-field${s?' form-span-2':''}`}><label className="form-label">{l}</label>{children}</div>;}
function DA({saving,onCancel,onOk,ok}){return <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button><button className="btn btn-primary" onClick={onOk} disabled={saving}>{saving?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:null}{ok}</button></div>;}
function Dlg({title,children,onClose}){return <div style={{position:'fixed',inset:0,zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}><div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}}/><div style={{position:'relative',background:'var(--color-bg-card)',borderRadius:12,padding:24,maxWidth:520,width:'92%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.25)',zIndex:1}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>{title}</h3>{children}</div></div>;}
