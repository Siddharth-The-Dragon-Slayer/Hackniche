'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import {
  Plus, Minus, AlertTriangle, Package, Search,
  TrendingDown, DollarSign, Clock, ShoppingCart, Bell,
  RefreshCw, Download, ArrowUpDown, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const CATEGORIES = ['All', 'Vegetables', 'Grains', 'Proteins', 'Spices', 'Oils', 'Beverages', 'Utensils', 'Equipment'];
const STATUS_FILTERS = ['All', 'In Stock', 'Low Stock', 'Expiring Soon'];

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function InventoryPage() {
  const { userProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || 'pfd';

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Stats
  const [stats, setStats] = useState({ totalItems: 0, lowStockItems: 0, expiringItems: 0, totalValue: 0 });

  // Low-stock alerts
  const [showAlerts, setShowAlerts] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/kitchen-inventory?franchise_id=${franchiseId}`);
      const result = await res.json();
      if (result.success) {
        const items = result.data.map(item => ({
          ...item,
          stockValue: (item.currentStock || 0) * (item.pricePerUnit || 0),
          status: item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock',
          daysUntilExpiry: item.expiryDate
            ? Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000)
            : null,
        }));
        setInventoryData(items);
        setStats({
          totalItems: items.length,
          lowStockItems: items.filter(i => i.status === 'Low Stock').length,
          expiringItems: items.filter(i => i.daysUntilExpiry !== null && i.daysUntilExpiry <= 7 && i.daysUntilExpiry > 0).length,
          totalValue: items.reduce((s, i) => s + (i.stockValue || 0), 0),
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile, franchiseId]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Filtered + sorted data
  const filteredData = inventoryData
    .filter(i => {
      if (searchTerm && !i.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !i.category?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (categoryFilter !== 'All' && i.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (statusFilter === 'Low Stock' && i.status !== 'Low Stock') return false;
      if (statusFilter === 'In Stock' && i.status !== 'In Stock') return false;
      if (statusFilter === 'Expiring Soon' && (i.daysUntilExpiry === null || i.daysUntilExpiry > 7 || i.daysUntilExpiry < 0)) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const updateStock = async (itemId, change) => {
    setUpdating(itemId);
    try {
      const item = inventoryData.find(i => i.id === itemId);
      if (!item) return;
      const newStock = Math.max(0, item.currentStock + change);
      const res = await fetch('/api/kitchen-inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ franchise_id: franchiseId, id: itemId, currentStock: newStock }),
      });
      const result = await res.json();
      if (result.success) {
        setInventoryData(prev => prev.map(i =>
          i.id === itemId
            ? { ...i, currentStock: newStock, stockValue: newStock * i.pricePerUnit, status: newStock <= i.minStock ? 'Low Stock' : 'In Stock' }
            : i
        ));
        setStats(prev => {
          const updated = inventoryData.map(i => i.id === itemId ? { ...i, currentStock: newStock } : i);
          return {
            ...prev,
            lowStockItems: updated.filter(i => (i.id === itemId ? newStock : i.currentStock) <= i.minStock).length,
            totalValue: updated.reduce((s, i) => s + ((i.id === itemId ? newStock : i.currentStock) * (i.pricePerUnit || 0)), 0),
          };
        });
      } else {
        alert(`Failed to update stock: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const lowStockItems = inventoryData.filter(i => i.status === 'Low Stock');
  const expiringItems = inventoryData.filter(i => i.daysUntilExpiry !== null && i.daysUntilExpiry <= 7 && i.daysUntilExpiry > 0);

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Unit', 'Current Stock', 'Min Stock', 'Price/Unit', 'Stock Value', 'Status', 'Expiry Date'];
    const rows = filteredData.map(i => [i.name, i.category, i.unit, i.currentStock, i.minStock, i.pricePerUnit, i.stockValue, i.status, i.expiryDate || '—']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `raw-materials-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'name', label: 'Material',
      render: (v, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-h)', display: 'block' }}>{v}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{row.category} · {row.supplier || '—'}</span>
        </div>
      )
    },
    { key: 'unit', label: 'Unit' },
    {
      key: 'currentStock', label: 'In Stock',
      render: (v, row) => {
        const pct = row.maxStock ? Math.round((v / row.maxStock) * 100) : 100;
        const color = v <= row.minStock ? '#ef4444' : pct < 40 ? '#f59e0b' : '#10b981';
        return (
          <div style={{ minWidth: 80 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color }}>{v} {row.unit}</span>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 4, height: 4, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
          </div>
        );
      }
    },
    {
      key: 'minStock', label: 'Min / Max',
      render: (v, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)' }}>
          {v} / {row.maxStock || '—'}
        </span>
      )
    },
    {
      key: 'expiryDate', label: 'Expiry',
      render: (v, row) => {
        if (!v) return <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>—</span>;
        const d = row.daysUntilExpiry;
        const expired = d !== null && d < 0;
        const soon = d !== null && d >= 0 && d <= 7;
        return (
          <div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: expired ? '#ef4444' : soon ? '#f59e0b' : 'var(--color-text-h)',
              fontWeight: expired || soon ? 600 : 400
            }}>
              {new Date(v).toLocaleDateString('en-GB')}
            </span>
            {(expired || soon) && (
              <span style={{ display: 'block', fontSize: 10, color: expired ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                {expired ? 'EXPIRED' : `${d} day${d !== 1 ? 's' : ''} left`}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'pricePerUnit', label: 'Price/Unit',
      render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(v)}</span>
    },
    {
      key: 'stockValue', label: 'Value',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(v)}</span>
    },
    {
      key: 'status', label: 'Status',
      render: v => <Badge variant={v === 'Low Stock' ? 'red' : 'green'}>{v}</Badge>
    },
    {
      key: 'actions', label: 'Quick Adjust',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => updateStock(row.id, -5)} disabled={updating === row.id || row.currentStock <= 0}
            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, opacity: updating === row.id || row.currentStock <= 0 ? 0.4 : 1 }}>
            -5
          </button>
          <button onClick={() => updateStock(row.id, -1)} disabled={updating === row.id || row.currentStock <= 0}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px', borderRadius: 6, cursor: 'pointer', display: 'flex', opacity: updating === row.id || row.currentStock <= 0 ? 0.4 : 1 }}>
            <Minus size={13} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: 13 }}>{row.currentStock}</span>
          <button onClick={() => updateStock(row.id, 1)} disabled={updating === row.id}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px', borderRadius: 6, cursor: 'pointer', display: 'flex', opacity: updating === row.id ? 0.4 : 1 }}>
            <Plus size={13} />
          </button>
          <button onClick={() => updateStock(row.id, 5)} disabled={updating === row.id}
            style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, opacity: updating === row.id ? 0.4 : 1 }}>
            +5
          </button>
        </div>
      )
    },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h1>Raw Material Management</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${stats.totalItems} materials · ${stats.lowStockItems} low stock · ${stats.expiringItems} expiring soon`}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchInventory} disabled={loading} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV} title="Export CSV">
            <Download size={14} /> Export
          </button>
          <Link href="/inventory/stock-deduction" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
            <TrendingDown size={14} /> Auto Deduct
          </Link>
          <Link href="/purchase-orders" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
            <ShoppingCart size={14} /> Purchase Orders
          </Link>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAlerts(!showAlerts)}
            style={{ position: 'relative' }}>
            <Bell size={14} /> Alerts
            {(stats.lowStockItems + stats.expiringItems) > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stats.lowStockItems + stats.expiringItems}
              </span>
            )}
          </button>
          <Link href="/inventory/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> Add Material
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!loading && (
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} style={{ color: '#6366f1' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)' }}>{stats.totalItems}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Materials</div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: stats.lowStockItems > 0 ? '1px solid #fca5a5' : undefined }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: stats.lowStockItems > 0 ? '#ef4444' : 'var(--color-text-h)' }}>{stats.lowStockItems}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Low Stock Items</div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: stats.expiringItems > 0 ? '1px solid #fde68a' : undefined }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: stats.expiringItems > 0 ? '#f59e0b' : 'var(--color-text-h)' }}>{stats.expiringItems}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Expiring Soon</div>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)' }}>{fmt(stats.totalValue)}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Inventory Value</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Low Stock Alerts Panel */}
      {showAlerts && (lowStockItems.length > 0 || expiringItems.length > 0) && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 20, marginBottom: 20, border: '1px solid #fca5a5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-h)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} style={{ color: '#ef4444' }} /> Stock Alerts
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAlerts(false)} style={{ fontSize: 12 }}>Dismiss</button>
          </div>

          {lowStockItems.length > 0 && (
            <div style={{ marginBottom: expiringItems.length > 0 ? 16 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                Low Stock ({lowStockItems.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lowStockItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.1)', fontSize: 13, flexWrap: 'wrap', gap: 8
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{item.name}</span>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>({item.category})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>
                        {item.currentStock} / {item.minStock} {item.unit}
                      </span>
                      <Link href="/purchase-orders/create" className="btn btn-primary" style={{
                        fontSize: 11, padding: '3px 10px', textDecoration: 'none', borderRadius: 6
                      }}>
                        Reorder
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringItems.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 8 }}>
                Expiring Within 7 Days ({expiringItems.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {expiringItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.05)',
                    border: '1px solid rgba(245,158,11,0.1)', fontSize: 13
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{item.name}</span>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>({item.currentStock} {item.unit})</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 600 }}>
                      {item.daysUntilExpiry} day{item.daysUntilExpiry !== 1 ? 's' : ''} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}>Error loading inventory: {error}</span>
        </motion.div>
      )}

      {/* Low stock warning banner */}
      {!loading && !showAlerts && stats.lowStockItems > 0 && (
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 12,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', marginBottom: 20,
          justifyContent: 'space-between', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-h)' }}>
              <strong>{stats.lowStockItems} material{stats.lowStockItems > 1 ? 's' : ''}</strong> below minimum stock level
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAlerts(true)} style={{ fontSize: 12 }}>
              View Alerts
            </button>
            <Link href="/purchase-orders/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', fontSize: 12 }}>
              <ShoppingCart size={13} /> Create Purchase Order
            </Link>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fadeUp} style={{
        display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search materials..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 34 }} />
        </div>
        <select className="input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
        <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}>
          {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => toggleSort(sortField === 'name' ? 'currentStock' : sortField === 'currentStock' ? 'stockValue' : 'name')}
          title={`Sort by ${sortField} (${sortDir})`}>
          <ArrowUpDown size={14} /> Sort: {sortField === 'name' ? 'Name' : sortField === 'currentStock' ? 'Stock' : 'Value'}
        </button>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-text-muted)', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Loading raw materials...</div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            keyField="id"
            emptyMessage="No raw materials found. Add your first item to get started."
            mobileRender={(row) => {
              const pct = row.maxStock ? Math.round((row.currentStock / row.maxStock) * 100) : 100;
              const barColor = row.currentStock <= row.minStock ? '#ef4444' : pct < 40 ? '#f59e0b' : '#10b981';
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{row.category} · {row.supplier || '—'}</div>
                    </div>
                    <Badge variant={row.status === 'Low Stock' ? 'red' : 'green'}>{row.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: barColor, fontSize: 14 }}>
                      {row.currentStock} {row.unit}
                    </span>
                    <div style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Min: {row.minStock}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, marginBottom: 10, color: 'var(--color-text-muted)' }}>
                    <span>{fmt(row.pricePerUnit)}/unit</span>
                    <span>Value: {fmt(row.stockValue)}</span>
                    {row.expiryDate && (
                      <span style={{ color: row.daysUntilExpiry !== null && row.daysUntilExpiry <= 7 ? '#f59e0b' : undefined }}>
                        Exp: {new Date(row.expiryDate).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => updateStock(row.id, -5)} disabled={updating === row.id || row.currentStock <= 0}
                      className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12, opacity: updating === row.id || row.currentStock <= 0 ? 0.4 : 1 }}>-5</button>
                    <button onClick={() => updateStock(row.id, -1)} disabled={updating === row.id || row.currentStock <= 0}
                      style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, opacity: updating === row.id || row.currentStock <= 0 ? 0.4 : 1 }}>
                      <Minus size={12} /> 1
                    </button>
                    <button onClick={() => updateStock(row.id, 1)} disabled={updating === row.id}
                      style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, opacity: updating === row.id ? 0.4 : 1 }}>
                      <Plus size={12} /> 1
                    </button>
                    <button onClick={() => updateStock(row.id, 5)} disabled={updating === row.id}
                      className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12, opacity: updating === row.id ? 0.4 : 1 }}>+5</button>
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
