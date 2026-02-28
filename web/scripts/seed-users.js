/**
 * BanquetEase — Production & Dev Seed Script
 *
 * Creates:
 *  1. Super Admin  — contact@codinggurus.in
 *  2. Franchise    — Prasad Food Divine  (id: pfd)
 *  3. Branch       — Kalyan West Outlet  (id: pfd_b1)
 *  4. Franchise Admin + 7 role-based staff users
 *  5. Legacy demo accounts (banquetease.com) for quick testing
 *
 * ── Database design (read-/write-optimised) ──────────────────────
 *  • Single `users/{uid}` — all user profiles, indexed by
 *      franchise_id + role  (composite index in firestore.indexes.json)
 *  • `franchises/{franchise_id}` — franchise metadata + logo_url
 *  • `branches/{branch_id}`      — branch metadata
 *  • Franchise name & branch name denormalised into user docs
 *    → list-view pages never need extra reads to display them
 *  • No redundant role-specific sub-collections
 *    → every user write is ONE document instead of two
 * ─────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   node scripts/seed-users.js
 *
 * Prerequisites:
 *   npm install firebase-admin   (run inside web/ directory)
 *   Place serviceAccountKey.json in scripts/
 */

const admin = require("firebase-admin");
const path = require("path");

// Load and validate service account key with a helpful error message
const saPath = path.join(__dirname, "serviceAccountKey.json");
let serviceAccount = null;
try {
  serviceAccount = require(saPath);
} catch (err) {
  console.error("\n❌ Missing Firebase service account file:", saPath);
  console.error(
    "   Download from Firebase Console → Project Settings → Service Accounts → Generate new private key",
  );
  process.exit(1);
}

