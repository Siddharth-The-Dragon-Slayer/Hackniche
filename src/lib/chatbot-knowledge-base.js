/**
 * BanquetEase — Chatbot Knowledge Base
 *
 * This file is the single source of truth for the BanquetEase conversational
 * chatbot / WhatsApp concierge. Import the exported constants into any AI
 * route handler to inject structured context into the system prompt.
 *
 * Sections
 * ─────────
 * 1.  PLATFORM             — Product & company overview
 * 2.  FRANCHISE            — Prasad Food Divine (pfd) franchise details
 * 3.  BRANCHES             — All 9 outlets (address, phone, timings, ratings)
 * 4.  HALLS                — Hall name, capacity, pricing, features (per branch)
 * 5.  MENUS                — Menu packages with pricing and signature dishes
 * 6.  LEAD_PROCESS         — 10-stage lead lifecycle (new → closed)
 * 7.  ROLES                — Roles, responsibilities, and access levels
 * 8.  EVENT_TYPES          — Supported event categories
 * 9.  FAQ                  — Common customer questions & answers
 * 10. CHATBOT_PERSONA      — Tone, language, and response guidelines
 * 11. KNOWLEDGE_BASE_TEXT  — Single concatenated string for LLM system prompts
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM = {
  name: "BanquetEase",
  tagline: "The Complete Banquet Management Platform",
  built_by: "Coding Gurus",
  website: "https://banquetease.com",
  description:
    "BanquetEase is an end-to-end banquet & event management SaaS platform that " +
    "helps banquet halls, franchise operators, and event venues manage leads, bookings, " +
    "menus, staff, inventory, payments, and AI-powered tools — all from one dashboard.",
  key_features: [
    "Lead capture & 10-stage pipeline management",
    "Multi-branch & franchise management",
    "Hall booking & availability calendar",
    "Menu customisation & food tasting coordination",
    "AI menu recommendations, lead scoring & proposal generation",
    "WhatsApp concierge / conversational chatbot",
    "Video invitation generator (AI-powered)",
    "Dynamic pricing & revenue forecasting",
    "Staff roster & role-based access control",
    "Inventory & purchase order management",
    "Payment tracking (advance + final settlement)",
    "Customer reviews & sentiment analysis",
    "Audit logs & analytics dashboard",
  ],
  target_users: [
    "Franchise owners / admins",
    "Branch managers",
    "Sales executives",
    "Receptionists",
    "Kitchen managers",
    "Operations staff",
    "Accountants",
  ],
  contact_email: "contact@codinggurus.in",
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. FRANCHISE
// ─────────────────────────────────────────────────────────────────────────────

export const FRANCHISE = {
  id: "pfd",
  name: "Prasad Food Divine",
  short_code: "PFD",
  email: "darshankhapekar8520@gmail.com",
  phone: "+91-8520000001",
  city: "Kalyan",
  state: "Maharashtra",
  country: "India",
  status: "active",
  plan: "professional",
  total_branches: 9,
  description:
    "Prasad Food Divine is a premium vegetarian banquet & restaurant franchise based in " +
    "Maharashtra, India. It operates 9 branches across Mumbai metropolitan region. " +
    "Known for authentic Indian vegetarian cuisine, elegant banquet halls, and " +
    "warm hospitality — making every occasion memorable.",
  cuisine_focus: "Pure Indian Vegetarian",
  speciality: "Weddings, receptions, anniversaries, corporate events & celebrations",
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. BRANCHES  (all 9 Prasad Food Divine outlets)
// ─────────────────────────────────────────────────────────────────────────────

export const BRANCHES = [
  {
    id: "pfd_b1",
    name: "Kalyan West",
    city: "Kalyan",
    state: "Maharashtra",
    address:
      "2nd Floor, Gurudev Vanijya Sankul, Khadakpada Road, Above Croma Showroom, " +
      "Sambhaji Nagar, Adharwadi, Kalyan West, Maharashtra 421301",
    phone: "+91 97697 97095",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.6,
    review_count: 13803,
    cost_for_two: 900,
    maps_url: "https://www.google.com/maps?q=19.252743,73.128803",
  },
  {
    id: "pfd_b2",
    name: "Kalyan East",
    city: "Kalyan",
    state: "Maharashtra",
    address:
      "Pune Link Road, Tisgaon Naka, Kalyan East, Maharashtra 421306",
    phone: "+91 72080 80601",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.7,
    review_count: 13379,
    cost_for_two: 850,
    maps_url: "https://www.google.com/maps?q=19.224911,73.134117",
  },
  {
    id: "pfd_b3",
    name: "Virar",
    city: "Virar",
    state: "Maharashtra",
    address:
      "C, Baban Smruti, Opposite Reliance Smart, Y K Nagar, Virar West, Maharashtra 401303",
    phone: "+91 70390 63748",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.7,
    review_count: 3376,
    cost_for_two: 1025,
    maps_url: "https://www.google.com/maps?q=19.464247,72.805615",
  },
  {
    id: "pfd_b4",
    name: "Badlapur",
    city: "Badlapur",
    state: "Maharashtra",
    address:
      "Ganesh Ghat, Block-A, Laxmi Yashwant Arcade, Katrap, Badlapur, Maharashtra 421503",
    phone: "+91 93249 29205",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.6,
    review_count: 6388,
    cost_for_two: 1000,
    maps_url: "https://www.google.com/maps?q=19.170781,73.227519",
  },
  {
    id: "pfd_b5",
    name: "Dombivali",
    city: "Dombivali",
    state: "Maharashtra",
    address:
      "SS Business Park, Chhatrapati Shivaji Maharaj Circle, Omkar Nagar, " +
      "Sagarli Gaon, Dombivli East, Maharashtra 421203",
    phone: "+91 86552 60601",
    timings: "11:00 AM – 11:00 PM",
    google_rating: 4.6,
    review_count: 6758,
    cost_for_two: 950,
    maps_url: "https://www.google.com/maps?q=19.214788,73.101489",
  },
  {
    id: "pfd_b6",
    name: "Thane",
    city: "Thane",
    state: "Maharashtra",
    address:
      "Thakre Compound, Tikunjiniwadi Road, Chittalsar, Manpada, Thane West, Maharashtra 400610",
    phone: "+91 93721 14520",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.7,
    review_count: 10593,
    cost_for_two: 1000,
    maps_url: "https://www.google.com/maps?q=19.236525,72.973957",
  },
  {
    id: "pfd_b7",
    name: "Mulund",
    city: "Mumbai",
    state: "Maharashtra",
    address:
      "D-702, Mulund-Goregaon Link Road, Industrial Area, Bhandup West, Mumbai, Maharashtra 400078",
    phone: "+91 99202 79393",
    timings: "11:00 AM – 11:30 PM",
    time_slots: ["7:00 AM – 4:00 PM", "7:00 PM – 12:00 AM"],
    google_rating: 4.7,
    review_count: 10908,
    cost_for_two: 950,
    maps_url: "https://www.google.com/maps?q=19.163161,72.939952",
  },
  {
    id: "pfd_b8",
    name: "Powai",
    city: "Mumbai",
    state: "Maharashtra",
    address:
      "IIT Mumbai, Q Nagesh Nilay, Adi Shankaracharya Marg, Panchkutir Ganesh Nagar, " +
      "Powai, Mumbai, Maharashtra 400076",
    phone: "+91 86577 68175",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.7,
    review_count: 4398,
    cost_for_two: 1200,
    maps_url: "https://www.google.com/maps?q=19.123738,72.910435",
  },
  {
    id: "pfd_b9",
    name: "Vashi",
    city: "Navi Mumbai",
    state: "Maharashtra",
    address:
      "Shop No-8, Palm Beach Galleria Mall, Plot No-17, Sector-19D, Phase 2, " +
      "Turbhe Zone, Vashi, Navi Mumbai, Maharashtra 400703",
    phone: "+91 70454 21725",
    timings: "11:00 AM – 11:30 PM",
    google_rating: 4.6,
    review_count: 908,
    cost_for_two: 1000,
    maps_url: "https://www.google.com/maps?q=19.085107,73.007781",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. HALLS  (per-branch banquet hall inventory)
// ─────────────────────────────────────────────────────────────────────────────

export const HALLS = [
  // ── Kalyan West (pfd_b1) ───────────────────────────────────────
  {
    id: "pfd_b1_h1",
    name: "Hall 1",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    type: "Indoor",
    capacity_seating: 60,
    capacity_floating: 100,
    base_price: 27000,
    price_per_plate: 450,
    features: ["AC", "Mahogany paneling", "Crystal chandeliers"],
  },
  {
    id: "pfd_b1_h2",
    name: "Hall 2",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    type: "Indoor",
    capacity_seating: 150,
    capacity_floating: 250,
    base_price: 67500,
    price_per_plate: 450,
    features: ["AC", "Mahogany paneling", "Crystal chandeliers", "In-house catering"],
  },
  {
    id: "pfd_b1_h3",
    name: "Hall 1+2 Combined",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    type: "Indoor",
    capacity_seating: 200,
    capacity_floating: 350,
    base_price: 90000,
    price_per_plate: 450,
    features: [
      "AC",
      "Mahogany paneling",
      "Crystal chandeliers",
      "Changing rooms",
      "Ample parking",
    ],
  },

  // ── Kalyan East (pfd_b2) ──────────────────────────────────────
  {
    id: "pfd_b2_h1",
    name: "Shamiyana Hall",
    branch_id: "pfd_b2",
    branch_name: "Kalyan East",
    type: "Indoor",
    capacity_seating: 200,
    capacity_floating: 220,
    base_price: 90000,
    price_per_plate: 450,
    features: ["AC", "Full AC banquet", "In-house catering", "Valet service", "Parking"],
  },
  {
    id: "pfd_b2_h2",
    name: "Small Hall",
    branch_id: "pfd_b2",
    branch_name: "Kalyan East",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 120,
    base_price: 36000,
    price_per_plate: 450,
    features: ["AC", "In-house catering", "Parking"],
  },

  // ── Virar (pfd_b3) ────────────────────────────────────────────
  {
    id: "pfd_b3_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b3",
    branch_name: "Virar",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 150,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Modern interiors", "Valet parking", "In-house catering"],
  },

  // ── Badlapur (pfd_b4) ─────────────────────────────────────────
  {
    id: "pfd_b4_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b4",
    branch_name: "Badlapur",
    type: "Indoor",
    capacity_seating: 150,
    capacity_floating: 250,
    base_price: 67500,
    price_per_plate: 450,
    features: ["AC", "In-house catering", "In-house decor", "Parking"],
  },

  // ── Dombivali (pfd_b5) ────────────────────────────────────────
  {
    id: "pfd_b5_h1",
    name: "Celebration Hall",
    branch_id: "pfd_b5",
    branch_name: "Dombivali",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 180,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Professional staff", "In-house catering"],
  },

  // ── Thane (pfd_b6) ────────────────────────────────────────────
  {
    id: "pfd_b6_h1",
    name: "Tilak Banquet",
    branch_id: "pfd_b6",
    branch_name: "Thane",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 120,
    base_price: 36000,
    price_per_plate: 450,
    features: ["AC", "In-house catering", "Cooperative staff", "Birthday arrangements"],
  },

  // ── Mulund (pfd_b7) ───────────────────────────────────────────
  {
    id: "pfd_b7_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b7",
    branch_name: "Mulund",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 150,
    base_price: 36000,
    price_per_plate: 450,
    time_slots: ["7:00 AM – 4:00 PM", "7:00 PM – 12:00 AM"],
    features: ["AC", "Good food quality", "2 time slots available"],
  },

  // ── Powai (pfd_b8) ────────────────────────────────────────────
  {
    id: "pfd_b8_h1",
    name: "Grand Hall",
    branch_id: "pfd_b8",
    branch_name: "Powai",
    type: "Indoor",
    capacity_seating: 120,
    capacity_floating: 200,
    base_price: 54000,
    price_per_plate: 450,
    features: ["AC", "Pure veg banquet", "2 changing rooms", "Event venue services"],
  },

  // ── Vashi (pfd_b9) ────────────────────────────────────────────
  {
    id: "pfd_b9_h1",
    name: "Event Hall",
    branch_id: "pfd_b9",
    branch_name: "Vashi",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 160,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Mall location", "Modern interiors", "In-house catering"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. MENUS  (franchise-level menu packages + signature dishes)
// ─────────────────────────────────────────────────────────────────────────────

export const MENUS = [
  {
    id: "pfd_menu_veg_premium",
    name: "Premium Vegetarian Menu",
    category: "veg_premium",
    price_per_plate: 650,
    serves_min: 50,
    serves_max: 500,
    total_items: 18,
    courses: 5,
    description:
      "Chef-curated signature menu featuring premium Indian vegetarian dishes. " +
      "Perfect for weddings, anniversaries, and high-end events.",
    highlights: [
      "Chef-curated dishes",
      "Premium ingredients",
      "5+ courses",
      "Customizable spice levels",
    ],
    signature_dishes: [
      "Cheese Corn Ball (starter)",
      "Mix Grilled Finger (starter)",
      "Butter Paneer Tikka (starter)",
      "Kaju Masala (main)",
      "Paneer Do Pyaza (main)",
      "Chole Bhatura Masala (main)",
      "Veg Biryani (rice)",
      "Butter Naan (bread)",
      "Sizzling Brownie (dessert)",
      "Gulab Jamun (dessert)",
      "Strawberry Pina Colada (beverage)",
    ],
    customization_options: [
      "Spice level: Mild / Medium / Spicy / Extra Spicy",
      "+1 extra dish: +₹40/plate",
      "+2 extra dishes: +₹80/plate",
      "Dietary options: No dairy / No gluten / Nut-free / No onion–garlic",
    ],
  },
  {
    id: "pfd_menu_veg_classic",
    name: "Classic Vegetarian Menu",
    category: "veg_classic",
    price_per_plate: 450,
    serves_min: 50,
    serves_max: 500,
    total_items: 15,
    courses: 4,
    description:
      "Traditional Indian vegetarian favourites. Ideal for birthdays, office events, " +
      "and family gatherings.",
    highlights: [
      "Traditional recipes",
      "Popular dishes",
      "4 courses",
      "Great value for money",
    ],
    signature_dishes: [
      "Samosa (starter)",
      "Aloo Gobi (main)",
      "Dal Makhani (main)",
      "Jeera Rice (rice)",
      "Roti (bread)",
      "Jalebi (dessert)",
      "Chaach (beverage)",
    ],
  },
  {
    id: "pfd_menu_veg_economy",
    name: "Economy Vegetarian Menu",
    category: "veg_economy",
    price_per_plate: 300,
    serves_min: 100,
    serves_max: 1000,
    total_items: 12,
    courses: 3,
    description:
      "Budget-friendly menu with nutritious dishes. Great for student events, " +
      "group gatherings, and fundraisers.",
    highlights: [
      "Affordable pricing",
      "Nutritious options",
      "3 courses",
      "High volume capacity",
    ],
  },
  {
    id: "pfd_menu_jain",
    name: "Pure Jain Vegetarian Menu",
    category: "jain",
    price_per_plate: 550,
    serves_min: 50,
    serves_max: 300,
    total_items: 14,
    courses: 4,
    description:
      "Strictly Jain-compliant menu — no onion, garlic, or root vegetables. " +
      "Prepared in a separate dedicated kitchen.",
    highlights: [
      "No onion/garlic",
      "No root vegetables",
      "Dedicated kitchen",
      "Religious compliance",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. LEAD_PROCESS  (10-stage customer journey from enquiry to closed)
// ─────────────────────────────────────────────────────────────────────────────

export const LEAD_PROCESS = {
  description:
    "Every customer enquiry is tracked as a 'Lead' through a 10-stage pipeline " +
    "until the event is executed and feedback is collected.",
  pipeline_summary:
    "NEW → VISITED → TASTING_SCHEDULED → TASTING_DONE → MENU_SELECTED → " +
    "ADVANCE_PAID → DECORATION_SCHEDULED → FULL_PAYMENT_PENDING → PAID → " +
    "IN_PROGRESS → COMPLETED → SETTLEMENT_PENDING → SETTLEMENT_COMPLETE → " +
    "FEEDBACK_PENDING → CLOSED  (or LOST if customer declines at any stage)",
  stages: [
    {
      stage: 1,
      status: "new",
      label: "Lead Capture",
      description:
        "Customer contacts via phone call, walk-in, or online form. " +
        "Receptionist or Sales Executive captures name, phone, event date, guest count, " +
        "and budget range.",
      responsible_roles: ["Receptionist", "Sales Executive"],
    },
    {
      stage: 2,
      status: "visited",
      label: "Property Visit / Venue Tour",
      description:
        "Customer visits the hall. Sales Executive conducts a tour, " +
        "explains features and pricing. Branch Manager may be present for premium clients.",
      responsible_roles: ["Sales Executive", "Branch Manager"],
    },
    {
      stage: 3,
      status: "tasting_done",
      label: "Food Tasting",
      description:
        "Kitchen Manager prepares 3–5 signature dishes. Customer samples options and " +
        "rates each dish. Preferred menu is noted.",
      responsible_roles: ["Kitchen Manager", "Sales Executive", "Operations Staff"],
    },
    {
      stage: 4,
      status: "menu_selected",
      label: "Menu Finalization",
      description:
        "Customer finalizes menu package and customizations. " +
        "Accountant generates a detailed quote with hall rent + food cost + decor estimate.",
      responsible_roles: ["Kitchen Manager", "Sales Executive", "Accountant"],
    },
    {
      stage: 5,
      status: "advance_paid",
      label: "Advance Payment (30–50%)",
      description:
        "Customer pays 30–50% of the total quote to confirm the booking. " +
        "Branch Manager confirms the booking in the system.",
      responsible_roles: ["Accountant", "Branch Manager", "Receptionist"],
    },
    {
      stage: 6,
      status: "decoration_scheduled",
      label: "Decoration & Event Finalization",
      description:
        "Decoration theme, logistics, final guest count, and table arrangements " +
        "are confirmed. Setup/teardown dates are scheduled.",
      responsible_roles: ["Branch Manager", "Operations Staff", "Kitchen Manager"],
    },
    {
      stage: 7,
      status: "paid",
      label: "Full Payment",
      description:
        "Remaining 50–70% payment is collected. All event details are locked. " +
        "Accountant sends payment reminders 7 days before the due date.",
      responsible_roles: ["Accountant", "Branch Manager", "Kitchen Manager"],
    },
    {
      stage: 8,
      status: "completed",
      label: "Event Day",
      description:
        "The event is executed. Operations Staff manages guest flow, " +
        "Kitchen Manager supervises food service, Branch Manager provides overall oversight.",
      responsible_roles: [
        "Operations Staff",
        "Kitchen Manager",
        "Branch Manager",
        "Receptionist",
      ],
    },
    {
      stage: 9,
      status: "settlement_complete",
      label: "Post-Event Settlement",
      description:
        "Accountant calculates the final bill including any extra charges or refunds. " +
        "Operations Staff checks for damages. Branch Manager approves settlement.",
      responsible_roles: ["Accountant", "Operations Staff", "Branch Manager"],
    },
    {
      stage: 10,
      status: "closed",
      label: "Feedback & Follow-Up",
      description:
        "Sales Executive sends a feedback form and thank-you message. " +
        "Customer rating is recorded. Testimonials may be requested.",
      responsible_roles: ["Sales Executive", "Franchise Admin"],
    },
  ],
  typical_timeline_example: {
    event: "Rajesh Sharma's Wedding (300 guests)",
    total_revenue: 304000,
    timeline: [
      { date: "Feb 28", stage: "Lead Capture", actor: "Receptionist" },
      { date: "Mar 1", stage: "Venue Tour", actor: "Sales Executive" },
      { date: "Mar 5", stage: "Food Tasting", actor: "Kitchen Manager" },
      { date: "Mar 8", stage: "Menu Finalized", actor: "Kitchen Manager" },
      { date: "Mar 10", stage: "Advance Paid (₹1,50,000)", actor: "Accountant" },
      { date: "May 7", stage: "Full Payment (₹1,52,500)", actor: "Accountant" },
      { date: "May 14", stage: "Decor Setup", actor: "Operations Staff" },
      { date: "May 15", stage: "Wedding Event", actor: "Branch Manager" },
      { date: "May 16", stage: "Settlement", actor: "Accountant" },
      { date: "May 18", stage: "Feedback Closed", actor: "Sales Executive" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. ROLES  (system users and their access levels)
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES = [
  {
    role: "super_admin",
    label: "Super Admin",
    managed_by: "CodingGurus / Platform team",
    description: "Full cross-franchise access. Sets pricing policies & platform config.",
    lead_stages_access: "All (all franchises)",
  },
  {
    role: "franchise_admin",
    label: "Franchise Admin",
    managed_by: "Franchise owner",
    description:
      "Manages all branches within their franchise. Approves large deals, monitors KPIs, " +
      "handles escalations.",
    lead_stages_access: "All 10 stages",
  },
  {
    role: "branch_manager",
    label: "Branch Manager",
    managed_by: "Franchise Admin",
    description:
      "Full operational control of one branch. Negotiates deals, approves quotes, " +
      "supervises events.",
    lead_stages_access: "Stages 2–9",
  },
  {
    role: "sales_executive",
    label: "Sales Executive",
    managed_by: "Branch Manager",
    description:
      "Qualifies leads, conducts hall tours, schedules tastings, shares quotes, " +
      "and collects feedback.",
    lead_stages_access: "Stages 1–4",
  },
  {
    role: "receptionist",
    label: "Receptionist",
    managed_by: "Branch Manager",
    description:
      "Captures incoming enquiries (call / walk-in / online), logs follow-ups, " +
      "enters basic lead info.",
    lead_stages_access: "Stage 1 (Capture)",
  },
  {
    role: "kitchen_manager",
    label: "Kitchen Manager",
    managed_by: "Branch Manager",
    description:
      "Manages food tastings, menu customizations, dish finalization, " +
      "and head count confirmations.",
    lead_stages_access: "Stages 3–8",
  },
  {
    role: "operations_staff",
    label: "Operations Staff",
    managed_by: "Branch Manager",
    description:
      "Coordinates event logistics, venue setup, teardown, decor arrangements, " +
      "and guest management.",
    lead_stages_access: "Stages 6–8",
  },
  {
    role: "accountant",
    label: "Accountant",
    managed_by: "Branch Manager / Franchise Admin",
    description:
      "Generates invoices and quotes, tracks advance and final payments, " +
      "processes refunds, produces P&L reports.",
    lead_stages_access: "Stages 4–9",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. EVENT_TYPES  (events that can be hosted at PFD branches)
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Anniversary",
  "Birthday",
  "Baby Shower",
  "Naming Ceremony",
  "Corporate Event",
  "Seminar / Conference",
  "Social Gathering",
  "Puja / Religious Ceremony",
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. FAQ  (common customer questions and answers)
// ─────────────────────────────────────────────────────────────────────────────

export const FAQ = [
  {
    question: "What is Prasad Food Divine?",
    answer:
      "Prasad Food Divine (PFD) is a premium pure-vegetarian banquet and restaurant " +
      "franchise based in Maharashtra. We have 9 branches across the Mumbai metropolitan " +
      "region — in Kalyan West, Kalyan East, Virar, Badlapur, Dombivali, Thane, Mulund, " +
      "Powai, and Vashi.",
  },
  {
    question: "What types of events can you host?",
    answer:
      "We host weddings, receptions, engagements, anniversaries, birthdays, baby showers, " +
      "naming ceremonies, corporate events, seminars, social gatherings, religious ceremonies, " +
      "and more.",
  },
  {
    question: "What is your food specialty?",
    answer:
      "We specialize in authentic Indian pure vegetarian cuisine. All our menus are " +
      "100% vegetarian. We also offer a fully Jain-compliant menu (no onion, garlic, " +
      "or root vegetables) prepared in a separate dedicated kitchen.",
  },
  {
    question: "What menu packages are available?",
    answer:
      "We offer four menu packages:\n" +
      "1. Premium Vegetarian — ₹650/plate (18 dishes, 5 courses — ideal for weddings)\n" +
      "2. Classic Vegetarian — ₹450/plate (15 dishes, 4 courses — great for birthdays & office events)\n" +
      "3. Economy Vegetarian — ₹300/plate (12 dishes, 3 courses — budget-friendly, high volume)\n" +
      "4. Pure Jain Vegetarian — ₹550/plate (14 dishes, 4 courses — Jain-compliant)",
  },
  {
    question: "Can I customize the menu?",
    answer:
      "Yes! You can customize spice levels (Mild / Medium / Spicy / Extra Spicy), " +
      "add extra signature dishes (+₹40 or +₹80 per plate), specify dietary restrictions " +
      "(no dairy, no gluten, nut-free, no onion–garlic), and add extra bread or rice servings.",
  },
  {
    question: "What is the hall capacity?",
    answer:
      "Our halls range from 60 to 200 seated guests (up to 350 floating). " +
      "The Kalyan West branch has three options: Hall 1 (60 seated / 100 floating), " +
      "Hall 2 (150 seated / 250 floating), and Hall 1+2 Combined (200 seated / 350 floating). " +
      "Other branches each have 1–2 halls suited for 80–200 seated guests.",
  },
  {
    question: "What is the hall rental price?",
    answer:
      "Hall base prices start from ₹27,000 (Hall 1, Kalyan West — 60 seats) and go up to " +
      "₹90,000 (combined Hall 1+2 Kalyan West — 200 seats, or Kalyan East Shamiyana Hall). " +
      "Food is charged separately at ₹300–₹650 per plate depending on the menu selected.",
  },
  {
    question: "Is there a food tasting option before booking?",
    answer:
      "Yes! Once you express interest, we schedule a complimentary food tasting session " +
      "where our Kitchen Manager prepares 3–5 signature dishes for you to sample and rate " +
      "before you finalize your menu.",
  },
  {
    question: "How does the booking process work?",
    answer:
      "1. Contact us (call / walk-in / website form)\n" +
      "2. Our Sales Executive qualifies your requirements\n" +
      "3. Schedule a hall tour\n" +
      "4. Attend a food tasting\n" +
      "5. Finalize menu & receive a quote\n" +
      "6. Pay 30–50% advance to confirm the booking\n" +
      "7. Pay the remaining amount before the event\n" +
      "8. We execute your event flawlessly!",
  },
  {
    question: "What is the advance payment requirement?",
    answer:
      "We require a 30–50% advance payment to confirm your booking. The remaining " +
      "balance is due before the event date (typically 7 days before).",
  },
  {
    question: "What payment modes are accepted?",
    answer:
      "We accept bank transfers, UPI payments, and cheques. Our Accountant will provide " +
      "a formal invoice for all transactions.",
  },
  {
    question: "Do you provide decoration services?",
    answer:
      "Yes, we coordinate decoration services through trusted vendor partners. " +
      "You can choose your preferred theme, and our Operations team will manage " +
      "the setup and teardown.",
  },
  {
    question: "Is parking available?",
    answer:
      "Most branches offer ample parking. Kalyan West (Hall 1+2 Combined) and Kalyan East " +
      "offer valet parking. All branches have ground-level or building parking available.",
  },
  {
    question: "What cities/locations do you serve?",
    answer:
      "We have 9 branches: Kalyan West, Kalyan East, Virar, Badlapur, Dombivali, " +
      "Thane, Mulund, Powai, and Vashi (Navi Mumbai).",
  },
  {
    question: "What are your operating hours?",
    answer:
      "Most branches are open from 11:00 AM to 11:30 PM daily. " +
      "The Mulund branch offers two event time slots: 7:00 AM–4:00 PM and 7:00 PM–12:00 AM.",
  },
  {
    question: "How do I contact a specific branch?",
    answer:
      "Kalyan West: +91 97697 97095 | Kalyan East: +91 72080 80601 | " +
      "Virar: +91 70390 63748 | Badlapur: +91 93249 29205 | Dombivali: +91 86552 60601 | " +
      "Thane: +91 93721 14520 | Mulund: +91 99202 79393 | Powai: +91 86577 68175 | " +
      "Vashi: +91 70454 21725",
  },
  {
    question: "What Google ratings do your branches have?",
    answer:
      "All our branches are highly rated: Kalyan West 4.6★ (13,803 reviews), " +
      "Kalyan East 4.7★ (13,379), Virar 4.7★ (3,376), Badlapur 4.6★ (6,388), " +
      "Dombivali 4.6★ (6,758), Thane 4.7★ (10,593), Mulund 4.7★ (10,908), " +
      "Powai 4.7★ (4,398), Vashi 4.6★ (908 reviews).",
  },
  {
    question: "What is BanquetEase?",
    answer:
      "BanquetEase is the digital platform used internally by Prasad Food Divine to " +
      "manage leads, bookings, menus, staff, payments, and AI-powered tools. " +
      "It is built by Coding Gurus and powers the entire business workflow.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. CHATBOT_PERSONA  (tone & response guidelines for the AI chatbot)
// ─────────────────────────────────────────────────────────────────────────────

export const CHATBOT_PERSONA = {
  name: "PFD Concierge",
  role:
    "Official customer-facing chatbot for Prasad Food Divine banquet enquiries.",
  tone: "Friendly, warm, professional, and helpful. Like a knowledgeable event planner.",
  language:
    "Primarily English. Hindi/Hinglish mix is acceptable and culturally appropriate.",
  response_length:
    "Keep replies concise — 3–6 lines for WhatsApp; up to 10 lines for website chat. " +
    "Use bullet points for lists.",
  dos: [
    "Greet the customer warmly",
    "Ask about event type, guest count, and preferred date to personalize answers",
    "Quote specific hall names, capacities, and prices from the knowledge base",
    "Offer to schedule a hall tour or food tasting",
    "Capture lead details (name, phone, event date) if not already provided",
    "Mention the closest/most suitable branch based on their location",
    "End with a clear next step (e.g., 'Shall I schedule a visit?')",
  ],
  donts: [
    "Do not quote unavailable halls or branches",
    "Do not confirm bookings — always direct to the branch team for final confirmation",
    "Do not share internal staff details or passwords",
    "Do not discuss competitor venues",
    "Do not promise specific dates without checking availability",
  ],
  escalation:
    "If the customer has a complaint, a complex requirement, or needs pricing negotiation, " +
    "politely say: 'Let me connect you to our branch team for personalized assistance.' " +
    "Then flag the message as requiring human follow-up.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. KNOWLEDGE_BASE_TEXT
//     A single concatenated text block ready for injection into any LLM system
//     prompt. Covers all the above sections in plain English.
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_BASE_TEXT = `
=== BANQUETEASE CHATBOT KNOWLEDGE BASE ===

--- ABOUT THE PLATFORM ---
BanquetEase is an end-to-end banquet management SaaS platform built by Coding Gurus.
It powers Prasad Food Divine's operations across 9 branches in Maharashtra.
Website: https://banquetease.com | Contact: contact@codinggurus.in

--- ABOUT PRASAD FOOD DIVINE (PFD) ---
Prasad Food Divine is a premium pure-vegetarian banquet & restaurant franchise based in Kalyan, Maharashtra.
Franchise code: PFD | Franchise phone: +91-8520000001
Speciality: Authentic Indian vegetarian cuisine for weddings, receptions, anniversaries, birthdays, and corporate events.
All food is 100% vegetarian. Jain menus available (no onion, garlic, root vegetables).

--- 9 BRANCHES ---
1. Kalyan West  | Phone: +91 97697 97095 | Timings: 11AM–11:30PM | Rating: 4.6★ (13,803 reviews)
   Address: 2nd Floor, Gurudev Vanijya Sankul, Khadakpada Road, Kalyan West 421301

2. Kalyan East  | Phone: +91 72080 80601 | Timings: 11AM–11:30PM | Rating: 4.7★ (13,379 reviews)
   Address: Pune Link Road, Tisgaon Naka, Kalyan East 421306

3. Virar        | Phone: +91 70390 63748 | Timings: 11AM–11:30PM | Rating: 4.7★ (3,376 reviews)
   Address: Opp. Reliance Smart, Y K Nagar, Virar West 401303

4. Badlapur     | Phone: +91 93249 29205 | Timings: 11AM–11:30PM | Rating: 4.6★ (6,388 reviews)
   Address: Ganesh Ghat, Laxmi Yashwant Arcade, Katrap, Badlapur 421503

5. Dombivali    | Phone: +91 86552 60601 | Timings: 11AM–11PM   | Rating: 4.6★ (6,758 reviews)
   Address: SS Business Park, Chhatrapati Shivaji Maharaj Circle, Dombivli East 421203

6. Thane        | Phone: +91 93721 14520 | Timings: 11AM–11:30PM | Rating: 4.7★ (10,593 reviews)
   Address: Thakre Compound, Tikunjiniwadi Road, Manpada, Thane West 400610

7. Mulund       | Phone: +91 99202 79393 | Timings: 11AM–11:30PM | Rating: 4.7★ (10,908 reviews)
   Address: D-702, Mulund-Goregaon Link Road, Bhandup West, Mumbai 400078
   ★ Two event time slots: 7AM–4PM and 7PM–12AM

8. Powai        | Phone: +91 86577 68175 | Timings: 11AM–11:30PM | Rating: 4.7★ (4,398 reviews)
   Address: IIT Mumbai, Adi Shankaracharya Marg, Powai, Mumbai 400076

9. Vashi        | Phone: +91 70454 21725 | Timings: 11AM–11:30PM | Rating: 4.6★ (908 reviews)
   Address: Shop 8, Palm Beach Galleria Mall, Sector-19D, Vashi, Navi Mumbai 400703

--- HALLS PER BRANCH ---
Kalyan West:
  • Hall 1           — 60 seated / 100 floating  | Base rent: ₹27,000 | AC, Mahogany paneling, Crystal chandeliers
  • Hall 2           — 150 seated / 250 floating | Base rent: ₹67,500 | AC, In-house catering
  • Hall 1+2 Combined— 200 seated / 350 floating | Base rent: ₹90,000 | AC, Changing rooms, Parking

Kalyan East:
  • Shamiyana Hall   — 200 seated / 220 floating | Base rent: ₹90,000 | Full AC, Valet service, Parking
  • Small Hall       — 80 seated / 120 floating  | Base rent: ₹36,000 | AC, Parking

Virar:
  • Banquet Hall     — 100 seated / 150 floating | Base rent: ₹45,000 | AC, Modern interiors, Valet parking

Badlapur:
  • Banquet Hall     — 150 seated / 250 floating | Base rent: ₹67,500 | AC, In-house decor, Parking

Dombivali:
  • Celebration Hall — 100 seated / 180 floating | Base rent: ₹45,000 | AC, Professional staff

Thane:
  • Tilak Banquet    — 80 seated / 120 floating  | Base rent: ₹36,000 | AC, Birthday arrangements

Mulund:
  • Banquet Hall     — 80 seated / 150 floating  | Base rent: ₹36,000 | AC, 2 time slots

Powai:
  • Grand Hall       — 120 seated / 200 floating | Base rent: ₹54,000 | AC, 2 changing rooms, Pure veg

Vashi:
  • Event Hall       — 100 seated / 160 floating | Base rent: ₹45,000 | AC, Mall location, Modern interiors

All halls: ₹450/plate food add-on (menus priced separately — see below).

--- MENU PACKAGES ---
1. Premium Vegetarian  — ₹650/plate | 18 dishes | 5 courses | Weddings & premium events
   Signature: Cheese Corn Ball, Kaju Masala, Veg Biryani, Butter Naan, Sizzling Brownie, Gulab Jamun

2. Classic Vegetarian  — ₹450/plate | 15 dishes | 4 courses | Birthdays & office events
   Signature: Samosa, Dal Makhani, Jeera Rice, Jalebi

3. Economy Vegetarian  — ₹300/plate | 12 dishes | 3 courses | Budget & high-volume events

4. Pure Jain Vegetarian— ₹550/plate | 14 dishes | 4 courses | Jain-compliant (no onion/garlic/root vegetables)

Menu Customizations Available:
• Spice level: Mild / Medium / Spicy / Extra Spicy
• +1 extra dish: +₹40/plate | +2 dishes: +₹80/plate
• Dietary options: No dairy / No gluten / Nut-free / No onion–garlic

--- BOOKING / LEAD PROCESS (10 Stages) ---
Stage 1 — NEW: Customer contacts us (call/walk-in/website). Receptionist captures details.
Stage 2 — VISITED: Sales Executive conducts hall tour.
Stage 3 — TASTING_DONE: Kitchen Manager arranges food tasting (3–5 signature dishes).
Stage 4 — MENU_SELECTED: Customer finalizes menu. Accountant generates quote.
Stage 5 — ADVANCE_PAID: 30–50% advance confirms the booking.
Stage 6 — DECORATION_SCHEDULED: Theme, decor, and logistics are finalized.
Stage 7 — PAID: Remaining balance paid. Event details locked.
Stage 8 — COMPLETED: Event executed on the big day!
Stage 9 — SETTLEMENT_COMPLETE: Post-event bills settled, any extra charges/refunds processed.
Stage 10 — CLOSED: Feedback collected. Lead marked complete.
(LOST = customer declined at any stage)

--- SUPPORTED EVENT TYPES ---
Wedding, Reception, Engagement, Anniversary, Birthday, Baby Shower, Naming Ceremony,
Corporate Event, Seminar / Conference, Social Gathering, Puja / Religious Ceremony, and more.

--- STAFF ROLES ---
• Receptionist — captures enquiries
• Sales Executive — qualifies leads, conducts tours, shares quotes
• Kitchen Manager — food tastings, menu customization, event-day food service
• Operations Staff — logistics, setup, teardown, guest management
• Accountant — invoices, payment tracking, settlement
• Branch Manager — full branch operations & event supervision
• Franchise Admin — multi-branch oversight
• Super Admin — platform-level access (CodingGurus)

--- CHATBOT GUIDELINES ---
• Be friendly, warm, and professional.
• Ask for event type, guest count, and preferred date early.
• Quote hall names, capacities, and prices accurately.
• Offer to schedule a hall tour or food tasting.
• For complaints or complex negotiations, escalate to the branch team.
• Do NOT confirm bookings — always direct to the team for final confirmation.
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — build a concise context string for a specific branch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a focused knowledge-base snippet for a single branch,
 * including its halls and all menu packages (franchise-level).
 *
 * @param {string} branchId  e.g. "pfd_b1"
 * @returns {string}
 */
