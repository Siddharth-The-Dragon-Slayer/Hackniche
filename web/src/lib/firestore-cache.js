/**
 * Lightweight in-memory Firestore read cache
 *
 * Keeps a Map<key, {data, ts}> per browser session.
 * Default TTL = 5 minutes — prevents duplicate Firestore reads on
 * page navigations while staying reactive enough for a BMS workflow.
 *
 * Usage (in hooks):
 *   const cached = getCached('staff_branch_pfd_b1');
 *   if (cached) return cached;
 *   const data = await ... fetch from Firestore ...
 *   setCached('staff_branch_pfd_b1', data);
 */

const _cache = new Map();

/** Default TTL: 5 minutes in ms */
export const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Stores `data` under `key` with current timestamp.
 * @param {string} key
 * @param {*} data
 * @param {number} [ttl] Optional TTL override in ms (default: 5 min)
 */
export function setCached(key, data, ttl = DEFAULT_TTL) {
  _cache.set(key, { data, ts: Date.now(), ttl });
}

/**
 * Get cached value with its own TTL (if provided on set)
 */
export function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  const ttl = entry.ttl || DEFAULT_TTL;
  if (Date.now() - entry.ts > ttl) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Removes a specific cache entry (or all entries when key is omitted).
 * Call this after creates / updates / deletes to keep cache consistent.
 * @param {string} [key] - omit to clear everything
 */
export function invalidateCache(key) {
  if (key !== undefined) {
    _cache.delete(key);
  } else {
    _cache.clear();
  }
}

/**
 * Invalidate multiple cache keys at once (useful after bulk operations)
 * @param {array} keys - array of cache key strings
 */
export function invalidateCacheBatch(keys) {
  keys.forEach((k) => _cache.delete(k));
}

/**
 * Get cache hit rate (for debugging)
 */
export function getCacheStats() {
  return {
    size: _cache.size,
    keys: Array.from(_cache.keys()),
  };
}

/** Build deterministic cache keys to avoid typos across files */
export const cacheKeys = {
  staff: (franchise_id) => `staff_franchise_${franchise_id}`,
  staffBranch: (branch_id) => `staff_branch_${branch_id}`,
  branches: (franchise_id) => `branches_franchise_${franchise_id}`,
  allBranches: () => "branches_all",
  halls: (branch_id) => `halls_branch_${branch_id}`,
  offers: (branch_id) => `offers_branch_${branch_id}`,
  franchise: (franchise_id) => `franchise_${franchise_id}`,
  userProfile: (uid) => `profile_${uid}`,
};
