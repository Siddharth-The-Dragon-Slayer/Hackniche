'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { vendorData } from '@/lib/mock-data';
import { Plus, Star } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

export default function VendorsPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Vendors</h1>
          <p>{vendorData.length} registered vendors</p>
        </div>
        <div className="page-actions">
          <Link href="/vendors/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Vendor</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendorData.map((v, i) => (
          <motion.div key={v.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{v.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: 4 }}>{v.type}</span>
              </div>
              <span className={`badge ${v.status === 'Active' ? 'badge-green' : 'badge-neutral'}`}>{v.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Contact</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{v.contact}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Phone</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{v.phone}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rate/Event</div><div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--color-text-h)' }}>{v.rate > 0 ? `₹${v.rate.toLocaleString()}` : 'Variable'}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rating</div><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="var(--color-star)" color="var(--color-star)" /><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>{v.rating}</span></div></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
