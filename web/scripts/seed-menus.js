/**
 * BanquetEase — Menu Seeding Script
 *
 * Seeds Prasad Food Divine's menu packages with dishes, pricing, and customization options
 * into Firebase Firestore using a hierarchical franchise → branch → menu structure.
 *
 * Database Structure:
 * menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}
 *   ├── menu_name        (string)
 *   ├── franchise_id     (string)
 *   ├── branch_id        (string)
 *   ├── category         (string): "veg_premium" | "veg_classic" | "veg_economy" | "jain"
 *   ├── price_per_plate  (number)
 *   ├── serves_min       (number)
 *   ├── serves_max       (number)
 *   ├── total_items      (number)
 *   ├── status           (string): "active" | "archived"
 *   ├── created_at       (timestamp)
 *   └── updated_at       (timestamp)
 *
 * menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}/dishes/{dish_id}
 *   ├── dish_name    (string)
 *   ├── category     (string): "starter" | "main" | "rice" | "bread" | "sweet" | "beverage"
 *   ├── veg_type     (string): "vegetarian" | "vegan" | "jain"
 *   ├── spice_level  (string): "mild" | "medium" | "spicy"
 *   ├── description  (string)
 *   ├── ingredients  (array)
 *   ├── is_signature (boolean)
 *   ├── status       (string): "available" | "seasonal"
 *   ├── created_at   (timestamp)
 *   └── updated_at   (timestamp)
 *
 * Usage:
 *   node scripts/seed-menus.js
 *
 * Prerequisites:
 *   npm install firebase-admin
 *   Place serviceAccountKey.json in scripts/
 */

const admin = require("firebase-admin");
const path = require("path");

// Load service account key
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const TS = () => admin.firestore.FieldValue.serverTimestamp();

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const FRANCHISE_ID = "pfd";
const ALL_BRANCH_IDS = ["pfd_b1"];

// Helper: resolves Firestore path for a menu document
// Path: menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}
const menuRef = (branch_id, menu_id) =>
  db
    .collection("menus")
    .doc(FRANCHISE_ID)
    .collection("branches")
    .doc(branch_id)
    .collection("menus")
    .doc(menu_id);

// Helper: resolves Firestore path for a dish sub-document
// Path: menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}/dishes/{dish_id}
const dishRef = (branch_id, menu_id, dish_id) =>
  menuRef(branch_id, menu_id).collection("dishes").doc(dish_id);

// ─────────────────────────────────────────────
//  MENU PACKAGES
// ─────────────────────────────────────────────

