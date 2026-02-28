/**
 * Test the full invitation endpoint logic with corrected Scene handling
 * Simulates what happens when POST /api/ai/json2video-invitation is called
 */

import { loadTemplate, validateVariables, EVENT_TYPES } from "./src/lib/invitation-templates/index.js";

async function testFullFlow() {
  console.log("🧪 Testing full invitation endpoint flow...\n");

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

  try {
    // Simulate request processing
    const { event_type, variables = {} } = requestBody;

    // Validate event type
    const normalized = event_type?.toLowerCase()?.trim();
    if (!EVENT_TYPES.includes(normalized)) {
      throw new Error(`Unsupported event_type: ${event_type}`);
    }
    console.log(`✅ Event type: ${normalized}\n`);

    // Validate variables
    const { valid, missing } = validateVariables(normalized, variables);
    if (!valid) {
      throw new Error(`Missing required variables: ${missing.join(", ")}`);
    }
    console.log(`✅ All required variables present\n`);

    // Load template
    const template = loadTemplate(normalized, variables);
    console.log(`✅ Template loaded: ${template.id}\n`);

    // Import SDK
    const { Movie, Scene } = await import("json2video-sdk");
    console.log("✅ SDK imported\n");

    // Initialize movie
    const API_KEY = "NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06";
    const movie = new Movie();
    movie.setAPIKey(API_KEY);

    // Extract template parts
    const { scenes, elements, variables: vars, ...movieProps } = template;

    // Apply movie-level properties
    for (const [key, value] of Object.entries(movieProps)) {
      movie.set(key, value);
    }
    console.log("✅ Movie properties set\n");

    // Set variables
    if (vars && Object.keys(vars).length > 0) {
      movie.set("variables", vars);
      console.log(`✅ Variables set (${Object.keys(vars).length} fields)\n`);
    }

    // Process scenes
    console.log(`📹 Processing ${scenes?.length || 0} scenes...`);
    for (let sceneIdx = 0; sceneIdx < (scenes?.length || 0); sceneIdx++) {
      const sceneData = scenes[sceneIdx];
      const { elements: sceneElements, id, comment, ...sceneProps } = sceneData;
      const scene = new Scene();

      // Set scene properties (skip unsupported ones)
      let propsSet = 0;
      if (comment) {
        scene.set("comment", comment);
        propsSet++;
      }
      for (const [key, value] of Object.entries(sceneProps)) {
        try {
          scene.set(key, value);
          propsSet++;
        } catch (err) {
          // Silently skip unsupported
        }
      }

      // Add elements to scene
      for (const element of sceneElements || []) {
        scene.addElement(element);
      }

      movie.addScene(scene);
      console.log(`   ✅ Scene ${sceneIdx + 1}: ${(sceneElements || []).length} elements, ${propsSet} properties`);
    }
    console.log("");

    // Add global elements
    if (elements && elements.length > 0) {
      for (const element of elements) {
        movie.addElement(element);
      }
      console.log(`✅ Added ${elements.length} global elements (e.g., background music)\n`);
    }

    console.log("✨ Movie fully constructed and ready!");
    console.log("\nAt this point in the actual endpoint:");
    console.log("   1. await movie.render()    - Submit to json2video API");
    console.log("   2. await movie.waitToFinish() - Poll for completion");
    console.log("   3. Extract result.movie.url - Get the MP4 video URL");
    console.log("\n(Skipping actual render/wait to avoid API calls)");

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testFullFlow();
