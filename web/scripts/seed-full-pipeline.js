/**
 * BanquetEase — Complete 10-Phase Lead-to-Close Pipeline Seed
 *
 * Seeds a FULLY CLOSED lead for "Rahul Sharma" through all 10 phases:
 *   Phase 1  — Lead created (Receptionist)
 *   Phase 2  — Site visit logged + Tasting scheduled (Sales Executive)
 *   Phase 3  — Tasting completed + Menu finalized (Kitchen Manager)
 *   Phase 4  — Advance payment + Auto-created Booking & Invoice (Accountant)
 *   Phase 5  — Decoration finalized (Operations Staff)
 *   Phase 6  — Full payment recorded (Accountant)
 *   Phase 7  — Event started & completed (Branch Manager)
 *   Phase 8  — Post-event settlement (Accountant/Branch Manager)
 *   Phase 9  — Feedback collected & lead closed
 *   Phase 10 — Payments dashboard data seeded
 *
 * Collections written:
 *   leads/{id}           — 1 fully-closed lead doc
 *   lead_activities/{id} — Activity log entries for every phase transition
 *   follow_ups/{id}      — Follow-up records
 *   bookings/{id}        — 1 confirmed → completed booking with checklist, vendors, staff
 *   invoices/{id}        — 1 fully-paid invoice (INV-01001) with line items + GST
 *   payments/{id}        — 2 payment records (advance + balance)
 *   audit_logs/{id}      — Audit trail entries
 *
 * Usage:
 *   node scripts/seed-full-pipeline.js
 *
 * Prerequisites:
 *   npm install firebase-admin   (run inside web/ directory)
 *   Place serviceAccountKey.json in scripts/
 */

const admin = require('firebase-admin');
const path  = require('path');

