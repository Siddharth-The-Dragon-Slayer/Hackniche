/**
 * GET    /api/menus/[id]?franchise_id=pfd&branch_id=pfd_b1
 *   → fetch one menu + its dishes grouped by category
 *
 * PUT    /api/menus/[id]
 *   body: { franchise_id, branch_id, ...updatableFields }
 *   → update menu metadata (does NOT replace dishes)
 *
 * DELETE /api/menus/[id]?franchise_id=pfd&branch_id=pfd_b1
 *   → delete menu doc + all dishes in sub-collection
 */

import { getAdminDb } from '@/lib/firebase-admin';

const db = getAdminDb();
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

const detailKey = (fid, bid, mid) => `menus:${fid}:${bid}:${mid}`;
const listKey   = (fid, bid)      => `menus:${fid}:${bid}:list`;
const MENU_TTL  = 300;

// ── helpers ────────────────────────────────────────────────────────────────

function menuDocRef(franchise_id, branch_id, menu_id) {
  return db.collection('menus').doc(franchise_id)
    .collection('branches').doc(branch_id)
    .collection('menus').doc(menu_id);
}

function dishesCol(franchise_id, branch_id, menu_id) {
  return db.collection('menus').doc(franchise_id)
    .collection('branches').doc(branch_id)
    .collection('menus').doc(menu_id)
    .collection('dishes');
}

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET(request, { params }) {
  try {
    const { id: menu_id } = await params;
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: 'franchise_id and branch_id are required' },
        { status: 400 },
      );
    }

    // ── Cache check ──────────────────────────────────
    const cKey   = detailKey(franchise_id, branch_id, menu_id);
    const cached = cache.get(cKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    // Fetch menu doc + dishes in parallel (2 reads total instead of N+1)
    const [menuSnap, dishesSnap] = await Promise.all([
      menuDocRef(franchise_id, branch_id, menu_id).get(),
      dishesCol(franchise_id, branch_id, menu_id).get(),
    ]);

    if (!menuSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 },
      );
    }

    const menu   = { id: menuSnap.id, ...menuSnap.data() };
    const dishes = dishesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Group dishes into courses for the form format
    const CATEGORY_ORDER = ['starter', 'main', 'rice', 'bread', 'sweet', 'beverage'];
    const CATEGORY_LABELS = {
      starter:  'Starters',
      main:     'Main Course',
      rice:     'Rice',
      bread:    'Breads',
      sweet:    'Desserts',
      beverage: 'Beverages',
    };

    const grouped = {};
    for (const dish of dishes) {
      const cat = dish.category || 'main';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(dish);
    }

    const courses = CATEGORY_ORDER
      .filter(cat => grouped[cat]?.length)
      .map(cat => ({
        course: CATEGORY_LABELS[cat] || cat,
        items:  grouped[cat].map(d => d.dish_name),
        dishes: grouped[cat],
      }));

    const payload = { success: true, menu, courses, total_dishes: dishes.length };
    cache.set(cKey, payload, MENU_TTL);

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[GET /api/menus/[id]]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────

