'use client';
import Link from 'next/link';
import { eventData } from '@/lib/mock-data';
import { Search, Calendar, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const statuses = ['All', 'Upcoming', 'In Progress', 'Completed'];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? eventData : eventData.filter(e => e.status === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Events</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>Manage day-of execution and checklists</p></div>
        <Link href="/calendar" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><Calendar size={14} /> Calendar View</Link>
      </div>

      <div className="tab-list">
        {statuses.map(s => <div key={s} className={`tab-item ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)}>{s}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {filtered.map(e => (
          <div key={e.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{e.name}</h3>
              <span className={`badge ${e.status === 'Completed' ? 'badge-green' : 'badge-accent'}`}>{e.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Hall</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.hall}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.date}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Guests</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.guests}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Staff</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{e.staff} assigned</div></div>
            </div>
            {/* Checklist Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                <span><CheckCircle2 size={12} style={{ display: 'inline' }} /> Checklist Progress</span>
                <span>{e.checklistDone}/{e.checklistTotal}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--color-primary-ghost)', overflow: 'hidden' }}>
                <div style={{ width: `${(e.checklistDone / e.checklistTotal) * 100}%`, height: '100%', background: 'var(--gradient-bar)', borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
