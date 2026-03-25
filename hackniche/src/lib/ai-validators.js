/**
 * AI API — Request Body Validators
 * All enums and field rules are derived directly from the BMS Master System Design v3.0.0
 * Database schema (§10) and form definitions (§7).
 *
 * Each validate* function returns:
 *   { valid: true, data: <cleansed object> }
 *   { valid: false, errors: string[] }
 */

// ─── Enums from DB schema ────────────────────────────────────────────────────

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Site Visit Scheduled",
  "Site Visit Done",
  "Proposal Sent",
  "Negotiation",
  "Hot",
  "Warm",
  "Cold",
  "Converted",
  "Lost",
  "On Hold",
];

export const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Sangeet",
  "Mehendi",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Corporate",
  "Conference",
  "Product Launch",
  "Award Night",
  "Other",
];

export const LEAD_SOURCES = [
  "google_ads",
  "instagram_ads",
  "facebook_ads",
  "instagram",
  "facebook",
  "youtube",
  "google_business",
  "justdial",
  "sulekha",
  "wedding_wire",
  "website_form",
  "ai_chatbot",
  "walk_in",
  "phone_call",
  "referral_client",
  "referral_vendor",
  "event_fair",
  "print_media",
  "outdoor_media",
  "repeat_client",
  "staff_referral",
  "other",
];

export const GUEST_RANGES = ["< 100", "100-200", "200-400", "400-600", "600+"];

export const BUDGET_FLEXIBILITIES = ["Fixed", "Moderate", "Flexible"];

export const FOLLOWUP_TYPES = ["Call", "WhatsApp", "Email", "Site Visit", "Other"];

export const FOLLOWUP_OUTCOMES = [
  "Interested",
  "Not Interested",
  "Call Back Later",
  "No Response",
  "Switched Off",
  "Wrong Number",
  "Converted",
  "Rescheduled",
];

export const MENU_TYPES = ["Veg", "Non-Veg", "Mixed", "Jain"];

export const CATERING_TYPES = ["Veg Only", "Non-Veg", "Mixed", "Jain", "No Catering"];

export const TIME_SLOTS = ["Morning", "Evening", "Full Day", "Night"];

export const PACKAGE_TYPES = ["Basic", "Standard", "Premium", "Luxury", "Custom"];

export const ACTIVITY_TYPES = [
  "lead_created",
  "status_changed",
  "call_made",
  "call_received",
  "whatsapp_sent",
  "whatsapp_received",
  "email_sent",
  "site_visit_scheduled",
  "site_visit_completed",
  "proposal_sent",
  "proposal_viewed",
  "followup_logged",
  "note_added",
  "assigned",
  "converted",
  "lost",
  "on_hold",
  "ai_scored",
  "ai_suggestion_applied",
  "reminder_sent",
];

export const ROLES = [
  "super_admin",
  "franchise_admin",
  "branch_manager",
  "sales_executive",
  "kitchen_manager",
  "accountant",
  "operations_staff",
  "receptionist",
];

export const INVENTORY_CATEGORIES = [
  "Raw Material",
  "Supplies",
  "Beverages",
  "Equipment",
  "Decorations",
  "Packaging",
  "Cleaning",
  "Other",
];

export const INVENTORY_UNITS = ["Kg", "Litre", "Piece", "Pack", "Box", "Dozen", "Metre", "Bag"];

export const BOOKING_STATUSES = ["Confirmed", "Tentative", "Completed", "Cancelled"];

export const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Online"];

export const INSIGHT_TYPES = [
  "revenue_forecast",
  "lead_score",
  "menu_recommendation",
  "proposal_draft",
  "followup_suggestion",
  "sentiment_analysis",
  "pricing_advice",
  "staff_roster",
  "risk_alert",
  "consumption_prediction",
  "low_stock_forecast",
  "cross_branch_analysis",
  "global_forecast",
  "marketing_roi",
];

// ─── Core helpers ────────────────────────────────────────────────────────────

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isPositiveNumber(v) {
  return typeof v === "number" && isFinite(v) && v >= 0;
}

function isPositiveInt(v) {
  return Number.isInteger(v) && v >= 0;
}

function inEnum(v, enumArr) {
  return enumArr.includes(v);
}

export function buildResult(errors, data = null) {
  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, data };
}

