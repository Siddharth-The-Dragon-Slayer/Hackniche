// Auto Stock Deduction API
// Deducts raw materials based on menu items and guest count
// Called when a booking is confirmed or event is executed

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { cache } from '@/lib/cache';
import {
  buildLowStockEmail, buildStockDeductionEmail, sendInventoryEmail
} from '@/lib/inventory-emails';

// Recipe-to-raw-material mapping (per guest)
// Quantities are based on standard banquet catering portions.
// A 10% wastage/spillage buffer is applied automatically.
const WASTAGE_FACTOR = 1.10; // 10% extra for cooking loss & spillage

const RECIPE_MATERIAL_MAP = {
  'Biryani': [
    { name: 'Basmati Rice', unit: 'kg', qtyPerGuest: 0.15 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.025 },
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.06 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.03 },
    { name: 'Spices Mix', unit: 'kg', qtyPerGuest: 0.012 },
    { name: 'Ginger Garlic Paste', unit: 'kg', qtyPerGuest: 0.008 },
    { name: 'Ghee', unit: 'kg', qtyPerGuest: 0.01 },
    { name: 'Fresh Coriander', unit: 'kg', qtyPerGuest: 0.005 },
    { name: 'Mint Leaves', unit: 'kg', qtyPerGuest: 0.003 },
  ],
  'Paneer Butter Masala': [
    { name: 'Fresh Paneer', unit: 'kg', qtyPerGuest: 0.1 },
    { name: 'Butter', unit: 'kg', qtyPerGuest: 0.015 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.01 },
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.04 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.06 },
    { name: 'Cream', unit: 'liter', qtyPerGuest: 0.015 },
    { name: 'Ginger Garlic Paste', unit: 'kg', qtyPerGuest: 0.006 },
    { name: 'Spices Mix', unit: 'kg', qtyPerGuest: 0.005 },
  ],
  'Dal Tadka': [
    { name: 'Toor Dal', unit: 'kg', qtyPerGuest: 0.06 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.01 },
    { name: 'Ghee', unit: 'kg', qtyPerGuest: 0.005 },
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.02 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.02 },
    { name: 'Ginger Garlic Paste', unit: 'kg', qtyPerGuest: 0.004 },
    { name: 'Fresh Coriander', unit: 'kg', qtyPerGuest: 0.003 },
  ],
  'Naan/Roti': [
    { name: 'Flour (Maida)', unit: 'kg', qtyPerGuest: 0.1 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.005 },
    { name: 'Butter', unit: 'kg', qtyPerGuest: 0.008 },
    { name: 'Curd/Yogurt', unit: 'kg', qtyPerGuest: 0.01 },
  ],
  'Rice': [
    { name: 'Basmati Rice', unit: 'kg', qtyPerGuest: 0.12 },
    { name: 'Ghee', unit: 'kg', qtyPerGuest: 0.005 },
  ],
  'Raita': [
    { name: 'Curd/Yogurt', unit: 'kg', qtyPerGuest: 0.08 },
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.01 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.01 },
    { name: 'Fresh Coriander', unit: 'kg', qtyPerGuest: 0.002 },
  ],
  'Gulab Jamun': [
    { name: 'Flour (Maida)', unit: 'kg', qtyPerGuest: 0.03 },
    { name: 'Sugar', unit: 'kg', qtyPerGuest: 0.05 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.025 },
    { name: 'Milk Powder', unit: 'kg', qtyPerGuest: 0.02 },
    { name: 'Ghee', unit: 'kg', qtyPerGuest: 0.01 },
  ],
  'Mixed Veg Curry': [
    { name: 'Mixed Vegetables', unit: 'kg', qtyPerGuest: 0.12 },
    { name: 'Cooking Oil (Sunflower)', unit: 'liter', qtyPerGuest: 0.015 },
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.04 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.04 },
    { name: 'Ginger Garlic Paste', unit: 'kg', qtyPerGuest: 0.005 },
    { name: 'Spices Mix', unit: 'kg', qtyPerGuest: 0.005 },
  ],
  'Salad': [
    { name: 'Onions', unit: 'kg', qtyPerGuest: 0.025 },
    { name: 'Tomatoes', unit: 'kg', qtyPerGuest: 0.025 },
    { name: 'Cucumber', unit: 'kg', qtyPerGuest: 0.03 },
    { name: 'Lemon', unit: 'kg', qtyPerGuest: 0.01 },
    { name: 'Fresh Coriander', unit: 'kg', qtyPerGuest: 0.003 },
  ],
};

