'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const CATEGORIES = ['Crockery', 'Cutlery', 'Furniture', 'Linen', 'Decoration', 'Lighting', 'AV Equipment', 'Kitchen', 'Cleaning', 'Other'];
const UNITS = ['pcs', 'kg', 'litres', 'boxes', 'sets', 'rolls', 'dozens'];

export default function CreateInventoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', sku: '', category: '', unit: 'pcs', brand: '', description: '',
    totalStock: '', minStockAlert: '', costPerUnit: '', sellingPrice: '',
    branchId: '', vendorId: '', location: '', isActive: true,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Inventory
          </Link>
          <h1>Add Inventory Item</h1>
          <p>Add a new item to the branch stock</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Item Information</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Item Name *</label>
              <input className="input" placeholder="e.g. Round Dinner Plate" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">SKU / Code</label>
              <input className="input" placeholder="Auto-generated if blank" value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Unit of Measure</label>
              <select className="input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Brand</label>
              <input className="input" placeholder="Brand name (optional)" value={form.brand} onChange={e => set('brand', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Storage Location</label>
              <input className="input" placeholder="e.g. Shelf A-3, Store Room 2" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Description</label>
              <textarea className="input" rows={2} placeholder="Brief description or specifications..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Stock & Pricing</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Opening Stock *</label>
              <input className="input" type="number" placeholder="0" value={form.totalStock} onChange={e => set('totalStock', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Minimum Stock Alert</label>
              <input className="input" type="number" placeholder="10" value={form.minStockAlert} onChange={e => set('minStockAlert', e.target.value)} />
              <span className="form-hint">Alert triggered when stock falls below this</span>
            </div>
            <div>
              <label className="form-label">Cost per Unit (₹)</label>
              <input className="input" type="number" placeholder="0.00" value={form.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Selling Price per Unit (₹)</label>
              <input className="input" type="number" placeholder="0.00" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Assignment</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Branch *</label>
              <select className="input" value={form.branchId} onChange={e => set('branchId', e.target.value)}>
                <option value="">Select branch</option>
                <option value="PFD-BH">Banjara Hills</option>
                <option value="PFD-JS">Jubilee Hills</option>
                <option value="PFD-SP">Secunderabad</option>
              </select>
            </div>
            <div>
              <label className="form-label">Primary Vendor (Supplier)</label>
              <select className="input" value={form.vendorId} onChange={e => set('vendorId', e.target.value)}>
                <option value="">Select vendor (optional)</option>
                <option value="VND-001">Royal Supplies Co.</option>
                <option value="VND-002">Hyderabad Equipments</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/inventory" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/inventory')}>
            <Save size={16} /> Add Item
          </button>
        </div>
      </form>
    </div>
  );
}
