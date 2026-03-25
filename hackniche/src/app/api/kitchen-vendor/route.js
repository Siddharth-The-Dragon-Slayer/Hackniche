import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET - Fetch all vendors for a franchise
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
    const snapshot = await db.collection('kitchen-vendor')
      .where('franchise_id', '==', franchiseId)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No vendors found'
      });
    }

    // Collect all vendors from all documents
    const allVendors = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.vendors && Array.isArray(data.vendors)) {
        allVendors.push(...data.vendors);
      }
    });

    return NextResponse.json({
      success: true,
      data: allVendors
    });

  } catch (error) {
    console.error('Kitchen vendor GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vendors',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Add new vendor
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id, name, category, phone } = body;

    // Validate required fields
    if (!franchise_id || !name || !category || !phone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: franchise_id, name, category, phone'
      }, { status: 400 });
    }

    const db = getAdminDb();
    
    // Auto-generate document ID
    const docRef = db.collection('kitchen-vendor').doc();
    const vendorId = `${franchise_id}_vnd${Date.now().toString(36)}`;

    const newVendor = {
      id: vendorId,
      name,
      category,
      contactName: body.contactName || '',
      phone,
      email: body.email || '',
      website: body.website || '',
      address: body.address || '',
      city: body.city || '',
      gstNumber: body.gstNumber || '',
      panNumber: body.panNumber || '',
      bankAccount: body.bankAccount || '',
      bankIfsc: body.bankIfsc || '',
      bankName: body.bankName || '',
      rateType: body.rateType || 'Fixed',
      baseRate: body.baseRate ? parseFloat(body.baseRate) : 0,
      notes: body.notes || '',
      status: 'Active',
      rating: 0,
      totalOrders: 0,
      franchise_id,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Create document with vendors array
    await docRef.set({
      franchise_id,
      vendors: [newVendor],
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: newVendor,
      message: 'Vendor added successfully'
    });

  } catch (error) {
    console.error('Kitchen vendor POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add vendor',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update vendor
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
    const snapshot = await db.collection('kitchen-vendor')
      .where('franchise_id', '==', franchise_id)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No vendors found for this franchise'
      }, { status: 404 });
    }

    // Find the document containing this vendor
    let updatedVendor = null;
    let docToUpdate = null;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.vendors && Array.isArray(data.vendors)) {
        const vendorIndex = data.vendors.findIndex(v => v.id === id);
        if (vendorIndex !== -1) {
          // Update the vendor
          data.vendors[vendorIndex] = {
            ...data.vendors[vendorIndex],
            ...updateData,
            updated: new Date().toISOString()
          };
          updatedVendor = data.vendors[vendorIndex];
          docToUpdate = doc;
          break;
        }
      }
    }

    if (!updatedVendor) {
      return NextResponse.json({
        success: false,
        error: 'Vendor not found'
      }, { status: 404 });
    }

    // Update the document
    await docToUpdate.ref.update({
      vendors: docToUpdate.data().vendors,
      lastUpdated: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: updatedVendor,
      message: 'Vendor updated successfully'
    });

  } catch (error) {
    console.error('Kitchen vendor PUT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update vendor',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete vendor
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get('franchise_id');
    const vendorId = searchParams.get('id');

    if (!franchiseId || !vendorId) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id and id are required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const snapshot = await db.collection('kitchen-vendor')
      .where('franchise_id', '==', franchiseId)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No vendors found for this franchise'
      }, { status: 404 });
    }

    // Find and remove the vendor
    let vendorRemoved = false;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.vendors && Array.isArray(data.vendors)) {
        const filteredVendors = data.vendors.filter(v => v.id !== vendorId);
        if (filteredVendors.length < data.vendors.length) {
          await doc.ref.update({
            vendors: filteredVendors,
            lastUpdated: new Date().toISOString()
          });
          vendorRemoved = true;
          break;
        }
      }
    }

    if (!vendorRemoved) {
      return NextResponse.json({
        success: false,
        error: 'Vendor not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Kitchen vendor DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete vendor',
      details: error.message
    }, { status: 500 });
  }
}
