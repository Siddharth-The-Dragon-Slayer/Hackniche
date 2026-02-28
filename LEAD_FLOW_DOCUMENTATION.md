# BanquetEase — Lead Management & Role-Based Workflow

## Current Database Schema Overview

```
Franchises (pfd)
  ├── Branches (9 outlets: pfd_b1 to pfd_b9)
  │   ├── Halls (1-3 per branch)
  │   └── Menus (to be created)
  └── Users (by role)
      ├── franchise_admin (2)
      ├── branch_manager (1 per branch)
      ├── sales_executive
      ├── receptionist
      ├── operations_staff
      ├── kitchen_manager
      └── accountant
```

---

## Lead Lifecycle Pipeline

### Stage 1: **LEAD CAPTURE** (Status: `New`)
**Where it starts:** Phone call, walk-in, online form

**Responsible Roles:**
- **Receptionist** — answers calls, captures basic info (name, phone, event date, guest count)
- **Sales Executive** — qualifies lead, assigns venue/budget range

**Data Stored in `leads` collection:**
```json
{
  "id": "LEAD_PFDKW_001",                    // Unique lead ID
  "franchise_id": "pfd",
  "branch_id": "pfd_b1",
  "status": "new",                           // Lead pipeline status
  "created_at": "2026-02-28T10:00:00Z",
  
  // Lead contact info
  "customer_name": "Rajesh Sharma",
  "phone": "+91-9876543210",
  "email": "rajesh@email.com",
  
  // Event details (initial)
  "event_type": "wedding",                   // wedding, birthday, anniversary, etc
  "event_date": "2026-05-15",
  "expected_guest_count": 250,
  "budget_range": "500000-1000000",
  
  // Assignment
  "assigned_to_uid": "user_sales_exec_001",  // Sales Executive UID
  "assigned_to_name": "Pranav Pol",
  
  // Communication log
  "follow_ups": [
    {
      "date": "2026-02-28T10:30:00Z",
      "notes": "Initial call, interested in May dates",
      "logged_by": "pranav"
    }
  ]
}
```

---

### Stage 2: **PROPERTY VISIT / VENUE TOUR** (Status: `visited`)
**Goal:** Customer sees the hall, understands capacity & ambiance

**Responsible Roles:**
- **Sales Executive** — conducts hall tour, explains features/pricing
- **Branch Manager** — available for premium clients, negotiates deals

**Data Updated in `leads` document:**
```json
{
  "status": "visited",
  "visited": {
    "date": "2026-03-01T14:00:00Z",
    "hall_id": "pfd_b1_h3",              // Hall 1+2 Combined
    "hall_name": "Hall 1+2 Combined",
    "visited_by": "pranav",
    "notes": "Customer impressed with capacity, asked about catering options",
    "rating_from_customer": 4.5          // Out of 5
  }
}
```

---

### Stage 3: **FOOD TASTING** (Status: `tasting_scheduled` → `tasting_done`)
**Goal:** Customer samples menu options

**Responsible Roles:**
- **Kitchen Manager** — prepares 3-5 signature dishes for tasting
- **Sales Executive** — coordinates timing, takes feedback
- **Operations Staff** — arranges tasting setup

**Data Added to `leads` document:**
```json
{
  "status": "tasting_done",
  "food_tasting": {
    "scheduled_date": "2026-03-05T17:00:00Z",
    "conducted_at": "2026-03-05T17:15:00Z",
    "menu_options_presented": [
      "pfd_menu_veg_premium",
      "pfd_menu_veg_classic",
      "pfd_menu_non_veg"
    ],
    "dishes_sampled": [
      { "dish": "Kaju Masala", "rating": 5 },
      { "dish": "Veg Biryani", "rating": 4 },
      { "dish": "Cheese Corn Ball", "rating": 4.5 }
    ],
    "kitchen_manager": "Shravani Rasam",
    "customer_feedback": "Loved the spice level and authenticity",
    "preferred_menu": "pfd_menu_veg_premium"
  }
}
```

