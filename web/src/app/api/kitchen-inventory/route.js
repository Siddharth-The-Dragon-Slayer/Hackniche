// Kitchen Inventory API Route
// Handles CRUD operations for kitchen-inventory with franchise_id based document IDs

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET - Fetch kitchen inventory items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const lowStock = searchParams.get('low_stock');

    if (!franchise_id) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id is required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('kitchen-inventory').doc(franchise_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: [],
        stats: {
          totalItems: 0,
          lowStockItems: 0,
          expiringItems: 0,
          totalValue: 0,
          categories: 0
        },
        message: 'No items found'
      });
    }

    const data = doc.data();
    let filteredData = data.items || [];

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
      stockPercentage: Math.round((item.currentStock / (item.maxStock || item.currentStock)) * 100),
      daysUntilExpiry: item.expiryDate ? 
        Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
        null,
      reorderSuggestion: item.currentStock <= item.minStock,
      isExpiringSoon: item.expiryDate ? 
        Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 :
        false,
      totalValue: (item.currentStock || 0) * (item.pricePerUnit || 0)
    }));

    const stats = {
      totalItems: enhancedData.length,
      lowStockItems: enhancedData.filter(item => item.reorderSuggestion).length,
      expiringItems: enhancedData.filter(item => item.isExpiringSoon && item.daysUntilExpiry > 0).length,
      totalValue: enhancedData.reduce((sum, item) => sum + (item.totalValue || 0), 0),
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
    const { franchise_id, name, category, unit, currentStock, minStock, branch_id } = body;

    // Validate required fields
    if (!franchise_id || !name || !category || !unit || currentStock === undefined || minStock === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: franchise_id, name, category, unit, currentStock, minStock'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('kitchen-inventory').doc(franchise_id);
    const doc = await docRef.get();

    // Generate unique item ID
    const itemId = `${franchise_id}_ki${Date.now().toString(36)}`;

    const newItem = {
      id: itemId,
      name,
      category,
      unit,
      currentStock: parseFloat(currentStock) || 0,
      minStock: parseFloat(minStock) || 0,
      maxStock: body.maxStock ? parseFloat(body.maxStock) : parseFloat(currentStock) * 2,
      pricePerUnit: body.pricePerUnit ? parseFloat(body.pricePerUnit) : 0,
      supplier: body.supplier || '',
      storageLocation: body.storageLocation || 'main-storage',
      expiryDate: body.expiryDate || null,
      isPerishable: body.isPerishable || false,
      brand: body.brand || '',
      notes: body.notes || '',
      branch_id: branch_id || 'bh',
      status: parseFloat(currentStock) <= parseFloat(minStock) ? 'low-stock' : 'in-stock',
      lastRestocked: new Date().toISOString().split('T')[0],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    if (doc.exists) {
      // Document exists, add item to items array
      const data = doc.data();
      const items = data.items || [];
      items.push(newItem);
      
      await docRef.update({
        items,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new document with first item
      await docRef.set({
        franchise_id,
        items: [newItem],
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }

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
    const { franchise_id, id, ...updateData } = body;

    if (!franchise_id || !id) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id and id are required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('kitchen-inventory').doc(franchise_id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Inventory not found'
      }, { status: 404 });
    }

    const data = doc.data();
    const items = data.items || [];
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Kitchen inventory item not found'
      }, { status: 404 });
    }

    const updatedItem = {
      ...items[itemIndex],
      ...updateData,
      status: (updateData.currentStock || items[itemIndex].currentStock) <= 
              (updateData.minStock || items[itemIndex].minStock) ? 
              'low-stock' : 'in-stock',
      updated: new Date().toISOString()
    };

    items[itemIndex] = updatedItem;
    
    await docRef.set({
      ...data,
      items,
      lastUpdated: new Date().toISOString()
    });

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
    const franchise_id = searchParams.get('franchise_id');
    const id = searchParams.get('id');

    if (!franchise_id || !id) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id and id are required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('kitchen-inventory').doc(franchise_id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Inventory not found'
      }, { status: 404 });
    }

    const data = doc.data();
    const items = data.items || [];
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Kitchen inventory item not found'
      }, { status: 404 });
    }

    const deletedItem = items[itemIndex];
    items.splice(itemIndex, 1);
    
    await docRef.set({
      ...data,  
      items,
      lastUpdated: new Date().toISOString()
    });

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