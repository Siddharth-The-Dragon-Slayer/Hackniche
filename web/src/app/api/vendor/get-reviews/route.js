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

// ── In-Memory Cache (30-minute TTL, resets on server restart) ──────────────
const _reviewCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function _cacheKey(vendorName, city, sortBy) {
  return `${vendorName.toLowerCase().trim()}||${city.toLowerCase().trim()}||${sortBy}`;
}
function _getCached(key) {
  const entry = _reviewCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { _reviewCache.delete(key); return null; }
  return entry.data;
}
function _setCache(key, data) {
  _reviewCache.set(key, { data, ts: Date.now() });
}
// ────────────────────────────────────────────────────────────────────────────

// Helper function to fetch from SerpApi — accepts an external AbortSignal
async function serpApiCall(params, signal) {
  try {
    const url = new URL(SERPAPI_BASE);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append("api_key", SERPAPI_KEY);

    const response = await fetch(url.toString(), { signal });
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
  // Single 10 s timeout shared across all SerpApi calls in this request
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    // ── 1. Parse query parameters ──────────────────────────────
    const { searchParams } = new URL(request.url);
    const vendorName = searchParams.get("vendorName")?.trim();
    const city = searchParams.get("city")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "qualityScore";

    // ── 2. Validate inputs ─────────────────────────────────────
    if (!vendorName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: vendorName",
          example: "/api/vendor/get-reviews?vendorName=Prasad%20Food%20Divine&sortBy=newest",
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
      `[get-reviews] Searching for: ${vendorName}${city ? ` in ${city}` : ""}`
    );

    // ── 3 (cache check). Return cached result instantly if available ──────
    const cacheKey = _cacheKey(vendorName, city, sortBy);
    const cached = _getCached(cacheKey);
    if (cached) {
      console.log(`[get-reviews] Cache HIT for: ${vendorName}`);
      return NextResponse.json({ ...cached, cached: true });
    }

    // ── 3. STEP 1: Find the vendor on Google Maps ──────────────
    const searchParams1 = {
      engine: "google_maps",
      q: vendorName,   // search by name only — no city appended
      type: "search",
    };

    const searchResult = await serpApiCall(searchParams1, controller.signal);

    // Check if local results exist
    if (!searchResult.local_results || searchResult.local_results.length === 0) {
      console.log(`[get-reviews] Vendor not found: ${vendorName}`);
      return NextResponse.json(
        {
          success: false,
          already_synced: true,
          error: `Vendor "${vendorName}" not found on Google Maps`,
          suggestion: "Check spelling or try a different search name",
          tried_search: vendorName,
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

    const reviewsResult = await serpApiCall(reviewParams, controller.signal);

    // Format reviews in a consistent format
    const reviews = (reviewsResult.reviews || []).map((review) => ({
      author: review.user?.name || "Anonymous",
      rating: review.rating || 0,
      // SerpApi uses 'snippet' in search results and 'text' in reviews endpoint
      text: review.snippet || review.text || review.description || "",
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
    const responseData = {
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
        note: "Cache TTL: 30 minutes",
      },
      cached: false,
      fetched_at: new Date().toISOString(),
    };

    // Store in cache for future requests
    _setCache(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[get-reviews] Error:", error);
    const isTimeout = error.name === "AbortError" || error.code === "UND_ERR_SOCKET";
    return NextResponse.json(
      {
        success: false,
        already_synced: true,
        error: isTimeout ? "Connection timed out" : (error.message || "Failed to fetch reviews"),
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /api/vendor/get-reviews
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { vendorName, city = "", sortBy = "qualityScore" } = body;

    if (!vendorName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: vendorName",
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