// ─────────────────────────────────────────────
//  FIREBASE INIT
// ─────────────────────────────────────────────
const saPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount = null;
try {
  serviceAccount = require(saPath);
} catch (err) {
  console.error('\n❌  serviceAccountKey.json not found at:', saPath);
  console.error('    Download from Firebase Console → Project Settings → Service Accounts\n');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db  = admin.firestore();
const TS  = () => admin.firestore.FieldValue.serverTimestamp();
const INC = (n) => admin.firestore.FieldValue.increment(n);

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const FRANCHISE_ID   = 'pfd';
const BRANCH_ID      = 'pfd_b1';
const FRANCHISE_NAME = 'Prasad Food Divine';
const BRANCH_NAME    = 'Kalyan West';

// ── Date helpers ────────────────────────────
const today       = new Date();
const iso         = (d) => d.toISOString();
const dateStr     = (d) => d.toISOString().slice(0, 10);
const daysFromNow = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
const daysAgo     = (n) => daysFromNow(-n);

// Event date: ~30 days from now
const EVENT_DATE       = dateStr(daysFromNow(30));
const TASTING_DATE     = dateStr(daysFromNow(5));
const SETUP_DATE       = dateStr(daysFromNow(29));
const TEARDOWN_DATE    = dateStr(daysFromNow(31));
const QUOTE_VALID_TILL = dateStr(daysFromNow(14));

// ── Document IDs (deterministic for easy cleanup) ───────────────
const LEAD_ID     = 'LEAD_PIPELINE_RAHUL';
const BOOKING_ID  = 'BKG_PIPELINE_RAHUL';
const INVOICE_ID  = 'INV_PIPELINE_RAHUL';
const PAY_ADV_ID  = 'PAY_PIPELINE_RAHUL_ADV';
const PAY_BAL_ID  = 'PAY_PIPELINE_RAHUL_BAL';

// ── Users (from seed-users.js) ──────────────────────────────────
const USERS = {
  receptionist: {
    email: '2022.shravani.rasam@ves.ac.in',
    name:  'Shravani Rasam (VES)',
    role:  'receptionist',
  },
  sales_executive: {
    email: '2022.pranav.pol@ves.ac.in',
    name:  'Pranav Pol (VES)',
    role:  'sales_executive',
  },
  kitchen_manager: {
    email: 'shravanirasam0212@gmail.com',
    name:  'Shravani Rasam',
    role:  'kitchen_manager',
  },
  accountant: {
    email: '2023.manas.patil@ves.ac.in',
    name:  'Manas Patil (VES)',
    role:  'accountant',
  },
  operations_staff: {
    email: 'pranavpoledu@gmail.com',
    name:  'Pranav Pol',
    role:  'operations_staff',
  },
  branch_manager: {
    email: 'd2022.darshan.khapekar@ves.ac.in',
    name:  'Darshan Khapekar (VES)',
    role:  'branch_manager',
  },
  franchise_admin: {
    email: 'darshankhapekar8520@gmail.com',
    name:  'Darshan Khapekar',
    role:  'franchise_admin',
  },
  super_admin: {
    email: 'contact@codinggurus.in',
    name:  'CodingGurus Admin',
    role:  'super_admin',
  },
};

// ── Customer ────────────────────────────────
const CUSTOMER = {
  name:  'Pranav Pol',
  phone: '+91-9876543210',
  email: 'pranav.s.pol144@gmail.com',
};

// ── Pricing breakdown ───────────────────────
const PRICING = {
  per_plate:      450,
  plates:         150,
  food_cost:      450 * 150,   // 67,500
  hall_rent:      67500,
  decor_estimate: 25000,
  get subtotal()  { return this.food_cost + this.hall_rent + this.decor_estimate; }, // 160,000
  tax_rate:       0.18,
  get tax_amount() { return Math.round(this.subtotal * this.tax_rate); },           // 28,800
  get total()     { return this.subtotal + this.tax_amount; },                      // 188,800
  advance:        50000,
  get balance()   { return this.total - this.advance; },                            // 138,800
};

// ── Settlement (8 plates refund) ────────────
const SETTLEMENT = {
  actual_guests:     142,
  plates_served:     142,
  plates_not_served: 8,
  refund:            8 * 450,  // 3,600
  extra_charges:     0,
  get total_final()  { return PRICING.total - this.refund + this.extra_charges; },  // 185,200
  get settlement()   { return -(this.refund); },                                    // -3,600
};


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD COMPLETE LEAD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

function buildLeadDoc() {
  const NOW = new Date().toISOString();

  return {
    // ── Core identifiers ─────────────────────────
    franchise_id:   FRANCHISE_ID,
    branch_id:      BRANCH_ID,
    status:         'closed',
    priority:       'high',

    // ── Customer info ────────────────────────────
    customer_name:        CUSTOMER.name,
    phone:                CUSTOMER.phone,
    email:                CUSTOMER.email,
    client_type:          'individual',
    company_name:         null,

    // ── Event info ───────────────────────────────
    event_type:           'Wedding',
    event_date:           EVENT_DATE,
    expected_guest_count: 150,
    guest_range:          '101-200',
    catering_required:    true,
    decor_required:       true,

    // ── Budget ───────────────────────────────────
    budget_min:           100000,
    budget_max:           200000,
    budget_flexibility:   'moderate',
    budget_range:         '100000-200000',

    // ── Hall ─────────────────────────────────────
    hall_id:   'pfd_b1_h2',
    hall_name: 'Hall 2',

    // ── Assignment ───────────────────────────────
    lead_source:       'walk_in',
    source_detail:     null,
    referrer_name:     null,
    referrer_phone:    null,
    assigned_to_uid:   null,
    assigned_to_name:  USERS.sales_executive.name,
    customer_uid:      null,

    // ── Follow-up counters ───────────────────────
    followup_count:       3,
    last_contacted_at:    NOW,
    next_followup_date:   null,
    next_followup_type:   null,

    // ── Status history (every transition) ────────
    status_history: [
      { status: 'new',                  changed_at: daysAgo(28).toISOString(), changed_by: null,                       note: 'Lead created by Receptionist' },
      { status: 'visited',              changed_at: daysAgo(26).toISOString(), changed_by: USERS.sales_executive.name, note: 'Visit logged — Hall 2' },
      { status: 'tasting_scheduled',    changed_at: daysAgo(25).toISOString(), changed_by: USERS.sales_executive.name, note: `Tasting scheduled for ${TASTING_DATE}` },
      { status: 'tasting_done',         changed_at: daysAgo(20).toISOString(), changed_by: USERS.kitchen_manager.name, note: 'Tasting done. Preferred: Maharashtrian Thali' },
      { status: 'menu_selected',        changed_at: daysAgo(18).toISOString(), changed_by: USERS.kitchen_manager.name, note: `Menu: Maharashtrian Royal Thali, Total: ₹${PRICING.subtotal.toLocaleString()}` },
      { status: 'advance_paid',         changed_at: daysAgo(15).toISOString(), changed_by: USERS.accountant.name,      note: `Advance ₹${PRICING.advance.toLocaleString()} received via upi` },
      { status: 'decoration_scheduled', changed_at: daysAgo(12).toISOString(), changed_by: USERS.operations_staff.name, note: 'Event finalized — Royal Mughal, 150 guests' },
      { status: 'paid',                 changed_at: daysAgo(5).toISOString(),  changed_by: USERS.accountant.name,      note: `Full payment ₹${PRICING.balance.toLocaleString()} received. Event locked.` },
      { status: 'in_progress',          changed_at: daysAgo(2).toISOString(),  changed_by: USERS.branch_manager.name,  note: 'Event started' },
      { status: 'completed',            changed_at: daysAgo(1).toISOString(),  changed_by: USERS.branch_manager.name,  note: `Event completed. Guests: ${SETTLEMENT.actual_guests}` },
      { status: 'settlement_complete',  changed_at: iso(today),                changed_by: USERS.accountant.name,      note: `Settled. Final: ₹${SETTLEMENT.total_final.toLocaleString()}` },
      { status: 'closed',               changed_at: iso(today),                changed_by: USERS.branch_manager.name,  note: `Closed. Rating: 5/5. LTV: ₹${SETTLEMENT.total_final.toLocaleString()}` },
    ],

    // ════════════════════════════════════════════
    //  PHASE 2 — Site Visit
    // ════════════════════════════════════════════
    site_visit: {
      date:                 dateStr(daysAgo(26)),
      hall_id:              'pfd_b1_h2',
      hall_name:            'Hall 2',
      visited_by:           'Pranav Pol',
      notes:                'Customer liked the hall, impressed by chandeliers',
      rating_from_customer: 4,
    },
    visited: {
      date:                 dateStr(daysAgo(26)),
      hall_id:              'pfd_b1_h2',
      hall_name:            'Hall 2',
      visited_by:           'Pranav Pol',
      notes:                'Customer liked the hall, impressed by chandeliers',
      rating_from_customer: 4,
    },

    // ════════════════════════════════════════════
    //  PHASE 3a — Food Tasting
    // ════════════════════════════════════════════
    food_tasting: {
      scheduled_date:          `${TASTING_DATE}T17:00:00Z`,
      menu_options_presented:  ['Maharashtrian Thali', 'Gujarati Thali'],
      notes:                   null,
      conducted_at:            `${TASTING_DATE}T17:30:00Z`,
      dishes_sampled:          ['Paneer Tikka', 'Dal Makhani', 'Gulab Jamun'],
      customer_feedback:       'Loved the paneer tikka, wants less spice in dal',
      preferred_menu:          'Maharashtrian Thali',
      kitchen_manager:         'Shravani Rasam',
    },

    // ════════════════════════════════════════════
    //  PHASE 3b — Menu Finalization + Quote
    // ════════════════════════════════════════════
    menu_finalization: {
      finalized_menu_id:       'pfd_menu_veg_classic',
      finalized_menu_name:     'Maharashtrian Royal Thali',
      finalized_date:          daysAgo(18).toISOString(),
      customizations:          ['Less spice in dal', 'Extra paneer tikka'],
      final_per_plate_cost:    PRICING.per_plate,
      expected_plates:         PRICING.plates,
      total_food_cost:         PRICING.food_cost,
    },

    quote: {
      hall_base_rent:               PRICING.hall_rent,
      food_cost:                    PRICING.food_cost,
      decoration_budget_estimated:  PRICING.decor_estimate,
      total_estimated:              PRICING.subtotal,
      quote_valid_till:             QUOTE_VALID_TILL,
      generated_at:                 daysAgo(18).toISOString(),
    },

    // ════════════════════════════════════════════
    //  PHASE 4 — Advance Payment (auto-creates booking + invoice)
    // ════════════════════════════════════════════
    booking_confirmed: {
      date:                  daysAgo(15).toISOString(),
      advance_amount:        PRICING.advance,
      advance_payment_date:  dateStr(daysAgo(15)),
      payment_mode:          'upi',
      transaction_ref:       'UPI-TXN-12345',
      confirmed_by:          'Manas Patil',
    },

    // ════════════════════════════════════════════
    //  PHASE 5 — Decoration & Event Finalization
    // ════════════════════════════════════════════
    event_finalization: {
      final_confirmed_date:  EVENT_DATE,
      final_guest_count:     150,
      final_per_plate_food:  PRICING.per_plate,
      final_food_cost:       PRICING.food_cost,
      decoration_theme:      'Royal Mughal',
      decoration_partner:    'Shree Decorators',
      decoration_cost:       PRICING.decor_estimate,
      setup_date:            SETUP_DATE,
      teardown_date:         TEARDOWN_DATE,
      special_requests:      'Extra lighting at entrance',
      finalized_at:          daysAgo(12).toISOString(),
      finalized_by:          USERS.operations_staff.name,
    },

    // ════════════════════════════════════════════
    //  PHASE 6 — Full/Remaining Payment
    // ════════════════════════════════════════════
    final_payment: {
      remaining_amount:  PRICING.balance,
      due_date:          SETUP_DATE,
      payment_date:      dateStr(daysAgo(5)),
      payment_mode:      'bank_transfer',
      transaction_ref:   'NEFT-67890',
    },
    event_locked:  true,
    locked_date:   daysAgo(5).toISOString(),

    // ════════════════════════════════════════════
    //  PHASE 7 — Event Execution
    // ════════════════════════════════════════════
    event_execution: {
      started_at:            daysAgo(2).toISOString(),
      started_by:            USERS.branch_manager.name,
      event_date:            EVENT_DATE,
      start_time:            '19:00',
      end_time:              '23:30',
      actual_guest_count:    SETTLEMENT.actual_guests,
      photos_taken:          45,
      problems_encountered:  'Minor sound delay at start',
      contingency_actions:   'Sound engineer fixed within 5 minutes',
      staff_feedback:        'Excellent coordination',
      completed_at:          daysAgo(1).toISOString(),
      completed_by:          USERS.branch_manager.name,
    },

    // ════════════════════════════════════════════
    //  PHASE 8 — Post-Event Settlement
    // ════════════════════════════════════════════
    post_event_settlement: {
      settlement_date:     dateStr(today),
      final_guest_count:   SETTLEMENT.actual_guests,
      final_plates_served: SETTLEMENT.plates_served,
      leftover_refund: {
        plates_not_served: SETTLEMENT.plates_not_served,
        refund_amount:     SETTLEMENT.refund,
      },
      extra_charges: {
        reason: null,
        amount: SETTLEMENT.extra_charges,
      },
      total_final_amount:    SETTLEMENT.total_final,
      amount_paid:           PRICING.total,
      final_settlement:      SETTLEMENT.settlement,
      settled_date:          dateStr(today),
      settled_by:            USERS.accountant.name,
    },

    // ════════════════════════════════════════════
    //  PHASE 9 — Feedback & Close
    // ════════════════════════════════════════════
    feedback: {
      feedback_date:              dateStr(today),
      customer_rating:            5,
      food_rating:                5,
      ambiance_rating:            4,
      service_rating:             5,
      feedback_text:              'Amazing experience, would recommend to everyone',
      permission_for_testimonial: true,
      repeat_booking:             true,
    },

    // ── Conversion flags ─────────────────────────
    is_converted:         true,
    converted_booking_id: BOOKING_ID,
    converted_at:         daysAgo(15).toISOString(),
    booking_id:           BOOKING_ID,
    invoice_id:           INVOICE_ID,
    lifetime_value:       SETTLEMENT.total_final,
    lead_closed_date:     iso(today),

    // ── AI scoring (sample) ──────────────────────
    ai_score:              95,
    ai_score_label:        'Hot',
    ai_suggested_action:   'Closed successfully — offer loyalty discount for next booking',
    ai_risk_factors:       null,
    ai_sentiment:          'very_positive',
    ai_score_updated_at:   iso(today),

    // ── Lost / Hold (not applicable) ─────────────
    lost_reason:       null,
    lost_detail:       null,
    competitor_chosen: null,
    on_hold_reason:    null,
    on_hold_until:     null,

    // ── Misc ─────────────────────────────────────
    decor_interest:    'Royal Mughal theme',
    notes:             'Interested in premium package',
    created_by_uid:    null,
    created_by_name:   USERS.receptionist.name,
    created_by_role:   'receptionist',

    // ── Timestamps ───────────────────────────────
    created_at: TS(),
    updated_at: TS(),
  };
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD BOOKING DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

function buildBookingDoc() {
  return {
    lead_id:      LEAD_ID,
    franchise_id: FRANCHISE_ID,
    branch_id:    BRANCH_ID,

    // ── Customer ─────────────────────────────────
    customer_name:  CUSTOMER.name,
    customer_phone: CUSTOMER.phone,
    customer_email: CUSTOMER.email,
    phone:          CUSTOMER.phone,
    email:          CUSTOMER.email,

    // ── Event ────────────────────────────────────
    event_type:           'Wedding',
    event_date:           EVENT_DATE,
    event_start_time:     '19:00',
    event_end_time:       '23:30',
    hall_id:              'pfd_b1_h2',
    hall_name:            'Hall 2',
    expected_guest_count: 150,
    final_guest_count:    SETTLEMENT.actual_guests,

    // ── Menu ─────────────────────────────────────
    menu: {
      name:           'Maharashtrian Royal Thali',
      per_plate_cost: PRICING.per_plate,
      plates:         PRICING.plates,
      total:          PRICING.food_cost,
    },

    // ── Decor ────────────────────────────────────
    decor: {
      theme:   'Royal Mughal',
      partner: 'Shree Decorators',
      cost:    PRICING.decor_estimate,
    },

    // ── Payments ─────────────────────────────────
    payments: {
      quote_total:    PRICING.subtotal,
      advance_amount: PRICING.advance,
      advance_date:   dateStr(daysAgo(15)),
      advance_mode:   'upi',
      total_paid:     PRICING.total,
      balance_due:    0,
      payment_history: [
        {
          date:        dateStr(daysAgo(15)),
          amount:      PRICING.advance,
          mode:        'upi',
          type:        'advance',
          ref:         'UPI-TXN-12345',
          recorded_by: USERS.accountant.name,
        },
        {
          date:        dateStr(daysAgo(5)),
          amount:      PRICING.balance,
          mode:        'bank_transfer',
          type:        'balance',
          ref:         'NEFT-67890',
          recorded_by: USERS.accountant.name,
        },
      ],
    },

    // ── Status ───────────────────────────────────
    status:       'completed',
    event_locked: true,

    // ── Checklist (Phase 5) ──────────────────────
    checklist: [
      {
        id:       'chk_001',
        task:     'Confirm catering staff count',
        due_date: dateStr(daysFromNow(27)),
        status:   'completed',
        completed_at: daysAgo(3).toISOString(),
        completed_by: USERS.operations_staff.name,
      },
      {
        id:       'chk_002',
        task:     'Setup decoration',
        due_date: SETUP_DATE,
        status:   'completed',
        completed_at: daysAgo(2).toISOString(),
        completed_by: USERS.operations_staff.name,
      },
      {
        id:       'chk_003',
        task:     'Sound system check',
        due_date: EVENT_DATE,
        status:   'completed',
        completed_at: daysAgo(2).toISOString(),
        completed_by: USERS.operations_staff.name,
      },
      {
        id:       'chk_004',
        task:     'Arrange parking volunteers',
        due_date: EVENT_DATE,
        status:   'completed',
        completed_at: daysAgo(2).toISOString(),
        completed_by: USERS.operations_staff.name,
      },
    ],

    // ── Vendors (Phase 5) ────────────────────────
    vendors: [
      {
        id:    'vnd_001',
        name:  'Shree Decorators',
        type:  'decorator',
        cost:  25000,
        phone: '+91-9876500001',
        status: 'confirmed',
      },
      {
        id:    'vnd_002',
        name:  'Sound Solutions',
        type:  'dj_sound',
        cost:  8000,
        phone: '+91-9876500002',
        status: 'confirmed',
      },
    ],

    // ── Staff Assigned (Phase 5) ─────────────────
    staff_assigned: [
      {
        id:   'staff_001',
        name: 'Pranav Pol',
        role: 'operations_staff',
        phone: '+91-8520000005',
      },
    ],

    // ── Invoice link ─────────────────────────────
    invoice_id: INVOICE_ID,

    // ── Notes ────────────────────────────────────
    notes: 'Premium wedding booking — Rahul Sharma. Royal Mughal theme.',

    // ── Audit ────────────────────────────────────
    created_by_uid:  null,
    created_by_name: USERS.accountant.name,
    created_at:      TS(),
    updated_at:      TS(),
  };
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD INVOICE DOCUMENT  (INV-01001)
// ═══════════════════════════════════════════════════════════════════════════

function buildInvoiceDoc() {
  const lineItems = [
    {
      description: `Food — Maharashtrian Royal Thali`,
      qty:         PRICING.plates,
      rate:        PRICING.per_plate,
      amount:      PRICING.food_cost,
    },
    {
      description: `Hall Rent — Hall 2`,
      qty:         1,
      rate:        PRICING.hall_rent,
      amount:      PRICING.hall_rent,
    },
    {
      description: `Decoration — Royal Mughal`,
      qty:         1,
      rate:        PRICING.decor_estimate,
      amount:      PRICING.decor_estimate,
    },
  ];

  const subtotal   = PRICING.subtotal;
  const taxRate    = PRICING.tax_rate;
  const taxAmount  = PRICING.tax_amount;
  const total      = PRICING.total;

  return {
    invoice_number: 'INV-01001',
    booking_id:     BOOKING_ID,
    lead_id:        LEAD_ID,
    franchise_id:   FRANCHISE_ID,
    branch_id:      BRANCH_ID,

    // ── Customer ─────────────────────────────────
    customer_name:    CUSTOMER.name,
    customer_phone:   CUSTOMER.phone,
    customer_email:   CUSTOMER.email,
    customer_address: null,

    // ── Event ────────────────────────────────────
    event_type: 'Wedding',
    event_date: EVENT_DATE,

    // ── Line items ───────────────────────────────
    line_items: lineItems,
    subtotal,
    tax_rate:    taxRate,
    tax_amount:  taxAmount,
    discount:    0,
    total,

    // ── Payments ─────────────────────────────────
    amount_paid: total,
    balance_due: 0,
    payment_history: [
      {
        amount:      PRICING.advance,
        date:        dateStr(daysAgo(15)),
        mode:        'upi',
        ref:         'UPI-TXN-12345',
        type:        'advance',
        recorded_by: USERS.accountant.name,
      },
      {
        amount:      PRICING.balance,
        date:        dateStr(daysAgo(5)),
        mode:        'bank_transfer',
        ref:         'NEFT-67890',
        type:        'balance',
        recorded_by: USERS.accountant.name,
      },
    ],

    // ── Status ───────────────────────────────────
    status:     'paid',
    issue_date: dateStr(daysAgo(15)),
    due_date:   EVENT_DATE,

    // ── Notes ────────────────────────────────────
    notes: 'Full payment received. Settlement refund of ₹3,600 processed separately.',

    // ── Audit ────────────────────────────────────
    created_by_uid:  null,
    created_by_name: USERS.accountant.name,
    created_at:      TS(),
    updated_at:      TS(),
  };
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD PAYMENT RECORDS
// ═══════════════════════════════════════════════════════════════════════════

function buildPaymentDocs() {
  return [
    // ── Advance Payment ──────────────────────────
    {
      id:           PAY_ADV_ID,
      lead_id:      LEAD_ID,
      booking_id:   BOOKING_ID,
      invoice_id:   INVOICE_ID,
      franchise_id: FRANCHISE_ID,
      branch_id:    BRANCH_ID,

      customer_name:  CUSTOMER.name,
      customer_phone: CUSTOMER.phone,
      customer_email: CUSTOMER.email,

      payment_type:  'advance',
      amount:        PRICING.advance,
      payment_mode:  'upi',
      transaction_ref: 'UPI-TXN-12345',
      payment_date:  dateStr(daysAgo(15)),
      recorded_by_name: USERS.accountant.name,
      recorded_by_role: 'accountant',

      status: 'completed',
      notes:  'Advance payment for Rahul Sharma wedding booking',

      created_at: TS(),
      updated_at: TS(),
    },
    // ── Balance Payment ──────────────────────────
    {
      id:           PAY_BAL_ID,
      lead_id:      LEAD_ID,
      booking_id:   BOOKING_ID,
      invoice_id:   INVOICE_ID,
      franchise_id: FRANCHISE_ID,
      branch_id:    BRANCH_ID,

      customer_name:  CUSTOMER.name,
      customer_phone: CUSTOMER.phone,
      customer_email: CUSTOMER.email,

      payment_type:  'balance',
      amount:        PRICING.balance,
      payment_mode:  'bank_transfer',
      transaction_ref: 'NEFT-67890',
      payment_date:  dateStr(daysAgo(5)),
      recorded_by_name: USERS.accountant.name,
      recorded_by_role: 'accountant',

      status: 'completed',
      notes:  'Full balance payment for Rahul Sharma wedding booking',

      created_at: TS(),
      updated_at: TS(),
    },
  ];
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD ACTIVITY LOG ENTRIES  (one per phase)
// ═══════════════════════════════════════════════════════════════════════════

function buildActivities() {
  let seq = 0;
  const act = (type, desc, user, meta) => ({
    id:                `ACT_PIPELINE_${String(++seq).padStart(3, '0')}`,
    lead_id:           LEAD_ID,
    franchise_id:      FRANCHISE_ID,
    branch_id:         BRANCH_ID,
    activity_type:     type,
    description:       desc,
    performed_by_uid:  null,
    performed_by_name: user.name,
    metadata:          meta || null,
    created_at:        TS(),
  });

  return [
    // Phase 1
    act('lead_created',
      `Lead created for ${CUSTOMER.name} — Wedding`,
      USERS.receptionist,
      { event_type: 'Wedding', lead_source: 'walk_in', expected_guests: 150 }),

    // Phase 2 — Visit
    act('visit_completed',
      'Property visit completed — Hall 2. Rating: 4',
      USERS.sales_executive,
      { hall_id: 'pfd_b1_h2', customer_rating: 4 }),

    // Phase 2 — Tasting scheduled
    act('tasting_scheduled',
      `Food tasting scheduled for ${TASTING_DATE}`,
      USERS.sales_executive,
      { tasting_date: TASTING_DATE, menu_options_to_present: ['Maharashtrian Thali', 'Gujarati Thali'] }),

    // Phase 3 — Tasting completed
    act('tasting_completed',
      'Food tasting completed. Preferred: Maharashtrian Thali. Feedback: Loved the paneer tikka, wants less spice in dal',
      USERS.kitchen_manager,
      { preferred_menu: 'Maharashtrian Thali', dishes_count: 3 }),

    // Phase 3 — Menu finalized
    act('menu_finalized',
      `Menu finalized: Maharashtrian Royal Thali — ₹${PRICING.per_plate}/plate × ${PRICING.plates} = ₹${PRICING.food_cost.toLocaleString()}. Quote: ₹${PRICING.subtotal.toLocaleString()}`,
      USERS.kitchen_manager,
      { menu_name: 'Maharashtrian Royal Thali', per_plate_cost: PRICING.per_plate, plates: PRICING.plates, total_estimated: PRICING.subtotal }),

    // Phase 4 — Advance payment
    act('advance_paid',
      `Advance payment of ₹${PRICING.advance.toLocaleString()} received via upi. Ref: UPI-TXN-12345`,
      USERS.accountant,
      { advance_amount: PRICING.advance, payment_mode: 'upi', transaction_ref: 'UPI-TXN-12345' }),

    // Phase 5 — Decoration finalized
    act('event_finalized',
      `Event finalized: 150 guests, decor: Royal Mughal, partner: Shree Decorators`,
      USERS.operations_staff,
      { final_guest_count: 150, decor_theme: 'Royal Mughal', decor_partner: 'Shree Decorators' }),

    // Phase 6 — Full payment
    act('full_payment_received',
      `Full payment ₹${PRICING.balance.toLocaleString()} received via bank_transfer. Event locked. Ref: NEFT-67890`,
      USERS.accountant,
      { remaining_amount: PRICING.balance, payment_mode: 'bank_transfer', transaction_ref: 'NEFT-67890' }),

    // Phase 7 — Event started
    act('event_started',
      `Event started by ${USERS.branch_manager.name}`,
      USERS.branch_manager),

    // Phase 7 — Event completed
    act('event_completed',
      `Event completed. ${SETTLEMENT.actual_guests} guests served. Issues: Minor sound delay at start`,
      USERS.branch_manager,
      { actual_guest_count: SETTLEMENT.actual_guests }),

    // Phase 8 — Settlement
    act('settlement_done',
      `Post-event settlement complete. Total: ₹${SETTLEMENT.total_final.toLocaleString()}, Paid: ₹${PRICING.total.toLocaleString()}, Balance: ₹${SETTLEMENT.settlement.toLocaleString()}`,
      USERS.accountant,
      { total_final_amount: SETTLEMENT.total_final, amount_paid: PRICING.total }),

    // Phase 9 — Lead closed
    act('lead_closed',
      `Lead closed. Customer rating: 5/5. LTV: ₹${SETTLEMENT.total_final.toLocaleString()}. Repeat: Yes`,
      USERS.branch_manager,
      { customer_rating: 5, lifetime_value: SETTLEMENT.total_final }),
  ];
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD FOLLOW-UP RECORDS
// ═══════════════════════════════════════════════════════════════════════════

function buildFollowUps() {
  return [
    {
      id:               'FU_PIPELINE_001',
      lead_id:          LEAD_ID,
      franchise_id:     FRANCHISE_ID,
      branch_id:        BRANCH_ID,
      scheduled_date:   daysAgo(27).toISOString(),
      followup_type:    'call',
      outcome:          'Interested',
      notes:            'First contact — Rahul is interested in premium wedding package, prefers Hall 2',
      call_duration_mins: 8,
      call_answered:    true,
      next_followup_date: daysAgo(26).toISOString(),
      next_followup_type: 'visit',
      done_by_user_id:   null,
      done_by_user_name: USERS.sales_executive.name,
      done_at:           TS(),
      is_overdue:        false,
      created_at:        TS(),
    },
    {
      id:               'FU_PIPELINE_002',
      lead_id:          LEAD_ID,
      franchise_id:     FRANCHISE_ID,
      branch_id:        BRANCH_ID,
      scheduled_date:   daysAgo(26).toISOString(),
      followup_type:    'visit',
      outcome:          'Site visit done',
      notes:            'Conducted Hall 2 tour. Customer impressed by chandeliers and AC. Wants to proceed to food tasting.',
      call_duration_mins: null,
      call_answered:    null,
      next_followup_date: TASTING_DATE,
      next_followup_type: 'visit',
      done_by_user_id:   null,
      done_by_user_name: USERS.sales_executive.name,
      done_at:           TS(),
      is_overdue:        false,
      created_at:        TS(),
    },
    {
      id:               'FU_PIPELINE_003',
      lead_id:          LEAD_ID,
      franchise_id:     FRANCHISE_ID,
      branch_id:        BRANCH_ID,
      scheduled_date:   daysAgo(15).toISOString(),
      followup_type:    'call',
      outcome:          'Advance confirmed',
      notes:            'Confirmed advance payment via UPI. Booking created.',
      call_duration_mins: 5,
      call_answered:    true,
      next_followup_date: null,
      next_followup_type: null,
      done_by_user_id:   null,
      done_by_user_name: USERS.accountant.name,
      done_at:           TS(),
      is_overdue:        false,
      created_at:        TS(),
    },
  ];
}


// ═══════════════════════════════════════════════════════════════════════════
//  BUILD AUDIT LOG ENTRIES
// ═══════════════════════════════════════════════════════════════════════════

function buildAuditLogs() {
  return [
    {
      id:                 'AUDIT_PIPELINE_001',
      entity_type:        'lead',
      entity_id:          LEAD_ID,
      action:             'create',
      franchise_id:       FRANCHISE_ID,
      branch_id:          BRANCH_ID,
      performed_by_uid:   null,
      performed_by_name:  USERS.receptionist.name,
      details: {
        customer_name: CUSTOMER.name,
        phone:         CUSTOMER.phone,
        event_type:    'Wedding',
      },
      created_at: TS(),
    },
    {
      id:                 'AUDIT_PIPELINE_002',
      entity_type:        'lead',
      entity_id:          LEAD_ID,
      action:             'advance_payment',
      franchise_id:       FRANCHISE_ID,
      branch_id:          BRANCH_ID,
      performed_by_uid:   null,
      performed_by_name:  USERS.accountant.name,
      details: {
        advance_amount:  PRICING.advance,
        payment_mode:    'upi',
        transaction_ref: 'UPI-TXN-12345',
      },
      created_at: TS(),
    },
    {
      id:                 'AUDIT_PIPELINE_003',
      entity_type:        'lead',
      entity_id:          LEAD_ID,
      action:             'full_payment',
      franchise_id:       FRANCHISE_ID,
      branch_id:          BRANCH_ID,
      performed_by_uid:   null,
      performed_by_name:  USERS.accountant.name,
      details: {
        remaining_amount: PRICING.balance,
        payment_mode:     'bank_transfer',
        transaction_ref:  'NEFT-67890',
      },
      created_at: TS(),
    },
    {
      id:                 'AUDIT_PIPELINE_004',
      entity_type:        'lead',
      entity_id:          LEAD_ID,
      action:             'closed',
      franchise_id:       FRANCHISE_ID,
      branch_id:          BRANCH_ID,
      performed_by_uid:   null,
      performed_by_name:  USERS.branch_manager.name,
      details: {
        customer_rating: 5,
        lifetime_value:  SETTLEMENT.total_final,
        repeat_booking:  true,
      },
      created_at: TS(),
    },
  ];
}


// ═══════════════════════════════════════════════════════════════════════════
//  SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedFullPipeline() {
  console.log('\n' + '═'.repeat(70));
  console.log('  🌱  BanquetEase — Complete 10-Phase Lead-to-Close Pipeline Seed');
  console.log('═'.repeat(70));

  console.log(`\n  Customer:  ${CUSTOMER.name}`);
  console.log(`  Email:     ${CUSTOMER.email}`);
  console.log(`  Event:     Wedding on ${EVENT_DATE}`);
  console.log(`  Hall:      Hall 2 (pfd_b1_h2)`);
  console.log(`  Quote:     ₹${PRICING.subtotal.toLocaleString()} + 18% GST = ₹${PRICING.total.toLocaleString()}`);
  console.log(`  Advance:   ₹${PRICING.advance.toLocaleString()}`);
  console.log(`  Balance:   ₹${PRICING.balance.toLocaleString()}`);
  console.log(`  Settlement: Refund ₹${SETTLEMENT.refund.toLocaleString()} (${SETTLEMENT.plates_not_served} unused plates)`);
  console.log(`  Final LTV: ₹${SETTLEMENT.total_final.toLocaleString()}\n`);

  const batch = db.batch();
  let docCount = 0;

  // ── 1. Lead ──────────────────────────────────
  console.log('  📋 Phase 1-9: Creating fully-closed lead…');
  const leadDoc = buildLeadDoc();
  batch.set(db.collection('leads').doc(LEAD_ID), leadDoc);
  docCount++;

  // ── 2. Booking ───────────────────────────────
  console.log('  📅 Phase 4: Creating confirmed→completed booking…');
  const bookingDoc = buildBookingDoc();
  batch.set(db.collection('bookings').doc(BOOKING_ID), bookingDoc);
  docCount++;

  // ── 3. Invoice ───────────────────────────────
  console.log('  🧾 Phase 4: Creating paid invoice (INV-01001)…');
  const invoiceDoc = buildInvoiceDoc();
  batch.set(db.collection('invoices').doc(INVOICE_ID), invoiceDoc);
  docCount++;

  // ── 4. Payments ──────────────────────────────
  console.log('  💵 Phase 4+6: Creating 2 payment records…');
  const payments = buildPaymentDocs();
  for (const pay of payments) {
    const { id, ...data } = pay;
    batch.set(db.collection('payments').doc(id), data);
    docCount++;
  }

  // ── 5. Activity Log ──────────────────────────
  console.log('  📝 All Phases: Creating 12 activity log entries…');
  const activities = buildActivities();
  for (const act of activities) {
    const { id, ...data } = act;
    batch.set(db.collection('lead_activities').doc(id), data);
    docCount++;
  }

  // ── 6. Follow-ups ────────────────────────────
  console.log('  📞 Phase 2: Creating 3 follow-up records…');
  const followups = buildFollowUps();
  for (const fu of followups) {
    const { id, ...data } = fu;
    batch.set(db.collection('follow_ups').doc(id), data);
    docCount++;
  }

  // ── 7. Audit Logs ────────────────────────────
  console.log('  🔍 Creating 4 audit log entries…');
  const audits = buildAuditLogs();
  for (const audit of audits) {
    const { id, ...data } = audit;
    batch.set(db.collection('audit_logs').doc(id), data);
    docCount++;
  }

  // ── Commit ───────────────────────────────────
  console.log(`\n  ⏳ Committing ${docCount} documents in a single batch…`);
  await batch.commit();

  console.log('\n' + '─'.repeat(70));
  console.log('  ✅  SEED COMPLETE!');
  console.log('─'.repeat(70));
  console.log(`
  Documents created:
    • leads/${LEAD_ID}                 — Fully closed lead (status: closed)
    • bookings/${BOOKING_ID}           — Completed booking with checklist + vendors
    • invoices/${INVOICE_ID}           — Paid invoice INV-01001
    • payments/${PAY_ADV_ID}           — Advance ₹${PRICING.advance.toLocaleString()} (UPI)
    • payments/${PAY_BAL_ID}           — Balance ₹${PRICING.balance.toLocaleString()} (NEFT)
    • lead_activities × 12             — Full activity trail
    • follow_ups × 3                   — Call + visit + advance confirmation
    • audit_logs × 4                   — Create, advance, full payment, close

  Phase summary:
    1.  ✅ Lead created (Receptionist: ${USERS.receptionist.email})
    2.  ✅ Visit logged + Tasting scheduled (Sales: ${USERS.sales_executive.email})
    3.  ✅ Tasting done + Menu finalized (Kitchen: ${USERS.kitchen_manager.email})
    4.  ✅ Advance ₹50,000 + Auto-Booking + Invoice (Accountant: ${USERS.accountant.email})
    5.  ✅ Decoration finalized (Operations: ${USERS.operations_staff.email})
    6.  ✅ Full payment ₹${PRICING.balance.toLocaleString()} recorded (Accountant)
    7.  ✅ Event started + completed (Branch Manager: ${USERS.branch_manager.email})
    8.  ✅ Settlement complete (Refund ₹${SETTLEMENT.refund.toLocaleString()})
    9.  ✅ Feedback 5/5 + Lead closed (LTV: ₹${SETTLEMENT.total_final.toLocaleString()})
    10. ✅ Payments dashboard data ready

  Login & verify:
    Franchise Admin → ${USERS.franchise_admin.email} / 123456789
    Super Admin     → ${USERS.super_admin.email} / 123456789
    Branch Manager  → ${USERS.branch_manager.email} / 123456789
    Accountant      → ${USERS.accountant.email} / 123456789
`);

  process.exit(0);
}


// ═══════════════════════════════════════════════════════════════════════════
//  RUN
// ═══════════════════════════════════════════════════════════════════════════

seedFullPipeline().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
