# HACKNICHE 4.0 — Problem Statement

## Banquet Management & Intelligence Tool

---

## The Problem

Banquet management is a logistical minefield involving shifting guest counts, complex dietary preferences, and tight financial coordination. Most current systems are either simple booking calendars or rigid accounting software.

There is a dire need for a **"Single Source of Truth"** that bridges the gap between:
- Sales Team
- Finance Department
- Kitchen / Operations
- On-Ground Guest Relations Staff (GRE)

...while providing a seamless **WhatsApp-first experience** for the client.

---

## The Core Challenge

Develop an integrated **Banquet Management & Intelligence Tool** that handles the entire lifecycle of an event — from initial multi-tier menu selection and lead "blocking" to financial tracking, real-time guest check-ins, and post-event data auditing.

---

## Workflow & Technical Requirements

### Phase A: Client Selection & Inquiry (The "Lock-In")
- **Input Module:** Capture Party Name, Client Details, Event Manager, Date/Time/Location, and GST info
- **Menu Engine:** Tiered pricing structure (Standard, Premium, Elite)
- **Inventory/Conflict Logic:** Flag event overlaps and provide menu recommendations based on stock or prep efficiency

### Phase B: Finance Manager Interface (The "Gatekeeper")
- **Status Management:** Initial entries marked as "Temporary Enquiry"
- **Financial Dashboard:**
  - Input and track payment updates (initial deposits vs. final settlements)
  - Manage installment plans with automated reminders for upcoming due dates
- **Confirmation Toggle:** Slot only "Confirmed" once Finance triggers "Payment Received" flag, shifting status from "Enquiry" → "Booked"

### Phase C: GRE & Guest Interface (The "Arrival")
- **GRE RSVP Dashboard:** Mobile-optimized interface for Guest Relations Executives
  - Scan RSVPs via QR-based check-in at the door
  - Real-time counter of arrived vs. expected guests to update kitchen on live headcount
- **WhatsApp Integration:** Automate delivery of:
  - Purchase Order (PO) to the client
  - Function Prospectus (FP) to the internal team

### Phase D: Strategic Audit & Intelligence (The "Brain")
- **Menu Optimization:** Analyze item popularity to recommend "Optimal Menus" for future sales
- **Cancellation Post-Mortem:** Detailed analysis of lost leads (Price, Date, Competitors)
- **Operational Synergy:** Recommendations based on adjacent event schedules to minimize food waste and labor costs

---

## Tech Stack Constraints

| Area | Requirement |
|------|-------------|
| Frontend | Must be mobile-responsive (specifically for GREs and DJs) |
| Integration | WhatsApp Business API (or Twilio simulation) |
| Data Source | Must ingest and update from a structured CSV/Excel pricing sheet |
| AI | Featherless.ai — build an additional unique feature |

---

## Featherless.ai

Build an **additional unique feature** using featherless.ai as the AI backbone.

---

## Judging Criteria

Judges will evaluate the **complete customer journey** across multiple user profiles:

1. Date finalisation
2. Menu booking
3. Function Prospectus development
4. Financial confirmation
5. Party execution

---

## Brownie Points: Real-Time Event Operations (The "Experience")

### DJ Interface
A specialized "Live View" for the DJ to see real-time music recommendations submitted by guests via:
- Client-side WhatsApp link
- Web portal

### Collaborative Event Gallery
- **Guest Side:** Shared digital space where guests can upload photos in real-time
- **Admin Side:** Interface for Event Manager to remove inappropriate content
- **AI Oversight:** Auto-flagging/reporting for sensitive or irrelevant content

### Customer Journey Roadmap
Clear end-to-end journey map covering all touchpoints from initial inquiry to post-event wrap-up across multiple user profiles.

### Banquet Customer Pain Point Resolution
Identify and address additional pain points faced by banquet booking customers beyond the core requirements.
