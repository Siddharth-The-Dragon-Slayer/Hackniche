'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    vendorId: '', branchId: '', expectedDelivery: '', notes: '', paymentTerms: 'Net 30',
  });
  const [items, setItems] = useState([{ name: '', sku: '', qty: '', unitPrice: '', unit: 'pcs' }]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setItem = (i, k, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const addItem = () => setItems(p => [...p, { name: '', sku: '', qty: '', unitPrice: '', unit: 'pcs' }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((sum, it) => sum + ((parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0)), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/purchase-orders" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Purchase Orders
          </Link>
          <h1>Create Purchase Order</h1>
          <p>Raise a new PO to a vendor</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 960 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Order Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Vendor *</label>
              <select className="input" value={form.vendorId} onChange={e => set('vendorId', e.target.value)}>
                <option value="">Select vendor</option>
                <option value="VND-001">Royal Supplies Co.</option>
                <option value="VND-002">Hyderabad Equipments</option>
                <option value="VND-003">Krishna Caterers</option>
              </select>
            </div>
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
              <label className="form-label">Expected Delivery Date</label>
              <input className="input" type="date" value={form.expectedDelivery} onChange={e => set('expectedDelivery', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Payment Terms</label>
              <select className="input" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                <option>Immediate</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>50% Advance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Line Items</div>
            <button type="button" className="btn btn-ghost" onClick={addItem} style={{ fontSize: 13 }}><Plus size={14} /> Add Item</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Name</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Unit</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 10px' }}><input className="input" placeholder="Item name" value={it.name} onChange={e => setItem(i, 'name', e.target.value)} style={{ minWidth: 120 }} /></td>
                    <td style={{ padding: '8px 10px' }}><input className="input" placeholder="SKU" value={it.sku} onChange={e => setItem(i, 'sku', e.target.value)} style={{ minWidth: 80 }} /></td>
                    <td style={{ padding: '8px 10px' }}>
                      <select className="input" value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)} style={{ minWidth: 60 }}>
                        {['pcs', 'kg', 'litres', 'boxes', 'sets', 'dozens'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px' }}><input className="input" type="number" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} style={{ minWidth: 60, textAlign: 'right' }} /></td>
                    <td style={{ padding: '8px 10px' }}><input className="input" type="number" value={it.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} style={{ minWidth: 80, textAlign: 'right' }} /></td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>₹{((parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0)).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 4px' }}><button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: '2px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: 32, fontSize: 14 }}><span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display: 'flex', gap: 32, fontSize: 14 }}><span style={{ color: 'var(--color-text-muted)' }}>GST (18%)</span><span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ display: 'flex', gap: 32, fontSize: 17, fontWeight: 700, color: 'var(--color-text-h)' }}><span>Total</span><span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Notes</div>
          <textarea className="input" rows={3} placeholder="Any special instructions for the vendor..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
        </div>

        <div className="form-actions">
          <Link href="/purchase-orders" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-ghost" onClick={() => {}}>Save as Draft</button>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/purchase-orders')}>
            <Save size={16} /> Submit PO
          </button>
        </div>
      </form>
    </div>
  );
}
