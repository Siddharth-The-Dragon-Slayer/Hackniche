// Kitchen Inventory API Route
// Handles CRUD operations for kitchen_inventory with franchise_id based document IDs

import { NextResponse } from 'next/server';
import { kitchenInventoryData } from '@/lib/kitchen-inventory-data';

// GET - Fetch kitchen inventory items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id') || 'pfd';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const lowStock = searchParams.get('low_stock');

    let filteredData = kitchenInventoryData.filter(item => 
      item.franchise_id === franchise_id
    );

    if (category && category !== 'all') {
      filteredData = filteredData.filter(item => item.category === category);
    }

    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }

    if (lowStock === 'true') {
      filteredData = filteredData.filter(item => 
        item.currentStock <= item.minStock
      );
    }

    // Add calculated fields
    const enhancedData = filteredData.map(item => ({
      ...item,
      stockPercentage: Math.round((item.currentStock / item.maxStock) * 100),
      daysUntilExpiry: item.expiryDate ? 
        Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
        null,
      reorderSuggestion: item.currentStock <= item.minStock,
      isExpiringSoon: item.expiryDate ? 
        Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 :
        false
    }));

    const stats = {
      totalItems: enhancedData.length,
      lowStockItems: enhancedData.filter(item => item.reorderSuggestion).length,
      expiringItems: enhancedData.filter(item => item.isExpiringSoon && item.daysUntilExpiry > 0).length,
      totalValue: enhancedData.reduce((sum, item) => sum + item.totalValue, 0),
      categories: [...new Set(enhancedData.map(item => item.category))].length
    };

    return NextResponse.json({
      success: true,
      data: enhancedData,
      stats,
      message: `${enhancedData.length} items found`
    });

  } catch (error) {
    console.error('Kitchen inventory GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch kitchen inventory',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Add new kitchen inventory item
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Generate ID using franchise_id pattern
    const franchise_id = body.franchise_id || 'pfd';
    const itemCount = kitchenInventoryData.filter(item => 
      item.franchise_id === franchise_id
    ).length + 1;
    
    const newId = `${franchise_id}_ki${String(itemCount).padStart(3, '0')}`;

    const newItem = {
      id: newId,
      ...body,
      status: (body.currentStock || 0) <= (body.minStock || 0) ? 'low-stock' : 'in-stock',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    kitchenInventoryData.push(newItem);
    
    console.log('New kitchen inventory item added:', newId);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Kitchen inventory item added successfully'
    });

  } catch (error) {
    console.error('Kitchen inventory POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add kitchen inventory item',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update kitchen inventory item
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const itemIndex = kitchenInventoryData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Kitchen inventory item not found'
      }, { status: 404 });
    }

    const updatedItem = {
      ...kitchenInventoryData[itemIndex],
      ...updateData,
      totalValue: (updateData.currentStock || kitchenInventoryData[itemIndex].currentStock) * 
                  (updateData.pricePerUnit || kitchenInventoryData[itemIndex].pricePerUnit),
      status: (updateData.currentStock || kitchenInventoryData[itemIndex].currentStock) <= 
              (updateData.minStock || kitchenInventoryData[itemIndex].minStock) ? 
              'low-stock' : 'in-stock',
      updated: new Date().toISOString()
    };

    kitchenInventoryData[itemIndex] = updatedItem;

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Kitchen inventory item updated successfully'
    });

  } catch (error) {
    console.error('Kitchen inventory PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update kitchen inventory item',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Remove kitchen inventory item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const itemIndex = kitchenInventoryData.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Kitchen inventory item not found'
      }, { status: 404 });
    }

    const deletedItem = kitchenInventoryData.splice(itemIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedItem,
      message: 'Kitchen inventory item deleted successfully'
    });

  } catch (error) {
    console.error('Kitchen inventory DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete kitchen inventory item',
      details: error.message
    }, { status: 500 });
  }
}