// ─── 1. Lead Score ────────────────────────────────────────────────────────────
// Input mirrors /leads fields the frontend sends for AI scoring
export function validateLeadScoreInput(body) {
  const e = [];
  const d = {};

  // Required: event_type
  if (!inEnum(body.event_type, EVENT_TYPES))
    e.push(`event_type must be one of: ${EVENT_TYPES.join(", ")}`);
  else d.event_type = body.event_type;

  // Required: source
  if (!inEnum(body.source, LEAD_SOURCES))
    e.push(`source must be one of: ${LEAD_SOURCES.join(", ")}`);
  else d.source = body.source;

  // Required: status
  if (!inEnum(body.status, LEAD_STATUSES))
    e.push(`status must be one of: ${LEAD_STATUSES.join(", ")}`);
  else d.status = body.status;

  // Optional number fields from leads schema
  if (body.budget_min !== undefined) {
    if (!isPositiveNumber(body.budget_min)) e.push("budget_min must be a non-negative number");
    else d.budget_min = body.budget_min;
  }
  if (body.budget_max !== undefined) {
    if (!isPositiveNumber(body.budget_max)) e.push("budget_max must be a non-negative number");
    else d.budget_max = body.budget_max;
  }
  if (body.budget_min !== undefined && body.budget_max !== undefined) {
    if (d.budget_min > d.budget_max) e.push("budget_min cannot exceed budget_max");
  }

  if (body.budget_flexibility !== undefined) {
    if (!inEnum(body.budget_flexibility, BUDGET_FLEXIBILITIES))
      e.push(`budget_flexibility must be one of: ${BUDGET_FLEXIBILITIES.join(", ")}`);
    else d.budget_flexibility = body.budget_flexibility;
  }

  if (body.guest_range !== undefined) {
    if (!inEnum(body.guest_range, GUEST_RANGES))
      e.push(`guest_range must be one of: ${GUEST_RANGES.join(", ")}`);
    else d.guest_range = body.guest_range;
  }

  // preferred_date_days_away: computed by client (positive = future date)
  if (body.preferred_date_days_away !== undefined) {
    if (typeof body.preferred_date_days_away !== "number")
      e.push("preferred_date_days_away must be a number");
    else d.preferred_date_days_away = body.preferred_date_days_away;
  }

  if (body.followup_count !== undefined) {
    if (!isPositiveInt(body.followup_count)) e.push("followup_count must be a non-negative integer");
    else d.followup_count = body.followup_count;
  }

  if (body.days_since_last_contact !== undefined) {
    if (!isPositiveNumber(body.days_since_last_contact))
      e.push("days_since_last_contact must be a non-negative number");
    else d.days_since_last_contact = body.days_since_last_contact;
  }

  // Booleans from nested leads schema fields
  if (body.site_visit_done !== undefined) {
    if (typeof body.site_visit_done !== "boolean") e.push("site_visit_done must be a boolean");
    else d.site_visit_done = body.site_visit_done;
  }
  if (body.proposal_sent !== undefined) {
    if (typeof body.proposal_sent !== "boolean") e.push("proposal_sent must be a boolean");
    else d.proposal_sent = body.proposal_sent;
  }
  if (body.proposal_viewed !== undefined) {
    if (typeof body.proposal_viewed !== "boolean") e.push("proposal_viewed must be a boolean");
    else d.proposal_viewed = body.proposal_viewed;
  }

  if (body.avg_response_time_hrs !== undefined) {
    if (!isPositiveNumber(body.avg_response_time_hrs))
      e.push("avg_response_time_hrs must be a non-negative number");
    else d.avg_response_time_hrs = body.avg_response_time_hrs;
  }

  if (body.historical_branch_conversion_rate_pct !== undefined) {
    if (
      typeof body.historical_branch_conversion_rate_pct !== "number" ||
      body.historical_branch_conversion_rate_pct < 0 ||
      body.historical_branch_conversion_rate_pct > 100
    )
      e.push("historical_branch_conversion_rate_pct must be a number 0–100");
    else d.historical_branch_conversion_rate_pct = body.historical_branch_conversion_rate_pct;
  }

  // branch_id & franchise_id for context (non-empty strings)
  ["branch_id", "franchise_id", "lead_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 2. Follow-up Suggestions ─────────────────────────────────────────────────
export function validateFollowupSuggestionsInput(body) {
  const e = [];
  const d = {};

  // Required: lead_id, lead status
  if (!isNonEmptyString(body.lead_id)) e.push("lead_id is required");
  else d.lead_id = body.lead_id;

  if (!inEnum(body.current_status, LEAD_STATUSES))
    e.push(`current_status must be one of: ${LEAD_STATUSES.join(", ")}`);
  else d.current_status = body.current_status;

  // activities: array of last 5 lead_activities (from /lead_activities collection)
  if (!Array.isArray(body.recent_activities))
    e.push("recent_activities must be an array");
  else {
    if (body.recent_activities.length > 10)
      e.push("recent_activities may contain at most 10 entries");
    else {
      body.recent_activities.forEach((a, i) => {
        if (!inEnum(a.activity_type, ACTIVITY_TYPES))
          e.push(`recent_activities[${i}].activity_type must be a valid activity type`);
        if (a.description !== undefined && !isNonEmptyString(a.description))
          e.push(`recent_activities[${i}].description must be a non-empty string if provided`);
        if (a.outcome !== undefined && !isNonEmptyString(a.outcome))
          e.push(`recent_activities[${i}].outcome must be a non-empty string if provided`);
      });
      d.recent_activities = body.recent_activities;
    }
  }

  // Optional fields
  if (body.last_contacted_via !== undefined) {
    if (!inEnum(body.last_contacted_via, FOLLOWUP_TYPES))
      e.push(`last_contacted_via must be one of: ${FOLLOWUP_TYPES.join(", ")}`);
    else d.last_contacted_via = body.last_contacted_via;
  }
  if (body.days_since_last_contact !== undefined) {
    if (!isPositiveNumber(body.days_since_last_contact))
      e.push("days_since_last_contact must be a non-negative number");
    else d.days_since_last_contact = body.days_since_last_contact;
  }
  if (body.client_phone_area_code !== undefined) {
    if (!isNonEmptyString(body.client_phone_area_code))
      e.push("client_phone_area_code must be a non-empty string");
    else d.client_phone_area_code = body.client_phone_area_code;
  }

  // Scoping
  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 3. Sentiment Analysis ────────────────────────────────────────────────────
export function validateSentimentAnalysisInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.lead_id)) e.push("lead_id is required");
  else d.lead_id = body.lead_id;

  // notes: array of strings from follow_ups.notes or lead_activities.description
  if (!Array.isArray(body.notes) || body.notes.length === 0)
    e.push("notes must be a non-empty array of strings");
  else {
    if (body.notes.length > 10) e.push("notes may contain at most 10 entries");
    else {
      body.notes.forEach((n, i) => {
        if (typeof n !== "string" || n.trim().length < 10)
          e.push(`notes[${i}] must be a string of at least 10 characters`);
      });
      d.notes = body.notes;
    }
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 4. Generate Proposal ─────────────────────────────────────────────────────
export function validateGenerateProposalInput(body) {
  const e = [];
  const d = {};

  // Lead fields (from /leads schema)
  if (!isNonEmptyString(body.lead_id)) e.push("lead_id is required");
  else d.lead_id = body.lead_id;

  if (!isNonEmptyString(body.client_name)) e.push("client_name is required");
  else d.client_name = body.client_name;

  if (!inEnum(body.event_type, EVENT_TYPES))
    e.push(`event_type must be one of: ${EVENT_TYPES.join(", ")}`);
  else d.event_type = body.event_type;

  if (!isPositiveInt(body.expected_guests) || body.expected_guests === 0)
    e.push("expected_guests must be a positive integer");
  else d.expected_guests = body.expected_guests;

  // event_date as ISO string (originally Timestamp in Firestore)
  if (!isNonEmptyString(body.event_date)) e.push("event_date is required (ISO string)");
  else {
    const parsed = Date.parse(body.event_date);
    if (isNaN(parsed)) e.push("event_date must be a valid ISO date string");
    else d.event_date = body.event_date;
  }

  if (!inEnum(body.time_slot, TIME_SLOTS))
    e.push(`time_slot must be one of: ${TIME_SLOTS.join(", ")}`);
  else d.time_slot = body.time_slot;

  if (body.budget_min !== undefined) {
    if (!isPositiveNumber(body.budget_min)) e.push("budget_min must be non-negative");
    else d.budget_min = body.budget_min;
  }
  if (body.budget_max !== undefined) {
    if (!isPositiveNumber(body.budget_max)) e.push("budget_max must be non-negative");
    else d.budget_max = body.budget_max;
  }
  if (body.catering_required !== undefined) {
    if (typeof body.catering_required !== "boolean") e.push("catering_required must be boolean");
    else d.catering_required = body.catering_required;
  }
  if (body.decoration_required !== undefined) {
    if (typeof body.decoration_required !== "boolean")
      e.push("decoration_required must be boolean");
    else d.decoration_required = body.decoration_required;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") e.push("notes must be a string");
    else d.notes = body.notes;
  }

  // Halls array (from /halls collection, denormalized snapshot)
  if (!Array.isArray(body.halls) || body.halls.length === 0)
    e.push("halls must be a non-empty array from /halls collection");
  else {
    body.halls.forEach((h, i) => {
      if (!isNonEmptyString(h.hall_name))
        e.push(`halls[${i}].hall_name is required`);
      if (!isPositiveInt(h.capacity_seated))
        e.push(`halls[${i}].capacity_seated must be a positive integer`);
    });
    d.halls = body.halls;
  }

  // Menus array (from /menus collection)
  if (Array.isArray(body.menus)) {
    body.menus.forEach((m, i) => {
      if (!isNonEmptyString(m.menu_name)) e.push(`menus[${i}].menu_name is required`);
      if (!isPositiveNumber(m.price_per_plate) || m.price_per_plate === 0)
        e.push(`menus[${i}].price_per_plate must be a positive number`);
      if (!inEnum(m.menu_type, MENU_TYPES))
        e.push(`menus[${i}].menu_type must be one of: ${MENU_TYPES.join(", ")}`);
    });
    d.menus = body.menus;
  }

  // Branch branding
  if (body.branch_name !== undefined) {
    if (!isNonEmptyString(body.branch_name)) e.push("branch_name must be a non-empty string");
    else d.branch_name = body.branch_name;
  }
  if (body.franchise_name !== undefined) {
    if (!isNonEmptyString(body.franchise_name)) e.push("franchise_name must be a non-empty string");
    else d.franchise_name = body.franchise_name;
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 5. Revenue Forecast ──────────────────────────────────────────────────────
export function validateRevenueForecastInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;
  if (!isNonEmptyString(body.franchise_id)) e.push("franchise_id is required");
  else d.franchise_id = body.franchise_id;

  // hot_leads array from /leads with ai_score
  if (!Array.isArray(body.hot_leads)) e.push("hot_leads must be an array");
  else {
    body.hot_leads.forEach((l, i) => {
      if (!isPositiveNumber(l.estimated_value))
        e.push(`hot_leads[${i}].estimated_value must be a non-negative number`);
      if (!isPositiveInt(l.event_date_days))
        e.push(`hot_leads[${i}].event_date_days must be a non-negative integer`);
      if (typeof l.score !== "number" || l.score < 0 || l.score > 100)
        e.push(`hot_leads[${i}].score must be a number 0–100`);
    });
    d.hot_leads = body.hot_leads;
  }

  if (!isPositiveInt(body.warm_leads_count)) e.push("warm_leads_count must be a non-negative integer");
  else d.warm_leads_count = body.warm_leads_count;

  if (!isPositiveNumber(body.avg_warm_lead_value)) e.push("avg_warm_lead_value must be non-negative");
  else d.avg_warm_lead_value = body.avg_warm_lead_value;

  if (
    typeof body.historical_conversion_rate !== "number" ||
    body.historical_conversion_rate < 0 ||
    body.historical_conversion_rate > 1
  )
    e.push("historical_conversion_rate must be a decimal between 0 and 1 (e.g. 0.182)");
  else d.historical_conversion_rate = body.historical_conversion_rate;

  if (!isPositiveNumber(body.confirmed_bookings_revenue))
    e.push("confirmed_bookings_revenue must be non-negative");
  else d.confirmed_bookings_revenue = body.confirmed_bookings_revenue;

  if (!isPositiveNumber(body.pending_balance_bookings))
    e.push("pending_balance_bookings must be non-negative");
  else d.pending_balance_bookings = body.pending_balance_bookings;

  if (!isNonEmptyString(body.month)) e.push("month is required (e.g. 'March')");
  else d.month = body.month;

  if (typeof body.is_peak_season !== "boolean") e.push("is_peak_season must be a boolean");
  else d.is_peak_season = body.is_peak_season;

  if (body.peak_multiplier !== undefined) {
    if (typeof body.peak_multiplier !== "number" || body.peak_multiplier <= 0)
      e.push("peak_multiplier must be a positive number");
    else d.peak_multiplier = body.peak_multiplier;
  }

  return buildResult(e, d);
}

// ─── 6. Dynamic Pricing / Discount Advice ────────────────────────────────────
export function validatePricingAdviceInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;
  if (!isNonEmptyString(body.franchise_id)) e.push("franchise_id is required");
  else d.franchise_id = body.franchise_id;

  // event_date for this pricing query
  if (!isNonEmptyString(body.target_date)) e.push("target_date is required (ISO string)");
  else {
    if (isNaN(Date.parse(body.target_date))) e.push("target_date must be a valid ISO date string");
    else d.target_date = body.target_date;
  }

  if (typeof body.days_to_event !== "number" || body.days_to_event < 0)
    e.push("days_to_event must be a non-negative number");
  else d.days_to_event = body.days_to_event;

  // occupancy_pct from calendar (branches/_stats.occupancy_pct_mtd range 0-100)
  if (typeof body.occupancy_pct !== "number" || body.occupancy_pct < 0 || body.occupancy_pct > 100)
    e.push("occupancy_pct must be a number 0–100");
  else d.occupancy_pct = body.occupancy_pct;

  if (!isPositiveInt(body.active_leads_for_date)) e.push("active_leads_for_date must be a non-negative integer");
  else d.active_leads_for_date = body.active_leads_for_date;

  if (!isPositiveNumber(body.base_price)) e.push("base_price must be a positive number (from halls.pricing)");
  else d.base_price = body.base_price;

  if (!isNonEmptyString(body.hall_name)) e.push("hall_name is required");
  else d.hall_name = body.hall_name;

  return buildResult(e, d);
}

// ─── 7. Staff Rostering ──────────────────────────────────────────────────────
export function validateStaffRosterInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;

  if (!Array.isArray(body.upcoming_bookings) || body.upcoming_bookings.length === 0)
    e.push("upcoming_bookings must be a non-empty array from /bookings collection");
  else {
    body.upcoming_bookings.forEach((b, i) => {
      if (!isNonEmptyString(b.booking_id))
        e.push(`upcoming_bookings[${i}].booking_id is required`);
      if (!isPositiveInt(b.expected_guests) || b.expected_guests === 0)
        e.push(`upcoming_bookings[${i}].expected_guests must be a positive integer`);
      if (!inEnum(b.catering_type, CATERING_TYPES))
        e.push(`upcoming_bookings[${i}].catering_type must be one of: ${CATERING_TYPES.join(", ")}`);
      if (!inEnum(b.event_type, EVENT_TYPES))
        e.push(`upcoming_bookings[${i}].event_type must be one of: ${EVENT_TYPES.join(", ")}`);
      if (!inEnum(b.package_type, PACKAGE_TYPES))
        e.push(`upcoming_bookings[${i}].package_type must be one of: ${PACKAGE_TYPES.join(", ")}`);
    });
    d.upcoming_bookings = body.upcoming_bookings;
  }

  return buildResult(e, d);
}

// ─── 8. Lead Risk Alerts ──────────────────────────────────────────────────────
export function validateLeadRiskAlertsInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;
  if (!isNonEmptyString(body.franchise_id)) e.push("franchise_id is required");
  else d.franchise_id = body.franchise_id;

  if (!Array.isArray(body.leads) || body.leads.length === 0)
    e.push("leads must be a non-empty array");
  else {
    body.leads.forEach((l, i) => {
      if (!isNonEmptyString(l.lead_id)) e.push(`leads[${i}].lead_id is required`);
      if (!isNonEmptyString(l.client_name)) e.push(`leads[${i}].client_name is required`);
      if (!inEnum(l.status, LEAD_STATUSES))
        e.push(`leads[${i}].status must be one of: ${LEAD_STATUSES.join(", ")}`);
      if (!isPositiveNumber(l.days_since_last_activity))
        e.push(`leads[${i}].days_since_last_activity must be non-negative`);
      if (!isPositiveNumber(l.estimated_value))
        e.push(`leads[${i}].estimated_value must be non-negative (computed from budget_max)`);
      // ai_sentiment is optional — from ai_insights
      if (l.ai_sentiment !== undefined && !["Positive", "Neutral", "Negative"].includes(l.ai_sentiment))
        e.push(`leads[${i}].ai_sentiment must be Positive, Neutral, or Negative`);
      if (typeof l.ai_score !== "number" || l.ai_score < 0 || l.ai_score > 100)
        e.push(`leads[${i}].ai_score must be a number 0–100`);
    });
    d.leads = body.leads;
  }

  return buildResult(e, d);
}

