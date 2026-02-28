#!/bin/bash

# BanquetEase AI Endpoints - cURL Test Examples
# 
# These are ready-to-use cURL commands for testing each AI API endpoint
# 
# Prerequisites:
#   - Next.js server running on http://localhost:3000
#   - .env.local configured with GROQ_API_KEY
#   - jq installed for pretty-printing JSON (optional): brew install jq
#
# Usage:
#   bash ai-endpoints-curl.sh          # Shows all available commands
#   curl -X POST ... (copy any command below)

BASE_URL="http://localhost:3000/api/ai"

echo "═════════════════════════════════════════════════════════════════"
echo "  BanquetEase AI Endpoints - cURL Test Commands"
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "Base URL: $BASE_URL"
echo "Method: POST (all endpoints)"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo "1️⃣  SALES EXECUTIVE APIs"
echo "────────────────────────────────────────────────────────────────"
echo ""

echo "1.1 Lead Score:"
echo "curl -X POST $BASE_URL/lead-score \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"lead_id\": \"lead_12345\",
    \"event_type\": \"Wedding\",
    \"budget_min\": 500000,
    \"budget_max\": 800000,
    \"budget_flexibility\": \"Flexible\",
    \"preferred_date\": \"2026-05-15\",
    \"expected_guests\": 350,
    \"source\": \"Google Ads\",
    \"status\": \"Qualified\",
    \"followup_count\": 3,
    \"last_followup_date\": \"2026-02-25\",
    \"response_rate\": 0.75,
    \"created_at\": \"2026-02-20\",
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\"
  }'"
echo ""

echo "1.2 Follow-up Suggestions:"
echo "curl -X POST $BASE_URL/followup-suggestions \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"lead_id\": \"lead_12345\",
    \"event_type\": \"Wedding\",
    \"status\": \"Qualified\",
    \"budget_min\": 500000,
    \"budget_max\": 800000,
    \"source\": \"Google Ads\",
    \"preferred_date\": \"2026-05-15\",
    \"expected_guests\": 350,
    \"activities\": [
      {
        \"activity_type\": \"Call\",
        \"notes\": \"Customer interested but checking other venues\",
        \"outcome\": \"Pending\",
        \"created_at\": \"2026-02-25\"
      }
    ],
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\"
  }'"
echo ""

echo "1.3 Sentiment Analysis:"
echo "curl -X POST $BASE_URL/sentiment-analysis \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"lead_id\": \"lead_12345\",
    \"notes_collection\": [
      {
        \"notes\": \"Very excited about the venue! Love the decoration options.\",
        \"created_at\": \"2026-02-25\",
        \"type\": \"Call\"
      }
    ],
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\"
  }'"
echo ""

echo "1.4 Generate Proposal:"
echo "curl -X POST $BASE_URL/generate-proposal \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"lead_id\": \"lead_12345\",
    \"client_name\": \"Rahul Sharma\",
    \"event_type\": \"Wedding\",
    \"budget_min\": 500000,
    \"budget_max\": 800000,
    \"preferred_date\": \"2026-05-15\",
    \"expected_guests\": 350,
    \"special_requirements\": \"Vegetarian menu preferred\",
    \"halls\": [
      {
        \"hall_id\": \"hall_001\",
        \"name\": \"Grand Ballroom\",
        \"capacity_min\": 200,
        \"capacity_max\": 500,
        \"pricing\": {\"base_price\": 75000, \"per_plate\": 950},
        \"amenities\": [\"A/C\", \"Stage\", \"Parking\"]
      }
    ],
    \"menus\": [
      {
        \"menu_id\": \"menu_001\",
        \"name\": \"Royal Veg Package\",
        \"menu_type\": \"Veg\",
        \"price_per_plate\": 950,
        \"items\": \"Samosa, Paneer Tikka, Dal Makhni\"
      }
    ],
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\"
  }'"
echo ""

echo "────────────────────────────────────────────────────────────────"
echo "2️⃣  BRANCH MANAGER APIs"
echo "────────────────────────────────────────────────────────────────"
echo ""

