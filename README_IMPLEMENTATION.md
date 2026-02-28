# BanquetEase — Complete Implementation Guide

## 📋 Table of Contents
1. [Lead Management System](#lead-management-system)
2. [Menu Seeding & Database Structure](#menu-seeding)
3. [Vendor Reviews API (SerpApi)](#vendor-reviews-api)
4. [Quick Start Guide](#quick-start)

---

## Lead Management System

### Overview
BanquetEase tracks wedding/event bookings through a complete 10-stage pipeline, with different staff members managing different phases.

### Lead Lifecycle (10 Stages)

```
NEW → VISITED → TASTING_SCHEDULED → TASTING_DONE → MENU_SELECTED 
  ↓       ↓                              ↓              ↓
ADVANCE_PAID → DECORATION_SCHEDULED → PAID → IN_PROGRESS → COMPLETED 
  ↓                                                              ↓
SETTLEMENT_COMPLETE → FEEDBACK_PENDING → CLOSED (or LOST)
```

### Firebase Collections for Leads

#### `/leads/{lead_id}`
```json
{
  "id": "LEAD_PFDKW_001",
  "franchise_id": "pfd",
  "branch_id": "pfd_b1",
  "status": "paid",
  
  // Customer Info
  "customer_name": "Rajesh Sharma",
  "phone": "+91-9876543210",
  "email": "rajesh@email.com",
  
  // Event Details
  "event_type": "wedding",
  "event_date": "2026-05-15",
  "expected_guest_count": 250,
  "budget_range": "500000-1000000",
  
  // Assignment
  "assigned_to_uid": "uid_sales_exec_001",
  "assigned_to_name": "Pranav Pol",
  
  // Stage-specific data (nested objects)
  "follow_ups": [{...}],
  "visited": {...},
  "food_tasting": {...},
  "menu_finalization": {...},
  "booking_confirmed": {...},
  "event_finalization": {...},
  "final_payment": {...},
  "event_execution": {...},
  "post_event_settlement": {...},
  "feedback": {...},
  
  "created_at": "2026-02-28T10:00:00Z",
  "updated_at": "2026-05-18T10:00:00Z"
}
```

### Role-Based Workflows

| Stage | Primary Role | Actions |
|-------|--------------|---------|
| 1-NEW | Receptionist + Sales Exec | Capture lead, qualify, log follow-ups |
| 2-VISITED | Sales Exec | Schedule tour, update status, share photos |
| 3-TASTING_SCHEDULED | Kitchen Manager | Prepare dishes, coordinate timing |
| 4-TASTING_DONE | Kitchen Manager + Sales Exec | Record feedback, propose customizations |
| 5-MENU_SELECTED | Kitchen Manager + Accountant | Finalize options, calculate cost |
| 6-ADVANCE_PAID | Accountant + Branch Manager | Confirm booking, secure advance |
| 7-DECORATION_SCHEDULED | Operations Staff + Branch Manager | Coordinate with vendors, finalize logistics |
| 8-PAID | Accountant | Collect remaining payment, lock event |
| 9-IN_PROGRESS | Operations Staff | Manage setup, guest flow |
| 10-COMPLETED | Branch Manager | Confirm event completion |
| 11-SETTLEMENT | Accountant | Final bills, refunds, extra charges |
| 12-FEEDBACK | Sales Exec | Collect reviews, testimonials |
| 13-CLOSED | Franchise Admin | Archive lead, calculate revenue |

---

## Menu Seeding

### Setup

1. **Install Firebase:**
   ```bash
   cd web
   npm install firebase-admin
   ```

2. **Add Service Account Key:**
   - Download from Firebase Console → ProjectSettings → Service Accounts → Generate new private key
   - Place file in `scripts/serviceAccountKey.json`

3. **Run Seeding Script:**
   ```bash
   node scripts/seed-menus.js
   ```

### Database Structure After Seeding

```
/menus/{menu_id}
  ├── menu_name (string)
  ├── franchise_id (string)
  ├── branch_ids (array)
  ├── category (string): "veg_premium", "veg_classic", etc.
  ├── price_per_plate (number): ₹450-650
  ├── serves_min (number)
  ├── serves_max (number)
  ├── total_items (number)
  └── created_at (timestamp)

/menus/{menu_id}/dishes/{dish_id}
  ├── dish_name (string)
  ├── category (string): "starter", "main", "rice", "bread", "sweet", "beverage"
  ├── veg_type (string): "vegetarian", "non-vegetarian", "vegan"
  ├── spice_level (string): "mild", "medium", "spicy"
  ├── description (string)
  ├── ingredients (array)
  ├── is_signature (boolean)
  ├── cooking_time (number): minutes
  └── created_at (timestamp)

/branches/{branch_id}/menus/{menu_id}
  ├── menu_id (string)
  ├── menu_name (string)
  ├── price_per_plate (number)
  ├── available (boolean)
  └── created_at (timestamp)

/customizations/{option_id}
  ├── name (string)
  ├── description (string)
  ├── options (array)
  └── type (string): "selection" or "multiple"
```

### Menu Packages Created

| Package | Price/Plate | Dishes | Use Case |
|---------|------------|--------|----------|
| **Premium Veg** | ₹650 | 18 dishes | Weddings, anniversaries, premium events |
| **Classic Veg** | ₹450 | 15 dishes | Birthdays, office events, family gatherings |
| **Economy Veg** | ₹300 | 12 dishes | Groups, student events, fundraisers |
| **Jain Veg** | ₹550 | 14 dishes | Religious events, strict compliance |

### Sample Dishes

**Premium Menu includes:**
- Starters: Cheese Corn Ball ⭐, Mix Grilled Finger ⭐, Butter Paneer Tikka
- Mains: Kaju Masala ⭐, Paneer Do Pyaza, Chole Bhatura Masala, Mixed Veg Curry
- Rice: Veg Biryani ⭐, Garlic Fried Rice
- Bread: Butter Naan ⭐, Garlic Naan, Roti
- Sweets: Sizzling Brownie ⭐, Gulab Jamun ⭐, Kheer
- Beverages: Strawberry Pina Colada ⭐, Mango Lassi

---

## Vendor Reviews API (SerpApi)

### Setup

1. **Set Environment Variable:**
   ```bash
   # In .env.local (Next.js will auto-load)
   SERPAPI_KEY=db0dad09048e7977d52c70cbcfa109f11fd6d63744e033b1b4779213342ffd54
   ```

2. **API Endpoint:**
   ```
   GET /api/vendor/get-reviews
   POST /api/vendor/get-reviews
   ```

### Request

#### GET Request
```bash
curl "http://localhost:3000/api/vendor/get-reviews?vendorName=Sharma%20Tent%20House&city=Delhi&sortBy=newest"
```

#### Query Parameters
| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| `vendorName` | string | YES | e.g., "Sharma Tent House", "Prasad Food Divine" |
| `city` | string | YES | e.g., "Delhi", "Kalyan", "Mumbai" |
| `sortBy` | string | NO | `qualityScore` (default), `newest`, `highestRating`, `lowestRating` |

#### POST Request
```bash
curl -X POST http://localhost:3000/api/vendor/get-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "vendorName": "Prasad Food Divine",
    "city": "Kalyan",
    "sortBy": "newest"
  }'
```

### Response

#### Success (200)
```json
{
  "success": true,
  "vendor_info": {
    "name": "Sharma Tent House",
    "city": "Delhi",
    "data_id": "0x39fb828606bbb111:0x123abc456def789",
    "google_rating": 4.6,
    "review_count": 234,
    "address": "123 Main Street, Delhi",
    "phone": "+91-9876543210",
    "website": "https://example.com",
    "maps_url": "https://maps.google.com/..."
  },
  "reviews": [
    {
      "author": "Rajesh Kumar",
      "rating": 5,
      "text": "Amazing service! Perfect for weddings.",
      "date": "2 months ago",
      "avatar": "https://...",
      "helpful_count": 12,
      "owner_response": "Thank you for choosing us!"
    }
  ],
  "total_reviews_fetched": 24,
  "sort_by": "newest",
  "api_cost": {
    "description": "SerpApi charges per API call",
    "search_cost": 1,
    "reviews_cost": 1,
    "total_cost": 2,
    "note": "Cache for 30 days"
  },
  "fetched_at": "2026-02-28T15:30:45Z"
}
```

#### Error (404)
```json
{
  "success": false,
  "error": "Vendor \"XYZ\" not found on Google Maps in Delhi",
  "suggestion": "Try with different keywords or check spelling",
  "tried_search": "XYZ Delhi"
}
```

### Cost & Rate Limiting

- **Free Tier:** 100 searches/month
- **Cost per lookup:** 2 SerpApi credits (1 for search + 1 for reviews)
- **Max lookups/month:** 50 (100 ÷ 2)
- **Paid Tier:** $50/month for 100k+ calls

### Caching Strategy

Since you only have 100 free calls/month:

```javascript
// Example: Cache in Firebase
const cacheVendorReviews = async (vendorName, city) => {
  const cacheDocId = `${vendorName}_${city}`.toLowerCase();
  const cacheRef = db.collection("vendor_reviews_cache").doc(cacheDocId);
  
  const cachedData = await cacheRef.get();
  
  // Return if cached < 30 days old
  if (cachedData.exists) {
    const age = Date.now() - cachedData.data().fetched_at.toMillis();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      return cachedData.data();
    }
  }
  
  // Fetch fresh data
  const fresh = await fetch(`/api/vendor/get-reviews?vendorName=${vendorName}&city=${city}`);
  const data = await fresh.json();
  
  // Cache it
  await cacheRef.set({
    ...data,
    fetched_at: new Date(),
    cache_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  
  return data;
};
```

### Real-World Usage

**When to call:**
- ✅ Admin onboarding a new vendor (one-time)
- ✅ Monthly competitor analysis
- ✅ Quarterly vendor rating updates

**When NOT to call:**
- ❌ Every time a customer views vendor profile
- ❌ On page loads (would exhaust quota in 2 hours)

---

## Quick Start Guide

### 1. Initialize Database

```bash
# Create users, franchises, branches, halls
node scripts/seed-users.js

# Create menu packages and dishes
node scripts/seed-menus.js
```

### 2. Test Endpoints

```bash
# Get reviews for a vendor
curl "http://localhost:3000/api/vendor/get-reviews?vendorName=Prasad%20Food%20Divine&city=Kalyan"

# Generate text-to-image
curl -X POST http://localhost:3000/api/ai/txt2img \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Beautiful wedding invitation card", "quality": "high"}'

# Generate wedding invitation video
curl -X POST http://localhost:3000/api/ai/json2video-invitation \
  -H "Content-Type: application/json" \
  -d '{"event_type": "wedding", "variables": {...}}'
```

### 3. Create a Lead (Manual Entry)

```bash
curl -X POST http://localhost:3000/api/leads/create \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Rajesh Sharma",
    "phone": "+91-9876543210",
    "event_type": "wedding",
    "event_date": "2026-05-15",
    "guest_count": 250,
    "branch_id": "pfd_b1"
  }'
```

### 4. Update Lead Status

```bash
# Move lead from NEW → VISITED
curl -X PUT http://localhost:3000/api/leads/LEAD_PFDKW_001 \
  -H "Content-Type: application/json" \
  -d '{"status": "visited", "visited": {...}}'
```

---

## Database Indexes to Create

In **Firestore Console**, create these composite indexes for fast queries:

```yaml
Collection: leads
Indexes:
  1. (franchise_id, status, created_at DESC)  # List leads by status
  2. (branch_id, assigned_to_uid, status)     # Staff dashboard
  3. (event_date, status)                      # Event calendar
```

---

## Key Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| **Conversion Rate** | (Closed ÷ New) × 100 | > 20% |
| **Revenue/Lead** | Total Settlement ÷ Leads | ₹2-5 lakh |
| **Avg Lead Time** | New → Closed | 45-60 days |
| **Menu Attachment** | (Menu_Selected ÷ Visited) × 100 | > 70% |
| **Repeat Customer %** | (Repeat Bookings ÷ Total) × 100 | > 15% |

---

## Troubleshooting

### SerpApi Not Working
```bash
# Check if API key is set
echo $SERPAPI_KEY

# Check SerpApi credits (from dashboard at serpapi.com)
# Each search = 1 credit; each review fetch = 1 credit
```

### Lead Status Stuck
- Check if all required fields are filled for next stage
- Verify role permissions for status change
- Check Firebase rules allow the operation

### Menu Seeding Failed
- Ensure `serviceAccountKey.json` is in `scripts/` folder
- Check Firebase quota is not exceeded
- Verify all required fields in menu data

---

## Next Steps

1. ✅ Seed initial data (users, branches, halls, menus)
2. ✅ Deploy endpoints for lead management
3. ✅ Create dashboard for sales team (list leads by status)
4. ✅ Build follow-up reminder system
5. ✅ Integrate with SMS/Email (follow-up notifications)
6. ✅ Add payment gateway integration
7. ✅ Create customer portal for event updates

---

**Questions?** Check the `/LEAD_FLOW_DOCUMENTATION.md` for detailed workflows or ask!