// ─── 9. Menu Recommendation ───────────────────────────────────────────────────
export function validateMenuRecommendationInput(body) {
  const e = [];
  const d = {};

  if (!inEnum(body.event_type, EVENT_TYPES))
    e.push(`event_type must be one of: ${EVENT_TYPES.join(", ")}`);
  else d.event_type = body.event_type;

  if (!isPositiveInt(body.expected_guests) || body.expected_guests === 0)
    e.push("expected_guests must be a positive integer");
  else d.expected_guests = body.expected_guests;

  if (!isPositiveNumber(body.budget_per_head) || body.budget_per_head === 0)
    e.push("budget_per_head must be a positive number (₹ per person)");
  else d.budget_per_head = body.budget_per_head;

  if (!inEnum(body.dietary_preference, MENU_TYPES))
    e.push(`dietary_preference must be one of: ${MENU_TYPES.join(", ")}`);
  else d.dietary_preference = body.dietary_preference;

  if (!inEnum(body.event_time_slot, TIME_SLOTS))
    e.push(`event_time_slot must be one of: ${TIME_SLOTS.join(", ")}`);
  else d.event_time_slot = body.event_time_slot;

  if (body.special_requirements !== undefined) {
    if (typeof body.special_requirements !== "string")
      e.push("special_requirements must be a string");
    else d.special_requirements = body.special_requirements;
  }

  // Available menus from /menus collection (scoped to branch/franchise)
  if (!Array.isArray(body.available_menus) || body.available_menus.length === 0)
    e.push("available_menus must be a non-empty array from /menus collection");
  else {
    body.available_menus.forEach((m, i) => {
      if (!isNonEmptyString(m.menu_id)) e.push(`available_menus[${i}].menu_id is required`);
      if (!isNonEmptyString(m.menu_name)) e.push(`available_menus[${i}].menu_name is required`);
      if (!inEnum(m.menu_type, MENU_TYPES))
        e.push(`available_menus[${i}].menu_type must be one of: ${MENU_TYPES.join(", ")}`);
      if (!isPositiveNumber(m.price_per_plate) || m.price_per_plate === 0)
        e.push(`available_menus[${i}].price_per_plate must be a positive number`);
      if (!isPositiveInt(m.min_plates)) e.push(`available_menus[${i}].min_plates must be a non-negative integer`);
    });
    d.available_menus = body.available_menus;
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 10. Consumption Prediction ───────────────────────────────────────────────
export function validateConsumptionPredictionInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;

  if (!Array.isArray(body.upcoming_bookings) || body.upcoming_bookings.length === 0)
    e.push("upcoming_bookings must be a non-empty array");
  else {
    body.upcoming_bookings.forEach((b, i) => {
      if (!isNonEmptyString(b.booking_id)) e.push(`upcoming_bookings[${i}].booking_id is required`);
      if (!isPositiveInt(b.expected_guests) || b.expected_guests === 0)
        e.push(`upcoming_bookings[${i}].expected_guests must be positive`);
      if (!isNonEmptyString(b.menu_name)) e.push(`upcoming_bookings[${i}].menu_name is required`);
      if (!inEnum(b.catering_type, CATERING_TYPES))
        e.push(`upcoming_bookings[${i}].catering_type must be one of: ${CATERING_TYPES.join(", ")}`);
      if (!isNonEmptyString(b.event_date)) e.push(`upcoming_bookings[${i}].event_date is required`);
    });
    d.upcoming_bookings = body.upcoming_bookings;
  }

  if (!isNonEmptyString(body.season)) e.push("season is required (e.g. 'Winter', 'Summer', 'Monsoon')");
  else d.season = body.season;

  // current_stock from /raw_materials collection
  if (!Array.isArray(body.current_stock)) e.push("current_stock must be an array from /raw_materials");
  else {
    body.current_stock.forEach((s, i) => {
      if (!isNonEmptyString(s.item_id)) e.push(`current_stock[${i}].item_id is required`);
      if (!isNonEmptyString(s.item_name)) e.push(`current_stock[${i}].item_name is required`);
      if (!inEnum(s.unit, INVENTORY_UNITS))
        e.push(`current_stock[${i}].unit must be one of: ${INVENTORY_UNITS.join(", ")}`);
      if (!isPositiveNumber(s.current_stock)) e.push(`current_stock[${i}].current_stock must be non-negative`);
    });
    d.current_stock = body.current_stock;
  }

  return buildResult(e, d);
}

// ─── 11. Low Stock Forecast ───────────────────────────────────────────────────
export function validateLowStockForecastInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;

  // raw_materials from /raw_materials collection
  if (!Array.isArray(body.raw_materials) || body.raw_materials.length === 0)
    e.push("raw_materials must be a non-empty array from /raw_materials collection");
  else {
    body.raw_materials.forEach((r, i) => {
      if (!isNonEmptyString(r.item_id)) e.push(`raw_materials[${i}].item_id is required`);
      if (!isNonEmptyString(r.item_name)) e.push(`raw_materials[${i}].item_name is required`);
      if (!inEnum(r.unit, INVENTORY_UNITS))
        e.push(`raw_materials[${i}].unit must be one of: ${INVENTORY_UNITS.join(", ")}`);
      if (!isPositiveNumber(r.current_stock)) e.push(`raw_materials[${i}].current_stock must be non-negative`);
      if (!isPositiveNumber(r.min_stock_level)) e.push(`raw_materials[${i}].min_stock_level must be non-negative`);
    });
    d.raw_materials = body.raw_materials;
  }

  // Next 7 days of bookings for consumption projection
  if (!Array.isArray(body.next_week_bookings)) e.push("next_week_bookings must be an array");
  else {
    body.next_week_bookings.forEach((b, i) => {
      if (!isNonEmptyString(b.booking_id)) e.push(`next_week_bookings[${i}].booking_id is required`);
      if (!isPositiveInt(b.expected_guests) || b.expected_guests === 0)
        e.push(`next_week_bookings[${i}].expected_guests must be positive`);
      if (!isNonEmptyString(b.menu_name)) e.push(`next_week_bookings[${i}].menu_name is required`);
      if (!inEnum(b.catering_type, CATERING_TYPES))
        e.push(`next_week_bookings[${i}].catering_type must be valid`);
    });
    d.next_week_bookings = body.next_week_bookings;
  }

  return buildResult(e, d);
}