echo "2.1 Revenue Forecast:"
echo "curl -X POST $BASE_URL/revenue-forecast \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"leads_pipeline\": [
      {\"event_type\": \"Wedding\", \"budget_min\": 500000, \"budget_max\": 800000, \"status\": \"Hot\"}
    ],
    \"recent_bookings\": [
      {\"total_amount\": 650000, \"status\": \"Confirmed\", \"event_date\": \"2026-02-20\"}
    ],
    \"branch_stats\": {
      \"monthly_revenue\": 2500000,
      \"conversion_rate\": 0.28,
      \"avg_booking_value\": 575000,
      \"total_leads_this_month\": 45
    }
  }'"
echo ""

echo "2.2 Pricing Advice:"
echo "curl -X POST $BASE_URL/pricing-advice \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"branch_stats\": {
      \"avg_booking_value\": 575000,
      \"conversion_rate\": 0.28,
      \"occupancy_rate\": 0.65
    },
    \"leads_distribution\": [
      {\"event_type\": \"Wedding\", \"budget_min\": 500000, \"count\": 25}
    ],
    \"current_pricing\": {
      \"base_price\": 75000,
      \"per_plate\": 950,
      \"seasonal_rates\": {\"March\": \"+10%\", \"July\": \"-15%\"}
    }
  }'"
echo ""

echo "2.3 Staff Roster:"
echo "curl -X POST $BASE_URL/staff-roster \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"event_date\": \"2026-03-15\",
    \"event_type\": \"Wedding\",
    \"expected_guests\": 350,
    \"catering_type\": \"Full Veg\",
    \"hall_id\": \"hall_001\",
    \"time_slot\": \"18:00-23:00\",
    \"special_requirements\": \"Live counter, DJ setup\"
  }'"
echo ""

echo "2.4 Lead Risk Alerts:"
echo "curl -X POST $BASE_URL/lead-risk-alerts \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"leads_sample\": [
      {
        \"lead_id\": \"lead_12345\",
        \"status\": \"Qualified\",
        \"preferred_date\": \"2026-04-20\",
        \"last_followup_date\": \"2026-02-20\",
        \"followup_count\": 2,
        \"source\": \"Website\",
        \"ai_score\": 75,
        \"created_at\": \"2026-02-10\"
      }
    ]
  }'"
echo ""

echo "────────────────────────────────────────────────────────────────"
echo "3️⃣  KITCHEN & INVENTORY APIs"
echo "────────────────────────────────────────────────────────────────"
echo ""

echo "3.1 Menu Recommendation:"
echo "curl -X POST $BASE_URL/menu-recommendation \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"event_type\": \"Wedding\",
    \"budget_min\": 500000,
    \"budget_max\": 800000,
    \"expected_guests\": 350,
    \"dietary_preferences\": [\"Vegetarian\"],
    \"special_requirements\": \"No garlic for some guests\",
    \"available_menus\": [
      {
        \"menu_id\": \"menu_001\",
        \"name\": \"Royal Veg Package\",
        \"menu_type\": \"Veg\",
        \"price_per_plate\": 950,
        \"items\": \"Samosa, Paneer Tikka, Dal Makhni\"
      }
    ]
  }'"
echo ""

echo "3.2 Consumption Prediction:"
echo "curl -X POST $BASE_URL/consumption-prediction \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"event_date\": \"2026-03-15\",
    \"expected_guests\": 350,
    \"event_type\": \"Wedding\",
    \"catering_type\": \"Full Veg\",
    \"menu_id\": \"menu_001\",
    \"time_slot\": \"18:00-23:00\",
    \"raw_materials_current_stock\": [
      {\"name\": \"Basmati Rice\", \"category\": \"Grains\", \"unit\": \"kg\", \"current_stock\": 50, \"reorder_level\": 30}
    ]
  }'"
echo ""

echo "3.3 Low Stock Forecast:"
echo "curl -X POST $BASE_URL/low-stock-forecast \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"raw_materials\": [
      {
        \"material_id\": \"mat_001\",
        \"name\": \"Cooking Oil\",
        \"category\": \"Oils\",
        \"current_stock\": 20,
        \"unit\": \"liters\",
        \"reorder_level\": 50,
        \"avg_daily_usage\": 3.5,
        \"lead_time_days\": 3,
        \"last_purchase_date\": \"2026-02-15\"
      }
    ],
    \"upcoming_events_next_30_days\": [
      {\"event_date\": \"2026-03-05\", \"expected_guests\": 250, \"catering_type\": \"Full Veg\"}
    ]
  }'"
