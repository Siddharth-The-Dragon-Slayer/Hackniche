'use client';
import { reviewData } from '@/lib/mock-data';
import { Star, MessageSquare, QrCode, BrainCircuit } from 'lucide-react';

export default function ReviewsPage() {
  const avgRating = (reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length).toFixed(1);
  const positive = reviewData.filter(r => r.sentiment === 'Positive').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Reviews</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{reviewData.length} reviews &middot; {avgRating} avg rating</p></div>
        <button className="btn btn-outline btn-sm"><QrCode size={14} /> Generate QR</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-label">Total Reviews</div><div className="kpi-value">{reviewData.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Avg Rating</div><div className="kpi-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{avgRating} <Star size={18} fill="var(--color-star)" color="var(--color-star)" /></div></div>
        <div className="kpi-card"><div className="kpi-label">Positive</div><div className="kpi-value" style={{ color: 'var(--color-success)' }}>{positive}/{reviewData.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Responded</div><div className="kpi-value">{reviewData.filter(r => r.responded).length}/{reviewData.length}</div></div>
      </div>

      {/* Reviews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviewData.map(r => (
          <div key={r.id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--color-text-on-gold)' }}>{r.reviewer[0]}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-h)' }}>{r.reviewer}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.event} &middot; {r.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${r.sentiment === 'Positive' ? 'badge-green' : r.sentiment === 'Negative' ? 'badge-red' : 'badge-neutral'}`}>{r.sentiment}</span>
                {!r.responded && <span className="badge badge-warning">Needs Response</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < r.rating ? 'var(--color-star)' : 'transparent'} color="var(--color-star)" />)}
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-body)', lineHeight: 1.6 }}>&ldquo;{r.text}&rdquo;</p>
            {!r.responded && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button className="btn btn-outline btn-sm"><MessageSquare size={14} /> Reply</button>
                <button className="btn btn-outline btn-sm"><BrainCircuit size={14} /> AI Suggest</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
