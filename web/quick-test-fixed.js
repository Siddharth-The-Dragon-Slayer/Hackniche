#!/usr/bin/env node

/**
 * Quick Test - Single Endpoint Tester (FIXED PAYLOADS)
 * 
 * Usage:
 *   npm run dev                    (start server first)
 *   node quick-test-fixed.js <endpoint>  (test single endpoint)
 * 
 * Examples:
 *   node quick-test-fixed.js lead-score
 *   node quick-test-fixed.js chatbot
 *   node quick-test-fixed.js menu-recommendation
 */

const BASE_URL = "http://localhost:3000/api/ai";
const endpoint = process.argv[2];

if (!endpoint) {
  console.log(`
Usage: node quick-test-fixed.js <endpoint>

Available text-based endpoints:
  Sales Executive: lead-score, followup-suggestions, sentiment-analysis, generate-proposal
  Branch Manager: revenue-forecast, pricing-advice, staff-roster, lead-risk-alerts
  Kitchen/Inventory: menu-recommendation, consumption-prediction, low-stock-forecast
  Franchise/Admin: cross-branch-analysis, global-revenue-forecast, marketing-roi
  Client-Facing: chatbot, whatsapp-concierge

Example: node quick-test-fixed.js lead-score
  `);
  process.exit(0);
}

