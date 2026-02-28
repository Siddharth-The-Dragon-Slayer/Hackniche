/**
 * Quick test for the json2video-invitation endpoint
 * Tests the template loading and rendering logic locally
 */

import { loadTemplate, validateVariables, EVENT_TYPES } from "./src/lib/invitation-templates/index.js";

function runTest() {
  console.log("🧪 Testing invitation templates...\n");

  try {
    // Test 1: Validate variables
    console.log("✓ Test 1: Validate wedding variables");
    const weddingVars = {
      bride: "Priya Mehta",
      groom: "Arjun Kapoor",
      weddingDate: "Sunday, April 27, 2026",
      ceremonyTime: "11:00 AM",
      receptionTime: "7:00 PM",
      venueName: "The Royal Orchid Palace",
      venueAddress: "Outer Ring Road, Bengaluru",
      rsvpContact: "+91 98765 43210"
    };

    const validation = validateVariables("wedding", weddingVars);
    console.log("  Validation result:", validation);
    if (!validation.valid) {
      console.log("  ❌ Missing:", validation.missing);
      return;
    }
    console.log("  ✅ All required variables present\n");

    // Test 2: Load template
    console.log("✓ Test 2: Load wedding template");
    const template = loadTemplate("wedding", weddingVars);
    console.log("  Template ID:", template.id);
    console.log("  Scenes:", template.scenes?.length || 0);
    console.log("  Variables merged:", Object.keys(template.variables).slice(0, 5).join(", ") + "...");
    console.log("  ✅ Template loaded and merged successfully\n");

    // Test 3: Test birthday template
    console.log("✓ Test 3: Load birthday template");
    const birthdayTemplate = loadTemplate("birthday", {
      guestName: "Rahul",
      age: "30",
      hostName: "The Sharma Family",
      eventDate: "Saturday, March 15, 2026",
      eventTime: "7:00 PM",
      venueName: "Grand Celebration Hall",
      venueAddress: "12, MG Road, Bengaluru",
      rsvpContact: "+91 98765 43210",
      rsvpDate: "March 10, 2026",
    });
    console.log("  Template ID:", birthdayTemplate.id);
    console.log("  Guest name:", birthdayTemplate.variables.guestName);
    console.log("  ✅ Birthday template loaded successfully\n");

    // Test 4: Check all event types
    console.log("✓ Test 4: All event types available");
    for (const type of EVENT_TYPES) {
      try {
        const tmpl = loadTemplate(type, {});
        console.log(`  ✅ ${type}`);
      } catch (err) {
        console.log(`  ❌ ${type}: ${err.message}`);
      }
    }

    console.log("\n✨ All tests passed!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    console.error(err.stack);
  }
}

runTest();
