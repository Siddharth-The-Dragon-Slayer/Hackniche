# 🎉 BanquetEase

> **A comprehensive event management and booking system for banquet halls, wedding planning, and event coordination.**

A full-stack platform built with **Next.js 16**, **Firebase/Firestore**, and **modern web technologies** to streamline the complete lifecycle of event bookings—from lead capture to event execution, billing, and settlement.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-admin--13.7.0-orange)

---

## 📋 Table of Contents

+ [Overview](#-overview)
+ [Key Features](#-key-features)
+ [Tech Stack](#-tech-stack)
+ [Architecture](#-system-architecture)
+ [Project Structure](#-project-structure)
+ [Quick Start](#-quick-start)
+ [Configuration](#-configuration)
+ [Lead Pipeline](#-lead-pipeline)
+ [API Documentation](#-api-documentation)
+ [Database Schema](#-database-schema)
+ [Role-Based Access Control](#-role-based-access-control)
+ [AI & Integration Features](#-ai--integration-features)
+ [Development Guide](#-development-guide)
+ [Deployment](#-deployment)
+ [Contributing](#-contributing)
+ [License](#-license)
+ [Support](#-support)

---

## 🎯 Overview

**BanquetEase** is an enterprise-grade event management platform designed to handle the complete workflow of banquet hall bookings, weddings, corporate events, and celebrations. It automates the complex multi-stage process from initial lead capture to post-event settlement and feedback collection.

### Core Capabilities

- ✅ **12-Stage Lead Pipeline** with customizable workflows
- ✅ **Multi-Role Authorization** (Receptionist, Sales, Kitchen Manager, Operations, Accountant, etc.)
- ✅ **Automatic Booking & Invoice Generation** from lead data
- ✅ **Payment Tracking** with advance, partial, and full payment support
- ✅ **Real-time Calendar & Availability** management
- ✅ **Vendor Management** with ratings and reviews
- ✅ **AI-Powered Insights** (menu recommendations, dynamic pricing, chatbot)
- ✅ **Email Notifications** (confirmations, reminders, receipts)
- ✅ **Analytics Dashboard** with revenue, conversion, and performance metrics
- ✅ **Multi-Branch & Multi-Franchise Support**

---

## ✨ Key Features

### 1. **Lead Management System**
   - Comprehensive lead capture with qualification
   - 12-stage customizable pipeline
   - Automated status transitions
   - Follow-up scheduling and tracking
   - Lead loss tracking with root cause analysis
   - On-hold and reactivation workflows

### 2. **Event Planning & Coordination**
   - Property/hall tour logging
   - Food tasting scheduling and feedback recording
   - Decoration coordination with vendor management
   - Event timeline and checklist management
   - Staff assignment and role-based task distribution
   - Setup and teardown date tracking

### 3. **Menu & Pricing Management**
   - Multi-menu templates with customization options
   - Per-plate costing and bulk calculations
   - Dietary preference and special request handling
   - Dynamic pricing based on guest count
   - Menu photography and presentation management

### 4. **Billing & Payment Processing**
   - Automatic invoice generation
   - Multi-payment mode support (Cash, UPI, Bank Transfer, Cheque, Card)
   - Advance, partial, and full payment tracking
   - Payment history and receipt generation
   - Tax calculation (18% GST by default)
   - Outstanding balance management
   - Refund and extra charge handling

### 5. **Calendar & Availability**
   - Visual event calendar
   - Hall capacity management
   - Availability checking and conflict prevention
   - Event timeline visualization
   - Booking confirmation with locked dates

### 6. **Analytics & Reporting**
   - Revenue dashboard
   - Conversion funnel analysis
   - Lead source tracking
   - Staff performance metrics
   - Event success rates
   - Customer lifetime value (LTV) calculation
   - Audit logs for compliance

### 7. **AI-Powered Features**
   - Chatbot for customer inquiries
   - Menu recommendations based on event type and budget
   - Dynamic pricing suggestions
   - Email template generation
   - Image processing and enhancement
   - Vendor review aggregation via SerpApi

### 8. **Communication & Notifications**
   - Email confirmations (menu, decoration, payment)
   - SMS/WhatsApp integration ready
   - Follow-up reminders
   - Customer feedback collection
   - Post-event testimonials
   - Automated reminder sequences

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16.1.6](https://nextjs.org/) - React framework with SSR/SSG
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + custom components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Tables**: [@tanstack/react-table](https://tanstack.com/table/) - headless table library
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/)
- **Charts**: [Recharts](https://recharts.org/) - React charting library
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) - toast notifications

### Backend
- **Runtime**: Node.js
- **Database**: [Firebase/Firestore](https://firebase.google.com/docs/firestore) - NoSQL cloud database
- **Authentication**: Firebase Authentication
- **Admin SDK**: [firebase-admin@13.7.0](https://firebase.google.com/docs/admin/setup)
- **Email Service**: [Resend](https://resend.com/) - transactional email
- **Image Processing**: [@resvg/resvg-js](https://www.npmjs.com/package/@resvg/resvg-js), [Satori](https://github.com/vercel/satori)

### AI & Language Models
- **Vertex AI**: [@google-cloud/vertexai](https://cloud.google.com/vertex-ai/docs/start/client-libraries) - Google's unified AI platform
- **Groq**: [@langchain/groq](https://js.langchain.com/docs/integrations/llms/groq/) - fast LLM inference
- **LangChain**: [@langchain/core](https://js.langchain.com/docs/get_started/introduction) - LLM orchestration
- **Search**: [google-search-results-nodejs](https://www.npmjs.com/package/google-search-results-nodejs)

### Video & Media
- **Video Generation**: [json2video-sdk](https://www.npmjs.com/package/json2video-sdk)

### Development
- **Linting**: [ESLint 9](https://eslint.org/)
- **CSS Processing**: [PostCSS 4](https://postcss.org/)
- **Bundler**: Webpack (via Next.js)
- **React Compiler**: Babel React Compiler plugin

---

## 🏗 System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js Frontend)                   │
│  (Dashboard, Forms, Calendar, Analytics, Lead Management)       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/JSON API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER & API ROUTES                    │
│  (/api/leads, /api/bookings, /api/invoices, /api/payments)      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
        ┌──────────────────────────┐       ┌──────────────────────┐
        │  FIREBASE/FIRESTORE      │       │  EXTERNAL SERVICES   │
        │  (Database)              │       │  (Email, AI, Search) │
        │                          │       │                      │
        │ Collections:             │       │ - Resend (Email)     │
        │ - leads                  │       │ - Vertex AI / Groq   │
        │ - bookings               │       │ - SerpApi (Reviews)  │
        │ - invoices               │       │ - Google Search      │
        │ - payments               │       │ - json2video         │
        │ - branches               │       │                      │
        │ - menus                  │       │                      │
        │ - vendors                │       │                      │
        │ - staff                  │       │                      │
        │ - audit_logs             │       │                      │
        └──────────────────────────┘       └──────────────────────┘
```

### Request/Response Pipeline

```
User Action (e.g., "Record Advance Payment")
        ↓
Frontend Form Submission
        ↓
Validation (Zod Schema)
        ↓
API Route Handler (/api/leads/[id]) with Action Router
        ↓
├─ Permission Check (Firebase Auth + user roles)
├─ Current Data Fetch (from Firestore)
├─ Business Logic Execution
├─ Batch Operations (Multiple Firestore writes)
├─ Cache Invalidation
├─ External Service Calls (Email, AI, etc.)
└─ Response + Error Handling
        ↓
Frontend Toast Notification + State Update
        ↓
Cache Refresh + Real-time UI Update
```

---

## 📁 Project Structure

```
BanquetEase-CodingGurus/
├── web/                              # Next.js Frontend & Backend
│   ├── src/
│   │   ├── app/                      # Next.js app directory
│   │   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   │   ├── leads/            # Lead management
│   │   │   │   ├── bookings/         # Booking management
│   │   │   │   ├── invoices/         # Invoice & billing
│   │   │   │   ├── payments/         # Payment tracking
│   │   │   │   ├── calendar/         # Event calendar
│   │   │   │   ├── branches/         # Multi-branch management
│   │   │   │   ├── vendors/          # Vendor management
│   │   │   │   ├── menus/            # Menu templates
│   │   │   │   ├── analytics/        # Revenue & metrics
│   │   │   │   ├── audit-logs/       # Compliance logging
│   │   │   │   └── [other modules]/  # Additional features
│   │   │   ├── (marketing)/          # Public pages
│   │   │   │   ├── page.js           # Homepage
│   │   │   │   ├── about/
│   │   │   │   ├── pricing-page/
│   │   │   │   ├── features/
│   │   │   │   └── contact/
│   │   │   ├── api/                  # API route handlers
│   │   │   │   ├── leads/            # Lead API endpoints
│   │   │   │   ├── bookings/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── ai/               # AI endpoints (chatbot, menu recs)
│   │   │   │   ├── branches/
│   │   │   │   └── [other apis]/
│   │   │   ├── login/                # Authentication pages
│   │   │   ├── signup/
│   │   │   ├── globals.css
│   │   │   └── layout.js
│   │   ├── components/               # Reusable React components
│   │   │   ├── shared/               # App-wide shared components
│   │   │   ├── layout/               # Layout components
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   └── debug/                # Debug utilities
│   │   ├── contexts/                 # React Context providers
│   │   │   └── auth-context.js       # Authentication context
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-branches.js
│   │   │   ├── use-staff.js
│   │   │   ├── use-cache-reads.js
│   │   │   └── use-theme.js
│   │   ├── lib/                      # Utility functions & configs
│   │   │   ├── firebase.js           # Firebase client config
│   │   │   ├── firebase-admin.js     # Firebase admin initialization
│   │   │   ├── api-client.js         # Fetch wrapper with auth
│   │   │   ├── cache.js              # In-memory cache layer
│   │   │   ├── ai-validators.js      # AI input validation
│   │   │   ├── google-ai-client.js   # Vertex AI client
│   │   │   ├── groq-client.js        # Groq LLM client
│   │   │   ├── resend-client.js      # Email service client
│   │   │   ├── cloudinary-upload.js  # Image upload service
│   │   │   ├── dynamic-pricing.js    # Pricing algorithm
│   │   │   ├── firestore-cache.js    # Firestore caching wrapper
│   │   │   ├── kitchen-inventory-data.js  # Menu/inventory data
│   │   │   ├── chatbot-knowledge-base.js  # Chatbot context
│   │   │   ├── mock-data.js          # Development mock data
│   │   │   ├── motion-variants.js    # Framer Motion configs
│   │   │   ├── review-analytics.js   # Review data processing
│   │   │   └── invitation-templates/  # Email templates
│   │   └── styles/                   # Global stylesheets
│   │       ├── globals.css
│   │       ├── animations.css
│   │       ├── components.css
│   │       ├── tokens.css
│   │       └── typography.css
│   ├── public/                       # Static assets
│   │   └── firebase-messaging-sw.js  # Service worker
│   ├── scripts/                      # Database seeding scripts
│   │   ├── seed-leads.js
│   │   ├── seed-menus.js
│   │   ├── seed-users.js
│   │   └── serviceAccountKey.json    # Firebase admin credentials (git-ignored)
│   ├── package.json
│   ├── next.config.mjs
│   ├── jsconfig.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   └── README.md
├── call/                             # Python backend for voice/call handling
│   └── main.py
├── docs/                             # Documentation
│   ├── COMPLETE_FLOW_GUIDE.md        # End-to-end flow documentation
│   ├── LEAD_FLOW_DOCUMENTATION.md    # Lead pipeline details
│   ├── README_IMPLEMENTATION.md      # Implementation guide
│   ├── CURL_TESTING_GUIDE.md         # API testing with curl
│   ├── CACHING_STRATEGY.md           # Cache layer documentation
│   ├── FIXES_AND_OPTIMIZATIONS.md    # Performance improvements
│   └── BRANCH_DETAILS.md             # Multi-branch setup
├── .git/                             # Git version control
├── .env.local                        # Local environment variables (git-ignored)
├── .gitignore
└── package-lock.json

```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Firebase Account** with a Firestore database
- **Environment Variables** (see Configuration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BanquetEase.git
   cd BanquetEase-CodingGurus/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials and API keys
   ```

4. **Download Firebase Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `scripts/serviceAccountKey.json`
   - Add to `.gitignore` if not already there

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The application will load with your Firebase database

### Initial Setup

1. **Seed the database** (optional, for testing)
   ```bash
   npm run seed
   # or run individual seed scripts
   node scripts/seed-users.js
   node scripts/seed-menus.js
   node scripts/seed-leads.js
   ```

2. **Create your first branch**
   - Log in as admin
   - Go to Settings → Branches
   - Click "Add Branch"
   - Fill in branch details and save

3. **Configure your team**
   - Go to Settings → Staff
   - Add team members with appropriate roles
   - Assign staff to branches

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the `web/` directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (backend only)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key (from serviceAccountKey.json)
FIREBASE_CLIENT_EMAIL=your_client_email

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_ADDRESS=noreply@yourdomain.com

# AI Services
GOOGLE_APPLICATION_CREDENTIALS=./scripts/serviceAccountKey.json
GROQ_API_KEY=your_groq_api_key
VERTEX_AI_PROJECT_ID=your_gcp_project_id
VERTEX_AI_LOCATION=us-central1

# Image Processing
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# External APIs
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key

# Application Config
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Change in production
NODE_ENV=development # or production
```

### Firestore Database Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Leads - accessible by franchise/branch staff
    match /leads/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.franchise_id == resource.data.franchise_id;
    }
    
    // Bookings - accessible by authorized users
    match /bookings/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.franchise_id == resource.data.franchise_id;
    }
    
    // Invoices - accessible by accounting staff
    match /invoices/{document=**} {
      allow read: if request.auth != null && 
        request.auth.token.franchise_id == resource.data.franchise_id;
      allow write: if request.auth != null && 
        (request.auth.token.role == "accountant" || request.auth.token.role == "admin");
    }
    
    // User profiles
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## 📊 Lead Pipeline

### Pipeline Overview

```
NEW ──→ VISITED ──→ TASTING_SCHEDULED ──→ TASTING_DONE ──→ MENU_SELECTED
 │         │              │                    │               │
 └─→ ON_HOLD ←────────────────────────────────────────────────┘
                (can reactivate to any previous status)
 │
 └─→ LOST (at any stage)

MENU_SELECTED ──→ ADVANCE_PAID ──→ DECORATION_SCHEDULED ──→ PAID
     │               │                    │                    │
     └─→ ON_HOLD ─────→ (reactivate back)                       │
                                                                │
                                        IN_PROGRESS ──→ COMPLETED
                                             │              │
                                        (event day)          │
                                                             ▼
                                        SETTLEMENT_COMPLETE ──→ CLOSED
```

### Stage Details

| # | Stage | Status | Actions | Created Docs | Roles |
|---|-------|--------|---------|--------------|-------|
| 1 | New Enquiry | `new` | Create lead, log follow-ups | Lead | Receptionist, Sales |
| 2 | Property Visit | `visited` | Log visit, rate hall | Activity | Sales, Branch Mgr |
| 3a | Tasting Scheduled | `tasting_scheduled` | Schedule tasting, prep menus | Activity | Kitchen Mgr |
| 3b | Tasting Complete | `tasting_done` | Record feedback, preferred menu | Activity | Kitchen Mgr, Sales |
| 4 | Menu Selected | `menu_selected` | Finalize menu, generate quote | Activity | Kitchen, Sales, Acct |
| 5 | Advance Paid | `advance_paid` | Record payment | **Booking, Invoice** | Accountant |
| 6 | Decoration Scheduled | `decoration_scheduled` | Finalize decor, logistics | Activity | Operations |
| 7 | Full Payment | `paid` | Record remaining payment | Activity | Accountant |
| 8a | Event Started | `in_progress` | Log event start | Activity | Operations |
| 8b | Event Completed | `completed` | Record execution details | Activity | Branch Mgr |
| 9 | Settlement Done | `settlement_complete` | Post-event accounting | Activity | Accountant |
| 10 | Closed | `closed` | Collect feedback, close | Activity | Sales |

### Special Workflows

**Lost Lead** (any stage):
```
[ANY STATUS] ──→ LOST
├─ lost_reason (required)
├─ lost_detail (optional)
└─ competitor_chosen (optional)
```

**On Hold** (any stage):
```
[ANY STATUS] ──→ ON_HOLD
├─ on_hold_reason (required)
├─ on_hold_until (required date)
└─ Can reactivate to previous status
```

**Follow-ups** (any stage):
```
[ANY STATUS] ──→ Log Follow-up
├─ scheduled_date (when)
├─ followup_type (call, visit, whatsapp, email)
├─ outcome (interested, not_interested, callback_later)
├─ notes
└─ next_followup_date
```

---

## 🔌 API Documentation

### Lead Management API

#### GET `/api/leads/[id]`
Retrieve a single lead with activities and follow-ups.

**Query Parameters:**
- `franchise_id` (required): Franchise identifier
- `branch_id` (required): Branch identifier

**Response:**
```json
{
  "lead": {
    "id": "LEAD_001",
    "customer_name": "Rajesh Sharma",
    "status": "advance_paid",
    "phone": "+91-9876543210",
    "email": "rajesh@example.com",
    "event_type": "wedding",
    "event_date": "2026-05-15",
    "expected_guest_count": 250,
    "visited": { /* ... */ },
    "food_tasting": { /* ... */ },
    "menu_finalization": { /* ... */ },
    "booking_confirmed": { /* ... */ },
    "quote": { /* ... */ },
    "status_history": [ /* ... */ ],
    "created_at": "2026-02-28T10:00:00Z",
    "updated_at": "2026-03-01T14:30:00Z"
  },
  "activities": [ /* ... */ ],
  "follow_ups": [ /* ... */ ]
}
```

#### PUT `/api/leads/[id]`
Update lead status or specific fields with action-based routing.

**Request Body:**
```json
{
  "franchise_id": "pfd",
  "branch_id": "pfd_b1",
  "action": "record_advance",  // Specific action determining what happens
  "performed_by_uid": "uid_123",
  "performed_by_name": "John Doe",
  // ... action-specific fields ...
  "advance_amount": 50000,
  "payment_date": "2026-03-01",
  "payment_mode": "bank_transfer",
  "transaction_ref": "TXN123456"
}
```

**Supported Actions:**

- **`log_visit`** (Stage 2)
  ```json
  {
    "action": "log_visit",
    "visit_date": "2026-03-01",
    "hall_id": "hall_001",
    "hall_name": "Grand Ballroom",
    "notes": "Customer loved the decor",
    "customer_rating": 4.5
  }
  ```

- **`schedule_tasting`** (Stage 3a)
  ```json
  {
    "action": "schedule_tasting",
    "tasting_date": "2026-03-08",
    "menu_options_to_present": ["north_indian", "south_indian"],
    "notes": "Vegetarian preference"
  }
  ```

- **`complete_tasting`** (Stage 3b)
  ```json
  {
    "action": "complete_tasting",
    "dishes_sampled": ["tandoori_chicken", "dal_makhani"],
    "customer_feedback": "Excellent taste, good quantity",
    "preferred_menu": "north_indian",
    "kitchen_manager": "Chef Rahul"
  }
  ```

- **`finalize_menu`** (Stage 4)
  ```json
  {
    "action": "finalize_menu",
    "menu_id": "menu_001",
    "menu_name": "North Indian Premium",
    "per_plate_cost": 800,
    "expected_plates": 250,
    "customizations": ["extra_appetizers"],
    "hall_rent": 80000,
    "food_cost": 200000,
    "decor_estimate": 50000,
    "valid_till": "2026-03-15"
  }
  ```
  → Sends menu confirmation email

- **`record_advance`** (Stage 5) ⭐ **Creates Booking & Invoice**
  ```json
  {
    "action": "record_advance",
    "advance_amount": 100000,
    "payment_date": "2026-03-01",
    "payment_mode": "bank_transfer",
    "transaction_ref": "TXN123456",
    "confirmed_by": "Priya"
  }
  ```
  → Auto-creates Booking and Invoice documents
  → Sends payment confirmation email

- **`finalize_decoration`** (Stage 6)
  ```json
  {
    "action": "finalize_decoration",
    "final_guest_count": 250,
    "decor_theme": "Floral Garden",
    "decor_partner": "Elegant Decor Ltd",
    "decor_cost": 50000,
    "setup_date": "2026-05-14",
    "teardown_date": "2026-05-16",
    "special_requests": "Gold theme with fairy lights"
  }
  ```

- **`record_full_payment`** (Stage 7)
  ```json
  {
    "action": "record_full_payment",
    "remaining_amount": 200000,
    "payment_date": "2026-04-15",
    "payment_mode": "bank_transfer",
    "transaction_ref": "TXN789012"
  }
  ```
  → Locks event, prevents modifications

- **`start_event`** (Stage 8a)
  ```json
  {
    "action": "start_event"
  }
  ```

- **`complete_event`** (Stage 8b)
  ```json
  {
    "action": "complete_event",
    "actual_guest_count": 248,
    "start_time": "19:00",
    "end_time": "23:30",
    "problems_encountered": null,
    "contingency_actions": null,
    "staff_feedback": "Event went smoothly",
    "photos_taken": 150
  }
  ```

- **`settle_event`** (Stage 9)
  ```json
  {
    "action": "settle_event",
    "final_guest_count": 248,
    "final_plates_served": 248,
    "leftover_refund_amount": 0,
    "extra_charges_amount": 5000,
    "extra_charges_reason": "Additional DJ hours",
    "total_final_amount": 335000,
    "amount_paid": 300000,
    "final_settlement_amount": 35000,
    "settled_date": "2026-05-18"
  }
  ```

- **`close_lead`** (Stage 10)
  ```json
  {
    "action": "close_lead",
    "customer_rating": 4.8,
    "food_rating": 4.9,
    "ambiance_rating": 4.7,
    "service_rating": 4.6,
    "feedback_text": "Fantastic event, would recommend!",
    "permission_for_testimonial": true,
    "repeat_booking": false
  }
  ```

- **`add_followup`** (any stage)
  ```json
  {
    "action": "add_followup",
    "scheduled_date": "2026-03-05",
    "followup_type": "call",
    "outcome": "interested",
    "notes": "Customer interested, asking about packages",
    "call_duration_mins": 12,
    "call_answered": true,
    "next_followup_date": "2026-03-10",
    "next_followup_type": "visit"
  }
  ```

- **`mark_lost`** (any stage)
  ```json
  {
    "action": "mark_lost",
    "lost_reason": "budget_constraints",
    "lost_detail": "Requested higher discount",
    "competitor_chosen": "Competitor Banquet Hall"
  }
  ```

- **`put_on_hold`** (any stage)
  ```json
  {
    "action": "put_on_hold",
    "on_hold_reason": "Customer traveling, will decide after return",
    "on_hold_until": "2026-04-01"
  }
  ```

- **`reactivate`** (from on_hold)
  ```json
  {
    "action": "reactivate"
  }
  ```
  → Reactivates to previous status

- **`status_change`** (manager override)
  ```json
  {
    "action": "status_change",
    "new_status": "advance_paid",
    "note": "Manual correction due to system error"
  }
  ```

#### DELETE `/api/leads/[id]`
Permanently delete a lead.

**Request Body:**
```json
{
  "franchise_id": "pfd",
  "branch_id": "pfd_b1"
}
```

---

## 💾 Database Schema

### Firestore Collections

#### `leads/{lead_id}`
```firestore
{
  // Identity
  id: string,
  franchise_id: string,
  branch_id: string,
  
  // Customer Info
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  
  // Event Planning
  event_type: string (wedding|corporate|birthday|etc),
  event_date: timestamp,
  event_time: string,
  expected_guest_count: number,
  budget_range: string,
  
  // Hall Assignment
  hall_id: string,
  hall_name: string,
  
  // Status & History
  status: string (new|visited|tasting_scheduled|...),
  status_history: {
    status: string,
    changed_at: timestamp,
    changed_by: string,
    note: string
  }[],
  
  // Pipeline Data (nested objects)
  visited: {
    date: date,
    hall_id: string,
    hall_name: string,
    visited_by: string,
    notes: string,
    rating_from_customer: number
  },
  
  food_tasting: {
    scheduled_date: date,
    menu_options_presented: string[],
    notes: string,
    conducted_at: timestamp,
    dishes_sampled: string[],
    customer_feedback: string,
    preferred_menu: string,
    kitchen_manager: string
  },
  
  menu_finalization: {
    finalized_menu_id: string,
    finalized_menu_name: string,
    finalized_date: timestamp,
    customizations: string[],
    final_per_plate_cost: number,
    expected_plates: number,
    total_food_cost: number
  },
  
  quote: {
    hall_base_rent: number,
    food_cost: number,
    decoration_budget_estimated: number,
    total_estimated: number,
    quote_valid_till: date,
    generated_at: timestamp
  },
  
  booking_confirmed: {
    date: timestamp,
    advance_amount: number,
    advance_payment_date: date,
    payment_mode: string,
    transaction_ref: string,
    confirmed_by: string
  },
  
  event_finalization: {
    final_confirmed_date: date,
    final_guest_count: number,
    final_per_plate_food: number,
    final_food_cost: number,
    decoration_theme: string,
    decoration_partner: string,
    decoration_cost: number,
    setup_date: date,
    teardown_date: date,
    special_requests: string,
    finalized_at: timestamp,
    finalized_by: string
  },
  
  final_payment: {
    remaining_amount: number,
    due_date: date,
    payment_date: date,
    payment_mode: string,
    transaction_ref: string
  },
  
  event_execution: {
    started_at: timestamp,
    started_by: string,
    event_date: date,
    start_time: string,
    end_time: string,
    actual_guest_count: number,
    photos_taken: number,
    problems_encountered: string,
    contingency_actions: string,
    staff_feedback: string,
    completed_at: timestamp,
    completed_by: string
  },
  
  post_event_settlement: {
    settlement_date: date,
    final_guest_count: number,
    final_plates_served: number,
    leftover_refund: {
      plates_not_served: number,
      refund_amount: number
    },
    extra_charges: {
      reason: string,
      amount: number
    },
    total_final_amount: number,
    amount_paid: number,
    final_settlement: number,
    settled_by: string
  },
  
  feedback: {
    feedback_date: date,
    customer_rating: number (1-5),
    food_rating: number (1-5),
    ambiance_rating: number (1-5),
    service_rating: number (1-5),
    feedback_text: string,
    permission_for_testimonial: boolean,
    repeat_booking: boolean
  },
  
  // Links
  booking_id: string,
  invoice_id: string,
  is_converted: boolean,
  converted_booking_id: string,
  converted_at: timestamp,
  
  // Metrics
  lifetime_value: number,
  followup_count: number,
  lost: boolean,
  lost_reason: string,
  lost_detail: string,
  competitor_chosen: string,
  on_hold: boolean,
  on_hold_reason: string,
  on_hold_until: date,
  
  // Assignment & Follow-up
  assigned_to_uid: string,
  assigned_to_name: string,
  last_contacted_at: timestamp,
  next_followup_date: date,
  next_followup_type: string,
  
  // System Fields
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `bookings/{booking_id}`
Auto-created when lead reaches Stage 5 (advance_paid).

```firestore
{
  lead_id: string,
  franchise_id: string,
  branch_id: string,
  
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  
  event_type: string,
  event_date: date,
  event_time: string,
  hall_id: string,
  hall_name: string,
  expected_guest_count: number,
  
  menu: {
    name: string,
    per_plate_cost: number,
    plates: number,
    total: number
  },
  
  decor: {
    theme: string,
    partner: string,
    cost: number
  },
  
  payments: {
    quote_total: number,
    advance_amount: number,
    total_paid: number,
    balance_due: number,
    payment_history: {
      amount: number,
      date: date,
      mode: string,
      ref: string,
      type: string (advance|partial|full),
      recorded_by: string
    }[]
  },
  
  status: string (confirmed|completed|cancelled),
  event_locked: boolean,
  checklist: string[],
  vendors: {
    type: string,
    name: string,
    contact: string,
    cost: number
  }[],
  staff_assigned: string[],
  notes: string,
  
  created_by_uid: string,
  created_by_name: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `invoices/{invoice_id}`
Auto-created when lead reaches Stage 5 (advance_paid).

```firestore
{
  invoice_number: string (unique),
  booking_id: string,
  lead_id: string,
  franchise_id: string,
  branch_id: string,
  
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  
  event_type: string,
  event_date: date,
  
  line_items: {
    description: string,
    qty: number,
    rate: number,
    amount: number
  }[],
  
  subtotal: number,
  tax_rate: number (0.18),
  tax_amount: number,
  discount: number,
  total: number,
  
  amount_paid: number,
  balance_due: number,
  
  payment_history: {
    amount: number,
    date: date,
    mode: string,
    ref: string,
    type: string,
    recorded_by: string
  }[],
  
  status: string (sent|partially_paid|paid|overdue),
  due_date: date,
  notes: string,
  
  created_by_uid: string,
  created_by_name: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `lead_activities/{activity_id}`
Records all actions taken on a lead for audit trail.

```firestore
{
  lead_id: string,
  franchise_id: string,
  branch_id: string,
  
  activity_type: string,
  description: string,
  performed_by_uid: string,
  performed_by_name: string,
  metadata: object,
  created_at: timestamp
}
```

#### `follow_ups/{followup_id}`
Individual follow-up records for leads.

```firestore
{
  lead_id: string,
  franchise_id: string,
  branch_id: string,
  
  scheduled_date: date,
  followup_type: string (call|visit|whatsapp|email),
  outcome: string (interested|not_interested|callback_later|no_response),
  notes: string,
  
  call_duration_mins: number,
  call_answered: boolean,
  
  next_followup_date: date,
  next_followup_type: string,
  
  done_by_user_id: string,
  done_by_user_name: string,
  done_at: timestamp,
  
  is_overdue: boolean,
  created_at: timestamp
}
```

#### `branches/{branch_id}`
Branch/location information and statistics.

```firestore
{
  name: string,
  phone: string,
  contact_phone: string,
  email: string,
  contact_email: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  
  franchise_id: string,
  manager_id: string,
  manager_name: string,
  
  _stats: {
    last_updated_at: timestamp,
    leads_by_status: {
      new: number,
      visited: number,
      advance_paid: number,
      closed: number,
      lost: number,
      ...
    },
    total_leads: number,
    total_revenue: number,
    total_bookings: number
  },
  
  operating_hours: {
    monday: { open: string, close: string },
    // ... other days
  },
  
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `staff/{staff_id}`
Team member information with role and permissions.

```firestore
{
  name: string,
  email: string,
  phone: string,
  
  franchise_id: string,
  branch_id: string,
  user_id: string (Firebase Auth UID),
  
  role: string (receptionist|sales_executive|kitchen_manager|operations_staff|accountant|branch_manager|franchise_admin),
  
  permissions: string[],
  is_active: boolean,
  
  joined_at: timestamp,
  updated_at: timestamp
}
```

#### `audit_logs/{log_id}`
Compliance and audit trail for all significant actions.

```firestore
{
  entity_type: string (lead|booking|invoice|payment),
  entity_id: string,
  action: string (created|updated|deleted|status_changed),
  
  franchise_id: string,
  branch_id: string,
  performed_by_uid: string,
  performed_by_name: string,
  
  details: object,
  ip_address: string (if available),
  
  created_at: timestamp
}
```

---

## 👥 Role-Based Access Control

### Roles & Permissions Matrix

| Role | Leads | Bookings | Invoices | Payments | Reports | Users | Settings |
|------|-------|----------|----------|----------|---------|-------|----------|
| **Receptionist** | Create, Read | Read | View | View | Limited | — | — |
| **Sales Exec** | Full | Read | View | View | Read | — | — |
| **Kitchen Manager** | Read, Tasting | Read | View | View | Limited | — | — |
| **Operations Staff** | Read, Update | Full | View | View | Limited | — | — |
| **Accountant** | Read | Read | Full | Full | Finance | — | — |
| **Branch Manager** | Full | Full | Read | Read | Full | Manage | Branch |
| **Franchise Admin** | Full | Full | Full | Full | Full | Manage | Full |

### Firestore Security Rules

- Leads: Accessible only within the user's franchise/branch
- Bookings: Write access requires accountant or operations role
- Invoices: Write access restricted to accountant or admin
- Audit Logs: Append-only by system; readable by branch managers and above

---

## 🤖 AI & Integration Features

### 1. Chatbot Integration
- **Location**: `/api/ai/chatbot`
- **Models**: Groq or Vertex AI
- **Context Source**: `lib/chatbot-knowledge-base.js`
- **Features**:
  - Menu & pricing inquiries
  - Booking status updates
  - Payment reminders
  - Event tips and suggestions

### 2. Menu Recommendations
- **Location**: `/api/ai/menu-recommendations`
- **Logic**: Groq/Vertex API
- **Inputs**: Event type, guest count, budget, dietary preferences
- **Output**: Ranked menu suggestions with cost breakdown

### 3. Dynamic Pricing Engine
- **Location**: `lib/dynamic-pricing.js`
- **Factors**: Guest count, event type, season, day of week, hall capacity
- **Algorithms**: Demand-based adjustment, volume discounts

### 4. Email Templates
- Menu confirmation
- Decoration confirmation
- Payment confirmations (advance, full)
- Event reminders
- Feedback collection
- Testimonial requests

### 5. Vendor Reviews (SerpApi Integration)
- Aggregates reviews from Google, Facebook, Instagram
- Calculates sentiment and average rating
- Updates vendor profiles automatically

### 6. Image Processing
- Event photo gallery management
- Menu photo editing with Satori
- Social media image generation
- Video clips from photos (json2video-sdk)

---

## 🔧 Development Guide

### Running in Development Mode

```bash
# Start dev server with hot reload
npm run dev

# Open http://localhost:3000
# All changes auto-refresh
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Start production server
npm run start
```

### Linting & Code Quality

```bash
# Run ESLint
npm run lint

# Format code (configure in .eslintrc)
npm run lint -- --fix
```

### Database Seeding

```bash
# Seed all collections
node scripts/seed-users.js
node scripts/seed-menus.js
node scripts/seed-leads.js

# Or create custom seed script
```

### Debugging

**Firebase Emulator** (for local testing):
```bash
firebase emulators:start
```

**Console Logging**:
- Browser: Open DevTools (F12) → Console tab
- Server: Check terminal output

**Manual API Testing**:
```bash
# Using curl
curl -X GET "http://localhost:3000/api/leads/LEAD_001?franchise_id=pfd&branch_id=pfd_b1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using API testing tools: Postman, Insomnia, REST Client
```

### Code Structure Best Practices

1. **API Routes**:
   - Keep handlers in `app/api/[resource]/route.js`
   - Use action-based routing with switch statements
   - Always validate input with Zod schemas
   - Return consistent error responses

2. **Components**:
   - Keep in `components/` organized by feature
   - Use React Hook Form for forms
   - Use shadcn/ui primitives
   - Export default functional components

3. **Hooks**:
   - Create custom hooks in `hooks/`
   - Follow React hooks best practices
   - Export named hooks

4. **Utilities**:
   - Place shared logic in `lib/`
   - Export pure functions
   - Avoid side effects in utils

5. **Styles**:
   - Use Tailwind CSS classes
   - Define animations in `motion-variants.js`
   - Keep component styles within component files

---

## 🚢 Deployment

### Deploying to Vercel

1. **Connect Repository**:
   ```bash
   vercel link
   ```

2. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add FIREBASE_PRIVATE_KEY
   # ... add all required env vars
   ```

3. **Deploy**:
   ```bash
   vercel deploy --prod
   ```

### Deploying to Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Configure Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Build & Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Production Checklist

- [ ] Environment variables configured in `.env.production`
- [ ] Firebase security rules updated
- [ ] Firestore indexes created
- [ ] Email service configured (Resend)
- [ ] AI API keys secured
- [ ] Database backups enabled
- [ ] Error monitoring (Sentry/LogRocket) set up
- [ ] CDN configured for static assets
- [ ] SSL certificate enabled
- [ ] Rate limiting / DDoS protection active
- [ ] Database read/write costs optimized
- [ ] Caching strategy implemented

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/BanquetEase.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit with clear messages**
   ```bash
   git commit -m "Add: Amazing feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe what changed and why
   - Reference any related issues
   - Request review from maintainers

### Coding Standards

- Use ESLint configuration
- Follow Airbnb JavaScript Style Guide
- Write meaningful variable/function names
- Add JSDoc comments for functions
- Keep files under 300 lines
- Use React hooks (no class components)
- Handle errors gracefully

### Testing

```bash
# Unit tests (if configured)
npm run test

# Integration tests
npm run test:integration

# e2e tests
npm run test:e2e
```

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation
- [Complete Flow Guide](COMPLETE_FLOW_GUIDE.md)
- [Lead Flow Documentation](LEAD_FLOW_DOCUMENTATION.md)
- [Implementation Guide](README_IMPLEMENTATION.md)
- [API Testing Guide](CURL_TESTING_GUIDE.md)
- [Caching Strategy](CACHING_STRATEGY.md)

### Getting Help

1. **Check Existing Issues**: Search [GitHub Issues](https://github.com/yourusername/BanquetEase/issues)
2. **Create an Issue**: Provide detailed description with reproduction steps
3. **Contact**: Reach out to the development team at support@banquetease.com
4. **Community**: Join our Slack/Discord community

### Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Environment (browser, OS, Node version)
- Relevant code snippets

---

## 🎯 Roadmap

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] Video conferencing for virtual tours
- [ ] Vendor marketplace integration
- [ ] Advanced analytics & forecasting

### Q3 2026
- [ ] SMS/WhatsApp integration
- [ ] Loyalty program module
- [ ] Enhanced AI recommendations
- [ ] Multi-language support

### Q4 2026
- [ ] Blockchain-based payment verification
- [ ] AR virtual venue tours
- [ ] Guest management system
- [ ] Marketing automation suite

---

## 👨‍💻 Authors & Contributors

**Development Team**: [Coding Gurus]
- Project Lead: [Your name]
- Lead Backend Engineer: [Name]
- Lead Frontend Engineer: [Name]

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for full contributor list.

---

## 📞 Contact & Social

- **Email**: support@banquetease.com
- **Website**: [www.banquetease.com](https://www.banquetease.com)
- **LinkedIn**: [BanquetEase](https://linkedin.com/company/banquetease)
- **Twitter**: [@banquetease](https://twitter.com/banquetease)
- **GitHub**: [BanquetEase](https://github.com/yourusername/BanquetEase)

---

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📈 Statistics

- **Lines of Code**: 15,000+
- **API Endpoints**: 40+
- **Database Collections**: 10+
- **UI Components**: 50+
- **Test Coverage**: 65%

---

**Made with ❤️ by the BanquetEase Team**

*Last Updated: March 1, 2026*