---

### Stage 4: **MENU FINALIZATION** (Status: `menu_selected`)
**Goal:** Customer chooses final menu + number of dishes

**Responsible Roles:**
- **Kitchen Manager** — customizes menu, finalizes dish list
- **Sales Executive** — calculates final pricing
- **Accountant** — generates quote

**Data Added to `leads` document:**
```json
{
  "status": "menu_selected",
  "menu_finalization": {
    "finalized_menu_id": "pfd_menu_veg_premium",
    "finalized_menu_name": "Premium Vegetarian Menu",
    "finalized_date": "2026-03-08T16:30:00Z",
    "customizations": [
      "Add extra sweet dish (Gulab Jamun)",
      "Spice level: Medium",
      "Reduce quantity of 1 sabjee, add another"
    ],
    "final_per_plate_cost": 650,           // INR
    "expected_plates": 250,
    "total_food_cost": 162500
  },
  "quote": {
    "hall_base_rent": 90000,
    "food_cost": 162500,
    "decoration_budget_estimated": 50000,
    "total_estimated": 302500,
    "quote_valid_till": "2026-03-15"
  }
}
```

---

### Stage 5: **ADVANCE PAYMENT** (Status: `advance_paid`)
**Goal:** Secure the booking with 30-50% advance

**Responsible Roles:**
- **Accountant** — generates invoice, tracks payment
- **Branch Manager** — confirms booking after payment
- **Receptionist** — marks confirmation in system

**Data Added to `leads` document:**
```json
{
  "status": "advance_paid",
  "booking_confirmed": {
    "date": "2026-03-10T11:00:00Z",
    "advance_amount": 150000,             // 50% of 302500
    "advance_payment_date": "2026-03-10",
    "payment_mode": "bank_transfer",
    "transaction_ref": "TXN_PFD_20260310_001",
    "confirmed_by": "darshan_manager"
  }
}
```

---

### Stage 6: **DECORATION & EVENT FINALIZATION** (Status: `decoration_scheduled`)
**Goal:** Plan decorations, finalize all event details

**Responsible Roles:**
- **Branch Manager** — coordinates with decoration vendors
- **Operations Staff** — finalizes logistics, table arrangements
- **Kitchen Manager** — final head count & dish confirmation

**Data Added to `leads` document:**
```json
{
  "status": "decoration_scheduled",
  "event_finalization": {
    "final_confirmed_date": "2026-05-15",
    "final_guest_count": 245,             // Updated based on RSVPs
    "final_per_plate_food": 650,
    "final_food_cost": 159350,
    "decoration_theme": "Traditional Gold & Maroon",
    "decoration_partner": "Sharma Decorators",
    "decoration_cost": 48000,
    "setup_date": "2026-05-14T08:00:00Z",
    "teardown_date": "2026-05-16T10:00:00Z",
    "special_requests": "Extra mic setup, stage decoration focus"
  }
}
```

---

### Stage 7: **FULL PAYMENT** (Status: `full_payment_pending` → `paid`)
**Goal:** Collect remaining 50% payment & lock in all details

**Responsible Roles:**
- **Accountant** — sends payment reminder 7 days before
- **Branch Manager** — confirms all details before event
- **Kitchen Manager** — finalizes food orders 3 days before

**Data Added to `leads` document:**
```json
{
  "status": "paid",
  "final_payment": {
    "remaining_amount": 152500,           // 302500 - 150000
    "due_date": "2026-05-08",
    "payment_date": "2026-05-07",
    "payment_mode": "bank_transfer",
    "transaction_ref": "TXN_PFD_20260507_002",
    "paid_by_uid": "customer_uid"
  },
  "event_locked": true,
  "locked_date": "2026-05-07T15:30:00Z"
}
```

---

### Stage 8: **EVENT DAY** (Status: `in_progress` → `completed`)
**Goal:** Execute the event flawlessly

