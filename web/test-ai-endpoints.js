/**
 * Test Script for All Text-Based AI Endpoints
 * 
 * Usage:
 *   npm run dev              (start Next.js server first)
 *   node test-ai-endpoints.js
 * 
 * Environment:
 *   GROQ_API_KEY must be set in .env.local
 *   Server must be running on http://localhost:3000
 */

const BASE_URL = "http://localhost:3000/api/ai";
const TIMEOUT = 30000; // 30 seconds for LLM calls

let passCount = 0;
let failCount = 0;

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSection(title) {
  log(`\n${"═".repeat(70)}`, "blue");
  log(`  ${title}`, "blue");
  log(`${"═".repeat(70)}`, "blue");
}

function logTest(name) {
  process.stdout.write(`  Testing ${name}... `);
}

function logPass(details = "") {
  log("✓ PASS", "green");
  if (details) log(`    → ${details}`, "gray");
  passCount++;
}

function logFail(error) {
  log("✗ FAIL", "red");
  log(`    → ${error}`, "red");
  failCount++;
}

async function testEndpoint(name, endpoint, body) {
  logTest(name);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: TIMEOUT,
    });

    const data = await response.json();

    if (!response.ok) {
      logFail(`HTTP ${response.status}: ${data.error || JSON.stringify(data)}`);
      return data;
    }

    if (!data.success) {
      logFail(`Response marked failed: ${data.error || JSON.stringify(data)}`);
      return data;
    }

    logPass(`insight_type=${data.insight_type || "N/A"}`);
    return data;
  } catch (err) {
    logFail(`${err.message}`);
    return null;
  }
}

