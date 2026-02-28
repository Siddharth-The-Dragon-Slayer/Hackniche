'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const CATEGORIES = ['Vegetables', 'Grains', 'Proteins', 'Spices', 'Oils', 'Beverages', 'Utensils', 'Equipment'];
const UNITS = ['kg', 'g', 'liter', 'ml', 'pieces', 'dozen', 'boxes', 'packets', 'bottles'];

export default function CreateInventoryPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    name: '', sku: '', category: '', unit: 'kg', brand: '', description: '',
    currentStock: '', minStock: '', costPerUnit: '', expiryDate: '',
    supplier: '', location: '', isPerishable: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Item name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.currentStock || parseFloat(form.currentStock) < 0) {
      newErrors.currentStock = 'Valid current stock is required';
    }
    if (!form.minStock || parseFloat(form.minStock) < 0) {
      newErrors.minStock = 'Valid minimum stock is required';
    }
    if (!form.supplier?.trim()) newErrors.supplier = 'Supplier is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    console.log('Form submitted, starting validation...');
    
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    console.log('Validation passed, submitting data...');
    setLoading(true);
    
    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      const branchId = userProfile?.branch_id || 'bh';
      
      const itemData = {
        name: form.name,
        category: form.category,
        unit: form.unit,
        currentStock: parseFloat(form.currentStock) || 0,
        minStock: parseFloat(form.minStock) || 0,
        maxStock: parseFloat(form.currentStock) * 2,
        pricePerUnit: parseFloat(form.costPerUnit) || 0,
        supplier: form.supplier,
        storageLocation: form.location || 'main-storage',
        expiryDate: form.expiryDate || null,
        isPerishable: form.isPerishable,
        brand: form.brand || '',
        notes: form.description || '',
        franchise_id: franchiseId,
        branch_id: branchId,
      };
      
      console.log('Submitting item data:', itemData);
      
      const response = await fetch('/api/kitchen-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        console.log('Item saved successfully!');
        router.push('/inventory');
      } else {
        console.error('Failed to add item:', result.error);
        alert(`Failed to add inventory item: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`An error occurred while adding the item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Inventory
          </Link>
          <h1>Add Inventory Item</h1>
          <p>Add a new item to the branch stock hi</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Item Information</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Item Name *</label>
              <input className="input" placeholder="e.g. Round Dinner Plate" value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <span style={{color: 'red', fontSize: 12}}>{errors.name}</span>}
            </div>
            <div>
              <label className="form-label">Supplier *</label>
              <input className="input" placeholder="e.g. Fresh Grains Co." value={form.supplier} onChange={e => set('supplier', e.target.value)} />
              {errors.supplier && <span style={{color: 'red', fontSize: 12}}>{errors.supplier}</span>}
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <span style={{color: 'red', fontSize: 12}}>{errors.category}</span>}
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
              <label className="form-label">Current Stock *</label>
              <input className="input" type="number" step="0.01" placeholder="0" value={form.currentStock} onChange={e => set('currentStock', e.target.value)} />
              {errors.currentStock && <span style={{color: 'red', fontSize: 12}}>{errors.currentStock}</span>}
            </div>
            <div>
              <label className="form-label">Minimum Stock *</label>
              <input className="input" type="number" step="0.01" placeholder="10" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
              {errors.minStock && <span style={{color: 'red', fontSize: 12}}>{errors.minStock}</span>}
              <span className="form-hint">Alert triggered when stock falls below this</span>
            </div>
            <div>
              <label className="form-label">Cost per Unit (₹)</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.costPerUnit} onChange={e => set('costPerUnit', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Expiry Date</label>
              <input className="input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <input type="checkbox" id="isPerishable" checked={form.isPerishable} onChange={e => set('isPerishable', e.target.checked)} style={{width: 16, height: 16}} />
              <label htmlFor="isPerishable" className="form-label" style={{marginBottom: 0}}>Perishable Item</label>
            </div>
          </div>
        </div>



        <div className="form-actions">
          <Link href="/inventory" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            <Save size={16} /> {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