**Responsible Roles:**
- **Operations Staff** — manages setup, guest flow
- **Kitchen Manager** — oversees food service
- **Branch Manager** — overall event supervision
- **Receptionist** — guest management at entry

**Data Added to `leads` document:**
```json
{
  "status": "completed",
  "event_execution": {
    "event_date": "2026-05-15",
    "start_time": "18:30",
    "end_time": "22:30",
    "actual_guest_count": 245,
    "photos_taken": 234,
    "problems_encountered": "AC issue (30 mins), resolved",
    "contingency_actions": "Increased fan usage",
    "staff_feedback": "Event went smoothly, customer very happy"
  }
}
```

---

### Stage 9: **POST-EVENT SETTLEMENT** (Status: `settlement_pending`)
**Goal:** Handle leftover payments, damages, vendor payments

**Responsible Roles:**
- **Accountant** — settles all bills, refunds extra charges
- **Operations Staff** — checks for damages
- **Branch Manager** — approves settlement

**Data Added to `leads` document:**
```json
{
  "status": "settlement_complete",
  "post_event_settlement": {
    "settlement_date": "2026-05-16",
    "final_guest_count": 245,
    "final_plates_served": 245,
    "leftover_refund": {
      "plates_not_served": 0,
      "refund_amount": 0
    },
    "extra_charges": {
      "additional_setup_time": 3000,
      "extra_crockery": 1500
    },
    "total_final_amount": 304000,
    "amount_paid": 302500,
    "final_settlement": 1500,
    "settled_date": "2026-05-17"
  }
}
```

---

### Stage 10: **FEEDBACK & FOLLOW-UP** (Status: `feedback_pending` → `closed`)
**Goal:** Gather feedback, request for testimonials

**Responsible Roles:**
- **Sales Executive** — sends feedback form & thank you note
- **Franchise Admin** — monitors overall satisfaction

**Data Added to `leads` document:**
```json
{
  "status": "closed",
  "feedback": {
    "feedback_date": "2026-05-18",
    "customer_rating": 4.8,
    "food_rating": 5,
    "ambiance_rating": 4.5,
    "service_rating": 4.8,
    "feedback_text": "Amazing event! Food was authentic, service was prompt. Will recommend to friends.",
    "permission_for_testimonial": true,
    "repeat_booking": true
  },
  "lead_closed_date": "2026-05-18T10:00:00Z",
  "lifetime_value": 304000
}
```

---

## Role-Based Permissions & Responsibilities

| Role | Stages | Permissions |
|------|--------|-------------|
| **Receptionist** | 1 (Capture) | View leads, log follow-ups, enter basic info |
| **Sales Executive** | 1-4 (Capture → Menu) | Create/update leads, assign follow-ups, conduct tours |
| **Branch Manager** | 2-9 (Full access) | Approve quotes, negotiate, supervise all stages |
| **Kitchen Manager** | 3-8 (Tasting → Event) | Propose menus, customize, finalize head count |
| **Operations Staff** | 6-8 (Setup → Event) | Arrange logistics, setup/teardown, guest management |
| **Accountant** | 4-9 (Menu → Settlement) | Generate quotes, track payments, final settlement |
| **Franchise Admin** | 1-10 (All stages) | Approve large deals, monitor KPIs, handle escalations |
| **Super Admin** | 1-10 (All franchises) | Cross-franchise reporting, pricing policies |

---

## Key Workflows by Role

### Sales Executive's Day
```
Morning:
  1. Check "New" leads assigned yesterday
  2. Call customers → log follow-ups
  3. Schedule property visits for qualified leads
  
Mid-day:
  1. Conduct hall tour for 10:00 AM lead
  2. Update lead status to "visited"
  3. Share quote with customer
  
Evening:
  1. Follow up with pending decisions
  2. Schedule food tasting for interested leads
  3. Add notes for Kitchen Manager if tasting approved
```

