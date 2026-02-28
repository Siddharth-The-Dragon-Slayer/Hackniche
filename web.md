# Banquet Management System — Master System Design Document
**Platform Owner:** Coding Gurus  
**Primary Client / Franchise:** Prasad Food Divine  
**Document Version:** 3.0.0  
**Status:** Comprehensive System Reference  

**Tech Stack:**
| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Database | Firebase Firestore (Native Mode, Spark Free Tier) |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| Storage | Cloudinary |
| Email | Resend |
| WhatsApp | WATI (WhatsApp Business API) |
| Push Notifications | OneSignal |
| AI | Google Gemini API |
| PDF Generation | jsPDF (client-side) |
| Custom Claims | Vercel Edge Functions (free tier) |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Organizational Hierarchy](#2-organizational-hierarchy)
3. [Roles & Permissions (RBAC)](#3-roles--permissions-rbac)
4. [Firebase Free Tier Feasibility](#4-firebase-free-tier-feasibility)
5. [System Architecture](#5-system-architecture)
6. [Pages & Navigation](#6-pages--navigation)
7. [Forms — Complete Field Definitions](#7-forms--complete-field-definitions)
8. [Lead Tracking — Full Lifecycle & Sources](#8-lead-tracking--full-lifecycle--sources)
9. [Database — Collection Structure](#9-database--collection-structure)
10. [Database — Schema Definitions](#10-database--schema-definitions)
11. [Data Scoping Rules](#11-data-scoping-rules)
12. [Denormalization & Read Optimization](#12-denormalization--read-optimization)
13. [AI-Based Features](#13-ai-based-features)
14. [Firebase Security Rules](#14-firebase-security-rules)
15. [Firestore Indexes](#15-firestore-indexes)
16. [Client-Side Write Patterns (No Cloud Functions)](#16-client-side-write-patterns-no-cloud-functions)
17. [Cloudinary — Storage Design](#17-cloudinary--storage-design)
18. [Resend — Email Automation](#18-resend--email-automation)
19. [WATI — WhatsApp Automation](#19-wati--whatsapp-automation)
20. [OneSignal — Push Notifications](#20-onesignal--push-notifications)
21. [Firebase Auth & Temporary Staff](#21-firebase-auth--temporary-staff)
22. [Franchise Onboarding Flow](#22-franchise-onboarding-flow)
23. [Data Lifecycle & Retention](#23-data-lifecycle--retention)
24. [Scaling Path](#24-scaling-path)
25. [Environment Variables](#25-environment-variables)

---

## 1. System Overview

The Banquet Management System (BMS) is a multi-franchise, multi-branch venue and event management platform built for **Coding Gurus** — a software platform company that licenses the system to banquet hall businesses. **Prasad Food Divine (PFD)** is the first and primary franchise onboarded onto the platform.

### 1.1 What the System Does

The BMS covers the complete operational lifecycle of a banquet hall business:

- **Lead Management** — Capture enquiries from 19 sources, track through a 12-stage lifecycle, score with AI, follow up, and convert to bookings
- **Booking Management** — Confirm hall bookings, manage advance payments, track balance dues
- **Event Management** — Day-of event execution with checklists, staff assignments, vendor coordination
- **Calendar & Availability** — Visual hall occupancy calendar with conflict prevention
- **Billing & Payments** — Invoice generation, payment collection, outstanding tracking
- **Kitchen & Inventory** — Raw material stock, purchase orders, low stock alerts
- **Staff Management** — Permanent and temporary (24-hour) staff with branch-scoped access
- **Vendor Management** — Decorator, photographer, AV vendor registry
- **Analytics & Reports** — Revenue, occupancy, lead funnel, event type breakdown with export
- **AI Features** — Lead scoring, follow-up suggestions, revenue forecasting, proposal generation, chatbot
- **Notifications** — Push (OneSignal), WhatsApp (WATI), Email (Resend) across all key events

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

The system uses a strict 4-level hierarchy. Every data record carries `franchise_id` and `branch_id` for scoping.

```
Level 1 — Platform
└── Coding Gurus (Super Admin)
    │   Manages: All franchises, global settings, global reports
    │
    Level 2 — Franchise
    ├── Prasad Food Divine (PFD) ← Primary franchise
    │   │   Managed by: Franchise Admin
    │   │   Controls: All PFD branches, franchise reports, franchise settings
    │   │
    │   Level 3 — Branch
    │   ├── Banjara Hills Branch
    │   │   └── Halls: Grand Ballroom, Open Air Lawn
    │   ├── Kukatpally Branch
    │   │   └── Halls: Royal Hall, Rooftop Terrace
    │   └── (Future branches...)
    │
    ├── PFD Pune Franchise (future)
    └── PFD Bangalore Franchise (future)
```

### 2.1 Hierarchy Rules

- A **Super Admin** can see and manage everything across all franchises
- A **Franchise Admin** can only see data within their own franchise — never another franchise's data
- A **Branch Manager** and below can only see data within their assigned branch
- Every API/Firestore query enforces scope server-side via Security Rules — never trust client-side filters
- Hall-level granularity exists for availability/pricing only — staff are **not** assigned to halls, only to branches

### 2.2 Example Tree (PFD)

```
Coding Gurus (Platform Owner) — Super Admin
└── Prasad Food Divine
    ├── Franchise Admin: Prasad Rao
    ├── Banjara Hills Branch
    │   ├── Branch Manager: Arjun Reddy
    │   ├── Sales Executive: Kavya Singh
    │   ├── Kitchen Manager: Raju Cook
    │   ├── Accountant: Meena Rao
    │   ├── Operations Staff: Vijay Kumar
    │   ├── Receptionist: Ananya Sharma
    │   └── Halls: Grand Ballroom (cap 500), Open Air Lawn (cap 800)
    └── Kukatpally Branch
        ├── Branch Manager: Sita Reddy
        └── Halls: Royal Hall (cap 300), Rooftop Terrace (cap 150)
```

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

`C=Create, R=Read, U=Update, D=Delete, X=No Access`  
`[G]=Global, [F]=Own Franchise Only, [B]=Own Branch Only`

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
| Billing / Invoices | CRUD[G] | R[F] | CRUD[B] | R[B] | X | CRUD[B] | X | X |
| Payments | CRUD[G] | R[F] | CRUD[B] | R[B] | X | CRUD[B] | X | X |
| Raw Materials | CRUD[G] | R[F] | CRUD[B] | X | CRUD[B] | R[B] | R[B] | X |
| Purchase Orders | CRUD[G] | R[F] | CRUD[B] | X | CRU[B] | CRUD[B] | X | X |
| Reports — Global | CRUD[G] | X | X | X | X | X | X | X |
| Reports — Franchise | CRUD[G] | R[F] | X | X | X | X | X | X |
| Reports — Branch | CRUD[G] | R[F] | R[B] | R[B] | R[B] | R[B] | X | X |
| Users / Staff | CRUD[G] | CRUD[F] | CRU[B] | X | X | X | X | X |
| Settings — Global | CRUD[G] | X | X | X | X | X | X | X |
| Settings — Franchise | CRUD[G] | RU[F] | X | X | X | X | X | X |
| Settings — Branch | CRUD[G] | RU[F] | RU[B] | X | X | X | X | X |
| Audit Logs | CRUD[G] | R[F] | X | X | X | X | X | X |
| AI Insights | CRUD[G] | R[F] | R[B] | R[B] | X | X | X | X |

### 3.3 Post-Login Redirects

| Role | Redirect After Login |
|---|---|
| `super_admin` | `/dashboard/platform` |
| `franchise_admin` | `/dashboard/franchise` |
| All branch roles | `/dashboard/branch` |

---

## 4. Firebase Free Tier Feasibility

### 4.1 Firebase Spark Plan Limits vs Estimated Usage

| Resource | Free Limit | Estimated Usage (1 Franchise, 3 Branches, ~30 users) | Headroom |
|---|---|---|---|
| Firestore Reads | 50,000/day | ~2,800–4,000/day | **93% unused** |
| Firestore Writes | 20,000/day | ~150–300/day | **98% unused** |
| Firestore Deletes | 20,000/day | ~50–100/day | **99% unused** |
| Firestore Storage | 1 GB | ~50–200 MB | **80–95% unused** |
| Firebase Auth | Unlimited | ~30–60 users | ✅ Unlimited |
| Firebase Hosting | 10 GB / 360 MB transfer/day | Static React app | ✅ Fits |
| Cloud Functions | ❌ Not on Spark | Removed from design | N/A |

### 4.2 Daily Read Budget (Detailed)

| Screen / Action | Docs per Load | Loads/Day | Daily Reads |
|---|---|---|---|
| Login (user doc read) | 1 | 30 | 30 |
| Branch Dashboard (`_stats`) | 1 | 30 (10 users × 3) | 30 |
| Franchise Dashboard | 1 | 5 | 5 |
| Platform Dashboard | 1 | 3 | 3 |
| Leads list (page of 20) | 20 | 15 | 300 |
| Lead detail view | 1 lead + 5 activities | 10 | 60 |
| Bookings list (page of 20) | 20 | 10 | 200 |
| Booking detail | 1 booking + 3 payments + 1 invoice | 10 | 50 |
| Calendar (30 events) | 30 | 8 | 240 |
| Events list | 15 | 6 | 90 |
| Staff list | 15 | 5 | 75 |
| Inventory list | 25 | 5 | 125 |
| Notifications bell | 10 | 50 (5×/user×10) | 500 |
| Analytics (summary doc) | 1 | 20 | 20 |
| Billing list | 20 | 5 | 100 |
| Vendor / Menu lists | 15 each | 4 each | 120 |
| Realtime listeners (lead changes) | 3 avg per change | 20 changes | 60 |
| **Buffer / misc** | — | — | ~800 |
| **TOTAL** | | | **~2,808/day** |

### 4.3 Daily Write Budget (Detailed)

| Write Action | Docs Written | Frequency/Day | Daily Writes |
|---|---|---|---|
| New lead | 3 (lead + branch_stats + notification) | 5 | 15 |
| Follow-up logged | 2 (followup + lead.updated_at + activity) | 10 | 30 |
| Lead status changed | 2 (lead + branch_stats) | 8 | 16 |
| Booking created | 5 (booking + lead + branch_stats + franchise_stats + notification) | 3 | 15 |
| Payment recorded | 4 (payment + booking + branch_stats + franchise_stats) | 5 | 20 |
| Event checklist item | 2 (item + event counter) | 15 | 30 |
| Staff login timestamp | 1 | 30 | 30 |
| Inventory stock update | 2 (item + ledger entry) | 10 | 20 |
| Notifications created | 1 each | 25 | 25 |
| Audit logs | 1 per significant action | 20 | 20 |
| **TOTAL** | | | **~221/day** |

### 4.4 Third-Party Free Tier Summary

| Service | Free Limit | Expected Usage | Status |
|---|---|---|---|
| Firebase Firestore | 50K reads, 20K writes/day | ~3K reads, ~220 writes | ✅ Free |
| Firebase Auth | Unlimited | ~60 users | ✅ Free |
| Firebase Hosting | 10GB, 360MB/day | React static app | ✅ Free |
| Cloudinary | 25 credits/month | ~2–3 GB/month | ✅ Free |
| Resend | 3,000 emails/month | ~50–150/month | ✅ Free |
| OneSignal | Unlimited push, 10K subs | ~60 subscribers | ✅ Free |
| Gemini API | 15 req/min, 1M tokens/day | ~30–80 req/day | ✅ Free |
| Vercel Edge Functions | 100K invocations/month | ~50–100/month | ✅ Free |
| WATI (WhatsApp) | Paid — no free tier | Required | ⚠️ Paid only |

> **Bottom line:** The entire system runs free except WATI for WhatsApp Business messaging.

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT — React Web App                        │
│              (Firebase Hosting — Free, PWA-ready)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   React Application                       │   │
│  │  Pages → Components → Hooks → Services → API Clients    │   │
│  └─────────────────────┬────────────────────────────────────┘   │
│                        │                                         │
│         ┌──────────────┼──────────────────┐                     │
│         ▼              ▼                  ▼                     │
│  ┌─────────────┐ ┌──────────┐ ┌───────────────────────────┐    │
│  │ Firestore   │ │ Firebase │ │   Direct API Calls         │    │
│  │ SDK         │ │ Auth SDK │ │   (from frontend)          │    │
│  │             │ │          │ │                            │    │
│  │ reads       │ │ login    │ │  • Resend (email)          │    │
│  │ writeBatch  │ │ logout   │ │  • WATI (WhatsApp)         │    │
│  │ transactions│ │ claims   │ │  • OneSignal (push)        │    │
│  │ listeners   │ │          │ │  • Cloudinary (upload)     │    │
│  └─────────────┘ └──────────┘ │  • Gemini API (AI)        │    │
│                               │  • jsPDF (PDF gen)         │    │
│                               └───────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────────┐
│ Google Firebase  │  │ Third-Party Services  │
│                  │  │                      │
│ • Firestore      │  │ • Cloudinary (CDN)   │
│ • Auth           │  │ • Resend (email)     │
│ • Hosting        │  │ • WATI (WhatsApp)    │
└──────────────────┘  │ • OneSignal (push)   │
                       │ • Gemini (AI)        │
         │             └──────────────────────┘
         ▼
┌──────────────────────────┐
│ Vercel Edge Functions    │
│ (Free — 1 endpoint only) │
│ POST /api/set-claims     │
│ Sets Firebase custom     │
│ claims on user creation  │
└──────────────────────────┘
```

### 5.1 Data Flow — Creating a Booking

```
User fills booking form
        │
        ▼
Frontend validates form
        │
        ▼
Check hall availability
(Firestore query — same date + hall_id)
        │
        ├── Hall NOT available → show error
        │
        └── Hall available →
                │
                ▼
           writeBatch() — atomic:
           ┌─────────────────────────────┐
           │ 1. Create /bookings doc     │
           │ 2. Update /leads (converted)│
           │ 3. Increment branch._stats  │
           │ 4. Increment franchise._stats│
           │ 5. Write /audit_logs entry  │
           │ 6. Write /notifications doc │
           └─────────────────────────────┘
                │
                ▼
           batch.commit() — success
                │
                ▼
           Promise.allSettled (non-atomic):
           ┌─────────────────────────────┐
           │ • Resend booking confirm    │
           │ • WATI WhatsApp to client   │
           │ • OneSignal push to branch  │
           │ • OneSignal schedule 48h    │
           │   event reminder            │
           └─────────────────────────────┘
```

---

## 6. Pages & Navigation

### 6.1 Navigation Structure by Role

**Super Admin Navigation:**
- ⬡ Platform Dashboard (`/dashboard/platform`)
- 🏢 Franchises (`/franchises`)
- 🏪 Branches (`/branches`)
- 👥 Users & Staff (`/users`)
- 📊 Analytics (`/analytics`)
- ⚙ Global Settings (`/settings/global`)

**Franchise Admin Navigation:**
- ⬡ Franchise Dashboard (`/dashboard/franchise`)
- 🏪 Branches (`/branches`)
- 🎯 Leads (`/leads`)
- 📋 Bookings (`/bookings`)
- 👥 Staff (`/staff`)
- 📊 Analytics (`/analytics`)
- ⚙ Franchise Settings (`/settings/franchise`)

**Branch Manager Navigation:**
- ⬡ Branch Dashboard (`/dashboard/branch`)
- 🎯 Leads (`/leads`)
- 📋 Bookings (`/bookings`)
- 🎉 Events (`/events`)
- 📅 Calendar (`/calendar`)
- 🍽 Menus (`/menus`)
- 🤝 Vendors (`/vendors`)
- 💰 Billing (`/billing`)
- 📦 Inventory (`/inventory`)
- 👥 Staff (`/staff`)
- 📊 Analytics (`/analytics`)

**Sales Executive Navigation:** Dashboard, Leads, Bookings, Events, Calendar, Analytics

**Kitchen Manager Navigation:** Dashboard, Events, Menus, Inventory, Vendors

**Accountant Navigation:** Dashboard, Bookings, Billing, Payments, Analytics

**Operations Staff Navigation:** Dashboard, Events, Vendors

**Receptionist Navigation:** Dashboard (view only), Leads (create/view)

---

### 6.2 Page Inventory — Complete

#### `/login` — Login Page
- **Access:** Public
- **Description:** Unified login for all roles. Post-login redirect based on custom claim `role`.
- **Components:** Email field, password field, remember me checkbox, forgot password link
- **Special:** On load, reads `user.display_config.logo_url` from Firestore if returning user (or after first auth). Franchise logo shown for all non-super_admin users.

---

#### `/dashboard/platform` — Platform Dashboard
- **Access:** `super_admin` only
- **Description:** Aggregated KPIs across ALL franchises and branches
- **KPI Cards:**
  - Total Franchises
  - Total Branches
  - Total Revenue (MTD / YTD toggle)
  - Total Bookings (MTD)
  - Global Lead Conversion Rate
  - Total Outstanding Dues (alert)
- **Charts:**
  - Franchise-wise Revenue (bar chart)
  - Monthly Revenue Trend — last 6 months (line chart)
  - Lead Funnel (global) — horizontal funnel chart
  - Occupancy Heatmap — all branches
- **Lists:**
  - Events This Week (all branches)
  - Top Franchises by Revenue
  - Recent Bookings (all)
- **Filters:** Date Range picker, Franchise multi-select
- **Export:** CSV, Excel, PDF for all widgets

---

#### `/dashboard/franchise` — Franchise Dashboard
- **Access:** `super_admin`, `franchise_admin`
- **Description:** Aggregated KPIs for all branches within the franchise
- **Scope Note:** `franchise_admin` sees only their franchise; `super_admin` can switch via filter
- **KPI Cards:**
  - Branches in Franchise
  - Franchise Revenue (MTD/YTD)
  - Total Bookings
  - Outstanding Dues (alert)
  - Lead Conversion Rate
- **Charts:**
  - Branch-wise Revenue (bar)
  - Branch-wise Occupancy (bar)
  - Lead Pipeline by Branch (stacked bar)
  - Monthly Trend (line)
- **Filters:** Date Range, Branch multi-select
- **Export:** CSV, Excel

---

#### `/dashboard/branch` — Branch Dashboard
- **Access:** All roles except receptionist
- **Description:** Day-to-day operational overview for the branch
- **KPI Cards:**
  - Today's Events
  - Pending Follow-ups (alert if > 0)
  - Advance Collected (MTD)
  - Pending Payments (alert)
  - New Leads This Week
  - Low Stock Items (alert)
- **Widgets:**
  - Hall Occupancy This Month (progress bars per hall)
  - Upcoming Events list (next 7 days)
  - Overdue Follow-ups list
  - AI Revenue Forecast card (30d / 60d / 90d)
  - Recent Lead Activity feed
- **Role-based visibility:** Kitchen manager sees stock widgets; accountant sees payment widgets; sales sees lead widgets

---

#### `/franchises` — Franchise Management
- **Access:** `super_admin` only
- **Sub-pages:**
  - `/franchises` — List view
  - `/franchises/create` — Create form
  - `/franchises/:id` — Detail with tabs: Overview, Branches, Staff, Reports, Settings
- **List Columns:** Franchise ID, Name, City/Region, Admin, Branches, Revenue, Status, Actions
- **Actions per row:** View, Edit, Disable, View Branches

---

#### `/branches` — Branch Management
- **Access:** `super_admin`, `franchise_admin`
- **Sub-pages:**
  - `/branches` — List view (scoped to franchise for franchise_admin)
  - `/branches/create` — Create form
  - `/branches/:id` — Detail with tabs: Overview, Halls, Staff, Reports, Settings
- **List Columns:** Branch Name, Franchise, City, Halls, Bookings (MTD), Revenue, Occupancy, Manager, Status
- **Actions:** View, Edit, Manage Halls

---

#### `/leads` — Lead Management
- **Access:** All roles (read varies)
- **Sub-pages:**
  - `/leads` — List with status filter tabs
  - `/leads/create` — Create form
  - `/leads/:id` — Lead detail with timeline
- **List Columns:** Lead ID, Client, Phone, Event Type, Preferred Date, Guests, Source, Status, AI Score, Assigned To, Created
- **Status Filter Tabs:** All | New | Contacted | Site Visit | Proposal | Hot | Warm | Cold | Converted | Lost | On Hold
- **Sort Options:** Date (newest), AI Score (highest), Followup Due (soonest)
- **Lead Detail Tabs:** Overview, Activity Timeline, Follow-ups, Proposal, Notes
- **AI Panel:** Score badge, suggested action, sentiment indicator, re-score button
- **Actions:** Convert to Booking, Add Follow-up, Schedule Site Visit, Generate Proposal, Mark Lost

---

#### `/bookings` — Booking Management
- **Access:** All roles (write varies)
- **Sub-pages:**
  - `/bookings` — List
  - `/bookings/create` — Create form
  - `/bookings/:id` — Detail with tabs: Overview, Payments, Invoice, Event Checklist
- **List Columns:** Booking ID, Client, Event Type, Hall, Date, Guests, Total, Advance, Balance, Status
- **Status Filter:** All | Confirmed | Tentative | Completed | Cancelled
- **Actions:** View Invoice, Record Payment, Generate Invoice, Convert to Event, Cancel

---

#### `/events` — Event Management
- **Access:** All roles (write varies)
- **Sub-pages:**
  - `/events` — List with date filter
  - `/events/:id` — Event detail with checklist, staff, vendors
- **Event Card Shows:** Event name, hall, date, guest count, checklist progress, assigned staff count
- **Detail Tabs:** Overview, Checklist, Staff Assignments, Vendors, Notes

---

#### `/calendar` — Booking Calendar
- **Access:** All roles
- **View Modes:** Month, Week, Day
- **Color Codes:** Green = confirmed, Yellow = tentative, Red = cancelled, Gray = past
- **Click on Day:** Shows bookings for that day in sidebar
- **Click on Booking:** Opens booking detail modal
- **Hall Filter:** View by specific hall or all halls
- **Drag & Drop:** Branch manager can reschedule tentative bookings

---

#### `/menus` — Menu Management
- **Access:** All roles (write: super_admin, franchise_admin, branch_manager, kitchen_manager)
- **Sub-pages:** List, Create, Edit
- **List Columns:** Menu Name, Type (Veg/Non-Veg/Mixed/Jain), Price/Plate, Min Plates, Applicable To, Status
- **Detail:** Full course breakdown — starters, main course, breads, desserts, beverages, live counters

---

#### `/vendors` — Vendor Management
- **Access:** All roles (write varies)
- **Sub-pages:** List, Create, Edit
- **List Columns:** Vendor Name, Type, Contact, Phone, Service Rate, Rating, Status
- **Vendor Types:** Decoration, Photography, Catering, AV & Sound, Lighting, Transport, Security, Cleaning, Flowers, Other

---

#### `/billing` — Billing & Invoices
- **Access:** All roles (write: super_admin, branch_manager, accountant)
- **Sub-pages:**
  - `/billing` — Invoice list
  - `/billing/:id` — Invoice detail + PDF preview
- **List Columns:** Invoice Number, Booking ID, Client, Event Date, Subtotal, Tax, Total, Paid, Due, Status
- **Invoice Status:** Draft | Sent | Partial | Paid | Overdue | Cancelled
- **Actions:** Preview PDF, Download PDF, Send via Email, Send via WhatsApp, Mark Paid, Cancel

---

#### `/payments` — Payment Records
- **Access:** Linked from billing; accountant and branch manager primary users
- **List Columns:** Payment ID, Booking, Client, Amount, Date, Mode, Reference, Collected By
- **Payment Modes:** Cash, UPI, Bank Transfer, Cheque, Card, Online

---

#### `/inventory` — Raw Materials & Inventory
- **Access:** Kitchen manager, branch manager, operations staff (read)
- **Sub-pages:** List, Create item, Stock Ledger per item
- **List Columns:** Item Name, Category, Unit, Current Stock, Min Stock, Price/Unit, Stock Value, Status
- **Alert:** Red banner when any item is below min stock level
- **Stock Actions:** Restock (add), Consume (deduct), Adjust, View Ledger

---

#### `/purchase-orders` — Purchase Orders
- **Access:** Branch manager, kitchen manager, accountant
- **Sub-pages:** List, Create PO, PO Detail
- **Columns:** PO Number, Vendor, Items, Total Amount, Status, Expected Delivery, Approved By
- **Status Flow:** Draft → Sent → Acknowledged → Delivered / Partial / Cancelled

---

#### `/staff` — Staff Management
- **Access:** super_admin (global), franchise_admin (franchise), branch_manager (branch CRU)
- **Sub-pages:** List, Create, Edit, Temporary Staff (special form)
- **List Columns:** Staff ID, Name, Role, Branch, Email, Employment Type, Status, Joined Date
- **Filters:** Role, Branch, Employment Type (Permanent/Temporary), Status
- **Special:** Temporary staff badge with countdown; expired temp staff shown in red

---

#### `/analytics` — Analytics & Reports
- **Access:** Varies by role (see RBAC matrix)
- **Tabs:**
  - Revenue — MTD/YTD, trends, by event type, by branch
  - Leads & Conversion — funnel, by source, by sales exec, conversion rate trend
  - Occupancy — hall-wise, month-wise heatmap, peak days
  - Events — by type, seasonal trends, guest count distribution
  - Financial — outstanding aging, payment mode breakdown, advance vs balance
  - Staff — follow-up activity per exec, lead count by assignee
- **Export Options per tab:** Export CSV, Export Excel, Export PDF (each generates via jsPDF or CSV download)
- **Date Filters:** Today, This Week, MTD, YTD, Custom Range
- **Scope Filters:** By branch (for franchise_admin and super_admin), by hall, by event type

---

#### `/settings/global` — Global Settings
- **Access:** `super_admin` only
- **Sections:** Platform Details, Branding, API Keys Management, Feature Flags, Default Policies

---

#### `/settings/franchise` — Franchise Settings
- **Access:** `super_admin`, `franchise_admin`
- **Sections:** Franchise Details, Logo Management, Notification Preferences (Resend from-email, WATI number), Booking Policies, GST/Tax Settings

---

#### `/settings/branch` — Branch Settings
- **Access:** `super_admin`, `franchise_admin`, `branch_manager`
- **Sections:** Branch Details, Hall Management, Operating Hours, Bank Details, Staff Roles Configuration

---

## 7. Forms — Complete Field Definitions

### 7.1 Login Form — `/login`

| Field | Type | Required | Validation |
|---|---|---|---|
| Email / Username | email | ✅ | Valid email format |
| Password | password | ✅ | Min 8 characters |
| Remember Me | checkbox | ❌ | — |

**Actions:** Login button, Forgot Password link (sends reset email via Firebase Auth)

---

### 7.2 Franchise Form — `/franchises/create` and `/franchises/:id/edit`

**Section 1: Franchise Information**

| Field | Type | Required | Options / Validation |
|---|---|---|---|
| Franchise Name | text | ✅ | Max 100 chars, e.g. "Prasad Food Divine" |
| Franchise Code | text | ✅ | Unique, uppercase, e.g. "PFD" — auto-checked against existing |
| Primary City / Region | text | ✅ | e.g. "Hyderabad" |
| Franchise Type | select | ✅ | Company-Owned, Franchisee-Owned |
| Franchise Agreement Start Date | date | ❌ | Must be before end date |
| Franchise Agreement End Date | date | ❌ | Must be after start date |
| Royalty / Commission (%) | number | ❌ | 0–100, hint: "Platform revenue share" |
| GST Number | text | ❌ | Format: 15-char GST validation |
| Contact Address | textarea | ❌ | Full address |
| Contact Email | email | ❌ | Franchise public email |
| Contact Phone | tel | ❌ | +91 format |
| Status | select | ✅ | Active, Inactive, Suspended |

**Section 2: Logo Upload**

| Field | Type | Required | Notes |
|---|---|---|---|
| Franchise Logo | file upload | ✅ | PNG/JPG, max 2MB. Uploaded to Cloudinary `franchises/{code}/logo`. Shown on login screen for all franchise/branch users. Thumbnail auto-generated. |
| Logo Dark Variant | file upload | ❌ | Optional dark-mode logo |

**Section 3: Franchise Admin Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Admin Full Name | text | ✅ | Creates Firebase Auth user |
| Admin Email (Login ID) | email | ✅ | Unique — becomes login credential |
| Admin Phone | tel | ✅ | +91 format — used for WhatsApp |
| Gender | select | ❌ | Male, Female, Other |
| Temporary Password | password | ✅ | Auto-generated or set manually. Must change on first login. |

**Section 4: Notification Preferences**

| Field | Type | Required | Notes |
|---|---|---|---|
| Resend From Email | email | ❌ | e.g. noreply@prasadfooddivine.com |
| Resend Reply-To Email | email | ❌ | e.g. info@prasadfooddivine.com |
| WATI Registered Phone | tel | ❌ | WhatsApp Business number |

**Actions:** Save & Create Franchise, Cancel  
**On Submit:** Creates `/franchises` doc → Creates franchise admin in Firebase Auth → Sets custom claims via Vercel Edge → Creates `/users` doc with `display_config.logo_url` → Sends welcome email (Resend) + WhatsApp (WATI) → Creates OneSignal segment for franchise

---

### 7.3 Branch Form — `/branches/create` and `/branches/:id/edit`

**Section 1: Branch Information**

| Field | Type | Required | Options / Validation |
|---|---|---|---|
| Franchise | select | ✅ | Dropdown of active franchises (super_admin sees all; franchise_admin sees own) |
| Branch Name | text | ✅ | e.g. "Banjara Hills Branch" |
| Branch Code | text | ✅ | Unique within franchise, e.g. "PFD-HYD-BH" |
| City | text | ✅ | e.g. "Hyderabad" |
| Full Address | textarea | ✅ | Street, Area, City, PIN |
| Pincode | text | ✅ | 6-digit |
| Google Maps URL | url | ❌ | Embedded map link |
| Number of Halls | number | ✅ | Count of halls in this branch |
| Max Capacity (guests) | number | ✅ | Total across all halls |
| Opening Time | time | ✅ | HH:MM format |
| Closing Time | time | ✅ | HH:MM format |
| Status | select | ✅ | Active, Inactive |

**Section 2: Financial Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| GST Number | text | ❌ | 15-char GST; shown on invoices |
| Bank Account Number | text | ❌ | For payment reference |
| Bank IFSC Code | text | ❌ | For NEFT/RTGS |
| Bank Name | text | ❌ | e.g. HDFC Bank |
| Default Advance % Required | number | ❌ | e.g. 30 (overrides franchise default) |
| Default Cancellation Policy | textarea | ❌ | Shown on invoices |

**Section 3: Branch Manager**

| Field | Type | Required | Notes |
|---|---|---|---|
| Manager Full Name | text | ✅ | Creates Firebase Auth user |
| Manager Email | email | ✅ | Unique login ID |
| Manager Phone | tel | ✅ | +91 format |
| Temporary Password | password | ✅ | Must change on first login |

**Actions:** Save & Create Branch, Cancel  
**On Submit:** Creates `/branches` doc with `franchise_snapshot` embedded → Creates branch manager Auth user → Sets custom claims → Creates `/users` doc → Copies franchise logo to user's `display_config` → Sends welcome messages

---

### 7.4 Hall Form — Within Branch Settings `/settings/branch` → Halls tab

| Field | Type | Required | Options |
|---|---|---|---|
| Hall Name | text | ✅ | e.g. "Grand Ballroom" |
| Hall Code | text | ✅ | e.g. "GB-01" |
| Hall Type | select | ✅ | Indoor, Outdoor, Rooftop, Garden |
| Seating Capacity | number | ✅ | |
| Standing Capacity | number | ❌ | |
| Area (sq ft) | number | ❌ | |
| Base Price — Full Day (₹) | number | ✅ | |
| Base Price — Per Slot (₹) | number | ❌ | Morning / Evening slot pricing |
| Extra Hour Charge (₹) | number | ❌ | |
| Amenities | multi-checkbox | ❌ | AC, Sound System, Projector, Stage, Parking, Changing Room, Generator, Catering Kitchen, Bridal Suite, Valet Parking |
| Hall Images | file upload (multi) | ❌ | Up to 10 images, Cloudinary upload |
| Primary Image | radio (from uploaded) | ❌ | Select which image is primary |
| Status | select | ✅ | Active, Inactive |

---

### 7.5 Staff Form — `/staff/create` (Permanent)

**Section 1: Personal Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text | ✅ | |
| Email (Login ID) | email | ✅ | Unique — Firebase Auth login |
| Phone Number | tel | ✅ | +91 format; used for WhatsApp |
| Gender | select | ❌ | Male, Female, Other |
| Date of Birth | date | ❌ | |
| Aadhar Number | text | ❌ | XXXX-XXXX-XXXX; stored encrypted |
| Profile Photo | file | ❌ | Cloudinary upload, `w_200,h_200,c_thumb,g_face` |
| Residential Address | textarea | ❌ | |

**Section 2: Role & Branch Assignment**

| Field | Type | Required | Notes |
|---|---|---|---|
| Assign to Branch | select | ✅ | **Staff are assigned to branches, not halls.** Dropdown shows branches in scope. |
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

**Notes** | textarea | ❌ | Internal notes about staff member

**Actions:** Add Staff Member, Cancel

---

### 7.6 Temporary Staff Form — `/staff/create?type=temporary`

> ⚠️ **Temporary Access — This staff member's system access will automatically expire 24 hours after creation. Their Firebase session is invalidated by client-side check on every auth state change.**

**All fields from permanent form, except:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Employment Type | display | — | Shows "Temporary (24 Hours)" — not editable |
| Access Start Date & Time | datetime-local | ✅ | Defaults to now |
| Access Expires At | display | — | Auto-computed = Access Start + 24 hours. Read-only display. |
| Reason for Temporary Access | textarea | ✅ | e.g. "Wedding event coverage — 2025-03-15" |
| Monthly Salary | hidden | — | Not shown for temporary staff |

**On Submit:** Creates user with `employment_type: "temporary"`, `temp_access.access_expires = start + 24h` → Custom claims include `is_temporary: true` → Sends WhatsApp (WATI `temp_access_wa`) to staff → Sends push (OneSignal) to branch manager → Creates OneSignal scheduled notification for 2h before expiry

---

### 7.7 Lead Form — `/leads/create` and `/leads/:id/edit`

**Section 1: Client Details**

| Field | Type | Required | Notes |
|---|---|---|---|
| Client Full Name | text | ✅ | |
| Primary Phone | tel | ✅ | Indexed — duplicate check on save |
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
| Guest Range | select | ❌ | Auto-set from guests count: < 100, 100–200, 200–400, 400–600, 600+ |
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
| Lead Source | select | ✅ | Instagram, Facebook, Google Ads, Website Form, JustDial, Sulekha, WeddingWire/WedMeGood, Google Business Profile, YouTube, Walk-in, Phone Call, Referral (Client), Referral (Vendor), Event Fair, Newspaper Ad, Banner/Hoarding, Repeat Client, Staff Referral, Other |
| Source Detail | text | ❌ | Free text context, e.g. "Saw reel of Kumar wedding" |
| Referrer Name | text | Conditional | Required if source = Referral Client/Vendor |
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

**Actions:** Save Lead, Save & Add Follow-up, Cancel  
**On Submit:** Creates `/leads` doc → Creates `/lead_activities` entry (type: `lead_created`) → Updates branch `_stats.leads_open` (increment) + `_stats.leads_by_source` → Creates `/notifications` for assigned sales exec → Sends OneSignal push to assigned exec → Sends WATI WhatsApp to client (template: `lead_ack_wa`) → Sends Resend email to client (template: `lead_received_client`) → Triggers Gemini AI scoring (async, updates lead after)

---

### 7.8 Follow-up Form — Modal on Lead Detail

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
| Attachments | file | ❌ | Upload brochure, quote, etc. to Cloudinary |

**Actions:** Save Follow-up, Cancel  
**On Submit:** Creates `/follow_ups` doc → Creates `/lead_activities` entry → Updates `leads/{id}.next_followup_date`, `leads/{id}.followup_count`, `leads/{id}.last_contacted_at` → Triggers Gemini sentiment analysis on notes (async) → Creates OneSignal scheduled notification for next follow-up date

---

### 7.9 Site Visit Form — Modal on Lead Detail

| Field | Type | Required | Notes |
|---|---|---|---|
| Visit Date | date | ✅ | |
| Visit Time | time | ✅ | |
| Number of Visitors | number | ❌ | e.g. 3 (family of 3) |
| Relation to Client | text | ❌ | e.g. "Client + parents" |
| Notes | textarea | ❌ | Preparation notes |
| Hall to Show | multi-select | ❌ | Halls to highlight during visit |

**On Submit:** Updates `leads/{id}.site_visit` → Creates activity entry (type: `site_visit_scheduled`) → Sends WATI WhatsApp to client (template: `site_visit_confirm_wa`) → Creates OneSignal reminder 2h before visit time

---

### 7.10 Booking Form — `/bookings/create`

**Section 1: Link to Lead (Optional)**

| Field | Type | Required | Notes |
|---|---|---|---|
| Link to Existing Lead | select / search | ❌ | Search by client name / phone. Auto-fills Section 2 |

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
| Hall | select | ✅ | **Real-time availability check.** Shows available halls for selected date/slot. Red if booked, green if available. |

**Section 4: Package & Menu**

| Field | Type | Required | Options |
|---|---|---|---|
| Package Type | select | ✅ | Basic, Standard, Premium, Luxury, Custom |
| Menu Package | select | ❌ | Active menus for this branch — shows price per plate |
| Catering Type | select | ❌ | Veg Only, Non-Veg, Mixed, Jain, No Catering |
| Special Dietary Notes | textarea | ❌ | |

**Section 5: Financials**

| Field | Type | Required | Notes |
|---|---|---|---|
| Total Amount (₹) | number | ✅ | |
| Discount Amount (₹) | number | ❌ | Requires discount reason |
| Discount Reason | text | Conditional | Required if discount > 0 |
| Tax % (GST) | number | ✅ | Default from branch settings |
| Tax Amount (₹) | display | — | Auto-computed |
| Grand Total (₹) | display | — | Auto-computed |
| Advance Amount (₹) | number | ✅ | Min = advance % × total |
| Balance Amount (₹) | display | — | Auto-computed |
| Advance Payment Mode | select | ✅ | Cash, UPI, Bank Transfer, Cheque, Card |
| Advance Payment Reference | text | Conditional | Required for UPI/Transfer/Cheque |

**Section 6: Requirements**

| Field | Type | Required | Notes |
|---|---|---|---|
| Decoration Notes | textarea | ❌ | |
| Catering Notes | textarea | ❌ | |
| AV / Sound Notes | textarea | ❌ | |
| Special Requirements | textarea | ❌ | |
| Booking Status | select | ✅ | Confirmed, Tentative |

**Actions:** Confirm Booking, Save as Tentative, Cancel  
**On Submit (Confirmed):** Creates `/bookings` doc → Creates `/payments` doc (advance) → Updates `/leads` (converted) → Updates branch + franchise `_stats` in batch → Writes audit log → Creates `/notifications` → Sends booking confirmation email (Resend) + WhatsApp (WATI) → Schedules OneSignal event reminders (48h + day-of)

---

### 7.11 Invoice Form — Generated from Booking

Not a manual form — generated automatically when booking is confirmed. Fields displayed for review/edit before sending:

| Field | Editable | Notes |
|---|---|---|
| Invoice Number | No | Auto-generated: `INV-{franchise_code}-{YYYY}-{seq}` |
| Invoice Date | Yes | Defaults to today |
| Due Date | Yes | Defaults to event date |
| Line Items | Yes | Add/remove/edit line items |
| Subtotal | No | Auto-computed |
| Discount | Yes | |
| Tax % | Yes | |
| Total | No | Auto-computed |
| Notes | Yes | Shown on PDF |

**Actions:** Preview PDF (jsPDF render), Download PDF, Send via Email, Send via WhatsApp, Save as Draft

---

### 7.12 Payment Form — Record Payment Modal

| Field | Type | Required | Options |
|---|---|---|---|
| Booking Reference | display | — | Read-only |
| Amount (₹) | number | ✅ | Cannot exceed balance due |
| Payment Date | date | ✅ | Defaults to today |
| Payment Mode | select | ✅ | Cash, UPI, Bank Transfer, Cheque, Card, Online |
| Reference Number | text | Conditional | Required for UPI / Transfer / Cheque |
| Collected By | display | — | Logged-in user name |
| Notes | text | ❌ | |

**Actions:** Record Payment, Cancel  
**On Submit:** Creates `/payments` doc → Updates booking balance + payment_status → Updates branch + franchise `_stats.outstanding_dues` → Generates receipt PDF → Sends receipt via WhatsApp + Email

---

### 7.13 Event Form — Create from Booking

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Name | text | ✅ | e.g. "Kumar Wedding" |
| Booking Reference | display | — | Linked booking |
| Event Date | display | — | From booking |
| Hall | display | — | From booking |
| Expected Guests | number | ✅ | Can differ from booking estimate |
| Confirmed Guests | number | ❌ | Updated closer to event |
| Catering Notes | textarea | ❌ | Specific day-of instructions |
| Decoration Notes | textarea | ❌ | |
| Special Instructions | textarea | ❌ | |

**Checklist Items** (add dynamically):

| Field | Type | Notes |
|---|---|---|
| Checklist Item Title | text | e.g. "Confirm flower delivery" |
| Category | select | Catering, Decoration, AV, Logistics, Staff, Housekeeping, Other |
| Due Date | date | |
| Assigned To | select | Staff of this branch |
| Notes | text | |

**Staff Assignment** (add multiple):

| Field | Type | Notes |
|---|---|---|
| Staff Member | select | Active staff of this branch |
| Responsibility | text | e.g. "Catering lead" |

**Vendor Assignment** (add multiple):

| Field | Type | Notes |
|---|---|---|
| Vendor | select | Active vendors |
| Service | text | e.g. "Decoration" |
| Amount (₹) | number | |

---

### 7.14 Menu Form

| Field | Type | Required | Options |
|---|---|---|---|
| Menu Name | text | ✅ | e.g. "Veg Premium Package" |
| Menu Type | select | ✅ | Veg, Non-Veg, Mixed, Jain |
| Price per Plate (₹) | number | ✅ | |
| Minimum Plates | number | ✅ | |
| Applicable To | select | ✅ | All branches in franchise, Specific branch |
| Starters | textarea / tag input | ❌ | List of items |
| Main Course | textarea / tag input | ❌ | |
| Breads | textarea / tag input | ❌ | |
| Desserts | textarea / tag input | ❌ | |
| Beverages | textarea / tag input | ❌ | |
| Live Counters | textarea / tag input | ❌ | e.g. Chaat, Dosa, Ice Cream |
| Is Customizable | checkbox | ❌ | Allow changes per booking |
| Status | select | ✅ | Active, Inactive |

---

### 7.15 Vendor Form

| Field | Type | Required | Options |
|---|---|---|---|
| Vendor Name | text | ✅ | |
| Vendor Type | select | ✅ | Decoration, Photography, Catering, AV & Sound, Lighting, Transport, Security, Cleaning, Flowers, Other |
| Contact Person Name | text | ✅ | |
| Contact Phone | tel | ✅ | |
| Contact Email | email | ❌ | |
| Address | textarea | ❌ | |
| GST Number | text | ❌ | |
| Rate per Event (₹) | number | ❌ | Starting rate for reference |
| Preferred Advance % | number | ❌ | |
| Bank Account | text | ❌ | |
| Bank IFSC | text | ❌ | |
| Notes | textarea | ❌ | Service notes, specializations |
| Rating | number | ❌ | 0–5 stars |
| Scope | select | ✅ | Franchise-wide, Specific branch |
| Status | select | ✅ | Active, Inactive |

---

### 7.16 Inventory Item Form

| Field | Type | Required | Options |
|---|---|---|---|
| Item Name | text | ✅ | e.g. "Basmati Rice" |
| Category | select | ✅ | Raw Material, Supplies, Beverages, Equipment, Decorations, Packaging, Cleaning, Other |
| Unit of Measurement | select | ✅ | Kg, Litre, Piece, Pack, Box, Dozen, Metre, Bag |
| Current Stock | number | ✅ | Opening stock |
| Minimum Stock Level | number | ✅ | Alert threshold — triggers notification when below |
| Price per Unit (₹) | number | ✅ | For stock valuation |
| Preferred Vendor | select | ❌ | From active vendors |
| Storage Instructions | textarea | ❌ | e.g. "Store in dry place" |
| Notes | textarea | ❌ | |

---

### 7.17 Purchase Order Form

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
| Add Line Item | button | | |
| Total Amount | display | — | Auto-computed |
| Notes to Vendor | textarea | ❌ | |
| Internal Notes | textarea | ❌ | |

---

### 7.18 Analytics Export — Options per Report

Each analytics tab has an export panel:

| Export Type | Format | Contents |
|---|---|---|
| Revenue Report | CSV / Excel / PDF | Date, Branch, Event Type, Amount, Tax, Total, Advance, Balance |
| Leads Report | CSV / Excel | Lead ID, Client, Source, Status, Assigned To, Created, Converted, Conversion Days |
| Conversion Funnel | PDF / PNG | Visual funnel with numbers and percentages |
| Occupancy Report | CSV / Excel | Hall, Date, Event, Status, Guests, Revenue |
| Staff Performance | CSV | Exec Name, Leads Assigned, Contacted, Converted, Conversion Rate, Follow-ups Logged |
| Outstanding Dues | CSV / Excel / PDF | Client, Booking ID, Total, Paid, Balance, Due Date, Days Overdue |
| Inventory Report | CSV | Item, Category, Stock, Min Stock, Value, Status |

---

## 8. Lead Tracking — Full Lifecycle & Sources

### 8.1 Lead Sources (Complete — 19 Sources)

| Category | Source ID | Display Name | Notes |
|---|---|---|---|
| **Digital — Paid** | `google_ads` | Google Ads | Search / Display / YouTube ads |
| **Digital — Paid** | `instagram_ads` | Instagram Ads | Separate from organic Instagram |
| **Digital — Paid** | `facebook_ads` | Facebook Ads | |
| **Digital — Organic** | `instagram` | Instagram (Organic) | DMs, story replies, profile visits |
| **Digital — Organic** | `facebook` | Facebook (Organic) | Page messages, posts |
| **Digital — Organic** | `youtube` | YouTube | Channel, organic video |
| **Digital — Listing** | `google_business` | Google Business Profile | GMB calls, messages, reviews |
| **Digital — Listing** | `justdial` | JustDial | Listing enquiry |
| **Digital — Listing** | `sulekha` | Sulekha | |
| **Digital — Listing** | `wedding_wire` | WeddingWire / WedMeGood | |
| **Digital — Own** | `website_form` | Website Contact Form | |
| **Digital — Own** | `ai_chatbot` | Website AI Chatbot | Gemini-powered widget |
| **Offline** | `walk_in` | Walk-in | Visited venue directly |
| **Offline** | `phone_call` | Phone Call | Direct call to reception |
| **Offline** | `referral_client` | Client Referral | Past client recommended |
| **Offline** | `referral_vendor` | Vendor Referral | Photographer, caterer, etc. |
| **Offline** | `event_fair` | Event / Bridal Fair | Expo or exhibition |
| **Offline** | `print_media` | Print Media | Newspaper, magazine |
| **Offline** | `outdoor_media` | Outdoor / Hoarding | Banners, hoardings |
| **Internal** | `repeat_client` | Repeat Client | Booked before |
| **Internal** | `staff_referral` | Staff Referral | Employee recommended |
| **Other** | `other` | Other | Free-text detail |

### 8.2 Lead Status Lifecycle — State Machine

```
[NEW]
  │  First outreach made (call/WhatsApp)
  ▼
[CONTACTED]
  │  Client shows interest, wants to see venue
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
  │  Price/package discussions ongoing
  ▼
  ├──────────────────────────┐
  │                          │
  ▼                          ▼
[HOT]                    [WARM]
Strong intent,           Moderate interest,
needs follow-up          taking time
  │                          │
  │              ┌───────────┘
  │              ▼
  │          [COLD]
  │          Unresponsive / low interest
  │              │
  └──────┬───────┘
         │
    ┌────┴─────┐────────────┐
    ▼          ▼            ▼
[CONVERTED]  [LOST]     [ON HOLD]
Creates       Records     Future date
/booking      reason,     revisit
              competitor
```

### 8.3 Lead Status Definitions

| Status | Definition | Typical Duration | Action Required |
|---|---|---|---|
| New | Just entered — not yet contacted | 0–1 day | Contact within 2 hours |
| Contacted | First contact made, engaged | 1–3 days | Schedule site visit or send info |
| Site Visit Scheduled | Appointment set | 1–7 days | Prepare venue, confirm day before |
| Site Visit Done | Venue shown, proposal expected | 1–3 days | Send proposal within 24h |
| Proposal Sent | Quote delivered | 2–7 days | Follow up after 2 days |
| Negotiation | Active price/package discussion | 3–14 days | Be responsive, offer alternatives |
| Hot | High intent, likely to book | Immediate | Close within 48h |
| Warm | Interested but not urgent | 1–3 weeks | Regular touch every 3–4 days |
| Cold | Low response, low intent | — | Monthly touch; reassess |
| Converted | Booking confirmed | — | Create booking, mark converted |
| Lost | Will not book | — | Record reason, competitor |
| On Hold | Future event (6+ months away) | — | Automated reminder set |

### 8.4 Lead Lost Reasons

| Reason Code | Display | Action |
|---|---|---|
| `budget_mismatch` | Budget Mismatch | Note budget range; review pricing strategy |
| `date_unavailable` | Date Not Available | Suggest alternate dates earlier |
| `chose_competitor` | Chose Competitor | Record competitor name |
| `no_response` | No Response (Ghosted) | After 3 attempts, mark cold/lost |
| `postponed` | Event Postponed Indefinitely | Move to On Hold |
| `cancelled_event` | Event Cancelled | Note reason |
| `not_suitable` | Venue Not Suitable | Note requirement gap |
| `other` | Other | Free text |

### 8.5 Lead Activity Types (Timeline)

| Activity Type | Triggered By | Icon |
|---|---|---|
| `lead_created` | System (on form submit) | 🌟 |
| `status_changed` | User action | 🔄 |
| `call_made` | Follow-up log | 📞 |
| `call_received` | Manual log | 📲 |
| `whatsapp_sent` | System / manual | 💬 |
| `whatsapp_received` | WATI webhook / manual | 💬 |
| `email_sent` | Resend trigger | ✉️ |
| `site_visit_scheduled` | Site visit form | 🗓 |
| `site_visit_completed` | Manual update | 🏛 |
| `proposal_sent` | Proposal action | 📄 |
| `proposal_viewed` | Cloudinary link tracking | 👁 |
| `followup_logged` | Follow-up form | 📝 |
| `note_added` | Notes section | 🗒 |
| `assigned` | Assignment change | 👤 |
| `converted` | Booking creation | ✅ |
| `lost` | Lost action | ❌ |
| `on_hold` | On hold action | ⏸ |
| `ai_scored` | Gemini AI | 🤖 |
| `ai_suggestion_applied` | User applied AI tip | 💡 |
| `reminder_sent` | OneSignal schedule | 🔔 |

---

## 9. Database — Collection Structure

### 9.1 Overview

All collections are **flat** (top-level), not nested. Every document carries `franchise_id` and `branch_id` for compound query scoping. Subcollections are used only where data is always accessed through a known parent and never queried across parents.

```
/platform/{platformId}                       → Singleton: Coding Gurus config
/config/{docId}                              → API keys (admin-only read)
/franchises/{franchiseId}                    → One per franchise
/branches/{branchId}                         → One per branch, franchise_id scoped
/halls/{hallId}                              → Halls, branch_id scoped
/users/{userId}                              → All users (= Firebase Auth UID)
/leads/{leadId}                              → Enquiries, franchise + branch scoped
/lead_activities/{activityId}               → Lead timeline events
/follow_ups/{followUpId}                    → Scheduled follow-ups
/bookings/{bookingId}                        → Bookings, franchise + branch scoped
/events/{eventId}                            → Events linked to bookings
  └── /checklist_items/{itemId}              → Per-event checklist (subcollection)
/menus/{menuId}                              → Menu packages
/vendors/{vendorId}                          → Vendor registry
/billing/{invoiceId}                         → Invoices per booking
/payments/{paymentId}                        → Payment transactions
/raw_materials/{itemId}                      → Inventory per branch
  └── /stock_ledger/{entryId}               → Stock movement history (subcollection)
/purchase_orders/{poId}                      → Purchase orders
/notifications/{notificationId}             → In-app notification log
/audit_logs/{logId}                          → Immutable write audit trail
/ai_insights/{insightId}                    → Cached AI computation results
```

### 9.2 Why Flat Over Nested

Firestore subcollections cannot be queried across parent documents. A nested structure like `/franchises/{id}/branches/{id}/leads/{id}` would make it impossible to query "all leads for a franchise" without multiple reads.

With flat collections + compound indexes on `franchise_id` + `branch_id`, a single query can filter any scope:
- Super admin: no filter (or filter on `franchise_id` for any franchise)
- Franchise admin: `where("franchise_id", "==", myFranchiseId)`
- Branch staff: `where("branch_id", "==", myBranchId)`

---

## 10. Database — Schema Definitions

### 10.1 `/platform/coding_gurus` — Platform Singleton

```js
{
  platform_id:         "coding_gurus",
  name:                "Coding Gurus",
  tagline:             "Banquet Management Platform",
  support_email:       "support@codinggurus.com",
  support_phone:       "+91-XXXXXXXXXX",
  website:             "https://codinggurus.com",
  logo_url:            "https://res.cloudinary.com/cg/.../cg_logo.png",
  favicon_url:         "https://res.cloudinary.com/cg/.../favicon.png",
  default_currency:    "INR",
  default_timezone:    "Asia/Kolkata",
  default_date_format: "DD/MM/YYYY",
  default_advance_pct: 30,
  features: {
    ai_suggestions:       true,
    whatsapp_enabled:     true,
    email_enabled:        true,
    inventory_enabled:    true,
    pos_enabled:          false,
    ai_chatbot_enabled:   true,
  },
  _stats: {
    total_franchises:     1,
    total_branches:       3,
    total_users:          28,
    total_bookings_mtd:   42,
    total_revenue_mtd:    2840000,
    last_updated_at:      Timestamp,
  },
  created_at:           Timestamp,
  updated_at:           Timestamp,
  updated_by:           "superAdminUid",
}
```

---

### 10.2 `/config/keys` — API Keys (super_admin read only)

```js
{
  resend_api_key:              "re_XXXXXXXXXX",
  resend_default_from:         "noreply@codinggurus.com",
  wati_api_url:                "https://live-server-XXXXX.wati.io",
  wati_api_token:              "XXXXXXXXXX",
  onesignal_app_id:            "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  onesignal_rest_api_key:      "XXXXXXXXXX",
  cloudinary_cloud_name:       "cg-banquet",
  cloudinary_upload_preset_logo:  "franchise_logo",
  cloudinary_upload_preset_hall:  "hall_images",
  cloudinary_upload_preset_staff: "staff_profile",
  cloudinary_upload_preset_pdf:   "pdf_upload",
  gemini_api_key:              "XXXXXXXXXX",
  gemini_model:                "gemini-1.5-flash",
  updated_at:                  Timestamp,
  updated_by:                  "superAdminUid",
}
```

---

### 10.3 `/franchises/{franchiseId}`

```js
{
  franchise_id:         "auto-id",
  franchise_name:       "Prasad Food Divine",
  franchise_code:       "PFD",                   // unique, indexed
  region_city:          "Hyderabad",
  franchise_type:       "Franchisee-Owned",       // "Company-Owned" | "Franchisee-Owned"

  // ─── LOGO ────────────────────────────────────────────────────────────
  // Uploaded during onboarding. Shown on login screen for all franchise/branch users.
  // Copied into users/{uid}.display_config on user creation for zero-read login display.
  logo: {
    cloudinary_public_id:  "franchises/pfd/logo",
    url:                   "https://res.cloudinary.com/cg/.../logo.png",
    thumbnail_url:         "https://res.cloudinary.com/cg/w_64,h_64,c_fit/.../logo.png",
    original_filename:     "pfd_logo.png",
    file_size_bytes:       184320,
    uploaded_at:           Timestamp,
    uploaded_by:           "superAdminUid",
  },
  logo_dark: {              // optional dark-mode variant
    cloudinary_public_id:  null,
    url:                   null,
  },

  // ─── Agreement ────────────────────────────────────────────────────────
  agreement_start_date:  Timestamp,
  agreement_end_date:    Timestamp,
  royalty_percentage:    8,

  // ─── Contact ─────────────────────────────────────────────────────────
  contact_address:       "Hyderabad, Telangana",
  contact_email:         "info@prasadfooddivine.com",
  contact_phone:         "+91-9000000000",
  gst_number:            "36ABCDE1234F1Z5",
  is_active:             true,
  status:                "Active",               // "Active" | "Inactive" | "Suspended"

  // ─── Admin Snapshot (denormalized) ───────────────────────────────────
  admin_user_id:         "userId",
  admin_snapshot: {
    name:                "Prasad Rao",
    email:               "prasad@pfd.com",
    phone:               "+91-9000000001",
  },

  // ─── Notification Config ─────────────────────────────────────────────
  notifications: {
    resend_from_email:   "noreply@prasadfooddivine.com",
    resend_reply_to:     "info@prasadfooddivine.com",
    wati_phone_number:   "+91-9000000000",
    onesignal_segment:   "franchise-pfd",
  },

  // ─── Pre-aggregated Stats (dashboard in 1 read) ───────────────────────
  _stats: {
    total_branches:          3,
    total_bookings_mtd:      42,
    total_revenue_mtd:       2840000,
    total_revenue_ytd:       18200000,
    total_leads_open:        18,
    total_leads_hot:         7,
    outstanding_dues:        415000,
    conversion_rate_pct:     18.2,
    avg_conversion_days:     17,
    last_updated_at:         Timestamp,
  },

  created_at:            Timestamp,
  created_by:            "superAdminUid",
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.4 `/branches/{branchId}`

```js
{
  branch_id:             "auto-id",
  franchise_id:          "franchiseId",           // indexed — primary scope key

  branch_name:           "Banjara Hills Branch",
  branch_code:           "PFD-HYD-BH",           // unique within franchise
  city:                  "Hyderabad",
  full_address:          "Road No. 12, Banjara Hills, Hyderabad - 500034",
  pincode:               "500034",
  google_maps_url:       "https://maps.google.com/?q=...",
  opening_time:          "09:00",
  closing_time:          "23:00",
  max_capacity_guests:   1500,
  gst_number:            "36ABCDE9999F1Z5",
  bank_account_number:   "XXXXXXXX",
  bank_ifsc:             "HDFC0000001",
  bank_name:             "HDFC Bank",
  default_advance_pct:   30,
  cancellation_policy:   "30 days notice required for full refund",

  manager_user_id:       "userId",
  manager_snapshot: {
    name:                "Arjun Reddy",
    email:               "arjun@pfd.com",
    phone:               "+91-9000000010",
  },

  // ─── Franchise Snapshot ───────────────────────────────────────────────
  // Denormalized from franchise. Avoids /franchises read on branch screens.
  // Contains logo — shown on staff login. Copied to user.display_config on user creation.
  franchise_snapshot: {
    franchise_name:      "Prasad Food Divine",
    franchise_code:      "PFD",
    logo_url:            "https://res.cloudinary.com/.../logo.png",
    logo_thumbnail_url:  "https://res.cloudinary.com/w_64,h_64/.../logo.png",
  },

  is_active:             true,
  status:                "Active",

  onesignal_segment:     "branch-pfd-hyd-bh",    // for targeted push

  // ─── Pre-aggregated Dashboard Stats ──────────────────────────────────
  _stats: {
    total_halls:             2,
    total_staff:             12,
    bookings_mtd:            24,
    revenue_mtd:             1200000,
    revenue_ytd:             7800000,
    outstanding_dues:        180000,
    occupancy_pct_mtd:       78,
    events_today:            1,
    events_this_week:        3,
    low_stock_count:         2,
    last_updated_at:         Timestamp,
  },
  _lead_stats: {
    total_leads:             48,
    leads_by_status: {
      new: 5, contacted: 8, site_visit_scheduled: 3, site_visit_done: 4,
      proposal_sent: 6, negotiation: 5, hot: 7, warm: 6, cold: 4,
      converted: 8, lost: 2, on_hold: 1,
    },
    leads_by_source: {
      instagram: 12, referral_client: 9, walk_in: 8, google_ads: 6,
      website_form: 5, justdial: 4, phone_call: 4,
    },
    conversion_rate_pct:     16.7,
    avg_conversion_days:     18,
    leads_overdue_followup:  7,
    top_lost_reason:         "budget_mismatch",
    top_competitor:          "Royal Gardens",
    last_updated_at:         Timestamp,
  },

  created_at:            Timestamp,
  created_by:            "userId",
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.5 `/halls/{hallId}`

```js
{
  hall_id:               "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",              // indexed

  hall_name:             "Grand Ballroom",
  hall_code:             "GB-01",
  capacity_seated:       500,
  capacity_standing:     800,
  hall_type:             "Indoor",                // "Indoor"|"Outdoor"|"Rooftop"|"Garden"
  area_sqft:             5000,

  pricing: {
    base_price_full_day:   150000,
    base_price_per_slot:   80000,
    extra_hour_charge:     10000,
  },

  amenities:             ["AC", "Sound System", "Projector", "Stage", "Parking", "Generator"],

  images: [
    {
      cloudinary_public_id: "halls/gb01/primary",
      url:                  "https://res.cloudinary.com/.../primary.jpg",
      thumbnail_url:        "https://res.cloudinary.com/w_400/.../primary.jpg",
      caption:              "Main hall entrance",
      is_primary:           true,
      uploaded_at:          Timestamp,
    }
  ],

  is_active:             true,
  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.6 `/users/{userId}` — userId = Firebase Auth UID

```js
{
  user_id:               "firebaseAuthUid",
  franchise_id:          "franchiseId",           // null for super_admin; indexed
  branch_id:             "branchId",              // null for super_admin/franchise_admin; indexed
  role:                  "sales_executive",        // indexed

  full_name:             "Kavya Singh",
  email:                 "kavya@pfd.com",          // indexed, unique
  phone:                 "+91-9000000020",         // indexed
  gender:                "Female",
  date_of_birth:         Timestamp,
  aadhar_number:         "XXXX-XXXX-XXXX",        // encrypted at app layer
  address:               "Hyderabad",
  profile_photo_url:     "https://res.cloudinary.com/.../kavya.jpg",

  joining_date:          Timestamp,
  monthly_salary:        25000,
  employment_type:       "permanent",             // "permanent" | "temporary"

  // ─── Temporary Staff Fields (only if employment_type = "temporary") ──
  temp_access: {
    is_temporary:        true,
    access_start:        Timestamp,
    access_expires:      Timestamp,              // access_start + 24 hours
    created_by:          "branchManagerUid",
    reason:              "Event coverage — Wedding 2025-03-15",
    is_expired:          false,                  // updated by client on expiry detection
  },

  emergency_contact: {
    name:                "Ramesh Singh",
    phone:               "+91-9000000099",
    relation:            "Father",
  },

  // ─── Login Display Config ──────────────────────────────────────────────
  // Pre-copied from franchise doc on user creation. Zero extra reads on login.
  display_config: {
    show_franchise_logo: true,
    logo_url:            "https://res.cloudinary.com/.../pfd_logo.png",
    logo_thumbnail_url:  "https://res.cloudinary.com/w_64,h_64/.../pfd_logo.png",
    theme_color:         "#F59E0B",
  },

  // ─── OneSignal ────────────────────────────────────────────────────────
  onesignal_player_id:   "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",

  is_active:             true,
  is_temporary:          false,
  last_login_at:         Timestamp,
  notify_email:          true,
  notify_whatsapp:       true,
  notify_push:           true,

  created_at:            Timestamp,
  created_by:            "managerUserId",
  updated_at:            Timestamp,
  updated_by:            "managerUserId",
  disabled_at:           null,
  disabled_by:           null,
}
```

---

### 10.7 `/leads/{leadId}`

```js
{
  lead_id:               "auto-id",
  franchise_id:          "franchiseId",           // indexed
  branch_id:             "branchId",              // indexed

  // ─── Client ───────────────────────────────────────────────────────────
  client_name:           "Rajesh Kumar",
  phone:                 "+91-9876543210",         // indexed — duplicate check
  email:                 "rajesh@email.com",
  alt_phone:             null,
  client_type:           "Individual",             // "Individual"|"Corporate"|"NGO"
  company_name:          null,

  // ─── Event Requirements ───────────────────────────────────────────────
  event_type:            "Wedding",
  preferred_date:        Timestamp,               // indexed
  alt_date_1:            Timestamp,
  alt_date_2:            Timestamp,
  expected_guests:       500,
  guest_range:           "400-600",
  hall_preference:       "Grand Ballroom",
  time_slot:             "Full Day",
  catering_required:     true,
  decoration_required:   true,
  accommodation_required: false,

  // ─── Budget ───────────────────────────────────────────────────────────
  budget_min:            300000,
  budget_max:            600000,
  budget_flexibility:    "Moderate",

  // ─── Source ──────────────────────────────────────────────────────────
  source:                "instagram",             // indexed — 22 possible values
  source_detail:         "Saw reel of Kumar wedding",
  referrer_name:         null,
  referrer_contact:      null,

  // ─── Status & Lifecycle ───────────────────────────────────────────────
  status:                "Hot",                   // indexed
  priority:              "High",

  status_history: [
    { status: "New",       changed_at: Timestamp, changed_by: "userId", note: "Lead created via Instagram" },
    { status: "Contacted", changed_at: Timestamp, changed_by: "userId", note: "Called — interested" },
    { status: "Hot",       changed_at: Timestamp, changed_by: "userId", note: "Very keen, wants proposal" },
  ],

  lost_reason:           null,
  lost_detail:           null,
  competitor_chosen:     null,
  on_hold_reason:        null,
  on_hold_until:         null,

  // ─── Assignment ───────────────────────────────────────────────────────
  assigned_to_user_id:   "salesExecUserId",       // indexed
  assigned_snapshot: {
    name:                "Kavya Singh",
    phone:               "+91-9000000020",
  },
  assigned_at:           Timestamp,
  reassigned_from:       null,

  // ─── Site Visit ───────────────────────────────────────────────────────
  site_visit: {
    is_scheduled:        true,
    scheduled_date:      Timestamp,
    visitor_count:       3,
    visitor_notes:       "Client + parents",
    halls_to_show:       ["Grand Ballroom", "Open Air Lawn"],
    done:                false,
    done_at:             null,
    outcome:             null,
  },

  // ─── Proposal ─────────────────────────────────────────────────────────
  proposal: {
    sent:                false,
    sent_at:             null,
    sent_via:            null,
    proposal_url:        null,
    cloudinary_public_id: null,
    proposal_viewed:     false,
    viewed_at:           null,
  },

  // ─── Follow-up ────────────────────────────────────────────────────────
  next_followup_date:    Timestamp,               // indexed (overdue query)
  next_followup_type:    "Call",
  followup_count:        2,
  last_contacted_at:     Timestamp,
  last_contacted_via:    "WhatsApp",

  // ─── Conversion ───────────────────────────────────────────────────────
  is_converted:          false,
  converted_booking_id:  null,
  converted_at:          null,
  conversion_days:       null,

  // ─── AI Fields ────────────────────────────────────────────────────────
  ai_score:              78,
  ai_score_label:        "High",
  ai_score_updated_at:   Timestamp,
  ai_suggested_action:   "Send proposal with Garden Hall alternative — budget fits better",
  ai_risk_factors:       ["Date 6 weeks away — create urgency", "No site visit yet"],
  ai_tags:               ["high-value", "flexible-date", "wedding-peak-season"],
  ai_sentiment:          "Positive",

  // ─── Branch Snapshot ─────────────────────────────────────────────────
  branch_snapshot: {
    branch_name:         "Banjara Hills Branch",
    city:                "Hyderabad",
  },

  notes:                 "Client wants rooftop as backup",
  internal_notes:        "Father is particular about food quality",

  created_at:            Timestamp,               // indexed
  created_by:            "userId",
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.8 `/lead_activities/{activityId}` — Lead Timeline

```js
{
  activity_id:           "auto-id",
  lead_id:               "leadId",               // indexed
  franchise_id:          "franchiseId",
  branch_id:             "branchId",

  activity_type:         "call_made",             // see full enum in §8.5
  title:                 "Call Made",
  description:           "Spoke 8 mins. Interested in Grand Ballroom for March 15.",
  outcome:               "Positive",

  call_duration_mins:    8,
  call_answered:         true,
  message_preview:       null,
  sent_via:              null,
  old_status:            null,
  new_status:            null,

  next_action:           "Send proposal by end of week",
  next_action_date:      Timestamp,

  attachments: [],

  done_by_user_id:       "salesExecUid",
  done_by_snapshot: {
    name:                "Kavya Singh",
    role:                "sales_executive",
  },

  is_ai_generated:       false,

  created_at:            Timestamp,               // indexed (for timeline sort)
}
```

---

### 10.9 `/follow_ups/{followUpId}`

```js
{
  followup_id:           "auto-id",
  lead_id:               "leadId",               // indexed
  franchise_id:          "franchiseId",
  branch_id:             "branchId",

  scheduled_date:        Timestamp,              // indexed
  followup_type:         "Call",
  outcome:               "Interested",
  notes:                 "Client confirmed guest count at 500. Wants proposal.",
  next_followup_date:    Timestamp,
  next_followup_type:    "WhatsApp",

  call_duration_mins:    12,
  call_answered:         true,

  is_overdue:            false,
  overdue_by_days:       0,

  done_by_user_id:       "userId",
  done_by_snapshot: {
    name:                "Kavya Singh",
  },

  onesignal_notification_id: "XXXXXXXX",        // for cancellation if lead converts

  created_at:            Timestamp,
}
```

---

### 10.10 `/bookings/{bookingId}`

```js
{
  booking_id:            "auto-id",
  franchise_id:          "franchiseId",          // indexed
  branch_id:             "branchId",             // indexed
  lead_id:               "leadId",               // null if direct booking

  // ─── Client (denormalized) ────────────────────────────────────────────
  client_name:           "Rajesh Kumar",
  client_phone:          "+91-9876543210",
  client_email:          "rajesh@email.com",
  client_alt_phone:      null,
  client_address:        "Hyderabad",
  client_gst_number:     null,

  // ─── Event ────────────────────────────────────────────────────────────
  event_type:            "Wedding",
  event_date:            Timestamp,              // indexed
  event_time_slot:       "Full Day",
  event_start_time:      "10:00",
  event_end_time:        "22:00",
  expected_guests:       500,

  // ─── Hall (denormalized) ──────────────────────────────────────────────
  hall_id:               "hallId",
  hall_snapshot: {
    hall_name:           "Grand Ballroom",
    capacity_seated:     500,
    hall_type:           "Indoor",
  },

  // ─── Package & Menu ───────────────────────────────────────────────────
  package_type:          "Premium",
  menu_id:               "menuId",
  menu_snapshot: {
    menu_name:           "Veg Premium Package",
    price_per_plate:     850,
    menu_type:           "Veg",
  },
  catering_type:         "Veg Only",

  // ─── Financials ───────────────────────────────────────────────────────
  total_amount:          450000,
  discount_amount:       0,
  discount_reason:       null,
  tax_percentage:        10,
  tax_amount:            45000,
  grand_total:           495000,
  advance_amount:        150000,
  balance_amount:        345000,                 // updated on each payment
  payments_collected:    150000,                 // sum of payments
  payment_status:        "Partial",              // "Unpaid"|"Partial"|"Paid"|"Refunded"

  // ─── Status ───────────────────────────────────────────────────────────
  status:                "Confirmed",            // indexed
  cancellation_reason:   null,
  cancelled_at:          null,
  cancelled_by:          null,

  // ─── Notes ────────────────────────────────────────────────────────────
  notes:                 "Vegetarian only, no alcohol",
  decoration_notes:      "Floral arch at entrance",
  catering_notes:        "Extra dessert counter",
  av_notes:              "Need 4 wireless mics",

  // ─── OneSignal (scheduled reminder IDs for cancellation if needed) ────
  onesignal_reminder_48h: "notification-id",
  onesignal_reminder_day_of: "notification-id",

  created_at:            Timestamp,
  created_by:            "userId",
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.11 `/events/{eventId}` + Subcollection

```js
{
  event_id:              "auto-id",
  booking_id:            "bookingId",            // indexed
  franchise_id:          "franchiseId",          // indexed
  branch_id:             "branchId",             // indexed

  event_name:            "Kumar Wedding",
  event_date:            Timestamp,              // indexed
  event_type:            "Wedding",

  hall_id:               "hallId",
  hall_snapshot: { hall_name: "Grand Ballroom" },

  client_snapshot: {
    name:                "Rajesh Kumar",
    phone:               "+91-9876543210",
  },

  expected_guests:       500,
  confirmed_guests:      480,

  status:                "Upcoming",             // "Upcoming"|"In Progress"|"Completed"|"Cancelled"

  // Staff assigned to this event (branch staff — not hall-specific)
  assigned_staff: [
    { user_id: "uid1", name: "Raju Cook", role: "kitchen_manager", responsibility: "Catering lead" },
    { user_id: "uid2", name: "Vijay Kumar", role: "operations_staff", responsibility: "Setup & logistics" },
  ],

  assigned_vendors: [
    { vendor_id: "vid1", vendor_name: "Star Decorators", service: "Decoration", amount: 25000 },
  ],

  checklist_total:       10,
  checklist_done:        7,

  catering_notes:        "Extra halwa counter added",
  decoration_notes:      "Floral arch confirmed",
  notes:                 "",

  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
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
  done_by_name:          null,
  done_at:               null,
  due_date:              Timestamp,
  assigned_to_user_id:   "userId",
  assigned_to_name:      "Vijay Kumar",
  notes:                 "Vendor confirmed 6AM delivery",
  order:                 1,
}
```

---

### 10.12 `/billing/{invoiceId}`

```js
{
  invoice_id:            "auto-id",
  invoice_number:        "INV-PFD-2025-0042",   // unique, auto-generated
  franchise_id:          "franchiseId",          // indexed
  branch_id:             "branchId",             // indexed
  booking_id:            "bookingId",            // indexed

  client_snapshot: {
    name:                "Rajesh Kumar",
    phone:               "+91-9876543210",
    email:               "rajesh@email.com",
    address:             "Hyderabad",
    gst_number:          null,
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
    { description: "Catering — Veg Premium (500 plates × ₹850)", qty: 500, unit_price: 850, amount: 425000 },
    { description: "Decoration Package", qty: 1, unit_price: 25000, amount: 25000 },
  ],

  subtotal:              600000,
  discount_amount:       0,
  tax_percentage:        10,
  tax_amount:            60000,
  total_amount:          660000,
  amount_paid:           150000,
  amount_due:            510000,

  invoice_date:          Timestamp,
  due_date:              Timestamp,
  status:                "Partial",

  pdf: {
    cloudinary_public_id: "invoices/INV-PFD-2025-0042",
    url:                  "https://res.cloudinary.com/.../INV-PFD-2025-0042.pdf",
    generated_at:         Timestamp,
    generated_by:         "userId",
  },

  sent_via_email:        true,
  sent_via_whatsapp:     true,
  sent_at:               Timestamp,
  notes:                 "Payment due before event date",

  created_at:            Timestamp,
  created_by:            "userId",
  updated_at:            Timestamp,
}
```

---

### 10.13 `/payments/{paymentId}`

```js
{
  payment_id:            "auto-id",
  franchise_id:          "franchiseId",          // indexed
  branch_id:             "branchId",             // indexed
  booking_id:            "bookingId",            // indexed
  invoice_id:            "invoiceId",

  amount:                150000,
  payment_date:          Timestamp,              // indexed
  payment_mode:          "UPI",                  // "Cash"|"UPI"|"Bank Transfer"|"Cheque"|"Card"|"Online"
  reference_number:      "UPI-XXXX-XXXX",
  is_advance:            true,

  collected_by_user_id:  "userId",
  collected_by_snapshot: {
    name:                "Arjun Reddy",
    role:                "branch_manager",
  },

  receipt_pdf: {
    cloudinary_public_id: "receipts/RCT-001",
    url:                  "https://res.cloudinary.com/.../receipt.pdf",
  },

  notes:                 "Advance payment — booking confirmation",
  created_at:            Timestamp,
  created_by:            "userId",
}
```

---

### 10.14 `/raw_materials/{itemId}`

```js
{
  item_id:               "auto-id",
  franchise_id:          "franchiseId",          // indexed
  branch_id:             "branchId",             // indexed

  item_name:             "Basmati Rice",
  category:              "Raw Material",
  unit:                  "Kg",
  current_stock:         45,
  min_stock_level:       100,
  is_low_stock:          true,                   // computed on every stock change
  price_per_unit:        85,
  stock_value:           3825,                   // current_stock × price_per_unit

  preferred_vendor_id:   "vendorId",
  preferred_vendor_snapshot: {
    vendor_name:         "Fresh Grains Supplier",
    contact_phone:       "+91-9000000060",
  },

  storage_notes:         "Store in dry, cool place",
  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

**Subcollection: `/raw_materials/{itemId}/stock_ledger/{entryId}`**

```js
{
  entry_id:              "auto-id",
  type:                  "In",                   // "In"|"Out"|"Adjustment"
  quantity:              100,
  balance_after:         145,
  reference_po_id:       "poId",
  reference_event_id:    null,
  notes:                 "Received from supplier — PO-PFD-BH-2025-018",
  done_by_user_id:       "userId",
  done_by_name:          "Raju Cook",
  created_at:            Timestamp,
}
```

---

### 10.15 `/purchase_orders/{poId}`

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
    { item_id: "iid2", item_name: "Cooking Oil", qty: 50, unit: "Litre", unit_price: 140, amount: 7000 },
  ],

  total_amount:          15500,
  paid_amount:           0,
  status:                "Sent",                 // "Draft"|"Sent"|"Acknowledged"|"Delivered"|"Partial"|"Cancelled"
  expected_delivery:     Timestamp,
  delivered_at:          null,

  notes_to_vendor:       "Please deliver before 8 AM on March 14",
  internal_notes:        "",

  pdf: {
    cloudinary_public_id: "purchase_orders/PO-PFD-BH-2025-0018",
    url:                  "https://res.cloudinary.com/.../po.pdf",
  },

  created_at:            Timestamp,
  created_by:            "userId",
  approved_by:           "branchManagerUid",
  approved_at:           Timestamp,
}
```

---

### 10.16 `/vendors/{vendorId}`

```js
{
  vendor_id:             "auto-id",
  franchise_id:          "franchiseId",          // null = global platform vendor
  branch_id:             "branchId",             // null = franchise-wide

  vendor_name:           "Star Decorators",
  vendor_type:           "Decoration",
  contact_name:          "Sunil Kumar",
  contact_phone:         "+91-9000000050",
  contact_email:         "sunil@stardecorators.com",
  address:               "Hyderabad",
  gst_number:            "36XXXXX",
  bank_account:          "XXXXXXXX",
  bank_ifsc:             "SBIN0000001",

  rate_per_event:        25000,
  preferred_advance_pct: 20,
  rating:                4.5,
  notes:                 "Preferred vendor. Specializes in floral setups.",

  is_active:             true,
  scope:                 "branch",               // "platform"|"franchise"|"branch"

  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.17 `/menus/{menuId}`

```js
{
  menu_id:               "auto-id",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",             // null = all branches in franchise

  menu_name:             "Veg Premium Package",
  menu_type:             "Veg",                  // "Veg"|"Non-Veg"|"Mixed"|"Jain"
  price_per_plate:       850,
  min_plates:            100,

  courses: {
    starters:            ["Paneer Tikka", "Veg Spring Rolls", "Hara Bhara Kabab"],
    main_course:         ["Dal Makhani", "Paneer Butter Masala", "Veg Biryani", "Chole Masala"],
    breads:              ["Naan", "Roti", "Puri", "Paratha"],
    rice:                ["Jeera Rice", "Biryani"],
    desserts:            ["Gulab Jamun", "Ice Cream", "Kheer", "Jalebi"],
    beverages:           ["Lassi", "Soft Drinks", "Water", "Juice"],
    live_counters:       ["Chaat Counter", "Dosa Counter", "Pani Puri"],
    salads:              ["Green Salad", "Raita", "Papad"],
  },

  applicable_to:         "franchise",           // "platform"|"franchise"|"branch"
  is_customizable:       true,
  is_active:             true,

  created_at:            Timestamp,
  updated_at:            Timestamp,
  updated_by:            "userId",
}
```

---

### 10.18 `/notifications/{notificationId}`

```js
{
  notification_id:       "auto-id",
  user_id:               "userId",              // indexed
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

  created_at:            Timestamp,             // indexed
}
```

---

### 10.19 `/audit_logs/{logId}` — Immutable

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

  action:                "booking.created",     // format: entity.action
  entity_type:           "booking",
  entity_id:             "bookingId",

  before:                null,
  after: {
    booking_id:          "bookingId",
    client_name:         "Rajesh Kumar",
    total_amount:        450000,
    status:              "Confirmed",
  },

  ip_address:            "103.x.x.x",
  created_at:            Timestamp,             // indexed
}
```

---

### 10.20 `/ai_insights/{insightId}` — AI Cache

```js
{
  insight_id:            "auto-id",
  insight_type:          "revenue_forecast",   // "revenue_forecast"|"lead_score"|"menu_recommendation"|"proposal_draft"|"followup_suggestion"
  entity_type:           "branch",
  entity_id:             "branchId",
  franchise_id:          "franchiseId",
  branch_id:             "branchId",

  input_hash:            "sha256-of-input-data",
  result: {
    // Varies by insight_type — see §13 AI Features
  },
  model_used:            "gemini-1.5-flash",
  tokens_used:           842,
  prompt_version:        "v1.2",

  is_stale:              false,
  computed_at:           Timestamp,
  expires_at:            Timestamp,            // 24h for forecasts, 7d for lead scores

  created_at:            Timestamp,
}
```

---

## 11. Data Scoping Rules

Every data record carries `franchise_id` and `branch_id`. All queries enforce scope server-side through Firestore Security Rules and compound indexes — never client-side only.

| Role | Firestore Filter Applied | Scope |
|---|---|---|
| `super_admin` | None — sees all | Global |
| `franchise_admin` | `where("franchise_id", "==", myFranchiseId)` | Own franchise only |
| `branch_manager` and below | `where("branch_id", "==", myBranchId)` | Own branch only |

### 11.1 Cross-Franchise Isolation

- `franchise_admin` for PFD **cannot** access data from other franchises, even if they know the IDs
- Firestore Security Rules validate `franchise_id` from the Auth custom claim — not from the client request
- All API calls (Resend, WATI, OneSignal) use franchise-specific configuration from `/config` or `franchise.notifications` — never mixing franchise data

### 11.2 Required Fields on All Records

Every document in every collection must carry:

```js
franchise_id:   string,     // null only for super_admin-owned platform records
branch_id:      string,     // null for franchise-level records (menus, vendors)
created_at:     Timestamp,
created_by:     string,     // userId
updated_at:     Timestamp,
updated_by:     string,     // userId
```

---

## 12. Denormalization & Read Optimization

### 12.1 Dashboard: 1 Read Per Screen Load

| Dashboard | Document Read | Fields Used |
|---|---|---|
| Super Admin | `/platform/coding_gurus` | `_stats.*` |
| Franchise Admin | `/franchises/{id}` | `_stats.*`, `admin_snapshot` |
| Branch Staff | `/branches/{id}` | `_stats.*`, `_lead_stats.*`, `franchise_snapshot` |

These stats are maintained by client `writeBatch()` — never computed at read time.

### 12.2 Embedded Snapshots (Eliminates Join Reads)

| Document | Snapshot Field | Source | Avoids Reading |
|---|---|---|---|
| `/bookings` | `hall_snapshot` | `/halls/{id}` | Hall doc on booking list |
| `/bookings` | `menu_snapshot` | `/menus/{id}` | Menu doc on booking list |
| `/bookings` | `client_snapshot` | Form input | Lead doc on booking display |
| `/events` | `hall_snapshot` | `/halls/{id}` | Hall doc on event list |
| `/events` | `client_snapshot` | Booking | Client info on event day |
| `/events` | `assigned_staff[]` | `/users/{id}` | N staff reads for name display |
| `/billing` | `client_snapshot` | Booking | Client on invoice |
| `/billing` | `branch_snapshot` | `/branches/{id}` | Branch info for PDF render |
| `/payments` | `collected_by_snapshot` | Auth user | User read on payment list |
| `/users` | `display_config` | `/franchises/{id}` | Franchise read on login |
| `/branches` | `franchise_snapshot` | `/franchises/{id}` | Franchise read on branch pages |
| `/users` | `manager_snapshot` | `/users/{id}` | Manager read on branch list |

### 12.3 Snapshot Update Policy

Snapshots are stale-acceptable — they store display data, not operational data. When a source changes (e.g. hall renamed), a background update propagates the change. This is acceptable because:
- Hall names change rarely (once every few months at most)
- The operational fields (hall_id) are still correct — only display name is stale
- Manual "sync snapshots" admin action available in branch settings

### 12.4 Pagination

All list screens use cursor-based pagination — never `offset` (which still reads skipped docs in Firestore):

```js
// Page 1
const q = query(
  collection(db, "leads"),
  where("branch_id", "==", branchId),
  where("status", "==", "Hot"),
  orderBy("created_at", "desc"),
  limit(20)
);

// Page 2 — pass last document from page 1
const q2 = query(
  collection(db, "leads"),
  where("branch_id", "==", branchId),
  where("status", "==", "Hot"),
  orderBy("created_at", "desc"),
  startAfter(lastDoc),
  limit(20)
);
```

---

## 13. AI-Based Features

All AI features use **Google Gemini API** (model: `gemini-1.5-flash`, free tier: 15 req/min, 1M tokens/day). Results are cached in `/ai_insights` to minimize API calls.

### 13.1 Lead Scoring & Conversion Probability

**Purpose:** Score each lead 0–100 for conversion likelihood. Prioritizes sales exec's workday.

**Input JSON:**
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
  "proposal_sent": true,
  "proposal_viewed": false,
  "avg_response_time_hrs": 4,
  "historical_branch_conversion_rate_pct": 18.2
}
```

**Prompt:**
```
You are a sales analyst for a banquet hall. Score this lead 0-100 for booking 
conversion probability based on these factors. Higher score = more likely to book.
Consider: source quality, budget fit, urgency (date proximity), engagement level, 
pipeline stage, and historical branch conversion rate as baseline.

Lead data: {JSON}

Respond ONLY with valid JSON — no markdown, no explanation outside JSON:
{
  "score": 78,
  "label": "High",
  "reasoning": "Referral lead with flexible budget, site visit completed, actively responding",
  "suggested_action": "Call today — proposal viewed 0 times, send WhatsApp with proposal link",
  "risk_factors": ["Proposal not viewed yet", "Date is 45 days away — create urgency"],
  "tags": ["high-value", "wedding", "referral", "proposal-pending"],
  "sentiment": "Positive"
}
```

**Trigger:** On lead create, on status change, manual "Re-score" button.  
**Cache:** `/ai_insights/{id}` with `insight_type: "lead_score"`, `expires_at: 7 days`.  
**UI:** Score badge (green 70+, yellow 40–69, red <40), reasoning tooltip, suggested action card.

---

### 13.2 Smart Follow-up Suggestions

**Purpose:** Recommend best channel, time, and message for next follow-up.

**Input:** Last 5 activity entries + lead status + last contact time + client phone area code.

**Output:**
```json
{
  "best_channel": "WhatsApp",
  "best_time": "Tomorrow 10:00–11:00 AM",
  "suggested_message": "Hi Rajesh! 😊 We wanted to share one more hall option that perfectly fits your March date and budget. Can we schedule a quick 5-min call?",
  "reasoning": "Client responded fastest on WhatsApp (avg 22 min). Morning contacts have higher reply rates. Last interaction was positive.",
  "do_not_try": ["Email — no response in 2 email attempts"]
}
```

**UI:** Shown on lead detail as "AI Suggestion" card. One-click to copy message and open WhatsApp deep link.

---

### 13.3 AI Chatbot — Website Lead Capture

**Purpose:** Embedded chat widget on franchise website. Qualifies visitors and creates leads automatically.

**Conversation flow:**
```
Bot: "Hi! Planning a special event? I'd love to help find the perfect venue 🎉 
      What's the occasion?"
User: "My daughter's wedding"
Bot: "Congratulations! 🥂 What date are you thinking?"
User: "March 15th next year"
Bot: "Great! And approximately how many guests are you expecting?"
User: "Around 400-500"
Bot: "We have some beautiful options for that size! What's your approximate 
     budget for the venue and catering?"
User: "Around 4-5 lakhs"
Bot: "Perfect — that's very doable! May I have your name and phone number so 
     our team can reach out within 2 hours with a customized proposal?"
User: "Rajesh Kumar, 9876543210"
Bot: "Thank you Rajesh! Our team will call you before 5 PM today. You'll also 
     receive a WhatsApp confirmation shortly. 😊"
```

**On lead capture:**
1. Gemini classifies lead quality from conversation
2. Creates `/leads` doc with `source: "ai_chatbot"`, `ai_score` pre-populated
3. WATI sends WhatsApp to client: "Thanks Rajesh! We'll call you by 5 PM."
4. OneSignal push to sales exec: "New Hot Lead — Rajesh Kumar via chatbot"
5. Resend email to client: "We received your enquiry"

**Implementation:** Gemini chat API (multi-turn) + Firestore write from embedded React widget on franchise website.

---

### 13.4 Revenue Forecasting

**Purpose:** Predict expected revenue for next 30/60/90 days from current pipeline.

**Input:**
```json
{
  "hot_leads": [
    { "estimated_value": 450000, "event_date_days": 30, "score": 82 },
    { "estimated_value": 280000, "event_date_days": 45, "score": 71 }
  ],
  "warm_leads_count": 6,
  "avg_warm_lead_value": 320000,
  "historical_conversion_rate": 0.182,
  "confirmed_bookings_revenue": 1200000,
  "pending_balance_bookings": 345000,
  "month": "March",
  "is_peak_season": true,
  "peak_multiplier": 1.2
}
```

**Output:**
```json
{
  "forecast_30d": 840000,
  "forecast_60d": 1650000,
  "forecast_90d": 2200000,
  "confidence": "Medium",
  "assumptions": [
    "18.2% conversion rate (branch historical avg)",
    "5 hot leads with events in 30 days at avg ₹168K each",
    "March is peak season — 1.2× seasonal multiplier applied"
  ],
  "risks": [
    "3 leads have no follow-up in 7+ days — may go cold",
    "2 bookings have outstanding balance of ₹3.45L — collection risk"
  ],
  "opportunities": [
    "4 leads from referrals — historically 28% higher conversion",
    "Google Ads leads have improved this month"
  ]
}
```

**Cache:** `/ai_insights` with `expires_at: 24 hours`. Shown on Branch and Franchise dashboards.

---

### 13.5 Auto-generated Proposal / Quote

**Purpose:** Generate personalized event proposal PDF from lead details.

**Input:** Lead data + branch halls + available menu packages + branch branding.

**Gemini generates:** Narrative sections for each part of the proposal (personalized introduction, venue description tailored to their event type, menu highlights, why choose this venue).

**Output process:**
1. Gemini returns structured JSON with narrative sections
2. Frontend renders proposal layout using React + CSS
3. `jsPDF` + `html2canvas` converts to PDF
4. PDF uploaded to Cloudinary: `proposals/leads/{leadId}/proposal_v{n}.pdf`
5. URL stored in `leads/{id}.proposal.proposal_url`
6. Sent via WATI WhatsApp + Resend email

**Sample AI-generated intro:**
> "For Priya's special 25th birthday celebration on April 20th, we've crafted a proposal that perfectly captures the intimate, elegant atmosphere you described. Our Rooftop Terrace — with its panoramic city views and capacity for 80 guests — sets the ideal stage for an unforgettable evening with your closest friends and family."

---

### 13.6 Sentiment Analysis on Follow-up Notes

**Purpose:** Assess client tone from follow-up notes to flag leads needing manager attention.

**Input:** Last 3 follow-up note texts.

**Output:**
```json
{
  "sentiment": "Negative",
  "confidence": "High",
  "signals": ["considering competitors", "price concern", "hesitant tone"],
  "urgency": "High",
  "recommended_action": "Escalate to branch manager — offer 5% discount or superior package at same price",
  "do_not_do": "Do not push for a decision in next call — listen first"
}
```

**Trigger:** Automatic on each follow-up save. Updates `leads/{id}.ai_sentiment`. Shows warning badge on lead card if sentiment = Negative.

---

### 13.7 Menu Recommendation for Booking

**Purpose:** Suggest best menu package during booking creation.

**Input:**
```json
{
  "event_type": "Wedding",
  "expected_guests": 500,
  "budget_per_head": 900,
  "dietary_preference": "Veg Only",
  "event_time_slot": "Full Day",
  "special_requirements": "Extra dessert counter, no onion/garlic"
}
```

**Output:**
```json
{
  "top_recommendation": {
    "menu_id": "menuId",
    "menu_name": "Jain Premium Package",
    "price_per_plate": 850,
    "fit_score": 95,
    "reasoning": "Jain menu covers no-onion/garlic requirement at ₹850/plate — within budget"
  },
  "alternatives": [
    { "menu_name": "Veg Premium Package", "price_per_plate": 850, "fit_score": 88, "note": "Standard veg — may need onion/garlic modification" },
    { "menu_name": "Veg Luxury Package", "price_per_plate": 1100, "fit_score": 70, "note": "Exceeds budget by ₹100/plate" }
  ]
}
```

**UI:** Shown as recommendation cards during menu selection in booking form.

---

## 14. Firebase Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Core helpers ─────────────────────────────────────────────────────
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

    // Temp staff expiry enforcement — no backend needed
    function isNotExpiredTemp() {
      let u = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return u.employment_type == "permanent" ||
             (u.temp_access.is_temporary == true &&
              u.temp_access.access_expires > request.time &&
              u.temp_access.is_expired == false);
    }

    function isOperational() { return isAuth() && isNotExpiredTemp(); }

    // ── /config (API keys — admin only) ──────────────────────────────────
    match /config/{docId} {
      allow read:  if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow write: if isAuth() && isSuperAdmin();
    }

    // ── /platform ────────────────────────────────────────────────────────
    match /platform/{docId} {
      allow read:  if isAuth();
      allow write: if isAuth() && isSuperAdmin();
    }

    // ── /franchises ──────────────────────────────────────────────────────
    match /franchises/{franchiseId} {
      allow read:  if isAuth() && (
        isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(franchiseId))
      );
      allow create: if isAuth() && isSuperAdmin();
      allow update: if isAuth() && (
        isSuperAdmin() || (isFranchiseAdmin() && sameFranchise(franchiseId))
      );
      allow delete: if isAuth() && isSuperAdmin();
    }

    // ── /branches ────────────────────────────────────────────────────────
    match /branches/{branchId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow update: if isAuth() && (
        isSuperAdmin() ||
        (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) ||
        (isBranchManager() && sameBranch(branchId))
      );
      allow delete: if isAuth() && isSuperAdmin();
    }

    // ── /halls ───────────────────────────────────────────────────────────
    match /halls/{hallId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (
        isSuperAdmin() ||
        (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) ||
        (isBranchManager() && sameBranch(resource.data.branch_id))
      );
    }

    // ── /users ───────────────────────────────────────────────────────────
    match /users/{userId} {
      allow read: if isAuth() && (
        isSuperAdmin() ||
        (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) ||
        (isBranchManager() && sameBranch(resource.data.branch_id)) ||
        request.auth.uid == userId
      );
      allow create: if isAuth() && (
        isSuperAdmin() || isFranchiseAdmin() || isBranchManager()
      );
      allow update: if isAuth() && (
        isSuperAdmin() ||
        (isFranchiseAdmin() && sameFranchise(resource.data.franchise_id)) ||
        (isBranchManager() && sameBranch(resource.data.branch_id)) ||
        (request.auth.uid == userId &&
         request.resource.data.diff(resource.data).affectedKeys()
         .hasOnly(["last_login_at", "onesignal_player_id", "notify_email",
                   "notify_whatsapp", "notify_push", "updated_at"]))
      );
      allow delete: if false; // Never delete — set is_active = false
    }

    // ── /leads ───────────────────────────────────────────────────────────
    match /leads/{leadId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (
        isSuperAdmin() || isFranchiseAdmin() || isBranchManager() ||
        isSales() || isReceptionist()
      ) && (isSuperAdmin() || sameFranchise(request.resource.data.franchise_id));
      allow update: if isOperational() && branchScoped(resource) && (
        isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isSales()
      );
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // ── /lead_activities ─────────────────────────────────────────────────
    match /lead_activities/{activityId} {
      allow read:   if isOperational() && branchScoped(resource);
      allow create: if isOperational() && branchScoped(resource);
      allow update: if false;  // Timeline entries are immutable
      allow delete: if false;
    }

    // ── /follow_ups ──────────────────────────────────────────────────────
    match /follow_ups/{followUpId} {
      allow read:   if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (
        isSuperAdmin() || isBranchManager() || isSales() || isReceptionist()
      );
      allow update: if isOperational() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isSales()
      );
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // ── /bookings ────────────────────────────────────────────────────────
    match /bookings/{bookingId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (
        isSuperAdmin() || isBranchManager() || isSales()
      );
      allow update: if isOperational() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isSales() || isAccountant()
      );
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
    }

    // ── /events + checklist_items ─────────────────────────────────────────
    match /events/{eventId} {
      allow read:  if isOperational() && branchScoped(resource);
      allow create: if isOperational() && (
        isSuperAdmin() || isBranchManager() || isSales()
      );
      allow update: if isOperational() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isSales() || isOps() ||
        isKitchen()
      );
      allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());

      match /checklist_items/{itemId} {
        allow read:   if isOperational();
        allow create: if isOperational() && (
          isSuperAdmin() || isBranchManager() || isOps() || isSales()
        );
        allow update: if isOperational() && (
          isSuperAdmin() || isBranchManager() || isOps() || isKitchen()
        );
        allow delete: if isAuth() && (isSuperAdmin() || isBranchManager());
      }
    }

    // ── /billing and /payments ────────────────────────────────────────────
    match /billing/{invoiceId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (
        isSuperAdmin() || isBranchManager() || isAccountant()
      );
      allow update: if isAuth() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isAccountant()
      );
      allow delete: if isAuth() && isSuperAdmin();
    }

    match /payments/{paymentId} {
      allow read:   if isAuth() && branchScoped(resource);
      allow create: if isAuth() && (
        isSuperAdmin() || isBranchManager() || isAccountant()
      );
      allow update: if isAuth() && (isSuperAdmin() || isBranchManager() || isAccountant());
      allow delete: if isAuth() && isSuperAdmin();
    }

    // ── /raw_materials + stock_ledger ─────────────────────────────────────
    match /raw_materials/{itemId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isKitchen()
      );

      match /stock_ledger/{entryId} {
        allow read:   if isAuth();
        allow create: if isAuth() && (
          isSuperAdmin() || isBranchManager() || isKitchen()
        );
        allow update: if false;  // Ledger entries are immutable
        allow delete: if false;
      }
    }

    // ── /purchase_orders ──────────────────────────────────────────────────
    match /purchase_orders/{poId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource) && (
        isSuperAdmin() || isBranchManager() || isKitchen() || isAccountant()
      );
    }

    // ── /menus ────────────────────────────────────────────────────────────
    match /menus/{menuId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (
        isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isKitchen()
      );
    }

    // ── /vendors ──────────────────────────────────────────────────────────
    match /vendors/{vendorId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && (
        isSuperAdmin() || isFranchiseAdmin() || isBranchManager() || isOps() ||
        (isKitchen() && !request.resource.data.diff(resource.data)
          .affectedKeys().hasAny(["is_active", "scope"]))
      );
    }

    // ── /notifications ────────────────────────────────────────────────────
    match /notifications/{notificationId} {
      allow read:   if isAuth() && resource.data.user_id == request.auth.uid;
      allow create: if isAuth();
      allow update: if isAuth() && resource.data.user_id == request.auth.uid &&
                    request.resource.data.diff(resource.data).affectedKeys()
                    .hasOnly(["is_read", "read_at"]);
      allow delete: if false;
    }

    // ── /audit_logs ───────────────────────────────────────────────────────
    match /audit_logs/{logId} {
      allow read:   if isAuth() && (isSuperAdmin() || isFranchiseAdmin());
      allow create: if isAuth();   // Written by client as part of writeBatch
      allow update: if false;      // Immutable
      allow delete: if false;
    }

    // ── /ai_insights ──────────────────────────────────────────────────────
    match /ai_insights/{insightId} {
      allow read:  if isAuth() && branchScoped(resource);
      allow write: if isAuth() && branchScoped(resource);
    }
  }
}
```

---

## 15. Firestore Indexes

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
      { "fieldPath": "branch_id", "order": "ASCENDING" },
      { "fieldPath": "payment_status", "order": "ASCENDING" },
      { "fieldPath": "event_date", "order": "ASCENDING" }
    ]},
    { "collectionGroup": "bookings", "fields": [
      { "fieldPath": "hall_id", "order": "ASCENDING" },
      { "fieldPath": "event_date", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" }
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

## 16. Client-Side Write Patterns (No Cloud Functions)

### 16.1 The writeBatch Pattern

Every multi-document operation uses `writeBatch()` — a single atomic commit. If any write fails, all fail. This replaces Cloud Function triggers.

```js
// Generic pattern for any create/update that affects stats
async function performBatchWrite(primaryWrite, statUpdates, auditEntry, notifications) {
  const batch = writeBatch(db);

  // 1. Primary write
  primaryWrite(batch);

  // 2. Stat updates (FieldValue.increment — never read-then-write)
  statUpdates.forEach(({ docRef, updates }) => {
    batch.update(docRef, { ...updates, updated_at: serverTimestamp() });
  });

  // 3. Audit log
  batch.set(doc(collection(db, "audit_logs")), {
    ...auditEntry,
    created_at: serverTimestamp(),
  });

  // 4. In-app notifications
  notifications.forEach(notification => {
    batch.set(doc(collection(db, "notifications")), {
      ...notification,
      is_read: false,
      created_at: serverTimestamp(),
    });
  });

  await batch.commit();
}
```

### 16.2 Booking Confirmation — Full Code Pattern

```js
async function confirmBooking(bookingData, leadId, branchId, franchiseId) {
  const batch = writeBatch(db);
  const bookingRef = doc(collection(db, "bookings"));

  // 1. Booking doc
  batch.set(bookingRef, {
    ...bookingData,
    status: "Confirmed",
    created_at: serverTimestamp(),
    created_by: auth.currentUser.uid,
    updated_at: serverTimestamp(),
    updated_by: auth.currentUser.uid,
  });

  // 2. Payment doc (advance)
  const paymentRef = doc(collection(db, "payments"));
  batch.set(paymentRef, {
    booking_id:    bookingRef.id,
    franchise_id:  franchiseId,
    branch_id:     branchId,
    amount:        bookingData.advance_amount,
    payment_date:  serverTimestamp(),
    payment_mode:  bookingData.advance_payment_mode,
    is_advance:    true,
    created_by:    auth.currentUser.uid,
    created_at:    serverTimestamp(),
  });

  // 3. Update lead → converted
  if (leadId) {
    batch.update(doc(db, "leads", leadId), {
      is_converted:         true,
      converted_booking_id: bookingRef.id,
      converted_at:         serverTimestamp(),
      status:               "Converted",
      updated_at:           serverTimestamp(),
    });
  }

  // 4. Branch stats
  batch.update(doc(db, "branches", branchId), {
    "_stats.bookings_mtd":       increment(1),
    "_stats.outstanding_dues":   increment(bookingData.balance_amount),
    "_stats.last_updated_at":    serverTimestamp(),
    "_lead_stats.total_leads":   increment(-1),
    "_lead_stats.leads_by_status.hot": increment(-1),
    "_lead_stats.leads_by_status.converted": increment(1),
  });

  // 5. Franchise stats
  batch.update(doc(db, "franchises", franchiseId), {
    "_stats.total_bookings_mtd": increment(1),
    "_stats.outstanding_dues":   increment(bookingData.balance_amount),
  });

  // 6. Audit log
  batch.set(doc(collection(db, "audit_logs")), {
    action:      "booking.confirmed",
    entity_type: "booking",
    entity_id:   bookingRef.id,
    user_id:     auth.currentUser.uid,
    user_snapshot: { name: currentUser.displayName, role: currentUser.role },
    after:       { booking_id: bookingRef.id, client: bookingData.client_name, amount: bookingData.total_amount },
    before:      null,
    created_at:  serverTimestamp(),
  });

  // 7. Notification (for accountant and branch manager)
  batch.set(doc(collection(db, "notifications")), {
    user_id:     branchAccountantId,
    type:        "booking_confirmed",
    title:       "New Booking Confirmed",
    body:        `${bookingData.client_name} — ${bookingData.event_type} on ${formatDate(bookingData.event_date)}`,
    entity_type: "booking",
    entity_id:   bookingRef.id,
    deep_link:   `/bookings/${bookingRef.id}`,
    franchise_id: franchiseId,
    branch_id:    branchId,
    created_at:   serverTimestamp(),
  });

  await batch.commit();

  // Post-batch: external APIs (non-atomic — errors handled gracefully)
  await Promise.allSettled([
    sendEmail({ template: "booking_confirmation", to: bookingData.client_email, data: bookingData }),
    sendWhatsApp({ phone: bookingData.client_phone, template: "booking_confirmed_wa", params: buildParams(bookingData) }),
    sendPushNotification({ segment: `branch-${branchCode}`, title: "Booking Confirmed 🎉", body: bookingData.client_name }),
    scheduleEventReminders(bookingRef.id, bookingData),
  ]);

  return bookingRef.id;
}
```

### 16.3 Overdue Follow-up Detection (No Scheduler)

```js
// On leads list mount — realtime listener for overdue leads
useEffect(() => {
  const overdueQuery = query(
    collection(db, "leads"),
    where("branch_id", "==", currentUser.branch_id),
    where("status", "not-in", ["Converted", "Lost", "On Hold"]),
    where("next_followup_date", "<", Timestamp.now()),
    orderBy("next_followup_date", "asc"),
    limit(50)
  );

  const unsub = onSnapshot(overdueQuery, (snapshot) => {
    const overdue = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setOverdueLeads(overdue);

    // Throttled push — max 1 push per lead per day
    overdue.forEach(lead => {
      const lastPushKey = `push_overdue_${lead.id}_${today()}`;
      if (!sessionStorage.getItem(lastPushKey)) {
        sendPushToUser(lead.assigned_to_user_id, {
          title: "Follow-up Overdue ⏰",
          body:  `${lead.client_name} — ${daysSince(lead.next_followup_date)} days overdue`,
          data:  { lead_id: lead.id }
        });
        sessionStorage.setItem(lastPushKey, "sent");
      }
    });
  });

  return unsub;
}, [currentUser.branch_id]);
```

### 16.4 Temporary Staff Expiry Check (No Scheduler)

```js
// On every auth state change
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) return;

  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
  const userData = userDoc.data();

  if (userData.employment_type === "temporary") {
    const expiresAt = userData.temp_access.access_expires.toDate();
    if (new Date() > expiresAt && !userData.temp_access.is_expired) {
      // Mark as expired in Firestore
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        "temp_access.is_expired": true,
        is_active: false,
        updated_at: serverTimestamp(),
      });
      // Sign out
      await signOut(auth);
      navigate("/login", { state: { message: "Your 24-hour temporary access has expired." } });
    }
  }
});
```

---

## 17. Cloudinary — Storage Design

### 17.1 Folder Structure

```
cg-banquet (Cloudinary cloud)
├── platform/
│   ├── logo.png
│   └── favicon.png
├── franchises/
│   └── {franchise_code}/           e.g. pfd/
│       ├── logo.png                ← Uploaded on onboarding (shown on login)
│       ├── logo_dark.png           ← Optional dark variant
│       └── documents/
│           └── agreement.pdf
├── branches/
│   └── {branch_code}/             e.g. pfd-hyd-bh/
│       ├── halls/
│       │   └── {hall_code}/        e.g. gb-01/
│       │       ├── primary.jpg
│       │       ├── gallery_2.jpg
│       │       └── gallery_3.jpg
│       └── documents/
├── staff/
│   └── {user_id}/
│       └── profile.jpg
├── invoices/
│   └── INV-PFD-2025-0042.pdf      ← jsPDF generated, browser-uploaded
├── receipts/
│   └── RCT-PFD-2025-0018.pdf
├── proposals/
│   └── leads/
│       └── {lead_id}/
│           ├── proposal_v1.pdf
│           └── proposal_v2.pdf
└── purchase_orders/
    └── PO-PFD-BH-2025-0018.pdf
```

### 17.2 Upload Presets

| Preset Name | Usage | Max Size | Transformations |
|---|---|---|---|
| `franchise_logo` | Franchise logo on onboarding | 2MB | auto-format, quality_auto; eager: `w_200,h_200,c_fit` + `w_64,h_64,c_fit` |
| `hall_images` | Hall gallery photos | 5MB | quality 85, JPEG; eager: `w_1200,c_limit` + `w_400,c_fill` |
| `staff_profile` | Staff headshot | 2MB | `w_200,h_200,c_thumb,g_face` |
| `pdf_upload` | Invoices, receipts, proposals, POs | 10MB | resource_type: raw |

### 17.3 Logo on Login — Zero Extra Reads

```
Franchise created
      │
      ▼
Logo uploaded to Cloudinary → URL stored in franchises/{id}.logo.url
      │
      ▼
Staff user created → Cloud claim set → /users/{uid} created
logo_url COPIED into users/{uid}.display_config.logo_url
      │
      ▼
User logs in → onAuthStateChanged fires → 1 read: /users/{uid}
logo_url available immediately from user doc
      │
      ▼
Login screen / sidebar shows franchise logo
(0 additional Firestore reads needed)
```

---

## 18. Resend — Email Automation

```
Free tier: 3,000 emails/month
Expected usage: ~50–150 emails/month (1 franchise)
From: Franchise-specific (noreply@prasadfooddivine.com) or platform default
API key: Stored in /config/keys (Firestore) — fetched at runtime by authorized roles
```

### 18.1 Email Templates & Triggers

| Template ID | Trigger (client-side event) | Recipient | Key Content |
|---|---|---|---|
| `welcome_franchise_admin` | Franchise created | Franchise admin | Login link, franchise logo, credentials |
| `welcome_branch_manager` | Branch created | Branch manager | Login, branch name, credentials |
| `welcome_staff` | User created | New staff | Login, role, branch name, password |
| `lead_received_client` | Lead created | Client | Thank you, team will call within 2h |
| `booking_confirmation` | Booking → Confirmed | Client | Booking ID, hall, date, amount, advance paid |
| `booking_tentative` | Booking → Tentative | Client | Tentative confirmation, next steps |
| `booking_cancelled` | Booking → Cancelled | Client | Cancellation confirmation, refund policy |
| `invoice_email` | Invoice generated | Client | Invoice PDF link (Cloudinary), amount due |
| `payment_receipt` | Payment recorded | Client | Receipt PDF link, remaining balance |
| `payment_reminder` | 7 days before event, balance > 0 | Client | Outstanding amount, event date |
| `event_reminder_client` | 48h before event | Client | Event details, venue address, contact |
| `proposal_email` | Proposal generated | Client | Proposal PDF link, validity period |
| `site_visit_confirmation` | Site visit scheduled | Client | Date, time, address, contact |
| `low_stock_alert` | is_low_stock → true | Kitchen mgr + Branch mgr | Item names, current stock, min stock |
| `followup_overdue_internal` | Follow-up overdue 3+ days | Branch manager | Sales exec name, lead, days overdue |
| `temp_staff_created` | Temporary user created | Branch manager | Staff name, role, expiry time |
| `temp_staff_expiring` | 2h before temp expiry | Temp staff + Branch mgr | Name, expiry time |
| `lead_converted_internal` | Lead converted to booking | Branch manager | Lead name, booking value |

---

## 19. WATI — WhatsApp Automation

```
Provider: WATI (wati.io) — paid plan required
REST API: Called directly from frontend after Firestore writes
Templates: Pre-approved by WhatsApp / Meta before use
Config: API URL + token stored in /config/keys
Franchise number: Stored in franchises/{id}.notifications.wati_phone_number
```

### 19.1 WhatsApp Templates

| Template Name | Trigger | Recipient | Variables |
|---|---|---|---|
| `lead_ack_wa` | Lead created | Client | `{{name}}`, `{{event_type}}`, `{{branch_name}}`, `{{callback_by}}` |
| `booking_confirmed_wa` | Booking confirmed | Client | `{{name}}`, `{{booking_id}}`, `{{event_date}}`, `{{hall}}`, `{{total}}`, `{{advance_paid}}`, `{{balance}}` |
| `booking_tentative_wa` | Booking tentative | Client | `{{name}}`, `{{booking_id}}`, `{{event_date}}`, `{{hall}}` |
| `payment_receipt_wa` | Payment recorded | Client | `{{name}}`, `{{amount_paid}}`, `{{balance}}`, `{{booking_id}}` |
| `invoice_wa` | Invoice generated | Client | `{{name}}`, `{{invoice_number}}`, `{{invoice_url}}`, `{{amount_due}}` |
| `event_reminder_wa` | 48h before event | Client | `{{name}}`, `{{event_name}}`, `{{hall}}`, `{{time}}`, `{{address}}` |
| `proposal_share_wa` | Proposal generated | Client | `{{name}}`, `{{proposal_url}}`, `{{valid_days}}`, `{{exec_name}}` |
| `site_visit_confirm_wa` | Site visit scheduled | Client | `{{name}}`, `{{date}}`, `{{time}}`, `{{address}}`, `{{contact_name}}` |
| `payment_overdue_wa` | Balance > 0, event < 7 days | Client | `{{name}}`, `{{amount_due}}`, `{{event_date}}`, `{{contact}}` |
| `followup_due_wa` | Follow-up overdue | Sales exec | `{{exec_name}}`, `{{client_name}}`, `{{days_overdue}}`, `{{lead_status}}` |
| `temp_access_wa` | Temp staff created | Temp staff | `{{staff_name}}`, `{{branch_name}}`, `{{role}}`, `{{expires_at}}` |
| `booking_cancelled_wa` | Booking cancelled | Client | `{{name}}`, `{{booking_id}}`, `{{event_date}}`, `{{refund_policy}}` |

### 19.2 WATI API Call (Frontend)

```js
async function sendWhatsApp({ phone, templateName, parameters, mediaUrl = null }) {
  const config = await getConfigKeys(); // Reads /config/keys from Firestore (cached)
  const { wati_api_url, wati_api_token } = config;

  const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits

  const payload = {
    template_name:  templateName,
    broadcast_name: templateName,
    parameters:     parameters.map(p => ({ name: p.key, value: String(p.value) })),
  };

  if (mediaUrl) {
    payload.header = { type: "document", document: { link: mediaUrl, filename: "Document.pdf" } };
  }

  const res = await fetch(
    `${wati_api_url}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${wati_api_token}` },
      body:    JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    console.error("WATI send failed:", await res.text());
  }
}
```

---

## 20. OneSignal — Push Notifications

```
Free tier: Unlimited push notifications, up to 10,000 subscribers
Expected subscribers: ~30–60 (1 franchise)
App ID: Public — safe to expose in frontend code
REST API Key: Stored in /config/keys — fetched at runtime
```

### 20.1 User Segmentation (Tags)

Applied when user logs in / grants push permission:

```js
OneSignal.User.addTags({
  role:         "sales_executive",
  branch_id:    "branchId",
  branch_code:  "pfd-hyd-bh",
  franchise_id: "franchiseId",
  user_id:      "userId",
});
```

**Targeting segments:**

| Segment | Filter |
|---|---|
| Specific user | `tag: user_id = {userId}` |
| All branch staff | `tag: branch_id = {branchId}` |
| Sales execs of branch | `tag: branch_id = {branchId} AND role = sales_executive` |
| Kitchen staff of branch | `tag: branch_id = {branchId} AND role = kitchen_manager` |
| All franchise staff | `tag: franchise_id = {franchiseId}` |
| Managers only | `tag: role = branch_manager` |

### 20.2 Notification Catalog

| Type | Trigger | Target | Title | Body |
|---|---|---|---|---|
| `new_lead` | Lead created | Branch sales execs | "New Lead 🎯" | "{source} — {event_type} on {date}" |
| `lead_assigned` | Lead assigned | Assigned user | "Lead Assigned to You" | "{client_name} — {event_type}" |
| `followup_overdue` | Detected on load | Assigned user | "Follow-up Overdue ⏰" | "{client_name} — {N} days overdue" |
| `site_visit_reminder` | 2h before visit | Assigned user | "Site Visit in 2 Hours" | "{client_name} visiting at {time}" |
| `booking_confirmed` | Booking confirmed | All branch staff | "Booking Confirmed 🎉" | "{client_name} — {event_type} on {date}" |
| `booking_cancelled` | Booking cancelled | Branch manager | "Booking Cancelled ⚠️" | "{client_name} — {reason}" |
| `payment_received` | Payment recorded | Accountant + manager | "Payment Received 💰" | "₹{amount} from {client_name}" |
| `payment_overdue` | Detected on load | Branch manager | "Payment Overdue ⚠️" | "{client_name} — ₹{amount} due, event in {N} days" |
| `event_tomorrow` | OneSignal scheduled | All branch staff | "Event Tomorrow 🎉" | "{event_name} — {hall} at {time}" |
| `event_today` | OneSignal scheduled | All branch staff | "Event Today! 🎊" | "{event_name} — {N} guests, {hall}" |
| `low_stock` | Stock drops below min | Kitchen + manager | "Low Stock Alert 📦" | "{item_name} — only {qty} {unit} remaining" |
| `po_delivered` | PO status → Delivered | Kitchen manager | "PO Delivered ✅" | "PO#{po_number} received from {vendor}" |
| `temp_staff_expiring` | Scheduled (2h before) | Temp user + manager | "Access Expiring Soon ⏳" | "Your access expires in 2 hours" |
| `high_score_lead` | AI scores lead > 80 | Branch sales execs | "🔥 High-Score Lead" | "{client_name} scored {score}/100 — action recommended" |
| `ai_insight_ready` | AI computation done | Requesting user | "AI Insight Ready 🤖" | "Revenue forecast for next 30 days updated" |

### 20.3 Scheduled Notifications (Replacing Cloud Functions)

```js
// On booking confirmation — schedule event reminders for future dates
async function scheduleEventReminders(bookingId, bookingData) {
  const { onesignal_app_id, onesignal_rest_api_key } = await getConfigKeys();
  const eventDate = bookingData.event_date.toDate();
  const branchCode = bookingData.branch_snapshot.branch_code;

  const schedules = [
    { hoursOffset: -48, title: "Event Tomorrow 🎉", body: `${bookingData.client_name}'s ${bookingData.event_type} is tomorrow at ${bookingData.hall_snapshot.hall_name}` },
    { hoursOffset: -2,  title: "Event Today! 🎊",  body: `${bookingData.event_name} — ${bookingData.expected_guests} guests, starting at ${bookingData.event_start_time}` },
  ];

  for (const schedule of schedules) {
    const sendAt = new Date(eventDate.getTime() + schedule.hoursOffset * 60 * 60 * 1000);
    if (sendAt > new Date()) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Basic ${onesignal_rest_api_key}`,
        },
        body: JSON.stringify({
          app_id:     onesignal_app_id,
          filters:    [{ field: "tag", key: "branch_code", relation: "=", value: branchCode }],
          headings:   { en: schedule.title },
          contents:   { en: schedule.body },
          send_after: sendAt.toISOString(),
          data:       { booking_id: bookingId, deep_link: `/bookings/${bookingId}` },
        }),
      });
    }
  }
}
```

---

## 21. Firebase Auth & Temporary Staff

### 21.1 Auth Providers

| Provider | Used By |
|---|---|
| Email + Password | All staff, managers, franchise admins |
| Google OAuth | Optional for super admin |

### 21.2 Custom Claims (JWT)

Set via Vercel Edge Function (one free API call per user creation):

```json
{
  "role":         "branch_manager",
  "franchise_id": "franchiseId",
  "branch_id":    "branchId",
  "is_temporary": false
}
```

**Vercel Edge Function:**
```js
// /api/set-claims — called once per user creation
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SA)) });

export async function POST(req) {
  const { uid, role, franchise_id, branch_id, is_temporary } = await req.json();
  await getAuth(app).setCustomUserClaims(uid, { role, franchise_id, branch_id, is_temporary });
  return Response.json({ success: true });
}
```

### 21.3 Temporary Staff Auth Flow

```
Branch manager creates temp staff
      │
      ▼
/users doc created with employment_type = "temporary"
temp_access.access_expires = now + 24h
      │
      ▼
Vercel Edge sets custom claims: { is_temporary: true, ... }
      │
      ▼
Temp staff logs in — session active
      │
      ▼ (on every onAuthStateChanged)
Client reads /users/{uid}.temp_access.access_expires
      │
      ├── Not expired → Normal access
      │
      └── Expired:
          ├── updateDoc: is_active = false, is_expired = true
          ├── signOut(auth)
          └── Redirect to /login with "Access expired" message

Firestore Security Rules also enforce:
  temp_access.access_expires > request.time
  on every read/write — server-side enforcement
```

---

## 22. Franchise Onboarding Flow

This is the complete end-to-end flow for onboarding Prasad Food Divine (or any new franchise):

```
Step 1: Super Admin fills Franchise Form
        ├── Franchise details
        ├── Admin details
        └── LOGO UPLOAD (PNG/JPG, max 2MB)
              │
              ▼
Step 2: Logo uploaded to Cloudinary (browser → Cloudinary direct)
        Cloudinary returns: { secure_url, public_id, thumbnail_url }
              │
              ▼
Step 3: writeBatch() — all atomic:
        ├── Create /franchises/{id} doc (includes logo.url, logo.thumbnail_url)
        └── Create /audit_logs entry
              │
              ▼
Step 4: Create Firebase Auth user for franchise admin
        (Firebase Auth createUserWithEmailAndPassword — from super admin session)
              │
              ▼
Step 5: Call Vercel Edge /api/set-claims
        { uid, role: "franchise_admin", franchise_id, branch_id: null }
              │
              ▼
Step 6: writeBatch() — create /users/{uid}:
        ├── All personal details
        ├── display_config.logo_url = franchise.logo.url    ← Logo copied here
        ├── display_config.logo_thumbnail_url = franchise.logo.thumbnail_url
        └── display_config.show_franchise_logo = true
              │
              ▼
Step 7: Post-batch external calls:
        ├── Resend: Send welcome email with login credentials
        └── WATI: Send WhatsApp with login details + logo preview link
              │
              ▼
Step 8: Create OneSignal segment: "franchise-{franchise_code}"
              │
              ▼
Franchise Admin logs in:
  → onAuthStateChanged reads /users/{uid}
  → display_config.logo_url loaded from doc (0 extra reads)
  → Login screen shows Prasad Food Divine logo
  → Franchise Dashboard shown
```

---

## 23. Data Lifecycle & Retention

| Collection | Retention Policy | Action |
|---|---|---|
| `/bookings` | Permanent | Never delete; branch manager can archive completed bookings > 3 years |
| `/leads` | 2 years after last update | Super admin manual archive to `archived_leads` |
| `/lead_activities` | With parent lead | Archived/deleted with lead |
| `/follow_ups` | With parent lead | Archived/deleted with lead |
| `/payments` | Permanent (financial records) | Never delete — legal requirement |
| `/billing` | Permanent (financial records) | Never delete |
| `/purchase_orders` | 3 years | Manual archive |
| `/audit_logs` | 5 years | Manual export → delete after 5 years |
| `/notifications` | 90 days | Client purges old read notifications on login (reads docs created > 90 days ago, batch deletes) |
| `/ai_insights` | Per `expires_at` field | Client skips stale; manual cleanup in settings |
| `/raw_materials stock_ledger` | 1 year | Manual archive by kitchen manager |
| Firebase Auth users | Permanent | Disable (`is_active = false`) — never delete |
| Cloudinary — invoices/receipts | Permanent | Never delete |
| Cloudinary — temp uploads | 24h expiry tag on upload | Auto-deleted by Cloudinary |
| Cloudinary — proposal drafts | 30 days | Tagged for auto-expiry |

---

## 24. Scaling Path

Monitor Firebase Console → Upgrade to **Blaze (pay-as-you-go)** when:

| Trigger | Threshold | Monthly Cost on Blaze |
|---|---|---|
| Reads approaching 40K/day | 3–4 active branches | ~$0.06 per 100K above free |
| Storage approaching 800MB | 12+ months data | $0.18/GB/month |
| Need automated triggers | 2nd franchise onboarded | Cloud Functions ~$0.40/million |
| Need scheduled jobs | Daily stat recompute | Included in Blaze |

**When upgrading to Blaze, move these to Cloud Functions:**
1. `onPaymentCreated` → Remove client-side batch stat updates
2. `onBookingStatusChanged` → Email + WhatsApp triggers
3. `revokeExpiredTempStaff` → Scheduled every 30 min (currently client-side)
4. `computeDailyStats` → Scheduled nightly recompute of branch/franchise `_stats`
5. `onLeadCreated` → AI scoring trigger
6. `setCustomClaimsOnCreate` → Remove Vercel Edge function dependency
7. `onUserCreated` → Auto-copy franchise logo to user display_config

**Revenue threshold to upgrade:** When monthly platform revenue exceeds ₹50,000 — Blaze costs for this scale will be under ₹500/month.

---

## 25. Environment Variables

### 25.1 Frontend (Vite — safe to expose)

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
VITE_CLOUDINARY_UPLOAD_PRESET_PDF=pdf_upload

VITE_ONESIGNAL_APP_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

VITE_VERCEL_CLAIMS_URL=https://your-vercel-app.vercel.app/api/set-claims
```

### 25.2 Sensitive Keys (Stored in Firestore `/config/keys` — NOT in .env)

```
resend_api_key
wati_api_token
wati_api_url
onesignal_rest_api_key
gemini_api_key
```

Fetched at runtime by authorized roles only (Firestore Security Rules enforce admin-only read on `/config/keys`). Cached in-memory for the session — never written to localStorage.

### 25.3 Vercel Edge (Server-side — in Vercel env dashboard)

```env
FIREBASE_ADMIN_SERVICE_ACCOUNT={"type":"service_account","project_id":"banquet-mgmt-prod",...}
CLAIMS_SECRET=your-shared-secret-for-auth
```

---

## Appendix A — Module Summary Table

| Module | Primary Users | Key Actions | Firestore Collections |
|---|---|---|---|
| Lead Management | Sales, Receptionist, Manager | Create, Follow-up, Convert, AI Score | `leads`, `lead_activities`, `follow_ups` |
| Booking Management | Sales, Manager, Accountant | Create, Confirm, Cancel | `bookings`, `payments` |
| Event Management | Ops, Kitchen, Manager | Checklist, Staff assign, Execute | `events`, `checklist_items` |
| Calendar | All | View availability, Reschedule | `bookings` (query by date) |
| Billing | Accountant, Manager | Invoice, Send, Track | `billing`, `payments` |
| Inventory | Kitchen, Manager | Stock in/out, Low stock alert | `raw_materials`, `stock_ledger` |
| Purchase Orders | Kitchen, Accountant | Create, Approve, Track | `purchase_orders` |
| Staff | Manager, Franchise Admin | Create permanent/temp, Disable | `users` |
| Vendor Registry | Ops, Manager | Add, Rate, Assign to events | `vendors` |
| Menu Management | Kitchen, Manager | Create packages, Assign to bookings | `menus` |
| Analytics | Manager, Franchise Admin, Super Admin | View charts, Export reports | Aggregated from `_stats` + queries |
| AI Features | Sales, Manager | Score leads, Forecast, Propose | `ai_insights`, Gemini API |
| Notifications | All | Push, WhatsApp, Email, In-app | `notifications`, OneSignal, WATI, Resend |

---

## Appendix B — Data Flow Summary

| Action | Firestore Writes | External APIs |
|---|---|---|
| Lead created | 3 (lead + branch_stats + notification) | WATI ack, Resend, OneSignal push, Gemini score |
| Lead converted | 5 (lead + booking + payment + branch_stats + franchise_stats) | WATI booking confirm, Resend email, OneSignal push, schedule reminders |
| Payment recorded | 4 (payment + booking + branch_stats + franchise_stats) | WATI receipt, Resend email, generate PDF → Cloudinary |
| Invoice generated | 1 (billing) | jsPDF → Cloudinary upload, WATI send, Resend send |
| Event completed | 2 (event + booking) | Resend thank you, WATI, OneSignal to team |
| Stock drops low | 2 (item is_low_stock + branch_stats) | OneSignal alert, Resend email to kitchen + manager |
| Temp staff created | 2 (user + audit_log) | Vercel claims, WATI temp access, OneSignal schedule expiry reminder |

---

*Banquet Management System — Master System Design Document v3.0.0*  
*Platform: Coding Gurus | Primary Franchise: Prasad Food Divine*  
*Architecture: Firebase Free Tier + Client-Side | No Cloud Functions*  
*Confidential — © 2025 Coding Gurus*
