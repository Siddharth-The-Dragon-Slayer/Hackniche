/**
 * In-process TTL cache for Next.js API routes.
 *
 * Usage (drop-in):
 *   import { cache } from '@/lib/cache';
 *   const hit = cache.get('key');
 *   cache.set('key', data, 60);   // TTL in seconds
 *   cache.del('key');             // manual invalidation
 *   cache.delPattern('menus:*');  // glob-style prefix invalidation
 *
 * Production upgrade path:
 *   Replace the Map with Upstash Redis:
 *   https://upstash.com  →  npm install @upstash/redis
 *   The public API surface (get/set/del/delPattern) stays identical.
 *
 * TTLs used in this app:
 *   menus list    → 5 min  (changes infrequently)
 *   menu detail   → 5 min
 *   All caches cleared on CREATE / UPDATE / DELETE via cache.delPattern()
 */

const DEFAULT_TTL = 300; // 5 minutes

class MemoryCache {
  constructor() {
    this._store = new Map(); // key → { value, expiresAt }
    // Periodically sweep expired entries (every 10 min)
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this._sweep(), 10 * 60 * 1000);
    }
  }

  /**
   * Returns the cached value or undefined if missing/expired.
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Stores value under key with the given TTL (seconds).
   */
  set(key, value, ttlSeconds = DEFAULT_TTL) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Deletes a single cache key.
   */
  del(key) {
    this._store.delete(key);
  }

  /**
   * Alias for del() - deletes a single cache key.
   */
  delete(key) {
    this.del(key);
  }

  /**
   * Deletes all keys that START WITH the given prefix.
   * e.g. cache.delPattern('menus:pfd:') removes all branch caches for franchise pfd.
   */
  delPattern(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
      }
    }
  }

  /** Returns cache stats for debugging. */
  stats() {
    const now = Date.now();
    let alive = 0, expired = 0;
    for (const entry of this._store.values()) {
      if (now <= entry.expiresAt) alive++; else expired++;
    }
    return { total: this._store.size, alive, expired };
  }

  /**
   * Returns an array of all cache keys.
   */
  keys() {
    return Array.from(this._store.keys());
  }

  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      if (now > entry.expiresAt) this._store.delete(key);
    }
  }
}

// Singleton — shared across all API route invocations in the same Node.js process.
export const cache = new MemoryCache();
