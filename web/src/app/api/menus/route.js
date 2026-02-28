/**
 * GET  /api/menus?franchise_id=pfd&branch_id=pfd_b1
 *   → list all menus for a branch
 *
 * POST /api/menus
 *   body: { franchise_id, branch_id, menu_name, category, price_per_plate,
 *           serves_min, serves_max, description, cuisine, highlights,
 *           isVeg, isVegan, isJain, courses: [{course, items:[...]}] }
 *   → create a new menu (+ dishes as sub-collection)
 *
 * Access:
 *   super_admin     → any franchise / any branch
 *   franchise_admin → own franchise, any branch
 *   branch_manager  → own franchise + own branch only
 */

import { getAdminDb } from '@/lib/firebase-admin';

const db = getAdminDb();
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// Cache key helpers
const listKey  = (fid, bid)  => `menus:${fid}:${bid}:list`;
const MENU_TTL = 300; // 5 minutes

// ── helpers ────────────────────────────────────────────────────────────────

/** Firestore reference to the menus collection for a specific branch */
function branchMenusCol(franchise_id, branch_id) {
  return db.collection('menus').doc(franchise_id)
    .collection('branches').doc(branch_id)
    .collection('menus');
}

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');
    const status       = searchParams.get('status'); // optional filter

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: 'franchise_id and branch_id are required' },
        { status: 400 },
      );
    }

    // ── Cache check ──────────────────────────────────
    const cacheKey = listKey(franchise_id, branch_id);
    const cached   = cache.get(cacheKey);
    if (cached && !status) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const col  = branchMenusCol(franchise_id, branch_id);
    const snap = await col.orderBy('created_at', 'desc').get();

    let menus = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Optional status filter (skip cache when filtering)
    if (status) {
      menus = menus.filter(m => m.status === status);
    }

    const payload = { success: true, franchise_id, branch_id, count: menus.length, menus };
    if (!status) cache.set(cacheKey, payload, MENU_TTL);

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[GET /api/menus]', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// ── POST ───────────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      franchise_id,
      branch_id,
      menu_name,
      category,
      price_per_plate,
      serves_min    = 50,
      serves_max    = 500,
      description   = '',
      cuisine       = 'Indian Vegetarian',
      highlights    = [],
      isVeg         = true,
      isVegan       = false,
      isJain        = false,
      courses       = [],   // [{course: 'Starters', items:['Samosa', ...]}]
      status        = 'active',
    } = body;

    // Validation
    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: 'franchise_id and branch_id are required' },
        { status: 400 },
      );
    }
    if (!menu_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'menu_name is required' },
        { status: 400 },
      );
    }
    if (!price_per_plate || isNaN(Number(price_per_plate))) {
      return NextResponse.json(
        { success: false, error: 'price_per_plate must be a number' },
        { status: 400 },
      );
    }

    // Count total items across courses
    const total_items = courses.reduce(
      (sum, c) => sum + (Array.isArray(c.items) ? c.items.filter(Boolean).length : 0),
      0,
    );

    // 1. Create menu document
    const menuData = {
      menu_name:       menu_name.trim(),
      franchise_id,
      branch_id,
      category:        category || 'veg_classic',
      price_per_plate: Number(price_per_plate),
      serves_min:      Number(serves_min),
      serves_max:      Number(serves_max),
      description,
      cuisine,
      highlights,
      isVeg,
      isVegan,
      isJain,
      total_items,
      status,
      created_at:      db.FieldValue.serverTimestamp(),
      updated_at:      db.FieldValue.serverTimestamp(),
    };

    const col     = branchMenusCol(franchise_id, branch_id);
    const newDocRef = col.doc();
    await newDocRef.set(menuData);
    const menuRef = newDocRef;

    // 2. Write each course item as a dish in the dishes sub-collection
    if (courses.length > 0) {
      const batch = db.batch();
      const dishCol = dishesCol(franchise_id, branch_id, menuRef.id);

      for (const courseObj of courses) {
        const { course, items = [] } = courseObj;
        for (const itemName of items.filter(Boolean)) {
          const dishRef = dishCol.doc();
          batch.set(dishRef, {
            dish_name:  itemName.trim(),
            category:   normalizeCourseToCategory(course),
            veg_type:   isJain ? 'jain' : isVegan ? 'vegan' : 'vegetarian',
            spice_level: 'medium',
            description: '',
            ingredients: [],
            is_signature: false,
            status:     'available',
            created_at: db.FieldValue.serverTimestamp(),
            updated_at: db.FieldValue.serverTimestamp(),
          });
        }
      }

      await batch.commit();
    }

    // Invalidate list cache for this branch
    cache.del(listKey(franchise_id, branch_id));

    return NextResponse.json({
      success:     true,
      menu_id:     menuRef.id,
      path:        `menus/${franchise_id}/branches/${branch_id}/menus/${menuRef.id}`,
      total_items,
      message:     `Menu "${menu_name}" created successfully`,
    }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/menus]', err);
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
