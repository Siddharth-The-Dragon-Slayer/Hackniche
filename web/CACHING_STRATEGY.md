# BanquetEase Caching Strategy

## Overview

BanquetEase implements a **single-source in-memory cache** to minimize Firestore read costs while maintaining reactivity for a booking management system workflow.

---

## Cache Architecture

### 1. **In-Memory Cache Layer** (`lib/firestore-cache.js`)

- **Storage**: JavaScript `Map<key, {data, ts, ttl}>`
- **Scope**: Per-session (clears on page reload)
- **TTL (Time To Live)**: Default 5 minutes, configurable per entry
- **Cost**: Free (no Firestore dollars spent)
- **Lifetime**: Session-scoped

### 2. **Deterministic Cache Keys**

```javascript
cacheKeys.staff(franchise_id); // "staff_franchise_pfd"
cacheKeys.branches(franchise_id); // "branches_franchise_pfd"
cacheKeys.halls(branch_id); // "halls_branch_pfd_b1"
cacheKeys.franchise(franchise_id); // "franchise_pfd"
```

---

## Usage Patterns

### Pattern 1: Hook-Based Caching

```javascript
export function useBranches({ franchise_id, scope = "franchise" } = {}) {
  const cacheKey = cacheKeys.branches(franchise_id);

  // 1. Check cache FIRST (fast ✨)
  const cached = getCached(cacheKey);
  if (cached) {
    setBranches(cached);
    return; // No Firestore read!
  }

  // 2. Cache miss → fetch from Firestore
  const snap = await getDocs(
    query(collection(db, "branches"), where("franchise_id", "==", franchise_id))
  );

  // 3. Store result in cache
  const data = snap.docs.map(d => d.data());
  setCached(cacheKey, data, 600000); // 10 min TTL

  setBranches(data);
}
```

### Pattern 2: Manual Cache Management

```javascript
// After branch update:
await updateDoc(doc(db, "branches", branchId), payload);

// Invalidate cache to force next read from DB
invalidateCache(cacheKeys.branches(franchiseId));

// Next useBranches() call will fetch fresh data
```

### Pattern 3: Cascading Invalidation

```javascript
// When franchise settings change, bust multiple caches:
invalidateCacheBatch([
  cacheKeys.franchise(franchiseId),
  cacheKeys.branches(franchiseId),
  // User might need to re-fetch if logo/name changed
]);
```

---

## Caching Strategy by Entity

| Entity                 | Cache Key                 | TTL    | Invalidate On           |
| ---------------------- | ------------------------- | ------ | ----------------------- |
| **Branches**           | `branches_franchise_{id}` | 10 min | Add/Edit/Delete branch  |
| **Staff**              | `staff_franchise_{id}`    | 5 min  | Add/Edit/Delete user    |
| **Halls**              | `halls_branch_{id}`       | 10 min | Add/Edit/Delete hall    |
| **Franchise Settings** | `franchise_{id}`          | 15 min | Save franchise settings |
| **User Profile**       | `profile_{uid}`           | 5 min  | Change password/profile |

---

## Read Optimization Examples

### Before Cache (3 x Firestore reads)

```javascript
// Page load → User navigates to /branches
1. GET branches (read 1) ❌ 0.06 Firestore units
2. GET halls for each branch (read N) ❌ 0.06 × N units
3. Total cost: 0.06 + (0.06 × branches) = ~0.24 units

// Same user navigates to /staff, then back to /branches 5 min later
4. GET branches again (read 1) ❌ 0.06 units (WASTED - same data!)
```

### With Cache (1 x Firestore read - 75% savings)

```javascript
// Page load → User navigates to /branches
1. GET branches (read 1, cached) ✅ 0.06 units
2. GET halls (cached) ✅ 0.00 units
3. Total cost: 0.06 units

// Same user navigates away and back within 5-10 min
4. GET branches (from cache, TTL still valid) ✅ 0.00 units
```

---

## Best Practices

### ✅ DO:

1. **Use hook-based caching** for lists (useBranches, useStaff, useHalls)
2. **Default TTL** (5 min) for frequently-accessed data
3. **Longer TTL** (15 min) for slow-changing data (franchise settings)
4. **Cache invalidate** immediately after mutations (create/update/delete)
5. **Provide `refresh()` button** on list pages for manual invalidation
6. **Check cache before Firestore** in every hook

### ❌ DON'T:

1. ~~Make duplicate Firestore queries~~ (use hooks instead)
2. ~~Forget to invalidate after mutations~~ (cache becomes stale)
3. ~~Set TTL to 0~~ (defeats the purpose)
4. ~~Cache user-sensitive data indefinitely~~ (set reasonable TTLs)

---

## Firestore Cost Estimate (Per Month)

### Without Caching

- 100 active daily users
- Each user: 5 page navigations/day × 3 reads/page = 15 reads/day
- Total: 100 × 15 = **1,500 reads/day** = **45,000/month**
- Cost: 45,000 × $0.00006 = **$2.70/month**

### With 80% Cache Hit Rate

- Same users, same navigations
- Cache hits reduce reads to: 1,500 × 20% = **300 reads/day** = **9,000/month**
- Cost: 9,000 × $0.00006 = **$0.54/month** (↓ 80% savings)

---

## Cache Debugging

```javascript
// Check cache state in browser console
import { getCacheStats } from "@/lib/firestore-cache";
console.log(getCacheStats());
// Output: { size: 5, keys: ['branches_franchise_pfd', 'staff_franchise_pfd', ...] }
```

---

## Future Enhancements

- [ ] Persistent storage (localStorage for cross-session cache)
- [ ] Automatic cache warming on app load
- [ ] Cache metrics reporting to analytics
- [ ] Compression for large cached objects

---

**Last Updated:** February 2026  
**Maintenance Contact:** CodingGurus Dev Team