### Kitchen Manager's Day
```
Morning:
  1. Check leads in "tasting_scheduled" status
  2. Prepare 3-5 signature dishes by noon
  3. Brief operations staff on ingredients/presentation
  
Mid-day:
  1. Conduct food tasting with customer + Sales Exec
  2. Record ratings and feedback
  3. Propose menu customizations if needed
  
Evening:
  1. Generate final cost per plate
  2. Send menu details to accountant for quote generation
  3. Plan 3 days before event: confirm head count, finalize orders
```

### Accountant's Day
```
Morning:
  1. Check leads with "quote" ready
  2. Generate detailed invoices
  3. Send payment reminders for due dates
  
Mid-day:
  1. Track incoming payments
  2. Update payment status
  3. Confirm with Branch Manager for events within 7 days
  
Evening:
  1. Post-event: calculate final settlement
  2. Process refunds or collect extra charges
  3. Generate event profit/loss report
```

---

## Lead Status Pipeline

```
NEW 
  ↓ (Sales Rep qualifies)
VISITED 
  ↓ (Customer interested in tasting)
TASTING_SCHEDULED 
  ↓ 
TASTING_DONE 
  ↓ (Customer chose menu)
MENU_SELECTED 
  ↓ (Quote sent)
ADVANCE_PAID 
  ↓ (30-50% received)
DECORATION_SCHEDULED 
  ↓ 
FULL_PAYMENT_PENDING 
  ↓ (Remaining payment)
PAID 
  ↓ (Event locked)
IN_PROGRESS 
  ↓ (Event happening)
COMPLETED 
  ↓ (Event finished)
SETTLEMENT_PENDING 
  ↓ 
SETTLEMENT_COMPLETE 
  ↓ 
FEEDBACK_PENDING 
  ↓ 
CLOSED ✅ 
  (Lost if customer declines at any stage)
```

---

## Firebase Collections for Lead Management

```
leads/
  ├── LEAD_PFDKW_001/
  │   ├── franchise_id: "pfd"
  │   ├── branch_id: "pfd_b1"
  │   ├── status: "closed"
  │   ├── customer_name, phone, email
  │   ├── event_type, event_date, guest_count
  │   ├── assigned_to_uid
  │   ├── follow_ups: [...]
  │   ├── visited: {...}
  │   ├── food_tasting: {...}
  │   ├── menu_finalization: {...}
  │   ├── quote: {...}
  │   ├── booking_confirmed: {...}
  │   ├── event_execution: {...}
  │   ├── post_event_settlement: {...}
  │   └── feedback: {...}
  │
  └── LEAD_PFDKW_002/
      └── [Similar structure]
```

---

## Real-Life Example: Rajesh Sharma's Wedding

**Timeline:** Feb 28 → May 15

| Date | Stage | Actor | Action | Lead Status |
|------|-------|-------|--------|---|
| 2/28 | Call | Receptionist | Capture details | **NEW** |
| 3/1 | Tour | Sales Exec | Hall visit | **VISITED** |
| 3/5 | Tasting | Kitchen Mgr | Food tasting session | **TASTING_DONE** |
| 3/8 | Menu | Kitchen Mgr | Finalize menu | **MENU_SELECTED** |
| 3/10 | Quote | Accountant | Send quote, advance collected | **ADVANCE_PAID** |
| 5/7 | Payment | Accountant | Full payment received | **PAID** |
| 5/14 | Setup | Operations | Decor + setup | **DECORATION_SCHEDULED** |
| 5/15 | Event | Branch Mgr | Wedding execution | **IN_PROGRESS** → **COMPLETED** |
| 5/16 | Settlement | Accountant | Final bills settled | **SETTLEMENT_COMPLETE** |
| 5/18 | Feedback | Sales Exec | Customer review collected | **CLOSED** |

**Revenue Generated: ₹304,000** 💰

---

This is how a lead flows through your BanquetEase system at Prasad Food Divine!