// POST - Auto deduct stock for a booking/event
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id, branch_id, guest_count, menu_items, booking_id, event_name, dry_run, custom_deductions } = body;

    if (!franchise_id || !guest_count || !menu_items || !Array.isArray(menu_items)) {
      return NextResponse.json({
        success: false,
        error: 'Required: franchise_id, guest_count, menu_items (array of dish names)'
      }, { status: 400 });
    }

    // If custom_deductions provided (user-edited quantities), use those directly
    // Otherwise calculate from recipe map
    let materialsNeeded = {};

    if (custom_deductions && Array.isArray(custom_deductions) && custom_deductions.length > 0) {
      // User has manually adjusted the deduction quantities
      for (const cd of custom_deductions) {
        if (cd.name && cd.totalQty > 0) {
          materialsNeeded[cd.name] = {
            name: cd.name,
            unit: cd.unit || 'kg',
            totalQty: Math.round(parseFloat(cd.totalQty) * 100) / 100,
            source: 'manual_override'
          };
        }
      }
    } else {
      // Auto-calculate from recipe mapping with wastage buffer
      for (const dish of menu_items) {
        const recipe = RECIPE_MATERIAL_MAP[dish];
        if (!recipe) continue;
        for (const mat of recipe) {
          const key = mat.name;
          if (!materialsNeeded[key]) {
            materialsNeeded[key] = { name: mat.name, unit: mat.unit, totalQty: 0 };
          }
          materialsNeeded[key].totalQty += mat.qtyPerGuest * guest_count;
        }
      }

      // Apply wastage buffer and round
      Object.values(materialsNeeded).forEach(m => {
        m.totalQty = Math.round(m.totalQty * WASTAGE_FACTOR * 100) / 100;
        m.qtyBeforeWastage = Math.round((m.totalQty / WASTAGE_FACTOR) * 100) / 100;
        m.wastagePct = Math.round((WASTAGE_FACTOR - 1) * 100);
      });
    }

    const db = getAdminDb();
    const docRef = db.collection('kitchen-inventory').doc(franchise_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        error: 'No inventory found for this franchise'
      }, { status: 404 });
    }

    const data = doc.data();
    const items = data.items || [];

    // Check availability and calculate deductions
    const deductions = [];
    const shortages = [];
    const warnings = [];

    for (const [, mat] of Object.entries(materialsNeeded)) {
      // Find matching inventory item (case-insensitive partial match)
      const invItem = items.find(i =>
        i.name.toLowerCase().includes(mat.name.toLowerCase()) ||
        mat.name.toLowerCase().includes(i.name.toLowerCase())
      );

      if (!invItem) {
        shortages.push({
          material: mat.name,
          needed: mat.totalQty,
          unit: mat.unit,
          reason: 'Not found in inventory'
        });
        continue;
      }

      if (invItem.currentStock < mat.totalQty) {
        shortages.push({
          material: mat.name,
          needed: mat.totalQty,
          available: invItem.currentStock,
          unit: mat.unit,
          deficit: Math.round((mat.totalQty - invItem.currentStock) * 100) / 100,
          reason: 'Insufficient stock'
        });
      }

      const newStock = Math.max(0, invItem.currentStock - mat.totalQty);
      if (newStock <= invItem.minStock) {
        warnings.push({
          material: mat.name,
          newStock,
          minStock: invItem.minStock,
          unit: mat.unit,
          message: `Will drop below minimum (${invItem.minStock} ${mat.unit})`
        });
      }

      deductions.push({
        itemId: invItem.id,
        material: mat.name,
        currentStock: invItem.currentStock,
        deductQty: mat.totalQty,
        newStock,
        unit: mat.unit,
        willBeLowStock: newStock <= invItem.minStock
      });
    }

    // If dry_run, just return the calculation without updating
    if (dry_run) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        message: 'Stock deduction preview (no changes made)',
        data: {
          guest_count,
          menu_items,
          materialsNeeded: Object.values(materialsNeeded),
          deductions,
          shortages,
          warnings,
          hasShortages: shortages.length > 0,
          totalItemsAffected: deductions.length
        }
      });
    }

    // Apply deductions
    const updatedItems = [...items];
    for (const ded of deductions) {
      const idx = updatedItems.findIndex(i => i.id === ded.itemId);
      if (idx !== -1) {
        updatedItems[idx] = {
          ...updatedItems[idx],
          currentStock: ded.newStock,
          status: ded.newStock <= updatedItems[idx].minStock ? 'low-stock' : 'in-stock',
          lastUsed: new Date().toISOString().split('T')[0],
          updated: new Date().toISOString()
        };
      }
    }

    await docRef.update({
      items: updatedItems,
      lastUpdated: new Date().toISOString()
    });

    // Log the deduction event
    const deductionLog = {
      id: `SD-${Date.now().toString(36).toUpperCase()}`,
      type: 'auto_deduction',
      franchise_id,
      branch_id: branch_id || '',
      booking_id: booking_id || null,
      event_name: event_name || null,
      guest_count,
      menu_items,
      deductions,
      shortages,
      warnings,
      created: new Date().toISOString(),
      created_by: body.created_by || 'system'
    };

    // Store deduction log
    const logDocRef = db.collection('stock-deduction-logs').doc(franchise_id);
    const logDoc = await logDocRef.get();
    if (logDoc.exists) {
      const logData = logDoc.data();
      const logs = logData.logs || [];
      logs.push(deductionLog);
      await logDocRef.update({ logs, lastUpdated: new Date().toISOString() });
    } else {
      await logDocRef.set({
        franchise_id,
        logs: [deductionLog],
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }

    // Invalidate analytics cache
    cache.del(`inv_analytics:${franchise_id}`);

    // ── Email: Send deduction summary + low-stock notification ──
    const notifyEmail = body.notify_email;
    if (notifyEmail) {
      // Deduction summary
      const dedHtml = buildStockDeductionEmail({
        deductionId: deductionLog.id,
        eventName: event_name,
        guestCount: guest_count,
        deductions,
        shortages,
      });
      sendInventoryEmail(notifyEmail, `Stock Deducted — ${guest_count} guests`, dedHtml).catch(() => {});

      // Low stock warning for items that are now below min
      const newLowItems = deductions.filter(d => d.willBeLowStock).map(d => ({
        name: d.material, currentStock: d.newStock,
        minStock: items.find(i => i.id === d.itemId)?.minStock || 0,
        unit: d.unit,
      }));
      if (newLowItems.length > 0) {
        const lowHtml = buildLowStockEmail({ items: newLowItems });
        sendInventoryEmail(notifyEmail, `⚠️ ${newLowItems.length} items now below minimum stock`, lowHtml).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stock deducted for ${guest_count} guests across ${deductions.length} materials`,
      data: {
        deductionId: deductionLog.id,
        guest_count,
        menu_items,
        deductions,
        shortages,
        warnings,
        hasShortages: shortages.length > 0,
        totalItemsAffected: deductions.length
      }
    });

    // ── Email Notifications (fire-and-forget) ──
    // We've already returned the response above; these run async
  } catch (error) {
    console.error('Stock deduction error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process stock deduction',
      details: error.message
    }, { status: 500 });
  }
}

// GET - Fetch deduction logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');

    if (!franchise_id) {
      return NextResponse.json({
        success: false,
        error: 'franchise_id is required'
      }, { status: 400 });
    }

    const db = getAdminDb();
    const logDocRef = db.collection('stock-deduction-logs').doc(franchise_id);
    const logDoc = await logDocRef.get();

    if (!logDoc.exists) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No deduction logs found'
      });
    }

    const data = logDoc.data();
    const logs = (data.logs || []).sort((a, b) => new Date(b.created) - new Date(a.created));

    return NextResponse.json({
      success: true,
      data: logs,
      message: `${logs.length} deduction logs found`
    });

  } catch (error) {
    console.error('Deduction logs GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch deduction logs',
      details: error.message
    }, { status: 500 });
  }
}
