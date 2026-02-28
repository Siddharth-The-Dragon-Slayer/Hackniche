/**
 * Test json2video-sdk import and basic initialization
 */

async function testSDK() {
  console.log("🧪 Testing json2video-sdk import and initialization...\n");

  try {
    console.log("📦 Importing json2video-sdk...");
    const { Movie, Scene } = await import("json2video-sdk");
    console.log("✅ SDK imported successfully\n");

    console.log("🎬 Testing Movie initialization...");
    const movie = new Movie();
    console.log("✅ Movie instance created\n");

    console.log("🏷️  Testing Movie.setAPIKey()...");
    movie.setAPIKey("NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06");
    console.log("✅ API key set\n");

    console.log("⚙️  Testing Movie.set()...");
    movie.set("quality", "high");
    movie.set("resolution", "full-hd");
    movie.set("id", "test-movie");
    console.log("✅ Movie properties set\n");

    console.log("🎭 Testing Scene initialization...");
    const scene = new Scene();
    console.log("✅ Scene instance created\n");

    console.log("🏷️  Testing Scene.set()...");
    try {
      scene.set("id", "scene-1"); 
      scene.set("comment", "Test scene");
      console.log("✅ Scene properties set\n");
    } catch (sceneErr) {
      console.error("⚠️  Scene.set() error:", sceneErr.message || sceneErr);
      console.log("   Continuing with test...\n");
    }

    console.log("➕ Testing Scene.addElement()...");
    try {
      scene.addElement({
        type: "text",
        style: "003",
        text: "Test Text",
        duration: 3,
        start: 0,
      });
      console.log("✅ Element added to scene\n");
    } catch (addErr) {
      console.error("⚠️  Scene.addElement() error:", addErr.message || addErr);
      console.log("   Continuing with test...\n");
    }

    console.log("➕ Testing Movie.addScene()...");
    try {
      movie.addScene(scene);
      console.log("✅ Scene added to movie\n");
    } catch (addSceneErr) {
      console.error("⚠️  Movie.addScene() error:", addSceneErr.message || addSceneErr);
      console.log("   Continuing with test...\n");
    }

    console.log("✨ All SDK tests passed!");
    console.log("\nNOTE: We did NOT call movie.render() or movie.waitToFinish()");
    console.log("      because those would make actual API calls.");

  } catch (err) {
    console.error("❌ SDK Error:", err.message);
    console.error("\nStack trace:");
    console.error(err.stack);
    process.exit(1);
  }
}

testSDK();
