# BanquetEase — Complete End-to-End Flow Guide

> How data flows from lead capture to event completion, billing, and settlement.
> Includes role-based navigation so each user knows exactly where to go.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Lead Pipeline (12 Stages)](#2-lead-pipeline-12-stages)
3. [Automatic Booking & Invoice Creation](#3-automatic-booking--invoice-creation)
4. [Booking Management](#4-booking-management)
5. [Calendar & Availability](#5-calendar--availability)
6. [Billing & Invoices](#6-billing--invoices)
7. [Payments](#7-payments)
8. [Role-Based Navigation Guide](#8-role-based-navigation-guide)
9. [API Reference Summary](#9-api-reference-summary)
10. [Firestore Collections](#10-firestore-collections)

---

## 1. System Overview

```
┌───────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────┐
│  LEAD     │────▶│   BOOKING    │────▶│  INVOICE   │────▶│ PAYMENT  │
│  Pipeline │     │  (auto at    │     │  (auto at  │     │ Tracking │
│  12 stages│     │  Stage 5)    │     │  Stage 5)  │     │          │
└───────────┘     └──────────────┘     └────────────┘     └──────────┘
                        │                                       │
                        ▼                                       ▼
                 ┌──────────────┐                       ┌──────────────┐
                 │   CALENDAR   │                       │   BILLING    │
                 │  (bookings)  │                       │   Dashboard  │
                 └──────────────┘                       └──────────────┘
```

**Tech Stack:** Next.js 16 + Firebase/Firestore + Firebase Admin SDK  
**Default IDs:** franchise_id = `pfd`, branch_id = `pfd_b1`

---

## 2. Lead Pipeline (12 Stages)

Each lead progresses through these statuses. The API is the **source of truth** for status names.

| # | Status | Stage Name | Who Does It | UI Action Button |
|---|--------|-----------|-------------|------------------|
| 1 | `new` | New Enquiry | Receptionist / Sales | — (created via form) |
| 2 | `visited` | Property Visit | Sales / Branch Manager | "Log Visit" |
| 3 | `tasting_scheduled` | Tasting Scheduled | Kitchen Manager / Sales | "Schedule Tasting" |
| 4 | `tasting_done` | Tasting Complete | Kitchen Manager / Sales | "Complete Tasting" |
| 5 | `menu_selected` | Menu & Quote | Kitchen / Sales / Accountant | "Finalize Menu" |
| 6 | `advance_paid` | Advance Paid | Accountant / Receptionist | "Record Advance" |
| 7 | `decoration_scheduled` | Decoration & Event | Operations / Branch Manager | "Finalize Decoration" |
| 8 | `paid` | Full Payment | Accountant / Branch Manager | "Record Full Payment" |
| 9 | `in_progress` | Event Running | Operations / Kitchen | "Start Event" |
| 10 | `completed` | Event Completed | Branch Manager / Operations | "Complete Event" |
| 11 | `settlement_complete` | Post-Event Settlement | Accountant / Operations | "Settle Event" |
| 12 | `closed` | Closed & Feedback | Sales / Receptionist | "Close Lead" |

**Special statuses:** `lost` (any stage), `on_hold` (any stage), reactivation back to previous status.

### How to Enter Data (Step by Step)

#### Step 1: Create a Lead
1. Navigate to **Leads → Create New Lead** (`/leads/create`)
2. Fill in: Customer Name, Phone, Email, Event Type, Event Date, Expected Guest Count, Hall preference
3. Click **Save** — lead is created with status `new`

#### Step 2: Log Property Visit
1. Go to **Leads → click the lead** (`/leads/[id]`)
2. Click **"Log Visit"** button (visible when status is `new`)
3. Fill in: Visit Date, Hall visited, Notes, Customer Rating
4. Submit → status moves to `visited`

#### Step 3: Schedule Food Tasting
1. On the lead detail page, click **"Schedule Tasting"**
2. Fill in: Tasting Date, Menu options to present
3. Submit → status moves to `tasting_scheduled`

#### Step 4: Complete Food Tasting
1. Click **"Complete Tasting"**
2. Fill in: Dishes sampled, Customer feedback, Preferred menu, Kitchen manager
3. Submit → status moves to `tasting_done`

#### Step 5: Finalize Menu & Generate Quote
1. Click **"Finalize Menu"**
2. Fill in: Menu name, Per plate cost, Expected plates, Hall rent, Food cost, Decor estimate, Valid till
3. System auto-calculates total quote
4. Submit → status moves to `menu_selected`

#### Step 6: Record Advance Payment ⭐
1. Click **"Record Advance"**
2. Fill in: Advance Amount, Payment Date, Payment Mode (cash/upi/bank_transfer/cheque/card), Transaction Ref
3. Submit → status moves to `advance_paid`
4. **🔄 AUTOMATIC:** System creates a **Booking** document AND an **Invoice** document
   - Booking copies all lead data (customer, event, menu, decor, payments)
   - Invoice auto-generates line items (food, hall rent, decoration) with 18% GST
   - Both are linked back to the lead via `booking_id` and `invoice_id`

#### Step 7: Finalize Decoration & Event
1. Click **"Finalize Decoration"**
2. Fill in: Final guest count, Decor theme, Decor partner, Decor cost, Setup/teardown dates, Special requests
3. Submit → status moves to `decoration_scheduled`

#### Step 8: Record Full Payment
1. Click **"Record Full Payment"**
2. Fill in: Remaining Amount, Payment Date, Payment Mode, Transaction Ref
3. Submit → status moves to `paid`, event is **locked**

#### Step 9: Start Event
1. Click **"Start Event"** on event day
2. Submit → status moves to `in_progress`

#### Step 10: Complete Event
1. Click **"Complete Event"**
2. Fill in: Actual guest count, Start/end time, Problems encountered, Staff feedback
3. Submit → status moves to `completed`

#### Step 11: Post-Event Settlement
1. Click **"Settle Event"**
2. Fill in: Final guest count, Plates served, Leftover refund, Extra charges, Total final amount
3. Submit → status moves to `settlement_complete`

#### Step 12: Close Lead
1. Click **"Close Lead"**
2. Fill in: Customer rating (1-5), Food/Ambiance/Service ratings, Feedback text, Testimonial permission
3. Submit → status moves to `closed`, lifetime value calculated

---

## 3. Automatic Booking & Invoice Creation

When a lead reaches **Stage 6 (Record Advance)**, the system automatically:

```
Lead (advance_paid) ──▶ Booking (confirmed) ──▶ Invoice (sent/paid)
```

### What Gets Created

**Booking Document:**
- Customer info (name, phone, email)
- Event details (type, date, time, hall, guest count)
- Menu (name, per plate cost, plates, total)
- Decor (theme, partner, cost)
- Payments (quote total, advance amount, balance due, payment history)
- Status: `confirmed`
- Empty checklist, vendors, staff arrays (ready to populate)

**Invoice Document:**
- Auto-generated invoice number (INV-01001, INV-01002, ...)
- Line items: Food, Hall Rent, Decoration (auto-calculated from lead data)
- Tax: 18% GST on subtotal
- Amount paid: advance amount carried forward
- Balance due: total - advance
- Status: `sent` (or `paid` if advance covers full amount)

### Manual Booking Creation
You can also create bookings independently:
1. Go to **Bookings → Create** (`/bookings/create`)
2. Or from a lead detail page with `?lead_id=xxx` to auto-fill from lead data
3. The system checks for **hall + date conflicts** (returns 409 if double-booked)

---

## 4. Booking Management

### Booking List (`/bookings`)
- Tabs: All, Confirmed, In Progress, Completed, Cancelled
- KPIs: Confirmed count, Running events, Total revenue, Outstanding balance
- Search by customer name
- Click any row → booking detail page

### Booking Detail (`/bookings/[id]`)
Five tabs:

| Tab | Actions Available |
|-----|-------------------|
| **Overview** | Customer info, event details, menu, decoration |
| **Payments** | View payment history, Record new payment |
| **Checklist** | Add/toggle/remove event preparation checklist items |
| **Vendors** | Add/remove vendors (caterer, decorator, DJ, etc.) |
| **Staff** | Assign/remove staff members to the event |

**Status Actions:**
- "Start Event" → changes to `in_progress`
- "Complete Event" → changes to `completed`
- "Create Invoice" → generates invoice from booking data (if no auto-invoice exists)

---

## 5. Calendar & Availability

### Calendar View (`/calendar`)
- Monthly grid showing all bookings by event date
- Color-coded by status:
  - 🔵 Blue = Confirmed
  - 🟡 Yellow = In Progress
  - 🟢 Green = Completed
  - 🔴 Red = Cancelled
- Click any date cell → navigates to booking detail
- Upcoming Events section shows next 10 events with urgency (Today, Tomorrow, X days)
- KPIs: Events this month, Confirmed, Running, Halls booked

### Conflict Prevention
The booking API automatically prevents double-booking:
- Same hall + same date + active status (confirmed/in_progress) = **409 Conflict**
- Applies to both creation and event detail updates

---

## 6. Billing & Invoices

### Invoice List (`/billing`)
- Tabs: All, Draft, Unpaid (sent + partially_paid + overdue), Paid, Cancelled
- KPIs: Total revenue, Outstanding, Overdue count
- Columns: Invoice #, Customer, Date, Total, Paid, Balance, Due Date, Status
- Click row → invoice detail

### Invoice Detail (`/billing/[id]`)
- Summary card: Subtotal, Tax (18% GST), Discount, Total, Amount Paid, Balance Due
- Line items table with quantity, rate, amount
- Customer details section
- Payment history list (date, amount, mode, reference)
- **Actions:**
  - "Record Payment" — opens dialog for amount, date, mode, reference
  - "Mark Sent" — changes status from draft to sent
  - "Print" — browser print dialog

### Invoice Statuses
| Status | Meaning |
|--------|---------|
| `draft` | Not yet sent to customer |
| `sent` | Delivered to customer, awaiting payment |
| `partially_paid` | Some payment received, balance remaining |
| `paid` | Fully paid |
| `overdue` | Past due date, not fully paid |
| `cancelled` | Invoice voided |

---

## 7. Payments

### Payments Dashboard (`/payments`)
- Aggregates ALL payments from ALL invoices into a single chronological list
- KPIs: Total Collected, Total Outstanding, This Month's collections, Transaction Count
- Columns: Date, Customer, Invoice #, Amount, Mode, Type (advance/balance/payment)
- Click row → navigates to the parent invoice detail

---

## 8. Role-Based Navigation Guide

### 🔑 Super Admin / Franchise Admin
**Dashboard:** `/dashboard/franchise` or `/dashboard/platform`
**What they can do:**
- View all leads, bookings, invoices across branches
- Override lead status (status_change action)
- Put leads on hold / reactivate
- View analytics, audit logs
- Manage franchises, branches, settings

**Navigation:**
1. Dashboard → overview KPIs
2. Leads → full pipeline view
3. Bookings → all branch bookings
4. Billing → all invoices
5. Calendar → availability overview
6. Analytics → revenue, conversion, and more

---

### 🏢 Branch Manager
**Dashboard:** `/dashboard/branch`
**What they can do:**
- All lead actions (log visit, record advance, close lead, etc.)
- Manage bookings (checklist, vendors, staff, status)
- View/manage billing
- Override statuses, put on hold, reactivate
- Staff management

**Key workflows:**
1. **Morning:** Check Calendar → today's events → Bookings detail for prep status
2. **During day:** Leads list → follow up on active leads → progress them
3. **Event day:** Booking detail → Start Event → manage checklist
4. **Post-event:** Complete Event → Settle → Close Lead
5. **Weekly:** Billing → review outstanding → follow up on payments

---

### 💼 Sales Executive
**Dashboard:** `/dashboard/sales_executive`
**What they can do:**
- Create leads, log visits, schedule tastings
- Add follow-ups (calls, WhatsApp, visits)
- Record advance payments
- Close leads with feedback
- Mark leads as lost

**Key workflow:**
1. Create lead from enquiry → Log visit after showing hall
2. Schedule tasting with kitchen → Follow up after tasting
3. Help customer finalize menu → Record advance when paid
4. Continue follow-ups until event → Close lead with feedback

---

### 🧑‍🍳 Kitchen Manager
**Dashboard:** Role uses branch dashboard
**What they can do:**
- Schedule and complete food tastings
- Finalize menus with pricing
- Start events (kitchen side)
- Complete events

**Key workflow:**
1. Leads list → filter `tasting_scheduled` → prepare for tastings
2. Complete tasting → record dish ratings + preferred menu
3. Leads in `tasting_done` → help finalize menu & quote
4. Event day → Start Event from booking detail

---

### 🎛️ Operations Staff
**Dashboard:** Role uses branch dashboard
**What they can do:**
- Finalize decoration & event details
- Start and complete events
- Manage booking checklists, vendors, staff
- Post-event settlement

**Key workflow:**
1. Bookings → filter `confirmed` → prepare checklists
2. Add vendors (decorator, DJ, photographer) to bookings
3. Assign staff to upcoming events
4. Event day → manage checklist → complete event
5. Post-event → settle with accountant

---

### 💰 Accountant
**Dashboard:** Role uses branch dashboard
**What they can do:**
- Record advance payments (auto-creates booking + invoice)
- Record full payments
- Post-event settlement
- Manage invoices (create, edit, record payments)
- View payment dashboard

**Key workflow:**
1. Leads → filter `menu_selected` → record advance payments
2. Billing → review draft invoices → send to customers
3. Billing → record incoming payments
4. Payments dashboard → track collections
5. Post-event → settle with operations team

---

### 📱 Receptionist
**Dashboard:** `/dashboard/receptionist`
**What they can do:**
- Create new leads (customer walks in / calls)
- Record advance payments
- Add follow-ups
- Close leads

**Key workflow:**
1. New enquiry → Create Lead with customer details
2. Walk-in payment → Record Advance on lead
3. Log follow-ups after customer calls/visits

---

### 🎨 Decorator
**Dashboard:** `/dashboard/decorator`
**What they can do:**
- View bookings assigned to them
- Check event decoration requirements
- View calendar for upcoming events

---

### 👤 Customer
**Dashboard:** `/dashboard/customer`
**What they can do:**
- View their booking details
- View their invoice
- See event status and timeline

---

## 9. API Reference Summary

### Lead APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads?franchise_id=pfd&branch_id=pfd_b1` | List leads (with filters) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/[id]?franchise_id=pfd&branch_id=pfd_b1` | Get lead + activities + follow-ups |
| PUT | `/api/leads/[id]` | Action-based updates (16 actions) |
| DELETE | `/api/leads/[id]` | Delete lead |

**PUT Actions:** `log_visit`, `schedule_tasting`, `complete_tasting`, `finalize_menu`, `record_advance`, `finalize_decoration`, `record_full_payment`, `start_event`, `complete_event`, `settle_event`, `close_lead`, `reactivate`, `add_followup`, `mark_lost`, `put_on_hold`, `status_change`

### Booking APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/bookings?franchise_id=pfd&branch_id=pfd_b1` | List bookings |
| POST | `/api/bookings` | Create booking (from lead or standalone) |
| GET | `/api/bookings/[id]` | Get booking detail |
| PUT | `/api/bookings/[id]` | Action-based updates (10 actions) |

**PUT Actions:** `add_payment`, `update_status`, `add_checklist_item`, `toggle_checklist`, `remove_checklist_item`, `add_vendor`, `remove_vendor`, `assign_staff`, `remove_staff`, `update_event`, `update_fields`

### Billing APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/billing?franchise_id=pfd&branch_id=pfd_b1` | List invoices |
| POST | `/api/billing` | Create invoice (from booking or standalone) |
| GET | `/api/billing/[id]` | Get invoice detail |
| PUT | `/api/billing/[id]` | Action-based updates (5 actions) |

**PUT Actions:** `add_payment`, `update_status`, `update_line_items`, `update_fields`, `send`

---

## 10. Firestore Collections

### `leads`
Primary collection for the lead pipeline. Contains all stage data as nested objects:
- `visited{}`, `food_tasting{}`, `menu_finalization{}`, `quote{}`
- `booking_confirmed{}`, `event_finalization{}`, `final_payment{}`
- `event_execution{}`, `post_event_settlement{}`, `feedback{}`
- `status_history[]`, `booking_id`, `invoice_id`

### `lead_activities`
Activity log for every action on a lead.
- `lead_id`, `activity_type`, `description`, `performed_by_uid/name`, `metadata`, `created_at`

### `follow_ups`
Follow-up entries (calls, visits, WhatsApp).
- `lead_id`, `scheduled_date`, `followup_type`, `outcome`, `call_duration_mins`

### `bookings`
Confirmed event bookings (auto-created at advance payment or manually).
- `lead_id`, customer/event/hall info, `menu{}`, `decor{}`
- `payments{ quote_total, advance_amount, total_paid, balance_due, payment_history[] }`
- `status` (confirmed/in_progress/completed/cancelled)
- `checklist[]`, `vendors[]`, `staff_assigned[]`

### `invoices`
Financial invoices with line items and payment tracking.
- `invoice_number` (INV-01001), `booking_id`, `lead_id`
- `line_items[]`, `subtotal`, `tax_rate`, `tax_amount`, `discount`, `total`
- `amount_paid`, `balance_due`, `payment_history[]`
- `status` (draft/sent/paid/partially_paid/overdue/cancelled)

### `audit_logs`
Financial audit trail for advance payments, full payments, lost leads, closures.
- `entity_type`, `entity_id`, `action`, `details{}`, `performed_by_uid/name`

---

## Quick Start Checklist

1. ✅ Log in as a **sales_executive** or **receptionist**
2. ✅ Go to `/leads/create` → create a new lead
3. ✅ Progress through stages (visit → tasting → menu → advance)
4. ✅ At **Record Advance** → booking + invoice auto-created
5. ✅ Check `/bookings` → your booking appears
6. ✅ Check `/billing` → your invoice appears
7. ✅ Check `/calendar` → event date is on the calendar
8. ✅ Continue: decoration → full payment → start → complete → settle → close
9. ✅ Check `/payments` → all payments are tracked
