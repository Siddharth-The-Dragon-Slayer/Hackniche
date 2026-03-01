/**
 * GET  /api/leads?franchise_id=pfd&branch_id=pfd_b1[&status=new]
 * GET  /api/leads?customer_uid=xxx
 * POST /api/leads — full lead creation with validation, duplicate check, activity log, branch stats
 */

import { getAdminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

// ── Cache helpers ──────────────────────────────────────────────────────────
const listKey = (fid, bid) => `leads:${fid}:${bid}:list`;
const statusKey = (fid, bid, status) => `leads:${fid}:${bid}:${status}`;
const LEAD_TTL = 120;

function serializeLead(d) {
  const data = d.data();
  const s = (v) => v?.toDate?.()?.toISOString() ?? v ?? null;
  return {
    id: d.id,
    ...data,
    created_at: s(data.created_at),
    updated_at: s(data.updated_at),
    next_followup_date: s(data.next_followup_date),
    converted_at: s(data.converted_at),
    last_contacted_at: s(data.last_contacted_at),
  };
}

function guestRange(count) {
  if (!count) return null;
  const n = Number(count);
  if (n <= 50) return "1-50";
  if (n <= 100) return "51-100";
  if (n <= 200) return "101-200";
  if (n <= 300) return "201-300";
  if (n <= 500) return "301-500";
  if (n <= 800) return "501-800";
  return "800+";
}

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get("franchise_id");
    const branch_id = searchParams.get("branch_id");
    const status = searchParams.get("status") || null;
    const customer_uid = searchParams.get("customer_uid") || null;
    const adminDb = getAdminDb();

    if (customer_uid) {
      const cKey = `leads:customer:${customer_uid}`;
      const cached = cache.get(cKey);
      if (cached) return NextResponse.json({ ...cached, cached: true });
      const snap = await adminDb
        .collection("leads")
        .where("customer_uid", "==", customer_uid)
        .get();
      const leads = snap.docs.map(serializeLead);
      leads.sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || ""),
      );
      const payload = { leads, total: leads.length, customer_uid };
      cache.set(cKey, payload, LEAD_TTL);
      return NextResponse.json(payload);
    }

    if (!franchise_id && !branch_id) {
      return NextResponse.json(
        { error: "franchise_id required" },
        { status: 400 },
      );
    }

    // Franchise-level query (no branch_id): fetch all leads for the franchise
    if (franchise_id && !branch_id) {
      const cKey = `leads:franchise:${franchise_id}:${status || "all"}`;
      const cached = cache.get(cKey);
      if (cached) return NextResponse.json({ ...cached, cached: true });
      const snap = await adminDb
        .collection("leads")
        .where("franchise_id", "==", franchise_id)
        .get();
      let leads = snap.docs.map(serializeLead);
      if (status) leads = leads.filter((l) => l.status === status);
      leads.sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || ""),
      );
      const payload = {
        leads,
        total: leads.length,
        franchise_id,
        filter_status: status,
      };
      cache.set(cKey, payload, LEAD_TTL);
      return NextResponse.json(payload);
    }

    const cKey = status
      ? statusKey(franchise_id, branch_id, status)
      : listKey(franchise_id, branch_id);
    const cached = cache.get(cKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const snap = await adminDb
      .collection("leads")
      .where("branch_id", "==", branch_id)
      .get();
    let leads = snap.docs.map(serializeLead);
    leads = leads.filter((l) => l.franchise_id === franchise_id);
    if (status) leads = leads.filter((l) => l.status === status);
    leads.sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || ""),
    );
    const payload = {
      leads,
      total: leads.length,
      franchise_id,
      branch_id,
      filter_status: status,
    };
    cache.set(cKey, payload, LEAD_TTL);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[GET /api/leads]", err);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: err.message },
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
      customer_name,
      phone,
      email,
      event_type,
      event_date,
      expected_guest_count,
      budget_min,
      budget_max,
      budget_flexibility,
      budget_range,
      hall_id,
      hall_name,
      assigned_to_uid,
      assigned_to_name,
      customer_uid,
      lead_source,
      source_detail,
      referrer_name,
      referrer_phone,
      notes,
      priority,
      next_followup_date,
      next_followup_type,
      created_by_uid,
      created_by_name,
      created_by_role,
      catering_required,
      decor_required,
      company_name,
      client_type,
    } = body;

    // Validate required
    const missing = [];
    if (!franchise_id) missing.push("franchise_id");
    if (!branch_id) missing.push("branch_id");
    if (!customer_name) missing.push("customer_name");
    if (!phone) missing.push("phone");
    if (missing.length)
      return NextResponse.json(
        { error: `Missing: ${missing.join(", ")}` },
        { status: 400 },
      );

    // Email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Future date check
    if (event_date) {
      const evDate = new Date(event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (evDate < today)
        return NextResponse.json(
          { error: "Event date must be in the future" },
          { status: 400 },
        );
    }

    // Budget check
    if (budget_min && budget_max && Number(budget_max) < Number(budget_min)) {
      return NextResponse.json(
        { error: "Budget max must be >= budget min" },
        { status: 400 },
      );
    }

    const adminDb = getAdminDb();

    // Phone duplicate check within branch
    const dupSnap = await adminDb
      .collection("leads")
      .where("phone", "==", phone.trim())
      .where("branch_id", "==", branch_id)
      .limit(1)
      .get();

    if (!dupSnap.empty) {
      const existing = dupSnap.docs[0];
      const ed = existing.data();
      if (!["lost", "closed", "converted"].includes(ed.status)) {
        return NextResponse.json(
          {
            error: "Duplicate phone number",
            message: `Lead exists: ${ed.customer_name} (${ed.status})`,
            existing_lead_id: existing.id,
            existing_status: ed.status,
          },
          { status: 409 },
        );
      }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = adminDb.batch();

    // 1. Create lead
    const leadRef = adminDb.collection("leads").doc();
    const leadData = {
      franchise_id,
      branch_id,
      status: "new",
      priority: priority || "medium",
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      client_type: client_type || "individual",
      company_name: company_name || null,
      event_type: event_type || null,
      event_date: event_date || null,
      expected_guest_count: expected_guest_count
        ? Number(expected_guest_count)
        : null,
      guest_range: guestRange(expected_guest_count),
      catering_required: catering_required !== false,
      decor_required: decor_required !== false,
      budget_min: budget_min ? Number(budget_min) : null,
      budget_max: budget_max ? Number(budget_max) : null,
      budget_flexibility: budget_flexibility || "moderate",
      budget_range: budget_range || null,
      hall_id: hall_id || null,
      hall_name: hall_name || null,
      lead_source: lead_source || "walk_in",
      source_detail: source_detail || null,
      referrer_name: referrer_name || null,
      referrer_phone: referrer_phone || null,
      assigned_to_uid: assigned_to_uid || null,
      assigned_to_name: assigned_to_name || null,
      customer_uid: customer_uid || null,
      next_followup_date: next_followup_date || null,
      next_followup_type: next_followup_type || null,
      followup_count: 0,
      last_contacted_at: null,
      status_history: [
        {
          status: "new",
          changed_at: new Date().toISOString(),
          changed_by: created_by_uid || null,
          note: "Lead created",
        },
      ],
      site_visit: null,
      food_tasting: null,
      proposal: null,
      menu_finalization: null,
      booking_confirmed: null,
      event_finalization: null,
      final_payment: null,
      event_execution: null,
      post_event_settlement: null,
      feedback: null,
      is_converted: false,
      converted_booking_id: null,
      converted_at: null,
      lost_reason: null,
      lost_detail: null,
      competitor_chosen: null,
      on_hold_reason: null,
      on_hold_until: null,
      ai_score: null,
      ai_score_label: null,
      ai_suggested_action: null,
      ai_risk_factors: null,
      ai_sentiment: null,
      ai_score_updated_at: null,
      decor_interest: null,
      notes: notes || null,
      created_by_uid: created_by_uid || null,
      created_by_name: created_by_name || null,
      created_by_role: created_by_role || null,
      created_at: now,
      updated_at: now,
    };
    batch.set(leadRef, leadData);

    // 2. Activity log
    const actRef = adminDb.collection("lead_activities").doc();
    batch.set(actRef, {
      lead_id: leadRef.id,
      franchise_id,
      branch_id,
      activity_type: "lead_created",
      description: `Lead created for ${customer_name.trim()} — ${event_type || "TBD"}`,
      performed_by_uid: created_by_uid || null,
      performed_by_name: created_by_name || null,
      metadata: {
        event_type,
        lead_source: lead_source || "walk_in",
        expected_guests: expected_guest_count
          ? Number(expected_guest_count)
          : null,
      },
      created_at: now,
    });

    // 3. Branch stats update (safe — uses increment)
    try {
      const branchRef = adminDb.collection("branches").doc(branch_id);
      batch.update(branchRef, {
        "_stats.total_leads": admin.firestore.FieldValue.increment(1),
        "_stats.leads_by_status.new": admin.firestore.FieldValue.increment(1),
        [`_stats.leads_by_source.${lead_source || "walk_in"}`]:
          admin.firestore.FieldValue.increment(1),
        "_stats.last_updated_at": now,
      });
    } catch (e) {
      /* branch may not have _stats yet — non-critical */
    }

    // 4. Notification for assigned exec
    if (assigned_to_uid) {
      const notifRef = adminDb.collection("notifications").doc();
      batch.set(notifRef, {
        user_id: assigned_to_uid,
        franchise_id,
        branch_id,
        type: "new_lead",
        title: "New Lead Assigned",
        message: `New lead: ${customer_name.trim()} — ${event_type || "Enquiry"}`,
        lead_id: leadRef.id,
        read: false,
        created_at: now,
      });
    }

    // 5. Audit log
    const auditRef = adminDb.collection("audit_logs").doc();
    batch.set(auditRef, {
      entity_type: "lead",
      entity_id: leadRef.id,
      action: "create",
      franchise_id,
      branch_id,
      performed_by_uid: created_by_uid || null,
      performed_by_name: created_by_name || null,
      details: {
        customer_name: customer_name.trim(),
        phone: phone.trim(),
        event_type,
      },
      created_at: now,
    });

    await batch.commit();

    // Invalidate caches
    cache.del(listKey(franchise_id, branch_id));
    cache.del(statusKey(franchise_id, branch_id, "new"));
    if (customer_uid) cache.del(`leads:customer:${customer_uid}`);

    return NextResponse.json(
      {
        success: true,
        id: leadRef.id,
        message: `Lead created — ${leadRef.id}`,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json(
      { error: "Failed to create lead", details: err.message },
      { status: 500 },
    );
  }
}