// ─── 12. Cross-Branch Performance Analysis ────────────────────────────────────
export function validateCrossBranchAnalysisInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.franchise_id)) e.push("franchise_id is required");
  else d.franchise_id = body.franchise_id;

  // branches_stats: array of branch _stats + _lead_stats documents
  if (!Array.isArray(body.branches_stats) || body.branches_stats.length < 2)
    e.push("branches_stats must be an array of at least 2 branch stat objects");
  else {
    body.branches_stats.forEach((b, i) => {
      if (!isNonEmptyString(b.branch_id)) e.push(`branches_stats[${i}].branch_id is required`);
      if (!isNonEmptyString(b.branch_name)) e.push(`branches_stats[${i}].branch_name is required`);
      if (!isNonEmptyString(b.city)) e.push(`branches_stats[${i}].city is required`);
      if (typeof b.conversion_rate_pct !== "number")
        e.push(`branches_stats[${i}].conversion_rate_pct must be a number (_lead_stats field)`);
      if (typeof b.revenue_mtd !== "number")
        e.push(`branches_stats[${i}].revenue_mtd must be a number (_stats field)`);
      if (!isPositiveInt(b.total_leads)) e.push(`branches_stats[${i}].total_leads must be non-negative`);
    });
    d.branches_stats = body.branches_stats;
  }

  // leads_by_source from each branch's _lead_stats.leads_by_source
  if (body.leads_by_source_per_branch !== undefined) {
    if (!Array.isArray(body.leads_by_source_per_branch))
      e.push("leads_by_source_per_branch must be an array if provided");
    else d.leads_by_source_per_branch = body.leads_by_source_per_branch;
  }

  return buildResult(e, d);
}