if (
  !serviceAccount ||
  typeof serviceAccount !== "object" ||
  !serviceAccount.project_id ||
  !serviceAccount.client_email ||
  !serviceAccount.private_key
) {
  console.error("\n❌ Invalid service account JSON at:", saPath);
  console.error(
    "   The file looks like a placeholder. Ensure it contains the full service account JSON with `project_id`, `client_email`, and `private_key`.",
  );
  console.error("   Current file keys:", Object.keys(serviceAccount || {}));
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();
const TS = () => admin.firestore.FieldValue.serverTimestamp();

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const FRANCHISE_ID = "pfd";
const BRANCH_ID = "pfd_b1";
const REAL_PASSWORD = "123456789";
const DEV_PASSWORD = "Admin@123";

// ─────────────────────────────────────────────
//  FRANCHISE DOCUMENT
// ─────────────────────────────────────────────

const franchiseDoc = {
  id: FRANCHISE_ID,
  name: "Prasad Food Divine",
  code: "PFD",
  email: "darshankhapekar8520@gmail.com",
  phone: "+91-8520000001",
  city: "Kalyan",
  state: "Maharashtra",
  country: "India",
  status: "active",
  plan: "professional",
  // Upload via Settings → Franchise Settings once logged in:
  logo_url: null,
  created_at: TS(),
  updated_at: TS(),
};

// ─────────────────────────────────────────────
//  BRANCH DOCUMENTS  (all 9 Prasad Food Divine outlets)
// ─────────────────────────────────────────────

const branches = [
  {
    id: "pfd_b1",
    name: "Kalyan West",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Kalyan",
    state: "Maharashtra",
    address:
      "2nd Floor, Gurudev Vanijya Sankul, Khadakpada Road, Above Croma Showroom, Sambhaji Nagar, Adharwadi, Kalyan West, Maharashtra 421301",
    phone: "+91 97697 97095",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.252743,73.128803",
    google_rating: 4.6,
    review_count: 13803,
    cost_for_two: 900,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b2",
    name: "Kalyan East",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Kalyan",
    state: "Maharashtra",
    address: "Pune Link Road, Tisgaon Naka, Kalyan East, Maharashtra 421306",
    phone: "+91 72080 80601",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.224911,73.134117",
    google_rating: 4.7,
    review_count: 13379,
    cost_for_two: 850,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b3",
    name: "Virar",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Virar",
    state: "Maharashtra",
    address:
      "C, Baban Smruti, Opposite Reliance Smart, Y K Nagar, Virar West, Maharashtra 401303",
    phone: "+91 70390 63748",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.464247,72.805615",
    google_rating: 4.7,
    review_count: 3376,
    cost_for_two: 1025,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b4",
    name: "Badlapur",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Badlapur",
    state: "Maharashtra",
    address:
      "Ganesh Ghat, Block-A, Laxmi Yashwant Arcade, Katrap, Badlapur, Maharashtra 421503",
    phone: "+91 93249 29205",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.170781,73.227519",
    google_rating: 4.6,
    review_count: 6388,
    cost_for_two: 1000,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b5",
    name: "Dombivali",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Dombivali",
    state: "Maharashtra",
    address:
      "SS Business Park, Chhatrapati Shivaji Maharaj Circle, Omkar Nagar, Sagarli Gaon, Dombivli East, Maharashtra 421203",
    phone: "+91 86552 60601",
    timings: "11:00 AM – 11:00 PM",
    maps_url: "https://www.google.com/maps?q=19.214788,73.101489",
    google_rating: 4.6,
    review_count: 6758,
    cost_for_two: 950,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b6",
    name: "Thane",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Thane",
    state: "Maharashtra",
    address:
      "Thakre Compound, Tikunjiniwadi Road, Chittalsar, Manpada, Thane West, Maharashtra 400610",
    phone: "+91 93721 14520",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.236525,72.973957",
    google_rating: 4.7,
    review_count: 10593,
    cost_for_two: 1000,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b7",
    name: "Mulund",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Mumbai",
    state: "Maharashtra",
    address:
      "D-702, Mulund-Goregaon Link Road, Industrial Area, Bhandup West, Mumbai, Maharashtra 400078",
    phone: "+91 99202 79393",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.163161,72.939952",
    google_rating: 4.7,
    review_count: 10908,
    cost_for_two: 950,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b8",
    name: "Powai",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Mumbai",
    state: "Maharashtra",
    address:
      "IIT Mumbai, Q Nagesh Nilay, Adi Shankaracharya Marg, Panchkutir Ganesh Nagar, Powai, Mumbai, Maharashtra 400076",
    phone: "+91 86577 68175",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.123738,72.910435",
    google_rating: 4.7,
    review_count: 4398,
    cost_for_two: 1200,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b9",
    name: "Vashi",
    type: "Outlet",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    city: "Navi Mumbai",
    state: "Maharashtra",
    address:
      "Shop No-8, Palm Beach Galleria Mall, Plot No-17, Sector-19D, Phase 2, Turbhe Zone, Vashi, Navi Mumbai, Maharashtra 400703",
    phone: "+91 70454 21725",
    timings: "11:00 AM – 11:30 PM",
    maps_url: "https://www.google.com/maps?q=19.085107,73.007781",
    google_rating: 4.6,
    review_count: 908,
    cost_for_two: 1000,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────
//  HALL DOCUMENTS
// ─────────────────────────────────────────────

const halls = [
  // ── Kalyan West (pfd_b1) ───────────────────────────
  {
    id: "pfd_b1_h1",
    name: "Hall 1",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 60,
    capacity_floating: 100,
    base_price: 27000,
    price_per_plate: 450,
    features: ["AC", "Mahogany paneling", "Crystal chandeliers"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b1_h2",
    name: "Hall 2",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 150,
    capacity_floating: 250,
    base_price: 67500,
    price_per_plate: 450,
    features: [
      "AC",
      "Mahogany paneling",
      "Crystal chandeliers",
      "In-house catering",
    ],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b1_h3",
    name: "Hall 1+2 Combined",
    branch_id: "pfd_b1",
    branch_name: "Kalyan West",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
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
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Kalyan East (pfd_b2) ──────────────────────────
  {
    id: "pfd_b2_h1",
    name: "Shamiyana Hall",
    branch_id: "pfd_b2",
    branch_name: "Kalyan East",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 200,
    capacity_floating: 220,
    base_price: 90000,
    price_per_plate: 450,
    features: [
      "AC",
      "Full AC banquet",
      "In-house catering",
      "Valet service",
      "Parking",
    ],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
  {
    id: "pfd_b2_h2",
    name: "Small Hall",
    branch_id: "pfd_b2",
    branch_name: "Kalyan East",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 120,
    base_price: 36000,
    price_per_plate: 450,
    features: ["AC", "In-house catering", "Parking"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Virar (pfd_b3) ─────────────────────────────
  {
    id: "pfd_b3_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b3",
    branch_name: "Virar",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 150,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Modern interiors", "Valet parking", "In-house catering"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Badlapur (pfd_b4) ──────────────────────────
  {
    id: "pfd_b4_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b4",
    branch_name: "Badlapur",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 150,
    capacity_floating: 250,
    base_price: 67500,
    price_per_plate: 450,
    features: ["AC", "In-house catering", "In-house decor", "Parking"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Dombivali (pfd_b5) ─────────────────────────
  {
    id: "pfd_b5_h1",
    name: "Celebration Hall",
    branch_id: "pfd_b5",
    branch_name: "Dombivali",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 180,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Professional staff", "In-house catering"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Thane (pfd_b6) ─────────────────────────────
  {
    id: "pfd_b6_h1",
    name: "Tilak Banquet",
    branch_id: "pfd_b6",
    branch_name: "Thane",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 120,
    base_price: 36000,
    price_per_plate: 450,
    features: [
      "AC",
      "In-house catering",
      "Cooperative staff",
      "Birthday arrangements",
    ],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Mulund (pfd_b7) ────────────────────────────
  {
    id: "pfd_b7_h1",
    name: "Banquet Hall",
    branch_id: "pfd_b7",
    branch_name: "Mulund",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 80,
    capacity_floating: 150,
    base_price: 36000,
    price_per_plate: 450,
    time_slots: ["7:00 AM – 4:00 PM", "7:00 PM – 12:00 AM"],
    features: ["AC", "Good food quality", "2 time slots available"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Powai (pfd_b8) ─────────────────────────────
  {
    id: "pfd_b8_h1",
    name: "Grand Hall",
    branch_id: "pfd_b8",
    branch_name: "Powai",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 120,
    capacity_floating: 200,
    base_price: 54000,
    price_per_plate: 450,
    features: [
      "AC",
      "Pure veg banquet",
      "2 changing rooms",
      "Event venue services",
    ],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── Vashi (pfd_b9) ─────────────────────────────
  {
    id: "pfd_b9_h1",
    name: "Event Hall",
    branch_id: "pfd_b9",
    branch_name: "Vashi",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    type: "Indoor",
    capacity_seating: 100,
    capacity_floating: 160,
    base_price: 45000,
    price_per_plate: 450,
    features: ["AC", "Mall location", "Modern interiors", "In-house catering"],
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────
//  REAL (PRODUCTION) USERS   password: 123456789
// ─────────────────────────────────────────────

const realUsers = [
  // ── Platform Super Admin ──────────────────────────────────────
  {
    email: "contact@codinggurus.in",
    password: REAL_PASSWORD,
    displayName: "CodingGurus Admin",
    role: "super_admin",
    franchise_id: null,
    franchise_name: null,
    branch_id: null,
    branch_name: null,
    phone: "+91-9000000000",
  },

  // ── Franchise Admin ───────────────────────────────────────────
  {
    email: "darshankhapekar8520@gmail.com",
    password: REAL_PASSWORD,
    displayName: "Darshan Khapekar",
    role: "franchise_admin",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: null,
    branch_name: null,
    phone: "+91-8520852085",
  },

  // ── Branch Manager — Kalyan West ─────────────────────────────
  {
    email: "d2022.darshan.khapekar@ves.ac.in",
    password: REAL_PASSWORD,
    displayName: "Darshan Khapekar (VES)",
    role: "branch_manager",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000002",
  },

  // ── Sales Executive ───────────────────────────────────────────
  {
    email: "2022.pranav.pol@ves.ac.in",
    password: REAL_PASSWORD,
    displayName: "Pranav Pol (VES)",
    role: "sales_executive",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000003",
  },

  // ── Receptionist ─────────────────────────────────────────────
  {
    email: "2022.shravani.rasam@ves.ac.in",
    password: REAL_PASSWORD,
    displayName: "Shravani Rasam (VES)",
    role: "receptionist",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000004",
  },

  // ── Operations Staff ──────────────────────────────────────────
  {
    email: "pranavpoledu@gmail.com",
    password: REAL_PASSWORD,
    displayName: "Pranav Pol",
    role: "operations_staff",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000005",
  },

  // ── Kitchen Manager ───────────────────────────────────────────
  {
    email: "shravanirasam0212@gmail.com",
    password: REAL_PASSWORD,
    displayName: "Shravani Rasam",
    role: "kitchen_manager",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000006",
  },

  // ── Accountant ────────────────────────────────────────────────
  {
    email: "2023.manas.patil@ves.ac.in",
    password: REAL_PASSWORD,
    displayName: "Manas Patil (VES)",
    role: "accountant",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: BRANCH_ID,
    branch_name: "Kalyan West",
    phone: "+91-8520000007",
  },

  // ── Franchise Admin (secondary) ───────────────────────────────
  {
    email: "manaspatil281@gmail.com",
    password: REAL_PASSWORD,
    displayName: "Manas Patil",
    role: "franchise_admin",
    franchise_id: FRANCHISE_ID,
    franchise_name: "Prasad Food Divine",
    branch_id: null,
    branch_name: null,
    phone: "+91-8520000008",
  },
<<<<<<< Updated upstream

  // ── Customer ──────────────────────────────────────────────────
  {
    email: "projects@codinggurus.in",
    password: REAL_PASSWORD,
    displayName: "CodingGurus Projects",
    role: "customer",
    franchise_id: null,
    franchise_name: null,
    branch_id: null,
    branch_name: null,
    phone: "+91-0000000000",
  },
];
=======
];

// ─────────────────────────────────────────────
//  LEGACY DEMO ACCOUNTS   password: Admin@123
//  (for quick role-switching during demo)
// ─────────────────────────────────────────────


>>>>>>> Stashed changes

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

async function upsertAuthUser(user) {
  try {
    const existing = await auth.getUserByEmail(user.email);
    console.log(`    ⚠️  Auth exists: ${user.email}  (${existing.uid})`);
    return existing.uid;
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const created = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true,
      });
      console.log(`    ✅ Created:   ${user.email}  (${created.uid})`);
      return created.uid;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  BanquetEase — Seed starting...\n");

  // 1. Franchise
  await db
    .collection("franchises")
    .doc(FRANCHISE_ID)
    .set(franchiseDoc, { merge: true });
  console.log(`📦  Franchise: Prasad Food Divine  (${FRANCHISE_ID})`);

  // 2. Branches (9 outlets)
  console.log("\n── Branches ─────────────────────────────────────");
  for (const branch of branches) {
    await db.collection("branches").doc(branch.id).set(branch, { merge: true });
    console.log(
      `    🏢 ${branch.id.padEnd(10)} ${branch.name} (${branch.city})`,
    );
  }

  // 3. Halls
  console.log("\n── Halls ─────────────────────────────────────────");
  for (const hall of halls) {
    await db.collection("halls").doc(hall.id).set(hall, { merge: true });
    console.log(
      `    🏗️  ${hall.id.padEnd(14)} ${hall.name} (${hall.branch_name}, cap ${hall.capacity_floating})`,
    );
  }
  console.log();

  // 4. Users — real production users
  console.log("── Real / Production users ─────────────────");
  for (const user of realUsers) {
    try {
      const uid = await upsertAuthUser(user);
      await db
        .collection("users")
        .doc(uid)
        .set(
          {
            uid,
            name: user.displayName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            franchise_id: user.franchise_id,
            franchise_name: user.franchise_name,
            branch_id: user.branch_id,
            branch_name: user.branch_name,
            status: "active",
            employment_type: user.role === "customer" ? null : "Permanent",
            is_dev: false,
            created_at: TS(),
            updated_at: TS(),
          },
          { merge: true },
        );
    } catch (err) {
      console.error(`    ❌ ${user.email}:`, err.message);
    }
  }

  // 5. Users — legacy demo accounts
  console.log("\n── Demo / Legacy accounts ──────────────────");
  for (const user of devUsers) {
    try {
      const uid = await upsertAuthUser(user);
      await db
        .collection("users")
        .doc(uid)
        .set(
          {
            uid,
            name: user.displayName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            franchise_id: user.franchise_id,
            franchise_name: user.franchise_name,
            branch_id: user.branch_id,
            branch_name: user.branch_name,
            status: "active",
            employment_type: user.role === "customer" ? null : "Permanent",
            is_dev: true, // flag for login page quick-switch
            created_at: TS(),
            updated_at: TS(),
          },
          { merge: true },
        );
    } catch (err) {
      console.error(`    ❌ ${user.email}:`, err.message);
    }
  }

  // 5. Summary
  const border = "═".repeat(77);
  console.log(`\n\n✨  Seed complete!\n\n${border}`);
  console.log(
    "  Email                                  │ Role               │ Password",
  );
  console.log(border);
  for (const u of realUsers) {
    console.log(
      `  ${u.email.padEnd(38)} │ ${u.role.padEnd(18)} │ ${u.password}`,
    );
  }
  console.log("─".repeat(77));
  console.log("  DEMO ACCOUNTS (password: Admin@123)");
  console.log("─".repeat(77));
  for (const u of devUsers) {
    console.log(
      `  ${u.email.padEnd(38)} │ ${u.role.padEnd(18)} │ ${u.password}`,
    );
  }
  console.log(border + "\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});