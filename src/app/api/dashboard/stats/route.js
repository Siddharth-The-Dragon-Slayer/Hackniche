/**
 * GET /api/dashboard/stats — fetch platform-wide aggregated stats for super_admin
 * Aggregates: franchises count, branches count, revenue, bookings, conversion rate, outstanding dues
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { cache } from "@/lib/cache";

const TTL = 600; // 10 min cache for stats (in seconds)

export async function GET(request) {
  try {
    const user = await verifyRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cacheKey = "dashboard:platform:stats";
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const db = getAdminDb();

    // Fetch all documents in parallel
    const [franchisesSnap, branchesSnap, leadsSnap] = await Promise.all([
      db.collection("franchises").get(),
      db.collection("branches").get(),
      db.collection("leads").get(),
    ]);

    const totalFranchises = franchisesSnap.size;
    const totalBranches = branchesSnap.size;

    // Calculate stats from leads (bookings, revenue, conversion)
    const leads = leadsSnap.docs.map((d) => d.data());
    const bookingStatuses = [
      "advance_paid",
      "decoration_scheduled",
      "paid",
      "in_progress",
      "completed",
      "settlement_complete",
      "closed",
    ];

    const bookings = leads.filter((l) =>
      bookingStatuses.includes(l.status)
    );
    const totalBookingsMTD = bookings.length;
    
    // Calculate revenue from quote total_estimated (expected/contracted revenue)
    const totalRevenueMTD = bookings.reduce((sum, b) => {
      const quoteTotal = b.quote?.total_estimated || 0;
      const advanceAmount = b.booking_confirmed?.advance_amount || 0;
      // Use quote total if available, otherwise use advance as minimum
      return sum + (quoteTotal || advanceAmount);
    }, 0);
    
    // Outstanding dues = quote total - advance paid
    const totalOutstandingDues = bookings.reduce((sum, b) => {
      const quoteTotal = b.quote?.total_estimated || 0;
      const advanceAmount = b.booking_confirmed?.advance_amount || 0;
      const outstanding = Math.max(0, quoteTotal - advanceAmount);
      return sum + outstanding;
    }, 0);
    
    const globalConversionRate =
      leads.length > 0
        ? Math.round((bookings.length / leads.length) * 100 * 10) / 10
        : 0;

    // Aggregate revenue and bookings by month for chart
    const monthlyRevenue = {};
    const monthlyBookings = {};
    const branchRevenue = {};

    bookings.forEach((b) => {
      const createdAt = b.created_at?.toDate?.() || new Date();
      const month = createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const quoteTotal = b.quote?.total_estimated || 0;
      const advanceAmount = b.booking_confirmed?.advance_amount || 0;
      const revenue = quoteTotal || advanceAmount;
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenue;
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });

    branchesSnap.docs.forEach((d) => {
      const branch = d.data();
      const branchBookings = bookings.filter(
        (b) => b.branch_id === d.id
      );
      const revenue = branchBookings.reduce((sum, b) => {
        const quoteTotal = b.quote?.total_estimated || 0;
        const advanceAmount = b.booking_confirmed?.advance_amount || 0;
        return sum + (quoteTotal || advanceAmount);
      }, 0);
      branchRevenue[branch.name || d.id] = revenue;
    });

    const chartData = {
      monthlyRevenue: Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => new Date(`01 ${a.month}`) - new Date(`01 ${b.month}`))
        .slice(-6), // Last 6 months
      branchRevenue: Object.entries(branchRevenue)
        .map(([branch, revenue]) => ({ branch, revenue }))
        .sort((a, b) => b.revenue - a.revenue),
    };

    // Get franchise details with revenue
    const franchiseDetails = franchisesSnap.docs.map((d) => {
      const franchise = d.data();
      const franchiseBookings = bookings.filter(
        (b) => b.franchise_id === d.id
      );
      const revenueFranchise = franchiseBookings.reduce((sum, b) => {
        const quoteTotal = b.quote?.total_estimated || 0;
        const advanceAmount = b.booking_confirmed?.advance_amount || 0;
        return sum + (quoteTotal || advanceAmount);
      }, 0);
      const branchesCount = branchesSnap.docs.filter(
        (bd) => bd.data().franchise_id === d.id
      ).length;

      return {
        id: d.id,
        name: franchise.name || "",
        city: franchise.city || "",
        code: franchise.code || "",
        admin: franchise.admin || "",
        branches: branchesCount,
        revenue: revenueFranchise,
        status: franchise.status || "Active",
      };
    });

    const result = {
      platformStats: {
        totalFranchises,
        totalBranches,
        totalRevenueMTD,
        totalBookingsMTD,
        globalConversionRate,
        totalOutstandingDues,
      },
      franchiseData: franchiseDetails,
      chartData,
    };

    cache.set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/dashboard/stats]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
