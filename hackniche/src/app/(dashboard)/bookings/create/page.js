'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const EVENT_TYPES = ['Wedding','Engagement','Reception','Birthday','Corporate','Conference','Anniversary','Social Gathering','Other'];
const PAYMENT_MODES = ['cash','upi','bank_transfer','cheque','card','other'];

export default function CreateBookingPage() {
  const router = useRouter();
  const sp     = useSearchParams();
  const { userProfile } = useAuth();
  const fid = sp?.get('franchise_id') || userProfile?.franchise_id || 'pfd';
  const bid = sp?.get('branch_id')    || userProfile?.branch_id    || 'pfd_b1';
  const lead_id = sp?.get('lead_id');

  const [form, setForm] = useState({
    customer_name:'', phone:'', email:'',
    event_type:'Wedding', event_date:'', event_start_time:'', event_end_time:'',
    hall_id:'', hall_name:'',
    expected_guest_count:'',
    quote_total:'', advance_amount:'', advance_date:'', advance_mode:'cash', advance_ref:'',
    notes:'',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm(p => ({...p, [k]:v}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.event_date) { setError('Customer name, phone, and event date are required'); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
        ...form,
        franchise_id: fid, branch_id: bid,
        ...(lead_id ? { lead_id } : {}),
        expected_guest_count: form.expected_guest_count ? Number(form.expected_guest_count) : null,
        quote_total: form.quote_total ? Number(form.quote_total) : 0,
        advance_amount: form.advance_amount ? Number(form.advance_amount) : 0,
      };
      const r = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(`/bookings/${d.booking_id}?franchise_id=${fid}&branch_id=${bid}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{maxWidth:720,margin:'0 auto'}}>
      <motion.div variants={fadeUp} style={{marginBottom:20}}>
        <Link href="/bookings" style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'var(--color-text-muted)',textDecoration:'none',marginBottom:8}}><ArrowLeft size={14}/>Back to Bookings</Link>
        <h1>New Booking</h1>
        {lead_id && <p style={{fontSize:13,color:'var(--color-text-muted)'}}>Creating from Lead: {lead_id}</p>}
      </motion.div>

      {error && <motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13}}>{error}</motion.div>}

      <form onSubmit={handleSubmit}>
        <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:12}}>Customer</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Name *</label><input className="input" required value={form.customer_name} onChange={e=>set('customer_name',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Phone *</label><input className="input" required value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
            <div className="form-field form-span-2"><label className="form-label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:12}}>Event</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Type</label><select className="input" value={form.event_type} onChange={e=>set('event_type',e.target.value)}>{EVENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Date *</label><input className="input" type="date" required value={form.event_date} onChange={e=>set('event_date',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Start Time</label><input className="input" type="time" value={form.event_start_time} onChange={e=>set('event_start_time',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">End Time</label><input className="input" type="time" value={form.event_end_time} onChange={e=>set('event_end_time',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Hall Name</label><input className="input" value={form.hall_name} onChange={e=>{set('hall_name',e.target.value);set('hall_id',e.target.value.toLowerCase().replace(/\s+/g,'_'));}}/></div>
            <div className="form-field"><label className="form-label">Expected Guests</label><input className="input" type="number" value={form.expected_guest_count} onChange={e=>set('expected_guest_count',e.target.value)}/></div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:12}}>Payment</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Total Quote (₹)</label><input className="input" type="number" value={form.quote_total} onChange={e=>set('quote_total',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Advance (₹)</label><input className="input" type="number" value={form.advance_amount} onChange={e=>set('advance_amount',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Advance Date</label><input className="input" type="date" value={form.advance_date} onChange={e=>set('advance_date',e.target.value)}/></div>
            <div className="form-field"><label className="form-label">Mode</label><select className="input" value={form.advance_mode} onChange={e=>set('advance_mode',e.target.value)}>{PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}</select></div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card" style={{padding:20,marginBottom:20}}>
          <div className="form-field form-span-2"><label className="form-label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} style={{resize:'vertical'}}/></div>
        </motion.div>

        <motion.div variants={fadeUp} style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <Link href="/bookings" className="btn btn-ghost" style={{textDecoration:'none'}}>Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>:<Save size={14}/>}{saving?'Creating…':'Create Booking'}</button>
        </motion.div>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}
