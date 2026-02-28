'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const CUISINES = ['South Indian', 'North Indian', 'Continental', 'Chinese', 'Mughlai', 'Fusion', 'Custom'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Hi-Tea', 'Cocktail'];

export default function CreateMenuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', cuisine: '', mealType: '', pricePerPerson: '', minPax: '', maxPax: '',
    description: '', isVeg: false, isVegan: false, isJain: false,
    branchId: '', isActive: true,
  });
  const [items, setItems] = useState([
    { course: 'Starters', items: ['Veg Manchurian', 'Samosa'] },
    { course: 'Main Course', items: ['Biryani', 'Dal Makhani', 'Paneer Butter Masala'] },
    { course: 'Desserts', items: ['Gulab Jamun', 'Ice Cream'] },
    { course: 'Beverages', items: ['Soft Drinks', 'Juices'] },
  ]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addCourse = () => setItems(p => [...p, { course: '', items: [''] }]);
  const updateCourse = (i, val) => setItems(p => p.map((c, idx) => idx === i ? { ...c, course: val } : c));
  const addItem = (i) => setItems(p => p.map((c, idx) => idx === i ? { ...c, items: [...c.items, ''] } : c));
  const updateItem = (ci, ii, val) => setItems(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.map((it, jdx) => jdx === ii ? val : it) } : c));
  const removeItem = (ci, ii) => setItems(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.filter((_, jdx) => jdx !== ii) } : c));
  const removeCourse = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/menus" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Menus
          </Link>
          <h1>Create Menu</h1>
          <p>Create a new banquet menu package</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Menu Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Menu Name *</label>
              <input className="input" placeholder="e.g. Grand South Indian Feast" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Cuisine *</label>
              <select className="input" value={form.cuisine} onChange={e => set('cuisine', e.target.value)}>
                <option value="">Select cuisine</option>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Meal Type</label>
              <select className="input" value={form.mealType} onChange={e => set('mealType', e.target.value)}>
                <option value="">Select type</option>
                {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Price per Person (₹) *</label>
              <input className="input" type="number" placeholder="0.00" value={form.pricePerPerson} onChange={e => set('pricePerPerson', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Minimum Pax</label>
              <input className="input" type="number" placeholder="50" value={form.minPax} onChange={e => set('minPax', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Maximum Pax</label>
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
            <div className="form-span-2">
              <label className="form-label">Description</label>
              <textarea className="input" rows={2} placeholder="Brief description of the menu..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {[['isVeg', 'Vegetarian'], ['isVegan', 'Vegan'], ['isJain', 'Jain']].map(([k, l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> {l}
              </label>
            ))}
          </div>
        </div>

        {/* Course builder */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Courses & Items</div>
            <button type="button" className="btn btn-ghost" onClick={addCourse} style={{ fontSize: 13 }}><Plus size={14} /> Add Course</button>
          </div>
          {items.map((course, ci) => (
            <div key={ci} style={{ marginBottom: 20, padding: 16, background: 'var(--color-surface-2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input className="input" placeholder="Course name (e.g. Starters)" value={course.course} onChange={e => updateCourse(ci, e.target.value)} style={{ flex: 1 }} />
                <button type="button" onClick={() => removeCourse(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {course.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="Item name" value={item} onChange={e => updateItem(ci, ii, e.target.value)} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeItem(ci, ii)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem(ci)} style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
                  <Plus size={12} /> Add Item
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <Link href="/menus" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/menus')}>
            <Save size={16} /> Save Menu
          </button>
        </div>
      </form>
    </div>
  );
}
