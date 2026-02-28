'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { pricingRules } from '@/lib/mock-data';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, TrendingUp } from 'lucide-react';

const TYPE_V = { surge: 'red', off_peak: 'green', seasonal: 'accent', event: 'primary' };

export default function DynamicPricingPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Dynamic Pricing</h1>
          <p>{pricingRules.length} rules configured</p>
        </div>
        <div className="page-actions">
          <Link href="/dynamic-pricing/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New Rule</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pricingRules.map((rule, i) => (
          <motion.div key={rule.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-h)' }}>{rule.name}</div>
                  <Badge variant={TYPE_V[rule.type] || 'neutral'} style={{ marginTop: 4 }}>{rule.type?.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{rule.multiplier}x</div>
                <Badge variant={rule.active ? 'green' : 'neutral'}>{rule.active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{rule.condition}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