async function main() {
  log("\n🤖 BanquetEase AI Endpoints - Text-Based Test Suite", "blue");
  log(`Base URL: ${BASE_URL}`, "gray");
  log(`Timeout: ${TIMEOUT}ms`, "gray");

  // ────────────────────────────────────────────────────────────────────
  // SALES EXECUTIVE APIS (4)
  // ────────────────────────────────────────────────────────────────────
  logSection("1️⃣  SALES EXECUTIVE APIs (4)");

  // 1.1 Lead Score
  await testEndpoint(
    "Lead Score",
    "/lead-score",
    {
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
    }
  );

  // 1.2 Follow-up Suggestions
  await testEndpoint(
    "Follow-up Suggestions",
    "/followup-suggestions",
    {
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
    }
  );

  // 1.3 Sentiment Analysis
  await testEndpoint(
    "Sentiment Analysis",
    "/sentiment-analysis",
    {
      lead_id: "lead_12345",
      notes: [
        "Very excited about the venue! Love the decoration options and ambiance.",
        "Slightly concerned about the budget. Mentioned competitor rates are lower.",
        "Confirmed guest count update. Ready to move forward with booking process!",
      ],
      branch_id: "branch_001",
      franchise_id: "franchise_001",
    }
  );

  // 1.4 Generate Proposal
  await testEndpoint(
    "Generate Proposal",
    "/generate-proposal",
    {
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
    }
  );

  // ────────────────────────────────────────────────────────────────────
  // BRANCH MANAGER APIS (4)
  // ────────────────────────────────────────────────────────────────────
  logSection("2️⃣  BRANCH MANAGER APIs (4)");

  // 2.1 Revenue Forecast
  await testEndpoint(
    "Revenue Forecast",
    "/revenue-forecast",
    {
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
    }
  );

  // 2.2 Pricing Advice
  await testEndpoint(
    "Pricing Advice",
    "/pricing-advice",
    {
      branch_id: "branch_001",
      franchise_id: "franchise_001",
      target_date: "2026-03-15",
      days_to_event: 15,
      occupancy_pct: 65,
      active_leads_for_date: 12,
      base_price: 75000,
      hall_name: "Grand Ballroom",
    }
  );

  // 2.3 Smart Staff Roster
  await testEndpoint(
    "Staff Roster",
    "/staff-roster",
    {
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
    }
  );

  // 2.4 Lead Risk Alerts
  await testEndpoint(
    "Lead Risk Alerts",
    "/lead-risk-alerts",
    {
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
    }
  );

  // ────────────────────────────────────────────────────────────────────
  // KITCHEN & INVENTORY APIS (3)
  // ────────────────────────────────────────────────────────────────────
  logSection("3️⃣  KITCHEN & INVENTORY APIs (3)");

  // 3.1 Menu Recommendation
  await testEndpoint(
    "Menu Recommendation",
    "/menu-recommendation",
    {
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
    }
  );

  // 3.2 Consumption Prediction
  await testEndpoint(
    "Consumption Prediction",
    "/consumption-prediction",
    {
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
    }
  );

  // 3.3 Low Stock Forecast
  await testEndpoint(
    "Low Stock Forecast",
    "/low-stock-forecast",
    {
      branch_id: "branch_001",
      raw_materials: [
        {
          item_id: "item_001",
          item_name: "Cooking Oil",
          unit: "Litre",
          current_stock: 20,
          min_stock_level: 50,
        },
        {
          item_id: "item_002",
          item_name: "Basmati Rice",
          unit: "Kg",
          current_stock: 30,
          min_stock_level: 100,
        },
      ],
      next_week_bookings: [
        {
          booking_id: "book_001",
          expected_guests: 250,
          menu_name: "Royal Veg Package",
          catering_type: "Veg Only",
        },
        {
          booking_id: "book_002",
          expected_guests: 350,
          menu_name: "Royal Veg Package",
          catering_type: "Veg Only",
        },
      ],
    }
  );

  // ────────────────────────────────────────────────────────────────────
  // FRANCHISE / SUPER ADMIN APIS (3)
  // ────────────────────────────────────────────────────────────────────
  logSection("4️⃣  FRANCHISE / SUPER ADMIN APIs (3)");

  // 4.1 Cross-Branch Analysis
  await testEndpoint(
    "Cross-Branch Analysis",
    "/cross-branch-analysis",
    {
      franchise_id: "franchise_001",
      branches_stats: [
        {
          branch_id: "branch_001",
          branch_name: "Delhi",
          city: "Delhi",
          conversion_rate_pct: 28,
          revenue_mtd: 2500000,
          total_leads: 45,
        },
        {
          branch_id: "branch_002",
          branch_name: "Mumbai",
          city: "Mumbai",
          conversion_rate_pct: 32,
          revenue_mtd: 3200000,
          total_leads: 52,
        },
      ],
    }
  );

  // 4.2 Global Revenue Forecast
  await testEndpoint(
    "Global Revenue Forecast",
    "/global-revenue-forecast",
    {
      franchises_stats: [
        {
          franchise_id: "franchise_001",
          franchise_name: "BanquetEase Nation",
          total_revenue_mtd: 7200000,
          total_revenue_ytd: 28500000,
          total_leads_hot: 24,
          conversion_rate_pct: 30,
        },
      ],
      month: "March",
      is_peak_season: true,
    }
  );

  // 4.3 Marketing ROI
  await testEndpoint(
    "Marketing ROI",
    "/marketing-roi",
    {
      branch_id: "branch_001",
      franchise_id: "franchise_001",
      leads_by_source: [
        {
          source: "google_ads",
          total_leads: 45,
          converted_leads: 14,
          total_booking_value: 2800000,
        },
        {
          source: "facebook_ads",
          total_leads: 28,
          converted_leads: 7,
          total_booking_value: 1400000,
        },
        {
          source: "referral_client",
          total_leads: 15,
          converted_leads: 8,
          total_booking_value: 1600000,
        },
      ],
      date_range: { from: "2026-01-01", to: "2026-03-31" },
    }
  );

  // ────────────────────────────────────────────────────────────────────
  // CLIENT-FACING APIS (2)
  // ────────────────────────────────────────────────────────────────────
  logSection("5️⃣  CLIENT-FACING APIs (2)");

  // 5.1 Chatbot
  await testEndpoint(
    "Chatbot",
    "/chatbot",
    {
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
          content: "Welcome! That's wonderful! Our venue accommodates up to 500 guests comfortably...",
        },
        {
          role: "user",
          content: "Great! My name is Priya Sharma and my number is 9876543210. We are thinking May 20.",
        },
      ],
    }
  );

  // 5.2 WhatsApp Concierge
  await testEndpoint(
    "WhatsApp Concierge",
    "/whatsapp-concierge",
    {
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
          description: "Premium vegetarian menu with paneer specialties",
        },
        {
          menu_id: "menu_002",
          name: "Premium Jain Package",
          menu_type: "Jain",
          price_per_plate: 1200,
          description: "Complete Jain-compliant menu",
        },
      ],
      booked_dates: ["2026-03-10", "2026-03-15", "2026-04-05"],
    }
  );

  // ────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────────────────────
  logSection("📊 TEST SUMMARY");

  const total = passCount + failCount;
  const percentage = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;

  log(`Total Tests: ${total}`, "gray");
  log(`Passed: ${passCount}`, "green");
  log(`Failed: ${failCount}`, failCount > 0 ? "red" : "gray");
  log(`Success Rate: ${percentage}%`, percentage === "100.0" ? "green" : "yellow");

  if (failCount === 0) {
    log("\n✨ All tests passed! ✨", "green");
  } else {
    log(`\n⚠️  ${failCount} test(s) failed. Check logs above.`, "yellow");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
main().catch((err) => {
  log(`\nFatal Error: ${err.message}`, "red");
  process.exit(1);
});