export function getBranchContext(branchId) {
  const branch = BRANCHES.find((b) => b.id === branchId);
  if (!branch) return KNOWLEDGE_BASE_TEXT;

  const branchHalls = HALLS.filter((h) => h.branch_id === branchId);
  const hallLines = branchHalls
    .map(
      (h) =>
        `  • ${h.name}: ${h.capacity_seating} seated / ${h.capacity_floating} floating` +
        ` | Base rent ₹${h.base_price.toLocaleString("en-IN")}` +
        ` | ${h.features.join(", ")}`
    )
    .join("\n");

  const menuLines = MENUS.map(
    (m) => `  • ${m.name}: ₹${m.price_per_plate}/plate — ${m.description}`
  ).join("\n");

  return `
=== BRANCH: ${branch.name.toUpperCase()} (${FRANCHISE.name}) ===
Address : ${branch.address}
Phone   : ${branch.phone}
Timings : ${branch.timings}
Rating  : ${branch.google_rating}★ (${branch.review_count.toLocaleString("en-IN")} reviews)

HALLS:
${hallLines}

MENU PACKAGES (franchise-wide):
${menuLines}

BOOKING PROCESS:
${LEAD_PROCESS.stages.map((s) => `Step ${s.stage}: ${s.label} — ${s.description}`).join("\n")}

${CHATBOT_PERSONA.dos.map((d) => `✓ ${d}`).join("\n")}
`.trim();
}

/**
 * Returns a compact FAQ string for prompt injection.
 * @returns {string}
 */
export function getFAQText() {
  return FAQ.map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`).join(
    "\n\n"
  );
}