const menuPackages = [
  // ── PREMIUM VEGETARIAN MENU ──────────────────────────────────
  {
    id: "pfd_menu_veg_premium",
    menu_name: "Premium Vegetarian Menu",
    franchise_id: FRANCHISE_ID,
    category: "veg_premium",
    price_per_plate: 650,                 // INR per plate
    serves_min: 50,
    serves_max: 500,
    description:
      "Our signature premium vegetarian menu featuring handpicked dishes from authentic Indian recipes. Perfect for weddings, anniversaries, and premium events.",
    cuisine: "Indian Vegetarian",
    highlights: [
      "Chef-curated dishes",
      "Premium ingredients",
      "5+ courses",
      "Customizable spice levels",
    ],
    total_items: 18,                      // 18 dishes in this menu
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── CLASSIC VEGETARIAN MENU ──────────────────────────────────
  {
    id: "pfd_menu_veg_classic",
    menu_name: "Classic Vegetarian Menu",
    franchise_id: FRANCHISE_ID,
    category: "veg_classic",
    price_per_plate: 450,                 // INR per plate
    serves_min: 50,
    serves_max: 500,
    description:
      "Traditional Indian vegetarian menu with beloved classics. Ideal for birthday celebrations, office events, and family gatherings.",
    cuisine: "Indian Vegetarian",
    highlights: [
      "Traditional recipes",
      "Popular dishes",
      "4 courses",
      "Great value for money",
    ],
    total_items: 15,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── ECONOMY VEGETARIAN MENU ──────────────────────────────────
  {
    id: "pfd_menu_veg_economy",
    menu_name: "Economy Vegetarian Menu",
    franchise_id: FRANCHISE_ID,
    category: "veg_economy",
    price_per_plate: 300,                 // INR per plate
    serves_min: 100,
    serves_max: 1000,
    description:
      "Budget-friendly menu with nutritious and delicious dishes. Perfect for student events, group gatherings, and fundraisers.",
    cuisine: "Indian Vegetarian",
    highlights: [
      "Affordable pricing",
      "Nutritious options",
      "3 courses",
      "High volume capacity",
    ],
    total_items: 12,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── JAIN VEGETARIAN MENU ──────────────────────────────────────
  {
    id: "pfd_menu_jain",
    menu_name: "Pure Jain Vegetarian Menu",
    franchise_id: FRANCHISE_ID,
    category: "jain",
    price_per_plate: 550,                 // INR per plate
    serves_min: 50,
    serves_max: 300,
    description:
      "Strictly Jain-compliant menu with no onion, garlic, or root vegetables. Prepared in separate dedicated kitchen.",
    cuisine: "Jain Indian Vegetarian",
    highlights: [
      "No onion/garlic",
      "No root vegetables",
      "Dedicated kitchen",
      "Religious compliance",
    ],
    total_items: 14,
    status: "active",
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────
//  DISHES FOR PREMIUM VEGETARIAN MENU
// ─────────────────────────────────────────────

const premiumVegDishes = [
  // ── STARTERS ──────────────────────────────────────────────────
  {
    id: "starter_001",
    dish_name: "Cheese Corn Ball",
    category: "starter",
    veg_type: "vegetarian",
    spice_level: "mild",
    description:
      "Crispy corn and cheese balls served with tangy tamarind sauce",
    ingredients: ["Corn", "Paneer", "Cheese", "Corn flour", "Herbs"],
    cooking_time: 15,                     // minutes
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "starter_002",
    dish_name: "Mix Grilled Finger",
    category: "starter",
    veg_type: "vegetarian",
    spice_level: "medium",
    description:
      "Assorted grilled vegetables with special herbs and spices marinade",
    ingredients: [
      "Capsicum",
      "Onion",
      "Broccoli",
      "Paneer",
      "Olive oil",
      "Herbs",
    ],
    cooking_time: 20,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "starter_003",
    dish_name: "Butter Paneer Tikka",
    category: "starter",
    veg_type: "vegetarian",
    spice_level: "medium",
    description: "Soft paneer cubes marinated in yogurt and spices, grilled",
    ingredients: ["Paneer", "Yogurt", "Butter", "Spices", "Herbs"],
    cooking_time: 25,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── MAIN COURSE (CURRIES) ─────────────────────────────────────
  {
    id: "main_001",
    dish_name: "Kaju Masala",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "medium",
    description:
      "Rich cashew curry with aromatic spices, cream, and tomato base",
    ingredients: [
      "Cashew",
      "Tomato",
      "Onion",
      "Cream",
      "Ginger-garlic",
      "Spices",
    ],
    cooking_time: 30,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "main_002",
    dish_name: "Paneer Do Pyaza",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "medium",
    description:
      "Soft paneer with two varieties of onions (fried and boiled) in sauce",
    ingredients: ["Paneer", "Onion", "Tomato", "Yogurt", "Green chili"],
    cooking_time: 25,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "main_003",
    dish_name: "Chole Bhatura Masala",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "medium",
    description: "Chickpeas in a spiced tomato-onion curry with hints of amchur",
    ingredients: ["Chickpeas", "Onion", "Tomato", "Amchur", "Ginger", "Spices"],
    cooking_time: 35,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "main_004",
    dish_name: "Mixed Vegetable Curry",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Seasonal vegetables in a light coconut and yogurt base",
    ingredients: [
      "Mixed vegetables",
      "Coconut milk",
      "Yogurt",
      "Ginger",
      "Green chili",
    ],
    cooking_time: 28,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── RICE & BREADS ─────────────────────────────────────────────
  {
    id: "rice_001",
    dish_name: "Veg Biryani",
    category: "rice",
    veg_type: "vegetarian",
    spice_level: "medium",
    description:
      "Fragrant basmati rice with mixed vegetables and aromatic spices, cooked dum pukht",
    ingredients: [
      "Basmati rice",
      "Mixed vegetables",
      "Yogurt",
      "Ghee",
      "Saffron",
      "Spices",
    ],
    cooking_time: 45,
    is_signature: true,
    servings_per_kg: 3,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "rice_002",
    dish_name: "Garlic Fried Rice",
    category: "rice",
    veg_type: "vegetarian",
    spice_level: "medium",
    description: "Steamed rice stir-fried with garlic, vegetables, and soy sauce",
    ingredients: ["Basmati rice", "Garlic", "Soy sauce", "Vegetables", "Oil"],
    cooking_time: 20,
    is_signature: false,
    servings_per_kg: 3,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "bread_001",
    dish_name: "Butter Naan",
    category: "bread",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Soft leavened bread baked in tandoor, brushed with ghee",
    ingredients: ["Wheat flour", "Yogurt", "Ghee", "Salt"],
    cooking_time: 5,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "bread_002",
    dish_name: "Garlic Naan",
    category: "bread",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Naan topped with fresh garlic and herbs",
    ingredients: ["Wheat flour", "Garlic", "Coriander", "Ghee"],
    cooking_time: 5,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "bread_003",
    dish_name: "Roti",
    category: "bread",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Simple unleavened Indian bread, light and wholesome",
    ingredients: ["Wheat flour", "Salt", "Water"],
    cooking_time: 3,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── SWEETS & DESSERTS ──────────────────────────────────────────
  {
    id: "sweet_001",
    dish_name: "Sizzling Brownie",
    category: "sweet",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Hot chocolate brownie served with vanilla ice cream and sauce",
    ingredients: ["Flour", "Chocolate", "Butter", "Eggs", "Ice cream"],
    cooking_time: 15,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "sweet_002",
    dish_name: "Gulab Jamun",
    category: "sweet",
    veg_type: "vegetarian",
    spice_level: "mild",
    description:
      "Soft milk powder dumplings in warm sugar syrup flavored with cardamom",
    ingredients: ["Milk powder", "Flour", "Sugar", "Cardamom", "Ghee"],
    cooking_time: 20,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "sweet_003",
    dish_name: "Kheer",
    category: "sweet",
    veg_type: "vegetarian",
    spice_level: "mild",
    description:
      "Creamy rice pudding with milk, nuts, and cardamom, served chilled",
    ingredients: ["Rice", "Milk", "Sugar", "Nuts", "Cardamom"],
    cooking_time: 25,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  // ── BEVERAGES ──────────────────────────────────────────────────
  {
    id: "beverage_001",
    dish_name: "Strawberry Pina Colada",
    category: "beverage",
    veg_type: "vegetarian",
    spice_level: "mild",
    description:
      "Refreshing non-alcoholic strawberry and coconut mocktail with fresh mint",
    ingredients: ["Strawberry", "Coconut milk", "Mint", "Sugar", "Lime"],
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "beverage_002",
    dish_name: "Mango Lassi",
    category: "beverage",
    veg_type: "vegetarian",
    spice_level: "mild",
    description:
      "Creamy yogurt-based drink with fresh mango pulp and cardamom",
    ingredients: ["Yogurt", "Mango", "Cardamom", "Sugar"],
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────
//  DISHES FOR CLASSIC VEGETARIAN MENU
// ─────────────────────────────────────────────

const classicVegDishes = [
  // Simplified version with the most popular dishes
  {
    id: "classic_starter_001",
    dish_name: "Samosa",
    category: "starter",
    veg_type: "vegetarian",
    spice_level: "medium",
    description: "Triangular pastry filled with spiced potato and peas",
    ingredients: ["Flour", "Potato", "Peas", "Spices", "Oil"],
    cooking_time: 10,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_main_001",
    dish_name: "Aloo Gobi",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "medium",
    description: "Potato and cauliflower curry with turmeric and cumin",
    ingredients: ["Potato", "Cauliflower", "Turmeric", "Cumin", "Onion"],
    cooking_time: 25,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_main_002",
    dish_name: "Dal Makhani",
    category: "main",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Creamy black lentil curry with garlic and ginger",
    ingredients: ["Black lentil", "Cream", "Butter", "Tomato", "Spices"],
    cooking_time: 40,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_rice_001",
    dish_name: "Jeera Rice",
    category: "rice",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Flavored basmati rice with cumin seeds and ghee",
    ingredients: ["Basmati rice", "Cumin", "Ghee", "Salt"],
    cooking_time: 20,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_bread_001",
    dish_name: "Roti",
    category: "bread",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Simple Indian bread",
    ingredients: ["Wheat flour", "Water", "Salt"],
    cooking_time: 3,
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_sweet_001",
    dish_name: "Jalebi",
    category: "sweet",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Spiral-shaped fried pastry in sugar syrup with cardamom",
    ingredients: ["Flour", "Sugar", "Saffron", "Cardamom"],
    cooking_time: 15,
    is_signature: true,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },

  {
    id: "classic_beverage_001",
    dish_name: "Chaach",
    category: "beverage",
    veg_type: "vegetarian",
    spice_level: "mild",
    description: "Traditional buttermilk with spices and herbs",
    ingredients: ["Yogurt", "Cumin", "Coriander", "Mint", "Salt"],
    is_signature: false,
    status: "available",
    created_at: TS(),
    updated_at: TS(),
  },
];

// ─────────────────────────────────────────────
//  CUSTOMIZATION OPTIONS
// ─────────────────────────────────────────────

const customizationOptions = [
  {
    id: "customize_001",
    name: "Spice Level Adjustment",
    description: "Customize spice level from mild to extra spicy",
    options: ["Mild", "Medium", "Spicy", "Extra Spicy"],
    type: "selection",
  },
  {
    id: "customize_002",
    name: "Add Extra Dishes",
    description: "Add 1-2 additional signature dishes",
    options: ["No additional", "+1 dish (+₹40/plate)", "+2 dishes (+₹80/plate)"],
    type: "selection",
  },
  {
    id: "customize_003",
    name: "Dietary Requirements",
    description: "Specify dietary restrictions or allergies",
    options: ["No dairy", "No gluten", "Nut-free", "No onion/garlic"],
    type: "multiple",
  },
  {
    id: "customize_004",
    name: "Extra Serving",
    description: "Extra bread or rice servings",
    options: ["No extra", "+2 Naan (+₹20)", "+2 Roti (+₹10)", "+Rice (+₹15)"],
    type: "selection",
  },
];

// ─────────────────────────────────────────────
//  MAIN SEED FUNCTION
// ─────────────────────────────────────────────

// Map menu id → dishes array for seeding
const MENU_DISHES = {
  pfd_menu_veg_premium: premiumVegDishes,
  pfd_menu_veg_classic: classicVegDishes,
};

async function seedMenus() {
  console.log("\n🍽️  BanquetEase — Menu Seeding starting...");
  console.log(`   Structure: menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}\n`);

  const border = "═".repeat(75);
  let totalDishes = 0;

  for (const branch_id of ALL_BRANCH_IDS) {
    console.log(`\n── Branch: ${branch_id} ${"-".repeat(50)}`);

    for (const menu of menuPackages) {
      // Build per-branch menu document (branch_id stamped on each doc)
      const menuDoc = { ...menu, branch_id, updated_at: TS() };
      delete menuDoc.id; // id is the document key, not a field

      // 1. Write menu document under new hierarchical path
      await menuRef(branch_id, menu.id).set(menuDoc, { merge: true });
      console.log(`    ✅ ${menu.id.padEnd(28)} ₹${menu.price_per_plate}/plate`);

      // 2. Write dishes as sub-collection
      const dishes = MENU_DISHES[menu.id] || [];
      for (const dish of dishes) {
        const dishDoc = { ...dish, updated_at: TS() };
        delete dishDoc.id;
        await dishRef(branch_id, menu.id, dish.id).set(dishDoc, { merge: true });
        totalDishes++;
      }
      if (dishes.length > 0) {
        console.log(`       └─ ${dishes.length} dishes seeded`);
      }
    }
  }

  // 3. Customization options (franchise-level, not per branch)
  console.log("\n── Customization Options ──────────────────────────");
  for (const option of customizationOptions) {
    await db
      .collection("menus")
      .doc(FRANCHISE_ID)
      .collection("customizations")
      .doc(option.id)
      .set(option, { merge: true });
    console.log(`    ✅ ${option.name}`);
  }

  // 4. Summary
  console.log(`\n\n✨  Menu Seeding complete!\n\n${border}`);
  console.log("Paths written (per branch):");
  console.log(border);
  for (const branch_id of ALL_BRANCH_IDS) {
    for (const m of menuPackages) {
      const dishes = MENU_DISHES[m.id]?.length || 0;
      console.log(
        `  menus/${FRANCHISE_ID}/branches/${branch_id}/menus/${m.id.padEnd(22)} │ ₹${m.price_per_plate.toString().padEnd(4)} │ ${dishes} dishes`,
      );
    }
  }
  console.log(border);
  console.log(`\n✓ Franchise:             ${FRANCHISE_ID}`);
  console.log(`✓ Branches seeded:       ${ALL_BRANCH_IDS.length}`);
  console.log(`✓ Menu packages/branch:  ${menuPackages.length}`);
  console.log(`✓ Dishes seeded:         ${totalDishes}`);
  console.log(`✓ Customization options: ${customizationOptions.length}`);
  console.log(`\n📍 Firestore Path:`);
  console.log(`   menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}`);
  console.log(`   menus/{franchise_id}/branches/{branch_id}/menus/{menu_id}/dishes/{dish_id}`);
  console.log(`   menus/{franchise_id}/customizations/{option_id}\n${border}\n`);

  process.exit(0);
}

// Run the seed function
seedMenus().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
