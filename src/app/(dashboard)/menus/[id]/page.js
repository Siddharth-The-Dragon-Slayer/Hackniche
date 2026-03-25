'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Loader2, Save, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const TABS = ['Overview', 'Items', 'Bookings'];

const CATEGORY_META = {
  veg_premium: { label: 'Premium Veg',  color: '#16a34a', bg: '#dcfce7' },
  veg_classic: { label: 'Classic Veg',  color: '#2563eb', bg: '#dbeafe' },
  veg_economy: { label: 'Economy Veg',  color: '#d97706', bg: '#fef3c7' },
  jain:        { label: 'Jain',         color: '#7c3aed', bg: '#ede9fe' },
};

export default function MenuDetailPage() {
  const params        = useParams();
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { userProfile } = useAuth();

  const menu_id      = params.id;
  const franchise_id = searchParams.get('franchise_id') || userProfile?.franchise_id || 'pfd';
  const branch_id    = searchParams.get('branch_id')    || userProfile?.branch_id    || 'pfd_b1';

  const [tab,      setTab]      = useState('Overview');
  const [menu,     setMenu]     = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editing,     setEditing]     = useState(false);
  const [editCourses, setEditCourses] = useState([]);
  const [editForm,    setEditForm]    = useState({});
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/menus/${menu_id}?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMenu(data.menu);
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [menu_id, franchise_id, branch_id]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const startEdit = () => {
    if (!menu) return;
    setEditForm({
      menu_name:       menu.menu_name,
      category:        menu.category,
      price_per_plate: menu.price_per_plate,
      serves_min:      menu.serves_min,
      serves_max:      menu.serves_max,
      description:     menu.description || '',
      cuisine:         menu.cuisine || '',
      isVeg:           menu.isVeg  ?? true,
      isVegan:         menu.isVegan ?? false,
      isJain:          menu.isJain  ?? false,
      status:          menu.status,
    });
    setEditCourses(courses.map(c => ({ course: c.course, items: [...c.items] })));
    setSaveError(null);
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const res  = await fetch(`/api/menus/${menu_id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          franchise_id,
          branch_id,
          ...editForm,
          courses: editCourses,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setEditing(false);
      await fetchMenu();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete menu "${menu?.menu_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/menus/${menu_id}?franchise_id=${franchise_id}&branch_id=${branch_id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push('/menus');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      setDeleting(false);
    }
  };

  // Edit course helpers
  const setEF = (k, v) => setEditForm(p => ({ ...p, [k]: v }));
  const addEC = ()              => setEditCourses(p => [...p, { course: '', items: [''] }]);
  const updateEC = (i, v)       => setEditCourses(p => p.map((c, idx) => idx === i ? { ...c, course: v } : c));
  const addEI  = (i)            => setEditCourses(p => p.map((c, idx) => idx === i ? { ...c, items: [...c.items, ''] } : c));
  const updateEI = (ci, ii, v) => setEditCourses(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.map((it, jdx) => jdx === ii ? v : it) } : c));
  const removeEI = (ci, ii)    => setEditCourses(p => p.map((c, idx) => idx === ci ? { ...c, items: c.items.filter((_, jdx) => jdx !== ii) } : c));
  const removeEC = (i)         => setEditCourses(p => p.filter((_, idx) => idx !== i));

  const meta = CATEGORY_META[menu?.category] || { label: menu?.category, color: '#64748b', bg: '#f1f5f9' };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--color-text-muted)', gap: 10 }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
        <Link href="/menus" className="btn btn-ghost">← Back to Menus</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/menus" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Menus
          </Link>
          <h1>{menu.menu_name}</h1>
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {menu.cuisine} &bull; ₹{menu.price_per_plate}/plate
            <span style={{ background: meta.bg, color: meta.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
            <span style={{ background: menu.status === 'active' ? '#dcfce7' : '#f1f5f9', color: menu.status === 'active' ? '#15803d' : '#64748b', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{menu.status}</span>
          </p>
        </div>
        <div className="page-actions">
          {!editing && (
            <>
              <button className="btn btn-ghost" onClick={startEdit}><Edit size={15} /> Edit</button>
              <button className="btn btn-ghost" onClick={handleDelete} disabled={deleting} style={{ color: '#dc2626' }}>
                {deleting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />} Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}><X size={15} /> Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Price / Plate', val: `₹${menu.price_per_plate}` },
          { label: 'Min Pax',       val: menu.serves_min },
          { label: 'Max Pax',       val: menu.serves_max },
          { label: 'Total Items',   val: menu.total_items || 0 },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────── */}
      {tab === 'Overview' && !editing && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Menu Information</div>
          <div className="info-grid">
            <div className="info-item"><span className="form-label">Branch</span><span>{menu.branch_id}</span></div>
            <div className="info-item"><span className="form-label">Franchise</span><span>{menu.franchise_id}</span></div>
            <div className="info-item"><span className="form-label">Category</span><span>{meta.label}</span></div>
            <div className="info-item"><span className="form-label">Cuisine</span><span>{menu.cuisine}</span></div>
            <div className="info-item">
              <span className="form-label">Dietary</span>
              <span>{[menu.isVeg && '🌿 Vegetarian', menu.isVegan && 'Vegan', menu.isJain && '🔶 Jain'].filter(Boolean).join(', ') || 'Standard'}</span>
            </div>
            <div className="info-item form-span-2"><span className="form-label">Description</span><span>{menu.description || '—'}</span></div>
          </div>
        </div>
      )}

      {/* ── Overview Edit Form ────────────────────────────── */}
      {tab === 'Overview' && editing && (
        <div className="card" style={{ padding: 24 }}>
          {saveError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>⚠ {saveError}</div>
          )}
          <div className="form-section-title">Edit Menu Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Menu Name *</label>
              <input className="input" value={editForm.menu_name} onChange={e => setEF('menu_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="input" value={editForm.category} onChange={e => setEF('category', e.target.value)}>
                {[['veg_premium','Premium Vegetarian'],['veg_classic','Classic Vegetarian'],['veg_economy','Economy Vegetarian'],['jain','Jain Vegetarian']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Price per Plate (₹)</label>
              <input className="input" type="number" value={editForm.price_per_plate} onChange={e => setEF('price_per_plate', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input" value={editForm.status} onChange={e => setEF('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="form-label">Min Pax</label>
              <input className="input" type="number" value={editForm.serves_min} onChange={e => setEF('serves_min', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Max Pax</label>
              <input className="input" type="number" value={editForm.serves_max} onChange={e => setEF('serves_max', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Description</label>
              <textarea className="input" rows={2} value={editForm.description} onChange={e => setEF('description', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {[['isVeg','🌿 Vegetarian'],['isVegan','Vegan'],['isJain','🔶 Jain']].map(([k,l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm[k]} onChange={e => setEF(k, e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> {l}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Items Tab ─────────────────────────────────────── */}
      {tab === 'Items' && !editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {courses.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No dishes added yet. <button className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={startEdit}>Edit to add items</button>
            </div>
          )}
          {courses.map((c, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="form-section-title">{c.course}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {c.items.map((item, j) => (
                  <span key={j} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '4px 14px', fontSize: 13, color: 'var(--color-text-body)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Items Edit ────────────────────────────────────── */}
      {tab === 'Items' && editing && (
        <div className="card" style={{ padding: 28 }}>
          {saveError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>⚠ {saveError}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Edit Courses &amp; Items</div>
            <button type="button" className="btn btn-ghost" onClick={addEC} style={{ fontSize: 13 }}><Plus size={14} /> Add Course</button>
          </div>
          {editCourses.map((course, ci) => (
            <div key={ci} style={{ marginBottom: 20, padding: 16, background: 'var(--color-surface-2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <input className="input" placeholder="Course name" value={course.course} onChange={e => updateEC(ci, e.target.value)} style={{ flex: 1 }} />
                <button type="button" onClick={() => removeEC(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {course.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="Item name" value={item} onChange={e => updateEI(ci, ii, e.target.value)} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeEI(ci, ii)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addEI(ci)} style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
                  <Plus size={12} /> Add Item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bookings Tab ──────────────────────────────────── */}
      {tab === 'Bookings' && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p>All bookings using this menu will be listed here.</p>
          <Link href="/bookings" className="btn btn-ghost" style={{ marginTop: 12 }}>View Bookings</Link>
        </div>
      )}
    </div>
  );
}

