'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import { 
  Plus, 
  AlertTriangle, 
  Package, 
  Search,
  Filter,
  Calendar,
  TrendingDown,
  Warehouse,
  Refrigerator,
  Thermometer
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'vegetables', label: 'Vegetables & Fruits' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'proteins', label: 'Proteins & Dairy' },
  { value: 'spices', label: 'Spices & Seasonings' },
  { value: 'oils', label: 'Oils & Fats' },
  { value: 'beverages', label: 'Beverages & Liquids' }
];

const STORAGE_ICONS = {
  'dry-store': Warehouse,
  'refrigerator': Refrigerator,
  'freezer': Thermometer,
  'pantry': Package,
  'kitchen-main': Package,
  'utensil-rack': Package
};

const columns = [
  { 
    key: 'name', 
    label: 'Item', 
    render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> 
  },
  { 
    key: 'category', 
    label: 'Category',
    render: v => (
      <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
        {v}
      </span>
    )
  },
  { 
    key: 'currentStock', 
    label: 'Stock', 
    render: (v, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ 
          fontFamily: 'var(--font-mono)', 
          fontWeight: 600,
          color: v <= row.minStock ? 'var(--color-danger)' : 'var(--color-text-h)' 
        }}>
          {v} {row.unit}
        </span>
        {v <= row.minStock && (
          <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
        )}
      </div>
    )
  },
  { 
    key: 'storageLocation', 
    label: 'Storage',
    render: v => {
      const Icon = STORAGE_ICONS[v] || Warehouse;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ textTransform: 'capitalize' }}>{v.replace('-', ' ')}</span>
        </div>
      );
    }
  },
  { 
    key: 'expiryDate', 
    label: 'Expiry',
    render: (v, row) => {
      if (!v) return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
      const daysLeft = Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
      const isExpiring = daysLeft <= 7;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            color: isExpiring ? 'var(--color-danger)' : 'var(--color-text-body)',
            fontSize: 13
          }}>
            {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
          </span>
          {isExpiring && <Calendar size={12} style={{ color: 'var(--color-warning)' }} />}
        </div>
      );
    }
  },
  { 
    key: 'totalValue', 
    label: 'Value', 
    render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        ₹{v.toLocaleString()}
      </span>
    )
  },
  { 
    key: 'status', 
    label: 'Status', 
    render: v => (
      <Badge variant={v === 'low-stock' ? 'red' : 'green'}>
        {v === 'low-stock' ? 'Low Stock' : 'In Stock'}
      </Badge>
    ) 
  },
];

export default function KitchenInventoryPage() {
  const { userProfile } = useAuth();
  const [inventoryData, setInventoryData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, [userProfile, selectedCategory]);

  const fetchInventoryData = async () => {
    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      
      let url = `/api/kitchen-inventory?franchise_id=${franchiseId}`;
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setInventoryData(result.data);
        setStats(result.stats);
      } else {
        console.error('Failed to fetch kitchen inventory:', result.error);
      }
    } catch (error) {
      console.error('Error fetching kitchen inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = CATEGORIES.map(cat => ({
    key: cat.value,
    label: cat.label,
    count: cat.value === 'all' ? inventoryData.length : 
           inventoryData.filter(item => item.category === cat.value).length
  }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Kitchen Inventory</h1>
          <p>
            {loading ? 'Loading...' : 
             `${filteredData.length} raw materials • ${stats.totalItems || 0} items in inventory`
            }
          </p>
        </div>
        <div className="page-actions">
          <Link href="/kitchen-inventory/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> Add Item
          </Link>
        </div>
      </motion.div>

      {/* Alert Cards */}
      {(stats.lowStockItems > 0 || stats.expiringItems > 0) && (
        <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {stats.lowStockItems > 0 && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                padding: '14px 20px', borderRadius: 12, 
                background: 'rgba(230,126,34,0.08)', 
                border: '1px solid rgba(230,126,34,0.2)' 
              }}>
                <TrendingDown size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>
                    {stats.lowStockItems} items low on stock
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Need immediate restocking
                  </div>
                </div>
              </div>
            )}
            
            {stats.expiringItems > 0 && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                padding: '14px 20px', borderRadius: 12, 
                background: 'rgba(231,76,60,0.08)', 
                border: '1px solid rgba(231,76,60,0.2)' 
              }}>
                <Calendar size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>
                    {stats.expiringItems} items expiring soon
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Use within 7 days
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Search items, suppliers, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
        
        <Tabs tabs={tabs} activeTab={selectedCategory} onChange={setSelectedCategory} />
      </motion.div>

      {/* Data Table */}
      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={filteredData}
          keyField="id"
          loading={loading}
          emptyMessage="No kitchen inventory items found"
          onRowClick={(item) => setSelectedItem(item)}
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>
                    {row.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {row.subCategory} • {row.supplier}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={row.status === 'low-stock' ? 'red' : 'green'}>
                    {row.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Stock: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {row.currentStock} {row.unit}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Value: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    ₹{row.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
      </motion.div>

      {/* Item Detail Modal */}
      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `${selectedItem.name} Details` : 'Item Details'}
        size="lg"
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="label-small">Current Stock</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedItem.currentStock} {selectedItem.unit}
                </div>
              </div>
              <div>
                <div className="label-small">Quality Grade</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {selectedItem.qualityGrade || 'Standard'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="label-small">Supplier</div>
                <div style={{ fontWeight: 500 }}>{selectedItem.supplier}</div>
              </div>
              <div>
                <div className="label-small">Storage Location</div>
                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedItem.storageLocation.replace('-', ' ')}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="label-small">Category</div>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {selectedItem.category}
                </span>
              </div>
              <div>
                <div className="label-small">Quality Grade</div>
                <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                  {selectedItem.qualityGrade}
                </span>
              </div>
            </div>

            {selectedItem.expiryDate && (
              <div>
                <div className="label-small">Expiry Information</div>
                <div style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  background: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)' 
                }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    Expires: {new Date(selectedItem.expiryDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Batch: {selectedItem.batchNumber}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <Link href={`/kitchen-inventory/${selectedItem.id}/edit`} style={{ flex: 1, textDecoration: 'none' }}>
                <Button variant="outline" style={{ width: '100%' }}>
                  Edit Item
                </Button>
              </Link>
              <Button style={{ flex: 1 }}>
                Restock Item
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}