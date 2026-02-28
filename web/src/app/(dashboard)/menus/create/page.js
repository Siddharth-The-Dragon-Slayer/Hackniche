'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const CUISINES  = ['Indian Vegetarian', 'South Indian', 'North Indian', 'Jain Indian Vegetarian', 'Continental', 'Chinese', 'Mughlai', 'Fusion', 'Custom'];
const CATEGORIES = [
  { value: 'veg_premium', label: 'Premium Vegetarian' },
  { value: 'veg_classic', label: 'Classic Vegetarian' },
  { value: 'veg_economy', label: 'Economy Vegetarian' },
  { value: 'jain',        label: 'Jain Vegetarian' },
];

const DEFAULT_COURSES = [
  { course: 'Starters',    items: ['Veg Manchurian', 'Samosa'] },
  { course: 'Main Course', items: ['Biryani', 'Dal Makhani', 'Paneer Butter Masala'] },
  { course: 'Desserts',    items: ['Gulab Jamun', 'Ice Cream'] },
  { course: 'Beverages',   items: ['Soft Drinks', 'Juices'] },
];

export default function CreateMenuPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';

  const [form, setForm] = useState({
    menu_name:       '',
    cuisine:         'Indian Vegetarian',
    category:        'veg_classic',
    price_per_plate: '',
    serves_min:      '50',
    serves_max:      '500',
    description:     '',
    isVeg:           true,
    isVegan:         false,
    isJain:          false,
    status:          'active',
  });
  const [courses,    setCourses]    = useState(DEFAULT_COURSES);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addCourse = () => setCourses(p => [...p, { course: '', items: [''] }]);
  const updateCourse = (i, val)       => setCourses(p => p.map((c, idx) => idx === i ? { ...c, course: val } : c));
  const addItem      = (i)            => setCourses(p => p.map((c, idx) => idx === i ? { ...c, items: [...c.items, ''] } : c));
  const updateItem   = (ci, ii, val) => setCourses(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.map((it, jdx) => jdx === ii ? val : it) } : c));
  const removeItem   = (ci, ii)      => setCourses(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.filter((_, jdx) => jdx !== ii) } : c));
  const removeCourse = (i)           => setCourses(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!form.menu_name.trim()) { setSaveError('Menu name is required'); return; }
    if (!form.price_per_plate)  { setSaveError('Price per plate is required'); return; }

    setSaving(true);
    try {
      const res  = await fetch('/api/menus', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          franchise_id,
          branch_id,
          ...form,
          price_per_plate: Number(form.price_per_plate),
          serves_min:      Number(form.serves_min),
          serves_max:      Number(form.serves_max),
          courses,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push('/menus');
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/menus" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Menus
          </Link>
          <h1>Create Menu</h1>
          <p>Branch: <strong>{branch_id}</strong> &bull; Franchise: <strong>{franchise_id}</strong></p>
        </div>
      </div>

      {saveError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
          ⚠ {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        {/* ── Menu Details ───────────────────────────────── */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Menu Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Menu Name *</label>
              <input className="input" placeholder="e.g. Premium Vegetarian Feast" value={form.menu_name} onChange={e => set('menu_name', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Cuisine</label>
              <select className="input" value={form.cuisine} onChange={e => set('cuisine', e.target.value)}>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Price per Plate (₹) *</label>
              <input className="input" type="number" min="1" placeholder="650" value={form.price_per_plate} onChange={e => set('price_per_plate', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Minimum Pax</label>
              <input className="input" type="number" min="1" placeholder="50" value={form.serves_min} onChange={e => set('serves_min', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Maximum Pax</label>
              <input className="input" type="number" min="1" placeholder="500" value={form.serves_max} onChange={e => set('serves_max', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-span-2">
              <label className="form-label">Description</label>
              <textarea className="input" rows={2} placeholder="Brief description of the menu..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {[['isVeg', '🌿 Vegetarian'], ['isVegan', 'Vegan'], ['isJain', '🔶 Jain']].map(([k, l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> {l}
              </label>
            ))}
          </div>
        </div>

        {/* ── Courses & Items ────────────────────────────── */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Courses &amp; Items</div>
            <button type="button" className="btn btn-ghost" onClick={addCourse} style={{ fontSize: 13 }}>
              <Plus size={14} /> Add Course
            </button>
          </div>

          {courses.map((course, ci) => (
            <div key={ci} style={{ marginBottom: 20, padding: 16, background: 'var(--color-surface-2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input
                  className="input"
                  placeholder="Course name (e.g. Starters)"
                  value={course.course}
                  onChange={e => updateCourse(ci, e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeCourse(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {course.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      placeholder="Item name"
                      value={item}
                      onChange={e => updateItem(ci, ii, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={() => removeItem(ci, ii)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(ci)}
                  style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
            </div>
          ))}

          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Total items: <strong>{courses.reduce((s, c) => s + c.items.filter(Boolean).length, 0)}</strong>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────── */}
        <div className="form-actions">
          <Link href="/menus" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save Menu</>}
          </button>
        </div>
      </form>
    </div>
  );
}

