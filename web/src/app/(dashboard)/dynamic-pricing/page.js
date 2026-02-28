'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Info } from 'lucide-react';
import {
  calculateDynamicPrice,
  SEASONALITY_TABLE,
  DAY_FACTOR_TABLE,
  ADVANCE_BOOKING_TABLE,
  formatINR,
} from '@/lib/dynamic-pricing';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

// ── Factor Row ─────────────────────────────────────────────────────────────────
function FactorRow({ label, factor }) {
  const positive = factor.multiplier > 1;
  const neutral  = factor.multiplier === 1;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderRadius: 8,
      background: positive ? 'rgba(192,57,43,0.05)' : neutral ? 'var(--color-bg-alt)' : 'rgba(39,174,96,0.06)',
      border: '1px solid var(--color-border)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-h)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{factor.label}</div>
      </div>
      <div style={{
        fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)',
        color: positive ? '#c0392b' : neutral ? 'var(--color-text-muted)' : '#27ae60',
      }}>
        {factor.multiplier}×
      </div>
    </div>
  );
}

function RefTable({ title, rows, cols }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-h)', marginBottom: 12 }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>{cols.map(c => (
            <th key={c} style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>{c}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
              {Object.values(row).map((val, j) => (
                <td key={j} style={{ padding: '6px 8px', color: typeof val === 'number' ? (val > 1 ? '#c0392b' : val < 1 ? '#27ae60' : 'var(--color-text-body)') : 'var(--color-text-body)', fontWeight: typeof val === 'number' ? 700 : 400, fontFamily: typeof val === 'number' ? 'var(--font-mono)' : 'inherit' }}>
                  {typeof val === 'number' ? `${val}×` : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingCalculatorPage() {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    baseHallRent: 200000, basePricePerPlate: 800, guestCount: 0,
    eventDate: '', bookingDate: today, occupancyPercent: 60,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const result = useMemo(() => {
    if (!form.eventDate) return null;
    return calculateDynamicPrice({
      baseHallRent:      Number(form.baseHallRent)      || 0,
      basePricePerPlate: Number(form.basePricePerPlate) || 0,
      guestCount:        Number(form.guestCount)        || 0,
      eventDate:         new Date(form.eventDate),
      bookingDate:       new Date(form.bookingDate),
      occupancyPercent:  Number(form.occupancyPercent)  || 0,
    });
  }, [form]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/halls" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Halls
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator size={24} style={{ color: 'var(--color-primary)' }} /> Dynamic Pricing Calculator
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Formula: Base Price × SF × DF × OF × ABF</p>
        </div>
        <div className="page-actions">
          <Link href="/offers" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>View Offers & Promotions →</Link>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div variants={fadeUp} className="form-card">
            <div className="form-section-title">Base Pricing</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Base Hall Rent (₹)</label>
                <input className="input" type="number" min="0" value={form.baseHallRent} onChange={e => set('baseHallRent', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Price per Plate (₹)</label>
                <input className="input" type="number" min="0" value={form.basePricePerPlate} onChange={e => set('basePricePerPlate', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Guest Count</label>
                <input className="input" type="number" min="0" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} placeholder="0" />
                <span className="form-hint">Base = Hall Rent + (Plate × Guests)</span>
              </div>
            </div>
            <div className="form-section-title" style={{ marginTop: 24 }}>Demand Inputs</div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Event Date *</label>
                <input className="input" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} min={today} />
                <span className="form-hint">Sets Seasonality & Day-of-Week factors</span>
              </div>
              <div className="form-field">
                <label className="form-label">Booking Date</label>
                <input className="input" type="date" value={form.bookingDate} onChange={e => set('bookingDate', e.target.value)} />
                <span className="form-hint">Default: today — sets Advance Booking factor</span>
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Month Occupancy: <strong>{form.occupancyPercent}%</strong></label>
                <input type="range" min="0" max="100" step="5" value={form.occupancyPercent} onChange={e => set('occupancyPercent', e.target.value)} style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  <span>0% Empty</span><span>50% Normal</span><span>100% Full</span>
                </div>
                <span className="form-hint">OF = 1 + (occupancy / 100) × 0.5</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <RefTable title="📅 Seasonality Factors (SF)" cols={['Season', 'Months', 'Mult.']}
              rows={SEASONALITY_TABLE.map(r => ({ Season: r.season.split(' (')[0], Months: r.months, mult: r.multiplier }))} />
            <RefTable title="🗓 Day-of-Week Factors (DF)" cols={['Day', 'Mult.']}
              rows={DAY_FACTOR_TABLE.map(r => ({ Day: r.day, mult: r.multiplier }))} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <RefTable title="⏰ Advance Booking Factors (ABF)" cols={['Timing', 'Type', 'Mult.']}
              rows={ADVANCE_BOOKING_TABLE.map(r => ({ Range: r.range, Type: r.label, mult: r.multiplier }))} />
          </motion.div>
        </div>

        {/* Result Panel */}
        <motion.div variants={fadeUp} style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!result ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <Calculator size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Pick an event date to calculate dynamic price.</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>BASE PRICE</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-h)', fontFamily: 'var(--font-mono)' }}>{formatINR(result.basePrice)}</div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 12 }}>DEMAND MULTIPLIERS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <FactorRow label="Seasonality (SF)"      factor={result.sf} />
                  <FactorRow label="Day of Week (DF)"      factor={result.df} />
                  <FactorRow label="Occupancy (OF)"        factor={result.of} />
                  <FactorRow label="Advance Booking (ABF)" factor={result.abf} />
                </div>
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--color-primary-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>Combined</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{result.combinedMultiplier}×</span>
                </div>
              </div>
              <div className="card" style={{ padding: 20, background: 'var(--color-primary)', color: '#fff' }}>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>DYNAMIC PRICE</div>
                <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{formatINR(result.dynamicPrice)}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6, lineHeight: 1.6 }}>{result.breakdown}</div>
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', fontSize: 12 }}>
                  {result.dynamicPrice > result.basePrice
                    ? `+${formatINR(result.dynamicPrice - result.basePrice)} above base`
                    : `${formatINR(result.dynamicPrice - result.basePrice)} below base`}
                </div>
              </div>
              {result.daysAhead > 0 && (
                <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    <strong>{result.daysAhead} days</strong> before event · {result.abf.label}
                  </span>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
