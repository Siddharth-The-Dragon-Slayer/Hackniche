'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft, Phone, Mail, Calendar, Users, Building2, RefreshCw,
  Loader2, AlertCircle, Trash2, MessageSquare, Plus, Save,
  Clock, Star, Activity, FileText, Bot, MapPin, ChevronRight,
  CheckCircle2, XCircle, PauseCircle, ArrowRightCircle, Edit3,
  DollarSign, UserCheck, Utensils, Palette, Zap, ReceiptText,
  PlayCircle, CheckSquare, CreditCard, Award, PhoneCall, Layers,
  TrendingUp, AlertTriangle, Sparkles, Shield, ThumbsUp, Minus,
  Send,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════
   STATUS CONFIG — matches API exactly
   Pipeline:  new → visited → tasting_scheduled → tasting_done →
              menu_selected → advance_paid → decoration_scheduled →
              paid → in_progress → completed → settlement_complete →
              closed   |  lost  |  on_hold
═══════════════════════════════════════════════════════════════════ */
const STATUS_VARIANT = {
  new:'primary', visited:'accent',
  tasting_scheduled:'warning', tasting_done:'accent',
  menu_selected:'green', advance_paid:'green',
  decoration_scheduled:'green', paid:'green',
  in_progress:'primary', completed:'green',
  settlement_complete:'warning', closed:'green',
  on_hold:'neutral', lost:'red',
};
const STATUS_LABELS = {
  new:'New Lead', visited:'Site Visited',
  tasting_scheduled:'Tasting Scheduled', tasting_done:'Tasting Done',
  menu_selected:'Menu & Quote Done', advance_paid:'Advance Paid',
  decoration_scheduled:'Decor Finalized', paid:'Fully Paid',
  in_progress:'Event Running', completed:'Event Completed',
  settlement_complete:'Settlement Done', closed:'Closed ✓',
  on_hold:'On Hold', lost:'Lost',
};

const PIPELINE = [
  { key:'new',                  label:'New Lead',          icon:'📞', desc:'Enquiry received' },
  { key:'visited',              label:'Site Visited',      icon:'🏛️', desc:'Property visit logged' },
  { key:'tasting_scheduled',    label:'Tasting Scheduled', icon:'📅', desc:'Food tasting booked' },
  { key:'tasting_done',         label:'Tasting Done',      icon:'🍽️', desc:'Tasting completed' },
  { key:'menu_selected',        label:'Menu & Quote',      icon:'🍲', desc:'Menu finalized, quote generated' },
  { key:'advance_paid',         label:'Advance Paid',      icon:'💰', desc:'Advance received, booking confirmed' },
  { key:'decoration_scheduled', label:'Decor Finalized',   icon:'🎨', desc:'Decoration & event details locked' },
  { key:'paid',                 label:'Fully Paid',        icon:'💳', desc:'Full payment received' },
  { key:'in_progress',          label:'Event Running',     icon:'🎉', desc:'Event day — in progress' },
  { key:'completed',            label:'Event Completed',   icon:'✅', desc:'Event executed' },
  { key:'settlement_complete',  label:'Settled',           icon:'🧾', desc:'Post-event settlement done' },
  { key:'closed',               label:'Closed',            icon:'🏆', desc:'Feedback collected, lead closed' },
];
const STAGE_KEYS = PIPELINE.map(s => s.key);

/* ── ROLE GROUPS ── */
const MGMT      = ['branch_manager','franchise_admin','super_admin'];
const SALES     = ['sales_executive','receptionist',...MGMT];
const KITCHEN   = ['kitchen_manager',...MGMT];
const OPS       = ['operations_staff',...MGMT];
const FINANCE   = ['accountant',...MGMT];
const ALL_STAFF = [...new Set([...SALES,...KITCHEN,...OPS,...FINANCE])];

/* ── STAGE → primary action map ── */
const STAGE_ACTION = {
  new:                  { action:'log_visit',           label:'Log Site Visit',         icon:<MapPin size={13}/>,       roles:SALES },
  visited:              { action:'schedule_tasting',    label:'Schedule Food Tasting',  icon:<Utensils size={13}/>,     roles:[...KITCHEN,...SALES] },
  tasting_scheduled:    { action:'complete_tasting',    label:'Complete Food Tasting',  icon:<CheckSquare size={13}/>,  roles:[...KITCHEN,'sales_executive',...MGMT] },
  tasting_done:         { action:'finalize_menu',       label:'Finalize Menu & Quote',  icon:<Layers size={13}/>,       roles:[...KITCHEN,...FINANCE,...SALES] },
  menu_selected:        { action:'record_advance',      label:'Record Advance Payment', icon:<CreditCard size={13}/>,   roles:[...FINANCE,'receptionist',...MGMT] },
  advance_paid:         { action:'finalize_decoration', label:'Finalize Decoration',    icon:<Palette size={13}/>,      roles:[...OPS,...MGMT] },
  decoration_scheduled: { action:'record_full_payment', label:'Record Full Payment',    icon:<ReceiptText size={13}/>,  roles:[...FINANCE,...MGMT] },
  paid:                 { action:'start_event',         label:'Start Event',            icon:<PlayCircle size={13}/>,   roles:[...OPS,...KITCHEN] },
  in_progress:          { action:'complete_event',      label:'Complete Event',         icon:<CheckCircle2 size={13}/>, roles:[...OPS,...KITCHEN] },
  completed:            { action:'settle_event',        label:'Post-Event Settlement',  icon:<DollarSign size={13}/>,   roles:[...FINANCE,...OPS] },
  settlement_complete:  { action:'close_lead',          label:'Close Lead & Feedback',  icon:<Award size={13}/>,        roles:SALES },
};

const FOLLOWUP_TYPES = ['Call','WhatsApp','Email','Site Visit','Meeting','Other'];
const PAYMENT_MODES  = ['cash','upi','bank_transfer','cheque','card','other'];
const PRIORITY_BADGE = { urgent:'red', high:'red', medium:'warning', low:'neutral' };

const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const fmt         = n => '₹'+Number(n||0).toLocaleString('en-IN');

