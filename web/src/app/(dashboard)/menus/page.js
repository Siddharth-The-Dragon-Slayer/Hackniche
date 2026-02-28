'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { menuData } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

export default function MenusPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Menus</h1>
          <p>{menuData.length} menu packages</p>
        </div>
        <div className="page-actions">
          <Link href="/menus/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Create Menu</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuData.map((m, i) => (
          <motion.div key={m.id} variants={fadeUp} custom={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{m.name}</h3>
              <span className={`badge badge-green`}>{m.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Type</div><span className="badge badge-primary">{m.type}</span></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Price/Plate</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>₹{m.pricePerPlate}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Min Plates</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{m.minPlates}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Applicable</div><div style={{ fontSize: 14, color: 'var(--color-text-h)' }}>{m.applicableTo}</div></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