export async function PUT(request, { params }) {
  try {
    const { id: menu_id } = await params;
    const body = await request.json();
    const {
      franchise_id,
      branch_id,
      menu_name,
      category,
      price_per_plate,
      serves_min,
      serves_max,
      description,
      cuisine,
      highlights,
      isVeg,
      isVegan,
      isJain,
      status,
      courses,
    } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: 'franchise_id and branch_id are required' },
        { status: 400 },
      );
    }

    const ref = menuDocRef(franchise_id, branch_id, menu_id);

    // Check existence
    const snap = await ref.get();
    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 },
      );
    }

    // Build update payload — only include fields that were provided
    const updates = { updated_at: db.FieldValue.serverTimestamp() };
    if (menu_name      !== undefined) updates.menu_name       = menu_name;
    if (category       !== undefined) updates.category        = category;
    if (price_per_plate !== undefined) updates.price_per_plate = Number(price_per_plate);
    if (serves_min     !== undefined) updates.serves_min      = Number(serves_min);
    if (serves_max     !== undefined) updates.serves_max      = Number(serves_max);
    if (description    !== undefined) updates.description     = description;
    if (cuisine        !== undefined) updates.cuisine         = cuisine;
    if (highlights     !== undefined) updates.highlights      = highlights;
    if (isVeg          !== undefined) updates.isVeg           = isVeg;
    if (isVegan        !== undefined) updates.isVegan         = isVegan;
    if (isJain         !== undefined) updates.isJain          = isJain;
    if (status         !== undefined) updates.status          = status;

    // If courses provided, recalculate total_items
    if (courses) {
      updates.total_items = courses.reduce(
        (sum, c) => sum + (Array.isArray(c.items) ? c.items.filter(Boolean).length : 0),
        0,
      );
    }

    await ref.update(updates);

    // If courses array provided → replace dishes sub-collection
    if (Array.isArray(courses)) {
      const dishCol     = dishesCol(franchise_id, branch_id, menu_id);
      const existingSnap = await dishCol.get();

      const batch = db.batch();

      // Delete existing dishes
      existingSnap.docs.forEach(d => batch.delete(d.ref));

      // Write new dishes
      const isJainMenu = isJain ?? snap.data().isJain ?? false;
      const isVeganMenu = isVegan ?? snap.data().isVegan ?? false;

      for (const courseObj of courses) {
        const { course, items = [] } = courseObj;
        for (const itemName of items.filter(Boolean)) {
          const newDishRef = dishCol.doc();
          batch.set(newDishRef, {
            dish_name:   itemName.trim(),
            category:    normalizeCourseToCategory(course),
            veg_type:    isJainMenu ? 'jain' : isVeganMenu ? 'vegan' : 'vegetarian',
            spice_level: 'medium',
            description: '',
            ingredients: [],
            is_signature: false,
            status:      'available',
            created_at:  db.FieldValue.serverTimestamp(),
            updated_at:  db.FieldValue.serverTimestamp(),
          });
        }
      }

      await batch.commit();
    }

    // Invalidate both detail and list caches
    cache.del(detailKey(franchise_id, branch_id, menu_id));
    cache.del(listKey(franchise_id, branch_id));

    return NextResponse.json({
      success: true,
      menu_id,
      message: 'Menu updated successfully',
    });
  } catch (err) {
    console.error('[PUT /api/menus/[id]]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────

export async function DELETE(request, { params }) {
  try {
    const { id: menu_id } = await params;
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: 'franchise_id and branch_id are required' },
        { status: 400 },
      );
    }

    const ref      = menuDocRef(franchise_id, branch_id, menu_id);
    const dishCol  = dishesCol(franchise_id, branch_id, menu_id);

    // Check existence
    const snap = await ref.get();
    if (!snap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 },
      );
    }

    // Delete all dishes first (Firestore doesn't cascade-delete sub-collections)
    const dishSnap = await dishCol.get();
    if (dishSnap.size > 0) {
      const batch = db.batch();
      dishSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete the menu document
    await ref.delete();

    // Invalidate caches
    cache.del(detailKey(franchise_id, branch_id, menu_id));
    cache.del(listKey(franchise_id, branch_id));

    return NextResponse.json({
      success: true,
      message: `Menu ${menu_id} and ${dishSnap.size} dishes deleted`,
    });
  } catch (err) {
    console.error('[DELETE /api/menus/[id]]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// ── Utility ────────────────────────────────────────────────────────────────

function normalizeCourseToCategory(courseName = '') {
  const lower = courseName.toLowerCase();
  if (lower.includes('starter') || lower.includes('snack') || lower.includes('appetizer')) return 'starter';
  if (lower.includes('main') || lower.includes('curry') || lower.includes('gravy')) return 'main';
  if (lower.includes('rice') || lower.includes('biryani')) return 'rice';
  if (lower.includes('bread') || lower.includes('roti') || lower.includes('naan')) return 'bread';
  if (lower.includes('sweet') || lower.includes('dessert')) return 'sweet';
  if (lower.includes('beverage') || lower.includes('drink')) return 'beverage';
  return 'main';
}
