'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const LEAD_SOURCES = ['Website','Google Ads','Facebook','Instagram','Walk-in','Referral','Just Dial','Sulekha','Wedding Wire','Pinterest','YouTube','LinkedIn','Twitter','WhatsApp','Newspaper','TV','Radio','Agency','Other'];

export default function CreateLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', altPhone: '', clientType: 'Individual',
    company: '', designation: '',
    eventType: 'Wedding', preferredDate: '', timeSlot: 'Full Day', guests: '', preferredHall: '',
    budgetMin: '', budgetMax: '', budgetFlex: 'Flexible',
    source: 'Walk-in', referrerName: '', referrerPhone: '',
    assignedTo: '', priority: 'Medium', nextFollowup: '', followupType: 'Call',
    notes: '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/leads" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>
          <h1>Create New Lead</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Capture enquiry details and assign for follow-up</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/leads')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/leads')}><Save size={15} /> Create Lead</button>
        </div>
      </div>

      <div className="form-card">
        {/* Section 1: Client Information */}
        <div className="form-section-title">Client Information</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="Rajesh Kumar" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone *</label>
            <input className="input" placeholder="+91-9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="rajesh@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Alternative Phone</label>
            <input className="input" placeholder="+91-9876543211" value={form.altPhone} onChange={e => set('altPhone', e.target.value)} />
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Client Type</label>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              {['Individual', 'Corporate'].map(ct => (
                <label key={ct} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                  <input type="radio" name="clientType" checked={form.clientType === ct} onChange={() => set('clientType', ct)} /> {ct}
                </label>
              ))}
            </div>
          </div>
        </div>

        {form.clientType === 'Corporate' && (
          <>
            <div className="form-section-title" style={{ marginTop: 20 }}>Corporate Details</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Company Name *</label>
                <input className="input" placeholder="Acme Corp Pvt Ltd" value={form.company} onChange={e => set('company', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Designation</label>
                <input className="input" placeholder="HR Manager" value={form.designation} onChange={e => set('designation', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* Section 2: Event Details */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Event Details</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Event Type *</label>
            <select className="input" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
              {['Wedding','Reception','Engagement','Birthday','Corporate','Sangeet','Anniversary','Baby Shower','Naming Ceremony','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Preferred Date</label>
            <input className="input" type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Time Slot</label>
            <select className="input" value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)}>
              {['Morning (6am–2pm)','Afternoon (12pm–8pm)','Evening (5pm–11pm)','Full Day'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Expected Guests</label>
            <input className="input" type="number" placeholder="500" value={form.guests} onChange={e => set('guests', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Preferred Hall</label>
            <select className="input" value={form.preferredHall} onChange={e => set('preferredHall', e.target.value)}>
              <option value="">No preference</option>
              {['Grand Ballroom','Open Air Lawn','Royal Hall','Rooftop Terrace','Crystal Room'].map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Section 3: Budget */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Budget</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Budget Min (₹)</label>
            <input className="input" type="number" placeholder="300000" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Budget Max (₹)</label>
            <input className="input" type="number" placeholder="600000" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Budget Flexibility</label>
            <select className="input" value={form.budgetFlex} onChange={e => set('budgetFlex', e.target.value)}>
              {['Flexible','Moderate','Fixed'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Section 4: Lead Source */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Lead Source</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Source *</label>
            <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
              {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {form.source === 'Referral' && (
            <>
              <div className="form-field">
                <label className="form-label">Referrer Name *</label>
                <input className="input" placeholder="Who referred this lead?" value={form.referrerName} onChange={e => set('referrerName', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Referrer Phone</label>
                <input className="input" placeholder="+91-..." value={form.referrerPhone} onChange={e => set('referrerPhone', e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Section 5: Assignment */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Assignment & Follow-up</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Assigned To *</label>
            <select className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              <option value="">Select staff...</option>
              {['Kavya Singh','Anil Verma','Deepa Reddy','Manish Shah'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Next Follow-up Date</label>
            <input className="input" type="date" value={form.nextFollowup} onChange={e => set('nextFollowup', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Follow-up Type</label>
            <select className="input" value={form.followupType} onChange={e => set('followupType', e.target.value)}>
              {['Call','Visit','Email','WhatsApp'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={4} placeholder="Any specific requirements or observations..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/leads')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/leads')}><Save size={15} /> Create Lead</button>
        </div>
      </div>
    </div>
  );
}
