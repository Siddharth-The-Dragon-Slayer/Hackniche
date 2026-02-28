#!/usr/bin/env node

/**
 * Quick Test - Single Endpoint Tester
 * 
 * Usage:
 *   npm run dev                    (start server first)
 *   node quick-test.js <endpoint>  (test single endpoint)
 * 
 * Examples:
 *   node quick-test.js lead-score
 *   node quick-test.js chatbot
 *   node quick-test.js menu-recommendation
 */

const BASE_URL = "http://localhost:3000/api/ai";
const endpoint = process.argv[2];

if (!endpoint) {
  console.log(`
Usage: node quick-test.js <endpoint>

Available text-based endpoints:
  Sales Executive: lead-score, followup-suggestions, sentiment-analysis, generate-proposal
  Branch Manager: revenue-forecast, pricing-advice, staff-roster, lead-risk-alerts
  Kitchen/Inventory: menu-recommendation, consumption-prediction, low-stock-forecast
  Franchise/Admin: cross-branch-analysis, global-revenue-forecast, marketing-roi
  Client-Facing: chatbot, whatsapp-concierge

Example: node quick-test.js lead-score
  `);
  process.exit(0);
}

// Sample payloads by endpoint
const payloads = {
  "lead-score": {
    lead_id: "lead_12345",
    event_type: "Wedding",
    budget_min: 500000,
    budget_max: 800000,
    budget_flexibility: "Flexible",
    preferred_date: "2026-05-15",
    expected_guests: 350,
    source: "Google Ads",
    status: "Qualified",
    followup_count: 3,
    last_followup_date: "2026-02-25",
    response_rate: 0.75,
    created_at: "2026-02-20",
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "followup-suggestions": {
    lead_id: "lead_12345",
    event_type: "Wedding",
    status: "Qualified",
    budget_min: 500000,
    budget_max: 800000,
    source: "Google Ads",
    preferred_date: "2026-05-15",
    expected_guests: 350,
    activities: [
      {
        activity_type: "Call",
        notes: "Customer interested but checking other venues",
        outcome: "Pending",
        created_at: "2026-02-25",
      },
    ],
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "sentiment-analysis": {
    lead_id: "lead_12345",
    notes_collection: [
      {
        notes: "Very excited about the venue!",
        created_at: "2026-02-25",
        type: "Call",
      },
    ],
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "generate-proposal": {
    lead_id: "lead_12345",
    client_name: "Rahul Sharma",
    event_type: "Wedding",
    budget_min: 500000,
    budget_max: 800000,
    preferred_date: "2026-05-15",
    expected_guests: 350,
    special_requirements: "Vegetarian menu preferred",
    halls: [
      {
        hall_id: "hall_001",
        name: "Grand Ballroom",
        capacity_min: 200,
        capacity_max: 500,
        pricing: { base_price: 75000, per_plate: 950 },
        amenities: ["A/C", "Stage", "Parking"],
      },
    ],
    menus: [
      {
        menu_id: "menu_001",
        name: "Royal Veg Package",
        menu_type: "Veg",
        price_per_plate: 950,
        items: "Samosa, Paneer Tikka, Dal Makhni, Paneer Butter Masala",
      },
    ],
    branch_id: "branch_001",
    franchise_id: "franchise_001",
  },
  "revenue-forecast": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    leads_pipeline: [{ event_type: "Wedding", budget_min: 500000, budget_max: 800000, status: "Hot" }],
    recent_bookings: [{ total_amount: 650000, status: "Confirmed", event_date: "2026-02-20" }],
    branch_stats: {
      monthly_revenue: 2500000,
      conversion_rate: 0.28,
      avg_booking_value: 575000,
      total_leads_this_month: 45,
    },
  },
  "pricing-advice": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    branch_stats: {
      avg_booking_value: 575000,
      conversion_rate: 0.28,
      occupancy_rate: 0.65,
    },
    leads_distribution: [{ event_type: "Wedding", budget_min: 500000, count: 25 }],
    current_pricing: {
      base_price: 75000,
      per_plate: 950,
      seasonal_rates: { March: "+10%", July: "-15%" },
    },
  },
  "staff-roster": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    event_date: "2026-03-15",
    event_type: "Wedding",
    expected_guests: 350,
    catering_type: "Full Veg",
    hall_id: "hall_001",
    time_slot: "18:00-23:00",
    special_requirements: "Live counter, DJ setup",
  },
  "lead-risk-alerts": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    leads_sample: [
      {
        lead_id: "lead_12345",
        status: "Qualified",
        preferred_date: "2026-04-20",
        last_followup_date: "2026-02-20",
        followup_count: 2,
        source: "Website",
        ai_score: 75,
        created_at: "2026-02-10",
      },
    ],
  },
  "menu-recommendation": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    event_type: "Wedding",
    budget_min: 500000,
    budget_max: 800000,
    expected_guests: 350,
    dietary_preferences: ["Vegetarian"],
    special_requirements: "No garlic for some guests",
    available_menus: [
      {
        menu_id: "menu_001",
        name: "Royal Veg Package",
        menu_type: "Veg",
        price_per_plate: 950,
        items: "Samosa, Paneer Tikka, Dal Makhni",
      },
    ],
  },
  "consumption-prediction": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    event_date: "2026-03-15",
    expected_guests: 350,
    event_type: "Wedding",
    catering_type: "Full Veg",
    menu_id: "menu_001",
    time_slot: "18:00-23:00",
    raw_materials_current_stock: [
      { name: "Basmati Rice", category: "Grains", unit: "kg", current_stock: 50, reorder_level: 30 },
    ],
  },
  "low-stock-forecast": {
    branch_id: "branch_001",
    franchise_id: "franchise_001",
    raw_materials: [
      {
        material_id: "mat_001",
        name: "Cooking Oil",
        category: "Oils",
        current_stock: 20,
        unit: "liters",
        reorder_level: 50,
        avg_daily_usage: 3.5,
        lead_time_days: 3,
        last_purchase_date: "2026-02-15",
      },
    ],
    upcoming_events_next_30_days: [
      { event_date: "2026-03-05", expected_guests: 250, catering_type: "Full Veg" },
    ],
  },
  "cross-branch-analysis": {
    franchise_id: "franchise_001",
    branches_data: [
      {
        branch_id: "branch_001",
        branch_name: "Delhi",
        monthly_revenue: 2500000,
        occupancy_rate: 0.65,
        avg_booking_value: 575000,
        conversion_rate: 0.28,
        customer_satisfaction: 4.5,
        total_leads: 45,
        leads_by_source: { "Google Ads": 15 },
        avg_response_time_hours: 2.5,
      },
    ],
  },
  "global-revenue-forecast": {
    franchise_id: "franchise_001",
    franchise_stats: {
      total_revenue_mtd: 7200000,
      total_revenue_ytd: 28500000,
      total_bookings_mtd: 12,
      total_leads_mtd: 98,
      overall_conversion_rate: 0.30,
      avg_booking_value: 610000,
      branches_count: 3,
    },
  },
  "marketing-roi": {
    franchise_id: "franchise_001",
    lead_performance: [
      {
        source: "Google Ads",
        lead_count: 45,
        converted_to_booking: 14,
        total_revenue: 2800000,
        estimated_spend: 50000,
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
