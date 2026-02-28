# Kitchen Inventory System Test

## Database Structure

The kitchen inventory system uses franchise-based document IDs following this pattern:
`{franchise_id}_ki{item_number}`

### Document ID Examples:
- `pfd_ki001` - First item in the PFD franchise
- `pfd_ki002` - Second item in the PFD franchise
- `pfd_ki003` - Third item in the PFD franchise

## API Endpoints

### GET /api/kitchen-inventory
- Fetches all inventory items
- Supports franchise filtering
- Returns items with calculated stats

### POST /api/kitchen-inventory
- Creates new inventory item
- Auto-generates document ID with franchise pattern
- Calculates total value and stock status

### PUT /api/kitchen-inventory  
- Updates existing inventory item
- Recalculates derived fields

### DELETE /api/kitchen-inventory
- Removes inventory item by ID

## Test Data Structure

```javascript
{
  id: "pfd_ki001", // auto-generated
  name: "Basmati Rice",
  category: "ingredients",
  subCategory: "grains",
  unit: "kg",
  currentStock: 50,
  minStock: 10,
  maxStock: 100,
  pricePerUnit: 120,
  supplier: "Fresh Grains Supplier",
  storageLocation: "dry-store",
  expiryDate: "2024-06-15",
  batchNumber: "BR-240228",
  franchise_id: "pfd",
  branch_id: "bh",
  kitchen_manager_id: "S004",
  // Auto-calculated fields
  totalValue: 6000, // currentStock * pricePerUnit
  status: "in-stock", // based on currentStock vs minStock
  created: "2024-02-28T10:00:00Z",
  updated: "2024-02-28T10:00:00Z"
}
```

## Pages

1. `/kitchen-inventory` - Main inventory management page
2. `/kitchen-inventory/create` - Add new inventory item

## Features

- ✅ Franchise-based document ID generation
- ✅ Real-time stock status calculation
- ✅ Low stock and expiry alerts
- ✅ Category and storage location filtering
- ✅ Search functionality
- ✅ Form validation
- ✅ Preview before submission
- ✅ Responsive design

## Testing Instructions

1. Navigate to `/kitchen-inventory`
2. Click "Add Item" button
3. Fill out the form with test data
4. Verify document ID preview shows franchise pattern
5. Submit form
6. Verify item appears in main inventory list
7. Check that ID follows `{franchise_id}_ki{number}` pattern

## Database Connection Notes

Currently using mock data that simulates the franchise_id document pattern. 
In production, this would connect to Firestore with the same document structure.