// ─── 13. Global Revenue Forecast ─────────────────────────────────────────────
export function validateGlobalRevenueForecastInput(body) {
  const e = [];
  const d = {};

  // franchise_stats: array from /franchises collection _stats
  if (!Array.isArray(body.franchises_stats) || body.franchises_stats.length === 0)
    e.push("franchises_stats must be a non-empty array from /franchises collection");
  else {
    body.franchises_stats.forEach((f, i) => {
      if (!isNonEmptyString(f.franchise_id)) e.push(`franchises_stats[${i}].franchise_id is required`);
      if (!isNonEmptyString(f.franchise_name)) e.push(`franchises_stats[${i}].franchise_name is required`);
      if (typeof f.total_revenue_mtd !== "number")
        e.push(`franchises_stats[${i}].total_revenue_mtd must be a number`);
      if (typeof f.total_revenue_ytd !== "number")
        e.push(`franchises_stats[${i}].total_revenue_ytd must be a number`);
      if (typeof f.total_leads_hot !== "number")
        e.push(`franchises_stats[${i}].total_leads_hot must be a number`);
      if (typeof f.conversion_rate_pct !== "number")
        e.push(`franchises_stats[${i}].conversion_rate_pct must be a number`);
    });
    d.franchises_stats = body.franchises_stats;
  }

  if (!isNonEmptyString(body.month)) e.push("month is required");
  else d.month = body.month;

  if (typeof body.is_peak_season !== "boolean") e.push("is_peak_season must be a boolean");
  else d.is_peak_season = body.is_peak_season;

  return buildResult(e, d);
}

