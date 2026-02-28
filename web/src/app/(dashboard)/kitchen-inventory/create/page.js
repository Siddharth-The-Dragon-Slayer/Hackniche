'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormCard from '@/components/ui/FormCard';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { 
  kitchenCategories, 
  storageLocations, 
  usageFrequencies, 
  qualityGrades 
} from '@/lib/kitchen-inventory-data';

const subCategories = {
  vegetables: [
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'fresh-fruits', label: 'Fresh Fruits' },
    { value: 'seasonal-produce', label: 'Seasonal Produce' },
    { value: 'herbs', label: 'Fresh Herbs' }
  ],
  grains: [
    { value: 'rice-varieties', label: 'Rice Varieties' },
    { value: 'wheat-flour', label: 'Wheat & Flour' },
    { value: 'lentils', label: 'Lentils & Pulses' },
    { value: 'cereals', label: 'Cereals & Grains' }
  ],
  proteins: [
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'meat-poultry', label: 'Meat & Poultry' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'paneer-tofu', label: 'Paneer & Tofu' }
  ],
  spices: [
    { value: 'whole-spices', label: 'Whole Spices' },
    { value: 'ground-spices', label: 'Ground Spices' },
    { value: 'spice-mixes', label: 'Spice Mixes' },
    { value: 'salt-sugar', label: 'Salt & Sugar' }
  ],
  oils: [
    { value: 'cooking-oils', label: 'Cooking Oils' },
    { value: 'ghee-butter', label: 'Ghee & Butter' },
    { value: 'specialty-oils', label: 'Specialty Oils' }
  ],
  beverages: [
    { value: 'tea-coffee', label: 'Tea & Coffee' },
    { value: 'juices', label: 'Juices' },
    { value: 'water-soda', label: 'Water & Soda' },
    { value: 'milk-alternatives', label: 'Milk Alternatives' }
  ]
};

const units = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pieces', label: 'Pieces (pcs)' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packets', label: 'Packets' },
  { value: 'bottles', label: 'Bottles' }
];

