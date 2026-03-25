/**
 * useBranches — Fetches branches from Firestore with caching
 *
 * - franchise_admin  →  all branches in their franchise
 * - super_admin  →  all branches globally
 *
 * Returns: { branches: [], loading: bool, error: string|null, refresh: fn }
 */
"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getCached, setCached, cacheKeys } from "@/lib/firestore-cache";

/**
 * @param {{ franchise_id?: string, scope?: 'franchise'|'all' }} opts
 */
export function useBranches({ franchise_id, scope = "franchise" } = {}) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(
    async (bust = false) => {
      if (!franchise_id && scope !== "all") {
        setLoading(false);
        return;
      }

      let cacheKey, q;
      const ref = collection(db, "branches");

      if (scope === "franchise" && franchise_id) {
        cacheKey = cacheKeys.branches(franchise_id);
        q = query(ref, where("franchise_id", "==", franchise_id));
      } else {
        cacheKey = cacheKeys.allBranches();
        q = query(ref);
      }

      if (!bust) {
        const cached = getCached(cacheKey);
        if (cached) {
          setBranches(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const snap = await getDocs(q);
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCached(cacheKey, data);
        setBranches(data);
      } catch (err) {
        console.error("useBranches fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [franchise_id, scope],
  );

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refresh: () => fetchBranches(true),
  };
}

/**
 * useHalls — Fetches halls for a specific branch with caching
 */
export function useHalls({ branch_id } = {}) {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHalls = useCallback(
    async (bust = false) => {
      if (!branch_id) {
        setLoading(false);
        return;
      }

      const cacheKey = cacheKeys.halls(branch_id);

      if (!bust) {
        const cached = getCached(cacheKey);
        if (cached) {
          setHalls(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const snap = await getDocs(
          query(collection(db, "halls"), where("branch_id", "==", branch_id)),
        );
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCached(cacheKey, data);
        setHalls(data);
      } catch (err) {
        console.error("useHalls fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [branch_id],
  );

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  return { halls, loading, error, refresh: () => fetchHalls(true) };
}