// ─── 14. Marketing Channel ROI ────────────────────────────────────────────────
export function validateMarketingROIInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.branch_id)) e.push("branch_id is required");
  else d.branch_id = body.branch_id;
  if (!isNonEmptyString(body.franchise_id)) e.push("franchise_id is required");
  else d.franchise_id = body.franchise_id;

  // leads_by_source: array computed from /leads collection grouped by source
  if (!Array.isArray(body.leads_by_source) || body.leads_by_source.length === 0)
    e.push("leads_by_source must be a non-empty array (grouped from /leads by source)");
  else {
    body.leads_by_source.forEach((s, i) => {
      if (!inEnum(s.source, LEAD_SOURCES))
        e.push(`leads_by_source[${i}].source must be a valid lead source`);
      if (!isPositiveInt(s.total_leads)) e.push(`leads_by_source[${i}].total_leads must be non-negative`);
      if (!isPositiveInt(s.converted_leads)) e.push(`leads_by_source[${i}].converted_leads must be non-negative`);
      if (!isPositiveNumber(s.total_booking_value)) e.push(`leads_by_source[${i}].total_booking_value must be non-negative`);
    });
    d.leads_by_source = body.leads_by_source;
  }

  if (body.date_range !== undefined) {
    if (typeof body.date_range !== "object") e.push("date_range must be an object with from/to");
    else {
      if (!isNonEmptyString(body.date_range.from) || !isNonEmptyString(body.date_range.to))
        e.push("date_range requires from and to ISO date strings");
      else d.date_range = body.date_range;
    }
  }

  return buildResult(e, d);
}

