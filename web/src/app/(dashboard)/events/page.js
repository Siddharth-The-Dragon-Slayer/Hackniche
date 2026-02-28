'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { eventData } from '@/lib/mock-data';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Calendar, CheckCircle2 } from 'lucide-react';

const STATUSES = ['All', 'Upcoming', 'In Progress', 'Completed'];
const STATUS_VARIANT = { Completed: 'green', 'In Progress': 'primary', Upcoming: 'accent' };
import { useState } from 'react';

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? eventData : eventData.filter(e => e.status === activeTab);
  const tabs = STATUSES.map(s => ({ key: s, label: s, count: s === 'All' ? eventData.length : eventData.filter(e => e.status === s).length }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Events</h1>
          <p>Manage day-of execution and checklists</p>
        </div>
        <div className="page-actions">
          <Link href="/calendar" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><Calendar size={14} /> Calendar View</Link>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((e, i) => (
          <motion.div key={e.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{e.name}</h3>
              <Badge variant={STATUS_VARIANT[e.status] || 'neutral'}>{e.status}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Hall</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.hall}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.date}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Guests</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.guests}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Staff</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.staff} assigned</div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                <span><CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />Checklist Progress</span>
                <span>{e.checklistDone}/{e.checklistTotal}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--color-primary-ghost)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(e.checklistDone / e.checklistTotal) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'var(--gradient-bar)', borderRadius: 3 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
