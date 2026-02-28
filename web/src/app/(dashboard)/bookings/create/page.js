'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateBookingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    leadId: '', clientName: '', phone: '', email: '', eventType: 'Wedding',
    eventDate: '', timeSlot: 'Full Day', hall: '', guests: '',
    packageId: '', menuId: '', dietaryNotes: '',
    decorPackage: '', colorPref: '', decorNotes: '',
    basePrice: '', cateringTotal: '', decorTotal: '',
    festivalBadge: 'Diwali Season +20%',
    discount: '', discountReason: '', taxPct: '10',
    advanceAmount: '', advanceMode: 'Bank Transfer', paymentRef: '',
    specialReqs: '', accessibility: '', parking: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/bookings" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Bookings
          </Link>
          <h1>Create Booking</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Convert a lead or create a direct booking</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/bookings')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/bookings')}><Save size={15} /> Create Booking</button>
        </div>
      </div>

      <div className="form-card">
        {/* Section 1: Client & Event */}
        <div className="form-section-title">Client & Event</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            <label className="form-label">Link to Lead</label>
            <select className="input" value={form.leadId} onChange={e => set('leadId', e.target.value)}>
              <option value="">Select lead (optional)...</option>
              {['Rajesh Kumar (L001)','Priya Sharma (L002)','Suresh Menon (L003)'].map(l => <option key={l}>{l}</option>)}
            </select>
            <span className="form-hint">Linking auto-fills client details</span>
          </div>
          <div className="form-field">
            <label className="form-label">Client Name *</label>
            <input className="input" placeholder="Rajesh Kumar" value={form.clientName} onChange={e => set('clientName', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input className="input" placeholder="+91-9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="client@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Event Type *</label>
            <select className="input" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
              {['Wedding','Reception','Engagement','Birthday','Corporate','Sangeet','Anniversary','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Event Date *</label>
            <input className="input" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Time Slot</label>
            <select className="input" value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)}>
              {['Full Day','Morning (6am–2pm)','Afternoon (12pm–8pm)','Evening (5pm–11pm)'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Hall *</label>
            <select className="input" value={form.hall} onChange={e => set('hall', e.target.value)}>
              <option value="">Select hall...</option>
              {['Grand Ballroom','Open Air Lawn','Royal Hall','Rooftop Terrace','Crystal Room'].map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Expected Guests</label>
            <input className="input" type="number" placeholder="500" value={form.guests} onChange={e => set('guests', e.target.value)} />
          </div>
        </div>

        {/* Section 2: Package & Menu */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Package & Menu</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Package</label>
            <select className="input" value={form.packageId} onChange={e => set('packageId', e.target.value)}>
              <option value="">Select package...</option>
              {['Silver Package','Gold Package','Platinum Package','Diamond Package'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Menu</label>
            <select className="input" value={form.menuId} onChange={e => set('menuId', e.target.value)}>
              <option value="">Select menu...</option>
              {['Grand South Indian Feast','Royal Mughlai Banquet','Continental Buffet','Vegan Delight','Live Counter Package'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Dietary Notes</label>
            <input className="input" placeholder="e.g. Full Jain, No Onion/Garlic for 50 guests" value={form.dietaryNotes} onChange={e => set('dietaryNotes', e.target.value)} />
          </div>
        </div>

        {/* Section 3: Decor Selection */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Decor Selection</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Decor Package</label>
            <select className="input" value={form.decorPackage} onChange={e => set('decorPackage', e.target.value)}>
              <option value="">No decor / TBD</option>
              {['Royal Floral Wedding','Minimal Elegance','Rustic Charm','Grand Festive','Modern Chic'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Color Preference</label>
            <input className="input" placeholder="e.g. Gold & Ivory, Royal Blue" value={form.colorPref} onChange={e => set('colorPref', e.target.value)} />
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Custom Decor Notes</label>
            <textarea className="input" rows={2} placeholder="Any specific requirements for stage, entrance, table settings..." value={form.decorNotes} onChange={e => set('decorNotes', e.target.value)} />
          </div>
        </div>

        {/* Section 4: Financials */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Financials</div>
        {form.festivalBadge && (
          <div style={{ display: 'inline-block', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            ⚡ Dynamic Pricing Active: {form.festivalBadge}
          </div>
        )}
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Hall / Base Price (₹)</label>
            <input className="input" type="number" placeholder="150000" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Catering Total (₹)</label>
            <input className="input" type="number" placeholder="200000" value={form.cateringTotal} onChange={e => set('cateringTotal', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Decor Total (₹)</label>
            <input className="input" type="number" placeholder="85000" value={form.decorTotal} onChange={e => set('decorTotal', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Discount (₹)</label>
            <input className="input" type="number" placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Discount Reason</label>
            <input className="input" placeholder="e.g. Loyal customer, Referral" value={form.discountReason} onChange={e => set('discountReason', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Tax %</label>
            <input className="input" type="number" placeholder="10" value={form.taxPct} onChange={e => set('taxPct', e.target.value)} />
            <span className="form-hint">Auto-filled from branch settings</span>
          </div>
          <div className="form-field">
            <label className="form-label">Advance Amount (₹)</label>
            <input className="input" type="number" placeholder="100000" value={form.advanceAmount} onChange={e => set('advanceAmount', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Advance Payment Mode</label>
            <select className="input" value={form.advanceMode} onChange={e => set('advanceMode', e.target.value)}>
              {['Cash','Cheque','NEFT / IMPS','UPI','Credit Card','Debit Card'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Payment Reference / UTR</label>
            <input className="input" placeholder="TXN / UTR / Cheque No." value={form.paymentRef} onChange={e => set('paymentRef', e.target.value)} />
          </div>
        </div>

        {/* Section 5: Requirements */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Requirements</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            <label className="form-label">Special Requests</label>
            <textarea className="input" rows={3} placeholder="Stage setup, theme, orchestra, photo booth, etc." value={form.specialReqs} onChange={e => set('specialReqs', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-field">
            <label className="form-label">Accessibility Needs</label>
            <input className="input" placeholder="Wheelchair ramps, low stage, etc." value={form.accessibility} onChange={e => set('accessibility', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Parking Requirements</label>
            <input className="input" placeholder="e.g. Valet for 50 cars" value={form.parking} onChange={e => set('parking', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/bookings')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/bookings')}><Save size={15} /> Create Booking</button>
        </div>
      </div>
    </div>
  );
}
