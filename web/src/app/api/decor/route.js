import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

const db = getAdminDb();

// GET /api/decor - Fetch all decor packages for franchise
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get('franchise_id') || 'pfd';
    
    const snapshot = await db.collection('decor')
      .where('franchise_id', '==', franchiseId)
      .get();
    const decorData = [];
    
    snapshot.forEach((doc) => {
      decorData.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by created_at in memory (newest first)
    decorData.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: decorData,
      count: decorData.length
    });
    
  } catch (error) {
    console.error('Error fetching decor:', error);
    return NextResponse.json(
      { success: false, error: `Failed to fetch decor packages: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST /api/decor - Create new decor package
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id = 'pfd', ...decorData } = body;
    
    // Generate next decor ID for this franchise
    const snapshot = await db.collection('decor')
      .where('franchise_id', '==', franchise_id)
      .get();
    
    // Find the highest existing number
    let maxNum = 0;
    snapshot.forEach((doc) => {
      const docId = doc.id;
      const match = docId.match(new RegExp(`^${franchise_id}_d(\\d+)$`));
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    
    const nextId = `${franchise_id}_d${maxNum + 1}`;
    
    // Prepare decor data
    const newDecor = {
      ...decorData,
      franchise_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: decorData.status || 'Active',
      price: typeof decorData.basePrice === 'string' ? parseFloat(decorData.basePrice) : decorData.basePrice,
      suitableFor: decorData.eventType ? [decorData.eventType] : [],
      theme: decorData.theme || 'Custom'
    };
    
    // Save with custom document ID
    await db.collection('decor').doc(nextId).set(newDecor);
    
    return NextResponse.json({
      success: true,
      data: { id: nextId, ...newDecor },
      message: 'Decor package created successfully'
    });
    
  } catch (error) {
    console.error('Error creating decor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create decor package' },
      { status: 500 }
    );
  }
}