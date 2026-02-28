'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    vendorId: '',
    vendorName: '',
    branchId: '',
    expectedDelivery: '',
    notes: '',
    paymentTerms: 'Net 30',
    paymentStatus: 'Pending',
    deliveryAddress: '',
    isInterstate: false,
    cgstRate: 0.09,
    sgstRate: 0.09,
    igstRate: 0.18,
  });
  
  const [items, setItems] = useState([
    { itemId: '', name: '', sku: '', qty: '', unitPrice: '', unit: 'kg', total: 0 }
  ]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setItem = (i, k, v) => {
    const newItems = items.map((it, idx) => {
      if (idx === i) {
        const updated = { ...it, [k]: v };
        // Calculate total for this item
        updated.total = (parseFloat(updated.qty) || 0) * (parseFloat(updated.unitPrice) || 0);
        return updated;
      }
      return it;
    });
    setItems(newItems);
  };
  
  const addItem = () => setItems(p => [...p, { itemId: '', name: '', sku: '', qty: '', unitPrice: '', unit: 'kg', total: 0 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  // Fetch vendors and inventory
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;
      const franchiseId = userProfile.franchise_id || 'pfd';
      
      // Fetch vendors
      try {
        const vendorRes = await fetch(`/api/kitchen-vendor?franchise_id=${franchiseId}`);
        const vendorResult = await vendorRes.json();
        if (vendorResult.success) {
          setVendors(vendorResult.data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
      
      // Fetch inventory items
      try {
        const invRes = await fetch(`/api/kitchen-inventory?franchise_id=${franchiseId}`);
        const invResult = await invRes.json();
        if (invResult.success) {
          setInventoryItems(invResult.data);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };
    
    fetchData();
  }, [userProfile]);

  // Handle vendor selection
  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    set('vendorId', vendorId);
    set('vendorName', vendor ? vendor.name : '');
  };

  // Handle inventory item selection
  const handleItemSelect = (idx, itemId) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      setItem(idx, 'itemId', itemId);
      setItem(idx, 'name', item.name);
      setItem(idx, 'sku', item.id);
      setItem(idx, 'unit', item.unit);
      setItem(idx, 'unitPrice', item.pricePerUnit || 0);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
  const cgst = form.isInterstate ? 0 : subtotal * form.cgstRate;
  const sgst = form.isInterstate ? 0 : subtotal * form.sgstRate;
  const igst = form.isInterstate ? subtotal * form.igstRate : 0;
  const totalTax = form.isInterstate ? igst : (cgst + sgst);
  const totalAmount = subtotal + totalTax;


  const validateForm = () => {
    const newErrors = {};
    if (!form.vendorId) newErrors.vendor = 'Vendor is required';
    if (!form.expectedDelivery) newErrors.delivery = 'Expected delivery date is required';
    if (items.length === 0 || items.every(it => !it.name)) newErrors.items = 'At least one item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      const branchId = userProfile?.branch_id || 'bh';

      const orderData = {
        franchise_id: franchiseId,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        branchId: branchId,
        items: items.filter(it => it.name).map(it => ({
          itemId: it.itemId,
          name: it.name,
          sku: it.sku,
          quantity: parseFloat(it.qty) || 0,
          unitPrice: parseFloat(it.unitPrice) || 0,
          unit: it.unit,
          total: it.total
        })),
        paymentStatus: form.paymentStatus,
        paymentTerms: form.paymentTerms,
        expectedDelivery: form.expectedDelivery,
        deliveryAddress: form.deliveryAddress,
        notes: form.notes,
        isInterstate: form.isInterstate,
        cgstRate: form.cgstRate,
        sgstRate: form.sgstRate,
        igstRate: form.igstRate,
      };

      const response = await fetch('/api/purchase-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/purchase-orders');
      } else {
        alert(`Failed to create purchase order: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
              <select className="input" value={form.vendorId} onChange={e => handleVendorChange(e.target.value)}>
                <option value="">Select vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {errors.vendor && <span style={{color: 'red', fontSize: 12}}>{errors.vendor}</span>}
            </div>
            <div>
              <label className="form-label">Expected Delivery Date *</label>
              <input className="input" type="date" value={form.expectedDelivery} onChange={e => set('expectedDelivery', e.target.value)} />
              {errors.delivery && <span style={{color: 'red', fontSize: 12}}>{errors.delivery}</span>}
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
            <div>
              <label className="form-label">Payment Status</label>
              <select className="input" value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="form-span-2">
              <label className="form-label">Delivery Address</label>
              <textarea className="input" rows={2} placeholder="Full delivery address" value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Tax Configuration</div>
          <div className="form-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={form.isInterstate} 
                  onChange={e => set('isInterstate', e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Interstate Purchase (IGST applies)</span>
              </label>
            </div>
            {!form.isInterstate ? (
              <>
                <div>
                  <label className="form-label">CGST Rate (%)</label>
                  <input className="input" type="number" step="0.01" value={form.cgstRate * 100} onChange={e => set('cgstRate', parseFloat(e.target.value) / 100 || 0)} />
                </div>
                <div>
                  <label className="form-label">SGST Rate (%)</label>
                  <input className="input" type="number" step="0.01" value={form.sgstRate * 100} onChange={e => set('sgstRate', parseFloat(e.target.value) / 100 || 0)} />
                </div>
              </>
            ) : (
              <div>
                <label className="form-label">IGST Rate (%)</label>
                <input className="input" type="number" step="0.01" value={form.igstRate * 100} onChange={e => set('igstRate', parseFloat(e.target.value) / 100 || 0)} />
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ marginBottom: 0 }}>Line Items</div>
            <button type="button" className="btn btn-ghost" onClick={addItem} style={{ fontSize: 13 }}><Plus size={14} /> Add Item</button>
          </div>
          {errors.items && <div style={{color: 'red', fontSize: 12, marginBottom: 12}}>{errors.items}</div>}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Select Item</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Name</th>
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
                    <td style={{ padding: '8px 10px' }}>
                      <select 
                        className="input" 
                        value={it.itemId} 
                        onChange={e => handleItemSelect(i, e.target.value)}
                        style={{ minWidth: 150 }}
                      >
                        <option value="">Select from inventory</option>
                        {inventoryItems.map(inv => (
                          <option key={inv.id} value={inv.id}>{inv.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <input 
                        className="input" 
                        placeholder="Or enter manually" 
                        value={it.name} 
                        onChange={e => setItem(i, 'name', e.target.value)} 
                        style={{ minWidth: 150 }} 
                      />
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <select className="input" value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)} style={{ minWidth: 60 }}>
                        {['kg', 'g', 'liter', 'ml', 'pieces', 'dozen', 'boxes', 'packets', 'bottles'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <input 
                        className="input" 
                        type="number" 
                        step="0.01"
                        value={it.qty} 
                        onChange={e => setItem(i, 'qty', e.target.value)} 
                        style={{ minWidth: 80, textAlign: 'right' }} 
                      />
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <input 
                        className="input" 
                        type="number" 
                        step="0.01"
                        value={it.unitPrice} 
                        onChange={e => setItem(i, 'unitPrice', e.target.value)} 
                        style={{ minWidth: 100, textAlign: 'right' }} 
                      />
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>₹{it.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 4px' }}>
                      <button 
                        type="button" 
                        onClick={() => removeItem(i)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: 40, fontSize: 14, minWidth: 280, justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {!form.isInterstate ? (
              <>
                <div style={{ display: 'flex', gap: 40, fontSize: 14, minWidth: 280, justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CGST ({(form.cgstRate * 100).toFixed(2)}%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', gap: 40, fontSize: 14, minWidth: 280, justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>SGST ({(form.sgstRate * 100).toFixed(2)}%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 40, fontSize: 14, minWidth: 280, justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>IGST ({(form.igstRate * 100).toFixed(2)}%)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 40, fontSize: 14, minWidth: 280, justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Tax</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', gap: 40, fontSize: 18, minWidth: 280, justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-text-h)', paddingTop: 8, borderTop: '2px solid var(--color-border)' }}>
              <span>Total Amount</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Notes</div>
          <textarea className="input" rows={3} placeholder="Any special instructions for the vendor..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
        </div>

        <div className="form-actions">
          <Link href="/purchase-orders" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            <Save size={16} /> {loading ? 'Creating...' : 'Submit PO'}
          </button>
        </div>
      </form>
    </div>
  );
}
