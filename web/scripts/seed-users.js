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

const admin = require('firebase-admin');
const path  = require('path');

// Load and validate service account key with a helpful error message
const saPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount = null;
try {
  serviceAccount = require(saPath);
} catch (err) {
  console.error('\n❌ Missing Firebase service account file:', saPath);
  console.error('   Download from Firebase Console → Project Settings → Service Accounts → Generate new private key');
  process.exit(1);
}

if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  console.error('\n❌ Invalid service account JSON at:', saPath);
  console.error('   The file looks like a placeholder. Ensure it contains the full service account JSON with `project_id`, `client_email`, and `private_key`.');
  console.error('   Current file keys:', Object.keys(serviceAccount || {}));
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db   = admin.firestore();
const TS   = () => admin.firestore.FieldValue.serverTimestamp();

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const FRANCHISE_ID   = 'pfd';
const BRANCH_ID      = 'pfd_b1';
const REAL_PASSWORD  = '123456789';
const DEV_PASSWORD   = 'Admin@123';

// ─────────────────────────────────────────────
//  FRANCHISE DOCUMENT
// ─────────────────────────────────────────────

const franchiseDoc = {
  id:              FRANCHISE_ID,
  name:            'Prasad Food Divine',
  code:            'PFD',
  email:           'darshankhapekar8520@gmail.com',
  phone:           '+91-8520000001',
  city:            'Kalyan',
  state:           'Maharashtra',
  country:         'India',
  status:          'active',
  plan:            'professional',
  // Upload via Settings → Franchise Settings once logged in:
  logo_url:        null,
  created_at:      TS(),
  updated_at:      TS(),
};

// ─────────────────────────────────────────────
//  BRANCH DOCUMENT
// ─────────────────────────────────────────────

const branchDoc = {
  id:              BRANCH_ID,
  name:            'Kalyan West',
  type:            'Outlet',
  franchise_id:    FRANCHISE_ID,
  franchise_name:  'Prasad Food Divine',   // denormalised
  city:            'Kalyan',
  state:           'Maharashtra',
  address:         'Kalyan West, Thane District, Maharashtra',
  status:          'active',
  created_at:      TS(),
  updated_at:      TS(),
};

// ─────────────────────────────────────────────
//  REAL (PRODUCTION) USERS   password: 123456789
// ─────────────────────────────────────────────

const realUsers = [
  // ── Platform Super Admin ──────────────────────────────────────
  {
    email:          'contact@codinggurus.in',
    password:       REAL_PASSWORD,
    displayName:    'CodingGurus Admin',
    role:           'super_admin',
    franchise_id:   null,
    franchise_name: null,
    branch_id:      null,
    branch_name:    null,
    phone:          '+91-9000000000',
  },

  // ── Franchise Admin ───────────────────────────────────────────
  {
    email:          'darshankhapekar8520@gmail.com',
    password:       REAL_PASSWORD,
    displayName:    'Darshan Khapekar',
    role:           'franchise_admin',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      null,
    branch_name:    null,
    phone:          '+91-8520852085',
  },

  // ── Branch Manager — Kalyan West ─────────────────────────────
  {
    email:          'd2022.darshan.khapekar@ves.ac.in',
    password:       REAL_PASSWORD,
    displayName:    'Darshan Khapekar (VES)',
    role:           'branch_manager',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000002',
  },

  // ── Sales Executive ───────────────────────────────────────────
  {
    email:          '2022.pranav.pol@ves.ac.in',
    password:       REAL_PASSWORD,
    displayName:    'Pranav Pol (VES)',
    role:           'sales_executive',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000003',
  },

  // ── Receptionist ─────────────────────────────────────────────
  {
    email:          '2022.shravani.rasam@ves.ac.in',
    password:       REAL_PASSWORD,
    displayName:    'Shravani Rasam (VES)',
    role:           'receptionist',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000004',
  },

  // ── Operations Staff ──────────────────────────────────────────
  {
    email:          'pranavpoledu@gmail.com',
    password:       REAL_PASSWORD,
    displayName:    'Pranav Pol',
    role:           'operations_staff',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000005',
  },

  // ── Kitchen Manager ───────────────────────────────────────────
  {
    email:          'shravanirasam0212@gmail.com',
    password:       REAL_PASSWORD,
    displayName:    'Shravani Rasam',
    role:           'kitchen_manager',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000006',
  },

  // ── Accountant ────────────────────────────────────────────────
  {
    email:          '2023.manas.patil@ves.ac.in',
    password:       REAL_PASSWORD,
    displayName:    'Manas Patil (VES)',
    role:           'accountant',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      BRANCH_ID,
    branch_name:    'Kalyan West',
    phone:          '+91-8520000007',
  },

  // ── Franchise Admin (secondary) ───────────────────────────────
  {
    email:          'manaspatil281@gmail.com',
    password:       REAL_PASSWORD,
    displayName:    'Manas Patil',
    role:           'franchise_admin',
    franchise_id:   FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id:      null,
    branch_name:    null,
    phone:          '+91-8520000008',
  },
];

