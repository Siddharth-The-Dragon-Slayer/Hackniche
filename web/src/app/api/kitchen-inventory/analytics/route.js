// Inventory Analytics API — consolidated insights endpoint
// Returns real-time stats for franchise admin dashboards and analytics

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { cache } from '@/lib/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get('franchise_id');

    if (!franchiseId) {
      return NextResponse.json({ success: false, error: 'franchise_id is required' }, { status: 400 });
    }

    // Check cache (TTL 3 min for analytics)
    const cacheKey = `inv_analytics:${franchiseId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    const db = getAdminDb();

    // Parallel reads for efficiency
    const [inventoryDoc, poDoc, deductionDoc] = await Promise.all([
      db.collection('kitchen-inventory').doc(franchiseId).get(),
      db.collection('purchase-order').doc(franchiseId).get(),
      db.collection('stock-deduction-logs').doc(franchiseId).get(),
    ]);

    // ── Inventory Stats ──
    const items = inventoryDoc.exists ? (inventoryDoc.data().items || []) : [];
    const totalItems = items.length;
    const lowStockItems = items.filter(i => (i.currentStock || 0) <= (i.minStock || 0));
    const outOfStock = items.filter(i => (i.currentStock || 0) === 0);
    const totalValue = items.reduce((s, i) => s + ((i.currentStock || 0) * (i.pricePerUnit || 0)), 0);

    const now = new Date();
    const expiringSoon = items.filter(i => {
      if (!i.expiryDate) return false;
      const days = Math.ceil((new Date(i.expiryDate) - now) / 86400000);
      return days >= 0 && days <= 7;
    });
    const expired = items.filter(i => {
      if (!i.expiryDate) return false;
      return new Date(i.expiryDate) < now;
    });

    // Category breakdown
    const categoryMap = {};
    items.forEach(i => {
      const cat = i.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0, lowStock: 0 };
      categoryMap[cat].count++;
      categoryMap[cat].value += (i.currentStock || 0) * (i.pricePerUnit || 0);
      if ((i.currentStock || 0) <= (i.minStock || 0)) categoryMap[cat].lowStock++;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.value - a.value);

    // Stock level distribution for charts
    const stockLevels = items.map(i => ({
      name: i.name,
      currentStock: i.currentStock || 0,
      minStock: i.minStock || 0,
      pct: i.minStock ? Math.round(((i.currentStock || 0) / i.minStock) * 100) : 100,
      unit: i.unit,
      value: (i.currentStock || 0) * (i.pricePerUnit || 0),
    })).sort((a, b) => a.pct - b.pct);

    // ── Purchase Order Stats ──
    const orders = poDoc.exists ? (poDoc.data().orders || []) : [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Ordered' || o.status === 'Pending');
    const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Received');
    const totalPOValue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const unpaidOrders = orders.filter(o => o.paymentStatus === 'Pending' || o.paymentStatus === 'Overdue');

    // Monthly PO spend (last 6 months)
    const monthlySpend = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    orders.forEach(o => {
      const d = new Date(o.created || o.orderDate);
      if (d >= sixMonthsAgo) {
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        monthlySpend[key] = (monthlySpend[key] || 0) + (o.totalAmount || 0);
      }
    });
    const monthlySpendChart = Object.entries(monthlySpend).map(([month, amount]) => ({ month, amount }));

    // Top vendors by PO value
    const vendorMap = {};
    orders.forEach(o => {
      const vn = o.vendorName || 'Unknown';
      if (!vendorMap[vn]) vendorMap[vn] = { name: vn, totalValue: 0, orderCount: 0 };
      vendorMap[vn].totalValue += o.totalAmount || 0;
      vendorMap[vn].orderCount++;
    });
    const topVendors = Object.values(vendorMap).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);

    // ── Deduction Stats ──
    const deductionLogs = deductionDoc.exists ? (deductionDoc.data().logs || []) : [];
    const totalDeductions = deductionLogs.length;
    const totalGuestsServed = deductionLogs.reduce((s, l) => s + (l.guest_count || 0), 0);
    const deductionsWithShortages = deductionLogs.filter(l => l.shortages?.length > 0);

    // Most used materials (from deductions)
    const materialUsage = {};
    deductionLogs.forEach(log => {
      (log.deductions || []).forEach(d => {
        if (!materialUsage[d.material]) materialUsage[d.material] = { name: d.material, totalUsed: 0, unit: d.unit };
        materialUsage[d.material].totalUsed += d.deductQty || 0;
      });
    });
    const topUsedMaterials = Object.values(materialUsage)
      .sort((a, b) => b.totalUsed - a.totalUsed)
      .slice(0, 10)
      .map(m => ({ ...m, totalUsed: Math.round(m.totalUsed * 100) / 100 }));

    // Monthly consumption trend (last 6 months)
    const monthlyConsumption = {};
    deductionLogs.forEach(log => {
      const d = new Date(log.created);
      if (d >= sixMonthsAgo) {
        const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        if (!monthlyConsumption[key]) monthlyConsumption[key] = { month: key, guests: 0, deductions: 0 };
        monthlyConsumption[key].guests += log.guest_count || 0;
        monthlyConsumption[key].deductions++;
      }
    });
    const consumptionTrend = Object.values(monthlyConsumption);

    const analytics = {
      inventory: {
        totalItems,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStock.length,
        expiringSoonCount: expiringSoon.length,
        expiredCount: expired.length,
        totalValue: Math.round(totalValue),
        lowStockItems: lowStockItems.map(i => ({ id: i.id, name: i.name, currentStock: i.currentStock, minStock: i.minStock, unit: i.unit })),
        expiringSoonItems: expiringSoon.map(i => ({ id: i.id, name: i.name, expiryDate: i.expiryDate, daysLeft: Math.ceil((new Date(i.expiryDate) - now) / 86400000) })),
        categoryBreakdown,
        stockLevels: stockLevels.slice(0, 20), // top 20 lowest
      },
      purchaseOrders: {
        totalOrders,
        pendingCount: pendingOrders.length,
        deliveredCount: deliveredOrders.length,
        totalValue: Math.round(totalPOValue),
        unpaidCount: unpaidOrders.length,
        unpaidValue: Math.round(unpaidOrders.reduce((s, o) => s + (o.totalAmount || 0), 0)),
        monthlySpend: monthlySpendChart,
        topVendors,
      },
      consumption: {
        totalDeductions,
        totalGuestsServed,
        shortageIncidents: deductionsWithShortages.length,
        topUsedMaterials,
        consumptionTrend,
      },
    };

    // Cache for 3 minutes
    cache.set(cacheKey, analytics, 180);

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics', details: error.message }, { status: 500 });
  }
}
