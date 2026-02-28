'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { calendarEvents } from '@/lib/mock-data';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const events = calendarEvents.filter(e => e.date === dateStr);
    cells.push({ day: d, events });
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const statusColor = (s) => s === 'confirmed' ? 'var(--color-success)' : s === 'tentative' ? 'var(--color-warning)' : 'var(--color-text-muted)';

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Calendar</h1>
        <Link href="/bookings/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New Booking</Link>
      </motion.div>

      <motion.div variants={fadeUp}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={prev} className="btn btn-outline btn-sm"><ChevronLeft size={16} /></button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)' }}>{MONTHS[month]} {year}</h2>
          <button onClick={next} className="btn btn-outline btn-sm"><ChevronRight size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d}</div>
          ))}
          {cells.map((c, i) => (
            <div key={i} style={{ minHeight: 100, padding: 8, border: '1px solid var(--color-border)', borderRadius: 8, background: c.day ? 'var(--color-bg-card)' : 'transparent' }}>
              {c.day && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-h)', marginBottom: 4 }}>{c.day}</div>
                  {c.events?.map(ev => (
                    <div key={ev.id} style={{ fontSize: 11, padding: '3px 6px', borderRadius: 4, marginBottom: 3, background: `${statusColor(ev.status)}15`, borderLeft: `3px solid ${statusColor(ev.status)}`, color: 'var(--color-text-body)' }}>
                      {ev.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
