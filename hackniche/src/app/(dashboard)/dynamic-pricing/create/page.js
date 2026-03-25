'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const HALLS = ['Grand Ballroom', 'Diamond Hall', 'Crystal Room', 'Garden Pavilion', 'Executive Suite'];
const MENUS = ['Grand South Indian Feast', 'Royal Mughlai Banquet', 'Continental Buffet', 'Vegan Delight', 'Live Counter Package'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CreateDynamicPricingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ruleName: '', ruleType: 'Festival', dateFrom: '', dateTo: '',
    recurringDays: [], halls: [], menus: [],
    modifierType: 'percentage_increase', modifierValue: '',
    priority: '1', active: true, notes: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleArr = (key, val) =>
    setForm(p => ({ ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val] }));

  const isRecurring = form.ruleType === 'Day-of-Week';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/dynamic-pricing" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Pricing Rules
          </Link>
          <h1>Create Pricing Rule</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Define when and how prices are adjusted</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/dynamic-pricing')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/dynamic-pricing')}><Save size={15} /> Save Rule</button>
        </div>
      </div>

      <div className="form-card">
        {/* Section 1: Rule Identity */}
        <div className="form-section-title">Rule Details</div>
        <div className="form-grid">
          <div className="form-field form-span-2">
            <label className="form-label">Rule Name *</label>
            <input className="input" placeholder="e.g. Diwali Festival Surcharge" value={form.ruleName} onChange={e => set('ruleName', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Rule Type *</label>
            <select className="input" value={form.ruleType} onChange={e => set('ruleType', e.target.value)}>
              {['Festival', 'Season', 'Day-of-Week', 'Custom'].map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="form-hint">
              {form.ruleType === 'Day-of-Week' ? 'Applies every selected day of the week'
                : form.ruleType === 'Festival' ? 'Applies to a fixed date range around a festival'
                : form.ruleType === 'Season' ? 'Applies across a wedding/event season'
                : 'Custom date range with manual trigger'}
            </span>
          </div>
          <div className="form-field">
            <label className="form-label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {['1', '2', '3', '4', '5'].map(p => <option key={p} value={p}>Priority {p} {p === '1' ? '(Highest)' : p === '5' ? '(Lowest)' : ''}</option>)}
            </select>
            <span className="form-hint">When multiple rules overlap, higher priority wins</span>
          </div>
        </div>

        {/* Date / Day Selector */}
        {!isRecurring ? (
          <>
            <div className="form-section-title" style={{ marginTop: 24 }}>Date Range</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">From Date *</label>
                <input className="input" type="date" value={form.dateFrom} onChange={e => set('dateFrom', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">To Date *</label>
                <input className="input" type="date" value={form.dateTo} onChange={e => set('dateTo', e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-section-title" style={{ marginTop: 24 }}>Active Days</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleArr('recurringDays', day)}
                  style={{
                    padding: '8px 16px', fontSize: 13, borderRadius: 20, cursor: 'pointer', border: '1.5px solid',
                    background: form.recurringDays.includes(day) ? 'var(--color-primary)' : 'transparent',
                    color: form.recurringDays.includes(day) ? '#fff' : 'var(--color-text-body)',
                    borderColor: form.recurringDays.includes(day) ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >{day}</button>
              ))}
            </div>
          </>
        )}

        {/* Price Modifier */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Price Modifier</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Modifier Type *</label>
            <select className="input" value={form.modifierType} onChange={e => set('modifierType', e.target.value)}>
              <option value="percentage_increase">Percentage Increase (%)</option>
              <option value="percentage_decrease">Percentage Decrease (%)</option>
              <option value="flat_increase">Flat Increase (₹)</option>
              <option value="flat_decrease">Flat Decrease (₹)</option>
              <option value="multiplier">Multiplier (×)</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">
              Value *{[' (%)', ' (%)', ' (₹)', ' (₹)', ' (×)'][['percentage_increase','percentage_decrease','flat_increase','flat_decrease','multiplier'].indexOf(form.modifierType)]}
            </label>
            <input
              className="input"
              type="number" min="0" step={form.modifierType === 'multiplier' ? '0.01' : '1'}
              placeholder={form.modifierType === 'multiplier' ? 'e.g. 1.25' : form.modifierType.includes('percentage') ? 'e.g. 20' : 'e.g. 5000'}
              value={form.modifierValue} onChange={e => set('modifierValue', e.target.value)}
            />
            {form.modifierType.includes('percentage') && <span className="form-hint">e.g. 20 = 20% {form.modifierType.includes('increase') ? 'increase' : 'decrease'} on base price</span>}
            {form.modifierType === 'multiplier' && <span className="form-hint">e.g. 1.5 = 1.5× base price</span>}
          </div>
        </div>

        {/* Scope */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Applies To</div>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Halls (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {HALLS.map(h => (
              <button key={h} type="button" onClick={() => toggleArr('halls', h)} style={{
                padding: '7px 14px', fontSize: 13, borderRadius: 8, cursor: 'pointer', border: '1.5px solid',
                background: form.halls.includes(h) ? 'var(--color-primary)' : 'transparent',
                color: form.halls.includes(h) ? '#fff' : 'var(--color-text-body)',
                borderColor: form.halls.includes(h) ? 'var(--color-primary)' : 'var(--color-border)',
              }}>{h}</button>
            ))}
          </div>
          <span className="form-hint">Leave blank to apply to all halls</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">Menus (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {MENUS.map(m => (
              <button key={m} type="button" onClick={() => toggleArr('menus', m)} style={{
                padding: '7px 14px', fontSize: 13, borderRadius: 8, cursor: 'pointer', border: '1.5px solid',
                background: form.menus.includes(m) ? 'var(--color-primary)' : 'transparent',
                color: form.menus.includes(m) ? '#fff' : 'var(--color-text-body)',
                borderColor: form.menus.includes(m) ? 'var(--color-primary)' : 'var(--color-border)',
              }}>{m}</button>
            ))}
          </div>
          <span className="form-hint">Leave blank to apply to all menus</span>
        </div>

        {/* Status & Notes */}
        <div className="form-section-title" style={{ marginTop: 24 }}>Additional</div>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Status</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {['Active', 'Inactive'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                  <input type="radio" name="active" checked={form.active === (s === 'Active')} onChange={() => set('active', s === 'Active')} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="form-field form-span-2">
            <label className="form-label">Internal Notes</label>
            <textarea className="input" rows={3} placeholder="e.g. Approved by GM on 2025-06-15" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => router.push('/dynamic-pricing')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => router.push('/dynamic-pricing')}><Save size={15} /> Save Rule</button>
        </div>
      </div>
    </div>
  );
}
