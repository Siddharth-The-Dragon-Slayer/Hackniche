'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { decorData } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Palette } from 'lucide-react';

export default function DecorPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Decor Packages</h1>
          <p>{decorData.length} packages</p>
        </div>
        <div className="page-actions">
          <Link href="/decor/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Create Package</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decorData.map((d, i) => (
          <motion.div key={d.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{d.name}</h3>
                <span className="badge badge-accent" style={{ marginTop: 6 }}>{d.theme}</span>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={20} style={{ color: 'var(--color-accent)' }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>₹{d.price?.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(d.suitableFor || []).map(s => <span key={s} className="badge badge-neutral">{s}</span>)}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
