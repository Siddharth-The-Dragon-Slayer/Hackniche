'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, Star, Calendar } from 'lucide-react';

const TABS = ['Overview', 'Bookings', 'Reviews', 'Documents'];

const mock = {
  id: 'VND-007', name: 'Krishna Flower Decorators', category: 'Decoration', contactName: 'Ram Prasad',
  phone: '+91-9876502222', email: 'krishna.decor@gmail.com', city: 'Hyderabad',
  address: 'Shop 12, Ameerpet', status: 'Active', gstNumber: '36ABCDE5678F1Z5',
  rateType: 'Fixed', baseRate: '₹45,000/event', rating: 4.6, totalEvents: 28,
};

export default function VendorDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const v = mock;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/vendors" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Vendors
          </Link>
          <h1>{v.name}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {v.category} &bull; {v.city}
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{v.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/vendors/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Events', val: v.totalEvents },
          { label: 'Rating', val: `${v.rating} ★` },
          { label: 'Rate', val: v.baseRate },
          { label: 'Rate Type', val: v.rateType },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Vendor Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Contact Name</span><span>{v.contactName}</span></div>
                <div className="info-item"><span className="form-label">Phone</span><span><a href={`tel:${v.phone}`}>{v.phone}</a></span></div>
                <div className="info-item"><span className="form-label">Email</span><span><a href={`mailto:${v.email}`}>{v.email}</a></span></div>
                <div className="info-item"><span className="form-label">GST Number</span><span>{v.gstNumber}</span></div>
                <div className="info-item form-span-2"><span className="form-label">Address</span><span>{v.address}, {v.city}</span></div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>Assign to Event</button>
                <button className="btn btn-ghost" style={{ width: '100%', color: '#dc2626' }}>Deactivate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {['Bookings', 'Reviews', 'Documents'].includes(tab) && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: 15 }}>{tab} for {v.name}</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Records will appear here as they are added.</p>
        </div>
      )}
    </div>
  );
}
