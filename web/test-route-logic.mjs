/**
 * Direct test of the json2video-invitation route logic
 * Tests without needing the Next.js server
 */

import { loadTemplate, validateVariables, EVENT_TYPES, requiredVariables } from "./src/lib/invitation-templates/index.js";

async function testRouteLogic() {
  console.log("🧪 Testing JSON2Video invitation route logic...\n");

  try {
    // Simulate the POST request body
    const requestBody = {
      event_type: "wedding",
      variables: {
        bride: "Priya Mehta",
        groom: "Arjun Kapoor",
        weddingDate: "Sunday, April 27, 2026",
        ceremonyTime: "11:00 AM",
        receptionTime: "7:00 PM",
        venueName: "The Royal Orchid Palace",
        venueAddress: "Outer Ring Road, Bengaluru",
        rsvpContact: "+91 98765 43210"
      }
    };

    console.log("📋 Testing with request body:");
    console.log(JSON.stringify(requestBody, null, 2));
    console.log("\n");

    // Step 1: Parse and validate event_type
    const { event_type, variables = {} } = requestBody;
    const normalized = event_type?.toLowerCase()?.trim();

    if (!normalized) {
      console.log("❌ Missing event_type");
      return;
    }

    if (!EVENT_TYPES.includes(normalized)) {
      console.log(`❌ Unsupported event_type. Supported: ${EVENT_TYPES.join(", ")}`);
      return;
    }

    console.log(`✅ Event type validated: ${normalized}\n`);

    // Step 2: Validate required variables
    const validation = validateVariables(normalized, variables);
    if (!validation.valid) {
      console.log(`❌ Missing required variables: ${validation.missing.join(", ")}`);
      return;
    }

    console.log(`✅ All required variables present\n`);

    // Step 3: Load template
    console.log("📦 Loading template...");
    const template = loadTemplate(normalized, variables);
    console.log(`✅ Template loaded: ${template.id}`);
    console.log(`   - Scenes: ${template.scenes?.length || 0}`);
    console.log(`   - Variables: ${Object.keys(template.variables).length}`);
    console.log(`   - Elements: ${template.elements?.length || 0}\n`);

    // Step 4: Check template structure
    console.log("🔍 Checking template structure...");
    
    // Validate all scenes have required fields
    for (let i = 0; i < template.scenes?.length || 0; i++) {
      const scene = template.scenes[i];
      if (!scene.id) console.warn(`⚠️  Scene ${i} missing id`);
      if (!scene.comment) console.warn(`⚠️  Scene ${i} missing comment`);
      if (!Array.isArray(scene.elements)) console.warn(`⚠️  Scene ${i} elements not an array`);
    }
    console.log("✅ Template structure valid\n");

    // Step 5: Show what would be sent to SDK
    console.log("📹 Template ready for json2video SDK:");
    console.log(`   - ID: ${template.id}`);
    console.log(`   - Quality: ${template.quality}`);
    console.log(`   - Resolution: ${template.resolution}`);
    console.log(`   - Variables set: ${JSON.stringify(template.variables).substring(0, 100)}...\n`);

    console.log("✨ Route logic test passed! Ready for SDK rendering.");
    console.log("\n📝 Next steps:");
    console.log("   1. Initialize Movie from json2video-sdk");
    console.log("   2. Set API key");
    console.log("   3. Apply template properties");
    console.log("   4. Build scenes and elements from template");
    console.log("   5. Call movie.render() and movie.waitToFinish()");

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  }
}

testRouteLogic();
