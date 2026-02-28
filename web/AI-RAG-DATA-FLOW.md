# BanquetEase — AI API Data Flow & RAG Readiness Guide

> **Purpose:** This document maps every AI API endpoint to its Firestore data sources, the fields passed to the LLM, the AI output shape, and the storage destination. Use this as the blueprint for implementing Retrieval-Augmented Generation (RAG) when you add a vector database.
>
> **AI Stack:** LangChain + Groq (`llama-3.3-70b-versatile`) for all text features · Google Veo 2 for video · Google Imagen 3 for images
>
> **Cache Collection:** `/ai_insights` — all text AI results should be written here by the caller via `writeBatch()` after the API responds.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Sales Executive APIs](#1-sales-executive-apis)
3. [Branch Manager APIs](#2-branch-manager-apis)
4. [Kitchen & Inventory APIs](#3-kitchen--inventory-apis)
5. [Franchise / Super Admin APIs](#4-franchise--super-admin-apis)
6. [Client-Facing APIs](#5-client-facing-apis)
7. [Media Generation APIs](#6-media-generation-apis)
8. [RAG Architecture Blueprint](#rag-architecture-blueprint)
9. [Collection → API Quick Reference](#collection--api-quick-reference)
10. [Environment Variables](#environment-variables)

---

## Architecture Overview

```
Frontend / Webhook
       │
       ▼
Next.js API Route  (/api/ai/[feature]/route.js)
  ├── validateXxxInput()        ← ai-validators.js  (schema guard)
  ├── invokeStructuredJSON()    ← groq-client.js     (LangChain + Groq)
  │   or invokeChat()
  │   or generateVideo()        ← google-ai-client.js
  │   or generateImage()
  └── Return JSON response
       │
       ▼
Caller (Frontend / Cloud Function)
  ├── writeBatch() → /ai_insights  (cache result)
  └── Update source document if needed (e.g. /leads.ai_score)
```

**Caching contract for `/ai_insights`:**

| Field | Value |
|---|---|
| `insight_type` | See each endpoint below |
| `branch_id` / `franchise_id` | Scope of the insight |
| `expires_at` | `now + cache_ttl_days` or `now + cache_ttl_hours` |
| `result` | Full AI response object |
| `created_at` | Server timestamp |
| `created_by_user_id` | Requesting user's UID |

---

## 1. Sales Executive APIs

### 1.1 Lead Scoring
**Endpoint:** `POST /api/ai/lead-score`

| Layer | Details |
|---|---|
| **Insight Type** | `lead_score` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `event_type`, `budget_min`, `budget_max`, `budget_flexibility`, `preferred_date`, `expected_guests`, `source`, `status`, `followup_count`, `last_followup_date`, `response_rate`, `created_at` | Primary lead profile for scoring |

**Fields NOT sent to AI (PII-safe):**
- `client_name`, `phone`, `email`, `address`

**AI Output Shape:**
```json
{
  "score": 85,
  "label": "Hot",
  "confidence": 0.91,
  "reasoning": "High-budget wedding within 30 days...",
  "recommended_actions": ["Call today", "Send proposal"],
  "risk_factors": ["No confirmed date yet"]
}
```

**Written to Firestore:**
- `/ai_insights` — full response cached
- `/leads.ai_score`, `/leads.ai_score_label` — caller should update directly

**RAG Notes:**
> **Excellent RAG candidate.** Embed historical lead records (status progression, eventual conversion, final booking value) into a vector store. RAG retrieves 5-10 similar past leads to ground the scoring. Fields to embed: `event_type + budget_range + source + time_to_event + outcome`.

---

### 1.2 Follow-Up Suggestions
**Endpoint:** `POST /api/ai/followup-suggestions`

| Layer | Details |
|---|---|
| **Insight Type** | `followup_suggestion` |
| **Cache TTL** | 1 day |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `event_type`, `status`, `budget_min`, `budget_max`, `source`, `preferred_date`, `expected_guests` | Lead context for personalisation |
| `/lead_activities` | `activity_type`, `notes`, `created_at`, `outcome` | History of all interactions |

**AI Output Shape:**
```json
{
  "suggested_channel": "WhatsApp",
  "suggested_time": "Today 4–6 PM",
  "message_template": "Hi, checking in on your wedding enquiry...",
  "tone": "warm",
  "urgency": "high",
  "talking_points": ["Venue availability", "New menu packages"],
  "avoid_topics": ["Price pressure"],
  "reasoning": "Last touchpoint was 4 days ago via call..."
}
```

**Written to Firestore:**
- `/ai_insights` — cached per `lead_id`
- `/leads.next_followup_date` — caller updates

**RAG Notes:**
> Embed successful follow-up sequences (activity chain → lead converted). Retrieve similar sequences when a new lead stalls. Fields to embed: `activity_type sequence + outcome + days_between_touches + lead_source`.

---

### 1.3 Sentiment Analysis
**Endpoint:** `POST /api/ai/sentiment-analysis`

| Layer | Details |
|---|---|
| **Insight Type** | `sentiment_analysis` |
| **Cache TTL** | 12 hours |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/follow_ups` | `notes`, `type`, `outcome`, `created_at` | Follow-up conversation notes |
| `/lead_activities` | `notes`, `activity_type`, `created_at` | Activity log text |

**AI Output Shape:**
```json
{
  "overall_sentiment": "Positive",
  "sentiment_score": 0.72,
  "emotions_detected": ["excited", "slightly hesitant about budget"],
  "intent_signals": ["Ready to decide", "Comparing venues"],
  "urgency_level": "High",
  "recommended_action": "Strike while iron is hot — send a final proposal",
  "red_flags": ["Mentioned competitor venue twice"]
}
```

**Written to Firestore:**
- `/ai_insights` — cached per `lead_id`

**RAG Notes:**
> Embed notes corpus from converted leads (positive arc) and lost leads (negative arc). RAG context helps the model calibrate what "positive" looks like for this specific venue type and market.

---

### 1.4 Proposal Generation
**Endpoint:** `POST /api/ai/generate-proposal`

| Layer | Details |
|---|---|
| **Insight Type** | `proposal_draft` |
| **Cache TTL** | 3 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `client_name`, `event_type`, `budget_min`, `budget_max`, `preferred_date`, `expected_guests`, `special_requirements` | Client and event details |
| `/halls` | `name`, `capacity_min`, `capacity_max`, `pricing.base_price`, `pricing.per_plate`, `amenities` | Venue options to include |
| `/menus` | `name`, `menu_type`, `price_per_plate`, `items` (summary) | Menu packages to propose |

**AI Output Shape:**
```json
{
  "proposal_title": "Wedding Proposal for Rahul & Priya",
  "greeting": "Dear Rahul ji, ...",
  "venue_section": "...",
  "menu_section": "...",
  "pricing_breakdown": { "hall": 75000, "catering": 450000, "total": 525000 },
  "terms": "...",
  "closing": "...",
  "html_body": "<full HTML proposal>",
  "tone": "formal"
}
```

**Written to Firestore:**
- `/ai_insights` — full proposal cached
- `/leads` — caller may store `proposal_sent_at`

**RAG Notes:**
> **Primary RAG candidate.** Embed past accepted proposals as documents. Retrieve 3 similar proposals (same event_type + budget bracket) to use as few-shot examples. Fields to embed: `event_type + budget_range + guest_count + hall_name + outcome (accepted/rejected)`.

---

## 2. Branch Manager APIs

### 2.1 Revenue Forecast
**Endpoint:** `POST /api/ai/revenue-forecast`

| Layer | Details |
|---|---|
| **Insight Type** | `revenue_forecast` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `status`, `budget_min`, `budget_max`, `preferred_date`, `event_type` (aggregated) | Pipeline value and conversion signals |
| `/bookings` | `total_amount`, `status`, `event_date` (monthly aggregates) | Historical booking revenue |
| `/branches._stats` | `monthly_revenue`, `conversion_rate`, `avg_booking_value`, `total_leads_this_month` | Branch KPI snapshot |

**AI Output Shape:**
```json
{
  "forecast_period": "Next 30 days",
  "predicted_revenue_min": 1200000,
  "predicted_revenue_max": 1800000,
  "predicted_bookings": 8,
  "confidence": "Medium",
  "key_drivers": ["3 hot leads with weddings in March"],
  "risks": ["Low conversion rate last month"],
  "recommendations": ["Push follow-ups on 3 hot leads"]
}
```

**RAG Notes:**
> Embed `monthly_revenue actuals + branch metadata` time-series. RAG retrieves same-month-last-year and peer branch benchmarks for contextual forecasting.

---

### 2.2 Pricing Advice
**Endpoint:** `POST /api/ai/pricing-advice`

| Layer | Details |
|---|---|
| **Insight Type** | `pricing_advice` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/branches._stats` | `avg_booking_value`, `conversion_rate`, `occupancy_rate` | Branch performance baseline |
| `/leads` | `budget_min`, `budget_max`, `budget_flexibility`, `event_type` (distribution) | Demand-side price sensitivity |
| `/halls.pricing` | `base_price`, `per_plate_price`, `package_prices`, `seasonal_rates` | Current pricing structure |

**AI Output Shape:**
```json
{
  "current_price_assessment": "Slightly below market",
  "recommended_base_price": 85000,
  "recommended_per_plate": 950,
  "seasonal_adjustments": { "March": "+15%", "July": "-10%" },
  "competitor_insight": "Similar venues charge ₹90k–₹1.1L base",
  "revenue_impact": "+12–18% estimated uplift"
}
```

**RAG Notes:**
> Embed pricing history with corresponding occupancy and conversion data. Retrieve comparable periods/branches to ground pricing recommendations.

---

### 2.3 Smart Staff Roster
**Endpoint:** `POST /api/ai/staff-roster`

| Layer | Details |
|---|---|
| **Insight Type** | `staff_roster` |
| **Cache TTL** | 1 day |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/bookings` | `event_date`, `event_type`, `expected_guests`, `catering_type`, `hall_id`, `time_slot`, `special_requirements` | Upcoming event demand |

**AI Output Shape:**
```json
{
  "event_date": "2026-03-15",
  "recommended_staff": {
    "waitstaff": 12,
    "kitchen": 6,
    "cleaning": 3,
    "security": 2,
    "coordinator": 1
  },
  "total_staff": 24,
  "setup_time": "3 hours before",
  "special_notes": ["Veg-only kitchen", "DJ setup requires extra security"],
  "shift_plan": "..."
}
```

**RAG Notes:**
> Embed past event → actual staff deployed + feedback (understaffed / overstaffed). RAG retrieves 5 similar events to calibrate exact headcount. Fields to embed: `event_type + guest_count + catering_type + time_slot`.

---

### 2.4 Lead Risk Alerts
**Endpoint:** `POST /api/ai/lead-risk-alerts`

| Layer | Details |
|---|---|
| **Insight Type** | `risk_alert` |
| **Cache TTL** | 6 hours |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `status`, `preferred_date`, `last_followup_date`, `followup_count`, `source`, `ai_score`, `created_at` (multiple records) | Full pipeline health view |
| `/ai_insights` | Previous `lead_score` insights for same leads | Trend detection (score dropping?) |

**AI Output Shape:**
```json
{
  "total_leads_reviewed": 47,
  "at_risk_count": 8,
  "alerts": [
    {
      "lead_id": "abc123",
      "risk_type": "Stale",
      "risk_score": 0.85,
      "days_inactive": 12,
      "recommended_action": "Urgent call today",
      "priority": "Critical"
    }
  ],
  "pipeline_health": "At Risk"
}
```

**RAG Notes:**
> Embed lost-lead patterns (what inactivity patterns preceded churn). RAG flags leads showing early churn signals based on historical data.

---

## 3. Kitchen & Inventory APIs

### 3.1 Menu Recommendation
**Endpoint:** `POST /api/ai/menu-recommendation`

| Layer | Details |
|---|---|
| **Insight Type** | `menu_recommendation` |
| **Cache TTL** | 3 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/menus` | `name`, `menu_type`, `catering_type`, `price_per_plate`, `items`, `is_active`, `seasonal` | Available menu catalogue |
| `/leads` | `event_type`, `budget_min`, `budget_max`, `expected_guests`, `dietary_preferences`, `special_requirements` | Client preferences and constraints |

**AI Output Shape:**
```json
{
  "recommended_menus": [
    {
      "menu_id": "menu_xyz",
      "menu_name": "Royal Veg Package",
      "match_score": 0.94,
      "price_per_plate": 850,
      "total_estimate": 425000,
      "why_recommended": "Best value for veg wedding with 500 guests"
    }
  ],
  "upsell_suggestion": "Add live counter for +₹150/plate",
  "customisation_notes": "Can remove X and add Y"
}
```

**RAG Notes:**
> **Strong RAG candidate.** Embed successful menu choices (booking confirmed + client satisfaction score). Retrieve 5 similar events (same event_type + budget + guest_count) to recommend proven combinations. Fields to embed: `event_type + catering_type + budget_bracket + dietary_preference + outcome`.

---

### 3.2 Consumption Prediction
**Endpoint:** `POST /api/ai/consumption-prediction`

| Layer | Details |
|---|---|
| **Insight Type** | `consumption_prediction` |
| **Cache TTL** | 3 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/bookings` | `expected_guests`, `event_type`, `catering_type`, `menu_id`, `time_slot` | Upcoming event specs |
| `/raw_materials` | `name`, `category`, `unit`, `reorder_level`, `current_stock` | Current inventory levels |

**AI Output Shape:**
```json
{
  "predictions": [
    {
      "material_name": "Basmati Rice",
      "predicted_kg": 45,
      "buffer_qty": 5,
      "total_required": 50,
      "current_stock": 30,
      "need_to_purchase": 20
    }
  ],
  "total_cost_estimate": 32000,
  "critical_items": ["Basmati Rice", "Paneer"]
}
```

**RAG Notes:**
> Embed actual consumption records per event (post-event actuals vs predictions). RAG retrieves similar past events to improve prediction accuracy. Fields to embed: `event_type + guest_count + catering_type + menu_type + actual_consumption_kg_per_item`.

---

### 3.3 Low Stock Forecast
**Endpoint:** `POST /api/ai/low-stock-forecast`

| Layer | Details |
|---|---|
| **Insight Type** | `low_stock_forecast` |
| **Cache TTL** | 1 day |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/raw_materials` | `name`, `category`, `current_stock`, `unit`, `reorder_level`, `avg_daily_usage`, `lead_time_days`, `last_purchase_date` | Inventory state |
| `/bookings` | `event_date`, `expected_guests`, `catering_type` (next 30 days, aggregated) | Forward demand signal |

**AI Output Shape:**
```json
{
  "forecast_days": 30,
  "critical_items": [
    {
      "material_name": "Cooking Oil",
      "current_stock": 20,
      "projected_stockout_date": "2026-03-10",
      "reorder_qty": 50,
      "urgency": "Critical"
    }
  ],
  "items_to_watch": [...],
  "total_purchase_estimate": 85000
}
```

**RAG Notes:**
> Embed seasonal consumption patterns (festival months vs off-season). RAG can identify which materials spike in which months based on historical event data.

---

## 4. Franchise / Super Admin APIs

### 4.1 Cross-Branch Analysis
**Endpoint:** `POST /api/ai/cross-branch-analysis`

| Layer | Details |
|---|---|
| **Insight Type** | `cross_branch_analysis` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/branches._stats` | `monthly_revenue`, `occupancy_rate`, `avg_booking_value`, `conversion_rate`, `customer_satisfaction` (per branch) | Branch performance KPIs |
| `/branches._lead_stats` | `total_leads`, `leads_by_source`, `avg_response_time` (per branch) | Lead pipeline health per branch |

**AI Output Shape:**
```json
{
  "top_performing_branch": { "branch_id": "b1", "score": 92 },
  "underperforming_branches": [{ "branch_id": "b3", "issues": ["Low conversion", "Slow response"] }],
  "best_practices": ["Branch B1's weekday pricing model drives +23% revenue"],
  "recommendations": [...],
  "summary": "..."
}
```

**RAG Notes:**
> Embed branch performance histories + interventions applied (e.g. "hired extra coordinator → +15% satisfaction"). RAG retrieves similar branch profiles and their successful turnaround strategies.

---

### 4.2 Global Revenue Forecast
**Endpoint:** `POST /api/ai/global-revenue-forecast`

| Layer | Details |
|---|---|
| **Insight Type** | `global_forecast` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/franchises._stats` | `total_revenue_mtd`, `total_revenue_ytd`, `total_bookings`, `total_leads`, `conversion_rate`, `avg_booking_value`, `branches_count` | Franchise-wide aggregate KPIs |

**AI Output Shape:**
```json
{
  "forecast_period": "Next Quarter",
  "predicted_revenue": 45000000,
  "predicted_bookings": 180,
  "growth_rate": "12%",
  "high_season_months": ["February", "March", "November"],
  "expansion_opportunity": "City X shows underserved demand",
  "strategic_recommendations": [...]
}
```

**RAG Notes:**
> Embed franchise quarterly reports + market context. RAG can pull comparable franchise performance data and seasonal industry benchmarks.

---

### 4.3 Marketing ROI
**Endpoint:** `POST /api/ai/marketing-roi`

| Layer | Details |
|---|---|
| **Insight Type** | `marketing_roi` |
| **Cache TTL** | 7 days |

**Firestore Collections Read:**

| Collection | Fields Passed to AI | Purpose |
|---|---|---|
| `/leads` | `source`, `status`, `budget_min`, `budget_max`, `created_at` (grouped by source) | Lead volume and quality per channel |
| `/bookings` | `source`, `total_amount`, `status` (confirmed, grouped by source) | Revenue attributed per source |

**AI Output Shape:**
```json
{
  "best_roi_channel": "Google Ads",
  "channel_analysis": [
    {
      "source": "Google Ads",
      "lead_count": 45,
      "conversion_rate": 0.31,
      "revenue_generated": 2800000,
      "estimated_cost": 50000,
      "roi_multiple": 56,
      "recommendation": "Scale budget by 2x"
    }
  ],
  "channels_to_cut": ["Bulk SMS"],
  "budget_reallocation": "..."
}
```

**RAG Notes:**
> Embed channel performance history per season + event type. RAG retrieves similar periods to contextualise whether current ROI is above/below historical average for each source.

---

## 5. Client-Facing APIs

### 5.1 Website AI Chatbot
**Endpoint:** `POST /api/ai/chatbot`

| Layer | Details |
|---|---|
| **Insight Type** | Not cached in `/ai_insights` — stateless per message |
| **AI Method** | `invokeStructuredJSON()` (LangChain Groq, multi-turn via messages array) |

**Input From Caller:**

| Field | Source | Purpose |
|---|---|---|
| `messages[]` | Client-side session state | Full conversation history |
| `branch_name` | `/branches` → `name` | Persona context |
| `franchise_name` | `/franchises` → `name` | Branding context |
| `session_id` | Client-generated UUID | Session tracking |

**AI Output Shape:**
```json
{
  "reply": "Sure! For a wedding of 300 guests, I'd recommend...",
  "lead_captured": true,
  "lead_quality": "Hot",
  "collected_data": {
    "client_name": "Rahul Sharma",
    "phone": "9876543210",
    "event_type": "Wedding",
    "preferred_date": "2026-03-20",
    "expected_guests": 300,
    "budget_min": 500000,
    "budget_max": 800000
  }
}
```

**Written to Firestore (by caller when `lead_captured: true`):**
- `/leads` — new document with `source: "ai_chatbot"`, all `collected_data` fields

**RAG Notes:**
> **High-value RAG use-case.** Embed venue FAQs, past successful chatbot conversations (visitor → lead → booking), package details, and hall descriptions. RAG retrieves relevant venue info to answer specific questions (e.g., "Do you have a pool?" → fetches `/halls.amenities`).
>
> Recommended embeddings:
> - `/halls` → `name + description + amenities + capacity`
> - `/menus` → `name + items + price_per_plate + menu_type`
> - Platform FAQs as static documents

---

### 5.2 WhatsApp AI Concierge
**Endpoint:** `POST /api/ai/whatsapp-concierge`

| Layer | Details |
|---|---|
| **Insight Type** | Not cached in `/ai_insights` — real-time message handling |
| **AI Method** | `invokeStructuredJSON()` (single-turn) |

**Input From Caller (populated by WATI webhook handler):**

| Field | Source | Purpose |
|---|---|---|
| `message` | WATI webhook payload | Raw customer WhatsApp message |
| `from_phone` | WATI webhook | Customer identifier |
| `menus[]` | `/menus` → filtered by `branch_id` + `is_active: true` | Menu catalogue for price answers |
| `booked_dates[]` | `/bookings` → `event_date` where `status: "Confirmed"` | Availability calendar |
| `branch_name` | `/branches` → `name` | Response personalisation |

**AI Output Shape:**
```json
{
  "reply_message": "Hi! The Royal Veg Package starts at ₹850/plate...",
  "intent_detected": "menu_inquiry",
  "detected_date": null,
  "date_available": null,
  "suggested_menu": "Royal Veg Package",
  "should_create_lead": false,
  "urgency": "medium"
}
```

**Written to Firestore (by caller when `should_create_lead: true`):**
- `/leads` — new document with `source: "whatsapp"`, `lead_seed` fields from response

**RAG Notes:**
> Embed historical WhatsApp conversation flows → intent → resolution patterns. Also embed menu descriptions and hall details for grounding. When a customer asks a specific question (e.g., "Can you accommodate 600 guests?"), RAG pulls `/halls.capacity_max` directly instead of relying on the model's memory.
>
> Recommended embeddings:
> - `/menus` → `full item list + price + seasonal availability`
> - `/halls` → `capacity + amenities + parking + A/C details`
> - Common Q&A pairs extracted from past WhatsApp conversations

---

## 6. Media Generation APIs

### 6.1 Video Invitation (Google Veo 2)
**Endpoint:** `POST /api/ai/video-invitation` · `GET /api/ai/video-status?op=<name>`

| Layer | Details |
|---|---|
| **AI Model** | Google Veo 2 (`veo-2.0-generate-001`) via Vertex AI |
| **Output** | Long-running operation → GCS video file (`gs://`) |
| **Insight Type** | `video_invitation` (written after polling completes) |

**Input From Caller:**

| Field | Source | Purpose |
|---|---|---|
| `client_name` | `/leads.client_name` or `/bookings.client_name` | Personalisation |
| `event_type` | `/bookings.event_type` | Scene selection |
| `event_date` | `/bookings.event_date` | Overlay text |
| `venue_name` | `/halls.name` | Scene location |
| `franchise_name` | `/franchises.name` | Branding |
| `booking_id` | `/bookings` doc ID | For linking result back |

**Veo Prompt Construction:**
```
<scene description based on event_type>
+ venue name overlay
+ client name + date text animations
+ <style from STYLE_MAP>
+ cinematography instructions
```

**Output (immediate):**
```json
{
  "status": "processing",
  "operation_name": "projects/.../operations/xxx",
  "poll_endpoint": "/api/ai/video-status?op=...",
  "estimated_seconds": 180
}
```

**Output (after polling `/video-status`):**
```json
{
  "status": "done",
  "output_uri": "gs://banquetease-videos/xxx.mp4"
}
```

**Written to Firestore (by caller after polling done):**
- `/ai_insights` — `{ insight_type: "video_invitation", result: { output_uri, signed_url, booking_id } }`

**RAG Notes:**
> RAG not applicable to Veo video generation — this is generative media, not text retrieval. However, the event metadata (`event_type`, `style`, `color_theme`) can be pre-enriched by RAG to select the best Veo prompt template based on what styles worked best for similar past bookings.

---

### 6.2 Image Generation (Google Imagen 3)
**Endpoint:** `POST /api/ai/generate-image`

| Layer | Details |
|---|---|
| **AI Model** | Google Imagen 3 (`imagen-3.0-generate-001`) via Vertex AI |
| **Output** | Base64-encoded PNG/JPEG images (synchronous) |
| **Insight Type** | `generated_image` (written by caller) |

**Input From Caller:**

| Field | Source | Purpose |
|---|---|---|
| `prompt` | User input / frontend | Base image description |
| `event_type` | `/leads.event_type` or user input | Style enhancement |
| `venue_name` | `/halls.name` | Context grounding |
| `franchise_name` | `/franchises.name` | Context |
| `style` | User selection | Visual preset |

**Enhanced Prompt Construction:**
```
<user prompt>
+ venue context
+ EVENT_STYLE_HINTS[event_type]
+ STYLE_PRESETS[style]
+ quality modifiers
```

**Output:**
```json
{
  "image_count": 2,
  "images": [
    { "index": 0, "base64": "...", "mime_type": "image/png", "aspect_ratio": "16:9" }
  ]
}
```

**Written to Firestore (by caller):**
- Upload base64 to Firebase Storage
- Write URL to `/ai_insights` — `{ insight_type: "generated_image", result: { image_urls[], prompt_used } }`

**RAG Notes:**
> RAG can be used to retrieve past approved image styles for a franchise (e.g., "style guidelines") to enrich the prompt. Embed franchise brand guidelines and past approved image prompts as reference documents.

---

## RAG Architecture Blueprint

### Recommended Vector Stores per Use Case

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAG DATA FLOW (Future)                       │
│                                                                 │
│  Firestore Collections                                          │
│  ─────────────────────                                          │
│  /leads (history)          ──► Embed ──► leads_vectors          │
│  /bookings (completed)     ──► Embed ──► bookings_vectors       │
│  /menus                    ──► Embed ──► menus_vectors          │
│  /halls                    ──► Embed ──► halls_vectors          │
│  /ai_insights (past)       ──► Embed ──► insights_vectors       │
│  Static FAQs               ──► Embed ──► faq_vectors            │
│                                                                 │
│  At query time:                                                 │
│  User query/lead data ──► embed ──► similarity search          │
│                                 ──► top-k results              │
│                                 ──► inject into system prompt  │
│                                 ──► Groq LLM generates answer  │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Priority by API

| Priority | API | RAG Benefit | Embedding Source |
|---|---|---|---|
| 🔴 Critical | `generate-proposal` | Retrieve accepted proposals as templates | `/ai_insights` where `insight_type=proposal_draft` + `booking.status=Confirmed` |
| 🔴 Critical | `chatbot` | Ground answers in real venue data | `/halls`, `/menus`, FAQs |
| 🔴 Critical | `menu-recommendation` | Data-driven menu matching | `/bookings` + confirmed menus + satisfaction scores |
| 🟠 High | `lead-score` | Historical lead conversion patterns | `/leads` with final outcome |
| 🟠 High | `consumption-prediction` | Actual vs predicted consumption | Post-event raw material actuals |
| 🟠 High | `whatsapp-concierge` | Real venue facility facts | `/halls`, `/menus`, past Q&A |
| 🟡 Medium | `followup-suggestions` | Successful follow-up sequences | `/lead_activities` chain → outcome |
| 🟡 Medium | `staff-roster` | Actual vs predicted staffing | Post-event staff feedback |
| 🟡 Medium | `pricing-advice` | Market pricing benchmarks | Historical booking values + occupancy |
| 🟢 Low | `revenue-forecast` | Seasonal revenue patterns | Monthly revenue time-series |
| 🟢 Low | `marketing-roi` | Channel performance baselines | Monthly source → booking data |
| 🟢 Low | `cross-branch-analysis` | Peer branch benchmarks | Branch performance histories |
| ➖ N/A | `video-invitation` | Not applicable (generative media) | — |
| ➖ N/A | `generate-image` | Optional: brand guidelines | Franchise style guides |

### Recommended Embedding Model
- **Google `text-embedding-004`** (via Vertex AI) — free tier available, same ecosystem as Veo/Imagen
- **Fallback:** OpenAI `text-embedding-3-small` — cheapest + high quality

### Recommended Vector Databases
| Option | Best For |
|---|---|
| **Pinecone** | Managed, serverless, great for Next.js/Vercel |
| **Weaviate Cloud** | Open schema, good filtering by `branch_id`/`franchise_id` |
| **Firestore Vector Search** | Native Firestore — zero new infra, GA since 2024 |
| **pgvector (Supabase)** | If adding SQL layer later |

> **Recommendation:** Start with **Firestore Vector Search** — it requires no new infrastructure and all your data is already in Firestore. Upgrade to Pinecone if scale demands it.

### LangChain RAG Integration Pattern
```js
// Future enhancement to each route (example for generate-proposal)
import { FirestoreVectorStore } from "@langchain/google-firestore";
import { GoogleEmbeddings } from "@langchain/google-vertexai";

const vectorStore = new FirestoreVectorStore(new GoogleEmbeddings(), {
  collectionName: "ai_embeddings",
  filter: { franchise_id: d.franchise_id },
});

const retriever = vectorStore.asRetriever({ k: 5 });
const relevantDocs = await retriever.getRelevantDocuments(
  `${d.event_type} wedding proposal accepted ${d.budget_min}-${d.budget_max}`
);

// Inject relevantDocs into systemPrompt as few-shot examples
```

---

## Collection → API Quick Reference

| Firestore Collection | APIs That Read It |
|---|---|
| `/leads` | `lead-score`, `followup-suggestions`, `sentiment-analysis`, `generate-proposal`, `revenue-forecast`, `pricing-advice`, `lead-risk-alerts`, `menu-recommendation`, `marketing-roi` |
| `/lead_activities` | `followup-suggestions`, `sentiment-analysis` |
| `/follow_ups` | `sentiment-analysis` |
| `/bookings` | `revenue-forecast`, `staff-roster`, `consumption-prediction`, `low-stock-forecast`, `marketing-roi` |
| `/halls` | `generate-proposal` |
| `/menus` | `generate-proposal`, `menu-recommendation`, `whatsapp-concierge` |
| `/raw_materials` | `consumption-prediction`, `low-stock-forecast` |
| `/branches._stats` | `revenue-forecast`, `pricing-advice`, `cross-branch-analysis` |
| `/branches._lead_stats` | `cross-branch-analysis` |
| `/franchises._stats` | `global-revenue-forecast` |
| `/ai_insights` | `lead-risk-alerts` (reads previous scores for trend) |
| `/platform` | `chatbot` (franchise/venue metadata) |

---

## Environment Variables

Create `web/.env.local` with these values:

```env
# ── Groq (LangChain) ─────────────────────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# ── Google Vertex AI ─────────────────────────────────────────
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Option A: JSON string (recommended for Vercel / serverless)
GOOGLE_SA_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n","client_email":"..."}

# Option B: File path (for local / Docker / Cloud Run)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# ── Veo Video Output ─────────────────────────────────────────
# Must be a GCS bucket the service account has write access to
GCS_VIDEO_OUTPUT_BUCKET=gs://your-project-banquetease-videos
```

**GCP APIs to enable:**
- Vertex AI API
- Cloud Storage API
- Imagen on Vertex AI (allow-list request if not GA yet)
- Veo on Vertex AI (allow-list request required — contact Google Cloud rep)

---

*Last updated: auto-generated during BanquetEase AI feature implementation by CodingGurus.*
*For questions on the RAG implementation plan, see the `#ai-team` channel.*
