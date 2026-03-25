/**
 * use-cache-reads.js — Caching hooks for optimized Firestore reads
 * Combines getCached/setCached + Firestore queries with intelligent TTL
 */

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getCached,
  setCached,
  cacheKeys,
  invalidateCache,
} from "@/lib/firestore-cache";

/**
 * Fetch collection with auto-caching
 * @param {string} collectionName - e.g., "branches", "users"
 * @param {array} whereConditions - [["franchise_id", "==", id]]
 * @param {object} options - { ttl, limit, orderBy, cacheKey }
 */
export function useCachedCollection(
  collectionName,
  whereConditions = [],
  options = {},
) {
  const { ttl = 600, limit: limitCount = 100, cacheKey } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const conditionsKey = useMemo(
    () => JSON.stringify(whereConditions),
    [whereConditions],
  );

  useEffect(() => {
    let isMounted = true;

    async function fetch() {
      try {
        const key = cacheKey || `${collectionName}_${conditionsKey}`;
        const cached = getCached(key);
        if (cached) {
          if (isMounted) setData(cached);
          setLoading(false);
          return;
        }

        let q = collection(db, collectionName);
        if (whereConditions.length > 0) {
          const conditions = whereConditions.map(([field, op, value]) =>
            where(field, op, value),
          );
          q = query(q, ...conditions, limit(limitCount));
        } else {
          q = query(q, limit(limitCount));
        }

        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setCached(key, docs, ttl);
        if (isMounted) setData(docs);
        setError(null);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetch();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, conditionsKey, ttl, limitCount, cacheKey]);

  return { data, loading, error };
}

/**
 * Cache + refresh wrapper for list data
 * Provides loading state and manual refresh trigger
 */
export function useCachedList(
  collectionName,
  whereConditions = [],
  options = {},
) {
  const { data, loading, error } = useCachedCollection(
    collectionName,
    whereConditions,
    options,
  );
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    const key =
      options.cacheKey ||
      `${collectionName}_${JSON.stringify(whereConditions)}`;
    invalidateCache(key);
    // Re-fetch by clearing state
    setTimeout(() => setRefreshing(false), 100);
  };

  return { data, loading, error, refreshing, refresh };
}

/**
 * Cache multi-document fetch (e.g., user + franchise in parallel)
 */
export async function getCachedDocs(requests) {
  const results = await Promise.all(
    requests.map(async ({ collection: col, doc: docId, cacheKey }) => {
      const key = cacheKey || `${col}_${docId}`;
      const cached = getCached(key);
      if (cached) return cached;

      const { getDoc, doc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, col, docId));
      const data = snap.exists() ? snap.data() : null;

      setCached(key, data, 600);
      return data;
    }),
  );
  return results;
}
