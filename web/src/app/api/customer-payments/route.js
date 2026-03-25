import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * /api/customer-payments
 * GET: Fetch all payments for the authenticated customer via their leads → invoices.
 *
 * Data flow (single collection source):
 *   1. leads    – queried by customer_uid to get lead context
 *   2. invoices – PRIMARY payment source (lead_id FK), normalised `.payments` array
 *   3. bookings – fallback only if no invoice exists for a lead
 *
 * Query params: customer_uid (required)
 */

/** Chunk array into groups of `size` for Firestore `in` queries (max 30) */
function chunk(arr, size = 30) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerUid = searchParams.get("customer_uid");

    if (!customerUid) {
      return NextResponse.json(
        { error: "customer_uid required" },
        { status: 400 },
      );
    }

    const adminDb = getAdminDb();

    // ── 1. Leads for this customer ─────────────────────────────────────
    const leadsSnap = await adminDb
      .collection("leads")
      .where("customer_uid", "==", customerUid)
      .get();

    // ── 1b. Standalone bookings for this customer ──────────────────────
    const bookingsSnap = await adminDb
      .collection("bookings")
      .where("customer_uid", "==", customerUid)
      .get();

    const standaloneBookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // If no leads AND no standalone bookings, return empty
    if (leadsSnap.empty && standaloneBookings.length === 0) {
      return NextResponse.json({
        payments: [],
        bookings: [],
        enquiries: [],
        summary: {
          totalPaid: 0,
          totalDue: 0,
          transactionCount: 0,
          bookingCount: 0,
          enquiryCount: 0,
        },
      });
    }

    const leadsData = leadsSnap.empty ? [] : leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const leadIds = leadsData.map((l) => l.id);

    // ── 2. Invoices by lead_id (authoritative payment source) ─────────
    const invoicesByLead = {};
    for (const chunk_ of chunk(leadIds)) {
      const invSnap = await adminDb
        .collection("invoices")
        .where("lead_id", "in", chunk_)
        .get();
      invSnap.docs.forEach((d) => {
        const inv = { id: d.id, ...d.data() };
        // Normalise field names — older docs may use `payment_history` or `balance_due`
        inv.payments = inv.payments || inv.payment_history || [];
        inv.balance = inv.balance ?? inv.balance_due ?? 0;
        // Keep the most recent invoice per lead (should normally only be one)
        if (
          !invoicesByLead[inv.lead_id] ||
          new Date(inv.created_at) >
            new Date(invoicesByLead[inv.lead_id].created_at)
        ) {
          invoicesByLead[inv.lead_id] = inv;
        }
      });
    }

    // ── 3. Bookings by lead_id (fallback / metadata source) ───────────
    const bookingsByLead = {};
    for (const chunk_ of chunk(leadIds)) {
      const bkSnap = await adminDb
        .collection("bookings")
        .where("lead_id", "in", chunk_)
        .get();
      bkSnap.docs.forEach((d) => {
        const bk = { id: d.id, ...d.data() };
        bookingsByLead[bk.lead_id] = bk;
      });
    }

    // ── 4. Build flattened payments + booking summary ─────────────────
    const payments = [];
    let totalPaid = 0;
    let totalDue = 0;
    const summaryBookings = [];
    const enquiries = []; // ALL leads, including those without bookings yet

    leadsData.forEach((lead) => {
      const invoice = invoicesByLead[lead.id];
      const booking = bookingsByLead[lead.id];

      // Always include as an enquiry record (full lead view for the customer)
      enquiries.push({
        id: lead.id,
        event_type: lead.event_type || "Event",
        event_date: lead.event_date,
        hall_name: lead.hall_name || null,
        guest_count: lead.expected_guest_count || null,
        status: lead.status,
        created_at: lead.created_at,
        booking_id: booking?.id || lead.booking_id || null,
        invoice_id: invoice?.id || lead.invoice_id || null,
        invoice_number:
          invoice?.invoice_number || booking?.invoice_number || null,
        quote_total:
          invoice?.total ||
          booking?.payments?.quote_total ||
          lead.quote?.total_estimated ||
          0,
        total_paid: invoice?.amount_paid ?? booking?.payments?.total_paid ?? 0,
        balance_due: invoice?.balance ?? booking?.payments?.balance_due ?? 0,
        is_converted: !!lead.is_converted,
        event_locked: lead.event_locked || false,
      });

      // Only include leads that have either an invoice or a booking for payment tracking
      if (!invoice && !booking) return;

      // Invoice is the primary source; fall back to booking nested payments
      const paymentList = invoice?.payments?.length
        ? invoice.payments
        : booking?.payments?.payment_history || [];

      const quoteTotal = invoice?.total || booking?.payments?.quote_total || 0;
      const amountPaid =
        invoice?.amount_paid ?? booking?.payments?.total_paid ?? 0;
      const balanceDue =
        invoice?.balance ?? booking?.payments?.balance_due ?? 0;
      const invoiceNumber =
        invoice?.invoice_number ||
        booking?.invoice_number ||
        lead.id.substring(0, 8).toUpperCase();

      totalPaid += Number(amountPaid);
      totalDue += Number(balanceDue);

      paymentList.forEach((p) => {
        payments.push({
          ...p,
          booking_id: booking?.id || null,
          invoice_id: invoice?.id || null,
          lead_id: lead.id,
          event_type: lead.event_type || booking?.event_type || "Event",
          event_date: lead.event_date || booking?.event_date,
          customer_name: lead.customer_name || booking?.customer_name,
          hall_name: lead.hall_name || booking?.hall_name,
          guest_count:
            lead.expected_guest_count || booking?.expected_guest_count,
          quote_total: quoteTotal,
          balance_due: balanceDue,
          total_paid: amountPaid,
          invoice_number: invoiceNumber,
        });
      });

      summaryBookings.push({
        id: booking?.id || lead.id,
        lead_id: lead.id,
        invoice_id: invoice?.id || null,
        event_type: lead.event_type || booking?.event_type || "Event",
        event_date: lead.event_date || booking?.event_date,
        customer_name: lead.customer_name || booking?.customer_name,
        hall_name: lead.hall_name || booking?.hall_name,
        guest_count: lead.expected_guest_count || booking?.expected_guest_count,
        quote_total: quoteTotal,
        total_paid: amountPaid,
        balance_due: balanceDue,
        invoice_number: invoiceNumber,
        payment_history: paymentList,
        lead_status: lead.status,
      });
    });

    // Sort payments newest-first
    payments.sort(
      (a, b) =>
        new Date(b.date || b.recorded_at || 0) -
        new Date(a.date || a.recorded_at || 0),
    );

    // ── 5. Add standalone bookings (not linked to any lead) ───────────
    standaloneBookings.forEach((bk) => {
      // Skip if already covered via lead
      if (leadsData.some((l) => l.booking_id === bk.id)) return;

      const pay = bk.payments || {};
      const paymentList = pay.payment_history || [];
      const quoteTotal = pay.quote_total || bk.quote_total || 0;
      const amountPaid = pay.total_paid || bk.total_paid || 0;
      const balanceDue = pay.balance_due ?? (quoteTotal - amountPaid);
      const invoiceNumber = bk.invoice_number || bk.id.substring(0, 8).toUpperCase();

      totalPaid += Number(amountPaid);
      totalDue += Number(balanceDue);

      // Add to enquiries list
      enquiries.push({
        id: bk.id,
        event_type: bk.event_type || "Event",
        event_date: bk.event_date,
        hall_name: bk.hall_name || null,
        guest_count: bk.expected_guest_count || bk.final_guest_count || null,
        status: bk.status || "confirmed",
        created_at: bk.created_at,
        booking_id: bk.id,
        invoice_id: bk.invoice_id || null,
        invoice_number: invoiceNumber,
        quote_total: quoteTotal,
        total_paid: amountPaid,
        balance_due: balanceDue,
        is_converted: true,
        event_locked: bk.event_locked || false,
      });

      // Add individual payment records
      paymentList.forEach((p) => {
        payments.push({
          ...p,
          booking_id: bk.id,
          invoice_id: bk.invoice_id || null,
          lead_id: null,
          event_type: bk.event_type || "Event",
          event_date: bk.event_date,
          customer_name: bk.customer_name,
          hall_name: bk.hall_name,
          guest_count: bk.expected_guest_count,
          quote_total: quoteTotal,
          balance_due: balanceDue,
          total_paid: amountPaid,
          invoice_number: invoiceNumber,
        });
      });

      summaryBookings.push({
        id: bk.id,
        lead_id: null,
        invoice_id: bk.invoice_id || null,
        event_type: bk.event_type || "Event",
        event_date: bk.event_date,
        customer_name: bk.customer_name,
        hall_name: bk.hall_name,
        guest_count: bk.expected_guest_count,
        quote_total: quoteTotal,
        total_paid: amountPaid,
        balance_due: balanceDue,
        invoice_number: invoiceNumber,
        payment_history: paymentList,
        lead_status: bk.status || "confirmed",
      });
    });

    return NextResponse.json({
      payments,
      bookings: summaryBookings,
      enquiries,
      summary: {
        totalPaid,
        totalDue,
        transactionCount: payments.length,
        bookingCount: summaryBookings.length,
        enquiryCount: enquiries.length,
      },
    });
  } catch (err) {
    console.error("[GET /api/customer-payments]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
