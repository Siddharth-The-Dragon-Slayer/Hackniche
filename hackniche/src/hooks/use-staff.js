/**
 * useStaff — Fetches staff from Firestore with role-based scoping + caching
 *
 * - franchise_admin  →  all users in the franchise (franchise_id match)
 * - branch_manager / any branch role  →  only their branch (branch_id match)
 * - super_admin  →  pass { allBranches: true } to get everything
 *
 * Returns: { staff: [], loading: bool, error: string|null, refresh: fn }
 */
"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getCached, setCached, cacheKeys } from "@/lib/firestore-cache";

/**
 * @param {{ franchise_id?: string, branch_id?: string, scope?: 'franchise'|'branch'|'all' }} opts
 */
export function useStaff({ franchise_id, branch_id, scope } = {}) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(
    async (bust = false) => {
      if (!franchise_id && scope !== "all") {
        setLoading(false);
        return;
      }

      // Build cache key + Firestore query based on scope
      let cacheKey, q;
      const usersRef = collection(db, "users");

      if (scope === "branch" && branch_id) {
        // Branch manager: scoped to their branch only
        cacheKey = cacheKeys.staffBranch(branch_id);
        q = query(
          usersRef,
          where("branch_id", "==", branch_id),
          where("status", "==", "active"),
        );
      } else if (scope === "franchise" && franchise_id) {
        // Franchise admin: all staff across their franchise
        cacheKey = cacheKeys.staff(franchise_id);
        q = query(
          usersRef,
          where("franchise_id", "==", franchise_id),
          where("status", "==", "active"),
        );
      } else {
        // Super admin: no scope filter — all users
        cacheKey = "staff_global";
        q = query(usersRef, where("status", "==", "active"));
      }

      if (!bust) {
        const cached = getCached(cacheKey);
        if (cached) {
          setStaff(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const snap = await getDocs(q);
        const data = snap.docs
          .map((d) => d.data())
          // Exclude customers from staff views
          .filter((u) => u.role !== "customer")
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCached(cacheKey, data);
        setStaff(data);
      } catch (err) {
        console.error("useStaff fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [franchise_id, branch_id, scope],
  );

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    loading,
    error,
    /** Call refresh() to bust cache and re-fetch (e.g. after adding staff) */
    refresh: () => fetchStaff(true),
  };
}
