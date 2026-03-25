import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

const QUERY_TIMEOUT = 8000; // 8 second timeout per query

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout")), ms)
    ),
  ]);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_email = searchParams.get("customer_email");
    const customer_uid   = searchParams.get("customer_uid");
    const franchise_id   = searchParams.get("franchise_id");

    if (!customer_email && !customer_uid) {
      return NextResponse.json(
        { error: "customer_email or customer_uid required", invoices: [], total: 0 },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let invoices = [];

    // Try primary lookup by customer_email (most direct)
    if (customer_email) {
      try {
        let q = db.collection("invoices").where("customer_email", "==", customer_email);
        if (franchise_id) q = q.where("franchise_id", "==", franchise_id);
        
        const snap = await withTimeout(q.get(), QUERY_TIMEOUT);
        snap.forEach((doc) =>
          invoices.push({ id: doc.id, ...serializeInvoice(doc.data()) })
        );
      } catch (err) {
        console.error("Primary email query failed:", err.message);
        // Fall through to backup method
      }
    }

    // Fallback: query by lead_id if email lookup failed or returned nothing
    if (customer_uid && invoices.length === 0) {
      try {
        let leadsQ = db.collection("leads").where("customer_uid", "==", customer_uid);
        if (franchise_id) leadsQ = leadsQ.where("franchise_id", "==", franchise_id);
        
        const leadsSnap = await withTimeout(leadsQ.get(), QUERY_TIMEOUT);
        const leadIds = leadsSnap.docs.map((d) => d.id);

        if (leadIds.length > 0) {
          // Firestore "in" supports up to 30 values
          const chunks = [];
          for (let i = 0; i < leadIds.length; i += 30) {
            chunks.push(leadIds.slice(i, i + 30));
          }
          
          for (const chunk of chunks) {
            try {
              const snap = await withTimeout(
                db.collection("invoices").where("lead_id", "in", chunk).get(),
                QUERY_TIMEOUT
              );
              snap.forEach((doc) => {
                if (!invoices.find((inv) => inv.id === doc.id)) {
                  invoices.push({ id: doc.id, ...serializeInvoice(doc.data()) });
                }
              });
            } catch (err) {
              console.error("Chunk query failed:", err.message);
              // Continue to next chunk
            }
          }
        }
      } catch (err) {
        console.error("Fallback lead query failed:", err.message);
        // Continue - return what we have
      }
    }

    // Sort by created_at descending
    invoices.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ invoices, total: invoices.length });
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    // Return graceful error with empty invoices instead of 500
    return NextResponse.json(
      { invoices: [], total: 0, error: "Unable to fetch invoices. Please try again." },
      { status: 200 }
    );
  }
}

function serializeInvoice(data) {
  return {
    invoice_number:  data.invoice_number  ?? null,
    status:          data.status          ?? "draft",
    event_type:      data.event_type      ?? null,
    event_date:      data.event_date      ?? null,
    due_date:        data.due_date        ?? null,
    customer_name:   data.customer_name   ?? null,
    customer_email:  data.customer_email  ?? null,
    customer_phone:  data.customer_phone  ?? null,
    subtotal:        data.subtotal        ?? 0,
    tax_rate:        data.tax_rate        ?? 0,
    tax_amount:      data.tax_amount      ?? 0,
    discount:        data.discount        ?? 0,
    total:           data.total           ?? 0,
    amount_paid:     data.amount_paid     ?? 0,
    balance_due:     data.balance_due     ?? 0,
    line_items:      data.line_items      ?? [],
    payment_history: data.payment_history ?? [],
    notes:           data.notes           ?? "",
    booking_id:      data.booking_id      ?? null,
    lead_id:         data.lead_id         ?? null,
    franchise_id:    data.franchise_id    ?? null,
    branch_id:       data.branch_id       ?? null,
    created_by_name: data.created_by_name ?? null,
    created_at:      data.created_at?.toDate
                       ? data.created_at.toDate().toISOString()
                       : data.created_at ?? null,
    updated_at:      data.updated_at?.toDate
                       ? data.updated_at.toDate().toISOString()
                       : data.updated_at ?? null,
  };
}
