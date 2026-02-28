/**
 * BanquetEase — Dev User Seeding Script
 * 
 * This script creates 9 dev users in Firebase Auth + Firestore.
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download your service account key from Firebase Console:
 *    Firebase Console → Project Settings → Service Accounts → Generate new private key
 * 3. Save it as: scripts/serviceAccountKey.json
 * 
 * Usage:
 *   node scripts/seed-users.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

const devUsers = [
  {
    email: 'superadmin@banquetease.com',
    password: 'Admin@123',
    displayName: 'Coding Gurus Admin',
    role: 'super_admin',
    franchise_id: null,
    branch_id: null,
    phone: '+91-9000000001',
  },
  {
    email: 'franchise@banquetease.com',
    password: 'Admin@123',
    displayName: 'Prasad Rao',
    role: 'franchise_admin',
    franchise_id: 'f1',
    branch_id: null,
    phone: '+91-9000000002',
  },
  {
    email: 'manager@banquetease.com',
    password: 'Admin@123',
    displayName: 'Arjun Reddy',
    role: 'branch_manager',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000003',
  },
  {
    email: 'sales@banquetease.com',
    password: 'Admin@123',
    displayName: 'Kavya Singh',
    role: 'sales_executive',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000004',
  },
  {
    email: 'kitchen@banquetease.com',
    password: 'Admin@123',
    displayName: 'Raju Cook',
    role: 'kitchen_manager',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000005',
  },
  {
    email: 'accountant@banquetease.com',
    password: 'Admin@123',
    displayName: 'Meera Sharma',
    role: 'accountant',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000006',
  },
  {
    email: 'ops@banquetease.com',
    password: 'Admin@123',
    displayName: 'Vijay Kumar',
    role: 'operations_staff',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000007',
  },
  {
    email: 'reception@banquetease.com',
    password: 'Admin@123',
    displayName: 'Priya Reddy',
    role: 'receptionist',
    franchise_id: 'f1',
    branch_id: 'b1',
    phone: '+91-9000000008',
  },
  {
    email: 'customer@banquetease.com',
    password: 'Admin@123',
    displayName: 'Rajesh Kumar',
    role: 'customer',
    franchise_id: null,
    branch_id: null,
    phone: '+91-9876543210',
  },
];

/** Maps a role name to its Firestore collection name. */
function getRoleCollection(role) {
  const map = {
    super_admin:       'super_admins',
    franchise_admin:   'franchise_admins',
    branch_manager:    'branch_managers',
    sales_executive:   'sales_executives',
    kitchen_manager:   'kitchen_managers',
    accountant:        'accountants',
    operations_staff:  'operations_staff',
    receptionist:      'receptionists',
    customer:          'customers',
  };
  return map[role] ?? role + 's';
}

async function seedUsers() {
  console.log('🌱 Starting user seeding...\n');

  for (const user of devUsers) {
    try {
      // Check if user already exists
      let uid;
      try {
        const existing = await auth.getUserByEmail(user.email);
        uid = existing.uid;
        console.log(`⚠️  User already exists: ${user.email} (${uid})`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // Create new Firebase Auth user
          const created = await auth.createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            emailVerified: true,
          });
          uid = created.uid;
          console.log(`✅ Created Auth user: ${user.email} (${uid})`);
        } else {
          throw err;
        }
      }

      // Derive role-specific collection name (e.g. branch_manager → branch_managers)
      const roleCollection = getRoleCollection(user.role);

      const profileData = {
        uid,
        name: user.displayName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        franchise_id: user.franchise_id,
        branch_id: user.branch_id,
        status: 'active',
        employment_type: user.role === 'customer' ? null : 'Permanent',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save to central `users` collection
      await db.collection('users').doc(uid).set(profileData, { merge: true });

      // Save to role-specific collection
      await db.collection(roleCollection).doc(uid).set(profileData, { merge: true });

      console.log(`   📝 Firestore profile saved for: ${user.displayName} (${user.role}) → users + ${roleCollection}`);
    } catch (err) {
      console.error(`❌ Failed for ${user.email}:`, err.message);
    }
  }

  console.log('\n✨ Seeding complete!\n');
  console.log('Dev accounts created:');
  console.log('─────────────────────────────────────────────');
  console.log('Email                          │ Role              │ Password');
  console.log('─────────────────────────────────────────────');
  for (const u of devUsers) {
    console.log(`${u.email.padEnd(30)} │ ${u.role.padEnd(17)} │ ${u.password}`);
  }
  console.log('─────────────────────────────────────────────');

  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