echo ""

echo "────────────────────────────────────────────────────────────────"
echo "4️⃣  FRANCHISE / SUPER ADMIN APIs"
echo "────────────────────────────────────────────────────────────────"
echo ""

echo "4.1 Cross-Branch Analysis:"
echo "curl -X POST $BASE_URL/cross-branch-analysis \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"franchise_id\": \"franchise_001\",
    \"branches_data\": [
      {
        \"branch_id\": \"branch_001\",
        \"branch_name\": \"Delhi\",
        \"monthly_revenue\": 2500000,
        \"occupancy_rate\": 0.65,
        \"avg_booking_value\": 575000,
        \"conversion_rate\": 0.28,
        \"customer_satisfaction\": 4.5,
        \"total_leads\": 45,
        \"leads_by_source\": {\"Google Ads\": 15},
        \"avg_response_time_hours\": 2.5
      }
    ]
  }'"
echo ""

echo "4.2 Global Revenue Forecast:"
echo "curl -X POST $BASE_URL/global-revenue-forecast \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"franchise_id\": \"franchise_001\",
    \"franchise_stats\": {
      \"total_revenue_mtd\": 7200000,
      \"total_revenue_ytd\": 28500000,
      \"total_bookings_mtd\": 12,
      \"total_leads_mtd\": 98,
      \"overall_conversion_rate\": 0.30,
      \"avg_booking_value\": 610000,
      \"branches_count\": 3
    }
  }'"
echo ""

echo "4.3 Marketing ROI:"
echo "curl -X POST $BASE_URL/marketing-roi \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"franchise_id\": \"franchise_001\",
    \"lead_performance\": [
      {
        \"source\": \"Google Ads\",
        \"lead_count\": 45,
        \"converted_to_booking\": 14,
        \"total_revenue\": 2800000,
        \"estimated_spend\": 50000
      }
    ]
  }'"
echo ""

echo "────────────────────────────────────────────────────────────────"
echo "5️⃣  CLIENT-FACING APIs"
echo "────────────────────────────────────────────────────────────────"
echo ""

echo "5.1 Chatbot:"
echo "curl -X POST $BASE_URL/chatbot \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"branch_name\": \"Delhi\",
    \"franchise_name\": \"BanquetEase Luxury Events\",
    \"session_id\": \"session_abc123\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"Hi, I am planning a wedding for 300 guests in May. What is your pricing?\"
      },
      {
        \"role\": \"assistant\",
        \"content\": \"Welcome! That is wonderful! Our venue accommodates up to 500 guests...\"
      },
      {
        \"role\": \"user\",
        \"content\": \"Great! My name is Priya and my number is 9876543210.\"
      }
    ]
  }'"
echo ""

echo "5.2 WhatsApp Concierge:"
echo "curl -X POST $BASE_URL/whatsapp-concierge \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{
    \"branch_id\": \"branch_001\",
    \"franchise_id\": \"franchise_001\",
    \"branch_name\": \"Delhi\",
    \"franchise_name\": \"BanquetEase\",
    \"from_phone\": \"919876543210\",
    \"message\": \"Hi, what are the menu options for a vegetarian wedding?\",
    \"menus\": [
      {
        \"menu_id\": \"menu_001\",
        \"name\": \"Royal Veg Package\",
        \"menu_type\": \"Veg\",
        \"price_per_plate\": 950,
        \"description\": \"Premium vegetarian menu\"
      }
    ],
    \"booked_dates\": [\"2026-03-10\", \"2026-03-15\"]
  }'"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "Tips for using these commands:"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Copy any command above and paste into your terminal"
echo ""
echo "2. To pretty-print JSON responses, install jq and pipe output:"
echo "   ... | jq"
echo ""
echo "3. To save response to a file:"
echo "   ... -d '...' > response.json"
echo ""
echo "4. To increase verbosity/debugging:"
echo "   curl -v -X POST ..."
echo ""
echo "5. To test with authentication headers (if needed):"
echo "   curl -X POST ... -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