// ─── 15. Chatbot ─────────────────────────────────────────────────────────────
export function validateChatbotInput(body) {
  const e = [];
  const d = {};

  // messages array — conversation history
  if (!Array.isArray(body.messages) || body.messages.length === 0)
    e.push("messages must be a non-empty array");
  else {
    body.messages.forEach((m, i) => {
      if (!["user", "assistant", "system"].includes(m.role))
        e.push(`messages[${i}].role must be "user", "assistant", or "system"`);
      if (!isNonEmptyString(m.content)) e.push(`messages[${i}].content must be a non-empty string`);
    });
    d.messages = body.messages;
  }

  // platform config from /platform/coding_gurus
  if (body.branch_name !== undefined) {
    if (!isNonEmptyString(body.branch_name)) e.push("branch_name must be a non-empty string");
    else d.branch_name = body.branch_name;
  }
  if (body.franchise_name !== undefined) {
    if (!isNonEmptyString(body.franchise_name)) e.push("franchise_name must be a non-empty string");
    else d.franchise_name = body.franchise_name;
  }

  // session_id for tracking
  if (body.session_id !== undefined) {
    if (!isNonEmptyString(body.session_id)) e.push("session_id must be a non-empty string");
    else d.session_id = body.session_id;
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 16. WhatsApp Concierge ───────────────────────────────────────────────────
export function validateWhatsAppConciergeInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.message)) e.push("message is required (incoming WhatsApp text)");
  else d.message = body.message;

  if (!isNonEmptyString(body.from_phone)) e.push("from_phone is required (sender's WhatsApp number)");
  else d.from_phone = body.from_phone;

  // menus array from /menus for availability lookups
  if (!Array.isArray(body.menus)) e.push("menus must be an array");
  else d.menus = body.menus;

  // calendar_dates: array of booked dates for availability check
  if (!Array.isArray(body.booked_dates)) e.push("booked_dates must be an array of ISO date strings");
  else {
    body.booked_dates.forEach((d2, i) => {
      if (!isNonEmptyString(d2)) e.push(`booked_dates[${i}] must be a non-empty string`);
    });
    d.booked_dates = body.booked_dates;
  }

  if (body.branch_name !== undefined) {
    if (!isNonEmptyString(body.branch_name)) e.push("branch_name must be a non-empty string");
    else d.branch_name = body.branch_name;
  }
  if (body.franchise_name !== undefined) {
    if (!isNonEmptyString(body.franchise_name)) e.push("franchise_name must be a non-empty string");
    else d.franchise_name = body.franchise_name;
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 17. Video Invitation (Veo) ───────────────────────────────────────────────
export function validateVideoInvitationInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.client_name)) e.push("client_name is required");
  else d.client_name = body.client_name;

  if (!inEnum(body.event_type, EVENT_TYPES))
    e.push(`event_type must be one of: ${EVENT_TYPES.join(", ")}`);
  else d.event_type = body.event_type;

  if (!isNonEmptyString(body.event_date)) e.push("event_date is required (ISO string)");
  else {
    if (isNaN(Date.parse(body.event_date))) e.push("event_date must be a valid ISO date string");
    else d.event_date = body.event_date;
  }

  if (!isNonEmptyString(body.venue_name)) e.push("venue_name is required (from halls.hall_name)");
  else d.venue_name = body.venue_name;

  if (!isNonEmptyString(body.franchise_name)) e.push("franchise_name is required");
  else d.franchise_name = body.franchise_name;

  // Optional style customization
  if (body.style !== undefined) {
    if (!["elegant", "festive", "modern", "traditional", "minimalist"].includes(body.style))
      e.push("style must be one of: elegant, festive, modern, traditional, minimalist");
    else d.style = body.style;
  }
  if (body.color_theme !== undefined) {
    if (typeof body.color_theme !== "string") e.push("color_theme must be a string");
    else d.color_theme = body.color_theme;
  }
  if (body.duration_seconds !== undefined) {
    if (![5, 8].includes(body.duration_seconds)) e.push("duration_seconds must be 5 or 8");
    else d.duration_seconds = body.duration_seconds;
  } else {
    d.duration_seconds = 8;
  }

  if (body.aspect_ratio !== undefined) {
    if (!["16:9", "9:16", "1:1"].includes(body.aspect_ratio))
      e.push("aspect_ratio must be 16:9, 9:16, or 1:1");
    else d.aspect_ratio = body.aspect_ratio;
  } else {
    d.aspect_ratio = "16:9";
  }

  ["branch_id", "franchise_id", "booking_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}

// ─── 18. Generate Image ───────────────────────────────────────────────────────
export function validateGenerateImageInput(body) {
  const e = [];
  const d = {};

  if (!isNonEmptyString(body.prompt)) e.push("prompt is required");
  else d.prompt = body.prompt;

  if (body.style !== undefined) {
    if (!["photorealistic", "illustration", "watercolor", "cinematic", "artistic"].includes(body.style))
      e.push("style must be one of: photorealistic, illustration, watercolor, cinematic, artistic");
    else d.style = body.style;
  }

  if (body.aspect_ratio !== undefined) {
    if (!["1:1", "16:9", "9:16", "4:3", "3:4"].includes(body.aspect_ratio))
      e.push("aspect_ratio must be one of: 1:1, 16:9, 9:16, 4:3, 3:4");
    else d.aspect_ratio = body.aspect_ratio;
  } else {
    d.aspect_ratio = "16:9";
  }

  if (body.sample_count !== undefined) {
    if (!Number.isInteger(body.sample_count) || body.sample_count < 1 || body.sample_count > 4)
      e.push("sample_count must be an integer 1–4");
    else d.sample_count = body.sample_count;
  } else {
    d.sample_count = 1;
  }

  // Context (optional — used to build a richer prompt)
  if (body.event_type !== undefined) {
    if (!inEnum(body.event_type, EVENT_TYPES)) e.push(`event_type must be valid if provided`);
    else d.event_type = body.event_type;
  }
  if (body.venue_name !== undefined) {
    if (!isNonEmptyString(body.venue_name)) e.push("venue_name must be a non-empty string");
    else d.venue_name = body.venue_name;
  }
  if (body.franchise_name !== undefined) {
    if (!isNonEmptyString(body.franchise_name)) e.push("franchise_name must be a non-empty string");
    else d.franchise_name = body.franchise_name;
  }

  ["branch_id", "franchise_id"].forEach((k) => {
    if (body[k] !== undefined) {
      if (!isNonEmptyString(body[k])) e.push(`${k} must be a non-empty string`);
      else d[k] = body[k];
    }
  });

  return buildResult(e, d);
}
