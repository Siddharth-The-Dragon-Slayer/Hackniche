'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { franchiseData } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Building2 } from 'lucide-react';

export default function FranchisesPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Franchises</h1>
          <p>{franchiseData.length} franchise partners</p>
        </div>
        <div className="page-actions">
          <Link href="/franchises/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Franchise</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {franchiseData.map((f, i) => (
          <motion.div key={f.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>{f.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{f.city}</div>
                </div>
              </div>
              <Badge variant={f.status === 'Active' ? 'green' : 'neutral'}>{f.status}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>Owner</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{f.owner}</div></div>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>Branches</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{f.branches}</div></div>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>Revenue</div><div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>₹{f.revenue ? (f.revenue/100000).toFixed(1) + 'L' : 'N/A'}</div></div>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>Plan</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{f.plan}</div></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