export default function CreateKitchenInventoryPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    unit: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    supplier: '',
    storageLocation: '',
    storageTemp: 'room-temp',
    expiryDate: '',
    batchNumber: '',
    usageFrequency: 'daily',
    qualityGrade: 'standard',
    isPerishable: false,
    recipeUsage: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      const branchId = userProfile?.branch_id || 'bh';
      const kitchenManagerId = userProfile?.role === 'Kitchen Manager' ? userProfile.id : 'S004';

      // Prepare form data for API
      const itemData = {
        ...formData,
        currentStock: parseFloat(formData.currentStock) || 0,
        minStock: parseFloat(formData.minStock) || 0,
        maxStock: parseFloat(formData.maxStock) || 0,
        recipeUsage: formData.recipeUsage ? formData.recipeUsage.split(',').map(r => r.trim()) : [],
        franchise_id: franchiseId,
        branch_id: branchId,
        kitchen_manager_id: kitchenManagerId,
        lastRestocked: new Date().toISOString().split('T')[0],
        lastUsed: null
      };

      const response = await fetch('/api/kitchen-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (result.success) {
        // Success - redirect to inventory page
        router.push('/kitchen-inventory');
      } else {
        console.error('Failed to add item:', result.error);
        alert('Failed to add inventory item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('An error occurred while adding the item.');
    } finally {
      setLoading(false);
    }
  };

  const availableSubCategories = formData.category ? 
    subCategories[formData.category] || [] : [];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1>Add Kitchen Inventory Item</h1>
            <p>Add a new item to your kitchen inventory</p>
          </div>
        </div>
        <div className="page-actions">
          <Button 
            type="submit" 
            form="inventory-form" 
            loading={loading}
            disabled={loading}
          >
            <Save size={14} /> 
            {loading ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </motion.div>

      <form id="inventory-form" onSubmit={handleSubmit}>
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <motion.div variants={fadeUp}>
            <FormCard 
              title="Basic Information" 
              description="Essential item details"
              icon={Package}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="Item Name"
                  placeholder="e.g., Basmati Rice, Steel Ladle"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(value) => {
                      handleInputChange('category', value);
                      handleInputChange('subCategory', ''); // Reset subcategory
                    }}
                    options={kitchenCategories}
                    required
                  />

                  <Select
                    label="Sub Category"
                    value={formData.subCategory}
                    onChange={(value) => handleInputChange('subCategory', value)}
                    options={availableSubCategories}
                    disabled={!formData.category}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Select
                    label="Unit"
                    value={formData.unit}
                    onChange={(value) => handleInputChange('unit', value)}
                    options={units}
                    required
                  />

                  <Select
                    label="Quality Grade"
                    value={formData.qualityGrade}
                    onChange={(value) => handleInputChange('qualityGrade', value)}
                    options={qualityGrades}
                    required
                  />
                </div>

                <Input
                  label="Supplier"
                  placeholder="e.g., Fresh Grains Supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  required
                />
              </div>
            </FormCard>
          </motion.div>

          {/* Stock Information */}
          <motion.div variants={fadeUp}>
            <FormCard 
              title="Stock Information" 
              description="Quantity and pricing details"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Input
                    label="Current Stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
                    required
                  />

                  <Input
                    label="Min Stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                    required
                  />

                  <Input
                    label="Max Stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.maxStock}
                    onChange={(e) => handleInputChange('maxStock', e.target.value)}
                    required
                  />
                </div>



                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Select
                    label="Storage Location"
                    value={formData.storageLocation}
                    onChange={(value) => handleInputChange('storageLocation', value)}
                    options={storageLocations}
                    required
                  />

                  <Select
                    label="Usage Frequency"
                    value={formData.usageFrequency}
                    onChange={(value) => handleInputChange('usageFrequency', value)}
                    options={usageFrequencies}
                    required
                  />
                </div>
              </div>
            </FormCard>
          </motion.div>

          {/* Additional Details */}
          <motion.div variants={fadeUp}>
            <FormCard 
              title="Additional Details" 
              description="Extra information and tracking"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input
                    label="Batch Number"
                    placeholder="e.g., BR-240228"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  />

                  <Input
                    label="Expiry Date"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    id="isPerishable"
                    checked={formData.isPerishable}
                    onChange={(e) => handleInputChange('isPerishable', e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: 'var(--color-primary)'
                    }}
                  />
                  <label htmlFor="isPerishable" style={{ fontSize: 14, fontWeight: 500 }}>
                    This item is perishable
                  </label>
                </div>

                <Input
                  label="Recipe Usage"
                  placeholder="e.g., Biryani, Pulao, Fried Rice"
                  value={formData.recipeUsage}
                  onChange={(e) => handleInputChange('recipeUsage', e.target.value)}
                  description="Comma-separated list of dishes that use this item"
                />

                <div>
                  <label htmlFor="notes" style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, display: 'block' }}>
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Additional notes about this item..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: 80
                    }}
                  />
                </div>
              </div>
            </FormCard>
          </motion.div>

          {/* Preview */}
          <motion.div variants={fadeUp}>
            <FormCard 
              title="Preview" 
              description="Review your item details"
            >
              <div style={{ 
                padding: 16, 
                borderRadius: 8, 
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-h)' }}>
                      {formData.name || 'Item Name'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {formData.category && formData.subCategory ? 
                        `${formData.category} • ${formData.subCategory}` : 
                        'Category • Sub Category'
                      }
                    </div>
                  </div>
                  <div style={{ 
                    background: formData.currentStock <= formData.minStock ? 'var(--color-warning-ghost)' : 'var(--color-success-ghost)',
                    color: formData.currentStock <= formData.minStock ? 'var(--color-warning)' : 'var(--color-success)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {formData.currentStock <= formData.minStock ? 'Low Stock' : 'In Stock'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Stock: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formData.currentStock || 0} {formData.unit || 'units'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Quality: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formData.qualityGrade || 'standard'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12 }}>
                Document ID will be: <code style={{ background: 'var(--color-bg-alt)', padding: '2px 4px', borderRadius: 4 }}>
                  {userProfile?.franchise_id || 'pfd'}_ki{String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}
                </code>
              </div>
            </FormCard>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}