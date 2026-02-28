/**
 * BanquetEase — Lead Seeding Script
 *
 * Seeds 5 sample leads for Prasad Food Divine (pfd) branch pfd_b1
 * at different pipeline stages to demonstrate the full lead lifecycle.
 *
 * Firestore path: /leads/{lead_id}  (top-level flat collection)
 *
 * Usage:
 *   node scripts/seed-leads.js
 *
 * Prerequisites:
 *   npm install firebase-admin   (run inside web/ directory)
 *   Place serviceAccountKey.json in scripts/
 */

const admin = require('firebase-admin');
const path  = require('path');

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
const NOW = new Date().toISOString();

const FRANCHISE_ID = 'pfd';
const BRANCH_ID    = 'pfd_b1';

// ─────────────────────────────────────────────────────────────────────────
//  SAMPLE LEADS
// ─────────────────────────────────────────────────────────────────────────

const LEADS = [
  {
    id: 'LEAD_PFD_001',
    franchise_id:        FRANCHISE_ID,
    branch_id:           BRANCH_ID,
    status:              'new',
    customer_name:       'Rajesh Sharma',
    phone:               '+91-9876543210',
    email:               'rajesh.sharma@gmail.com',
    event_type:          'Wedding',
    event_date:          '2026-11-15',
    expected_guest_count: 300,
    budget_range:        '500000-1000000',
    hall_id:             'pfd_b1_h1',
    hall_name:           'Hall 1',
    assigned_to_uid:     'uid_sales_exec_001',
    assigned_to_name:    'Pranav Pol',
    follow_ups: [
      {
        id: 1,
        date: '2026-02-28',
        type: 'Call',
        notes: 'First contact — interested in Hall 1+2 combined for 300 guests',
        status: 'Done',
        logged_by: 'Pranav Pol',
        logged_at: NOW,
      },
    ],
    visited:             null,
    food_tasting:        null,
    menu_finalization:   null,
    booking_confirmed:   null,
    event_finalization:  null,
    final_payment:       null,
    event_execution:     null,
    post_event_settlement: null,
    feedback:            null,
    created_at:          TS(),
    updated_at:          TS(),
  },

  {
    id: 'LEAD_PFD_002',
    franchise_id:        FRANCHISE_ID,
    branch_id:           BRANCH_ID,
    status:              'visited',
    customer_name:       'Priya Menon',
    phone:               '+91-9123456780',
    email:               'priya.menon@yahoo.com',
    event_type:          'Reception',
    event_date:          '2026-10-05',
    expected_guest_count: 200,
    budget_range:        '300000-600000',
    hall_id:             'pfd_b1_h2',
    hall_name:           'Hall 2',
    assigned_to_uid:     'uid_sales_exec_001',
    assigned_to_name:    'Pranav Pol',
    follow_ups: [
      { id: 1, date:'2026-02-20', type:'Call', notes:'Introduced packages', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 2, date:'2026-02-25', type:'Visit', notes:'Conducted Hall 2 tour — impressed', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
    ],
    visited: {
      date:                '2026-02-25',
      hall_id:             'pfd_b1_h2',
      hall_name:           'Hall 2',
      visited_by:          'Pranav Pol',
      notes:               'Customer very pleased with décor setup. Wants to proceed to tasting.',
      rating_from_customer: 4,
    },
    food_tasting:        null,
    menu_finalization:   null,
    booking_confirmed:   null,
    event_finalization:  null,
    final_payment:       null,
    event_execution:     null,
    post_event_settlement: null,
    feedback:            null,
    created_at:          TS(),
    updated_at:          TS(),
  },

  {
    id: 'LEAD_PFD_003',
    franchise_id:        FRANCHISE_ID,
    branch_id:           BRANCH_ID,
    status:              'tasting_done',
    customer_name:       'Suresh Nair',
    phone:               '+91-9988776655',
    email:               'suresh.nair@gmail.com',
    event_type:          'Wedding',
    event_date:          '2026-09-20',
    expected_guest_count: 450,
    budget_range:        '1000000-2000000',
    hall_id:             'pfd_b1_h1',
    hall_name:           'Hall 1',
    assigned_to_uid:     'uid_sales_exec_001',
    assigned_to_name:    'Pranav Pol',
    follow_ups: [
      { id: 1, date:'2026-02-10', type:'Call', notes:'Qualified lead', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 2, date:'2026-02-14', type:'Visit', notes:'Hall 1 tour done', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 3, date:'2026-02-22', type:'Visit', notes:'Food tasting session', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
    ],
    visited: {
      date: '2026-02-14', hall_id: 'pfd_b1_h1', hall_name: 'Hall 1',
      visited_by: 'Pranav Pol', notes: 'Very interested, wants premium menu.', rating_from_customer: 5,
    },
    food_tasting: {
      scheduled_date: '2026-02-22T17:00:00Z',
      conducted_at:   '2026-02-22T17:15:00Z',
      menu_options_to_present: 'pfd_menu_veg_premium, pfd_menu_jain',
      preferred_menu: 'pfd_menu_veg_premium',
      tasting_score:   5,
      feedback:        'Loved Kaju Masala and Butter Naan. Wants to include Sizzling Brownie.',
    },
    menu_finalization:   null,
    booking_confirmed:   null,
    event_finalization:  null,
    final_payment:       null,
    event_execution:     null,
    post_event_settlement: null,
    feedback:            null,
    created_at:          TS(),
    updated_at:          TS(),
  },

  {
    id: 'LEAD_PFD_004',
    franchise_id:        FRANCHISE_ID,
    branch_id:           BRANCH_ID,
    status:              'advance_paid',
    customer_name:       'Ananya Kulkarni',
    phone:               '+91-9765432100',
    email:               'ananya.k@outlook.com',
    event_type:          'Engagement',
    event_date:          '2026-08-12',
    expected_guest_count: 150,
    budget_range:        '300000-600000',
    hall_id:             'pfd_b1_h1',
    hall_name:           'Hall 1',
    assigned_to_uid:     'uid_sales_exec_001',
    assigned_to_name:    'Pranav Pol',
    follow_ups: [
      { id: 1, date:'2026-01-20', type:'Call', notes:'Initial enquiry', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 2, date:'2026-01-28', type:'Visit', notes:'Site tour', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 3, date:'2026-02-05', type:'Visit', notes:'Tasting done', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 4, date:'2026-02-15', type:'Call', notes:'Advance payment confirmed', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
    ],
    visited: {
      date: '2026-01-28', hall_id: 'pfd_b1_h1', hall_name: 'Hall 1',
      visited_by: 'Pranav Pol', notes: 'Hall exactly as expected.', rating_from_customer: 5,
    },
    food_tasting: {
      conducted_at: '2026-02-05T18:00:00Z', preferred_menu: 'pfd_menu_veg_classic',
      tasting_score: 4, feedback: 'Good variety. Classic menu preferred.',
    },
    menu_finalization: {
      finalized_menu_id: 'pfd_menu_veg_classic', price_per_plate: 450,
      final_guest_count: 150, total_food_cost: 67500,
    },
    booking_confirmed: {
      date: '2026-02-15', amount: 90000, payment_mode: 'UPI',
      payment_ref: 'UPI202602150001', confirmed_by: 'Darshan (Branch Manager)',
      hall_base_rent: 27000, total_quote: 150000,
    },
    event_finalization:  null,
    final_payment:       null,
    event_execution:     null,
    post_event_settlement: null,
    feedback:            null,
    created_at:          TS(),
    updated_at:          TS(),
  },

  {
    id: 'LEAD_PFD_005',
    franchise_id:        FRANCHISE_ID,
    branch_id:           BRANCH_ID,
    status:              'closed',
    customer_name:       'Rohit Desai',
    phone:               '+91-9000011111',
    email:               'rohit.desai@gmail.com',
    event_type:          'Birthday',
    event_date:          '2026-01-10',
    expected_guest_count: 80,
    budget_range:        '0-200000',
    hall_id:             'pfd_b1_h1',
    hall_name:           'Hall 1',
    assigned_to_uid:     'uid_sales_exec_001',
    assigned_to_name:    'Pranav Pol',
    follow_ups: [
      { id: 1, date:'2025-12-01', type:'Call', notes:'Enquiry', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
      { id: 2, date:'2025-12-10', type:'Visit', notes:'Tour + tasting + booking', status:'Done', logged_by:'Pranav Pol', logged_at: NOW },
    ],
    visited: {
      date: '2025-12-10', hall_id: 'pfd_b1_h1', hall_name: 'Hall 1',
      visited_by: 'Pranav Pol', rating_from_customer: 4, notes: 'Happy with the space.',
    },
    food_tasting: {
      conducted_at: '2025-12-10T17:00:00Z', preferred_menu: 'pfd_menu_veg_economy',
      tasting_score: 4, feedback: 'Good value.',
    },
    menu_finalization: {
      finalized_menu_id: 'pfd_menu_veg_economy', price_per_plate: 300,
      final_guest_count: 80, total_food_cost: 24000,
    },
    booking_confirmed: {
      date: '2025-12-12', amount: 25000, payment_mode: 'Cash',
      payment_ref: 'CASH-1212', confirmed_by: 'Darshan', hall_base_rent: 27000, total_quote: 56000,
    },
    event_finalization: {
      final_confirmed_date: '2026-01-10', decoration_type: 'Balloon', vendor: 'Kalyan Décors',
      special_requests: 'Blue and silver theme',
    },
    final_payment: { remaining_amount: 31000, payment_mode: 'UPI', payment_ref: 'UPI202601090001', paid_by: 'Rohit Desai' },
    event_execution: { notes: 'Birthday went smoothly, 80 guests, all happy.', rating: 5, staff_feedback: 'Excellent event.' },
    post_event_settlement: { extra_charges: 0, refund_amount: 0, settled_date: '2026-01-11' },
    feedback: {
      feedback_date: '2026-01-13', rating: 5,
      review_text: 'Amazing food and service! Will definitely book again.',
      repeat_booking: true,
    },
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────────────────────────────────
//  SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────

async function seedLeads() {
  console.log('\n🌱  Seeding Leads for Prasad Food Divine (pfd_b1)…\n');
  let success = 0;

  for (const lead of LEADS) {
    const { id, ...data } = lead;
    try {
      await db.collection('leads').doc(id).set(data, { merge: true });
      console.log(`  ✅  ${id}  (${lead.customer_name}  ·  status: ${lead.status})`);
      success++;
    } catch (err) {
      console.error(`  ❌  ${id} —`, err.message);
    }
  }

  console.log(`\n✅  Done! ${success}/${LEADS.length} leads seeded.\n`);
  process.exit(0);
}

seedLeads().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