// Sample payloads - ALL CORRECTED TO MATCH VALIDATORS
const payloads = {
  "lead-score": {
    lead_id: "lead_12345",
    event_type: "Wedding",
    budget_min: 500000,
    budget_max: 800000,
    budget_flexibility: "Flexible",
    source: "google_ads",
    status: "Hot",
    followup_count: 3,
    days_since_last_contact: 2,
    preferred_date_days_away: 75,
    site_visit_done: true,
    proposal_sent: true,
    proposal_viewed: true,
    avg_response_time_hrs: 0.5,
    historical_branch_conversion_rate_pct: 28,
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "followup-suggestions": {
    lead_id: "lead_12345",
    current_status: "Hot",
    recent_activities: [
      {
        activity_type: "call_made",
        description: "Customer interested but checking other venues",
        outcome: "Pending",
      },
      {
        activity_type: "email_sent",
        description: "Sent pricing details and venue video",
        outcome: "Viewed",
      },
    ],
    last_contacted_via: "Call",
    days_since_last_contact: 2,
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "sentiment-analysis": {
    lead_id: "lead_12345",
    notes: [
      "Very excited about the venue! Love the decoration options and ambiance.",
      "Slightly concerned about the budget. Mentioned competitor rates are lower.",
      "Confirmed guest count update. Ready to move forward with booking process!",
    ],
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "generate-proposal": {
    lead_id: "lead_12345",
    client_name: "Rahul Sharma",
    event_type: "Wedding",
    expected_guests: 350,
    event_date: "2026-05-15",
    time_slot: "Evening",
    budget_min: 500000,
    budget_max: 800000,
    catering_required: true,
    decoration_required: true,
    notes: "Vegetarian menu preferred, stage decoration important",
    halls: [
      {
        hall_id: "hall_001",
        hall_name: "Grand Ballroom",
        capacity_seated: 350,
        capacity_standing: 500,
      },
    ],
    menus: [
      {
        menu_id: "menu_001",
        menu_name: "Royal Veg Package",
        menu_type: "Veg",
        price_per_plate: 950,
      },
    ],
    branch_name: "Delhi Branch",
    franchise_name: "BanquetEase Luxury",
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "revenue-forecast": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    hot_leads: [
      { estimated_value: 650000, event_date_days: 20, score: 92 },
      { estimated_value: 750000, event_date_days: 35, score: 88 },
      { estimated_value: 580000, event_date_days: 45, score: 85 },
    ],
    warm_leads_count: 8,
    avg_warm_lead_value: 450000,
    historical_conversion_rate: 0.28,
    confirmed_bookings_revenue: 1650000,
    pending_balance_bookings: 280000,
    month: "March",
    is_peak_season: true,
    peak_multiplier: 1.25,
  },
  "pricing-advice": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    target_date: "2026-03-15",
    days_to_event: 15,
    occupancy_pct: 65,
    active_leads_for_date: 12,
    base_price: 75000,
    hall_name: "Grand Ballroom",
  },
  "staff-roster": {
    branch_id: "branch_001",
    upcoming_bookings: [
      {
        booking_id: "book_001",
        expected_guests: 350,
        catering_type: "Veg Only",
        event_type: "Wedding",
        package_type: "Premium",
      },
      {
        booking_id: "book_002",
        expected_guests: 200,
        catering_type: "Mixed",
        event_type: "Reception",
        package_type: "Standard",
      },
    ],
  },
  "lead-risk-alerts": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    leads: [
      {
        lead_id: "lead_12345",
        client_name: "Rahul Sharma",
        status: "Hot",
        days_since_last_activity: 15,
        estimated_value: 750000,
        ai_sentiment: "Positive",
        ai_score: 85,
      },
      {
        lead_id: "lead_67890",
        client_name: "Priya Verma",
        status: "Warm",
        days_since_last_activity: 8,
        estimated_value: 520000,
        ai_sentiment: "Neutral",
        ai_score: 62,
      },
    ],
  },
  "menu-recommendation": {
    event_type: "Wedding",
    expected_guests: 350,
    budget_per_head: 1800,
    dietary_preference: "Veg",
    event_time_slot: "Evening",
    special_requirements: "No garlic for some guests, live counter preferred",
    available_menus: [
      {
        menu_id: "menu_001",
        menu_name: "Royal Veg Package",
        menu_type: "Veg",
        price_per_plate: 950,
        min_plates: 100,
      },
      {
        menu_id: "menu_002",
        menu_name: "Premium Jain Package",
        menu_type: "Jain",
        price_per_plate: 1200,
        min_plates: 50,
      },
    ],
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "consumption-prediction": {
    branch_id: "branch_001",
    upcoming_bookings: [
      {
        booking_id: "book_001",
        expected_guests: 350,
        menu_name: "Royal Veg Package",
        catering_type: "Veg Only",
        event_date: "2026-03-15",
      },
    ],
    season: "Spring",
    current_stock: [
      {
        item_id: "item_001",
        item_name: "Basmati Rice",
        unit: "Kg",
        current_stock: 50,
      },
      {
        item_id: "item_002",
        item_name: "Paneer",
        unit: "Kg",
        current_stock: 25,
      },
      {
        item_id: "item_003",
        item_name: "Cooking Oil",
        unit: "Litre",
        current_stock: 80,
      },
    ],
  },
  "low-stock-forecast": {
    branch_id: "branch_001",
    raw_materials: [
      {
        item_id: "item_001",
        item_name: "Cooking Oil",
        category: "Oils",
        current_stock: 20,
        unit: "Litre",
        reorder_level: 50,
        avg_daily_usage: 3.5,
        lead_time_days: 3,
        last_purchase_cost_per_unit: 230,
        last_purchase_quantity: 200,
      },
      {
        item_id: "item_002",
        item_name: "Basmati Rice",
        category: "Grains",
        current_stock: 30,
        unit: "Kg",
        reorder_level: 100,
        avg_daily_usage: 15,
        lead_time_days: 2,
        last_purchase_cost_per_unit: 85,
        last_purchase_quantity: 500,
      },
    ],
    upcoming_bookings_30_days: [
      {
        booking_id: "book_001",
        expected_guests: 250,
        catering_type: "Veg Only",
      },
      {
        booking_id: "book_002",
        expected_guests: 350,
        catering_type: "Veg Only",
      },
    ],
  },
  "cross-branch-analysis": {
    franchise_id: "franchise_001",
    branches_data_snapshot: [
      {
        branch_id: "branch_001",
        monthly_revenue_confirmed: 2500000,
        occupancy_pct: 65,
        conversion_rate_pct: 28,
        nps_score: 4.5,
        avg_response_time_hrs: 2.5,
      },
      {
        branch_id: "branch_002",
        monthly_revenue_confirmed: 3200000,
        occupancy_pct: 75,
        conversion_rate_pct: 32,
        nps_score: 4.7,
        avg_response_time_hrs: 1.8,
      },
    ],
  },
  "global-revenue-forecast": {
    franchise_id: "franchise_001",
    franchise_snapshot: {
      total_confirmed_revenue_mtd: 7200000,
      total_confirmed_revenue_ytd: 28500000,
      total_confirmed_bookings_mtd: 12,
      total_leads_mtd: 98,
      avg_booking_value: 610000,
      branches_count: 3,
      overall_conversion_pct: 30,
    },
  },
  "marketing-roi": {
    franchise_id: "franchise_001",
    channel_stats: [
      {
        source: "google_ads",
        lead_count: 45,
        booking_count: 14,
        total_booking_value: 2800000,
        estimated_spend: 50000,
      },
      {
        source: "facebook_ads",
        lead_count: 28,
        booking_count: 7,
        total_booking_value: 1400000,
        estimated_spend: 35000,
      },
      {
        source: "referral_client",
        lead_count: 15,
        booking_count: 8,
        total_booking_value: 1600000,
        estimated_spend: 0,
      },
    ],
  },
  chatbot: {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    branch_name: "Delhi",
    franchise_name: "BanquetEase Luxury Events",
    session_id: "session_abc123",
    messages: [
      {
        role: "user",
        content: "Hi, I'm planning a wedding for 300 guests in May. What's your pricing?",
      },
      {
        role: "assistant",
        content: "Welcome! That's wonderful! Our venue accommodates up to 500 guests...",
      },
      {
        role: "user",
        content: "Great! My name is Priya and my number is 9876543210.",
      },
    ],
  },
  "whatsapp-concierge": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    branch_name: "Delhi",
    franchise_name: "BanquetEase",
    from_phone: "919876543210",
    message: "Hi, what are the menu options for a vegetarian wedding?",
    menus: [
      {
        menu_id: "menu_001",
        name: "Royal Veg Package",
        menu_type: "Veg",
        price_per_plate: 950,
        description: "Premium vegetarian menu",
      },
    ],
    booked_dates: ["2026-03-10", "2026-03-15"],
  },
};

async function test() {
  if (!payloads[endpoint]) {
    console.error(`\n❌ Unknown endpoint: ${endpoint}\n`);
    process.exit(1);
  }

  const url = `${BASE_URL}/${endpoint}`;
  const payload = payloads[endpoint];

  console.log(`\n🧪 Testing: POST ${url}`);
  console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
  console.log(`\n⏳ Waiting for response...\n`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      timeout: 30000,
    });

    const data = await response.json();

    console.log(`\n📊 Status: ${response.status} ${response.statusText}`);
    console.log(`\n📄 Response:\n${JSON.stringify(data, null, 2)}`);

    if (response.ok && data.success) {
      console.log("\n✅ Test passed!\n");
      process.exit(0);
    } else {
      console.log("\n❌ Test failed!\n");
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

test();
