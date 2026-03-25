'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Save, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import RazorpayButton from '@/components/shared/RazorpayButton';

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
    quote_total:'',
    advance_amount:'',        // how much advance to collect now
    balance_due_date:'',      // when to remind for balance payment
    notes:'',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [created, setCreated] = useState(null);

  const set = (k,v) => setForm(p => ({...p, [k]:v}));

  // Auto-calculate advance as 30% of quote
  const quoteTotal = Number(form.quote_total || 0);
  const advanceAmount = Number(form.advance_amount || 0);
  const balanceDue = quoteTotal - advanceAmount;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.event_date) {
      setError('Customer name, phone, and event date are required');
      return;
    }
    if (advanceAmount > quoteTotal) {
      setError('Advance cannot exceed total quote');
      return;
    }
    setSaving(true); setError(null);
    try {
      const payload = {
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email,
        event_type: form.event_type,
        event_date: form.event_date,
        event_start_time: form.event_start_time,
        event_end_time: form.event_end_time,
        hall_id: form.hall_id,
        hall_name: form.hall_name,
        expected_guest_count: form.expected_guest_count ? Number(form.expected_guest_count) : null,
        quote_total: quoteTotal,
        advance_amount: 0,          // advance not paid yet — will be paid via Razorpay
        balance_due_date: form.balance_due_date || null,
        notes: form.notes,
        franchise_id: fid,
        branch_id: bid,
        customer_uid: userProfile?.uid || null,
        ...(lead_id ? { lead_id } : {}),
      };
      const r = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);

      setCreated({
        booking_id: d.booking_id,
        quote_total: quoteTotal,
        advance_amount: advanceAmount,
        balance_due: balanceDue,
        balance_due_date: form.balance_due_date,
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        event_type: form.event_type,
        event_date: form.event_date,
      });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // After booking created — show advance payment screen
  if (created) {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{maxWidth:520,margin:'0 auto',paddingTop:40}}>
        <motion.div variants={fadeUp} className="card" style={{padding:32,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>🎉</div>
          <h2 style={{marginBottom:4}}>Booking Created!</h2>
          <p style={{color:'var(--color-text-muted)',fontSize:14,marginBottom:24}}>
            {created.event_type} for {created.customer_name} · {created.event_date}
          </p>

          {/* Payment breakdown */}
          <div style={{background:'var(--color-surface)',borderRadius:10,padding:'16px 20px',marginBottom:20,textAlign:'left'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid var(--color-border)'}}>
              <span style={{color:'var(--color-text-muted)'}}>Total Quote</span>
              <strong>₹{Number(created.quote_total).toLocaleString('en-IN')}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0',borderBottom:'1px solid var(--color-border)'}}>
              <span style={{color:'var(--color-text-muted)'}}>Advance to Pay Now</span>
              <strong style={{color:'#b8953f'}}>₹{Number(created.advance_amount).toLocaleString('en-IN')}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,padding:'6px 0'}}>
              <span style={{color:'var(--color-text-muted)'}}>
                Balance Due {created.balance_due_date ? `by ${new Date(created.balance_due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}` : 'before event'}
              </span>
              <strong style={{color:'#dc2626'}}>₹{Number(created.balance_due).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Advance payment via Razorpay */}
          {created.advance_amount > 0 ? (
            <div style={{marginBottom:16}}>
              <RazorpayButton
                amount={created.advance_amount}
                leadId={created.booking_id}
                customerName={created.customer_name}
                customerEmail={created.email}
                customerPhone={created.phone}
                description={`Advance — ${created.event_type} on ${created.event_date}`}
                paymentType="advance"
                franchiseId={fid}
                branchId={bid}
                recordedByUid={userProfile?.uid}
                recordedByName={userProfile?.name}
                onSuccess={() => router.push(`/bookings/${created.booking_id}?franchise_id=${fid}&branch_id=${bid}`)}
                onError={(msg) => setError(msg)}
              >
                Pay Advance ₹{Number(created.advance_amount).toLocaleString('en-IN')} Now
              </RazorpayButton>
              <p style={{fontSize:11,color:'var(--color-text-muted)',marginTop:8}}>
                You'll receive a reminder for the balance payment before your event.
              </p>
            </div>
          ) : (
            <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#92400e'}}>
              No advance set. You can pay from the booking page anytime.
            </div>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push(`/bookings/${created.booking_id}?franchise_id=${fid}&branch_id=${bid}`)}
          >
            Skip — View Booking
          </button>
        </motion.div>
        {error && <motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginTop:12,color:'#991b1b',fontSize:13}}>{error}</motion.div>}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </motion.div>
    );
  }

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
          <div style={{fontWeight:700,fontSize:12,textTransform:'uppercase',color:'var(--color-text-muted)',marginBottom:4}}>Payment</div>
          <p style={{fontSize:12,color:'var(--color-text-muted)',marginBottom:12}}>Set the total price and how much advance to collect now. The balance will be due before the event.</p>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Total Quote (₹)</label>
              <input className="input" type="number" placeholder="e.g. 200000" value={form.quote_total} onChange={e=>set('quote_total',e.target.value)}/>
            </div>
            <div className="form-field">
              <label className="form-label">Advance Amount (₹)</label>
              <input className="input" type="number" placeholder="e.g. 50000" value={form.advance_amount} onChange={e=>set('advance_amount',e.target.value)}/>
              {quoteTotal > 0 && advanceAmount > 0 && (
                <div style={{fontSize:11,color:'var(--color-text-muted)',marginTop:4}}>
                  Balance due: ₹{balanceDue.toLocaleString('en-IN')} ({Math.round((advanceAmount/quoteTotal)*100)}% advance)
                </div>
              )}
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">Balance Payment Due Date</label>
              <input className="input" type="date" value={form.balance_due_date} onChange={e=>set('balance_due_date',e.target.value)}/>
              <div style={{fontSize:11,color:'var(--color-text-muted)',marginTop:4}}>Customer will be reminded on this date to pay the remaining balance.</div>
            </div>
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
