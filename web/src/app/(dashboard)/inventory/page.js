'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const columns = [
  { key: 'name',        label: 'Item',      render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'category',    label: 'Category' },
  { key: 'unit',        label: 'Unit' },
  { key: 'currentStock', label: 'In Stock', render: (v, row) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: v < row.minStock ? 'var(--color-danger)' : 'var(--color-text-h)' }}>{v}</span> },
  { key: 'minStock',    label: 'Min Level', render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span> },
  { key: 'expiryDate',  label: 'Expiry Date', render: (v, row) => {
    if (!v) return <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>—</span>;
    const expiryDate = new Date(v);
    const today = new Date();
    const isExpired = expiryDate < today;
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    
    return (
      <span style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: 13,
        color: isExpired ? 'var(--color-danger)' : isExpiringSoon ? 'var(--color-warning)' : 'var(--color-text-h)',
        fontWeight: isExpired || isExpiringSoon ? 600 : 400
      }}>
        {expiryDate.toLocaleDateString('en-GB')}
      </span>
    );
  }},
  { key: 'pricePerUnit', label: 'Price/Unit', render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{v}</span> },
  { key: 'stockValue',  label: 'Value',      render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{v.toLocaleString()}</span> },
  { key: 'status',      label: 'Status',     render: v => <Badge variant={v === 'Low Stock' ? 'red' : 'green'}>{v}</Badge> },
];

export default function InventoryPage() {
  const { userProfile } = useAuth();
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const franchiseId = userProfile?.franchise_id || 'pfd';
        const branchId = userProfile?.branch_id || 'bh';
        
        const response = await fetch(`/api/kitchen-inventory?franchise_id=${franchiseId}&branch_id=${branchId}`);
        const result = await response.json();
        
        if (result.success) {
          // Transform the data to match the expected format
          const items = result.data.map(item => ({
            ...item,
            stockValue: item.currentStock * item.pricePerUnit,
            status: item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock'
          }));
          setInventoryData(items);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchInventory();
    }
  }, [userProfile]);

  const lowCount = inventoryData.filter(i => i.status === 'Low Stock').length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Inventory</h1>
          <p>{loading ? 'Loading...' : `${inventoryData.length} items · ${lowCount} low stock`}</p>
        </div>
        <div className="page-actions">
          <Link href="/purchase-orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}><Package size={14} /> Purchase Orders</Link>
          <Link href="/inventory/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Item</Link>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 20 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}>Error loading inventory: {error}</span>
        </motion.div>
      )}

      {!loading && lowCount > 0 && (
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)', marginBottom: 20 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}><strong>{lowCount} items</strong> are below minimum stock level. Consider creating purchase orders.</span>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Loading inventory...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={inventoryData}
            keyField="id"
            emptyMessage="No inventory items found. Add your first item to get started."
            mobileRender={(row) => {
              const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;
              const today = new Date();
              const isExpired = expiryDate && expiryDate < today;
              const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : null;
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
              
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{row.category} · {row.unit}</div>
                    </div>
                    <Badge variant={row.status === 'Low Stock' ? 'red' : 'green'}>{row.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: row.currentStock < row.minStock ? 'var(--color-danger)' : 'var(--color-text-h)', fontWeight: 600 }}>Stock: {row.currentStock}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>Min: {row.minStock}</span>
                    {expiryDate && (
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', 
                        color: isExpired ? 'var(--color-danger)' : isExpiringSoon ? 'var(--color-warning)' : 'var(--color-text-h)',
                        fontWeight: isExpired || isExpiringSoon ? 600 : 400
                      }}>
                        Exp: {expiryDate.toLocaleDateString('en-GB')}
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{row.stockValue.toLocaleString()}</span>
                  </div>
                </div>
              );
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
