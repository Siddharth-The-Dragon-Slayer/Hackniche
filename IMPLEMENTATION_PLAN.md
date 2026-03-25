# QR Code & GRE Check-in Implementation Plan

## ✅ Completed
1. ✅ QR code utility library created (`src/lib/qr-generator.js`)
2. ✅ QR code package installed (`qrcode@1.5.4`)

## 🚀 Next Steps

### Phase 1: Add QR Codes to Posters (30 mins)
**Files to modify:**
- `src/app/api/ai/generate-poster/route.js`

**Changes:**
1. Import QR generator utility
2. Generate QR code for event check-in URL
3. Add QR code image to poster templates (bottom right corner)
4. Include "Scan to RSVP" text

**QR Code will contain:**
- Event check-in URL: `/gre/check-in?booking={bookingId}`
- Guest can scan to confirm attendance

---

### Phase 2: Create GRE Check-in Dashboard (1 hour)
**New files to create:**
1. `src/app/(dashboard)/gre/page.js` - GRE dashboard
2. `src/app/(dashboard)/gre/check-in/page.js` - Check-in interface
3. `src/app/(dashboard)/gre/scanner/page.js` - QR scanner component
4. `src/components/gre/qr-scanner.js` - QR scanning logic
5. `src/components/gre/guest-list.js` - Real-time guest list

**Features:**
- Mobile-optimized interface
- QR code scanner (using device camera)
- Real-time guest counter (arrived vs expected)
- Guest list with check-in status
- Manual check-in option (if QR fails)
- Live updates to kitchen (guest count)

---

### Phase 3: Guest RSVP System (45 mins)
**New files to create:**
1. `src/app/rsvp/[bookingId]/page.js` - Public RSVP page
2. `src/app/api/rsvp/route.js` - RSVP API endpoint
3. `src/components/rsvp/confirmation-form.js` - RSVP form

**Features:**
- Guest confirms attendance
- Dietary preferences selection
- Plus-one management
- Confirmation email sent
- Updates booking guest count

---

### Phase 4: Firestore Schema Updates
**New collections:**
```javascript
// guests/{guestId}
{
  booking_id: string,
  name: string,
  email: string,
  phone: string,
  rsvp_status: "pending" | "confirmed" | "declined",
  checked_in: boolean,
  checked_in_at: timestamp,
  dietary_preferences: string[],
  plus_ones: number,
  qr_token: string, // unique token for QR code
}

// check_ins/{checkInId}
{
  booking_id: string,
  guest_id: string,
  checked_in_by: string, // GRE user ID
  checked_in_at: timestamp,
  method: "qr" | "manual",
}
```

---

## 📱 User Flow

### Customer Journey:
1. Customer books event → Booking created
2. Customer generates poster → QR code included
3. Customer shares poster with guests
4. Guests scan QR → RSVP page opens
5. Guests confirm attendance → Database updated

### GRE Journey (Event Day):
1. GRE opens check-in dashboard
2. Guest arrives → GRE scans QR code
3. System marks guest as checked-in
4. Real-time counter updates
5. Kitchen sees live guest count

---

## 🎯 Hackathon Alignment

This implementation addresses:
- ✅ **Phase C: GRE & Guest Interface** - QR check-in system
- ✅ **Real-time guest counter** - Live updates
- ✅ **Mobile-optimized** - GRE interface
- ✅ **WhatsApp Integration** (next step) - Send QR codes via WhatsApp

---

## 🔧 Technical Stack

- **QR Generation**: `qrcode` npm package
- **QR Scanning**: `html5-qrcode` or device camera API
- **Real-time Updates**: Firestore real-time listeners
- **Mobile UI**: Responsive Tailwind CSS
- **State Management**: React hooks + Zustand

---

## ⏱️ Estimated Time
- Phase 1 (QR on posters): 30 mins
- Phase 2 (GRE dashboard): 1 hour
- Phase 3 (RSVP system): 45 mins
- Phase 4 (Database): 15 mins
- **Total: ~2.5 hours**

---

## 🚀 Ready to Start?

Run these commands to begin:
```cmd
cd banquet\CodingGurus-PS03\web
npm install html5-qrcode
npm run dev
```

Then I'll implement each phase step by step!
