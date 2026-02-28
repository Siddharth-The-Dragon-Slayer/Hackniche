'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';

const TABS = ['Overview', 'Items', 'Bookings'];

const mock = {
  id: 'MN-001', name: 'Grand South Indian Feast', cuisine: 'South Indian', mealType: 'Lunch',
  pricePerPerson: 850, minPax: 50, maxPax: 500, status: 'Active', branch: 'All Branches',
  isVeg: true, isVegan: false, isJain: false, description: 'A lavish South Indian spread.',
  courses: [
    { course: 'Starters', items: ['Medu Vada', 'Samosa', 'Bajji'] },
    { course: 'Main Course', items: ['Biryani', 'Sambar Rice', 'Rasam', 'Avial', 'Chapati'] },
    { course: 'Desserts', items: ['Kheer', 'Halwa', 'Payasam'] },
    { course: 'Beverages', items: ['Buttermilk', 'Filter Coffee', 'Tea'] },
  ],
};

export default function MenuDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const m = mock;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/menus" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Menus
          </Link>
          <h1>{m.name}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {m.cuisine} &bull; {m.mealType} &bull; ₹{m.pricePerPerson}/person
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{m.status}</span>
            {m.isVeg && <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, border: '1px solid #86efac' }}>Veg</span>}
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/menus/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Price / Person', val: `₹${m.pricePerPerson}` },
          { label: 'Min Pax', val: m.minPax },
          { label: 'Max Pax', val: m.maxPax },
          { label: 'Courses', val: m.courses.length },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {['Overview', 'Items', 'Bookings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Menu Information</div>
          <div className="info-grid">
            <div className="info-item"><span className="form-label">Branch</span><span>{m.branch}</span></div>
            <div className="info-item"><span className="form-label">Dietary</span><span>{[m.isVeg && 'Vegetarian', m.isVegan && 'Vegan', m.isJain && 'Jain'].filter(Boolean).join(', ') || 'Non-Veg'}</span></div>
            <div className="info-item form-span-2"><span className="form-label">Description</span><span>{m.description}</span></div>
          </div>
        </div>
      )}

      {tab === 'Items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {m.courses.map((c, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="form-section-title">{c.course}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {c.items.map((item, j) => (
                  <span key={j} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: 'var(--color-text-body)' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Bookings' && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>All bookings using this menu will be listed here.</p>
          <Link href="/bookings" className="btn btn-ghost" style={{ marginTop: 12 }}>View Bookings</Link>
        </div>
      )}
    </div>
  );
}
