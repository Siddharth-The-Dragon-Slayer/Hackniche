'use client';
import { motion } from 'framer-motion';
import { reviewData } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Star, MessageSquare, QrCode, BrainCircuit } from 'lucide-react';

const SENTIMENT_V = { Positive: 'green', Negative: 'red', Neutral: 'neutral' };

export default function ReviewsPage() {
  const avgRating = (reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length).toFixed(1);
  const positive = reviewData.filter(r => r.sentiment === 'Positive').length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Reviews</h1>
          <p>{reviewData.length} reviews · {avgRating} avg rating</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><QrCode size={14} /> Generate QR</button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card"><div className="kpi-label">Total Reviews</div><div className="kpi-value">{reviewData.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Avg Rating</div><div className="kpi-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{avgRating} <Star size={18} fill="var(--color-star)" color="var(--color-star)" /></div></div>
        <div className="kpi-card"><div className="kpi-label">Positive</div><div className="kpi-value" style={{ color: 'var(--color-success)' }}>{positive}/{reviewData.length}</div></div>
        <div className="kpi-card"><div className="kpi-label">Responded</div><div className="kpi-value">{reviewData.filter(r => r.responded).length}/{reviewData.length}</div></div>
      </motion.div>

      {/* Reviews List */}
      <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviewData.map((r, i) => (
          <motion.div key={r.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{r.reviewer[0]}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-h)' }}>{r.reviewer}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.event} · {r.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge variant={SENTIMENT_V[r.sentiment] || 'neutral'}>{r.sentiment}</Badge>
                {!r.responded && <Badge variant="accent">Needs Response</Badge>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {[...Array(5)].map((_, j) => <Star key={j} size={16} fill={j < r.rating ? 'var(--color-star)' : 'transparent'} color="var(--color-star)" />)}
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-body)', lineHeight: 1.6 }}>&ldquo;{r.text}&rdquo;</p>
            {!r.responded && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm"><MessageSquare size={14} /> Reply</button>
                <button className="btn btn-outline btn-sm"><BrainCircuit size={14} /> AI Suggest</button>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
