# 🏛️ Banquet Management System (BMS)
### Master Technical & Product Reference — v3.0.0

**Platform Owner:** Coding Gurus  
**Primary Client / Franchise:** Prasad Food Divine (PFD)  
**Tech Stack:** React (Vite) + Tailwind CSS · Firebase Firestore · Firebase Auth · Cloudinary · Resend · WATI · OneSignal · Google Gemini API · jsPDF · Vercel Edge Functions

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Organizational Hierarchy](#2-organizational-hierarchy)
3. [Roles & Permissions (RBAC)](#3-roles--permissions-rbac)
4. [Role Dashboards & Sidebars](#4-role-dashboards--sidebars)
5. [All Pages — Detailed Descriptions](#5-all-pages--detailed-descriptions)
6. [All Forms — Complete Field Definitions](#6-all-forms--complete-field-definitions)
7. [Lead Tracking — Full Lifecycle](#7-lead-tracking--full-lifecycle)
8. [Dynamic Pricing Engine](#8-dynamic-pricing-engine)
9. [Decor Choosing & Vendor Module](#9-decor-choosing--vendor-module)
10. [Review Management System](#10-review-management-system)
11. [Database — Collection Structure](#11-database--collection-structure)
12. [Database — Schema Definitions](#12-database--schema-definitions)
13. [Firebase Security Rules](#13-firebase-security-rules)
14. [Firestore Indexes](#14-firestore-indexes)
15. [AI-Based Features](#15-ai-based-features)
16. [API Integrations](#16-api-integrations)
17. [Notifications — Push, WhatsApp, Email](#17-notifications--push-whatsapp-email)
18. [Client-Side Write Patterns](#18-client-side-write-patterns)
19. [Cloudinary Storage Design](#19-cloudinary-storage-design)
20. [Firebase Auth & Temporary Staff](#20-firebase-auth--temporary-staff)
21. [Franchise Onboarding Flow](#21-franchise-onboarding-flow)
22. [Data Lifecycle & Retention](#22-data-lifecycle--retention)
23. [Environment Variables](#23-environment-variables)
24. [Firebase Free Tier Feasibility](#24-firebase-free-tier-feasibility)
25. [Scaling Path](#25-scaling-path)

---

## 1. System Overview

The Banquet Management System (BMS) is a **multi-franchise, multi-branch** venue and event management platform built for **Coding Gurus** — a software platform company that licenses the system to banquet hall businesses. **Prasad Food Divine (PFD)** is the first and primary franchise onboarded onto the platform.

### 1.1 What the System Does

| Module | Description |
|---|---|
| **Lead Management** | Capture enquiries from 22+ sources, track through a 12-stage lifecycle, score with AI, follow up, convert to bookings |
| **Booking Management** | Confirm hall bookings, manage advance payments, track balance dues, prevent double-bookings |
| **Event Management** | Day-of event execution with checklists, staff assignments, vendor coordination |
| **Calendar & Availability** | Visual hall occupancy calendar with conflict prevention |
| **Billing & Payments** | Invoice generation, payment collection, outstanding tracking |
| **Kitchen & Inventory** | Raw material stock, purchase orders, low stock alerts, auto-deduction from menus |
| **Staff Management** | Permanent and temporary (24-hour) staff with branch-scoped access |
| **Vendor Management** | Decorator, photographer, AV vendor registry, panel management, settlement tracking |
| **Decor Choosing** | Client-facing decor package selection with visual previews and cost estimation |
| **Dynamic Pricing** | Festival, season, day-of-week based pricing engine |
| **Analytics & Reports** | Revenue, occupancy, lead funnel, event type breakdown with export |
| **AI Features** | Lead scoring, follow-up suggestions, revenue forecasting, proposal generation, chatbot |
| **Review Management** | Centralized review collection, sentiment analysis, auto-response, staff tagging |
| **Notifications** | Push (OneSignal), WhatsApp (WATI), Email (Resend) across all key events |

### 1.2 Key Design Decisions

| Decision | Rationale |
|---|---|
| Firebase Spark (free tier) | Full implementation of 1 franchise within free limits |
| No Cloud Functions | Not available on Spark plan — replaced by client-side `writeBatch()` |
| Flat Firestore collections | Enables cross-parent compound queries impossible with pure subcollections |
| Denormalized snapshots | Eliminates join reads — every doc is self-sufficient for display |
| Pre-aggregated `_stats` docs | Dashboard loads in 1 Firestore read — never scans children |
| Staff scoped to Branch | Staff are assigned to branches, not individual halls, for simpler RBAC |
| Gemini AI (free tier) | 15 req/min, 1M tokens/day — sufficient for this scale |
| OneSignal push | Free unlimited push for up to 10,000 subscribers |
| Client-side PDF (jsPDF) | Avoids Cloud Functions for invoice/receipt/proposal generation |
| Vercel Edge (free) | Only used for setting Firebase Auth custom claims on user creation |

---

## 2. Organizational Hierarchy

The system uses a strict **4-level hierarchy**. Every data record carries `franchise_id` and `branch_id` for scoping.

```
Level 1 — Platform
└── Coding Gurus (Super Admin)
    │   Manages: All franchises, global settings, global reports
    │
    Level 2 — Franchise
    ├── Prasad Food Divine (PFD) ← Primary franchise
    │   │   Managed by: Franchise Admin
    │   │   Controls: All PFD branches, franchise reports, settings
    │   │
    │   Level 3 — Branch
    │   ├── Banjara Hills Branch
    │   │   └── Halls: Grand Ballroom (cap 500), Open Air Lawn (cap 800)
    │   ├── Kukatpally Branch
    │   │   └── Halls: Royal Hall (cap 300), Rooftop Terrace (cap 150)
    │   └── (Future branches...)
    │
    ├── PFD Pune Franchise (future)
    └── PFD Bangalore Franchise (future)
```

### 2.1 Hierarchy Rules

- A **Super Admin** can see and manage everything across all franchises
- A **Franchise Admin** can only see data within their own franchise — never another franchise's data
- A **Branch Manager** and below can only see data within their assigned branch
- Every Firestore query enforces scope server-side via Security Rules — never trust client-side filters
- Hall-level granularity exists for availability/pricing only — staff are **not** assigned to halls, only to branches

---

## 3. Roles & Permissions (RBAC)

### 3.1 Role Definitions

| Role ID | Display Name | Scope | Description |
|---|---|---|---|
| `super_admin` | Super Admin | Global | Coding Gurus platform owner. Full access to all franchises, branches, data, global settings |
| `franchise_admin` | Franchise Admin | Franchise | Manages all branches under their franchise. Cannot see sibling franchises |
| `branch_manager` | Branch Manager | Branch | Full operational control of their assigned branch |
| `sales_executive` | Sales Executive | Branch | Lead management, bookings, follow-ups within branch |
| `kitchen_manager` | Kitchen / Catering Manager | Branch | Menus, raw materials, kitchen ops within branch |
| `accountant` | Accountant | Branch | Billing, payments, financial reports within branch |
| `operations_staff` | Operations Staff | Branch | Event checklists, vendor coordination within branch |
| `receptionist` | Receptionist | Branch | Lead capture and enquiry handling only |

### 3.2 RBAC Matrix

`C=Create R=Read U=Update D=Delete X=No Access`
`[G]=Global [F]=Own Franchise Only [B]=Own Branch Only`

| Module | super_admin | franchise_admin | branch_manager | sales_exec | kitchen_mgr | accountant | ops_staff | receptionist |
|---|---|---|---|---|---|---|---|---|
| Platform Dashboard | CRUD[G] | X | X | X | X | X | X | X |
| Franchise Dashboard | CRUD[G] | R[F] | X | X | X | X | X | X |
| Branch Dashboard | CRUD[G] | R[F] | R[B] | R[B] | R[B] | R[B] | R[B] | X |
| Franchises | CRUD[G] | R[F] | X | X | X | X | X | X |
| Branches | CRUD[G] | CRUD[F] | R[B] | X | X | X | X | X |
| Halls | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | R[B] | R[B] | R[B] | X |
| Leads | CRUD[G] | R[F] | CRUD[B] | CRUD[B] | R[B] | R[B] | R[B] | CR[B] |
| Follow-ups | CRUD[G] | R[F] | CRUD[B] | CRUD[B] | X | X | X | CR[B] |
| Bookings | CRUD[G] | R[F] | CRUD[B] | CRU[B] | R[B] | R[B] | R[B] | R[B] |
| Calendar | CRUD[G] | R[F] | CRUD[B] | R[B] | R[B] | R[B] | R[B] | R[B] |
| Events | CRUD[G] | R[F] | CRUD[B] | CRU[B] | RU[B] | R[B] | CRUD[B] | R[B] |
| Menus | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | CRUD[B] | R[B] | R[B] | R[B] |
| Vendors | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | CRU[B] | R[B] | CRUD[B] | X |
| Decor Packages | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | X | R[B] | CRU[B] | X |
| Billing / Invoices | CRUD[G] | R[F] | CRUD[B] | R[B] | X | CRUD[B] | X | X |
| Payments | CRUD[G] | R[F] | CRUD[B] | R[B] | X | CRUD[B] | X | X |
| Raw Materials | CRUD[G] | R[F] | CRUD[B] | X | CRUD[B] | R[B] | R[B] | X |
| Purchase Orders | CRUD[G] | R[F] | CRUD[B] | X | CRU[B] | CRUD[B] | X | X |
| Dynamic Pricing | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | X | R[B] | X | X |
| Reports — Global | CRUD[G] | X | X | X | X | X | X | X |
| Reports — Franchise | CRUD[G] | R[F] | X | X | X | X | X | X |
| Reports — Branch | CRUD[G] | R[F] | R[B] | R[B] | R[B] | R[B] | X | X |
| Users / Staff | CRUD[G] | CRUD[F] | CRU[B] | X | X | X | X | X |
| Settings — Global | CRUD[G] | X | X | X | X | X | X | X |
| Settings — Franchise | CRUD[G] | RU[F] | X | X | X | X | X | X |
| Settings — Branch | CRUD[G] | RU[F] | RU[B] | X | X | X | X | X |
| Audit Logs | CRUD[G] | R[F] | X | X | X | X | X | X |
| AI Insights | CRUD[G] | R[F] | R[B] | R[B] | X | X | X | X |
| Reviews | CRUD[G] | CRUD[F] | CRUD[B] | R[B] | X | X | X | X |

### 3.3 Post-Login Redirects

| Role | Redirect After Login |
|---|---|
| `super_admin` | `/dashboard/platform` |
| `franchise_admin` | `/dashboard/franchise` |
| All branch roles | `/dashboard/branch` |

---

## 4. Role Dashboards & Sidebars

### 4.1 Super Admin

**Post-login redirect:** `/dashboard/platform`

**Sidebar Navigation:**
```
⬡  Platform Dashboard        /dashboard/platform
🏢  Franchises                /franchises
🏪  Branches                  /branches
👥  Users & Staff             /users
📊  Analytics                 /analytics
🔍  Audit Logs                /audit-logs
⚙   Global Settings           /settings/global
```

**Dashboard KPIs:**
- Total Franchises (count badge)
- Total Branches (count badge)
- Total Revenue MTD / YTD (toggle)
- Total Bookings MTD
- Global Lead Conversion Rate (%)
- Total Outstanding Dues (red alert if > 0)

**Dashboard Charts:**
- Franchise-wise Revenue (bar chart)
- Monthly Revenue Trend — last 6 months (line chart)
- Lead Funnel — global (horizontal funnel)
- Occupancy Heatmap — all branches

**Dashboard Lists:**
- Events This Week (all branches)
- Top Franchises by Revenue
- Recent Bookings (all)

**Filters:** Date Range picker, Franchise multi-select  
**Export:** CSV, Excel, PDF for all widgets

---

### 4.2 Franchise Admin

**Post-login redirect:** `/dashboard/franchise`

**Sidebar Navigation:**
```
⬡  Franchise Dashboard        /dashboard/franchise
🏪  Branches                   /branches
🎯  Leads                      /leads
📋  Bookings                   /bookings
👥  Staff                      /staff
📦  Inventory (view)           /inventory
🍽   Menus                      /menus
🤝  Vendors                    /vendors
📊  Analytics                  /analytics
💬  Reviews                    /reviews
⚙   Franchise Settings         /settings/franchise
```

**Dashboard KPIs:**
- Branches in Franchise
- Franchise Revenue MTD / YTD
- Total Bookings
- Outstanding Dues (red alert)
- Lead Conversion Rate
- Total Open Leads

**Dashboard Charts:**
- Branch-wise Revenue (bar)
- Branch-wise Occupancy (bar)
- Lead Pipeline by Branch (stacked bar)
- Monthly Trend (line)

**Filters:** Date Range, Branch multi-select  
**Export:** CSV, Excel

---

### 4.3 Branch Manager

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Branch Dashboard           /dashboard/branch
🎯  Leads                      /leads
📋  Bookings                   /bookings
🎉  Events                     /events
📅  Calendar                   /calendar
🍽   Menus                      /menus
🎨  Decor Packages             /decor
🤝  Vendors                    /vendors
💰  Billing                    /billing
💳  Payments                   /payments
📦  Inventory                  /inventory
🛒  Purchase Orders            /purchase-orders
👥  Staff                      /staff
💲  Dynamic Pricing            /pricing
📊  Analytics                  /analytics
💬  Reviews                    /reviews
⚙   Branch Settings            /settings/branch
```

**Dashboard KPIs (all scoped to branch):**
- Today's Events (count + hall names)
- Pending Follow-ups (alert badge)
- Advance Collected MTD
- Pending Payments (red alert)
- New Leads This Week
- Low Stock Items (yellow alert)

**Dashboard Widgets:**
- Hall Occupancy This Month (progress bars per hall)
- Upcoming Events list (next 7 days)
- Overdue Follow-ups list (with client name + days overdue)
- AI Revenue Forecast card (30d / 60d / 90d)
- Recent Lead Activity feed
- Festival Pricing Alert (upcoming festivals with auto-pricing toggle)

---

### 4.4 Sales Executive

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Dashboard                  /dashboard/branch
🎯  Leads                      /leads
📋  Bookings                   /bookings
🎉  Events                     /events
📅  Calendar                   /calendar
📊  Analytics                  /analytics
```

**Dashboard Focus:**
- My Leads This Week (count)
- My Overdue Follow-ups (red alert)
- My Conversion Rate (%)
- Hot Leads (AI score > 75)
- Follow-up Schedule Today
- AI Suggested Actions list

---

### 4.5 Kitchen Manager

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Dashboard                  /dashboard/branch
🎉  Events                     /events
🍽   Menus                      /menus
📦  Inventory                  /inventory
🛒  Purchase Orders            /purchase-orders
🤝  Vendors (view + edit)      /vendors
```

**Dashboard Focus:**
- Events Today (guest count + menus)
- Low Stock Alerts (red)
- Pending Purchase Orders
- Inventory Stock Value
- Menu Utilization This Month

---

### 4.6 Accountant

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Dashboard                  /dashboard/branch
📋  Bookings (view)            /bookings
💰  Billing                    /billing
💳  Payments                   /payments
📊  Analytics                  /analytics
```

**Dashboard Focus:**
- Total Revenue MTD
- Outstanding Dues (red alert)
- Payments Received Today
- Overdue Invoices (list)
- Pending Balance Bookings

---

### 4.7 Operations Staff

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Dashboard                  /dashboard/branch
🎉  Events                     /events
🤝  Vendors                    /vendors
🎨  Decor Packages             /decor
```

**Dashboard Focus:**
- Events Today (with checklist progress bar)
- Checklist Items Due Today
- Vendor Assignments This Week
- Decor Packages Pending Confirmation

---

### 4.8 Receptionist

**Post-login redirect:** `/dashboard/branch`

**Sidebar Navigation:**
```
⬡  Dashboard (view only)      /dashboard/branch
🎯  Leads                      /leads
```

**Dashboard Focus:**
- My Created Leads Today
- Today's Scheduled Site Visits
- Upcoming Events (view only)

---

## 5. All Pages — Detailed Descriptions

### 5.1 `/login` — Login Page

**Access:** Public  
**Purpose:** Unified login for all roles. Post-login redirect is based on Auth custom claim `role`.

**Page Content:**
- Franchise logo (loaded from `user.display_config.logo_url` — zero extra reads)
- "Welcome back" headline with franchise name
- Email / Username field
- Password field with show/hide toggle
- Remember Me checkbox
- Login button
- Forgot Password link (triggers Firebase Auth reset email)
- On first-time login: force password change modal

**Behavior:**
- If `role = super_admin` → redirect `/dashboard/platform`
- If `role = franchise_admin` → redirect `/dashboard/franchise`
- All branch roles → redirect `/dashboard/branch`
- Temp staff: On load, checks `temp_access.access_expires`. If expired, shows "Your access has expired" toast and blocks login.

---

### 5.2 `/dashboard/platform` — Platform Dashboard

**Access:** `super_admin` only  
**Purpose:** Bird's-eye view of all franchises and branches on the platform.

**Page Content:**
- Header: "Platform Overview" + Last updated timestamp
- KPI row: Total Franchises · Total Branches · Total Revenue MTD/YTD · Total Bookings MTD · Global Conversion Rate · Total Outstanding Dues
- Chart section: Franchise-wise Revenue (bar) · Monthly Trend (line) · Global Lead Funnel (horizontal) · Occupancy Heatmap
- Events This Week table: Event name, Branch, Hall, Date, Guest Count, Status
- Top Franchises by Revenue: Ranked list with revenue bar
- Recent Bookings: Client, Branch, Event Type, Date, Amount
- Filters: Date Range picker, Franchise multi-select
- Export button: CSV / Excel / PDF

---

### 5.3 `/dashboard/franchise` — Franchise Dashboard

**Access:** `super_admin`, `franchise_admin`  
**Purpose:** KPI summary for all branches within the franchise.

**Page Content:**
- Header: Franchise name + logo
- KPI row: Branches · Franchise Revenue MTD/YTD · Total Bookings · Outstanding Dues · Lead Conversion Rate
- Charts: Branch-wise Revenue · Branch-wise Occupancy · Lead Pipeline by Branch · Monthly Trend
- Branch Performance table: Branch name, Bookings, Revenue, Occupancy %, Conversion Rate, Manager
- Filters: Date Range, Branch multi-select

---

### 5.4 `/dashboard/branch` — Branch Dashboard

**Access:** All roles except receptionist  
**Purpose:** Day-to-day operational overview for the branch.

**Page Content:**
- Header: Branch name + today's date
- KPI row (role-filtered): Today's Events · Pending Follow-ups · Advance Collected MTD · Pending Payments · New Leads This Week · Low Stock Items
- Hall Occupancy section: Progress bars showing occupancy % per hall for the month
- Upcoming Events list: Next 7 days with hall, time slot, guest count
- Overdue Follow-ups list: Client, Sales exec, days overdue, action button
- AI Revenue Forecast card: 30d / 60d / 90d predicted revenue with confidence score
- Recent Lead Activity feed: Real-time last 10 lead actions
- Festival Pricing Alerts: Upcoming festivals with one-click pricing activation

---

### 5.5 `/franchises` — Franchise Management

**Access:** `super_admin` only

**Sub-pages:**
- `/franchises` — List view
- `/franchises/create` — Create form
- `/franchises/:id` — Detail with tabs: Overview, Branches, Staff, Reports, Settings

**List View Columns:** Franchise ID · Name · City/Region · Admin · Branches · Revenue · Status · Actions

**Actions per row:** View, Edit, Disable, View Branches

**Detail Tabs:**
- **Overview:** Franchise info, admin contact, agreement dates, stats
- **Branches:** All branches list with quick stats
- **Staff:** All users across this franchise
- **Reports:** Franchise-level analytics
- **Settings:** Notification config, branding, tax settings

---

### 5.6 `/branches` — Branch Management

**Access:** `super_admin`, `franchise_admin`

**Sub-pages:**
- `/branches` — List (scoped to franchise for franchise_admin)
- `/branches/create` — Create form
- `/branches/:id` — Detail tabs: Overview, Halls, Staff, Reports, Settings

**List Columns:** Branch Name · Franchise · City · Halls · Bookings MTD · Revenue · Occupancy % · Manager · Status

**Detail Tabs:**
- **Overview:** Address, operating hours, financials, manager info
- **Halls:** Hall cards with images, capacity, pricing, availability status
- **Staff:** All staff of this branch with role + employment type
- **Reports:** Branch analytics
- **Settings:** Bank details, advance %, cancellation policy, notification config

---

### 5.7 `/leads` — Lead Management

**Access:** All roles (write varies)

**Sub-pages:**
- `/leads` — List with status filter tabs
- `/leads/create` — Create form
- `/leads/:id` — Lead detail with full timeline

**List View:**
- Status Filter Tabs: All · New · Contacted · Site Visit · Proposal · Hot · Warm · Cold · Converted · Lost · On Hold
- Columns: Lead ID · Client · Phone · Event Type · Preferred Date · Guests · Source · Status · AI Score · Assigned To · Created
- Sort Options: Date (newest) · AI Score (highest) · Followup Due (soonest)
- Quick Actions per row: Call · WhatsApp · View · Convert

**Lead Detail Page Tabs:**
- **Overview:** Client details, event requirements, budget, source, status badge, AI score panel
- **Activity Timeline:** Chronological log of all actions (calls, messages, visits, status changes)
- **Follow-ups:** Scheduled and completed follow-ups list + add new button
- **Proposal:** Generated proposal PDF preview, send history
- **Decor Preview:** Shortlisted decor packages for this lead
- **Notes:** Internal and client-visible notes
- **AI Panel:** Score badge (0–100), label (Hot/Warm/Cold), suggested action card, risk factors list, sentiment indicator, Re-score button

**Available Actions:**
- Convert to Booking
- Add Follow-up
- Schedule Site Visit
- Generate Proposal (AI-assisted)
- Mark Lost (with reason)
- Put On Hold (with date)
- Reassign to different exec

---

### 5.8 `/bookings` — Booking Management

**Access:** All roles (write varies)

**Sub-pages:**
- `/bookings` — List
- `/bookings/create` — Create form
- `/bookings/:id` — Detail with tabs

**List View Columns:** Booking ID · Client · Event Type · Hall · Date · Guests · Total · Advance · Balance · Status

**Status Filter Tabs:** All · Confirmed · Tentative · Completed · Cancelled

**Detail Tabs:**
- **Overview:** All booking info, client details, event details, hall, package, financials summary
- **Payments:** Payment history list + Record Payment button
- **Invoice:** Invoice preview with line items, PDF download/send options
- **Event Checklist:** Quick checklist progress view (links to `/events/:id`)
- **Decor:** Chosen decor package display

**Available Actions:** View Invoice · Record Payment · Generate Invoice · Convert to Event · Edit · Cancel Booking

---

### 5.9 `/events` — Event Management

**Access:** All roles (write varies)

**Sub-pages:**
- `/events` — List with date filter
- `/events/:id` — Event detail

**List View:** Event card showing event name, hall, date, guest count, checklist progress bar, assigned staff count, status badge

**Detail Page Tabs:**
- **Overview:** Event summary, client, hall, guests expected vs confirmed
- **Checklist:** All checklist items with category, assignee, due date, done/pending status. Progress bar at top. Add item button.
- **Staff Assignments:** Assigned staff list with role and responsibility. Add/remove staff.
- **Vendors:** Assigned vendors with service type and contracted amount. Add/remove vendors.
- **Decor:** Final chosen decor package with setup timeline
- **Notes:** Event-day special instructions

---

### 5.10 `/calendar` — Booking Calendar

**Access:** All roles

**View Modes:** Month · Week · Day

**Color Codes:**
- 🟢 Green = Confirmed booking
- 🟡 Yellow = Tentative booking
- 🔴 Red = Cancelled
- ⚫ Gray = Past events
- 🟠 Orange = Festival / Peak pricing active

**Interactions:**
- Click on day → Sidebar shows all bookings for that day
- Click on booking → Opens booking detail modal
- Hall Filter dropdown → View by specific hall or all halls
- Drag & Drop → Branch manager can reschedule tentative bookings
- Festival Overlay → Highlights upcoming festival dates with pricing multiplier badge

---

### 5.11 `/menus` — Menu Management

**Access:** All roles (write: super_admin, franchise_admin, branch_manager, kitchen_manager)

**Sub-pages:** List · Create · Edit · `/menus/:id`

**List Columns:** Menu Name · Type (Veg/Non-Veg/Mixed/Jain) · Price/Plate · Min Plates · Applicable To · Status

**Detail Page:**
- Full course breakdown with edit-in-place: Starters · Main Course · Breads · Rice · Desserts · Beverages · Live Counters · Salads
- Applied-to bookings history
- Cost analysis: Raw material cost vs price per plate (margin %)
- Customization toggle: Allow per-booking modification

---

### 5.12 `/decor` — Decor Packages & Choosing

**Access:** All roles (write varies; clients access via a separate portal URL)

**Sub-pages:**
- `/decor` — Package list
- `/decor/create` — Create package form
- `/decor/:id` — Package detail with visual gallery
- `/decor/choose/:bookingId` — Booking-linked decor selection flow (client-facing or staff-assisted)

**List Columns:** Package Name · Theme · Price · Includes · Suitable For · Images · Status

**Decor Selection Flow** (see Section 9 for full details)

---

### 5.13 `/vendors` — Vendor Management

**Access:** All roles (write varies)

**Sub-pages:** List · Create · Edit · `/vendors/:id`

**List Columns:** Vendor Name · Type · Contact · Phone · Service Rate · Rating · Status

**Vendor Types:** Decoration · Photography · Catering · AV & Sound · Lighting · Transport · Security · Cleaning · Flowers · Other

**Detail Page:**
- Contact info, bank details, GST
- Events history (all past events this vendor was used for)
- Performance rating history
- Settlement records
- Notes

---

### 5.14 `/billing` — Billing & Invoices

**Access:** All roles (write: super_admin, branch_manager, accountant)

**Sub-pages:**
- `/billing` — Invoice list
- `/billing/:id` — Invoice detail + PDF preview

**List Columns:** Invoice Number · Booking ID · Client · Event Date · Subtotal · Tax · Total · Paid · Due · Status

**Invoice Status:** Draft · Sent · Partial · Paid · Overdue · Cancelled

**Invoice Detail:**
- Client and branch info panel
- Line items table (editable before sending)
- Subtotal, Discount, Tax, Total section
- Payment history timeline
- PDF preview pane (jsPDF render)
- Actions: Preview PDF · Download PDF · Send via Email · Send via WhatsApp · Mark Paid · Cancel

---

### 5.15 `/payments` — Payment Records

**Access:** Accountant, Branch Manager primary; others read-only

**List Columns:** Payment ID · Booking · Client · Amount · Date · Mode · Reference · Collected By

**Payment Modes:** Cash · UPI · Bank Transfer · Cheque · Card · Online

**Filters:** Date Range · Payment Mode · Booking Status · Collected By

---

### 5.16 `/inventory` — Raw Materials & Inventory

**Access:** Kitchen manager (CRUD), branch manager (CRUD), operations staff (read)

**Sub-pages:** List · Create Item · `/inventory/:id` Stock Ledger

**List Columns:** Item Name · Category · Unit · Current Stock · Min Stock · Price/Unit · Stock Value · Status

**Alert Banner:** Red banner at top when any item is below min stock level

**Stock Actions per item:** Restock (add) · Consume (deduct) · Adjust · View Ledger

**Stock Ledger Detail:**
- Full history of In / Out / Adjustment entries
- Each entry: Date, Type, Qty, Balance after, Reference (PO or Event), Done by

---

### 5.17 `/purchase-orders` — Purchase Orders

**Access:** Branch Manager, Kitchen Manager, Accountant

**Sub-pages:** List · Create PO · `/purchase-orders/:id` Detail

**List Columns:** PO Number · Vendor · Items · Total Amount · Status · Expected Delivery · Approved By

**Status Flow:** Draft → Sent → Acknowledged → Delivered / Partial / Cancelled

**Detail Page:**
- Vendor info
- Line items table
- Approval section
- PDF generation + send to vendor via WhatsApp/Email

---

### 5.18 `/staff` — Staff Management

**Access:** super_admin (global), franchise_admin (franchise), branch_manager (branch CRU)

**Sub-pages:** List · Create (Permanent) · Create (Temporary) · Edit · `/staff/:id`

**List Columns:** Staff ID · Name · Role · Branch · Email · Employment Type · Status · Joined Date

**Filters:** Role · Branch · Employment Type (Permanent/Temporary) · Status

**Temporary Staff Badge:** Shows countdown timer; expired temp staff shown in red with "Expired" badge

---

### 5.19 `/pricing` — Dynamic Pricing Engine

**Access:** super_admin, franchise_admin, branch_manager

**Sub-pages:**
- `/pricing` — Rules list + calendar preview
- `/pricing/create` — Create pricing rule
- `/pricing/festivals` — Festival calendar management

**Page Content:** See Section 8 for full details.

---

### 5.20 `/analytics` — Analytics & Reports

**Access:** Varies by role (see RBAC matrix)

**Tabs:**
- **Revenue** — MTD/YTD, trends, by event type, by branch
- **Leads & Conversion** — Funnel, by source, by sales exec, conversion rate trend
- **Occupancy** — Hall-wise, month-wise heatmap, peak days
- **Events** — By type, seasonal trends, guest count distribution
- **Financial** — Outstanding aging, payment mode breakdown, advance vs balance
- **Staff** — Follow-up activity per exec, lead count by assignee
- **Reviews** — Sentiment trends, branch comparison, staff ratings

**Export Options per tab:** Export CSV · Export Excel · Export PDF

**Date Filters:** Today · This Week · MTD · YTD · Custom Range

**Scope Filters:** By branch (for franchise_admin and super_admin) · By hall · By event type

---

### 5.21 `/reviews` — Review Management

**Access:** super_admin (global), franchise_admin (franchise), branch_manager (branch), sales_executive (read)

**Sub-pages:**
- `/reviews` — Centralized review dashboard
- `/reviews/collect` — QR/link-based collection tool
- `/reviews/respond` — Response management

**Page Content:** See Section 10 for full details.

---

### 5.22 `/settings/global` — Global Settings

**Access:** `super_admin` only

**Sections:**
- Platform Details (name, logo, contact)
- Branding (colors, favicon, platform logo)
- API Keys Management (Resend, WATI, OneSignal, Gemini, Cloudinary)
- Feature Flags (toggle: AI suggestions, WhatsApp, inventory, chatbot, decor module, dynamic pricing)
- Default Policies (advance %, cancellation policy template)
- Festival Calendar (global defaults)

---

### 5.23 `/settings/franchise` — Franchise Settings

**Access:** `super_admin`, `franchise_admin`

**Sections:**
- Franchise Details (name, code, region, GST, contact)
- Logo Management (upload light/dark variant)
- Notification Preferences (Resend from-email, WATI number)
- Booking Policies (advance %, cancellation policy)
- GST/Tax Settings
- Festival Overrides (franchise-specific festival pricing)

---

### 5.24 `/settings/branch` — Branch Settings

**Access:** `super_admin`, `franchise_admin`, `branch_manager`

**Sections:**
- Branch Details (name, address, hours)
- Hall Management (add/edit/deactivate halls)
- Operating Hours
- Bank Details
- Staff Roles Configuration
- Dynamic Pricing Overrides (branch-specific rules)

---

## 6. All Forms — Complete Field Definitions

### 6.1 Login Form

| Field | Type | Required | Validation |
|---|---|---|---|
| Email / Username | email | ✅ | Valid email format |
| Password | password | ✅ | Min 8 characters |
| Remember Me | checkbox | ❌ | — |

**Actions:** Login · Forgot Password link

---

### 6.2 Franchise Form

**Section 1: Franchise Information**

| Field | Type | Required | Options / Validation |
|---|---|---|---|
| Franchise Name | text | ✅ | Max 100 chars |
| Franchise Code | text | ✅ | Unique, uppercase, e.g. "PFD" — auto-checked |
| Primary City / Region | text | ✅ | e.g. "Hyderabad" |
| Franchise Type | select | ✅ | Company-Owned, Franchisee-Owned |
| Franchise Agreement Start Date | date | ❌ | Must be before end date |
| Franchise Agreement End Date | date | ❌ | Must be after start date |
| Royalty / Commission (%) | number | ❌ | 0–100 |
| GST Number | text | ❌ | 15-char GST validation |
| Contact Address | textarea | ❌ | Full address |
| Contact Email | email | ❌ | |
| Contact Phone | tel | ❌ | +91 format |
| Status | select | ✅ | Active, Inactive, Suspended |

**Section 2: Logo Upload**

| Field | Type | Required | Notes |
|---|---|---|---|
| Franchise Logo | file upload | ✅ | PNG/JPG, max 2MB. Uploaded to Cloudinary `franchises/{code}/logo`. Shown on login screen for all users. |
| Logo Dark Variant | file upload | ❌ | Optional dark-mode logo |

**Section 3: Franchise Admin Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Admin Full Name | text | ✅ | Creates Firebase Auth user |
| Admin Email | email | ✅ | Unique — becomes login credential |
| Admin Phone | tel | ✅ | +91 format |
| Gender | select | ❌ | Male, Female, Other |
| Temporary Password | password | ✅ | Auto-generated. Must change on first login. |

**Section 4: Notification Preferences**

| Field | Type | Required | Notes |
|---|---|---|---|
| Resend From Email | email | ❌ | e.g. noreply@prasadfooddivine.com |
| Resend Reply-To Email | email | ❌ | |
| WATI Registered Phone | tel | ❌ | WhatsApp Business number |

**Actions:** Save & Create Franchise · Cancel

---

### 6.3 Branch Form

**Section 1: Branch Information**

| Field | Type | Required | Options |
|---|---|---|---|
| Franchise | select | ✅ | Active franchises (scope-filtered) |
| Branch Name | text | ✅ | e.g. "Banjara Hills Branch" |
| Branch Code | text | ✅ | Unique within franchise, e.g. "PFD-HYD-BH" |
| City | text | ✅ | |
| Full Address | textarea | ✅ | Street, Area, City, PIN |
| Pincode | text | ✅ | 6-digit |
| Google Maps URL | url | ❌ | |
| Number of Halls | number | ✅ | |
| Max Capacity (guests) | number | ✅ | Total across all halls |
| Opening Time | time | ✅ | HH:MM |
| Closing Time | time | ✅ | HH:MM |
| Status | select | ✅ | Active, Inactive |

**Section 2: Financial Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| GST Number | text | ❌ | Shown on invoices |
| Bank Account Number | text | ❌ | |
| Bank IFSC Code | text | ❌ | |
| Bank Name | text | ❌ | |
| Default Advance % Required | number | ❌ | e.g. 30 |
| Default Cancellation Policy | textarea | ❌ | Shown on invoices |

**Section 3: Branch Manager**

| Field | Type | Required | Notes |
|---|---|---|---|
| Manager Full Name | text | ✅ | Creates Firebase Auth user |
| Manager Email | email | ✅ | Unique login ID |
| Manager Phone | tel | ✅ | +91 format |
| Temporary Password | password | ✅ | Must change on first login |

**Actions:** Save & Create Branch · Cancel

---

### 6.4 Hall Form (inside Branch Settings)

| Field | Type | Required | Options |
|---|---|---|---|
| Hall Name | text | ✅ | e.g. "Grand Ballroom" |
| Hall Code | text | ✅ | e.g. "GB-01" |
| Hall Type | select | ✅ | Indoor, Outdoor, Rooftop, Garden |
| Seating Capacity | number | ✅ | |
| Standing Capacity | number | ❌ | |
| Area (sq ft) | number | ❌ | |
| Base Price — Full Day (₹) | number | ✅ | |
| Base Price — Per Slot (₹) | number | ❌ | Morning / Evening slot |
| Extra Hour Charge (₹) | number | ❌ | |
| Amenities | multi-checkbox | ❌ | AC, Sound System, Projector, Stage, Parking, Changing Room, Generator, Catering Kitchen, Bridal Suite, Valet Parking |
| Hall Images | file upload (multi) | ❌ | Up to 10 images |
| Primary Image | radio (from uploaded) | ❌ | Select which image is primary |
| Status | select | ✅ | Active, Inactive |

---

### 6.5 Staff Form — Permanent

**Section 1: Personal Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text | ✅ | |
| Email (Login ID) | email | ✅ | Unique — Firebase Auth login |
| Phone Number | tel | ✅ | +91 format |
| Gender | select | ❌ | Male, Female, Other |
| Date of Birth | date | ❌ | |
| Aadhar Number | text | ❌ | XXXX-XXXX-XXXX; stored encrypted |
| Profile Photo | file | ❌ | Cloudinary upload |
| Residential Address | textarea | ❌ | |

**Section 2: Role & Branch Assignment**

| Field | Type | Required | Notes |
|---|---|---|---|
| Assign to Branch | select | ✅ | Staff are assigned to branches, not halls |
| Role | select | ✅ | All roles except super_admin and franchise_admin |
| Joining Date | date | ✅ | |
| Monthly Salary (₹) | number | ❌ | Internal record |
| Temporary Password | password | ✅ | Must change on first login |

**Section 3: Emergency Contact**

| Field | Type | Required | Notes |
|---|---|---|---|
| Emergency Contact Name | text | ❌ | |
| Emergency Phone | tel | ❌ | |
| Relation | select | ❌ | Father, Mother, Spouse, Sibling, Friend, Other |

**Section 4: Notification Preferences**

| Field | Type | Required | Notes |
|---|---|---|---|
| Email Notifications | checkbox | ❌ | Default: on |
| WhatsApp Notifications | checkbox | ❌ | Default: on |
| Push Notifications | checkbox | ❌ | Default: on |

---

### 6.6 Temporary Staff Form

> ⚠️ **Temporary Access — access automatically expires 24 hours after creation. Firebase session is invalidated by client-side check on every auth state change.**

Same as permanent staff form, except:

| Field | Type | Required | Notes |
|---|---|---|---|
| Employment Type | display | — | Shows "Temporary (24 Hours)" — not editable |
| Access Start Date & Time | datetime-local | ✅ | Defaults to now |
| Access Expires At | display | — | Auto-computed = Access Start + 24 hours. Read-only. |
| Reason for Temporary Access | textarea | ✅ | e.g. "Wedding event coverage — 2025-03-15" |

---

### 6.7 Lead Form

**Section 1: Client Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Client Full Name | text | ✅ | |
| Primary Phone | tel | ✅ | Duplicate check on save |
| Alternate Phone | tel | ❌ | |
| Email Address | email | ❌ | |
| Client Type | select | ✅ | Individual, Corporate, NGO |
| Company Name | text | Conditional | Required if Client Type = Corporate |

**Section 2: Event Requirements**

| Field | Type | Required | Options |
|---|---|---|---|
| Event Type | select | ✅ | Wedding, Reception, Engagement, Sangeet, Mehendi, Birthday, Anniversary, Baby Shower, Corporate, Conference, Product Launch, Award Night, Other |
| Preferred Event Date | date | ✅ | Must be future date |
| Alternate Date 1 | date | ❌ | |
| Alternate Date 2 | date | ❌ | |
| Expected Guests | number | ✅ | |
| Guest Range | select | ❌ | Auto-set: < 100, 100–200, 200–400, 400–600, 600+ |
| Hall Preference | select | ❌ | Halls of this branch, or "No Preference" |
| Time Slot | select | ✅ | Morning (6AM–2PM), Evening (2PM–10PM), Full Day, Night (8PM–4AM) |
| Catering Required | checkbox | ❌ | Default: on |
| Decoration Required | checkbox | ❌ | Default: on |
| Accommodation Required | checkbox | ❌ | Default: off |

**Section 3: Budget**

| Field | Type | Required | Notes |
|---|---|---|---|
| Budget Minimum (₹) | number | ❌ | |
| Budget Maximum (₹) | number | ❌ | |
| Budget Flexibility | select | ❌ | Fixed, Moderate, Flexible |

**Section 4: Lead Source**

| Field | Type | Required | Options |
|---|---|---|---|
| Lead Source | select | ✅ | Instagram, Facebook, Google Ads, Website Form, JustDial, Sulekha, WeddingWire/WedMeGood, Google Business Profile, YouTube, Walk-in, Phone Call, Referral (Client), Referral (Vendor), Event Fair, Newspaper Ad, Banner/Hoarding, Repeat Client, Staff Referral, AI Chatbot, Other |
| Source Detail | text | ❌ | Free text context |
| Referrer Name | text | Conditional | Required if source = Referral |
| Referrer Contact | tel | ❌ | |

**Section 5: Assignment & Status**

| Field | Type | Required | Notes |
|---|---|---|---|
| Assign To | select | ✅ | Sales Executives of this branch |
| Lead Status | select | ✅ | Default: "New" |
| Priority | select | ✅ | High, Medium, Low |
| Next Follow-up Date | date | ✅ | |
| Next Follow-up Type | select | ✅ | Call, WhatsApp, Email, Site Visit, Other |
| Internal Notes | textarea | ❌ | Not visible to client |

**On Submit Actions:** Creates lead doc → Creates activity entry → Updates branch `_stats` → Creates notification for assigned exec → Sends OneSignal push → Sends WATI WhatsApp to client → Sends Resend email to client → Triggers Gemini AI scoring (async)

---

### 6.8 Follow-up Form (Modal)

| Field | Type | Required | Options |
|---|---|---|---|
| Follow-up Date & Time | datetime-local | ✅ | |
| Follow-up Type | select | ✅ | Call, WhatsApp, Email, Site Visit, Other |
| Outcome | select | ✅ | Interested, Not Interested, Call Back Later, No Response, Switched Off, Wrong Number, Converted, Rescheduled |
| Duration (minutes) | number | Conditional | Required if type = Call |
| Call Answered | checkbox | Conditional | For Call type |
| Notes / Summary | textarea | ✅ | Min 10 characters |
| Next Follow-up Date | date | ✅ | |
| Next Follow-up Type | select | ✅ | Call, WhatsApp, Email, Site Visit, Other |
| Attachments | file | ❌ | Upload brochure, quote to Cloudinary |

---

### 6.9 Site Visit Form (Modal)

| Field | Type | Required | Notes |
|---|---|---|---|
| Visit Date | date | ✅ | |
| Visit Time | time | ✅ | |
| Number of Visitors | number | ❌ | e.g. 3 |
| Relation to Client | text | ❌ | e.g. "Client + parents" |
| Notes | textarea | ❌ | Preparation notes |
| Hall to Show | multi-select | ❌ | Halls to highlight during visit |

---

### 6.10 Booking Form

**Section 1: Link to Lead (Optional)**

| Field | Type | Notes |
|---|---|---|
| Link to Existing Lead | select / search | Search by client name / phone. Auto-fills Section 2 |

**Section 2: Client Details** (auto-filled if lead linked)

| Field | Type | Required | Notes |
|---|---|---|---|
| Client Full Name | text | ✅ | |
| Primary Phone | tel | ✅ | |
| Alternate Phone | tel | ❌ | |
| Email Address | email | ❌ | |
| Client Address | textarea | ❌ | For invoice |
| Client GST Number | text | ❌ | For corporate bookings |

**Section 3: Event Details**

| Field | Type | Required | Options |
|---|---|---|---|
| Event Type | select | ✅ | Same options as lead form |
| Event Date | date | ✅ | Availability check triggered on change |
| Time Slot | select | ✅ | Morning, Evening, Full Day, Night |
| Event Start Time | time | ✅ | |
| Event End Time | time | ✅ | |
| Expected Guests | number | ✅ | |
| Hall | select | ✅ | **Real-time availability check.** Red = booked, Green = available |

**Section 4: Package & Menu**

| Field | Type | Required | Options |
|---|---|---|---|
| Package Type | select | ✅ | Basic, Standard, Premium, Luxury, Custom |
| Menu Package | select | ❌ | Active menus — shows price per plate |
| Catering Type | select | ❌ | Veg Only, Non-Veg, Mixed, Jain, No Catering |
| Special Dietary Notes | textarea | ❌ | |

**Section 5: Decor Selection**

| Field | Type | Required | Notes |
|---|---|---|---|
| Decor Package | select / browse | ❌ | Opens decor chooser modal with visuals |
| Decor Theme | display | — | Auto from selected package |
| Decor Add-ons | multi-select | ❌ | e.g. "Extra floral arch", "Fairy lights" |
| Decor Amount (₹) | display | — | Auto-computed from package |
| Custom Decor Notes | textarea | ❌ | Special requests |

**Section 6: Financials**

| Field | Type | Required | Notes |
|---|---|---|---|
| Hall Base Amount (₹) | display | — | Auto from hall + slot |
| Festival Pricing Multiplier | display | — | Auto-applied from dynamic pricing engine |
| Festival Surcharge (₹) | display | — | Computed: base × (multiplier – 1) |
| Total Amount (₹) | number | ✅ | Editable — starts with computed value |
| Discount Amount (₹) | number | ❌ | Requires discount reason |
| Discount Reason | text | Conditional | Required if discount > 0 |
| Tax % (GST) | number | ✅ | Default from branch settings |
| Tax Amount (₹) | display | — | Auto-computed |
| Grand Total (₹) | display | — | Auto-computed |
| Advance Amount (₹) | number | ✅ | Min = advance % × total |
| Balance Amount (₹) | display | — | Auto-computed |
| Advance Payment Mode | select | ✅ | Cash, UPI, Bank Transfer, Cheque, Card |
| Advance Payment Reference | text | Conditional | Required for UPI/Transfer/Cheque |

**Section 7: Requirements**

| Field | Type | Required | Notes |
|---|---|---|---|
| Decoration Notes | textarea | ❌ | |
| Catering Notes | textarea | ❌ | |
| AV / Sound Notes | textarea | ❌ | |
| Special Requirements | textarea | ❌ | |
| Booking Status | select | ✅ | Confirmed, Tentative |

---

### 6.11 Decor Package Form

**Section 1: Package Details**

| Field | Type | Required | Options |
|---|---|---|---|
| Package Name | text | ✅ | e.g. "Royal Floral — Premium" |
| Theme Category | select | ✅ | Floral, Royal, Minimalist, Rustic, Modern, Fairy Tale, Traditional, Corporate, Garden, Other |
| Suitable For | multi-select | ✅ | Wedding, Reception, Birthday, Corporate, Other |
| Base Price (₹) | number | ✅ | |
| Price Includes | textarea | ✅ | Line-by-line: "Stage backdrop", "8 floral pillars"... |
| Minimum Booking Days | number | ❌ | |
| Setup Duration (hours) | number | ✅ | e.g. 3 |
| Color Palette | color-picker multi | ❌ | Up to 5 colors |
| Description | textarea | ✅ | Client-visible description |
| Internal Notes | textarea | ❌ | Setup team instructions |

**Section 2: Add-ons (repeating)**

| Field | Type | Required | Notes |
|---|---|---|---|
| Add-on Name | text | ✅ | e.g. "Extra Floral Arch" |
| Add-on Price (₹) | number | ✅ | |
| Add-on Description | text | ❌ | |

**Section 3: Images**

| Field | Type | Required | Notes |
|---|---|---|---|
| Package Images | multi-file upload | ✅ | Min 3, max 15 photos. Cloudinary upload. |
| Primary / Hero Image | radio (from uploaded) | ✅ | Shown on selection card |
| Video URL | url | ❌ | YouTube/Vimeo link for walkthrough |

**Section 4: Scope & Status**

| Field | Type | Required | Options |
|---|---|---|---|
| Applicable To | select | ✅ | All branches, Specific branch |
| Status | select | ✅ | Active, Inactive |

---

### 6.12 Dynamic Pricing Rule Form

| Field | Type | Required | Options |
|---|---|---|---|
| Rule Name | text | ✅ | e.g. "Diwali Festival Surcharge" |
| Rule Type | select | ✅ | Festival, Peak Season, Weekend, Specific Date, Day of Week, Off-Peak Discount |
| Applicable To | multi-select | ✅ | All halls, specific halls, all branches, specific branch |
| Start Date | date | Conditional | Required for Festival / Specific Date |
| End Date | date | Conditional | Required for Festival / Season |
| Day of Week | multi-checkbox | Conditional | Mon–Sun (for Day of Week rule) |
| Pricing Mode | select | ✅ | Multiplier (e.g. 1.5×), Fixed Surcharge (₹), Percentage Surcharge (%) |
| Multiplier / Surcharge Value | number | ✅ | e.g. 1.5 or 25000 or 30 |
| Apply To | multi-select | ✅ | Hall Booking, Catering, Decor, All |
| Festival Name | text | Conditional | Required for Festival type |
| Auto-Apply | checkbox | ❌ | Default: on — applies automatically on booking form |
| Show to Client | checkbox | ❌ | Whether the surcharge is labeled on invoice |
| Notes | textarea | ❌ | |
| Status | select | ✅ | Active, Inactive |

---

### 6.13 Invoice Form (Review before Sending)

| Field | Editable | Notes |
|---|---|---|
| Invoice Number | No | Auto: `INV-{franchise_code}-{YYYY}-{seq}` |
| Invoice Date | Yes | Defaults to today |
| Due Date | Yes | Defaults to event date |
| Line Items | Yes | Add/remove/edit line items, descriptions, qty, rate |
| Festival Surcharge Line | Conditional | Auto-added if dynamic pricing applied |
| Decor Package Line | Conditional | Auto-added if decor chosen |
| Subtotal | No | Auto-computed |
| Discount | Yes | |
| Tax % | Yes | |
| Total | No | Auto-computed |
| Notes | Yes | Shown on PDF |

---

### 6.14 Payment Recording Form (Modal)

| Field | Type | Required | Options |
|---|---|---|---|
| Booking Reference | display | — | Read-only |
| Amount (₹) | number | ✅ | Cannot exceed balance due |
| Payment Date | date | ✅ | Defaults to today |
| Payment Mode | select | ✅ | Cash, UPI, Bank Transfer, Cheque, Card, Online |
| Reference Number | text | Conditional | Required for UPI / Transfer / Cheque |
| Collected By | display | — | Logged-in user name |
| Notes | text | ❌ | |

---

### 6.15 Event Form (Create from Booking)

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Name | text | ✅ | e.g. "Kumar Wedding" |
| Booking Reference | display | — | Linked booking |
| Event Date | display | — | From booking |
| Hall | display | — | From booking |
| Expected Guests | number | ✅ | Can differ from booking estimate |
| Confirmed Guests | number | ❌ | Updated closer to event |
| Catering Notes | textarea | ❌ | Day-of instructions |
| Decoration Notes | textarea | ❌ | |
| Special Instructions | textarea | ❌ | |

**Checklist Items (dynamic, add multiple):**

| Field | Type | Notes |
|---|---|---|
| Checklist Item Title | text | e.g. "Confirm flower delivery" |
| Category | select | Catering, Decoration, AV, Logistics, Staff, Housekeeping, Other |
| Due Date | date | |
| Assigned To | select | Staff of this branch |
| Notes | text | |

**Staff Assignment (add multiple):**

| Field | Type | Notes |
|---|---|---|
| Staff Member | select | Active staff of this branch |
| Responsibility | text | e.g. "Catering lead" |

**Vendor Assignment (add multiple):**

| Field | Type | Notes |
|---|---|---|
| Vendor | select | Active vendors |
| Service | text | e.g. "Decoration" |
| Amount (₹) | number | |

---

### 6.16 Menu Form

| Field | Type | Required | Options |
|---|---|---|---|
| Menu Name | text | ✅ | e.g. "Veg Premium Package" |
| Menu Type | select | ✅ | Veg, Non-Veg, Mixed, Jain |
| Price per Plate (₹) | number | ✅ | |
| Minimum Plates | number | ✅ | |
| Applicable To | select | ✅ | All franchise branches, Specific branch |
| Starters | tag input | ❌ | |
| Main Course | tag input | ❌ | |
| Breads | tag input | ❌ | |
| Desserts | tag input | ❌ | |
| Beverages | tag input | ❌ | |
| Live Counters | tag input | ❌ | e.g. Chaat, Dosa, Ice Cream |
| Is Customizable | checkbox | ❌ | Allow changes per booking |
| Status | select | ✅ | Active, Inactive |

---

### 6.17 Vendor Form

| Field | Type | Required | Options |
|---|---|---|---|
| Vendor Name | text | ✅ | |
| Vendor Type | select | ✅ | Decoration, Photography, Catering, AV & Sound, Lighting, Transport, Security, Cleaning, Flowers, Other |
| Contact Person Name | text | ✅ | |
| Contact Phone | tel | ✅ | |
| Contact Email | email | ❌ | |
| Address | textarea | ❌ | |
| GST Number | text | ❌ | |
| Rate per Event (₹) | number | ❌ | |
| Preferred Advance % | number | ❌ | |
| Bank Account | text | ❌ | |
| Bank IFSC | text | ❌ | |
| Notes | textarea | ❌ | |
| Rating | number | ❌ | 0–5 stars |
| Scope | select | ✅ | Franchise-wide, Specific branch |
| Status | select | ✅ | Active, Inactive |

---

### 6.18 Inventory Item Form

| Field | Type | Required | Options |
|---|---|---|---|
| Item Name | text | ✅ | e.g. "Basmati Rice" |
| Category | select | ✅ | Raw Material, Supplies, Beverages, Equipment, Decorations, Packaging, Cleaning, Other |
| Unit of Measurement | select | ✅ | Kg, Litre, Piece, Pack, Box, Dozen, Metre, Bag |
| Current Stock | number | ✅ | Opening stock |
| Minimum Stock Level | number | ✅ | Alert threshold |
| Price per Unit (₹) | number | ✅ | |
| Preferred Vendor | select | ❌ | From active vendors |
| Storage Instructions | textarea | ❌ | |
| Notes | textarea | ❌ | |

---

### 6.19 Purchase Order Form

| Field | Type | Required | Notes |
|---|---|---|---|
| Vendor | select | ✅ | Active vendors |
| Expected Delivery Date | date | ✅ | |
| Line Items (repeating): | | | |
| — Item | select | ✅ | From raw_materials |
| — Quantity | number | ✅ | |
| — Unit | display | — | Auto from item |
| — Unit Price (₹) | number | ✅ | |
| — Amount | display | — | Auto-computed |
| Total Amount | display | — | Auto-computed |
| Notes to Vendor | textarea | ❌ | |
| Internal Notes | textarea | ❌ | |

---

### 6.20 Review Collection Form (Client-Facing)

| Field | Type | Required | Notes |
|---|---|---|---|
| Overall Rating | star-rating (1–5) | ✅ | |
| Event Name / Date | display | — | Pre-filled from event |
| Category Ratings | star-rating per category | ✅ | Food · Service · Staff · Ambience · Cleanliness · Value |
| Staff Tag | multi-select | ❌ | Recognise specific staff members |
| Written Review | textarea | ❌ | Min 20 chars if filled |
| Recommend to Others | yes/no | ❌ | |
| Photo Upload | file (multi) | ❌ | Up to 5 photos |
| Permission to Share | checkbox | ✅ | Consent to publish review |

---

## 7. Lead Tracking — Full Lifecycle

### 7.1 Lead Sources (22 Sources)

| Category | Source ID | Display Name |
|---|---|---|
| Digital — Paid | `google_ads` | Google Ads |
| Digital — Paid | `instagram_ads` | Instagram Ads |
| Digital — Paid | `facebook_ads` | Facebook Ads |
| Digital — Organic | `instagram` | Instagram (Organic) |
| Digital — Organic | `facebook` | Facebook (Organic) |
| Digital — Organic | `youtube` | YouTube |
| Digital — Listing | `google_business` | Google Business Profile |
| Digital — Listing | `justdial` | JustDial |
| Digital — Listing | `sulekha` | Sulekha |
| Digital — Listing | `wedding_wire` | WeddingWire / WedMeGood |
| Digital — Own | `website_form` | Website Contact Form |
| Digital — Own | `ai_chatbot` | Website AI Chatbot |
| Offline | `walk_in` | Walk-in |
| Offline | `phone_call` | Phone Call |
| Offline | `referral_client` | Client Referral |
| Offline | `referral_vendor` | Vendor Referral |
| Offline | `event_fair` | Event / Bridal Fair |
| Offline | `print_media` | Print Media |
| Offline | `outdoor_media` | Outdoor / Hoarding |
| Internal | `repeat_client` | Repeat Client |
| Internal | `staff_referral` | Staff Referral |
| Other | `other` | Other |

### 7.2 Lead Status State Machine

```
[NEW]
  │  First outreach made
  ▼
[CONTACTED]
  │  Client shows interest
  ▼
[SITE VISIT SCHEDULED]
  │  Visit appointment set
  ▼
[SITE VISIT DONE]
  │  Venue shown, quotation requested
  ▼
[PROPOSAL SENT]
  │  Quote shared, client evaluating
  ▼
[NEGOTIATION]
  │  Price/package discussions
  ▼
  ├────────────────────┐
  ▼                    ▼
[HOT]              [WARM]
Strong intent      Moderate interest
  │                    │
  │       ┌────────────┘
  │       ▼
  │   [COLD]
  │   Unresponsive
  │       │
  └───┬───┘
      │
  ┌───┴───────┬────────────┐
  ▼           ▼            ▼
[CONVERTED] [LOST]    [ON HOLD]
Creates     Records   Future date
/booking    reason    revisit
```

### 7.3 Lead Status Definitions

| Status | Definition | Typical Duration | Action Required |
|---|---|---|---|
| New | Just entered — not yet contacted | 0–1 day | Contact within 2 hours |
| Contacted | First contact made | 1–3 days | Schedule site visit or send info |
| Site Visit Scheduled | Appointment set | 1–7 days | Prepare venue, confirm day before |
| Site Visit Done | Venue shown | 1–3 days | Send proposal within 24h |
| Proposal Sent | Quote delivered | 2–7 days | Follow up after 2 days |
| Negotiation | Active price discussion | 3–14 days | Responsive, offer alternatives |
| Hot | High intent, likely to book | Immediate | Close within 48h |
| Warm | Interested but not urgent | 1–3 weeks | Touch every 3–4 days |
| Cold | Low response | — | Monthly touch; reassess |
| Converted | Booking confirmed | — | Create booking |
| Lost | Will not book | — | Record reason, competitor |
| On Hold | Future event (6+ months) | — | Automated reminder |

### 7.4 Lead Activity Types

| Type | Icon | Trigger |
|---|---|---|
| `lead_created` | 🌟 | System on form submit |
| `status_changed` | 🔄 | User action |
| `call_made` | 📞 | Follow-up log |
| `whatsapp_sent` | 💬 | System / manual |
| `email_sent` | ✉️ | Resend trigger |
| `site_visit_scheduled` | 🗓 | Site visit form |
| `site_visit_completed` | 🏛 | Manual update |
| `proposal_sent` | 📄 | Proposal action |
| `followup_logged` | 📝 | Follow-up form |
| `converted` | ✅ | Booking creation |
| `lost` | ❌ | Lost action |
| `ai_scored` | 🤖 | Gemini AI |
| `reminder_sent` | 🔔 | OneSignal schedule |

---

## 8. Dynamic Pricing Engine

### 8.1 Overview

The Dynamic Pricing Engine automatically adjusts hall booking prices based on configurable rules — festivals, peak seasons, weekends, and specific dates. Rules are managed by super_admin / franchise_admin / branch_manager and stored in `/pricing_rules` collection.

### 8.2 Rule Types

| Rule Type | Description | Example |
|---|---|---|
| **Festival** | Named festival with date range | Diwali: Oct 28–Nov 3 → 1.5× multiplier |
| **Peak Season** | Multi-week season window | Wedding season: Nov–Feb → 1.3× |
| **Weekend** | Saturday/Sunday premium | Every Sat–Sun → +₹15,000 |
| **Specific Date** | Single date override | New Year's Eve → 2× multiplier |
| **Day of Week** | Recurring day pattern | Friday → +20% |
| **Off-Peak Discount** | Discount for slow periods | Monsoon July–Aug → –15% |

### 8.3 How Pricing is Applied

```
User selects event date on booking form
        │
        ▼
System queries /pricing_rules where:
  - branch_id = current branch (or franchise-wide)
  - is_active = true
  - start_date <= selected_date <= end_date
        │
        ├── No rules match → Base price used as-is
        │
        └── Rules match →
              Highest-priority rule applied
              (or all rules stacked if config allows stacking)
                    │
                    ▼
              Computed price displayed:
              Base: ₹1,50,000
              Festival Surcharge (Diwali 1.5×): +₹75,000
              ─────────────────────────────────
              Total Hall: ₹2,25,000
              
              Invoice shows separate line:
              "Festival Pricing — Diwali (1.5× multiplier)"
```

### 8.4 Festival Calendar (Pre-loaded defaults)

| Festival | Typical Dates | Default Multiplier |
|---|---|---|
| Diwali | Oct/Nov (varies) | 1.5× |
| Navratri / Garba | Sep/Oct (varies) | 1.4× |
| Dussehra | Oct (varies) | 1.3× |
| New Year's Eve | Dec 31 | 2.0× |
| Valentine's Day | Feb 14 | 1.3× |
| Holi | Mar (varies) | 1.2× |
| Eid | Varies | 1.3× |
| Christmas | Dec 24–25 | 1.4× |
| Onam | Aug/Sep (varies) | 1.3× |
| Peak Wedding Season | Nov 1 – Feb 28 | 1.3× |

All multipliers are editable per franchise/branch. New festivals can be added.

### 8.5 Dynamic Pricing Page — Content

**List View:**
- All active rules as cards: Rule name, type, date range, multiplier, halls affected, status toggle
- Calendar preview button: Shows month view with pricing applied (orange highlights on high-price dates)

**Calendar Preview:**
- Month calendar with color intensity based on pricing multiplier
- Hover/click on any date → Shows applicable rules and final computed price per hall

**Rule Form:** See Section 6.12

---

## 9. Decor Choosing & Vendor Module

### 9.1 Decor Packages Overview

Decor packages are pre-defined themed decoration bundles with visual galleries, pricing, and add-on options. They can be shown to clients during sales, selected during booking, and executed by the operations team.

### 9.2 Decor Selection Flow (Staff-Assisted or Client Portal)

```
Step 1: Decor Browse Page (/decor/choose/:bookingId)
        ├── Filter by: Theme, Budget Range, Event Type, Hall
        ├── View packages as visual cards:
        │     [Hero Image] [Theme Name] [Price] [Suitable For]
        │     [Quick View button]
        └── Sort by: Price (low/high), Popularity, Newest

Step 2: Package Detail Modal
        ├── Full image gallery / slideshow
        ├── Video walkthrough (if available)
        ├── What's included (bullet list)
        ├── Color palette swatches
        ├── Add-ons section:
        │     [Extra Floral Arch] [+₹8,000] [Add button]
        │     [Fairy Light Ceiling] [+₹12,000] [Add button]
        │     [Custom Monogram] [+₹5,000] [Add button]
        └── "Choose This Package" button

Step 3: Confirm Selection
        ├── Package summary
        ├── Selected add-ons list
        ├── Total decor cost
        ├── Custom notes textarea
        └── Confirm button → Updates booking.decor_package

Step 4: Operations Team View
        ├── Event detail → Decor tab
        ├── Chosen package + add-ons + custom notes
        ├── Setup checklist auto-generated from package
        └── Vendor assigned based on package vendor_id
```

### 9.3 `/decor` Page Content

**Package List View:**
- Filter bar: Theme · Event Type · Budget Range · Status
- Package cards with hero image, name, price, event types, status badge
- Create Package button (for authorized roles)

**Package Detail View:**
- Full image gallery with lightbox
- Description, color palette, price breakdown
- Add-ons list
- Bookings using this package (history)
- Vendor association (which decoration vendor handles this)
- Edit button (authorized roles)

### 9.4 Decor Schema Addition to Booking

When a decor package is chosen during booking, the booking doc gets:
```js
decor: {
  package_id:         "decorPackageId",
  package_snapshot: {
    name:             "Royal Floral — Premium",
    theme:            "Royal",
    base_price:       45000,
    hero_image_url:   "https://res.cloudinary.com/.../royal-floral.jpg",
  },
  addons: [
    { name: "Extra Floral Arch", price: 8000 },
  ],
  total_decor_amount: 53000,
  custom_notes:       "Blush pink and gold color scheme preferred",
  confirmed_by:       "userId",
  confirmed_at:       Timestamp,
}
```

---

## 10. Review Management System

### 10.1 Overview

Centralized review aggregation, collection, and response management across branches and third-party platforms.

### 10.2 `/reviews` — Review Dashboard

**Access:** super_admin (global), franchise_admin (franchise), branch_manager (branch)

**Page Sections:**
- Summary bar: Average rating (all categories) · Total reviews · Response rate % · Sentiment breakdown (Positive / Neutral / Negative)
- Filter bar: Branch · Date range · Rating · Sentiment · Source · Category
- Review feed: Cards showing reviewer name (or Anonymous), date, rating, category scores, written review, sentiment badge, response status
- Branch comparison chart: Side-by-side average ratings per branch
- Sentiment trend chart: Monthly positive/neutral/negative percentages
- Staff performance panel: Staff tagged in reviews with average ratings

### 10.3 Review Collection

**QR Code Tool (`/reviews/collect`):**
- Generate unique QR code per event/booking
- QR links to client-facing review form (mobile-optimized)
- Scan rate tracking

**Review Submission Flow:**
1. Client scans QR or opens link after event
2. Fills review form (see Form 6.20)
3. Submitted review appears on dashboard
4. Sentiment auto-analyzed by Gemini AI
5. Auto-response sent (configurable)
6. Branch manager notified for low ratings (< 3 stars)

### 10.4 Response Management (`/reviews/respond`)

**Features:**
- Queue of unresponded reviews
- Pre-built response templates (editable)
- AI-assisted response suggestions
- Response history per review
- Escalation workflow for negative reviews (< 3 stars → alert branch manager → escalate to franchise admin after 24h)

### 10.5 Review Schema

```js
// /reviews/{reviewId}
{
  review_id:          "auto-id",
  franchise_id:       "franchiseId",
  branch_id:          "branchId",
  booking_id:         "bookingId",
  event_id:           "eventId",

  source:             "internal",       // "internal" | "google" | "justdial" | "weddingwire"
  reviewer_name:      "Priya S.",
  is_anonymous:       false,

  overall_rating:     4,                // 1–5
  category_ratings: {
    food:             5,
    service:          4,
    staff:            5,
    ambience:         4,
    cleanliness:      4,
    value:            3,
  },

  tagged_staff:       ["staffUid1", "staffUid2"],
  review_text:        "Beautiful venue, wonderful staff...",
  photos:             ["https://res.cloudinary.com/.../review1.jpg"],
  would_recommend:    true,

  // AI Analysis
  sentiment:          "Positive",
  sentiment_score:    0.87,
  ai_categories:      ["food", "staff"],
  ai_keywords:        ["wonderful", "professional", "beautiful"],

  // Response
  is_responded:       false,
  response_text:      null,
  response_by:        null,
  response_at:        null,
  is_ai_response:     false,

  is_escalated:       false,
  escalated_at:       null,

  is_published:       true,

  created_at:         Timestamp,
  updated_at:         Timestamp,
}
```

---

## 11. Database — Collection Structure

All collections are **flat** (top-level), not nested. Every document carries `franchise_id` and `branch_id` for compound query scoping.

```
/platform/{platformId}                    → Singleton: Coding Gurus config
/config/{docId}                           → API keys (admin-only read)
/franchises/{franchiseId}                 → One per franchise
/branches/{branchId}                      → One per branch, franchise_id scoped
/halls/{hallId}                           → Halls, branch_id scoped
/users/{userId}                           → All users (= Firebase Auth UID)
/leads/{leadId}                           → Enquiries, franchise + branch scoped
/lead_activities/{activityId}            → Lead timeline events
/follow_ups/{followUpId}                 → Scheduled follow-ups
/bookings/{bookingId}                     → Bookings, franchise + branch scoped
/events/{eventId}                         → Events linked to bookings
  └── /checklist_items/{itemId}           → Per-event checklist (subcollection)
/menus/{menuId}                           → Menu packages
/decor_packages/{packageId}              → Decor packages with gallery
/vendors/{vendorId}                       → Vendor registry
/billing/{invoiceId}                      → Invoices per booking
/payments/{paymentId}                     → Payment transactions
/raw_materials/{itemId}                   → Inventory per branch
  └── /stock_ledger/{entryId}            → Stock movement history (subcollection)
/purchase_orders/{poId}                   → Purchase orders
/pricing_rules/{ruleId}                  → Dynamic pricing rules
/notifications/{notificationId}          → In-app notification log
/audit_logs/{logId}                       → Immutable write audit trail
/ai_insights/{insightId}                 → Cached AI computation results
/reviews/{reviewId}                       → Customer reviews (internal + external)
```

### 11.1 Why Flat Over Nested

Firestore subcollections cannot be queried across parent documents. A nested structure like `/franchises/{id}/branches/{id}/leads/{id}` would make it impossible to query "all leads for a franchise" without multiple reads. With flat collections + compound indexes on `franchise_id` + `branch_id`, a single query filters any scope.

---

## 12. Database — Schema Definitions

### 12.1 `/platform/coding_gurus`

```js
{
  platform_id:         "coding_gurus",
  name:                "Coding Gurus",
  tagline:             "Banquet Management Platform",
  support_email:       "support@codinggurus.com",
  support_phone:       "+91-XXXXXXXXXX",
  logo_url:            "https://res.cloudinary.com/cg/.../cg_logo.png",
  default_currency:    "INR",
  default_timezone:    "Asia/Kolkata",
  default_date_format: "DD/MM/YYYY",
  default_advance_pct: 30,
  features: {
    ai_suggestions:       true,
    whatsapp_enabled:     true,
    email_enabled:        true,
    inventory_enabled:    true,
    dynamic_pricing:      true,
    decor_module:         true,
    review_management:    true,
    ai_chatbot_enabled:   true,
  },
  _stats: {
    total_franchises:  1,
    total_branches:    3,
    total_users:       28,
    total_bookings_mtd: 42,
    total_revenue_mtd: 2840000,
    last_updated_at:   Timestamp,
  },
  created_at:          Timestamp,
  updated_at:          Timestamp,
}
```

---

### 12.2 `/config/keys` — API Keys (super_admin read only)

```js
{
  resend_api_key:             "re_XXXXXXXXXX",
  resend_default_from:        "noreply@codinggurus.com",
  wati_api_url:               "https://live-server-XXXXX.wati.io",
  wati_api_token:             "XXXXXXXXXX",
  onesignal_app_id:           "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  onesignal_rest_api_key:     "XXXXXXXXXX",
  cloudinary_cloud_name:      "cg-banquet",
  cloudinary_upload_preset_logo:   "franchise_logo",
  cloudinary_upload_preset_hall:   "hall_images",
  cloudinary_upload_preset_staff:  "staff_profile",
  cloudinary_upload_preset_decor:  "decor_images",
  cloudinary_upload_preset_pdf:    "pdf_upload",
  gemini_api_key:             "XXXXXXXXXX",
  gemini_model:               "gemini-1.5-flash",
  updated_at:                 Timestamp,
}
```

---

### 12.3 `/franchises/{franchiseId}`

```js
{
  franchise_id:         "auto-id",
  franchise_name:       "Prasad Food Divine",
  franchise_code:       "PFD",
  region_city:          "Hyderabad",
  franchise_type:       "Franchisee-Owned",
  logo: {
    cloudinary_public_id: "franchises/pfd/logo",
    url:                  "https://res.cloudinary.com/cg/.../logo.png",
    thumbnail_url:        "https://res.cloudinary.com/cg/w_64,h_64,c_fit/.../logo.png",
    uploaded_at:          Timestamp,
    uploaded_by:          "superAdminUid",
  },
  logo_dark: { cloudinary_public_id: null, url: null },
  agreement_start_date: Timestamp,
  agreement_end_date:   Timestamp,
  royalty_percentage:   8,
  contact_address:      "Hyderabad, Telangana",
  contact_email:        "info@prasadfooddivine.com",
  contact_phone:        "+91-9000000000",
  gst_number:           "36ABCDE1234F1Z5",
  is_active:            true,
  status:               "Active",
  admin_user_id:        "userId",
  admin_snapshot: {
    name:               "Prasad Rao",
    email:              "prasad@pfd.com",
    phone:              "+91-9000000001",
  },
  notifications: {
    resend_from_email:  "noreply@prasadfooddivine.com",
    resend_reply_to:    "info@prasadfooddivine.com",
    wati_phone_number:  "+91-9000000000",
    onesignal_segment:  "franchise-pfd",
  },
  _stats: {
    total_branches:         3,
    total_bookings_mtd:     42,
    total_revenue_mtd:      2840000,
    total_revenue_ytd:      18200000,
    total_leads_open:       18,
    outstanding_dues:       415000,
    conversion_rate_pct:    18.2,
    avg_conversion_days:    17,
    last_updated_at:        Timestamp,
  },
  created_at:           Timestamp,
  updated_at:           Timestamp,
}
```

---

### 12.4 `/branches/{branchId}`

```js
{
  branch_id:            "auto-id",
  franchise_id:         "franchiseId",
  branch_name:          "Banjara Hills Branch",
  branch_code:          "PFD-HYD-BH",
  city:                 "Hyderabad",
  full_address:         "Road No. 12, Banjara Hills, Hyderabad - 500034",
  pincode:              "500034",
  google_maps_url:      "https://maps.google.com/?q=...",
  opening_time:         "09:00",
  closing_time:         "23:00",
  max_capacity_guests:  1500,
  gst_number:           "36ABCDE9999F1Z5",
  bank_account_number:  "XXXXXXXX",
  bank_ifsc:            "HDFC0000001",
  bank_name:            "HDFC Bank",
  default_advance_pct:  30,
  cancellation_policy:  "30 days notice required for full refund",
  manager_user_id:      "userId",
  manager_snapshot: {
    name:               "Arjun Reddy",
    email:              "arjun@pfd.com",
    phone:              "+91-9000000010",
  },
  franchise_snapshot: {
    franchise_name:     "Prasad Food Divine",
    franchise_code:     "PFD",
    logo_url:           "https://res.cloudinary.com/.../logo.png",
    logo_thumbnail_url: "https://res.cloudinary.com/w_64,h_64/.../logo.png",
  },
  is_active:            true,
  status:               "Active",
  onesignal_segment:    "branch-pfd-hyd-bh",
  _stats: {
    total_halls:          2,
    total_staff:          12,
    bookings_mtd:         24,
    revenue_mtd:          1200000,
    revenue_ytd:          7800000,
    outstanding_dues:     180000,
    occupancy_pct_mtd:    78,
    events_today:         1,
    events_this_week:     3,
    low_stock_count:      2,
    avg_review_rating:    4.3,
    last_updated_at:      Timestamp,
  },
  _lead_stats: {
    total_leads:          48,
    leads_by_status: {
      new: 5, contacted: 8, site_visit_scheduled: 3, hot: 7, warm: 6,
      converted: 8, lost: 2, on_hold: 1,
    },
    leads_by_source: {
      instagram: 12, referral_client: 9, walk_in: 8,
    },
    conversion_rate_pct:  16.7,
    leads_overdue_followup: 7,
    last_updated_at:      Timestamp,
  },
  created_at:           Timestamp,
  updated_at:           Timestamp,
}
```

---

### 12.5 `/halls/{hallId}`

```js
{
  hall_id:            "auto-id",
  franchise_id:       "franchiseId",
  branch_id:          "branchId",
  hall_name:          "Grand Ballroom",
  hall_code:          "GB-01",
  capacity_seated:    500,
  capacity_standing:  800,
  hall_type:          "Indoor",         // "Indoor"|"Outdoor"|"Rooftop"|"Garden"
  area_sqft:          5000,
  pricing: {
    base_price_full_day:  150000,
    base_price_per_slot:  80000,
    extra_hour_charge:    10000,
  },
  amenities:          ["AC", "Sound System", "Projector", "Stage", "Parking"],
  images: [
    {
      cloudinary_public_id: "halls/gb01/primary",
      url:                  "https://res.cloudinary.com/.../primary.jpg",
      thumbnail_url:        "https://res.cloudinary.com/w_400/.../primary.jpg",
      is_primary:           true,
      uploaded_at:          Timestamp,
    }
  ],
  is_active:          true,
  created_at:         Timestamp,
  updated_at:         Timestamp,
}
```

---

### 12.6 `/users/{userId}` — userId = Firebase Auth UID

```js
{
  user_id:               "firebaseAuthUid",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  role:                  "sales_executive",
  full_name:             "Kavya Singh",
  email:                 "kavya@pfd.com",
  phone:                 "+91-9000000020",
  gender:                "Female",
  date_of_birth:         Timestamp,
  aadhar_number:         "XXXX-XXXX-XXXX",   // encrypted at app layer
  profile_photo_url:     "https://res.cloudinary.com/.../kavya.jpg",
  joining_date:          Timestamp,
  monthly_salary:        25000,
  employment_type:       "permanent",         // "permanent" | "temporary"
  temp_access: {
    is_temporary:        false,
    access_start:        null,
    access_expires:      null,
    reason:              null,
    is_expired:          false,
  },
  emergency_contact: {
    name:                "Ramesh Singh",
    phone:               "+91-9000000099",
    relation:            "Father",
  },
  display_config: {
    show_franchise_logo: true,
    logo_url:            "https://res.cloudinary.com/.../pfd_logo.png",
    logo_thumbnail_url:  "https://res.cloudinary.com/w_64,h_64/.../pfd_logo.png",
    theme_color:         "#F59E0B",
  },
  onesignal_player_id:   "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  is_active:             true,
  last_login_at:         Timestamp,
  notify_email:          true,
  notify_whatsapp:       true,
  notify_push:           true,
  created_at:            Timestamp,
  created_by:            "managerUserId",
  updated_at:            Timestamp,
}
```

---

### 12.7 `/leads/{leadId}`

```js
{
  lead_id:               "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",

  // Client
  client_name:           "Rajesh Kumar",
  phone:                 "+91-9876543210",
  email:                 "rajesh@email.com",
  client_type:           "Individual",
  company_name:          null,

  // Event Requirements
  event_type:            "Wedding",
  preferred_date:        Timestamp,
  alt_date_1:            Timestamp,
  expected_guests:       500,
  guest_range:           "400-600",
  hall_preference:       "Grand Ballroom",
  time_slot:             "Full Day",
  catering_required:     true,
  decoration_required:   true,

  // Budget
  budget_min:            300000,
  budget_max:            600000,
  budget_flexibility:    "Moderate",

  // Source
  source:                "instagram",
  source_detail:         "Saw reel of Kumar wedding",
  referrer_name:         null,

  // Status
  status:                "Hot",
  priority:              "High",
  status_history: [
    { status: "New", changed_at: Timestamp, changed_by: "userId" },
    { status: "Hot", changed_at: Timestamp, changed_by: "userId" },
  ],
  lost_reason:           null,
  competitor_chosen:     null,

  // Assignment
  assigned_to_user_id:   "salesExecUserId",
  assigned_snapshot: {
    name:                "Kavya Singh",
    phone:               "+91-9000000020",
  },

  // Site Visit
  site_visit: {
    is_scheduled:        true,
    scheduled_date:      Timestamp,
    visitor_count:       3,
    halls_to_show:       ["Grand Ballroom"],
    done:                false,
  },

  // Proposal
  proposal: {
    sent:                false,
    sent_at:             null,
    proposal_url:        null,
  },

  // Decor Interest
  decor_interest: {
    interested:          true,
    shortlisted_packages: ["decorPackageId1", "decorPackageId2"],
  },

  // Follow-up
  next_followup_date:    Timestamp,
  next_followup_type:    "Call",
  followup_count:        2,
  last_contacted_at:     Timestamp,

  // Conversion
  is_converted:          false,
  converted_booking_id:  null,
  converted_at:          null,

  // AI Fields
  ai_score:              78,
  ai_score_label:        "High",
  ai_score_updated_at:   Timestamp,
  ai_suggested_action:   "Send proposal with Garden Hall alternative",
  ai_risk_factors:       ["Date 6 weeks away", "No site visit yet"],
  ai_sentiment:          "Positive",

  notes:                 "Client wants rooftop as backup",
  internal_notes:        "Father is particular about food quality",

  created_at:            Timestamp,
  created_by:            "userId",
  updated_at:            Timestamp,
}
```

---

### 12.8 `/bookings/{bookingId}`

```js
{
  booking_id:            "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  lead_id:               "leadId",

  // Client
  client_name:           "Rajesh Kumar",
  client_phone:          "+91-9876543210",
  client_email:          "rajesh@email.com",
  client_address:        "Hyderabad",
  client_gst_number:     null,

  // Event
  event_type:            "Wedding",
  event_date:            Timestamp,
  event_time_slot:       "Full Day",
  event_start_time:      "10:00",
  event_end_time:        "22:00",
  expected_guests:       500,

  // Hall
  hall_id:               "hallId",
  hall_snapshot: {
    hall_name:           "Grand Ballroom",
    capacity_seated:     500,
    hall_type:           "Indoor",
  },

  // Package & Menu
  package_type:          "Premium",
  menu_id:               "menuId",
  menu_snapshot: {
    menu_name:           "Veg Premium Package",
    price_per_plate:     850,
    menu_type:           "Veg",
  },

  // Decor
  decor: {
    package_id:          "decorPackageId",
    package_snapshot: {
      name:              "Royal Floral — Premium",
      theme:             "Royal",
      base_price:        45000,
    },
    addons: [
      { name: "Extra Floral Arch", price: 8000 },
    ],
    total_decor_amount:  53000,
    custom_notes:        "Blush pink and gold color scheme",
    confirmed_at:        Timestamp,
  },

  // Pricing
  dynamic_pricing_applied: true,
  pricing_rule_id:       "pricingRuleId",
  pricing_rule_name:     "Diwali Festival",
  pricing_multiplier:    1.5,
  base_hall_amount:      150000,
  festival_surcharge:    75000,

  // Financials
  total_amount:          450000,
  discount_amount:       0,
  tax_percentage:        10,
  tax_amount:            45000,
  grand_total:           495000,
  advance_amount:        150000,
  balance_amount:        345000,
  payments_collected:    150000,
  payment_status:        "Partial",

  // Status
  status:                "Confirmed",

  // OneSignal reminder IDs (for cancellation if needed)
  onesignal_reminder_48h:    "notification-id",
  onesignal_reminder_day_of: "notification-id",

  notes:                 "Vegetarian only, no alcohol",
  decoration_notes:      "Floral arch at entrance",
  catering_notes:        "Extra dessert counter",

  created_at:            Timestamp,
  created_by:            "userId",
  updated_at:            Timestamp,
}
```

---

### 12.9 `/decor_packages/{packageId}`

```js
{
  package_id:            "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             null,              // null = franchise-wide

  package_name:          "Royal Floral — Premium",
  theme_category:        "Royal",           // "Floral"|"Royal"|"Minimalist"|"Rustic"|"Modern"|"Traditional"|"Corporate"|"Garden"|"Other"
  suitable_for:          ["Wedding", "Reception", "Anniversary"],
  base_price:            45000,
  price_includes: [
    "Stage backdrop (12ft × 8ft)",
    "8 floral pillars",
    "Welcome arch at entrance",
    "Table centerpieces (10 tables)",
    "Aisle decoration",
  ],
  setup_duration_hours:  3,
  color_palette:         ["#F4C2C2", "#C0A080", "#FFFFFF", "#D4AF37"],
  description:           "An opulent Royal Floral package...",
  internal_notes:        "Setup must start 3h before event",

  addons: [
    { name: "Extra Floral Arch", price: 8000, description: "Additional arch at photo area" },
    { name: "Fairy Light Ceiling", price: 12000, description: "Canopy of fairy lights" },
    { name: "Custom Monogram", price: 5000, description: "Illuminated custom monogram" },
  ],

  images: [
    {
      cloudinary_public_id: "decor/royal-floral/hero",
      url:                  "https://res.cloudinary.com/.../hero.jpg",
      thumbnail_url:        "https://res.cloudinary.com/w_400/.../hero.jpg",
      is_primary:           true,
    }
  ],
  video_url:             null,

  preferred_vendor_id:   "vendorId",        // default decoration vendor for this package
  applicable_to:         "franchise",        // "platform"|"franchise"|"branch"
  is_active:             true,
  booking_count:         12,                // denormalized: how many times used

  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 12.10 `/pricing_rules/{ruleId}`

```js
{
  rule_id:               "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             null,              // null = franchise-wide

  rule_name:             "Diwali Festival Surcharge",
  rule_type:             "festival",        // "festival"|"peak_season"|"weekend"|"specific_date"|"day_of_week"|"off_peak_discount"
  festival_name:         "Diwali",

  applicable_halls:      [],                // empty = all halls
  applicable_to:         ["hall_booking", "catering", "decor"],

  start_date:            Timestamp,
  end_date:              Timestamp,
  days_of_week:          [],                // [0=Sun, 1=Mon ... 6=Sat] for day_of_week type

  pricing_mode:          "multiplier",      // "multiplier"|"fixed_surcharge"|"percentage_surcharge"
  pricing_value:         1.5,              // 1.5 = 50% increase

  auto_apply:            true,
  show_to_client:        true,
  client_label:          "Diwali Festival Rate",

  is_active:             true,
  priority:              1,                 // Higher number = higher priority when stacking
  allow_stacking:        false,

  notes:                 "Applied automatically for Diwali period",
  created_at:            Timestamp,
  updated_at:            Timestamp,
  created_by:            "userId",
}
```

---

### 12.11 `/events/{eventId}` + Checklist Subcollection

```js
{
  event_id:              "auto-id",
  booking_id:            "bookingId",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  event_name:            "Kumar Wedding",
  event_date:            Timestamp,
  event_type:            "Wedding",
  hall_id:               "hallId",
  hall_snapshot:         { hall_name: "Grand Ballroom" },
  client_snapshot: {
    name:                "Rajesh Kumar",
    phone:               "+91-9876543210",
  },
  expected_guests:       500,
  confirmed_guests:      480,
  status:                "Upcoming",         // "Upcoming"|"In Progress"|"Completed"|"Cancelled"
  assigned_staff: [
    { user_id: "uid1", name: "Raju Cook", role: "kitchen_manager", responsibility: "Catering lead" },
  ],
  assigned_vendors: [
    { vendor_id: "vid1", vendor_name: "Star Decorators", service: "Decoration", amount: 25000 },
  ],
  decor_snapshot: {
    package_name:        "Royal Floral — Premium",
    total_amount:        53000,
    setup_by:            "Star Decorators",
  },
  checklist_total:       10,
  checklist_done:        7,
  catering_notes:        "Extra halwa counter added",
  created_at:            Timestamp,
  updated_at:            Timestamp,
}
```

**Subcollection: `/events/{eventId}/checklist_items/{itemId}`**

```js
{
  item_id:               "auto-id",
  title:                 "Confirm flower delivery",
  category:              "Decoration",
  is_done:               false,
  done_by_user_id:       null,
  done_at:               null,
  due_date:              Timestamp,
  assigned_to_user_id:   "userId",
  assigned_to_name:      "Vijay Kumar",
  notes:                 "Vendor confirmed 6AM delivery",
  order:                 1,
}
```

---

### 12.12 `/billing/{invoiceId}`

```js
{
  invoice_id:            "auto-id",
  invoice_number:        "INV-PFD-2025-0042",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  booking_id:            "bookingId",
  client_snapshot: {
    name:                "Rajesh Kumar",
    phone:               "+91-9876543210",
    address:             "Hyderabad",
  },
  branch_snapshot: {
    branch_name:         "Banjara Hills Branch",
    address:             "Road No. 12, Banjara Hills",
    gst_number:          "36ABCDE9999F1Z5",
    logo_url:            "https://res.cloudinary.com/.../pfd_logo.png",
    bank_account:        "XXXXXXXX",
    bank_ifsc:           "HDFC0000001",
  },
  line_items: [
    { description: "Hall Booking — Grand Ballroom (Full Day)", qty: 1, unit_price: 150000, amount: 150000 },
    { description: "Diwali Festival Surcharge (1.5×)", qty: 1, unit_price: 75000, amount: 75000 },
    { description: "Catering — Veg Premium (500 plates × ₹850)", qty: 500, unit_price: 850, amount: 425000 },
    { description: "Decor — Royal Floral Premium", qty: 1, unit_price: 45000, amount: 45000 },
    { description: "Decor Add-on — Extra Floral Arch", qty: 1, unit_price: 8000, amount: 8000 },
  ],
  subtotal:              703000,
  discount_amount:       0,
  tax_percentage:        10,
  tax_amount:            70300,
  total_amount:          773300,
  amount_paid:           150000,
  amount_due:            623300,
  invoice_date:          Timestamp,
  due_date:              Timestamp,
  status:                "Partial",
  pdf: {
    cloudinary_public_id: "invoices/INV-PFD-2025-0042",
    url:                  "https://res.cloudinary.com/.../INV-PFD-2025-0042.pdf",
    generated_at:         Timestamp,
  },
  sent_via_email:        true,
  sent_via_whatsapp:     true,
  created_at:            Timestamp,
}
```

---

### 12.13 `/payments/{paymentId}`

```js
{
  payment_id:            "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  booking_id:            "bookingId",
  invoice_id:            "invoiceId",
  amount:                150000,
  payment_date:          Timestamp,
  payment_mode:          "UPI",
  reference_number:      "UPI-XXXX-XXXX",
  is_advance:            true,
  collected_by_user_id:  "userId",
  collected_by_snapshot: { name: "Arjun Reddy", role: "branch_manager" },
  receipt_pdf: {
    cloudinary_public_id: "receipts/RCT-001",
    url:                  "https://res.cloudinary.com/.../receipt.pdf",
  },
  notes:                 "Advance payment — booking confirmation",
  created_at:            Timestamp,
}
```

---

### 12.14 `/raw_materials/{itemId}` + Stock Ledger

```js
{
  item_id:               "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  item_name:             "Basmati Rice",
  category:              "Raw Material",
  unit:                  "Kg",
  current_stock:         45,
  min_stock_level:       100,
  is_low_stock:          true,
  price_per_unit:        85,
  stock_value:           3825,
  preferred_vendor_id:   "vendorId",
  storage_notes:         "Store in dry, cool place",
  created_at:            Timestamp,
  updated_at:            Timestamp,
}
```

**Subcollection: `/raw_materials/{itemId}/stock_ledger/{entryId}`**

```js
{
  entry_id:    "auto-id",
  type:        "In",              // "In"|"Out"|"Adjustment"
  quantity:    100,
  balance_after: 145,
  reference_po_id:    "poId",
  reference_event_id: null,
  notes:       "Received from supplier — PO-PFD-BH-2025-018",
  done_by_name: "Raju Cook",
  created_at:  Timestamp,
}
```

---

### 12.15 `/purchase_orders/{poId}`

```js
{
  po_id:                 "auto-id",
  po_number:             "PO-PFD-BH-2025-0018",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  vendor_id:             "vendorId",
  vendor_snapshot: {
    vendor_name:         "Fresh Grains Supplier",
    contact_phone:       "+91-9000000060",
  },
  items: [
    { item_id: "iid1", item_name: "Basmati Rice", qty: 100, unit: "Kg", unit_price: 85, amount: 8500 },
  ],
  total_amount:          15500,
  status:                "Sent",
  expected_delivery:     Timestamp,
  notes_to_vendor:       "Please deliver before 8 AM",
  created_at:            Timestamp,
  approved_by:           "branchManagerUid",
  approved_at:           Timestamp,
}
```

---

### 12.16 `/vendors/{vendorId}`

```js
{
  vendor_id:             "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  vendor_name:           "Star Decorators",
  vendor_type:           "Decoration",
  contact_name:          "Sunil Kumar",
  contact_phone:         "+91-9000000050",
  contact_email:         "sunil@stardecorators.com",
  gst_number:            "36XXXXX",
  bank_account:          "XXXXXXXX",
  bank_ifsc:             "SBIN0000001",
  rate_per_event:        25000,
  rating:                4.5,
  notes:                 "Preferred vendor. Specializes in floral setups.",
  is_active:             true,
  scope:                 "branch",
  created_at:            Timestamp,
  updated_at:            Timestamp,
}
```

---

### 12.17 `/notifications/{notificationId}`

```js
{
  notification_id:       "auto-id",
  user_id:               "userId",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  type:                  "followup_due",
  title:                 "Follow-up Overdue",
  body:                  "Rajesh Kumar follow-up is 2 days overdue",
  entity_type:           "lead",
  entity_id:             "leadId",
  deep_link:             "/leads/leadId",
  is_read:               false,
  read_at:               null,
  onesignal_id:          "push-notification-id",
  created_at:            Timestamp,
}
```

---

### 12.18 `/audit_logs/{logId}` — Immutable

```js
{
  log_id:                "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  user_id:               "userId",
  user_snapshot: {
    name:                "Arjun Reddy",
    role:                "branch_manager",
  },
  action:                "booking.confirmed",   // entity.action format
  entity_type:           "booking",
  entity_id:             "bookingId",
  before:                null,
  after: {
    client_name:         "Rajesh Kumar",
    total_amount:        450000,
    status:              "Confirmed",
  },
  ip_address:            "103.x.x.x",
  created_at:            Timestamp,
}
```

---

### 12.19 `/ai_insights/{insightId}`

```js
{
  insight_id:            "auto-id",
  insight_type:          "revenue_forecast",   // "revenue_forecast"|"lead_score"|"menu_recommendation"|"proposal_draft"|"followup_suggestion"|"review_sentiment"
  entity_type:           "branch",
  entity_id:             "branchId",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",
  input_hash:            "sha256-of-input",
  result:                {},                   // varies by insight_type — see Section 15
  model_used:            "gemini-1.5-flash",
  tokens_used:           842,
  is_stale:              false,
  computed_at:           Timestamp,
  expires_at:            Timestamp,
  created_at:            Timestamp,
}
```

---

## 13. Firebase Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth()        { return request.auth != null; }
    function role()          { return request.auth.token.role; }
    function franchiseId()   { return request.auth.token.franchise_id; }
    function branchId()      { return request.auth.token.branch_id; }

    function isSuperAdmin()     { return role() == "super_admin"; }
    function isFranchiseAdmin() { return role() == "franchise_admin"; }
    function isBranchManager()  { return role() == "branch_manager"; }
    function isAccountant()     { return role() == "accountant"; }
    function isKitchen()        { return role() == "kitchen_manager"; }
    function isSales()          { return role() == "sales_executive"; }
    function isOps()            { return role() == "operations_staff"; }
    function isReceptionist()   { return role() == "receptionist"; }

    function sameFranchise(fId) { return franchiseId() == fId; }
    function sameBranch(bId)    { return branchId() == bId; }

    function branchScoped(resource) {
      return isSuperAdmin() ||
             (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) ||
             sameBranch(resource.data.branch_id);
    }

    function isNotExpiredTemp() {
      let u = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return u.employment_type == "permanent" ||
             (u.temp_access.is_temporary == true &&
              u.temp_access.access_expires > request.time &&
              u.temp_access.is_expired == false);
    }

    function isOperational() { return isAuth() && isNotExpiredTemp(); }

    // /config
    match /config/{docId} {
      allow read:  if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow write: if isAuth() && isSuperAdmin();
    }

    // /platform
    match /platform/{docId} {
      allow read:  if isAuth();
      allow write: if isAuth() && isSuperAdmin();
    }

    // /franchises
    match /franchises/{fId} {
      allow read:  if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(fId)));
      allow create: if isAuth() && isSuperAdmin();
      allow update: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(fId)));
      allow delete: if isAuth() && isSuperAdmin();
    }

    // /branches
    match /branches/{bId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow update: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) || (isBranchManager() && sameBranch(bId)));
      allow delete: if isAuth() && isSuperAdmin();
    }

    // /halls
    match /halls/{hallId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) || (isBranchManager() && sameBranch(resource.data.branch_id)));
    }

    // /users
    match /users/{userId} {
      allow read: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) || (isBranchManager() && sameBranch(resource.data.branch_id)) || request.auth.uid == userId);
      allow create: if isAuth() && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager());
      allow update: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) || (isBranchManager() && sameBranch(resource.data.branch_id)) || (request.auth.uid == userId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["last_login_at", "onesignal_player_id", "notify_email", "notify_whatsapp", "notify_push", "updated_at"])));
      allow delete: if false;
    }

    // /leads
    match /leads/{leadId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isSales() || isReceptionist());
      allow update: if isOperational() && branchScoped(resource) && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isSales());
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // /lead_activities
    match /lead_activities/{activityId} {
      allow read:   if isOperational() && branchScoped(resource);
      allow create: if isOperational() && branchScoped(resource);
      allow update: if false;
      allow delete: if false;
    }

    // /follow_ups
    match /follow_ups/{followUpId} {
      allow read:   if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (isSuperAdmin() || isBranchManager() || isSales() || isReceptionist());
      allow update: if isOperational() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isSales());
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // /bookings
    match /bookings/{bookingId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (isSuperAdmin() || isBranchManager() || isSales());
      allow update: if isOperational() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isSales() || isAccountant());
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // /events + /checklist_items
    match /events/{eventId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (isSuperAdmin() || isBranchManager() || isSales());
      allow update: if isOperational() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isSales() || isOps() || isKitchen());
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());

      match /checklist_items/{itemId} {
        allow read:   if isOperational();
        allow create: if isOperational() && (isSuperAdmin() || isBranchManager() || isOps() || isSales());
        allow update: if isOperational() && (isSuperAdmin() || isBranchManager() || isOps() || isKitchen());
        allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
      }
    }

    // /decor_packages
    match /decor_packages/{packageId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || (isOps() && !request.resource.data.diff(resource.data).affectedKeys().hasAny(["is_active", "applicable_to"])));
    }

    // /pricing_rules
    match /pricing_rules/{ruleId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) || (isBranchManager() && sameBranch(resource.data.branch_id)));
    }

    // /billing + /payments
    match /billing/{invoiceId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (isSuperAdmin() || isBranchManager() || isAccountant());
      allow update: if isAuth() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isAccountant());
      allow delete: if isAuth() && isSuperAdmin();
    }

    match /payments/{paymentId} {
      allow read:   if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (isSuperAdmin() || isBranchManager() || isAccountant());
      allow update: if isAuth() && (isSuperAdmin() || isBranchManager() || isAccountant());
      allow delete: if isAuth() && isSuperAdmin();
    }

    // /raw_materials + /stock_ledger
    match /raw_materials/{itemId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isKitchen());

      match /stock_ledger/{entryId} {
        allow read:   if isAuth();
        allow create: if isAuth() && (isSuperAdmin() || isBranchManager() || isKitchen());
        allow update: if false;
        allow delete: if false;
      }
    }

    // /purchase_orders
    match /purchase_orders/{poId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource) && (isSuperAdmin() || isBranchManager() || isKitchen() || isAccountant());
    }

    // /menus
    match /menus/{menuId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isKitchen());
    }

    // /vendors
    match /vendors/{vendorId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isOps() || isKitchen());
    }

    // /notifications
    match /notifications/{notificationId} {
      allow read:   if isAuth() && resource.data.user_id == request.auth.uid;
      allow create: if isAuth();
      allow update: if isAuth() && resource.data.user_id == request.auth.uid && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["is_read", "read_at"]);
      allow delete: if false;
    }

    // /audit_logs
    match /audit_logs/{logId} {
      allow read:   if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow create: if isAuth();
      allow update: if false;
      allow delete: if false;
    }

    // /ai_insights
    match /ai_insights/{insightId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource);
    }

    // /reviews
    match /reviews/{reviewId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow create: if true;    // Public — via QR link (client form submits without auth)
      allow update: if isAuth() && branchScoped(resource) && (isSuperAdmin() || isFranchiseAdmin() || isBranchManager());
      allow delete: if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
    }
  }
}
```

---

## 14. Firestore Indexes

```json
{
  "indexes": [
    { "collectionGroup": "leads", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "leads", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "source", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "leads", "fields": [
        { "fieldPath": "assigned_to_user_id", "order": "ASCENDING" },
        { "fieldPath": "next_followup_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "leads", "fields": [
        { "fieldPath": "franchise_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "preferred_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "leads", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "ai_score", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "lead_activities", "fields": [
        { "fieldPath": "lead_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "follow_ups", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "is_overdue", "order": "ASCENDING" },
        { "fieldPath": "scheduled_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "bookings", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "event_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "bookings", "fields": [
        { "fieldPath": "franchise_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "event_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "bookings", "fields": [
        { "fieldPath": "hall_id", "order": "ASCENDING" },
        { "fieldPath": "event_date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "bookings", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "payment_status", "order": "ASCENDING" },
        { "fieldPath": "event_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "events", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "event_date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "payments", "fields": [
        { "fieldPath": "booking_id", "order": "ASCENDING" },
        { "fieldPath": "payment_date", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "payments", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "payment_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "notifications", "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "is_read", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "raw_materials", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "is_low_stock", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "users", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "is_active", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "users", "fields": [
        { "fieldPath": "employment_type", "order": "ASCENDING" },
        { "fieldPath": "temp_access.is_expired", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "billing", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "due_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "pricing_rules", "fields": [
        { "fieldPath": "franchise_id", "order": "ASCENDING" },
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "start_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "decor_packages", "fields": [
        { "fieldPath": "franchise_id", "order": "ASCENDING" },
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "base_price", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "reviews", "fields": [
        { "fieldPath": "branch_id", "order": "ASCENDING" },
        { "fieldPath": "overall_rating", "order": "DESCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "reviews", "fields": [
        { "fieldPath": "franchise_id", "order": "ASCENDING" },
        { "fieldPath": "sentiment", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "ai_insights", "fields": [
        { "fieldPath": "entity_id", "order": "ASCENDING" },
        { "fieldPath": "insight_type", "order": "ASCENDING" },
        { "fieldPath": "computed_at", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "audit_logs", "fields": [
        { "fieldPath": "entity_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
    ]}
  ]
}
```

---

## 15. AI-Based Features

All AI features use **Google Gemini API** (`gemini-1.5-flash`, free tier: 15 req/min, 1M tokens/day). Results are cached in `/ai_insights`.

### 15.1 Lead Scoring (0–100)

**Trigger:** On lead create, on status change, manual Re-score button  
**Cache:** `expires_at: 7 days`

**Input:**
```json
{
  "event_type": "Wedding",
  "guest_range": "400-600",
  "budget_min": 300000,
  "budget_max": 600000,
  "budget_flexibility": "Moderate",
  "source": "referral_client",
  "preferred_date_days_away": 45,
  "status": "Proposal Sent",
  "followup_count": 3,
  "days_since_last_contact": 2,
  "site_visit_done": true,
  "proposal_viewed": false,
  "historical_branch_conversion_rate_pct": 18.2
}
```

**Output:**
```json
{
  "score": 78,
  "label": "High",
  "reasoning": "Referral lead, flexible budget, site visit done",
  "suggested_action": "Call today — proposal not viewed, send WhatsApp with link",
  "risk_factors": ["Proposal not viewed", "Date 45 days away"],
  "tags": ["high-value", "wedding", "referral"],
  "sentiment": "Positive"
}
```

**UI:** Score badge (green 70+, yellow 40–69, red <40), suggested action card, re-score button.

---

### 15.2 Smart Follow-up Suggestions

**Input:** Last 5 activity entries + lead status + last contact time  
**Output:**
```json
{
  "best_channel": "WhatsApp",
  "best_time": "Tomorrow 10:00–11:00 AM",
  "suggested_message": "Hi Rajesh! We wanted to share one more hall option...",
  "reasoning": "Client responded fastest on WhatsApp (avg 22 min)",
  "do_not_try": ["Email — no response in 2 attempts"]
}
```

---

### 15.3 AI Website Chatbot — Lead Capture

**Purpose:** Embedded chat widget on franchise website. Qualifies visitors and creates leads in Firestore automatically.

**Conversation flow (multi-turn Gemini):**
```
Bot: "Hi! Planning a special event? I'd love to help find the perfect venue 🎉"
→ Captures: event type, date, guest count, budget, name, phone
→ Creates /leads doc with source: "ai_chatbot", ai_score pre-populated
→ Sends WATI WhatsApp to client + OneSignal push to sales exec
```

---

### 15.4 Revenue Forecasting

**Trigger:** On branch dashboard load (cached 24h)  
**Output:**
```json
{
  "forecast_30d": 840000,
  "forecast_60d": 1650000,
  "forecast_90d": 2200000,
  "confidence": "Medium",
  "assumptions": ["18.2% conversion rate", "March is peak season — 1.2× multiplier"],
  "risks": ["3 leads have no follow-up in 7+ days"],
  "opportunities": ["4 leads from referrals — 28% higher conversion historically"]
}
```

---

### 15.5 Auto-generated Proposal / Quote

**Process:**
1. Gemini returns structured JSON with narrative sections
2. Frontend renders proposal layout (React + CSS)
3. `jsPDF` + `html2canvas` converts to PDF
4. PDF uploaded to Cloudinary `proposals/leads/{leadId}/proposal_v{n}.pdf`
5. Sent via WATI WhatsApp + Resend email

---

### 15.6 Sentiment Analysis on Follow-up Notes

**Output:**
```json
{
  "sentiment": "Negative",
  "signals": ["considering competitors", "price concern"],
  "urgency": "High",
  "recommended_action": "Escalate to branch manager",
  "do_not_do": "Do not push for decision in next call"
}
```

---

### 15.7 Menu Recommendation

**Input:** Event type, guest count, budget per head, dietary preference  
**Output:** Top menu match + 2 alternatives with fit scores and reasoning

---

### 15.8 Review Sentiment Analysis

**Trigger:** On each review submission  
**Output:**
```json
{
  "sentiment": "Positive",
  "sentiment_score": 0.87,
  "categories": ["food", "staff"],
  "keywords": ["wonderful", "professional", "beautiful"],
  "ai_response_suggestion": "Thank you for the kind words! We're thrilled your wedding was perfect."
}
```

---

### 15.9 Dynamic Pricing Suggestions (AI)

**Trigger:** Monthly analysis of booking patterns  
**Output:** AI-recommended pricing rule adjustments based on demand patterns, seasonal trends, and occupancy data.

---

## 16. API Integrations

### 16.1 Resend — Email API

**Endpoint:** `https://api.resend.com/emails`  
**Auth:** API key in `Authorization: Bearer {resend_api_key}` header  
**Key stored in:** `/config/keys` (admin-only Firestore read, cached in session)

**Email Templates Catalog:**

| Template | Trigger | Recipient |
|---|---|---|
| `welcome_franchise_admin` | Franchise created | Franchise admin |
| `welcome_branch_manager` | Branch created | Branch manager |
| `welcome_staff` | User created | New staff |
| `lead_received_client` | Lead created | Client |
| `booking_confirmation` | Booking confirmed | Client |
| `booking_tentative` | Booking tentative | Client |
| `booking_cancelled` | Booking cancelled | Client |
| `invoice_email` | Invoice generated | Client |
| `payment_receipt` | Payment recorded | Client |
| `payment_reminder` | 7 days before event, balance > 0 | Client |
| `event_reminder_client` | 48h before event | Client |
| `proposal_email` | Proposal generated | Client |
| `site_visit_confirmation` | Site visit scheduled | Client |
| `low_stock_alert` | is_low_stock → true | Kitchen + Branch mgr |
| `followup_overdue_internal` | Overdue 3+ days | Branch manager |
| `temp_staff_created` | Temp staff created | Branch manager |
| `review_collected` | New review submitted | Branch manager |
| `negative_review_alert` | Review rating < 3 | Branch + Franchise admin |

**Sample Resend Call:**
```js
async function sendEmail({ template, to, data, from, replyTo }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resend_api_key}`,
    },
    body: JSON.stringify({
      from:     from || "noreply@prasadfooddivine.com",
      reply_to: replyTo || "info@prasadfooddivine.com",
      to:       [to],
      subject:  EMAIL_SUBJECTS[template],
      html:     renderEmailTemplate(template, data),
    }),
  });
  return res.json();
}
```

---

### 16.2 WATI — WhatsApp Business API

**Endpoint:** `https://live-server-XXXXX.wati.io/api/v1/sendTemplateMessage`  
**Auth:** `Authorization: Bearer {wati_api_token}` header  
**Key stored in:** `/config/keys`

**WhatsApp Templates Catalog:**

| Template | Trigger | Recipient |
|---|---|---|
| `lead_ack_wa` | Lead created | Client |
| `booking_confirmed_wa` | Booking confirmed | Client |
**Sample WATI Call:**
```js
async function sendWhatsApp({ phone, templateName, parameters, mediaUrl = null }) {
  const { wati_api_url, wati_api_token } = await getConfigKeys();
  const cleanPhone = phone.replace(/\D/g, "");

  const payload = {
    template_name:  templateName,
    broadcast_name: templateName,
    parameters:     parameters.map(p => ({ name: p.key, value: String(p.value) })),
  };

  if (mediaUrl) {
    payload.header = { type: "document", document: { link: mediaUrl, filename: "Document.pdf" } };
  }

  await fetch(
    `${wati_api_url}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${wati_api_token}` },
      body:    JSON.stringify(payload),
    }
  );
}
```

---

### 16.3 OneSignal — Push Notifications

**App ID:** Public — safe to expose  
**REST API Key:** Stored in `/config/keys`

**User Tag Strategy (applied at login):**
```js
OneSignal.User.addTags({
  role:         "sales_executive",
  branch_id:    "branchId",
  branch_code:  "pfd-hyd-bh",
  franchise_id: "franchiseId",
  user_id:      "userId",
});
```

**Push Notification Catalog:**

| Type | Target | Trigger |
|---|---|---|
| `new_lead` | Branch sales execs | Lead created |
| `lead_assigned` | Assigned user | Lead reassigned |
| `followup_overdue` | Assigned user | Detected on load |
| `site_visit_reminder` | Assigned user | 2h before visit |
| `booking_confirmed` | All branch staff | Booking confirmed |
| `booking_cancelled` | Branch manager | Booking cancelled |
| `payment_received` | Accountant + manager | Payment recorded |
| `event_tomorrow` | All branch staff | OneSignal scheduled |
| `event_today` | All branch staff | OneSignal scheduled |
| `low_stock` | Kitchen + manager | Stock drops below min |
| `high_score_lead` | Branch sales execs | AI score > 80 |
| `negative_review` | Branch manager | Review rating < 3 |
| `temp_staff_expiring` | Temp user + manager | 2h before expiry |

---

### 16.4 Cloudinary — Image & File Storage

**Upload method:** Direct browser-to-Cloudinary (unsigned upload presets)  
**Cloud name:** `cg-banquet`

**Upload Presets:**

| Preset | Usage | Max Size | Transformations |
|---|---|---|---|
| `franchise_logo` | Franchise logo | 2MB | auto-format; eager: w_200,h_200,c_fit + w_64,h_64 |
| `hall_images` | Hall gallery | 5MB | quality 85; eager: w_1200 + w_400 |
| `staff_profile` | Staff headshot | 2MB | w_200,h_200,c_thumb,g_face |
| `decor_images` | Decor package images | 5MB | quality 85; eager: w_1200 + w_400 |
| `pdf_upload` | Invoices, receipts, proposals | 10MB | resource_type: raw |

---

### 16.5 Gemini AI API

**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`  
**Auth:** `?key={gemini_api_key}` query param  
**Free limits:** 15 req/min, 1M tokens/day

```js
async function callGemini(prompt) {
  const { gemini_api_key } = await getConfigKeys();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini_api_key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
      }),
    }
  );
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}
```

---

### 16.6 Vercel Edge Function — Custom Claims

**Endpoint:** `POST /api/set-claims`  
**Called:** Once per user creation from frontend  
**Auth:** Shared secret in header

```js
// /api/set-claims — Vercel Edge Function
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export async function POST(req) {
  const { uid, role, franchise_id, branch_id, is_temporary } = await req.json();
  const app = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SA)) });
  await getAuth(app).setCustomUserClaims(uid, { role, franchise_id, branch_id, is_temporary });
  return Response.json({ success: true });
}
```

---

## 17. Notifications — Push, WhatsApp, Email

### 17.1 Notification Trigger Map

| User Action | Push (OneSignal) | WhatsApp (WATI) | Email (Resend) |
|---|---|---|---|
| Lead created | ✅ to sales exec | ✅ to client (ack) | ✅ to client |
| Lead assigned | ✅ to new assignee | — | — |
| Followup overdue | ✅ to assignee | ✅ to exec | ✅ to manager |
| Booking confirmed | ✅ to all branch | ✅ to client | ✅ to client |
| Invoice generated | — | ✅ to client | ✅ to client |
| Payment recorded | ✅ to accountant | ✅ to client | ✅ to client |
| Event tomorrow (48h) | ✅ to all branch | ✅ to client | ✅ to client |
| Stock low | ✅ to kitchen + mgr | — | ✅ to kitchen + mgr |
| New staff created | ✅ to mgr | ✅ to staff | ✅ to staff |
| Temp staff expiring | ✅ to temp + mgr | ✅ to temp | — |
| Review submitted | ✅ to mgr | — | ✅ to mgr |
| Negative review | ✅ to mgr + admin | — | ✅ to mgr + admin |
| AI score > 80 | ✅ to sales execs | — | — |

---

## 18. Client-Side Write Patterns

### 18.1 writeBatch Pattern (replaces Cloud Functions)

Every multi-document operation uses `writeBatch()` — single atomic commit. If any write fails, all fail.

```js
async function confirmBooking(bookingData, leadId, branchId, franchiseId) {
  const batch = writeBatch(db);
  const bookingRef = doc(collection(db, "bookings"));

  // 1. Booking doc
  batch.set(bookingRef, { ...bookingData, status: "Confirmed", created_at: serverTimestamp() });

  // 2. Payment doc (advance)
  const paymentRef = doc(collection(db, "payments"));
  batch.set(paymentRef, {
    booking_id:   bookingRef.id,
    amount:       bookingData.advance_amount,
    is_advance:   true,
    created_at:   serverTimestamp(),
  });

  // 3. Update lead → converted
  if (leadId) {
    batch.update(doc(db, "leads", leadId), {
      is_converted: true, converted_booking_id: bookingRef.id, status: "Converted",
    });
  }

  // 4. Branch stats (FieldValue.increment — never read-then-write)
  batch.update(doc(db, "branches", branchId), {
    "_stats.bookings_mtd":               increment(1),
    "_stats.outstanding_dues":           increment(bookingData.balance_amount),
    "_lead_stats.leads_by_status.converted": increment(1),
    "_stats.last_updated_at":            serverTimestamp(),
  });

  // 5. Franchise stats
  batch.update(doc(db, "franchises", franchiseId), {
    "_stats.total_bookings_mtd":         increment(1),
    "_stats.outstanding_dues":           increment(bookingData.balance_amount),
  });

  // 6. Audit log
  batch.set(doc(collection(db, "audit_logs")), {
    action: "booking.confirmed", entity_type: "booking", entity_id: bookingRef.id,
    user_id: auth.currentUser.uid, created_at: serverTimestamp(),
  });

  // 7. In-app notification
  batch.set(doc(collection(db, "notifications")), {
    user_id: branchAccountantId, type: "booking_confirmed",
    title: "New Booking Confirmed", body: `${bookingData.client_name} — ${bookingData.event_type}`,
    entity_type: "booking", entity_id: bookingRef.id,
    deep_link: `/bookings/${bookingRef.id}`, created_at: serverTimestamp(),
  });

  await batch.commit();

  // Post-batch: external APIs (non-atomic)
  await Promise.allSettled([
    sendEmail({ template: "booking_confirmation", to: bookingData.client_email, data: bookingData }),
    sendWhatsApp({ phone: bookingData.client_phone, templateName: "booking_confirmed_wa", parameters: buildParams(bookingData) }),
    sendPushNotification({ segment: `branch-${branchCode}`, title: "Booking Confirmed 🎉", body: bookingData.client_name }),
    scheduleEventReminders(bookingRef.id, bookingData),
  ]);

  return bookingRef.id;
}
```

### 18.2 Scheduled Push Notifications (Event Reminders)

```js
async function scheduleEventReminders(bookingId, bookingData) {
  const { onesignal_app_id, onesignal_rest_api_key } = await getConfigKeys();
  const eventDate = bookingData.event_date.toDate();

  const schedules = [
    { hoursOffset: -48, title: "Event Tomorrow 🎉", body: `${bookingData.client_name}'s event is tomorrow` },
    { hoursOffset: -2,  title: "Event Today! 🎊",   body: `${bookingData.event_name} — starts at ${bookingData.event_start_time}` },
  ];

  for (const schedule of schedules) {
    const sendAt = new Date(eventDate.getTime() + schedule.hoursOffset * 3600000);
    if (sendAt > new Date()) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Basic ${onesignal_rest_api_key}` },
        body: JSON.stringify({
          app_id:     onesignal_app_id,
          filters:    [{ field: "tag", key: "branch_code", relation: "=", value: branchCode }],
          headings:   { en: schedule.title },
          contents:   { en: schedule.body },
          send_after: sendAt.toISOString(),
        }),
      });
    }
  }
}
```

### 18.3 Temporary Staff Expiry Check (Client-Side)

```js
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) return;
  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  const userData = userDoc.data();

  if (userData.employment_type === "temporary") {
    const expiresAt = userData.temp_access.access_expires.toDate();
    if (new Date() > expiresAt) {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        "temp_access.is_expired": true, is_active: false, updated_at: serverTimestamp(),
      });
      await signOut(auth);
      navigate("/login", { state: { message: "Your 24-hour temporary access has expired." } });
    }
  }
});
```

---

## 19. Cloudinary Storage Design

```
cg-banquet (cloud)
├── platform/
│   ├── logo.png
│   └── favicon.png
├── franchises/
│   └── {franchise_code}/
│       ├── logo.png
│       └── logo_dark.png
├── branches/
│   └── {branch_code}/
│       └── halls/
│           └── {hall_code}/
│               ├── primary.jpg
│               └── gallery_*.jpg
├── staff/
│   └── {user_id}/profile.jpg
├── decor/
│   └── {package_id}/
│       ├── hero.jpg
│       └── gallery_*.jpg
├── invoices/
│   └── INV-PFD-2025-0042.pdf
├── receipts/
│   └── RCT-PFD-2025-0018.pdf
├── proposals/
│   └── leads/{lead_id}/
│       └── proposal_v1.pdf
└── purchase_orders/
    └── PO-PFD-BH-2025-0018.pdf
```

### 19.1 Logo on Login — Zero Extra Reads

```
Franchise created → Logo uploaded → URL stored in /franchises/{id}.logo.url
      │
      ▼
Staff user created → /users/{uid} created with
      display_config.logo_url = franchise.logo.url  ← Logo copied here
      │
      ▼
User logs in → 1 read: /users/{uid}
      logo_url available immediately — 0 additional reads needed
```

---

## 20. Firebase Auth & Temporary Staff

### 20.1 Auth Providers

| Provider | Used By |
|---|---|
| Email + Password | All staff, managers, franchise admins |
| Google OAuth | Optional for super admin |

### 20.2 Custom Claims (JWT)

Set via Vercel Edge Function on user creation:

```json
{
  "role":         "branch_manager",
  "franchise_id": "franchiseId",
  "branch_id":    "branchId",
  "is_temporary": false
}
```

### 20.3 Temporary Staff Flow

```
Branch manager creates temp staff
      │
      ▼
/users doc: employment_type = "temporary", access_expires = now + 24h
      │
      ▼
Vercel Edge: custom claims { is_temporary: true }
      │
      ▼
Temp staff logs in → WATI WhatsApp sent with expiry time
      │
      ▼  (on every onAuthStateChanged)
Check access_expires:
  ├── Not expired → Normal access
  └── Expired → updateDoc (is_expired = true) → signOut → redirect /login
```

---

## 21. Franchise Onboarding Flow

```
Step 1: Super Admin fills Franchise Form
        ├── Franchise details + Franchise code
        ├── Admin email + temp password
        └── LOGO UPLOAD (PNG/JPG, max 2MB)
              │
Step 2: Logo → Cloudinary → returns { url, public_id, thumbnail_url }
              │
Step 3: writeBatch():
        ├── Create /franchises/{id} (includes logo.url)
        └── Write /audit_logs entry
              │
Step 4: Create Firebase Auth user for franchise admin
              │
Step 5: Call Vercel Edge /api/set-claims { role: "franchise_admin", franchise_id }
              │
Step 6: writeBatch():
        └── Create /users/{uid} with display_config.logo_url = franchise.logo.url
              │
Step 7: External calls (Promise.allSettled):
        ├── Resend: Welcome email with login credentials
        └── WATI: WhatsApp with login details
              │
Step 8: Create OneSignal segment: "franchise-{code}"
              │
Franchise Admin logs in:
→ /users/{uid} read (1 read) → logo loaded from display_config → 0 extra reads
→ Franchise Dashboard shown
```

---

## 22. Data Lifecycle & Retention

| Collection | Retention Policy | Action |
|---|---|---|
| `/bookings` | Permanent | Never delete; archive completed > 3 years |
| `/leads` | 2 years after last update | Super admin manual archive |
| `/lead_activities` | With parent lead | Archived with lead |
| `/follow_ups` | With parent lead | Archived with lead |
| `/payments` | Permanent (financial) | Never delete |
| `/billing` | Permanent (financial) | Never delete |
| `/purchase_orders` | 3 years | Manual archive |
| `/audit_logs` | 5 years | Export → delete after 5 years |
| `/notifications` | 90 days | Client purges on login |
| `/ai_insights` | Per `expires_at` | Manual cleanup in settings |
| `/decor_packages` | Permanent | Deactivate, never delete |
| `/pricing_rules` | Permanent | Deactivate, never delete |
| `/reviews` | Permanent | Never delete |
| Firebase Auth users | Permanent | Disable only (`is_active = false`) |
| Cloudinary — invoices | Permanent | Never delete |
| Cloudinary — decor images | Permanent | Never delete |
| Cloudinary — temp uploads | 24h | Auto-deleted by Cloudinary tag |
| Cloudinary — proposal drafts | 30 days | Auto-expiry tag |

---

## 23. Environment Variables

### 23.1 Frontend (Vite — safe to expose in client)

```env
VITE_FIREBASE_API_KEY=AIzaXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=banquet-mgmt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=banquet-mgmt-prod
VITE_FIREBASE_STORAGE_BUCKET=banquet-mgmt-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXX
VITE_FIREBASE_APP_ID=1:XXXXXXXXXX:web:XXXXXXXXXX

VITE_CLOUDINARY_CLOUD_NAME=cg-banquet
VITE_CLOUDINARY_UPLOAD_PRESET_LOGO=franchise_logo
VITE_CLOUDINARY_UPLOAD_PRESET_HALL=hall_images
VITE_CLOUDINARY_UPLOAD_PRESET_STAFF=staff_profile
VITE_CLOUDINARY_UPLOAD_PRESET_DECOR=decor_images
VITE_CLOUDINARY_UPLOAD_PRESET_PDF=pdf_upload

VITE_ONESIGNAL_APP_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

VITE_VERCEL_CLAIMS_URL=https://your-vercel-app.vercel.app/api/set-claims
```

### 23.2 Sensitive Keys (Stored in Firestore `/config/keys` — NOT in .env)

```
resend_api_key
wati_api_token
wati_api_url
onesignal_rest_api_key
gemini_api_key
```

Fetched at runtime by authorized roles only. Cached in-memory for the session — never written to localStorage.

### 23.3 Vercel Edge (Server-side — in Vercel env dashboard)

```env
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"banquet-mgmt-prod",...}
CLAIMS_SECRET=your-shared-secret
```

---



### 24.2 Third-Party Free Tiers

| Service | Free Limit | Expected Usage | Status |
|---|---|---|---|
| Cloudinary | 25 credits/month | ~2–3 GB/month | ✅ Free |
| Resend | 3,000 emails/month | ~100–200/month | ✅ Free |
| OneSignal | Unlimited push, 10K subs | ~60 subscribers | ✅ Free |
| Gemini API | 15 req/min, 1M tokens/day | ~50–100 req/day | ✅ Free |
| Vercel Edge | 100K invocations/month | ~50–100/month | ✅ Free |
| WATI (WhatsApp) | Paid — no free tier | Required | ⚠️ Paid only |

> **Bottom line:** The entire system runs free except WATI for WhatsApp Business messaging.



## Appendix A — Module Summary

| Module | Primary Users | Key Actions | Collections |
|---|---|---|---|
| Lead Management | Sales, Receptionist | Create, Follow-up, Convert, AI Score | `leads`, `lead_activities`, `follow_ups` |
| Booking Management | Sales, Manager, Accountant | Create, Confirm, Cancel | `bookings`, `payments` |
| Event Management | Ops, Kitchen, Manager | Checklist, Staff, Execute | `events`, `checklist_items` |
| Calendar | All | View, Reschedule | `bookings` (query by date) |
| Billing | Accountant, Manager | Invoice, Send, Track | `billing`, `payments` |
| Inventory | Kitchen, Manager | Stock in/out, Low stock alert | `raw_materials`, `stock_ledger` |
| Purchase Orders | Kitchen, Accountant | Create, Approve, Track | `purchase_orders` |
| Staff | Manager, Franchise Admin | Create permanent/temp, Disable | `users` |
| Vendor Registry | Ops, Manager | Add, Rate, Assign | `vendors` |
| Menus | Kitchen, Manager | Create packages, Assign | `menus` |
| Decor Packages | Ops, Manager, Sales | Create, Browse, Assign to booking | `decor_packages` |
| Dynamic Pricing | Manager, Franchise Admin | Create rules, Festival calendar | `pricing_rules` |
| Analytics | Manager, Franchise Admin, Super Admin | Charts, Export | `_stats` + queries |
| AI Features | Sales, Manager | Score, Forecast, Propose, Recommend | `ai_insights`, Gemini API |
| Review Management | Manager, Franchise Admin | Collect, Respond, Analyze | `reviews`, `ai_insights` |
| Notifications | All | Push, WhatsApp, Email, In-app | `notifications`, OneSignal, WATI, Resend |

---

## Appendix B — Complete Data Flow Summary

| Action | Firestore Writes | External APIs |
|---|---|---|
| Lead created | 3 (lead + branch_stats + notification) | WATI ack, Resend, OneSignal push, Gemini score |
| Lead converted | 5 (lead + booking + payment + branch_stats + franchise_stats) | WATI booking confirm, Resend email, OneSignal, schedule reminders |
| Payment recorded | 4 (payment + booking + branch_stats + franchise_stats) | WATI receipt, Resend email, generate PDF → Cloudinary |
| Invoice generated | 1 (billing) | jsPDF → Cloudinary, WATI send, Resend send |
| Decor package chosen | 2 (booking.decor + audit_log) | WATI decor share, OneSignal to ops |
| Dynamic pricing applied | 0 (computed on form load) | — |
| Festival rule created | 2 (pricing_rule + audit_log) | OneSignal to branch staff |
| Review submitted | 2 (review + branch_stats.avg_rating) | Gemini sentiment, Resend to mgr, OneSignal alert (if < 3 stars) |
| Stock drops low | 2 (item is_low_stock + branch_stats) | OneSignal alert, Resend email |
| Temp staff created | 3 (user + audit_log + notification) | Vercel claims, WATI temp access, OneSignal schedule expiry |
| Event completed | 3 (event + booking + review QR sent) | Resend thank you, WATI review request |

---

*Banquet Management System — Master README v3.0.0*  
*Platform: Coding Gurus | Primary Franchise: Prasad Food Divine*  
*Architecture: Firebase Free Tier + React Vite + No Cloud Functions*  
*© 2025 Coding Gurus — Confidential*