function InfoRow({label,value,href,hl}){
  return(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--color-border)',fontSize:13}}>
      <span style={{color:'var(--color-text-muted)',flexShrink:0}}>{label}</span>
      {href?<a href={href} style={{color:'var(--color-primary)',fontWeight:500}}>{value||'—'}</a>
           :<span style={{color:hl?'#15803d':'var(--color-text-body)',fontWeight:hl?700:500}}>{value||'—'}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function LeadDetailPage(){
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const {userProfile}= useAuth();

  const franchise_id = searchParams?.get('franchise_id') || userProfile?.franchise_id || 'pfd';
  const branch_id    = searchParams?.get('branch_id')    || userProfile?.branch_id    || 'pfd_b1';
  const role         = userProfile?.role || 'guest';
  const leadId       = params?.id;

  const [lead,setLead]             = useState(null);
  const [activities,setActivities] = useState([]);
  const [followUps,setFollowUps]   = useState([]);
  const [loading,setLoading]       = useState(true);
  const [error,setError]           = useState(null);
  const [saving,setSaving]         = useState(false);
  const [toast,setToast]           = useState(null);
  const [tab,setTab]               = useState('overview');
  const [dialog,setDialog]         = useState(null);
  const [aiAnalyzing,setAiAnalyzing]= useState(false);
  const [waSending,setWaSending]    = useState(false);

  /* ── Reference data for dropdowns ── */
  const [halls,setHalls]         = useState([]);
  const [menus,setMenus]         = useState([]);
  const [staffList,setStaffList] = useState([]);
  const [vendors,setVendors]     = useState([]);
  const [decorPackages,setDecorPackages] = useState([]);

  /* ── Dialog form states ── */
  const [visitForm,setVisitForm]               = useState({visit_date:'',hall_id:'',hall_name:'',notes:'',customer_rating:'',visited_by:''});
  const [tastingSchForm,setTastingSchForm]      = useState({tasting_date:'',menu_options_to_present:'',notes:''});
  const [tastingDoneForm,setTastingDoneForm]    = useState({dishes_sampled:'',customer_feedback:'',preferred_menu:'',kitchen_manager:''});
  const [menuForm,setMenuForm]                  = useState({menu_name:'',per_plate_cost:'',expected_plates:'',hall_rent:'',decor_estimate:'',valid_till:''});
  const [advanceForm,setAdvanceForm]            = useState({advance_amount:'',payment_date:'',payment_mode:'cash',transaction_ref:'',confirmed_by:''});
  const [decorForm,setDecorForm]                = useState({final_guest_count:'',decor_theme:'',decor_partner:'',decor_cost:'',setup_date:'',teardown_date:'',special_requests:'',decor_package_id:'',decor_package_name:''});
  const [fullPayForm,setFullPayForm]            = useState({remaining_amount:'',payment_date:'',payment_mode:'cash',transaction_ref:''});
  const [completeEvtForm,setCompleteEvtForm]    = useState({actual_guest_count:'',start_time:'',end_time:'',problems_encountered:'',staff_feedback:'',photos_taken:''});
  const [settleForm,setSettleForm]              = useState({final_guest_count:'',final_plates_served:'',leftover_refund_amount:'',extra_charges_amount:'',extra_charges_reason:'',total_final_amount:'',amount_paid:'',final_settlement_amount:'',settled_date:''});
  const [closeForm,setCloseForm]                = useState({customer_rating:'',food_rating:'',ambiance_rating:'',service_rating:'',feedback_text:'',permission_for_testimonial:false,repeat_booking:false});
  const [fuForm,setFuForm]                      = useState({scheduled_date:'',followup_type:'Call',notes:''});
  const [lostForm,setLostForm]                  = useState({lost_reason:'',lost_detail:'',competitor_chosen:''});
  const [holdForm,setHoldForm]                  = useState({on_hold_reason:'',on_hold_until:''});
  const [statusOverride,setStatusOverride]      = useState({new_status:'',note:''});

  const showToast = (msg,isError)=>{setToast({msg,isError});setTimeout(()=>setToast(null),4500);};

  /* ── WhatsApp Update via WATI ── */
  const handleWhatsAppUpdate = async () => {
    setWaSending(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/whatsapp-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchise_id, branch_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp message');
      showToast(`✅ WhatsApp sent to ${lead?.phone || 'customer'}`);
    } catch(e) {
      showToast(e.message, true);
    } finally {
      setWaSending(false);
    }
  };

  /* ── AI Analysis ── */
  const handleAiAnalyze = async () => {
    setAiAnalyzing(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchise_id, branch_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');
      showToast('AI analysis complete!');
      fetchLead();
    } catch(e) {
      showToast(e.message, true);
    } finally {
      setAiAnalyzing(false);
    }
  };
  const closeDialog = ()=>setDialog(null);

  /* ── Fetch ── */
  const fetchLead = useCallback(async()=>{
    if(!leadId) return;
    setLoading(true);setError(null);
    try{
      const r=await fetch(`/api/leads/${leadId}?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Not found');
      setLead(d.lead);setActivities(d.activities||[]);setFollowUps(d.follow_ups||[]);
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  },[leadId,franchise_id,branch_id]);
  useEffect(()=>{fetchLead();},[fetchLead]);

  /* ── Load reference data for dropdowns ── */
  useEffect(()=>{
    if(!branch_id||!franchise_id) return;
    getDocs(query(collection(db,'halls'),where('branch_id','==',branch_id)))
      .then(s=>setHalls(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||'').localeCompare(b.name||''))))
      .catch(()=>{});
    getDocs(collection(db,'menus',franchise_id,'branches',branch_id,'menus'))
      .then(s=>setMenus(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.menu_name||a.name||'').localeCompare(b.menu_name||b.name||''))))
      .catch(()=>{});
    getDocs(query(collection(db,'users'),where('branch_id','==',branch_id)))
      .then(s=>setStaffList(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||'').localeCompare(b.name||''))))
      .catch(()=>{});
    getDocs(query(collection(db,'vendors'),where('branch_id','==',branch_id)))
      .then(s=>setVendors(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||a.company_name||'').localeCompare(b.name||b.company_name||''))))
      .catch(()=>{});
    getDocs(query(collection(db,'decor'),where('franchise_id','==',franchise_id),where('status','==','active')))
      .then(s=>setDecorPackages(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||'').localeCompare(b.name||''))))
      .catch(()=>{});
  },[branch_id,franchise_id]);

  /* ── Auto-fill dialog forms when opened ── */
  useEffect(()=>{
    if(!dialog||!lead) return;
    const today=new Date().toISOString().split('T')[0];
    const now=new Date().toISOString().slice(0,16);
    const uName=userProfile?.name||'';
    const l=lead;
    switch(dialog){
      case 'log_visit':
        setVisitForm({visit_date:now,hall_id:l.hall_id||'',hall_name:l.hall_name||'',notes:'',customer_rating:'',visited_by:uName});
        break;
      case 'schedule_tasting':
        setTastingSchForm({tasting_date:'',menu_options_to_present:'',notes:''});
        break;
      case 'complete_tasting':
        setTastingDoneForm({dishes_sampled:'',customer_feedback:'',preferred_menu:'',kitchen_manager:role==='kitchen_manager'?uName:''});
        break;
      case 'finalize_menu':
        setMenuForm({menu_name:l.food_tasting?.preferred_menu||'',per_plate_cost:'',expected_plates:l.expected_guest_count?String(l.expected_guest_count):'',hall_rent:'',decor_estimate:'',valid_till:''});
        break;
      case 'record_advance':
        setAdvanceForm({advance_amount:'',payment_date:today,payment_mode:'cash',transaction_ref:'',confirmed_by:uName});
        break;
      case 'finalize_decoration':
        setDecorForm({final_guest_count:l.expected_guest_count?String(l.expected_guest_count):'',decor_theme:'',decor_partner:'',decor_cost:l.quote?.decoration_budget_estimated?String(l.quote.decoration_budget_estimated):'',setup_date:l.event_date?new Date(new Date(l.event_date).getTime()-86400000).toISOString().split('T')[0]:'',teardown_date:l.event_date?new Date(new Date(l.event_date).getTime()+86400000).toISOString().split('T')[0]:'',special_requests:''});
        break;
      case 'record_full_payment':
        setFullPayForm({remaining_amount:String((l.quote?.total_estimated||0)-(l.booking_confirmed?.advance_amount||0)),payment_date:today,payment_mode:'cash',transaction_ref:''});
        break;
      case 'complete_event':
        setCompleteEvtForm({actual_guest_count:l.event_finalization?.final_guest_count?String(l.event_finalization.final_guest_count):(l.expected_guest_count?String(l.expected_guest_count):''),start_time:'',end_time:'',problems_encountered:'',staff_feedback:'',photos_taken:''});
        break;
      case 'settle_event':{
        const paid=(l.booking_confirmed?.advance_amount||0)+(l.final_payment?.remaining_amount||0);
        setSettleForm({final_guest_count:l.event_execution?.actual_guest_count?String(l.event_execution.actual_guest_count):'',final_plates_served:l.event_execution?.actual_guest_count?String(l.event_execution.actual_guest_count):'',leftover_refund_amount:'',extra_charges_amount:'',extra_charges_reason:'',total_final_amount:l.quote?.total_estimated?String(l.quote.total_estimated):'',amount_paid:String(paid),final_settlement_amount:'0',settled_date:today});
        break;}
      case 'close_lead':
        setCloseForm({customer_rating:'',food_rating:'',ambiance_rating:'',service_rating:'',feedback_text:'',permission_for_testimonial:false,repeat_booking:false});
        break;
      case 'followup':
        setFuForm({scheduled_date:'',followup_type:'Call',notes:''});
        break;
      case 'lost':
        setLostForm({lost_reason:'',lost_detail:'',competitor_chosen:''});
        break;
      case 'hold':
        setHoldForm({on_hold_reason:'',on_hold_until:''});
        break;
      case 'status_override':
        setStatusOverride({new_status:'',note:''});
        break;
    }
  },[dialog,lead,userProfile,role]);

  /* ── Generic action caller ── */
  async function doAction(body){
    setSaving(true);
    try{
      const r=await fetch(`/api/leads/${leadId}`,{method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({franchise_id,branch_id,performed_by_uid:userProfile?.uid,performed_by_name:userProfile?.name,...body})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Action failed');
      showToast(d.message||'Done!');closeDialog();fetchLead();return d;
    }catch(e){showToast(e.message,true);return null;}
    finally{setSaving(false);}
  }

  /* ── Stage action handlers ── */
  const handleLogVisit=()=>{if(!visitForm.visit_date){showToast('Visit date required',true);return;}doAction({action:'log_visit',...visitForm,customer_rating:visitForm.customer_rating?Number(visitForm.customer_rating):null});};
  const handleScheduleTasting=()=>{if(!tastingSchForm.tasting_date){showToast('Tasting date required',true);return;}doAction({action:'schedule_tasting',tasting_date:tastingSchForm.tasting_date,menu_options_to_present:tastingSchForm.menu_options_to_present?tastingSchForm.menu_options_to_present.split(',').map(s=>s.trim()).filter(Boolean):[],notes:tastingSchForm.notes||null});};
  const handleCompleteTasting=()=>{doAction({action:'complete_tasting',dishes_sampled:tastingDoneForm.dishes_sampled?tastingDoneForm.dishes_sampled.split(',').map(s=>s.trim()).filter(Boolean):[],customer_feedback:tastingDoneForm.customer_feedback||null,preferred_menu:tastingDoneForm.preferred_menu||null,kitchen_manager:tastingDoneForm.kitchen_manager||null});};
  const handleFinalizeMenu=()=>{if(!menuForm.menu_name||!menuForm.per_plate_cost){showToast('Menu name & per-plate cost required',true);return;}doAction({action:'finalize_menu',...menuForm,per_plate_cost:Number(menuForm.per_plate_cost),expected_plates:menuForm.expected_plates?Number(menuForm.expected_plates):null,hall_rent:Number(menuForm.hall_rent||0),decor_estimate:Number(menuForm.decor_estimate||0)});};
  const handleRecordAdvance=()=>{if(!advanceForm.advance_amount||!advanceForm.payment_date){showToast('Amount & date required',true);return;}doAction({action:'record_advance',...advanceForm,advance_amount:Number(advanceForm.advance_amount)});};
  const handleFinalizeDecor=()=>{if(!decorForm.final_guest_count){showToast('Final guest count required',true);return;}doAction({action:'finalize_decoration',...decorForm,final_guest_count:Number(decorForm.final_guest_count),decor_cost:Number(decorForm.decor_cost||0)});};
  const handleRecordFullPayment=()=>{if(!fullPayForm.remaining_amount||!fullPayForm.payment_date){showToast('Amount & date required',true);return;}doAction({action:'record_full_payment',...fullPayForm,remaining_amount:Number(fullPayForm.remaining_amount)});};
  const handleStartEvent=()=>doAction({action:'start_event'});
  const handleCompleteEvent=()=>{if(!completeEvtForm.actual_guest_count){showToast('Actual guest count required',true);return;}doAction({action:'complete_event',...completeEvtForm,actual_guest_count:Number(completeEvtForm.actual_guest_count)});};
  const handleSettleEvent=()=>{if(!settleForm.total_final_amount){showToast('Total final amount required',true);return;}doAction({action:'settle_event',...settleForm,total_final_amount:Number(settleForm.total_final_amount),leftover_refund_amount:Number(settleForm.leftover_refund_amount||0),extra_charges_amount:Number(settleForm.extra_charges_amount||0),amount_paid:settleForm.amount_paid?Number(settleForm.amount_paid):undefined,final_settlement_amount:settleForm.final_settlement_amount?Number(settleForm.final_settlement_amount):undefined});};
  const handleCloseLead=()=>{if(!closeForm.customer_rating){showToast('Overall rating required',true);return;}doAction({action:'close_lead',...closeForm,customer_rating:Number(closeForm.customer_rating),food_rating:closeForm.food_rating?Number(closeForm.food_rating):null,ambiance_rating:closeForm.ambiance_rating?Number(closeForm.ambiance_rating):null,service_rating:closeForm.service_rating?Number(closeForm.service_rating):null});};
  const handleAddFollowUp=()=>{if(!fuForm.scheduled_date){showToast('Date required',true);return;}doAction({action:'add_followup',...fuForm});setFuForm({scheduled_date:'',followup_type:'Call',notes:''});};
  const handleMarkLost=()=>{if(!lostForm.lost_reason){showToast('Reason required',true);return;}doAction({action:'mark_lost',...lostForm});};
  const handlePutOnHold=()=>{if(!holdForm.on_hold_reason||!holdForm.on_hold_until){showToast('Reason & date required',true);return;}doAction({action:'put_on_hold',...holdForm});};
  const handleReactivate=()=>doAction({action:'reactivate'});
  const handleStatusOverride=()=>{if(!statusOverride.new_status)return;doAction({action:'status_change',...statusOverride});};

  const handleDelete=async()=>{
    if(!confirm(`Permanently delete lead for ${lead?.customer_name}?`))return;
    setSaving(true);
    await fetch(`/api/leads/${leadId}`,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({franchise_id,branch_id})});
    router.push('/leads');
  };

  /* ── Loading / Error ── */
  if(loading) return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,gap:12,color:'var(--color-text-muted)'}}><Loader2 size={24} style={{animation:'spin 1s linear infinite'}}/>Loading lead…</div>);
  if(error) return(<div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-muted)'}}><AlertCircle size={40} style={{margin:'0 auto 12px',color:'#ef4444',opacity:0.7}}/><p style={{fontSize:15,fontWeight:600}}>{error}</p><div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}><button className="btn btn-ghost" onClick={fetchLead}>Retry</button><Link href="/leads" className="btn btn-primary" style={{textDecoration:'none'}}>← Leads</Link></div></div>);

  const l=lead;
  const curIdx=STAGE_KEYS.indexOf(l.status);
  const isTerminal=['lost','closed','on_hold'].includes(l.status);
  const sa=STAGE_ACTION[l.status];
  const canDoStage=sa&&sa.roles.includes(role);
  const canManage=SALES.includes(role);
  const isMgmt=MGMT.includes(role);

  const TABS=[
    {key:'overview',  label:'Overview',   icon:<FileText size={13}/>},
    {key:'stagedata', label:'Stage Data', icon:<Layers size={13}/>},
    {key:'activity',  label:'Activity',   icon:<Activity size={13}/>,count:activities.length},
    {key:'followups', label:'Follow-ups', icon:<Clock size={13}/>,   count:followUps.length},
    {key:'pipeline',  label:'Pipeline',   icon:<ArrowRightCircle size={13}/>},
    {key:'notes',     label:'Notes & AI', icon:<Bot size={13}/>},
  ];

  return(
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {toast&&(<div style={{position:'fixed',top:20,right:20,zIndex:9999,padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:600,background:toast.isError?'#fee2e2':'#dcfce7',color:toast.isError?'#991b1b':'#15803d',border:`1px solid ${toast.isError?'#fca5a5':'#86efac'}`,boxShadow:'0 4px 16px rgba(0,0,0,.12)'}}>{toast.msg}</div>)}

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:20}}>
        <div className="page-header-left">
          <Link href="/leads" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'var(--color-text-muted)',marginBottom:8,textDecoration:'none'}}><ArrowLeft size={14}/>Back to Leads</Link>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <h1 style={{margin:0}}>{l.customer_name}</h1>
            <Badge variant={STATUS_VARIANT[l.status]||'neutral'}>{STATUS_LABELS[l.status]||l.status}</Badge>
            {l.priority&&<Badge variant={PRIORITY_BADGE[l.priority]||'neutral'}>{l.priority}</Badge>}
          </div>
          <p style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',fontSize:13,color:'var(--color-text-muted)',marginTop:4}}>
            🎉 {l.event_type||'—'} &bull; <Calendar size={12}/>{fmtDate(l.event_date)} &bull; <Users size={12}/>{l.expected_guest_count||'?'} guests
            {l.lead_source&&<span>&bull; via {l.lead_source.replace(/_/g,' ')}</span>}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={fetchLead} disabled={saving}><RefreshCw size={14}/></button>
          {isMgmt&&<button className="btn btn-outline btn-sm" onClick={()=>setDialog('status_override')}>Override</button>}
          {canManage&&<Link href={`/leads/${leadId}/complete?franchise_id=${franchise_id}&branch_id=${branch_id}`} className="btn btn-outline btn-sm" style={{textDecoration:'none'}}><Edit3 size={13}/>Edit</Link>}
          {isMgmt&&<button className="btn btn-ghost btn-sm" style={{color:'#dc2626'}} onClick={handleDelete} disabled={saving}><Trash2 size={13}/></button>}
        </div>
      </motion.div>

      {/* ── KPI Row ── */}
      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          {label:'Phone',val:l.phone,icon:<Phone size={14}/>,href:`tel:${l.phone}`},
          {label:'Assigned To',val:l.assigned_to_name||'Unassigned',icon:<UserCheck size={14}/>},
          {label:'Quote Total',val:l.quote?.total_estimated?fmt(l.quote.total_estimated):'—',icon:<DollarSign size={14}/>},
          {label:'Next Follow-up',val:l.next_followup_date?fmtDate(l.next_followup_date):'None',icon:<Clock size={14}/>,urgent:l.next_followup_date&&new Date(l.next_followup_date)<new Date()},
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px',borderLeft:k.urgent?'3px solid #dc2626':undefined}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:k.urgent?'#dc2626':'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>
              {k.icon}{k.href?<a href={k.href} style={{color:'var(--color-primary)'}}>{k.val}</a>:k.val}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Banners ── */}
      {l.status==='on_hold'&&(<motion.div variants={fadeUp} style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#92400e',display:'flex',alignItems:'center',gap:8}}><PauseCircle size={15}/>On hold: {l.on_hold_reason}{l.on_hold_until&&` — resume after ${fmtDate(l.on_hold_until)}`}{isMgmt&&<button className="btn btn-sm" style={{marginLeft:'auto'}} disabled={saving} onClick={handleReactivate}>Reactivate</button>}</motion.div>)}
      {l.status==='lost'&&(<motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#991b1b',display:'flex',alignItems:'center',gap:8}}><XCircle size={15}/>Lost — {l.lost_reason}{l.competitor_chosen&&` (competitor: ${l.competitor_chosen})`}</motion.div>)}
      {l.status==='closed'&&(<motion.div variants={fadeUp} style={{background:'#dcfce7',border:'1px solid #86efac',borderRadius:8,padding:'10px 16px',marginBottom:16,fontSize:13,color:'#15803d',display:'flex',alignItems:'center',gap:8}}><CheckCircle2 size={15}/>Lead closed! LTV: {fmt(l.lifetime_value)} {l.feedback?.repeat_booking&&'🔄 Repeat customer!'}{l.booking_id&&<Link href={`/bookings/${l.booking_id}`} style={{marginLeft:'auto',color:'var(--color-primary)',fontSize:12}}>View Booking →</Link>}</motion.div>)}

      {/* ── Quick Actions ── */}
      {!['lost','closed'].includes(l.status)&&(
        <motion.div variants={fadeUp} style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          {canDoStage&&l.status!=='on_hold'&&l.status!=='paid'&&(
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={()=>setDialog(sa.action)}>{sa.icon}{sa.label}</button>
          )}
          {l.status==='paid'&&canDoStage&&(
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleStartEvent}><PlayCircle size={13}/>Start Event</button>
          )}
          {ALL_STAFF.includes(role)&&<button className="btn btn-outline btn-sm" onClick={()=>setDialog('followup')}><PhoneCall size={13}/>Follow-up</button>}
          {isMgmt&&l.status!=='on_hold'&&<button className="btn btn-ghost btn-sm" onClick={()=>setDialog('hold')}><PauseCircle size={13}/>Hold</button>}
          {canManage&&!['advance_paid','decoration_scheduled','paid','in_progress','completed','settlement_complete','on_hold'].includes(l.status)&&(
            <button className="btn btn-ghost btn-sm" style={{color:'#dc2626'}} onClick={()=>setDialog('lost')}><XCircle size={13}/>Lost</button>
          )}
          {l.booking_id&&<Link href={`/bookings/${l.booking_id}`} className="btn btn-outline btn-sm" style={{textDecoration:'none'}}><Building2 size={13}/>Booking</Link>}
        </motion.div>
      )}

      {/* ── WhatsApp Update Button (always visible for staff) ── */}
      {ALL_STAFF.includes(role)&&l.phone&&(
        <motion.div variants={fadeUp} style={{marginBottom:20}}>
          <button
            className="btn btn-sm"
            style={{background:waSending?'#dcfce7':'#25d366',color:'#fff',border:'none',display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:7,cursor:waSending?'not-allowed':'pointer',opacity:waSending?0.8:1,fontSize:13,fontWeight:600}}
            onClick={handleWhatsAppUpdate}
            disabled={waSending}
          >
            {waSending
              ?<><Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>Sending…</>
              :<><Send size={13}/>Send WhatsApp Update to {l.phone}</>
            }
          </button>
        </motion.div>
      )}

      {/* ── Tab Bar ── */}
      <motion.div variants={fadeUp} style={{display:'flex',gap:2,borderBottom:'1px solid var(--color-border)',marginBottom:20,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'9px 13px',fontSize:13,fontWeight:tab===t.key?700:400,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap',borderBottom:tab===t.key?'2px solid var(--color-primary)':'2px solid transparent',color:tab===t.key?'var(--color-primary)':'var(--color-text-muted)'}}>
            {t.icon}{t.label}{t.count>0&&<span style={{background:'var(--color-border)',borderRadius:10,padding:'1px 6px',fontSize:10}}>{t.count}</span>}
          </button>
        ))}
      </motion.div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {tab==='overview'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.06}}}} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>
          <motion.div variants={fadeUp} className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--color-text-muted)',marginBottom:12}}>Client</div>
            <InfoRow label="Name" value={l.customer_name}/>
            <InfoRow label="Phone" value={l.phone} href={`tel:${l.phone}`}/>
            <InfoRow label="Email" value={l.email} href={l.email?`mailto:${l.email}`:null}/>
            {l.alternate_phone&&<InfoRow label="Alt Phone" value={l.alternate_phone}/>}
            <InfoRow label="Type" value={l.client_type||'individual'}/>
            {l.company_name&&<InfoRow label="Company" value={l.company_name}/>}
          </motion.div>
          <motion.div variants={fadeUp} className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--color-text-muted)',marginBottom:12}}>Event</div>
            <InfoRow label="Type" value={l.event_type}/>
            <InfoRow label="Date" value={fmtDate(l.event_date)}/>
            <InfoRow label="Guests" value={l.expected_guest_count}/>
            <InfoRow label="Hall" value={l.hall_name||l.hall_id||'—'}/>
            <InfoRow label="Catering" value={l.catering_required?'Yes':'No'}/>
            <InfoRow label="Décor" value={l.decor_required?'Yes':'No'}/>
          </motion.div>
          <motion.div variants={fadeUp} className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--color-text-muted)',marginBottom:12}}>Budget & Source</div>
            <InfoRow label="Budget" value={l.budget_min||l.budget_max?`${fmt(l.budget_min)} – ${fmt(l.budget_max)}`:'—'}/>
            <InfoRow label="Flexibility" value={l.budget_flexibility||'—'}/>
            <InfoRow label="Source" value={l.lead_source?.replace(/_/g,' ')||'—'}/>
            {l.source_detail&&<InfoRow label="Detail" value={l.source_detail}/>}
            {l.referrer_name&&<InfoRow label="Referrer" value={`${l.referrer_name}${l.referrer_phone?' · '+l.referrer_phone:''}`}/>}
          </motion.div>
          <motion.div variants={fadeUp} className="card" style={{padding:18}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:'0.07em',color:'var(--color-text-muted)',marginBottom:12}}>Assignment</div>
            <InfoRow label="Assigned To" value={l.assigned_to_name||'Unassigned'}/>
            <InfoRow label="Priority" value={l.priority}/>
            <InfoRow label="Next Follow-up" value={l.next_followup_date?`${fmtDate(l.next_followup_date)} (${l.next_followup_type||'Call'})`:'—'}/>
            <InfoRow label="Created" value={fmtDateTime(l.created_at)}/>
            {l.ai_score!=null&&<InfoRow label="AI Score" value={`${l.ai_score}/100`} hl/>}
          </motion.div>
        </motion.div>
      )}

      {/* ═══════════ STAGE DATA TAB ═══════════ */}
      {tab==='stagedata'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.06}}}} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>
          {l.visited&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #6366f1'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🏛️ Site Visit</div>
            <InfoRow label="Date" value={fmtDate(l.visited.date)}/><InfoRow label="Hall" value={l.visited.hall_name||'—'}/><InfoRow label="By" value={l.visited.visited_by||'—'}/><InfoRow label="Rating" value={l.visited.rating_from_customer?`${l.visited.rating_from_customer}/5 ⭐`:'—'}/>{l.visited.notes&&<InfoRow label="Notes" value={l.visited.notes}/>}
          </motion.div>}
          {l.food_tasting&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #f59e0b'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🍽️ Food Tasting</div>
            <InfoRow label="Scheduled" value={fmtDate(l.food_tasting.scheduled_date)}/>{l.food_tasting.conducted_at&&<InfoRow label="Done" value={fmtDateTime(l.food_tasting.conducted_at)}/>}<InfoRow label="Preferred" value={l.food_tasting.preferred_menu||'—'}/><InfoRow label="Kitchen Mgr" value={l.food_tasting.kitchen_manager||'—'}/>{l.food_tasting.dishes_sampled?.length>0&&<InfoRow label="Dishes" value={l.food_tasting.dishes_sampled.join(', ')}/>}{l.food_tasting.customer_feedback&&<InfoRow label="Feedback" value={l.food_tasting.customer_feedback}/>}
          </motion.div>}
          {(l.menu_finalization||l.quote)&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #10b981'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🍲 Menu & Quote</div>
            {l.menu_finalization&&<><InfoRow label="Menu" value={l.menu_finalization.finalized_menu_name}/><InfoRow label="₹/Plate" value={fmt(l.menu_finalization.final_per_plate_cost)}/><InfoRow label="Plates" value={l.menu_finalization.expected_plates}/><InfoRow label="Food Total" value={fmt(l.menu_finalization.total_food_cost)}/></>}
            {l.quote&&<><InfoRow label="Hall Rent" value={fmt(l.quote.hall_base_rent)}/><InfoRow label="Decor Est." value={fmt(l.quote.decoration_budget_estimated)}/><InfoRow label="TOTAL" value={fmt(l.quote.total_estimated)} hl/></>}
          </motion.div>}
          {l.booking_confirmed&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #3b82f6'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>💰 Advance Payment</div>
            <InfoRow label="Amount" value={fmt(l.booking_confirmed.advance_amount)} hl/><InfoRow label="Date" value={fmtDate(l.booking_confirmed.advance_payment_date)}/><InfoRow label="Mode" value={l.booking_confirmed.payment_mode?.replace(/_/g,' ')||'—'}/><InfoRow label="Ref" value={l.booking_confirmed.transaction_ref||'—'}/><InfoRow label="Confirmed By" value={l.booking_confirmed.confirmed_by||'—'}/>
          </motion.div>}
          {l.event_finalization&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #8b5cf6'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🎨 Decoration & Event</div>
            <InfoRow label="Guests" value={l.event_finalization.final_guest_count}/><InfoRow label="Theme" value={l.event_finalization.decoration_theme||'—'}/><InfoRow label="Partner" value={l.event_finalization.decoration_partner||'—'}/><InfoRow label="Decor Cost" value={fmt(l.event_finalization.decoration_cost)}/><InfoRow label="Setup" value={fmtDate(l.event_finalization.setup_date)}/>
          </motion.div>}
          {l.final_payment&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #10b981'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>💳 Full Payment</div>
            <InfoRow label="Amount" value={fmt(l.final_payment.remaining_amount)} hl/><InfoRow label="Date" value={fmtDate(l.final_payment.payment_date)}/><InfoRow label="Mode" value={l.final_payment.payment_mode?.replace(/_/g,' ')||'—'}/><InfoRow label="Locked" value={l.event_locked?'Yes ✅':'No'}/>
          </motion.div>}
          {l.event_execution&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #f97316'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🎉 Event Execution</div>
            {l.event_execution.started_at&&<InfoRow label="Started" value={fmtDateTime(l.event_execution.started_at)}/>}{l.event_execution.completed_at&&<InfoRow label="Completed" value={fmtDateTime(l.event_execution.completed_at)}/>}<InfoRow label="Guests" value={l.event_execution.actual_guest_count||'—'}/>{l.event_execution.problems_encountered&&<InfoRow label="Issues" value={l.event_execution.problems_encountered}/>}
          </motion.div>}
          {l.post_event_settlement&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #06b6d4'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>🧾 Settlement</div>
            <InfoRow label="Final Guests" value={l.post_event_settlement.final_guest_count}/><InfoRow label="Plates" value={l.post_event_settlement.final_plates_served}/><InfoRow label="Refund" value={fmt(l.post_event_settlement.leftover_refund?.refund_amount)}/>{l.post_event_settlement.extra_charges?.amount>0&&<InfoRow label="Extra" value={`${fmt(l.post_event_settlement.extra_charges.amount)} — ${l.post_event_settlement.extra_charges.reason||''}`}/>}<InfoRow label="TOTAL FINAL" value={fmt(l.post_event_settlement.total_final_amount)} hl/>
          </motion.div>}
          {l.feedback&&<motion.div variants={fadeUp} className="card" style={{padding:18,borderLeft:'3px solid #fbbf24'}}>
            <div style={{fontWeight:700,fontSize:11,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:10}}>⭐ Feedback</div>
            <InfoRow label="Overall" value={l.feedback.customer_rating?`${l.feedback.customer_rating}/5 ⭐`:'—'} hl/><InfoRow label="Food" value={l.feedback.food_rating?`${l.feedback.food_rating}/5`:'—'}/><InfoRow label="Ambiance" value={l.feedback.ambiance_rating?`${l.feedback.ambiance_rating}/5`:'—'}/><InfoRow label="Service" value={l.feedback.service_rating?`${l.feedback.service_rating}/5`:'—'}/>{l.feedback.feedback_text&&<InfoRow label="Comment" value={l.feedback.feedback_text}/>}<InfoRow label="Testimonial" value={l.feedback.permission_for_testimonial?'Yes':'No'}/><InfoRow label="Repeat" value={l.feedback.repeat_booking?'Yes 🔄':'No'}/>
          </motion.div>}
          {curIdx<2&&!l.visited&&<motion.div variants={fadeUp} style={{gridColumn:'span 2',textAlign:'center',padding:'32px 0',color:'var(--color-text-muted)',fontSize:13}}>Stage data will appear here as the lead progresses.</motion.div>}
        </motion.div>
      )}

      {/* ═══════════ ACTIVITY TAB ═══════════ */}
      {tab==='activity'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.04}}}}>
          {activities.length===0
            ?<motion.div variants={fadeUp} style={{textAlign:'center',padding:'48px 0',color:'var(--color-text-muted)'}}><Activity size={32} style={{margin:'0 auto 10px',opacity:0.3}}/><p>No activity yet.</p></motion.div>
            :<div style={{position:'relative',paddingLeft:28}}>
              <div style={{position:'absolute',left:10,top:8,bottom:8,width:2,background:'var(--color-border)'}}/>
              {activities.map((a,i)=>{
                const isP=a.activity_type?.includes('payment');
                return(
                  <motion.div key={a.id||i} variants={fadeUp} style={{position:'relative',marginBottom:14,paddingLeft:20}}>
                    <div style={{position:'absolute',left:-21,top:6,width:10,height:10,borderRadius:'50%',zIndex:1,background:isP?'#16a34a':a.activity_type?.includes('status')?'var(--color-primary)':'#94a3b8',border:'2px solid var(--color-bg-card)'}}/>
                    <div className="card" style={{padding:'11px 15px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <span style={{fontWeight:600,fontSize:13,color:'var(--color-text-h)'}}>{a.activity_type?.replace(/_/g,' ')||'Activity'}</span>
                        <span style={{fontSize:11,color:'var(--color-text-muted)',whiteSpace:'nowrap',marginLeft:12}}>{fmtDateTime(a.created_at)}</span>
                      </div>
                      {a.description&&<p style={{fontSize:12,color:'var(--color-text-muted)',margin:'4px 0 0',lineHeight:1.5}}>{a.description}</p>}
                      {a.performed_by_name&&<span style={{fontSize:11,color:'var(--color-text-muted)'}}>by {a.performed_by_name}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          }
        </motion.div>
      )}

      {/* ═══════════ FOLLOW-UPS TAB ═══════════ */}
      {tab==='followups'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.06}}}}>
          <motion.div variants={fadeUp} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:13}}>Follow-ups ({followUps.length})</div>
            {ALL_STAFF.includes(role)&&<button className="btn btn-primary btn-sm" onClick={()=>setDialog('followup')}><Plus size={13}/>Add</button>}
          </motion.div>
          {followUps.length===0
            ?<motion.div variants={fadeUp} style={{textAlign:'center',padding:'48px 0',color:'var(--color-text-muted)'}}><Clock size={32} style={{margin:'0 auto 10px',opacity:0.3}}/><p>No follow-ups.</p></motion.div>
            :<div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[...followUps].sort((a,b)=>new Date(b.scheduled_date||b.created_at)-new Date(a.scheduled_date||a.created_at)).map((f,i)=>{
                const od=f.scheduled_date&&new Date(f.scheduled_date)<new Date();
                return(
                  <motion.div key={f.id||i} variants={fadeUp} className="card" style={{padding:'13px 16px',display:'flex',gap:14,alignItems:'center',borderLeft:od?'3px solid #dc2626':'3px solid var(--color-border)'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}><Badge variant={od?'red':'warning'}>{f.followup_type||'Call'}</Badge>{od&&<Badge variant="red">Overdue</Badge>}</div>
                      <div style={{fontSize:13,color:'var(--color-text-muted)'}}>{fmtDateTime(f.scheduled_date)}{f.notes&&` — ${f.notes}`}</div>
                      {f.done_by_user_name&&<span style={{fontSize:11,color:'var(--color-text-muted)'}}>by {f.done_by_user_name}</span>}
                    </div>
                    {f.outcome&&<Badge variant="accent">{f.outcome}</Badge>}
                  </motion.div>
                );
              })}
            </div>
          }
        </motion.div>
      )}

      {/* ═══════════ PIPELINE TAB ═══════════ */}
      {tab==='pipeline'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.03}}}}>
          <motion.div variants={fadeUp} style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:600}}>Stage {Math.max(curIdx+1,1)} of {PIPELINE.length}: {STATUS_LABELS[l.status]||l.status}</div>
              {!isTerminal&&sa&&<div style={{fontSize:12,color:'var(--color-text-muted)'}}>Next: <strong>{sa.label}</strong></div>}
            </div>
            <div style={{height:6,background:'var(--color-border)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',background:'var(--color-primary)',borderRadius:3,width:`${Math.max(5,((curIdx+1)/PIPELINE.length)*100)}%`,transition:'width 0.5s'}}/>
            </div>
          </motion.div>
          {PIPELINE.map((st,idx)=>{
            const isDone=idx<curIdx; const isCur=st.key===l.status;
            return(
              <motion.div key={st.key} variants={fadeUp} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 14px',marginBottom:4,borderRadius:8,background:isCur?'var(--color-primary-ghost)':'var(--color-surface)',border:isCur?'1.5px solid var(--color-primary)':'1px solid var(--color-border)',opacity:idx>curIdx&&!isTerminal?0.5:1}}>
                <span style={{fontSize:18,lineHeight:1.2,minWidth:24}}>{isDone?'✅':isCur?st.icon:'⚪'}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:isCur?700:500,fontSize:13,color:isCur?'var(--color-primary)':'var(--color-text-h)'}}>{st.label}</div>
                  <div style={{fontSize:11,color:'var(--color-text-muted)',marginTop:1}}>{st.desc}</div>
                </div>
                {isDone&&<Badge variant="green">Done</Badge>}
                {isCur&&<Badge variant="primary">Current</Badge>}
              </motion.div>
            );
          })}
          {l.status==='lost'&&<div style={{marginTop:8,padding:'12px 16px',borderRadius:8,background:'#fee2e2',border:'1px solid #fca5a5'}}>❌ <strong style={{color:'#991b1b'}}>Lost</strong> — {l.lost_reason}</div>}
          {l.status==='on_hold'&&<div style={{marginTop:8,padding:'12px 16px',borderRadius:8,background:'#fef3c7',border:'1px solid #fde68a'}}>⏸️ <strong style={{color:'#92400e'}}>On Hold</strong> — {l.on_hold_reason}</div>}
        </motion.div>
      )}

      {/* ═══════════ NOTES & AI TAB ═══════════ */}
      {tab==='notes'&&(
        <motion.div initial="hidden" animate="visible" variants={{hidden:{},visible:{transition:{staggerChildren:0.06}}}}>

          {/* ── AI Insights Card ── */}
          <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:16,border:'1.5px solid #c4b5fd',background:'linear-gradient(135deg,rgba(139,92,246,0.04),rgba(99,102,241,0.04))'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Sparkles size={16} style={{color:'#8b5cf6'}}/>
                <span style={{fontWeight:700,fontSize:13,textTransform:'uppercase',letterSpacing:'0.06em',color:'#6d28d9'}}>AI Lead Intelligence</span>
              </div>
              <button
                className="btn btn-sm"
                style={{background:aiAnalyzing?'#e9d5ff':'#8b5cf6',color:'#fff',border:'none',display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:6,cursor:aiAnalyzing?'not-allowed':'pointer',opacity:aiAnalyzing?0.8:1}}
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing}
              >
                {aiAnalyzing
                  ?<><Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>Analysing…</>
                  :<><Zap size={13}/>{l.ai_score!=null?'Re-Analyse':'Analyse with AI'}</>
                }
              </button>
            </div>

            {l.ai_score!=null ? (
              <div>
                {/* Score row */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:14,flexWrap:'wrap'}}>
                  <div style={{textAlign:'center',minWidth:72}}>
                    <div style={{fontSize:36,fontWeight:900,lineHeight:1,color:l.ai_score>=75?'#16a34a':l.ai_score>=50?'#f59e0b':l.ai_score>=25?'#ea580c':'#dc2626'}}>{l.ai_score}</div>
                    <div style={{fontSize:10,color:'var(--color-text-muted)',marginTop:2}}>/ 100</div>
                  </div>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{height:8,background:'var(--color-border)',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                      <div style={{height:'100%',borderRadius:4,width:`${l.ai_score}%`,background:l.ai_score>=75?'#16a34a':l.ai_score>=50?'#f59e0b':l.ai_score>=25?'#ea580c':'#dc2626',transition:'width 0.6s ease'}}/>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                      {l.ai_score_label&&(
                        <span style={{padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700,
                          background:l.ai_score>=75?'#dcfce7':l.ai_score>=50?'#fef3c7':l.ai_score>=25?'#ffedd5':'#fee2e2',
                          color:l.ai_score>=75?'#16a34a':l.ai_score>=50?'#92400e':l.ai_score>=25?'#9a3412':'#991b1b'
                        }}>{l.ai_score_label}</span>
                      )}
                      {l.ai_sentiment&&(
                        <span style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'var(--color-text-muted)'}}>
                          {l.ai_sentiment==='positive'?<ThumbsUp size={12} style={{color:'#16a34a'}}/>:l.ai_sentiment==='negative'?<AlertTriangle size={12} style={{color:'#dc2626'}}/>:<Minus size={12} style={{color:'#64748b'}}/>}
                          {l.ai_sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {l.ai_summary&&(
                  <div style={{padding:'10px 14px',background:'var(--color-surface)',borderRadius:8,marginBottom:12,fontSize:13,color:'var(--color-text-body)',lineHeight:1.6,borderLeft:'3px solid #8b5cf6'}}>
                    {l.ai_summary}
                  </div>
                )}

                {/* Suggested action */}
                {l.ai_suggested_action&&(
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--color-text-muted)',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><TrendingUp size={11}/>Suggested Next Action</div>
                    <div style={{padding:'10px 14px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,fontSize:13,color:'#1e40af',lineHeight:1.5,fontWeight:500}}>
                      {l.ai_suggested_action}
                    </div>
                  </div>
                )}

                {/* Risk factors */}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--color-text-muted)',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><Shield size={11}/>Risk Factors</div>
                  {Array.isArray(l.ai_risk_factors) && l.ai_risk_factors.length > 0 ? (
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {l.ai_risk_factors.map((rf,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:6,fontSize:12,color:'#92400e',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:6,padding:'5px 10px'}}>
                          <AlertTriangle size={11} style={{color:'#f59e0b',flexShrink:0,marginTop:1}}/>{rf}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{fontSize:12,color:'#15803d',background:'#dcfce7',border:'1px solid #86efac',borderRadius:6,padding:'5px 10px',display:'flex',alignItems:'center',gap:6}}>
                      <Shield size={11} style={{color:'#16a34a'}}/>No significant risk factors identified
                    </div>
                  )}
                </div>

                {l.ai_score_updated_at&&(
                  <div style={{fontSize:11,color:'var(--color-text-muted)',marginTop:10,textAlign:'right'}}>
                    Last analysed: {fmtDateTime(l.ai_score_updated_at)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'24px 0',color:'var(--color-text-muted)'}}>
                <Bot size={32} style={{margin:'0 auto 10px',opacity:0.25}}/>
                <p style={{fontSize:13}}>No AI analysis yet. Click <strong>Analyse with AI</strong> to get lead scoring, sentiment analysis, suggested actions, and risk factors.</p>
              </div>
            )}
          </motion.div>

          {/* ── Notes Card ── */}
          <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',marginBottom:10,color:'var(--color-text-muted)'}}>Notes</div>
            <p style={{fontSize:14,color:'var(--color-text-body)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{l.notes||<span style={{color:'var(--color-text-muted)',fontStyle:'italic'}}>No notes.</span>}</p>
          </motion.div>

          {/* ── Status History ── */}
          {l.status_history?.length>0&&(<motion.div variants={fadeUp} className="card" style={{padding:20}}>
            <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',marginBottom:10,color:'var(--color-text-muted)'}}>Status History</div>
            {l.status_history.map((h,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'center',fontSize:12,padding:'5px 0',borderBottom:'1px solid var(--color-border)'}}>
                <Badge variant={STATUS_VARIANT[h.status]||'neutral'}>{STATUS_LABELS[h.status]||h.status}</Badge>
                <span style={{color:'var(--color-text-muted)'}}>{fmtDateTime(h.changed_at)}</span>
                {h.note&&<span style={{color:'var(--color-text-muted)',fontStyle:'italic'}}>{h.note}</span>}
              </div>
            ))}
          </motion.div>)}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
           DIALOGS — one per stage action
      ══════════════════════════════════════════ */}

      {dialog==='log_visit'&&<Dlg title="Log Property Visit" onClose={closeDialog}>
        <FG><Fld l="Visit Date *"><input className="input" type="datetime-local" value={visitForm.visit_date} onChange={e=>setVisitForm(p=>({...p,visit_date:e.target.value}))}/></Fld><Fld l="Hall Visited">{halls.length>0?<select className="input" value={visitForm.hall_id} onChange={e=>{const h=halls.find(x=>x.id===e.target.value);setVisitForm(p=>({...p,hall_id:e.target.value,hall_name:h?.name||''}));}}><option value="">Select hall…</option>{halls.map(h=><option key={h.id} value={h.id}>{h.name}{h.capacity_seating?` — Cap: ${h.capacity_seating}`:''}</option>)}</select>:<input className="input" placeholder="Hall name" value={visitForm.hall_name} onChange={e=>setVisitForm(p=>({...p,hall_name:e.target.value,hall_id:''}))}/>}</Fld><Fld l="Visited By">{staffList.length>0?<select className="input" value={visitForm.visited_by} onChange={e=>setVisitForm(p=>({...p,visited_by:e.target.value}))}><option value="">Select staff…</option>{staffList.map(s=><option key={s.id} value={s.name}>{s.name} ({s.role?.replace(/_/g,' ')})</option>)}</select>:<input className="input" placeholder="Name" value={visitForm.visited_by} onChange={e=>setVisitForm(p=>({...p,visited_by:e.target.value}))}/>}</Fld><Fld l="Interest (1-5)"><input className="input" type="number" min={1} max={5} value={visitForm.customer_rating} onChange={e=>setVisitForm(p=>({...p,customer_rating:e.target.value}))}/></Fld><Fld l="Notes" s><textarea className="input" rows={2} value={visitForm.notes} onChange={e=>setVisitForm(p=>({...p,notes:e.target.value}))} style={{resize:'vertical'}}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleLogVisit} ok="Mark Visited"/>
      </Dlg>}

      {dialog==='schedule_tasting'&&<Dlg title="Schedule Food Tasting" onClose={closeDialog}>
        <FG><Fld l="Date & Time *"><input className="input" type="datetime-local" value={tastingSchForm.tasting_date} onChange={e=>setTastingSchForm(p=>({...p,tasting_date:e.target.value}))}/></Fld><Fld l="Menu Options"><input className="input" placeholder="Veg, Non-veg, Jain (comma)" value={tastingSchForm.menu_options_to_present} onChange={e=>setTastingSchForm(p=>({...p,menu_options_to_present:e.target.value}))}/></Fld><Fld l="Notes" s><input className="input" value={tastingSchForm.notes} onChange={e=>setTastingSchForm(p=>({...p,notes:e.target.value}))}/></Fld></FG>
        <div style={{fontSize:11,color:'var(--color-text-muted)',marginBottom:12}}>Roles: Kitchen Manager, Sales Executive</div>
        <DA saving={saving} onCancel={closeDialog} onOk={handleScheduleTasting} ok="Schedule"/>
      </Dlg>}

      {dialog==='complete_tasting'&&<Dlg title="Complete Food Tasting" onClose={closeDialog}>
        <FG><Fld l="Dishes Sampled" s><input className="input" placeholder="Paneer tikka, Dal makhani (comma)" value={tastingDoneForm.dishes_sampled} onChange={e=>setTastingDoneForm(p=>({...p,dishes_sampled:e.target.value}))}/></Fld><Fld l="Preferred Menu">{menus.length>0?<select className="input" value={tastingDoneForm.preferred_menu} onChange={e=>setTastingDoneForm(p=>({...p,preferred_menu:e.target.value}))}><option value="">Select menu…</option>{menus.map(m=><option key={m.id} value={m.menu_name||m.name}>{m.menu_name||m.name}{m.per_plate_cost?` — ${fmt(m.per_plate_cost)}/plate`:''}</option>)}</select>:<input className="input" placeholder="Veg Premium" value={tastingDoneForm.preferred_menu} onChange={e=>setTastingDoneForm(p=>({...p,preferred_menu:e.target.value}))}/>}</Fld><Fld l="Kitchen Manager">{staffList.filter(s=>s.role==='kitchen_manager').length>0?<select className="input" value={tastingDoneForm.kitchen_manager} onChange={e=>setTastingDoneForm(p=>({...p,kitchen_manager:e.target.value}))}><option value="">Select…</option>{staffList.filter(s=>s.role==='kitchen_manager').map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select>:<input className="input" value={tastingDoneForm.kitchen_manager} onChange={e=>setTastingDoneForm(p=>({...p,kitchen_manager:e.target.value}))}/>}</Fld><Fld l="Customer Feedback" s><textarea className="input" rows={2} value={tastingDoneForm.customer_feedback} onChange={e=>setTastingDoneForm(p=>({...p,customer_feedback:e.target.value}))} style={{resize:'vertical'}}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleCompleteTasting} ok="Mark Done"/>
      </Dlg>}

      {dialog==='finalize_menu'&&<Dlg title="Finalize Menu & Generate Quote" onClose={closeDialog}>
        <FG><Fld l="Menu Name *">{menus.length>0?<select className="input" value={menuForm.menu_name} onChange={e=>{const m=menus.find(x=>(x.menu_name||x.name)===e.target.value);setMenuForm(p=>({...p,menu_name:e.target.value,per_plate_cost:m?.per_plate_cost?String(m.per_plate_cost):p.per_plate_cost}));}}><option value="">Select menu…</option>{menus.map(m=><option key={m.id} value={m.menu_name||m.name}>{m.menu_name||m.name}{m.per_plate_cost?` — ${fmt(m.per_plate_cost)}/plate`:''}</option>)}</select>:<input className="input" placeholder="Veg Grand" value={menuForm.menu_name} onChange={e=>setMenuForm(p=>({...p,menu_name:e.target.value}))}/>}</Fld><Fld l="₹/Plate *"><input className="input" type="number" placeholder="850" value={menuForm.per_plate_cost} onChange={e=>setMenuForm(p=>({...p,per_plate_cost:e.target.value}))}/></Fld><Fld l="Plates"><input className="input" type="number" placeholder={String(l.expected_guest_count||250)} value={menuForm.expected_plates} onChange={e=>setMenuForm(p=>({...p,expected_plates:e.target.value}))}/></Fld><Fld l="Hall Rent (₹)"><input className="input" type="number" placeholder="50000" value={menuForm.hall_rent} onChange={e=>setMenuForm(p=>({...p,hall_rent:e.target.value}))}/></Fld><Fld l="Decor Est. (₹)"><input className="input" type="number" placeholder="30000" value={menuForm.decor_estimate} onChange={e=>setMenuForm(p=>({...p,decor_estimate:e.target.value}))}/></Fld><Fld l="Valid Till"><input className="input" type="date" value={menuForm.valid_till} onChange={e=>setMenuForm(p=>({...p,valid_till:e.target.value}))}/></Fld></FG>
        {menuForm.per_plate_cost&&menuForm.expected_plates&&<div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:6,padding:'8px 12px',fontSize:13,marginBottom:12,color:'#15803d'}}>Est: {fmt((Number(menuForm.per_plate_cost)*Number(menuForm.expected_plates))+Number(menuForm.hall_rent||0)+Number(menuForm.decor_estimate||0))}</div>}
        <DA saving={saving} onCancel={closeDialog} onOk={handleFinalizeMenu} ok="Finalize & Quote"/>
      </Dlg>}

      {dialog==='record_advance'&&<Dlg title="Record Advance Payment" onClose={closeDialog}>
        <FG><Fld l="Amount (₹) *"><input className="input" type="number" placeholder="50000" value={advanceForm.advance_amount} onChange={e=>setAdvanceForm(p=>({...p,advance_amount:e.target.value}))}/></Fld><Fld l="Date *"><input className="input" type="date" value={advanceForm.payment_date} onChange={e=>setAdvanceForm(p=>({...p,payment_date:e.target.value}))}/></Fld><Fld l="Mode"><select className="input" value={advanceForm.payment_mode} onChange={e=>setAdvanceForm(p=>({...p,payment_mode:e.target.value}))}>{PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}</select></Fld><Fld l="Ref #"><input className="input" placeholder="UPI/cheque ref" value={advanceForm.transaction_ref} onChange={e=>setAdvanceForm(p=>({...p,transaction_ref:e.target.value}))}/></Fld><Fld l="Confirmed By" s>{staffList.length>0?<select className="input" value={advanceForm.confirmed_by} onChange={e=>setAdvanceForm(p=>({...p,confirmed_by:e.target.value}))}><option value="">Select…</option>{staffList.map(s=><option key={s.id} value={s.name}>{s.name} ({s.role?.replace(/_/g,' ')})</option>)}</select>:<input className="input" value={advanceForm.confirmed_by} onChange={e=>setAdvanceForm(p=>({...p,confirmed_by:e.target.value}))}/>}</Fld></FG>
        <div style={{fontSize:11,color:'var(--color-text-muted)',marginBottom:12}}>This will also create a Booking & Invoice.</div>
        <DA saving={saving} onCancel={closeDialog} onOk={handleRecordAdvance} ok="Record Advance"/>
      </Dlg>}

      {dialog==='finalize_decoration'&&<Dlg title="Finalize Decoration & Event" onClose={closeDialog} wide>
        {/* Decor Package Selector */}
        {decorPackages.length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{fontWeight:600,fontSize:13,marginBottom:10,color:'var(--color-text-h)'}}>Select Decor Package (Optional)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,maxHeight:360,overflowY:'auto',padding:4}}>
              {decorPackages.map(pkg=>{
                const isSelected=decorForm.decor_package_id===pkg.id;
                const total=pkg.items?.reduce((s,it)=>s+Number(it.unit_price||0)*Number(it.qty||1),0)||Number(pkg.base_price||0);
                const itemCount=pkg.items?.length||0;
                const imageCount=pkg.image_urls?.length||0;
                const THEME_COLORS={Royal:{bg:'rgba(142,68,173,0.10)',color:'#8e44ad'},Minimalist:{bg:'rgba(52,73,94,0.08)',color:'#2c3e50'},Garden:{bg:'rgba(39,174,96,0.10)',color:'#27ae60'},Traditional:{bg:'rgba(211,84,0,0.10)',color:'#d35400'},Modern:{bg:'rgba(41,128,185,0.10)',color:'#2980b9'},Rustic:{bg:'rgba(127,96,0,0.10)',color:'#7f6000'},Floral:{bg:'rgba(231,76,60,0.10)',color:'#e74c3c'},Bollywood:{bg:'rgba(243,156,18,0.12)',color:'#f39c12'},Custom:{bg:'var(--color-primary-ghost)',color:'var(--color-primary)'}};
                const tc=THEME_COLORS[pkg.theme]||THEME_COLORS.Custom;
                return(
                  <div key={pkg.id} onClick={()=>setDecorForm(p=>({...p,decor_package_id:pkg.id,decor_package_name:pkg.name,decor_theme:pkg.theme||'',decor_cost:String(total)}))} style={{border:isSelected?'2px solid var(--color-primary)':'1px solid var(--color-border)',borderRadius:8,padding:10,cursor:'pointer',background:isSelected?'var(--color-primary-ghost)':'var(--color-surface)',transition:'all 0.2s',position:'relative'}}>
                    {isSelected&&<div style={{position:'absolute',top:6,right:6,background:'var(--color-primary)',color:'#fff',borderRadius:12,width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,zIndex:1}}>✓</div>}
                    <div style={{width:'100%',height:100,borderRadius:6,background:tc.bg,marginBottom:8,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',fontSize:24,position:'relative'}}>
                      {pkg.image_urls?.[0]?<img src={pkg.image_urls[0]} alt={pkg.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🎨'}
                      {imageCount>1&&<div style={{position:'absolute',bottom:4,right:4,background:'rgba(0,0,0,0.7)',color:'#fff',fontSize:9,padding:'2px 5px',borderRadius:4}}>🖼 {imageCount}</div>}
                    </div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:'var(--color-text-h)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pkg.name}</div>
                    <div style={{display:'flex',gap:4,marginBottom:6,flexWrap:'wrap'}}>
                      <div style={{fontSize:10,color:tc.color,background:tc.bg,padding:'2px 6px',borderRadius:4,fontWeight:600}}>{pkg.theme||'Custom'}</div>
                      {itemCount>0&&<div style={{fontSize:10,color:'#059669',background:'rgba(16,185,129,0.1)',padding:'2px 6px',borderRadius:4,fontWeight:600}}>📦 {itemCount} items</div>}
                    </div>
                    <div style={{fontWeight:800,fontSize:15,color:'var(--color-primary)',marginBottom:6}}>{fmt(total)}</div>
                    {pkg.suitable_for&&Array.isArray(pkg.suitable_for)&&pkg.suitable_for.length>0&&<div style={{fontSize:9,color:'var(--color-text-muted)',marginBottom:4,display:'flex',gap:3,flexWrap:'wrap'}}>{pkg.suitable_for.slice(0,3).map((ev,i)=><span key={i} style={{background:'var(--color-bg-alt)',padding:'1px 4px',borderRadius:3}}>{ev}</span>)}{pkg.suitable_for.length>3&&<span style={{color:'var(--color-primary)'}}>+{pkg.suitable_for.length-3}</span>}</div>}
                    {pkg.description&&<div style={{fontSize:10,color:'var(--color-text-muted)',lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{pkg.description}</div>}
                  </div>
                );
              })}
            </div>
            {decorForm.decor_package_id&&<div style={{marginTop:10,padding:'8px 12px',background:'var(--color-primary-ghost)',border:'1px solid var(--color-primary)',borderRadius:6,fontSize:12,color:'var(--color-primary)',fontWeight:600}}>✓ Selected: {decorForm.decor_package_name} — {fmt(decorForm.decor_cost)}</div>}
          </div>
        )}
        <FG><Fld l="Final Guests *"><input className="input" type="number" value={decorForm.final_guest_count} onChange={e=>setDecorForm(p=>({...p,final_guest_count:e.target.value}))}/></Fld><Fld l="Theme"><input className="input" placeholder="Floral, Royal…" value={decorForm.decor_theme} onChange={e=>setDecorForm(p=>({...p,decor_theme:e.target.value}))}/></Fld><Fld l="Partner">{vendors.length>0?<select className="input" value={decorForm.decor_partner} onChange={e=>setDecorForm(p=>({...p,decor_partner:e.target.value}))}><option value="">Select vendor…</option>{vendors.map(v=><option key={v.id} value={v.name||v.company_name}>{v.name||v.company_name}{v.category?` — ${v.category}`:''}</option>)}</select>:<input className="input" placeholder="Vendor name" value={decorForm.decor_partner} onChange={e=>setDecorForm(p=>({...p,decor_partner:e.target.value}))}/>}</Fld><Fld l="Cost (₹)"><input className="input" type="number" value={decorForm.decor_cost} onChange={e=>setDecorForm(p=>({...p,decor_cost:e.target.value}))}/></Fld><Fld l="Setup Date"><input className="input" type="date" value={decorForm.setup_date} onChange={e=>setDecorForm(p=>({...p,setup_date:e.target.value}))}/></Fld><Fld l="Teardown"><input className="input" type="date" value={decorForm.teardown_date} onChange={e=>setDecorForm(p=>({...p,teardown_date:e.target.value}))}/></Fld><Fld l="Special Requests" s><textarea className="input" rows={2} value={decorForm.special_requests} onChange={e=>setDecorForm(p=>({...p,special_requests:e.target.value}))} style={{resize:'vertical'}}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleFinalizeDecor} ok="Finalize Decor"/>
      </Dlg>}

      {dialog==='record_full_payment'&&<Dlg title="Record Full Payment" onClose={closeDialog}>
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:6,padding:'8px 12px',fontSize:12,color:'#1e40af',marginBottom:14}}>Quote: {fmt(l.quote?.total_estimated)} — Advance: {fmt(l.booking_confirmed?.advance_amount)} — Remaining: ~{fmt((l.quote?.total_estimated||0)-(l.booking_confirmed?.advance_amount||0))}</div>
        <FG><Fld l="Amount (₹) *"><input className="input" type="number" value={fullPayForm.remaining_amount} onChange={e=>setFullPayForm(p=>({...p,remaining_amount:e.target.value}))}/></Fld><Fld l="Date *"><input className="input" type="date" value={fullPayForm.payment_date} onChange={e=>setFullPayForm(p=>({...p,payment_date:e.target.value}))}/></Fld><Fld l="Mode"><select className="input" value={fullPayForm.payment_mode} onChange={e=>setFullPayForm(p=>({...p,payment_mode:e.target.value}))}>{PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}</select></Fld><Fld l="Ref #"><input className="input" value={fullPayForm.transaction_ref} onChange={e=>setFullPayForm(p=>({...p,transaction_ref:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleRecordFullPayment} ok="Record & Lock"/>
      </Dlg>}

      {dialog==='complete_event'&&<Dlg title="Mark Event Completed" onClose={closeDialog}>
        <FG><Fld l="Actual Guests *"><input className="input" type="number" value={completeEvtForm.actual_guest_count} onChange={e=>setCompleteEvtForm(p=>({...p,actual_guest_count:e.target.value}))}/></Fld><Fld l="Photos"><input className="input" type="number" value={completeEvtForm.photos_taken} onChange={e=>setCompleteEvtForm(p=>({...p,photos_taken:e.target.value}))}/></Fld><Fld l="Start Time"><input className="input" type="time" value={completeEvtForm.start_time} onChange={e=>setCompleteEvtForm(p=>({...p,start_time:e.target.value}))}/></Fld><Fld l="End Time"><input className="input" type="time" value={completeEvtForm.end_time} onChange={e=>setCompleteEvtForm(p=>({...p,end_time:e.target.value}))}/></Fld><Fld l="Issues" s><input className="input" value={completeEvtForm.problems_encountered} onChange={e=>setCompleteEvtForm(p=>({...p,problems_encountered:e.target.value}))}/></Fld><Fld l="Staff Notes" s><textarea className="input" rows={2} value={completeEvtForm.staff_feedback} onChange={e=>setCompleteEvtForm(p=>({...p,staff_feedback:e.target.value}))} style={{resize:'vertical'}}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleCompleteEvent} ok="Mark Completed"/>
      </Dlg>}

      {dialog==='settle_event'&&<Dlg title="Post-Event Settlement" onClose={closeDialog}>
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:6,padding:'8px 12px',fontSize:12,color:'#1e40af',marginBottom:14}}>Advance: {fmt(l.booking_confirmed?.advance_amount)} + Full: {fmt(l.final_payment?.remaining_amount)} = Paid: {fmt((l.booking_confirmed?.advance_amount||0)+(l.final_payment?.remaining_amount||0))}</div>
        <FG><Fld l="Final Guests"><input className="input" type="number" value={settleForm.final_guest_count} onChange={e=>setSettleForm(p=>({...p,final_guest_count:e.target.value}))}/></Fld><Fld l="Plates Served"><input className="input" type="number" value={settleForm.final_plates_served} onChange={e=>setSettleForm(p=>({...p,final_plates_served:e.target.value}))}/></Fld><Fld l="Refund (₹)"><input className="input" type="number" placeholder="0" value={settleForm.leftover_refund_amount} onChange={e=>setSettleForm(p=>({...p,leftover_refund_amount:e.target.value}))}/></Fld><Fld l="Extra Charges (₹)"><input className="input" type="number" placeholder="0" value={settleForm.extra_charges_amount} onChange={e=>setSettleForm(p=>({...p,extra_charges_amount:e.target.value}))}/></Fld><Fld l="Extra Reason" s><input className="input" value={settleForm.extra_charges_reason} onChange={e=>setSettleForm(p=>({...p,extra_charges_reason:e.target.value}))}/></Fld><Fld l="Total Final (₹) *"><input className="input" type="number" value={settleForm.total_final_amount} onChange={e=>setSettleForm(p=>({...p,total_final_amount:e.target.value}))}/></Fld><Fld l="Amount Paid (₹)"><input className="input" type="number" placeholder="Auto from payments" value={settleForm.amount_paid} onChange={e=>setSettleForm(p=>({...p,amount_paid:e.target.value}))}/></Fld><Fld l="Settlement (₹)"><input className="input" type="number" placeholder="0 = balanced, negative = refund" value={settleForm.final_settlement_amount} onChange={e=>setSettleForm(p=>({...p,final_settlement_amount:e.target.value}))}/></Fld><Fld l="Date"><input className="input" type="date" value={settleForm.settled_date} onChange={e=>setSettleForm(p=>({...p,settled_date:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleSettleEvent} ok="Settle"/>
      </Dlg>}

      {dialog==='close_lead'&&<Dlg title="Close Lead — Feedback" onClose={closeDialog}>
        <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:6,padding:'8px 12px',fontSize:12,color:'#15803d',marginBottom:12}}>Collect customer feedback to close this lead. LTV will be calculated from settlement.</div>
        <FG><Fld l="Overall Rating (1-5) *"><input className="input" type="number" min={1} max={5} placeholder="5" value={closeForm.customer_rating} onChange={e=>setCloseForm(p=>({...p,customer_rating:e.target.value}))}/></Fld><Fld l="Food (1-5)"><input className="input" type="number" min={1} max={5} value={closeForm.food_rating} onChange={e=>setCloseForm(p=>({...p,food_rating:e.target.value}))}/></Fld><Fld l="Ambiance (1-5)"><input className="input" type="number" min={1} max={5} value={closeForm.ambiance_rating} onChange={e=>setCloseForm(p=>({...p,ambiance_rating:e.target.value}))}/></Fld><Fld l="Service (1-5)"><input className="input" type="number" min={1} max={5} value={closeForm.service_rating} onChange={e=>setCloseForm(p=>({...p,service_rating:e.target.value}))}/></Fld><Fld l="Comment" s><textarea className="input" rows={3} value={closeForm.feedback_text} onChange={e=>setCloseForm(p=>({...p,feedback_text:e.target.value}))} style={{resize:'vertical'}}/></Fld></FG>
        <div style={{display:'flex',gap:20,marginBottom:14}}>
          <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}><input type="checkbox" checked={closeForm.permission_for_testimonial} onChange={e=>setCloseForm(p=>({...p,permission_for_testimonial:e.target.checked}))}/>Testimonial OK</label>
          <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}><input type="checkbox" checked={closeForm.repeat_booking} onChange={e=>setCloseForm(p=>({...p,repeat_booking:e.target.checked}))}/>Repeat interest</label>
        </div>
        <DA saving={saving} onCancel={closeDialog} onOk={handleCloseLead} ok="Close Lead ✓"/>
      </Dlg>}

      {dialog==='followup'&&<Dlg title="Log Follow-up" onClose={closeDialog}>
        <FG><Fld l="Date *"><input className="input" type="datetime-local" value={fuForm.scheduled_date} onChange={e=>setFuForm(p=>({...p,scheduled_date:e.target.value}))}/></Fld><Fld l="Type"><select className="input" value={fuForm.followup_type} onChange={e=>setFuForm(p=>({...p,followup_type:e.target.value}))}>{FOLLOWUP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld><Fld l="Notes" s><input className="input" value={fuForm.notes} onChange={e=>setFuForm(p=>({...p,notes:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleAddFollowUp} ok="Save"/>
      </Dlg>}

      {dialog==='lost'&&<Dlg title="Mark Lost" onClose={closeDialog}>
        <FG><Fld l="Reason *" s><select className="input" value={lostForm.lost_reason} onChange={e=>setLostForm(p=>({...p,lost_reason:e.target.value}))}><option value="">Select…</option>{['Budget too low','Date unavailable','Chose competitor','No response','Changed plans','Other'].map(r=><option key={r}>{r}</option>)}</select></Fld><Fld l="Detail" s><input className="input" value={lostForm.lost_detail} onChange={e=>setLostForm(p=>({...p,lost_detail:e.target.value}))}/></Fld><Fld l="Competitor" s><input className="input" value={lostForm.competitor_chosen} onChange={e=>setLostForm(p=>({...p,competitor_chosen:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleMarkLost} ok="Mark Lost" danger/>
      </Dlg>}

      {dialog==='hold'&&<Dlg title="Put on Hold" onClose={closeDialog}>
        <FG><Fld l="Reason *" s><input className="input" value={holdForm.on_hold_reason} onChange={e=>setHoldForm(p=>({...p,on_hold_reason:e.target.value}))}/></Fld><Fld l="Resume After *"><input className="input" type="date" value={holdForm.on_hold_until} onChange={e=>setHoldForm(p=>({...p,on_hold_until:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handlePutOnHold} ok="Hold"/>
      </Dlg>}

      {dialog==='status_override'&&<Dlg title="Override Status (Management)" onClose={closeDialog}>
        <FG><Fld l="Status *" s><select className="input" value={statusOverride.new_status} onChange={e=>setStatusOverride(p=>({...p,new_status:e.target.value}))}><option value="">Select…</option>{Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Fld><Fld l="Note" s><input className="input" placeholder="Reason" value={statusOverride.note} onChange={e=>setStatusOverride(p=>({...p,note:e.target.value}))}/></Fld></FG>
        <DA saving={saving} onCancel={closeDialog} onOk={handleStatusOverride} ok="Override"/>
      </Dlg>}

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </motion.div>
  );
}

/* ── Tiny reusable components ── */
function FG({children}){return <div className="form-grid" style={{marginBottom:12}}>{children}</div>;}
function Fld({l,s,children}){return <div className={`form-field${s?' form-span-2':''}`}><label className="form-label">{l}</label>{children}</div>;}
function DA({saving,onCancel,onOk,ok,danger}){
  return(<div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
    <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
    <button className="btn btn-primary" style={danger?{background:'#dc2626'}:{}} disabled={saving} onClick={onOk}>{saving?<Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/>:null}{ok}</button>
  </div>);
}
function Dlg({title,children,onClose,wide}){
  return(<div style={{position:'fixed',inset:0,zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}}/>
    <div style={{position:'relative',background:'var(--color-bg-card)',borderRadius:12,padding:24,maxWidth:wide?720:520,width:'92%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.25)',zIndex:1}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>{title}</h3>{children}
    </div>
  </div>);
}
