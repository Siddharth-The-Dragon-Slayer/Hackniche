'use client';
import { inventoryData } from '@/lib/mock-data';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const lowCount = inventoryData.filter(i => i.status === 'Low Stock').length;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Inventory</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{inventoryData.length} items &middot; {lowCount} low stock</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/purchase-orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><Package size={14} /> Purchase Orders</Link>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Item</button>
        </div>
      </div>

      {lowCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', marginBottom: 20 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
          <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}><strong>{lowCount} items</strong> are below minimum stock level. Consider creating purchase orders.</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Item</th><th>Category</th><th>Unit</th><th>Stock</th><th>Min Level</th><th>Price/Unit</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            {inventoryData.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{item.name}</td>
                <td>{item.category}</td><td>{item.unit}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: item.currentStock < item.minStock ? 'var(--color-danger)' : 'var(--color-text-h)' }}>{item.currentStock}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{item.minStock}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.pricePerUnit}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.stockValue.toLocaleString()}</td>
                <td><span className={`badge ${item.status === 'Low Stock' ? 'badge-red' : 'badge-green'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
