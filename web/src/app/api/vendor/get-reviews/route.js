/**
 * GET /api/vendor/get-reviews
 *
 * Fetches Google Maps reviews for a banquet vendor using SerpApi
 * This endpoint searches for a vendor on Google Maps, gets their unique ID,
 * then fetches all reviews (not limited to 5 like the official Google API).
 *
 * Query Parameters:
 * - vendorName (required): Name of the vendor (e.g., "Sharma Tent House")
 * - city (required): City where vendor is located (e.g., "Delhi")
 * - sortBy (optional): "qualityScore" | "newest" | "highestRating" | "lowestRating"
 *   Default: "qualityScore" (most relevant/helpful)
 *
 * Example Requests:
 * GET /api/vendor/get-reviews?vendorName=Sharma%20Tent%20House&city=Delhi&sortBy=newest
 * GET /api/vendor/get-reviews?vendorName=Prasad%20Food%20Divine&city=Kalyan&sortBy=qualityScore
 *
 * Response (success):
 * {
 *   "success": true,
 *   "vendor_info": {
 *     "name": "Sharma Tent House",
 *     "google_rating": 4.6,
 *     "review_count": 234,
 *     "address": "123 Main Street, Delhi"
 *   },
 *   "reviews": [
 *     {
 *       "author": "Rajesh Kumar",
 *       "rating": 5,
 *       "text": "Amazing service! Highly recommended.",
 *       "date": "2 months ago",
 *       "helpful_count": 12
 *     }
 *   ],
 *   "total_reviews_fetched": 24
 * }
 */

import { NextResponse } from "next/server";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "db0dad09048e7977d52c70cbcfa109f11fd6d63744e033b1b4779213342ffd54";
const SERPAPI_BASE = "https://serpapi.com/search";

// Helper function to fetch from SerpApi
async function serpApiCall(params) {
  try {
    const url = new URL(SERPAPI_BASE);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append("api_key", SERPAPI_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("[SerpApi] Call failed:", error.message);
    throw error;
  }
}
export async function GET(request) {
  try {
    // ── 1. Parse query parameters ──────────────────────────────
    const { searchParams } = new URL(request.url);
    const vendorName = searchParams.get("vendorName")?.trim();
    const city = searchParams.get("city")?.trim();
    const sortBy = searchParams.get("sortBy") || "qualityScore";

    // ── 2. Validate inputs ─────────────────────────────────────
    if (!vendorName || !city) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: vendorName and city",
          example:
            "/api/vendor/get-reviews?vendorName=Sharma%20Tent%20House&city=Delhi&sortBy=newest",
        },
        { status: 400 }
      );
    }

    if (!["qualityScore", "newest", "highestRating", "lowestRating"].includes(sortBy)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sortBy parameter",
          supported: ["qualityScore", "newest", "highestRating", "lowestRating"],
        },
        { status: 400 }
      );
    }

    console.log(
      `[get-reviews] Searching for: ${vendorName} in ${city}`
    );

    // ── 3. STEP 1: Find the vendor on Google Maps ──────────────
    const searchParams1 = {
      engine: "google_maps",
      q: `${vendorName} ${city}`,
      type: "search",
    };

    const searchResult = await serpApiCall(searchParams1);

    // Check if local results exist
    if (!searchResult.local_results || searchResult.local_results.length === 0) {
      console.log(
        `[get-reviews] Vendor not found: ${vendorName} in ${city}`
      );
      return NextResponse.json(
        {
          success: false,
          error: `Vendor "${vendorName}" not found on Google Maps in ${city}`,
          suggestion:
            "Try searching with different keywords, check spelling, or verify the location",
          tried_search: `${vendorName} ${city}`,
        },
        { status: 404 }
      );
    }

    const topMatch = searchResult.local_results[0];
    const dataId = topMatch.data_id;

    console.log(
      `[get-reviews] Found vendor: ${topMatch.title} (ID: ${dataId})`
    );

    // ── 4. STEP 2: Fetch all reviews for the vendor ────────────
    const reviewParams = {
      engine: "google_maps_reviews",
      data_id: dataId,
      hl: "en",
      sort_by: sortBy,
    };

    const reviewsResult = await serpApiCall(reviewParams);

    // Format reviews in a consistent format
    const reviews = (reviewsResult.reviews || []).map((review) => ({
      author: review.user?.name || "Anonymous",
      rating: review.rating || 0,
      text: review.snippet || "",
      date: review.published_at_raw || review.review_datetime_utc || "Unknown date",
      avatar: review.user?.thumbnail || null,
      helpful_count: review.review_likes_count || 0,
      images: review.images || [],
      owner_response: review.owner_response || null,
    }));

    console.log(
      `[get-reviews] Fetched ${reviews.length} reviews for ${topMatch.title}`
    );

    // ── 5. Build response ──────────────────────────────────────
    return NextResponse.json({
      success: true,
      vendor_info: {
        name: topMatch.title || vendorName,
        city: city,
        data_id: dataId,
        google_rating: topMatch.rating || "N/A",
        review_count: topMatch.review_count || 0,
        address: topMatch.address || "N/A",
        phone: topMatch.phone || "N/A",
        website: topMatch.website || null,
        type: topMatch.type || "Business",
        maps_url: topMatch.review_url || null,
      },
      reviews: reviews,
      total_reviews_fetched: reviews.length,
      sort_by: sortBy,
      api_cost: {
        description: "SerpApi charges per API call",
        search_cost: 1,
        reviews_cost: 1,
        total_cost: 2,
        note: "Cache this result for 30 days to minimize costs",
      },
      cached: false,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[get-reviews] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Failed to fetch reviews",
        stack:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vendor/get-reviews
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { vendorName, city, sortBy = "qualityScore" } = body;

    if (!vendorName || !city) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: vendorName, city",
        },
        { status: 400 }
      );
    }

    // Redirect to GET endpoint
    const url = new URL(request.url);
    url.searchParams.set("vendorName", vendorName);
    url.searchParams.set("city", city);
    url.searchParams.set("sortBy", sortBy);

    const getRequest = new Request(url, { method: "GET" });
    return GET(getRequest);
  } catch (error) {
    console.error("[get-reviews POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

