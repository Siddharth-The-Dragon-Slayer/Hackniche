# 🚀 Quick API Testing Reference

## Vendor Reviews API (SerpApi)

### Get Reviews - Newest First
```bash
curl "http://localhost:3000/api/vendor/get-reviews?vendorName=Prasad%20Food%20Divine&city=Kalyan&sortBy=newest"
```

### Get Reviews - Highest Rated
```bash
curl "http://localhost:3000/api/vendor/get-reviews?vendorName=Sharma%20Tent%20House&city=Delhi&sortBy=highestRating"
```

### Get Reviews - Most Relevant (Default)
```bash
curl "http://localhost:3000/api/vendor/get-reviews?vendorName=Rajesh%20Catering&city=Mumbai"
```

### POST Request
```bash
curl -X POST http://localhost:3000/api/vendor/get-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "vendorName": "Prasad Food Divine",
    "city": "Kalyan",
    "sortBy": "newest"
  }'
```

---

## Text-to-Image API (Puter.js)

### Generate Image - High Quality
```bash
curl -X POST http://localhost:3000/api/ai/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elegant wedding invitation card with peacock design",
    "quality": "high",
    "model": "gpt-image-1"
  }'
```

### Generate Image - Medium Quality (Faster)
```bash
curl -X POST http://localhost:3000/api/ai/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Birthday party invitation with balloons and confetti",
    "quality": "medium",
    "model": "gpt-image-1"
  }'
```

### Generate Image - DALL-E 3
```bash
curl -X POST http://localhost:3000/api/ai/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Anniversary celebration card in rose gold theme",
    "quality": "high",
    "model": "dalle-3"
  }'
```

### Get API Documentation
```bash
curl http://localhost:3000/api/ai/txt2img
```

---

## Wedding Invitation Video API

### Generate Wedding Invitation
```bash
curl -X POST http://localhost:3000/api/ai/json2video-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "wedding",
    "variables": {
      "bride": "Priya Mehta",
      "groom": "Arjun Kapoor",
      "weddingDate": "Sunday, May 27, 2026",
      "ceremonyTime": "11:00 AM",
      "receptionTime": "7:00 PM",
      "venueName": "The Royal Orchid Palace",
      "venueAddress": "Outer Ring Road, Bengaluru",
      "rsvpContact": "+91 98765 43210"
    }
  }'
```

### Generate Birthday Invitation
```bash
curl -X POST http://localhost:3000/api/ai/json2video-birthday \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "age": "30"
  }'
```

### Get API Documentation
```bash
curl http://localhost:3000/api/ai/json2video-invitation
```

---

## Menu Seeding Script

### Run Menu Seeding
```bash
cd D:\BanquetEase-CodingGurus\web
node scripts/seed-menus.js
```

**Output:**
```
🍽️  BanquetEase — Menu Seeding starting...

── Menu Packages ──────────────────────────────────
✅ pfd_menu_veg_premium    Premium Vegetarian Menu (₹650/plate)
✅ pfd_menu_veg_classic    Classic Vegetarian Menu (₹450/plate)
✅ pfd_menu_veg_economy    Economy Vegetarian Menu (₹300/plate)
✅ pfd_menu_jain           Pure Jain Vegetarian Menu (₹550/plate)

── Dishes: Premium Vegetarian Menu ──
✅ Cheese Corn Ball ⭐
✅ Mix Grilled Finger ⭐
✅ Kaju Masala ⭐
... (18 total dishes)

✨ Menu Seeding complete!
```

---

## User Seeding Script

### Run User Seeding
```bash
cd D:\BanquetEase-CodingGurus\web
node scripts/seed-users.js
```

**Test Credentials:**

| Email | Role | Password |
|-------|------|----------|
| contact@codinggurus.in | Super Admin | 123456789 |
| darshankhapekar8520@gmail.com | Franchise Admin | 123456789 |
| d2022.darshan.khapekar@ves.ac.in | Branch Manager | 123456789 |
| 2022.pranav.pol@ves.ac.in | Sales Executive | 123456789 |
| 2022.shravani.rasam@ves.ac.in | Receptionist | 123456789 |

---

## Database Query Examples (Firebase Console)

### Find all "New" leads assigned to a sales executive
```
Collection: leads
Filters:
  - status == "new"
  - assigned_to_uid == "uid_sales_exec_001"
Order by: created_at (DESC)
```

### Find all completed weddings in May 2026
```
Collection: leads
Filters:
  - event_type == "wedding"
  - status == "completed"
  - event_date >= 2026-05-01
  - event_date <= 2026-05-31
```

### Find all high-value leads (>₹500k budget)
```
Collection: leads
Filters:
  - budget_range contains "500000"
  - status != "lost"
```

---

## Common Errors & Solutions

### "Video endpoint returning 404"
**Solution:** Dev server needs restart
```bash
# Kill existing process
taskkill /F /IM node.exe

# Restart
cd D:\BanquetEase-CodingGurus\web
npm run dev
```

### "SerpApi quota exceeded"
**Solution:** Check usage at https://serpapi.com/dashboard
- Free tier: 100 searches/month
- Each vendor lookup costs 2 searches
- Max 50 vendor lookups/month

### "Template loading failed - ENOENT"
**Solution:** Use `process.cwd()` instead of `__dirname`
```javascript
const filepath = join(process.cwd(), "src", "lib", "templates", "menu.json");
```

---

## Environment Variables Required

```bash
# .env.local
JSON2VIDEO_API_KEY=NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06
SERPAPI_KEY=db0dad09048e7977d52c70cbcfa109f11fd6d63744e033b1b4779213342ffd54
FIREBASE_PROJECT_ID=your-project-id
```

---

## Performance Tips

### Cache Vendor Reviews
```javascript
// Check if cached < 30 days old before fetching fresh
const isCached = (cachedDate) => Date.now() - cachedDate < 30 * 24 * 60 * 60 * 1000;
```

### Batch Database Writes
```javascript
// Update multiple leads at once
const batch = db.batch();
batch.update(leadRef1, {status: "visited"});
batch.update(leadRef2, {status: "visited"});
await batch.commit();
```

### Use Pagination for Large Lists
```javascript
// Limit results to 20
db.collection("leads")
  .where("status", "==", "new")
  .limit(20)
  .get()
```

---

## Testing Checklist

- [ ] Vendor Reviews API (GET + POST)
- [ ] Text-to-Image API (all 3 models)
- [ ] Wedding Video API
- [ ] Birthday Video API
- [ ] Menu seeding (check 4 menus created)
- [ ] User seeding (check 9 users created)
- [ ] Database indexes created
- [ ] Environment variables set

---

## Useful Links

- 🔗 SerpApi Dashboard: https://serpapi.com/dashboard
- 🔗 Firebase Console: https://console.firebase.google.com
- 🔗 Puter.js Docs: https://js.puter.com/docs
- 🔗 json2video SDK: https://github.com/json2video/json2video-sdk

---

**Last Updated:** February 28, 2026
**Status:** ✅ All endpoints tested and working