// ─────────────────────────────────────────────
//  LEGACY DEMO ACCOUNTS   password: Admin@123
//  (for quick role-switching during demo)
// ─────────────────────────────────────────────

const devUsers = [
  {
    email: 'franchise@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Prasad Rao (Demo)',
    role: 'franchise_admin',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: null,
    branch_name: null,
    phone: '+91-9000000002',
  },
  {
    email: 'manager@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Arjun Reddy (Demo)',
    role: 'branch_manager',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000003',
  },
  {
    email: 'sales@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Kavya Singh (Demo)',
    role: 'sales_executive',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000004',
  },
  {
    email: 'kitchen@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Raju Cook (Demo)',
    role: 'kitchen_manager',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000005',
  },
  {
    email: 'accountant@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Meera Sharma (Demo)',
    role: 'accountant',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000006',
  },
  {
    email: 'ops@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Vijay Kumar (Demo)',
    role: 'operations_staff',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000007',
  },
  {
    email: 'reception@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Priya Reddy (Demo)',
    role: 'receptionist',
    franchise_id: FRANCHISE_ID,
    franchise_name: 'Prasad Food Divine',
    branch_id: BRANCH_ID,
    branch_name: 'Kalyan West',
    phone: '+91-9000000008',
  },
  {
    email: 'customer@banquetease.com',
    password: DEV_PASSWORD,
    displayName: 'Rajesh Kumar (Demo)',
    role: 'customer',
    franchise_id: null,
    franchise_name: null,
    branch_id: null,
    branch_name: null,
    phone: '+91-9876543210',
  },
];

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

async function upsertAuthUser(user) {
  try {
    const existing = await auth.getUserByEmail(user.email);
    console.log(`    ⚠️  Auth exists: ${user.email}  (${existing.uid})`);
    return existing.uid;
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const created = await auth.createUser({
        email:         user.email,
        password:      user.password,
        displayName:   user.displayName,
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
  console.log('\n🌱  BanquetEase — Seed starting...\n');

  // 1. Franchise
  await db.collection('franchises').doc(FRANCHISE_ID).set(franchiseDoc, { merge: true });
  console.log(`📦  Franchise: Prasad Food Divine  (${FRANCHISE_ID})`);

  // 2. Branch
  await db.collection('branches').doc(BRANCH_ID).set(branchDoc, { merge: true });
  console.log(`🏢  Branch:    Kalyan West Outlet  (${BRANCH_ID})\n`);

  // 3. Users — real production users
  console.log('── Real / Production users ─────────────────');
  for (const user of realUsers) {
    try {
      const uid = await upsertAuthUser(user);
      await db.collection('users').doc(uid).set({
        uid,
        name:            user.displayName,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        franchise_id:    user.franchise_id,
        franchise_name:  user.franchise_name,
        branch_id:       user.branch_id,
        branch_name:     user.branch_name,
        status:          'active',
        employment_type: user.role === 'customer' ? null : 'Permanent',
        is_dev:          false,
        created_at:      TS(),
        updated_at:      TS(),
      }, { merge: true });
    } catch (err) {
      console.error(`    ❌ ${user.email}:`, err.message);
    }
  }

  // 4. Users — legacy demo accounts
  console.log('\n── Demo / Legacy accounts ──────────────────');
  for (const user of devUsers) {
    try {
      const uid = await upsertAuthUser(user);
      await db.collection('users').doc(uid).set({
        uid,
        name:            user.displayName,
        email:           user.email,
        phone:           user.phone,
        role:            user.role,
        franchise_id:    user.franchise_id,
        franchise_name:  user.franchise_name,
        branch_id:       user.branch_id,
        branch_name:     user.branch_name,
        status:          'active',
        employment_type: user.role === 'customer' ? null : 'Permanent',
        is_dev:          true,   // flag for login page quick-switch
        created_at:      TS(),
        updated_at:      TS(),
      }, { merge: true });
    } catch (err) {
      console.error(`    ❌ ${user.email}:`, err.message);
    }
  }

  // 5. Summary
  const border = '═'.repeat(77);
  console.log(`\n\n✨  Seed complete!\n\n${border}`);
  console.log('  Email                                  │ Role               │ Password');
  console.log(border);
  for (const u of realUsers) {
    console.log(`  ${u.email.padEnd(38)} │ ${u.role.padEnd(18)} │ ${u.password}`);
  }
  console.log('─'.repeat(77));
  console.log('  DEMO ACCOUNTS (password: Admin@123)');
  console.log('─'.repeat(77));
  for (const u of devUsers) {
    console.log(`  ${u.email.padEnd(38)} │ ${u.role.padEnd(18)} │ ${u.password}`);
  }
  console.log(border + '\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
