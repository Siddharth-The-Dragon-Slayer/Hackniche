import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { cache } from '@/lib/cache';

/* ══════════════════════════════════════════════════════════════════
   BILLING API — /api/billing
   GET  → list invoices
   POST → create invoice (from booking or standalone)
═══════════════════════════════════════════════════════════════════ */

const TTL = 120_000;
const invalidate = pfx => cache.keys().filter(k => k.startsWith(pfx)).forEach(k => cache.delete(k));
const INV_STATUSES = ['draft','sent','paid','partially_paid','overdue','cancelled'];

/* ── GET ── */
export async function GET(req) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const franchise_id = searchParams.get('franchise_id') || 'pfd';
    const branch_id    = searchParams.get('branch_id') || 'pfd_b1';
    const status       = searchParams.get('status');

    const cacheKey = `invoices:${franchise_id}:${branch_id}:${status||''}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Query only by branch_id to avoid composite index requirement
    let q = adminDb.collection('invoices').where('branch_id', '==', branch_id);
    if (status && INV_STATUSES.includes(status)) q = q.where('status', '==', status);

    const snap = await q.limit(500).get();
    // Filter by franchise_id and sort in memory
    const invoices = snap.docs
      .map(d => { const data = d.data(); return { id: d.id, ...data, payments: data.payments || data.payment_history || [], balance: data.balance ?? data.balance_due ?? 0 }; })
      .filter(inv => inv.franchise_id === franchise_id)
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
        const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
        return bDate - aDate;
      });
    const result = { invoices, total: invoices.length };
    cache.set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[GET /api/billing]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── POST ── */
export async function POST(req) {
  try {
    const adminDb = getAdminDb();
    const body = await req.json();
    const { franchise_id = 'pfd', branch_id = 'pfd_b1', booking_id, lead_id, ...rest } = body;
    const now = new Date().toISOString();

    // Use timestamp-based invoice number to avoid index requirement
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoice_number = `INV-${franchise_id.toUpperCase()}-${timestamp}${randomSuffix}`;

    let invoiceData = {};

    if (booking_id) {
      // ── Create from booking ──
      const bSnap = await adminDb.collection('bookings').doc(booking_id).get();
      if (!bSnap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      const b = bSnap.data();

      const foodCost = b.menu?.total || (b.menu?.per_plate_cost && b.menu?.plates ? b.menu.per_plate_cost * b.menu.plates : 0);
      const hallRent = b.payments?.quote_total ? b.payments.quote_total - foodCost - (b.decor?.cost || 0) : 0;

      const lineItems = [];
      if (foodCost > 0) lineItems.push({ description: `Food — ${b.menu?.name || 'Menu'}`, quantity: b.menu?.plates || 1, rate: b.menu?.per_plate_cost || foodCost, amount: foodCost });
      if (hallRent > 0) lineItems.push({ description: 'Hall Rental', quantity: 1, rate: hallRent, amount: hallRent });
      if (b.decor?.cost > 0) lineItems.push({ description: `Decoration — ${b.decor?.theme || 'Standard'}`, quantity: 1, rate: b.decor.cost, amount: b.decor.cost });

      const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
      const taxRate = Number(rest.tax_rate || 18);
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const discount = Number(rest.discount || 0);
      const total = subtotal + taxAmount - discount;
      const amountPaid = b.payments?.total_paid || 0;

      invoiceData = {
        invoice_number, booking_id, lead_id: b.lead_id || lead_id || null,
        franchise_id: b.franchise_id, branch_id: b.branch_id,
        customer_name: b.customer_name, phone: b.phone, email: b.email,
        customer_address: rest.customer_address || null,
        line_items: lineItems, subtotal, tax_rate: taxRate, tax_amount: taxAmount,
        discount, total, amount_paid: amountPaid, balance: total - amountPaid,
        status: amountPaid >= total ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'draft',
        issue_date: rest.issue_date || now.slice(0, 10),
        due_date: rest.due_date || null,
        payments: b.payments?.payment_history || [],
        notes: rest.notes || null,
        created_at: now, updated_at: now,
      };
    } else {
      // ── Standalone invoice ──
      if (!rest.customer_name) return NextResponse.json({ error: 'customer_name required' }, { status: 400 });
      const lineItems = rest.line_items || [];
      const subtotal = lineItems.reduce((s, i) => s + Number(i.amount || 0), 0);
      const taxRate = Number(rest.tax_rate || 18);
      const taxAmount = Math.round(subtotal * taxRate / 100);
      const discount = Number(rest.discount || 0);
      const total = subtotal + taxAmount - discount;

      invoiceData = {
        invoice_number, booking_id: null, lead_id: lead_id || null,
        franchise_id, branch_id,
        customer_name: rest.customer_name, phone: rest.phone || null, email: rest.email || null,
        customer_address: rest.customer_address || null,
        line_items: lineItems, subtotal, tax_rate: taxRate, tax_amount: taxAmount,
        discount, total, amount_paid: 0, balance: total,
        status: 'draft',
        issue_date: rest.issue_date || now.slice(0, 10),
        due_date: rest.due_date || null,
        payments: [],
        notes: rest.notes || null,
        created_at: now, updated_at: now,
      };
    }

    const ref = adminDb.collection('invoices').doc();
    await ref.set(invoiceData);

    // Link invoice to booking
    if (booking_id) {
      await adminDb.collection('bookings').doc(booking_id).update({
        invoice_id: ref.id, updated_at: now,
      });
    }

    invalidate(`invoices:${franchise_id}:${branch_id}`);
    return NextResponse.json({ message: 'Invoice created', invoice_id: ref.id, invoice_number }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/billing]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
