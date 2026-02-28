'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Save, Brain } from 'lucide-react';
import { staggerContainer, fadeUp } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';


const THEMES = ['Floral', 'Royal', 'Rustic', 'Modern Minimal', 'Traditional', 'Bollywood', 'Garden', 'Beach', 'Fairy Tale', 'Corporate'];
const EVENT_TYPES = ['Wedding', 'Reception', 'Engagement', 'Birthday', 'Corporate', 'Anniversary', 'Baby Shower', 'Other'];
const COLOR_PALETTES = ['Pastel Pink & White', 'Gold & Maroon', 'Navy & Gold', 'Sage Green & Ivory', 'Lavender & White', 'Deep Red & Gold', 'Peach & Mint', 'Custom'];

export default function CreateDecorPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    name: '', theme: '', eventType: '', colorPalette: '', basePrice: '', pricePerUnit: '',
    minPax: '', maxPax: '', description: '', imageUrl: '', tags: '', branchId: '', isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSaveDecor = async () => {
    if (!form.name || !form.theme || !form.basePrice) {
      alert('Please fill in required fields: Name, Theme, and Base Price');
      return;
    }

    setLoading(true);
    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      
      const response = await fetch('/api/decor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          franchise_id: franchiseId,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Decor package created successfully!');
        router.push('/decor');
      } else {
        alert(`Failed to create decor: ${result.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating decor package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/decor" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            ← Back to Decor
          </Link>
          <h1>Add Decor Package</h1>
          <p>Create a new decoration theme or package</p>
        </div>
      </motion.div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        {/* Package Details Card */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Package Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Package Name *</label>
              <input className="input" placeholder="e.g. Royal Floral Wedding" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Theme *</label>
              <select className="input" value={form.theme} onChange={e => set('theme', e.target.value)}>
                <option value="">Select theme</option>
                {THEMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Event Type</label>
              <select className="input" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                <option value="">All event types</option>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Colour Palette</label>
              <select className="input" value={form.colorPalette} onChange={e => set('colorPalette', e.target.value)}>
                <option value="">Select palette</option>
                {COLOR_PALETTES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Base Price (₹) *</label>
              <input className="input" type="number" placeholder="0.00" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} />
              <span className="form-hint">Flat package price</span>
            </div>
            <div>
              <label className="form-label">Add-on per Extra Pax (₹)</label>
              <input className="input" type="number" placeholder="0.00" value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Min Pax</label>
              <input className="input" type="number" placeholder="50" value={form.minPax} onChange={e => set('minPax', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Max Pax</label>
              <input className="input" type="number" placeholder="500" value={form.maxPax} onChange={e => set('maxPax', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Branch</label>
              <select className="input" value={form.branchId} onChange={e => set('branchId', e.target.value)}>
                <option value="">All Branches</option>
                <option value="PFD-BH">Banjara Hills</option>
                <option value="PFD-JS">Jubilee Hills</option>
                <option value="PFD-SP">Secunderabad</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tags</label>
              <input className="input" placeholder="floral, outdoor, premium (comma-separated)" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Description</label>
              <textarea className="input" rows={3} placeholder="Describe what's included..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Cover Image URL</label>
              <input className="input" placeholder="https://res.cloudinary.com/..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} />
              <span className="form-hint">Or use AI to generate preview images after saving</span>
            </div>
          </div>
        </motion.div>

        {/* AI Tip Banner */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24, background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Brain size={28} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Preview Generation</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>After creating this package, use the AI Decor Preview tool to generate images based on the theme and palette.</div>
          </div>
        </motion.div>

        {/* Form Actions */}
        <motion.div variants={fadeUp} className="form-actions">
          <Link href="/decor" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={handleSaveDecor} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Decor Package'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
