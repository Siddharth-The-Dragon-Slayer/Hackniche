'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Brain, Image } from 'lucide-react';

const mock = {
  id: 'DC-003', name: 'Royal Floral Wedding', theme: 'Floral', eventType: 'Wedding',
  colorPalette: 'Pastel Pink & White', basePrice: 75000, status: 'Active',
  minPax: 100, maxPax: 500, branch: 'All Branches',
  description: 'Elegant floral arrangements with premium roses, orchids, and fairy lights creating a dreamy ambiance.',
  tags: ['floral', 'wedding', 'premium', 'elegant'],
  images: [],
};

export default function DecorDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/decor" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Decor
          </Link>
          <h1>{mock.name}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {mock.theme} &bull; {mock.eventType} &bull; ₹{mock.basePrice.toLocaleString('en-IN')}
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{mock.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/decor/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Base Price', val: `₹${mock.basePrice.toLocaleString('en-IN')}` },
          { label: 'Min Pax', val: mock.minPax },
          { label: 'Max Pax', val: mock.maxPax },
          { label: 'Palette', val: mock.colorPalette },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {['Overview', 'AI Preview', 'Bookings'].map(t => (
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
              <div className="form-section-title">Package Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Branch</span><span>{mock.branch}</span></div>
                <div className="info-item"><span className="form-label">Colour Palette</span><span>{mock.colorPalette}</span></div>
                <div className="info-item form-span-2"><span className="form-label">Description</span><span>{mock.description}</span></div>
                <div className="info-item form-span-2">
                  <span className="form-label">Tags</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {mock.tags.map(t => (
                      <span key={t} style={{ background: 'var(--color-surface-2)', borderRadius: 20, padding: '2px 10px', fontSize: 12, border: '1px solid var(--color-border)' }}>{t}</span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" style={{ width: '100%' }}><Brain size={14} /> Generate AI Preview</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}>Assign to Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'AI Preview' && (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Brain size={40} style={{ margin: '0 auto 12px', color: 'var(--color-primary)' }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>AI Decor Preview</div>
          <p style={{ fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>Generate stunning AI-powered decor visualisations based on this package's theme, palette, and event type.</p>
          <button className="btn btn-primary"><Brain size={14} /> Generate 4 Preview Images</button>
        </div>
      )}

      {tab === 'Bookings' && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>All bookings using this decor package will appear here.</p>
          <Link href="/bookings" className="btn btn-ghost" style={{ marginTop: 12 }}>View Bookings</Link>
        </div>
      )}
    </div>
  );
}
