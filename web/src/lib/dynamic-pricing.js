/**
 * BanquetEase Dynamic Pricing Engine
 * Formula: Dynamic Price = Base Price × SF × DF × OF × ABF
 *
 * SF  – Seasonality Factor
 * DF  – Day-of-Week Factor
 * OF  – Occupancy Factor
 * ABF – Advance Booking Factor
 */

// ─── 1. Seasonality Factor (SF) ──────────────────────────────────────────────
// Month is 0-based (JS Date): 0=Jan … 11=Dec

const SEASON_BANDS = [
  // [startMonthInclusive, endMonthInclusive, label, multiplier]
  { months: [10, 1], label: 'Wedding Peak (Nov–Feb)', multiplier: 1.3 },   // Nov-Feb
  { months: [6, 7],  label: 'Monsoon Off-Season (Jul–Aug)', multiplier: 0.85 },
  { months: [4, 5],  label: 'Summer Slow (May–Jun)', multiplier: 0.85 },
];

/**
 * @param {Date} date
 * @returns {{ label: string, multiplier: number }}
 */
export function getSeasonalityFactor(date) {
  const m = date.getMonth(); // 0-indexed
  for (const band of SEASON_BANDS) {
    const [start, end] = band.months;
    const inRange = start > end
      ? (m >= start || m <= end)   // wraps year boundary (e.g. Nov–Feb)
      : (m >= start && m <= end);
    if (inRange) return { label: band.label, multiplier: band.multiplier };
  }
  return { label: 'Normal Season', multiplier: 1.0 };
}

// ─── 2. Day-of-Week Factor (DF) ───────────────────────────────────────────────
const DAY_MULTIPLIERS = [1.2, 0.9, 0.9, 0.9, 0.9, 1.1, 1.3];
//                       Sun   Mon  Tue  Wed  Thu   Fri  Sat
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * @param {Date} date
 * @returns {{ label: string, multiplier: number }}
 */
export function getDayOfWeekFactor(date) {
  const day = date.getDay(); // 0=Sun … 6=Sat
  return { label: DAY_LABELS[day], multiplier: DAY_MULTIPLIERS[day] };
}

// ─── 3. Occupancy Factor (OF) ─────────────────────────────────────────────────
/**
 * @param {number} occupancyPercent  0–100
 * @returns {{ label: string, multiplier: number }}
 */
export function getOccupancyFactor(occupancyPercent) {
  const pct = Math.min(100, Math.max(0, occupancyPercent));
  const multiplier = 1 + (pct / 100) * 0.5;
  const label =
    pct >= 80 ? 'High Demand' :
    pct >= 50 ? 'Moderate Demand' :
    'Low Demand';
  return { label: `${label} (${pct}% booked)`, multiplier: parseFloat(multiplier.toFixed(4)) };
}

// ─── 4. Advance Booking Factor (ABF) ─────────────────────────────────────────
/**
 * @param {number} daysBeforeEvent
 * @returns {{ label: string, multiplier: number }}
 */
export function getAdvanceBookingFactor(daysBeforeEvent) {
  if (daysBeforeEvent > 120) return { label: 'Early Bird (>120 days)', multiplier: 0.9 };
  if (daysBeforeEvent >= 60)  return { label: 'Standard (60–120 days)', multiplier: 1.0 };
  if (daysBeforeEvent >= 30)  return { label: 'Short Notice (30–60 days)', multiplier: 1.1 };
  return { label: 'Last Minute (<30 days)', multiplier: 1.2 };
}

// ─── Master Calculator ────────────────────────────────────────────────────────
/**
 * Compute the full dynamic price breakdown.
 *
 * @param {{
 *   baseHallRent?: number,
 *   basePricePerPlate?: number,
 *   guestCount?: number,
 *   eventDate: Date,
 *   bookingDate?: Date,
 *   occupancyPercent?: number
 * }} params
 *
 * @returns {{
 *   basePrice: number,
 *   sf: { label: string, multiplier: number },
 *   df: { label: string, multiplier: number },
 *   of: { label: string, multiplier: number },
 *   abf: { label: string, multiplier: number },
 *   combinedMultiplier: number,
 *   dynamicPrice: number,
 *   breakdown: string,
 * }}
 */
export function calculateDynamicPrice({
  baseHallRent = 0,
  basePricePerPlate = 0,
  guestCount = 0,
  eventDate,
  bookingDate = new Date(),
  occupancyPercent = 50,
}) {
  const basePrice = baseHallRent + basePricePerPlate * guestCount;

  const sf  = getSeasonalityFactor(eventDate);
  const df  = getDayOfWeekFactor(eventDate);
  const of_  = getOccupancyFactor(occupancyPercent);
  const msUntilEvent = new Date(eventDate).getTime() - new Date(bookingDate).getTime();
  const daysAhead = Math.max(0, Math.floor(msUntilEvent / 86_400_000));
  const abf = getAdvanceBookingFactor(daysAhead);

  const combinedMultiplier = sf.multiplier * df.multiplier * of_.multiplier * abf.multiplier;
  const dynamicPrice = Math.round(basePrice * combinedMultiplier);

  const breakdown =
    `₹${basePrice.toLocaleString('en-IN')} × ${sf.multiplier} (SF) × ${df.multiplier} (DF) × ${of_.multiplier.toFixed(2)} (OF) × ${abf.multiplier} (ABF)`;

  return {
    basePrice,
    sf,
    df,
    of: of_,
    abf,
    daysAhead,
    combinedMultiplier: parseFloat(combinedMultiplier.toFixed(4)),
    dynamicPrice,
    breakdown,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const SEASONALITY_TABLE = [
  { season: 'Wedding Peak (Nov–Feb)', months: 'Nov – Feb', multiplier: 1.3 },
  { season: 'Normal Season',          months: 'Mar, Sep, Oct', multiplier: 1.0 },
  { season: 'Summer Slow',            months: 'May – Jun', multiplier: 0.85 },
  { season: 'Monsoon Off-Season',     months: 'Jul – Aug', multiplier: 0.85 },
];

export const DAY_FACTOR_TABLE = [
  { day: 'Monday – Thursday', multiplier: 0.9 },
  { day: 'Friday',            multiplier: 1.1 },
  { day: 'Saturday',          multiplier: 1.3 },
  { day: 'Sunday',            multiplier: 1.2 },
];

export const ADVANCE_BOOKING_TABLE = [
  { range: '> 120 days before', multiplier: 0.9,  label: 'Early Bird Discount' },
  { range: '60 – 120 days',     multiplier: 1.0,  label: 'Standard Rate' },
  { range: '30 – 60 days',      multiplier: 1.1,  label: 'Short Notice' },
  { range: '< 30 days',         multiplier: 1.2,  label: 'Last-Minute Premium' },
];

/** Format number to Indian Rupee string */
export function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}
