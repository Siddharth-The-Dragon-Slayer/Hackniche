import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET - Fetch all purchase orders for a franchise
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get('franchise_id');

    if (!franchiseId) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id is required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('purchase-order').doc(franchiseId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No purchase orders found'
      });
    }

    const data = doc.data();
    const orders = data.orders || [];

    return NextResponse.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Purchase order GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch purchase orders',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create new purchase order
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id, vendorId, vendorName, items, paymentStatus, expectedDelivery } = body;

    // Validate required fields
    if (!franchise_id || !vendorId || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: franchise_id, vendorId, items'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('purchase-order').doc(franchise_id);
    const doc = await docRef.get();

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const cgst = subtotal * (body.cgstRate || 0.09);
    const sgst = subtotal * (body.sgstRate || 0.09);
    const igst = body.isInterstate ? subtotal * (body.igstRate || 0.18) : 0;
    const totalTax = body.isInterstate ? igst : (cgst + sgst);
    const totalAmount = subtotal + totalTax;

    // Generate PO ID
    const poId = `PO-${franchise_id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const newOrder = {
      id: poId,
      vendorId,
      vendorName,
      branchId: body.branchId || '',
      items,
      subtotal,
      cgst: body.isInterstate ? 0 : cgst,
      sgst: body.isInterstate ? 0 : sgst,
      igst: body.isInterstate ? igst : 0,
      cgstRate: body.cgstRate || 0.09,
      sgstRate: body.sgstRate || 0.09,
      igstRate: body.igstRate || 0.18,
      isInterstate: body.isInterstate || false,
      totalTax,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      paymentTerms: body.paymentTerms || 'Net 30',
      expectedDelivery: expectedDelivery || null,
      deliveryAddress: body.deliveryAddress || '',
      notes: body.notes || '',
      status: 'Ordered',
      orderDate: new Date().toISOString().split('T')[0],
      franchise_id,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    if (doc.exists) {
      // Document exists, add order to orders array
      const data = doc.data();
      const orders = data.orders || [];
      orders.push(newOrder);
      
      await docRef.update({
        orders,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new document with first order
      await docRef.set({
        franchise_id,
        orders: [newOrder],
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'Purchase order created successfully'
    });

  } catch (error) {
    console.error('Purchase order POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create purchase order',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update purchase order
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
    const docRef = db.collection('purchase-order').doc(franchise_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Purchase order not found'
      }, { status: 404 });
    }

    const data = doc.data();
    const orders = data.orders || [];
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Purchase order not found'
      }, { status: 404 });
    }

    // Update the order
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updated: new Date().toISOString()
    };

    await docRef.update({
      orders,
      lastUpdated: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: orders[orderIndex],
      message: 'Purchase order updated successfully'
    });

  } catch (error) {
    console.error('Purchase order PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update purchase order',
      details: error.message
    }, { status: 500 });
  }
}
