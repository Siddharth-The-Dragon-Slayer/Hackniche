import { NextResponse } from "next/server";
import React from "react";
import QRCode from 'qrcode';
import {
  createWeddingQR,
  createBirthdayQR,
  createAnniversaryQR,
  createCorporateQR,
  createEngagementQR,
} from '@/lib/poster-qr-helper';

// ── font loader with module-level cache ───────────────────────────────────────
// satori supports: TTF / OTF / WOFF  — NOT WOFF2 (wOF2 signature = crash)
// Primary : jsDelivr @fontsource v4 .woff files (no CSS parsing, no encoding bugs)
// Fallback: Google Fonts CSS with old Android UA → gstatic TTF URLs
// Emergency: same Inter woff loaded under both font-family names
let _fonts = null;

// @fontsource v4 ships both .woff and .woff2; use .woff for satori compatibility
const FONT_URLS = {
  'Playfair Display': {
    700: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@4/files/playfair-display-latin-700-normal.woff',
    400: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@4/files/playfair-display-latin-400-normal.woff',
  },
  Raleway: {
    700: 'https://cdn.jsdelivr.net/npm/@fontsource/raleway@4/files/raleway-latin-700-normal.woff',
    400: 'https://cdn.jsdelivr.net/npm/@fontsource/raleway@4/files/raleway-latin-400-normal.woff',
  },
  Inter: {
    700: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4/files/inter-latin-700-normal.woff',
    400: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4/files/inter-latin-400-normal.woff',
  },
};

async function fetchFontBuffer(url) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.arrayBuffer();
}

// Fallback: scrape Google Fonts CSS with old Android UA → gstatic returns TTF (not woff2)
async function fetchFontFromGoogle(family, weight) {
  const encoded = family.replace(/ /g, '+');
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 2.2; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1' } }
  ).then(r => r.text());
  // old Android UA returns TTF URLs from gstatic
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(?:ttf|woff))\)/)
    || css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error(`Google Fonts CSS had no TTF/woff URL for ${family} ${weight}`);
  return fetchFontBuffer(match[1]);
}

async function loadOneFontBuffer(family, weight) {
  // 1. Try jsDelivr direct woff2
  try {
    const url = FONT_URLS[family]?.[weight];
    if (url) return await fetchFontBuffer(url);
  } catch (e) {
    console.warn(`jsDelivr failed for ${family} ${weight}:`, e.message);
  }
  // 2. Try Google Fonts CSS scrape
  try {
    return await fetchFontFromGoogle(family, weight);
  } catch (e) {
    console.warn(`Google Fonts failed for ${family} ${weight}:`, e.message);
  }
  // 3. Fallback to Inter from jsDelivr
  const fallbackUrl = FONT_URLS.Inter?.[weight] || FONT_URLS.Inter?.[400];
  console.warn(`Using Inter fallback for ${family} ${weight}`);
  return fetchFontBuffer(fallbackUrl);
}

async function loadFonts() {
  if (_fonts) return _fonts;

  const results = await Promise.allSettled([
    loadOneFontBuffer('Playfair Display', 700),
    loadOneFontBuffer('Playfair Display', 400),
    loadOneFontBuffer('Raleway', 700),
    loadOneFontBuffer('Raleway', 400),
  ]);

  const [playfairBold, playfairReg, ralewayBold, ralewayReg] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`Font slot ${i} failed entirely:`, r.reason);
    return null;
  });

  const fonts = [];
  if (playfairBold) fonts.push({ name: 'Playfair Display', data: playfairBold, weight: 700, style: 'normal' });
  if (playfairReg) fonts.push({ name: 'Playfair Display', data: playfairReg, weight: 400, style: 'normal' });
  if (ralewayBold) fonts.push({ name: 'Raleway', data: ralewayBold, weight: 700, style: 'normal' });
  if (ralewayReg) fonts.push({ name: 'Raleway', data: ralewayReg, weight: 400, style: 'normal' });

  // satori requires at least one font — if somehow all failed, load Inter directly
  if (fonts.length === 0) {
    console.error('All fonts failed — loading emergency Inter fallback');
    const interBold = await fetchFontBuffer(FONT_URLS.Inter[700]);
    const interReg = await fetchFontBuffer(FONT_URLS.Inter[400]);
    fonts.push({ name: 'Raleway', data: interBold, weight: 700, style: 'normal' });
    fonts.push({ name: 'Raleway', data: interReg, weight: 400, style: 'normal' });
    fonts.push({ name: 'Playfair Display', data: interBold, weight: 700, style: 'normal' });
    fonts.push({ name: 'Playfair Display', data: interReg, weight: 400, style: 'normal' });
  }

  _fonts = fonts;
  return _fonts;
}

// ── utility ───────────────────────────────────────────────────────────────────
const v = (val, fallback) =>
  val && String(val).trim() ? String(val).trim() : fallback;

// ── TEMPLATE: Wedding ─────────────────────────────────────────────────────────
function WeddingPoster({ f, qrCode }) {
  const bride = v(f.bride, "Priya Mehta");
  const groom = v(f.groom, "Arjun Kapoor");
  const date = v(f.weddingDate, "Sunday, April 27, 2026");
  const cTime = v(f.ceremonyTime, "11:00 AM");
  const rTime = v(f.receptionTime, "7:00 PM");
  const venue = v(f.venueName, "The Royal Orchid Palace");
  const addr = v(f.venueAddress, "Bengaluru");
  const rsvp = v(f.rsvpContact, "");
  const rsvpBy = v(f.rsvpDate, "");

  const gold = "#C9A84C";
  const darkGold = "#8B6914";
  const cream = "#FDF8EF";
  const ivoryDark = "#F5EDD8";

  return React.createElement(
    "div",
    {
      style: {
        width: 800,
        height: 1120,
        background: `linear-gradient(160deg, ${cream} 0%, #FFFDF7 40%, ${ivoryDark} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Raleway", sans-serif',
        padding: 0,
        position: "relative",
      },
    },
    /* Outer gold border frame */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 18,
        left: 18,
        right: 18,
        bottom: 18,
        border: `2.5px solid ${gold}`,
        borderRadius: 4,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 26,
        left: 26,
        right: 26,
        bottom: 26,
        border: `1px solid rgba(201,168,76,0.45)`,
        borderRadius: 2,
      },
    }),

    /* Corner ornaments */
    ...[
      "top:12;left:12",
      "top:12;right:12",
      "bottom:12;left:12",
      "bottom:12;right:12",
    ].map((pos, i) => {
      const p = Object.fromEntries(pos.split(";").map((s) => s.split(":")));
      return React.createElement("div", {
        key: i,
        style: {
          position: "absolute",
          ...Object.fromEntries(
            Object.entries(p).map(([k, v]) => [k, parseInt(v)]),
          ),
          width: 28,
          height: 28,
          borderTop: i < 2 ? `2.5px solid ${gold}` : "none",
          borderBottom: i >= 2 ? `2.5px solid ${gold}` : "none",
          borderLeft: i % 2 === 0 ? `2.5px solid ${gold}` : "none",
          borderRight: i % 2 === 1 ? `2.5px solid ${gold}` : "none",
        },
      });
    }),

    /* Content container */
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 72,
          paddingBottom: 60,
          paddingLeft: 60,
          paddingRight: 60,
          boxSizing: "border-box",
        },
      },
      /* "With Great Joy" */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: darkGold,
            marginBottom: 10,
            marginTop: 0,
          },
        },
        "WITH GREAT JOY",
      ),

      /* Thin divider */
      React.createElement("div", {
        style: {
          width: 120,
          height: 1.5,
          background: `linear-gradient(90deg, transparent,${gold},transparent)`,
          marginBottom: 18,
        },
      }),

      /* You Are Invited */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 46,
            fontWeight: 700,
            color: "#3A2A0A",
            textAlign: "center",
            marginBottom: 6,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        "You Are Invited",
      ),

      /* to the wedding of */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: darkGold,
            marginBottom: 26,
            marginTop: 0,
          },
        },
        "TO THE WEDDING OF",
      ),

      /* Divider with diamond */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 26,
            width: "100%",
            justifyContent: "center",
          },
        },
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${gold})`,
          },
        }),
        React.createElement("div", {
          style: {
            width: 10,
            height: 10,
            background: gold,
            transform: "rotate(45deg)",
          },
        }),
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${gold}, transparent)`,
          },
        }),
      ),

      /* Bride Name */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 52,
            fontWeight: 700,
            color: darkGold,
            textAlign: "center",
            marginBottom: 4,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        bride,
      ),

      /* & symbol */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 38,
            fontWeight: 400,
            color: gold,
            textAlign: "center",
            marginBottom: 4,
            marginTop: 0,
          },
        },
        "&",
      ),

      /* Groom Name */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 52,
            fontWeight: 700,
            color: darkGold,
            textAlign: "center",
            marginBottom: 30,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        groom,
      ),

      /* Divider with diamond */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 36,
            width: "100%",
            justifyContent: "center",
          },
        },
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${gold})`,
          },
        }),
        React.createElement("div", {
          style: {
            width: 10,
            height: 10,
            background: gold,
            transform: "rotate(45deg)",
          },
        }),
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${gold}, transparent)`,
          },
        }),
      ),

      /* Date block */
      React.createElement('div', { style: { background: `rgba(201,168,76,0.08)`, border: `1px solid rgba(201,168,76,0.35)`, borderRadius: 8, padding: '16px 40px', marginBottom: 22, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: darkGold, marginBottom: 6, marginTop: 0 } }, 'DATE & TIME'),
        React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 22, fontWeight: 700, color: '#3A2A0A', textAlign: 'center', marginBottom: 4, marginTop: 0 } }, date),
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 14, fontWeight: 400, color: '#5A4A2A', textAlign: 'center', marginBottom: 0, marginTop: 0 } }, `Ceremony: ${cTime}  ·  Reception: ${rTime}`),
      ),

      /* Venue block */
      React.createElement('div', { style: { textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: darkGold, marginBottom: 6, marginTop: 0 } }, 'VENUE'),
        React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 26, fontWeight: 700, color: '#3A2A0A', textAlign: 'center', marginBottom: 4, marginTop: 0 } }, venue),
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 14, fontWeight: 400, color: '#7A6A4A', textAlign: 'center', marginBottom: 0, marginTop: 0 } }, addr),
      ),

      /* RSVP */
      rsvp &&
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          },
        },
        React.createElement("div", {
          style: { width: 40, height: 1, background: gold },
        }),
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Raleway"',
              fontSize: 13,
              fontWeight: 700,
              color: darkGold,
              textAlign: "center",
              marginBottom: 0,
              marginTop: 0,
              letterSpacing: 1,
            },
          },
          `RSVP${rsvpBy ? ` by ${rsvpBy}` : ""}: ${rsvp}`,
        ),
        React.createElement("div", {
          style: { width: 40, height: 1, background: gold },
        }),
      ),

      /* Bottom ornament */
      React.createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            paddingTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          },
        },
        React.createElement(
          "div",
          { style: { display: "flex", gap: 8, alignItems: "center" } },
          React.createElement("div", {
            style: {
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: gold,
            },
          }),
          React.createElement("div", {
            style: {
              width: 10,
              height: 10,
              background: gold,
              transform: "rotate(45deg)",
            },
          }),
          React.createElement("div", {
            style: {
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: gold,
            },
          }),
        ),
      ),
    ),

    // QR Code for guest check-in
    qrCode && createWeddingQR(qrCode),
  );
}

// ── TEMPLATE: Birthday ────────────────────────────────────────────────────────
function BirthdayPoster({ f, qrCode }) {
  const name = v(f.guestName, "Rahul Sharma");
  const age = v(f.age, "");
  const hostedBy = v(f.hostName, "The Sharma Family");
  const date = v(f.eventDate, "Saturday, March 15, 2026");
  const time = v(f.eventTime, "7:00 PM");
  const venue = v(f.venueName, "Grand Celebration Hall");
  const addr = v(f.venueAddress, "Bengaluru");
  const rsvp = v(f.rsvpContact, "");
  const rsvpBy = v(f.rsvpDate, "");

  const gold = "#FFD700";
  const lightGold = "#FFF0A0";
  const purple = "#2D0C5E";
  const midPurple = "#4A1A8A";

  return React.createElement(
    "div",
    {
      style: {
        width: 800,
        height: 1120,
        background: `linear-gradient(160deg, #1A082E 0%, ${purple} 45%, #200A3A 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Raleway", sans-serif',
        position: "relative",
      },
    },
    /* Gold top accent bar */
    React.createElement("div", {
      style: {
        width: "100%",
        height: 6,
        background: `linear-gradient(90deg, ${purple}, ${gold}, ${purple})`,
      },
    }),
    /* Gold bottom accent bar */
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        background: `linear-gradient(90deg, ${purple}, ${gold}, ${purple})`,
      },
    }),

    /* Side border */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 30,
        left: 22,
        bottom: 30,
        width: 2,
        background: `linear-gradient(180deg, transparent, ${gold}, transparent)`,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 30,
        right: 22,
        bottom: 30,
        width: 2,
        background: `linear-gradient(180deg, transparent, ${gold}, transparent)`,
      },
    }),

    /* Star pattern circles (decorative) */
    ...Array.from({ length: 8 }).map((_, i) =>
      React.createElement("div", {
        key: `star${i}`,
        style: {
          position: "absolute",
          width: [6, 4, 5, 3, 7, 4, 5, 6][i],
          height: [6, 4, 5, 3, 7, 4, 5, 6][i],
          borderRadius: "50%",
          background: gold,
          opacity: [0.6, 0.4, 0.5, 0.3, 0.7, 0.4, 0.5, 0.55][i],
          top: [60, 120, 900, 1020, 80, 960, 180, 840][i],
          left: [60, 700, 80, 700, 720, 50, 740, 720][i],
        },
      }),
    ),

    /* Content */
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 70,
          paddingBottom: 60,
          paddingLeft: 70,
          paddingRight: 70,
          boxSizing: "border-box",
          width: "100%",
        },
      },
      /* "You're Invited To" */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: gold,
            marginBottom: 8,
            marginTop: 0,
          },
        },
        "YOU'RE INVITED TO CELEBRATE",
      ),

      /* Gold divider */
      React.createElement("div", {
        style: { width: 100, height: 2, background: gold, marginBottom: 24 },
      }),

      /* 🎂 emoji area */
      React.createElement(
        "div",
        { style: { fontSize: 72, marginBottom: 20 } },
        "🎂",
      ),

      /* Heading */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 38,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 8,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        age ? `A ${age}th Birthday` : "A Birthday Celebration",
      ),

      /* Name */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 58,
            fontWeight: 700,
            color: gold,
            textAlign: "center",
            marginBottom: 6,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        name,
      ),

      /* Gold strip line */
      React.createElement("div", {
        style: {
          width: 200,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
          marginBottom: 8,
        },
      }),

      /* Hosted by */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 15,
            fontWeight: 400,
            color: lightGold,
            textAlign: "center",
            marginBottom: 40,
            marginTop: 0,
          },
        },
        `Hosted by ${hostedBy}`,
      ),

      /* Details card */
      React.createElement('div', { style: { background: 'rgba(255,215,0,0.07)', border: `1px solid rgba(255,215,0,0.3)`, borderRadius: 12, padding: '28px 44px', width: '100%', boxSizing: 'border-box', marginBottom: 28, display: 'flex', flexDirection: 'column' } },
        /* Date */
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 18, gap: 14 } },
          React.createElement('div', { style: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,215,0,0.15)', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 } }, '📅'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: gold, marginBottom: 3, marginTop: 0 } }, 'DATE'),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 0, marginTop: 0 } }, date),
          )
        ),
        /* Time */
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 18, gap: 14 } },
          React.createElement('div', { style: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,215,0,0.15)', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 } }, '🕖'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: gold, marginBottom: 3, marginTop: 0 } }, 'TIME'),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 0, marginTop: 0 } }, time),
          )
        ),
        /* Venue */
        React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 14 } },
          React.createElement('div', { style: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,215,0,0.15)', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, '📍'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: gold, marginBottom: 3, marginTop: 0 } }, 'VENUE'),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 3, marginTop: 0 } }, venue),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 400, color: '#C0A8E0', marginBottom: 0, marginTop: 0 } }, addr),
          )
        ),
      ),

      rsvp &&
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 600,
            color: lightGold,
            textAlign: "center",
            marginBottom: 0,
            marginTop: 0,
          },
        },
        `RSVP${rsvpBy ? ` by ${rsvpBy}` : ""}: ${rsvp}`,
      ),

      React.createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            paddingTop: 24,
            display: "flex",
            gap: 10,
            alignItems: "center",
          },
        },
        React.createElement("div", {
          style: {
            width: 6,
            height: 6,
            background: gold,
            transform: "rotate(45deg)",
          },
        }),
        React.createElement("div", {
          style: { width: 60, height: 1, background: gold },
        }),
        React.createElement("div", { style: { fontSize: 20 } }, "🎉"),
        React.createElement("div", {
          style: { width: 60, height: 1, background: gold },
        }),
        React.createElement("div", {
          style: {
            width: 6,
            height: 6,
            background: gold,
            transform: "rotate(45deg)",
          },
        }),
      ),
    ),

    // QR Code for guest check-in
    qrCode && createBirthdayQR(qrCode),
  );
}

// ── TEMPLATE: Anniversary ─────────────────────────────────────────────────────
function AnniversaryPoster({ f, qrCode }) {
  const couple = v(f.coupleName, "Ramesh & Sunita");
  const years = v(f.years, "25");
  const label = v(f.yearsLabel, "Silver Jubilee");
  const hostedBy = v(f.hostName, "The Kapoor Children");
  const date = v(f.eventDate, "Friday, May 8, 2026");
  const time = v(f.eventTime, "6:30 PM");
  const venue = v(f.venueName, "Taj Falaknuma Palace");
  const addr = v(f.venueAddress, "Hyderabad");
  const rsvp = v(f.rsvpContact, "");
  const rsvpBy = v(f.rsvpDate, "");

  const bronze = "#B87333";
  const amber = "#D4A843";
  const warmCream = "#FDF5E8";
  const darkBrown = "#3A2010";

  return React.createElement(
    "div",
    {
      style: {
        width: 800,
        height: 1120,
        background: `linear-gradient(160deg, ${warmCream} 0%, #FFFBF0 50%, #FDF0D8 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Raleway", sans-serif',
        position: "relative",
      },
    },
    /* Outer border */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 18,
        left: 18,
        right: 18,
        bottom: 18,
        border: `2.5px solid ${bronze}`,
        borderRadius: 4,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 28,
        left: 28,
        right: 28,
        bottom: 28,
        border: `1px solid rgba(184,115,51,0.3)`,
        borderRadius: 2,
      },
    }),

    /* Amber top accent */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 18,
        left: 18,
        right: 18,
        height: 6,
        background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 18,
        left: 18,
        right: 18,
        height: 6,
        background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
      },
    }),

    /* Content */
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 68,
          paddingBottom: 60,
          paddingLeft: 60,
          paddingRight: 60,
          boxSizing: "border-box",
          width: "100%",
        },
      },
      /* Big milestone circle */
      React.createElement(
        "div",
        {
          style: {
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "transparent",
            border: `3px solid ${bronze}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          },
        },
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Playfair Display"',
              fontSize: 48,
              fontWeight: 700,
              color: bronze,
              marginBottom: 0,
              marginTop: 0,
              lineHeight: 1,
            },
          },
          years,
        ),
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Raleway"',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: amber,
              marginBottom: 0,
              marginTop: 2,
            },
          },
          "YEARS",
        ),
      ),

      /* Label */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: bronze,
            marginBottom: 6,
            marginTop: 0,
          },
        },
        label || "ANNIVERSARY CELEBRATION",
      ),

      /* Divider */
      React.createElement("div", {
        style: {
          width: 120,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
          marginBottom: 24,
        },
      }),

      /* Celebrating */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8B6030",
            marginBottom: 16,
            marginTop: 0,
          },
        },
        "CELEBRATING",
      ),

      /* Couple Name */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 50,
            fontWeight: 700,
            color: darkBrown,
            textAlign: "center",
            marginBottom: 10,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        couple,
      ),

      /* Gold diamond row */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          },
        },
        React.createElement("div", {
          style: {
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${bronze})`,
          },
        }),
        React.createElement("div", { style: { fontSize: 22 } }, "🌹"),
        React.createElement("div", {
          style: {
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, ${bronze}, transparent)`,
          },
        }),
      ),

      /* "Together for X years" */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 16,
            fontWeight: 400,
            color: "#7A5A30",
            textAlign: "center",
            marginBottom: 28,
            marginTop: 6,
          },
        },
        `A journey of ${years} beautiful years together`,
      ),

      /* Hosted by */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            color: "#8B6030",
            textAlign: "center",
            marginBottom: 28,
            marginTop: 0,
          },
        },
        `Hosted by ${hostedBy}`,
      ),

      /* Details box */
      React.createElement('div', { style: { background: `rgba(184,115,51,0.07)`, border: `1px solid rgba(184,115,51,0.3)`, borderRadius: 10, padding: '22px 40px', width: '100%', boxSizing: 'border-box', marginBottom: 24 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 16 } },
          React.createElement('div', { style: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: bronze, marginBottom: 5, marginTop: 0 } }, 'DATE'),
            React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 17, fontWeight: 700, color: darkBrown, textAlign: 'center', marginBottom: 0, marginTop: 0 } }, date),
          ),
          React.createElement('div', { style: { width: 1, background: `rgba(184,115,51,0.3)` } }),
          React.createElement('div', { style: { textAlign: 'center', flex: 0, minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: bronze, marginBottom: 5, marginTop: 0 } }, 'TIME'),
            React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 17, fontWeight: 700, color: darkBrown, textAlign: 'center', marginBottom: 0, marginTop: 0 } }, time),
          ),
        ),
        React.createElement('div', { style: { height: 1, background: `rgba(184,115,51,0.2)`, marginBottom: 16 } }),
        React.createElement('div', { style: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
          React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: bronze, marginBottom: 5, marginTop: 0 } }, 'VENUE'),
          React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 20, fontWeight: 700, color: darkBrown, textAlign: 'center', marginBottom: 4, marginTop: 0 } }, venue),
          React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 400, color: '#8B6030', textAlign: 'center', marginBottom: 0, marginTop: 0 } }, addr),
        ),
      ),

      rsvp &&
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 600,
            color: bronze,
            textAlign: "center",
            marginBottom: 0,
            marginTop: 0,
          },
        },
        `RSVP${rsvpBy ? ` by ${rsvpBy}` : ""}: ${rsvp}`,
      ),

      React.createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            paddingTop: 20,
            display: "flex",
            gap: 8,
            alignItems: "center",
          },
        },
        React.createElement("div", {
          style: {
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: amber,
          },
        }),
        React.createElement("div", {
          style: {
            width: 6,
            height: 6,
            background: amber,
            transform: "rotate(45deg)",
          },
        }),
        React.createElement("div", {
          style: {
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: amber,
          },
        }),
      ),
    ),

    // QR Code for guest check-in
    qrCode && createAnniversaryQR(qrCode),
  );
}

// ── TEMPLATE: Corporate ───────────────────────────────────────────────────────
function CorporatePoster({ f, qrCode }) {
  const title = v(f.eventTitle, "Annual Leadership Summit");
  const company = v(f.companyName, "Nexus Technologies");
  const speaker = v(f.speakerName, "");
  const theme = v(f.theme, "Innovate Beyond Boundaries");
  const date = v(f.eventDate, "Wednesday, June 10, 2026");
  const time = v(f.eventTime, "9:00 AM");
  const venue = v(f.venueName, "Hyderabad International Convention Centre");
  const addr = v(f.venueAddress, "Hyderabad");
  const regLink = v(f.registrationLink, "");
  const email = v(f.contactEmail, "");

  const blue = "#3B82F6";
  const lightBlue = "#60A5FA";
  const navy = "#0F172A";
  const darkNavy = "#060D1E";
  const silver = "#CBD5E1";

  return React.createElement(
    "div",
    {
      style: {
        width: 800,
        height: 1120,
        background: `linear-gradient(160deg, ${darkNavy} 0%, ${navy} 50%, #0D1F3A 100%)`,
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Raleway", sans-serif',
        position: "relative",
      },
    },
    /* Top accent bar */
    React.createElement("div", {
      style: {
        width: "100%",
        height: 5,
        background: `linear-gradient(90deg, ${blue}, ${lightBlue}, ${blue})`,
      },
    }),

    /* Left vertical accent */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 60,
        left: 44,
        bottom: 60,
        width: 3,
        background: `linear-gradient(180deg, transparent, ${blue}, transparent)`,
      },
    }),

    /* Grid pattern overlay (dots) */
    ...Array.from({ length: 12 }).map((_, i) =>
      React.createElement("div", {
        key: `dot${i}`,
        style: {
          position: "absolute",
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: lightBlue,
          opacity: 0.15,
          top: 40 + Math.floor(i / 4) * 340,
          right: 44 + (i % 4) * 80,
        },
      }),
    ),

    /* Content */
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          paddingTop: 60,
          paddingBottom: 60,
          paddingLeft: 80,
          paddingRight: 60,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
        },
      },
      /* Company name */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: lightBlue,
            marginBottom: 10,
            marginTop: 0,
          },
        },
        company,
      ),

      /* Thin divider line */
      React.createElement("div", {
        style: { width: 60, height: 2.5, background: blue, marginBottom: 28 },
      }),

      /* invites you to */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            color: silver,
            marginBottom: 16,
            marginTop: 0,
          },
        },
        "CORDIALLY INVITES YOU TO",
      ),

      /* Event Title */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 46,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 16,
            marginTop: 0,
            lineHeight: 1.2,
            maxWidth: 580,
          },
        },
        title,
      ),

      /* Theme/Tagline */
      theme &&
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          },
        },
        React.createElement("div", {
          style: {
            width: 3,
            height: 28,
            background: blue,
            borderRadius: 2,
            flexShrink: 0,
          },
        }),
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Raleway"',
              fontSize: 16,
              fontWeight: 400,
              color: lightBlue,
              marginBottom: 0,
              marginTop: 0,
              fontStyle: "italic",
            },
          },
          `"${theme}"`,
        ),
      ),

      /* Speaker highlight */
      speaker && React.createElement('div', { style: { background: 'rgba(59,130,246,0.1)', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 10, padding: '16px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 } },
        React.createElement('div', { style: { width: 48, height: 48, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', border: `2px solid ${blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 } }, '🎤'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
          React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: lightBlue, marginBottom: 4, marginTop: 0 } }, 'FEATURED SPEAKER'),
          React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 22, fontWeight: 700, color: '#FFFFFF', marginBottom: 0, marginTop: 0 } }, speaker),
        )
      ),

      /* Details grid */
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 } },
        React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
          React.createElement('div', { style: { width: 40, height: 40, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: `1px solid rgba(59,130,246,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, '📅'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: lightBlue, marginBottom: 3, marginTop: 0 } }, 'DATE & TIME'),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 0, marginTop: 0 } }, `${date}  |  ${time}`),
          )
        ),
        React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
          React.createElement('div', { style: { width: 40, height: 40, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: `1px solid rgba(59,130,246,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 } }, '📍'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: lightBlue, marginBottom: 3, marginTop: 0 } }, 'VENUE'),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 3, marginTop: 0 } }, venue),
            React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 400, color: silver, marginBottom: 0, marginTop: 0 } }, addr),
          )
        ),
      ),

      /* Registration / Contact */
      (regLink || email) && React.createElement('div', { style: { background: 'rgba(59,130,246,0.07)', border: `1px solid rgba(59,130,246,0.25)`, borderRadius: 8, padding: '14px 22px', marginBottom: 16, display: 'flex', flexDirection: 'column' } },
        regLink && React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 600, color: lightBlue, marginBottom: email ? 6 : 0, marginTop: 0 } }, `Register: ${regLink}`),
        email && React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 400, color: silver, marginBottom: 0, marginTop: 0 } }, `Contact: ${email}`),
      ),

      React.createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          },
        },
        React.createElement("div", {
          style: { width: 30, height: 1, background: blue },
        }),
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Raleway"',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: silver,
              marginBottom: 0,
              marginTop: 0,
            },
          },
          "LOOKING FORWARD TO SEEING YOU",
        ),
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${blue}, transparent)`,
          },
        }),
      ),
    ),
  );
}

// ── TEMPLATE: Engagement ──────────────────────────────────────────────────────
function EngagementPoster({ f, qrCode }) {
  const p1 = v(f.partner1, "Aisha Khan");
  const p2 = v(f.partner2, "Rohan Verma");
  const hf1 = v(f.hostFamily1, "");
  const hf2 = v(f.hostFamily2, "");
  const date = v(f.eventDate, "Saturday, July 11, 2026");
  const time = v(f.eventTime, "5:00 PM");
  const venue = v(f.venueName, "The ITC Windsor");
  const addr = v(f.venueAddress, "Bengaluru");
  const rsvp = v(f.rsvpContact, "");
  const rsvpBy = v(f.rsvpDate, "");

  const rose = "#E8637A";
  const blush = "#FFF0F4";
  const champagne = "#C9957A";
  const pinkDeep = "#C23860";
  const pinkLight = "#F9B8C8";

  return React.createElement(
    "div",
    {
      style: {
        width: 800,
        height: 1120,
        background: `linear-gradient(160deg, ${blush} 0%, #FFFAFC 40%, #FFF0F7 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: '"Raleway", sans-serif',
        position: "relative",
      },
    },
    /* Outer frame */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 18,
        left: 18,
        right: 18,
        bottom: 18,
        border: `2px solid ${rose}`,
        borderRadius: 4,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 26,
        left: 26,
        right: 26,
        bottom: 26,
        border: `1px solid rgba(232,99,122,0.25)`,
        borderRadius: 2,
      },
    }),

    /* Top accent */
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 18,
        left: 18,
        right: 18,
        height: 5,
        background: `linear-gradient(90deg, transparent, ${rose}, transparent)`,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 18,
        left: 18,
        right: 18,
        height: 5,
        background: `linear-gradient(90deg, transparent, ${rose}, transparent)`,
      },
    }),

    /* Floating circles (decorative petals) */
    ...[
      [680, 60, 40],
      [720, 90, 30],
      [50, 70, 35],
      [80, 110, 25],
      [660, 980, 40],
      [700, 1010, 28],
      [40, 960, 36],
      [70, 1000, 22],
    ].map(([x, y, s], i) =>
      React.createElement("div", {
        key: `petal${i}`,
        style: {
          position: "absolute",
          left: x,
          top: y,
          width: s,
          height: s,
          borderRadius: "50%",
          background: rose,
          opacity: 0.07,
        },
      }),
    ),

    /* Content */
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 72,
          paddingBottom: 60,
          paddingLeft: 60,
          paddingRight: 60,
          boxSizing: "border-box",
          width: "100%",
        },
      },
      /* Diamond icon */
      React.createElement(
        "div",
        { style: { fontSize: 56, marginBottom: 14 } },
        "💍",
      ),

      /* They're engaged */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: rose,
            marginBottom: 8,
            marginTop: 0,
          },
        },
        "THEY'RE GETTING ENGAGED",
      ),

      /* Divider */
      React.createElement("div", {
        style: {
          width: 100,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${rose}, transparent)`,
          marginBottom: 28,
        },
      }),

      /* Partner 1 */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 54,
            fontWeight: 700,
            color: pinkDeep,
            textAlign: "center",
            marginBottom: 6,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        p1,
      ),

      /* & */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
            width: "80%",
          },
        },
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${rose})`,
          },
        }),
        React.createElement(
          "p",
          {
            style: {
              fontFamily: '"Playfair Display"',
              fontSize: 34,
              fontWeight: 400,
              color: rose,
              marginBottom: 0,
              marginTop: 0,
            },
          },
          "&",
        ),
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${rose}, transparent)`,
          },
        }),
      ),

      /* Partner 2 */
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Playfair Display"',
            fontSize: 54,
            fontWeight: 700,
            color: pinkDeep,
            textAlign: "center",
            marginBottom: 10,
            marginTop: 0,
            letterSpacing: 1,
          },
        },
        p2,
      ),

      /* Host families */
      (hf1 || hf2) &&
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 14,
            fontWeight: 400,
            color: "#A06070",
            textAlign: "center",
            marginBottom: 30,
            marginTop: 10,
          },
        },
        [hf1, hf2].filter(Boolean).join("  ·  "),
      ),

      /* Rose divider */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 30,
            width: "70%",
          },
        },
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${champagne})`,
          },
        }),
        React.createElement("div", { style: { fontSize: 18 } }, "🌸"),
        React.createElement("div", {
          style: {
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${champagne}, transparent)`,
          },
        }),
      ),

      /* Details box */
      React.createElement('div', { style: { background: `rgba(232,99,122,0.06)`, border: `1px solid rgba(232,99,122,0.25)`, borderRadius: 12, padding: '22px 44px', width: '100%', boxSizing: 'border-box', marginBottom: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' } },
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: rose, marginBottom: 6, marginTop: 0 } }, 'JOIN US'),
        React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 22, fontWeight: 700, color: pinkDeep, textAlign: 'center', marginBottom: 4, marginTop: 0 } }, date),
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 15, fontWeight: 400, color: '#9A6070', textAlign: 'center', marginBottom: 16, marginTop: 0 } }, time),
        React.createElement('div', { style: { height: 1, background: `rgba(232,99,122,0.2)`, marginBottom: 16 } }),
        React.createElement('p', { style: { fontFamily: '"Playfair Display"', fontSize: 22, fontWeight: 700, color: pinkDeep, textAlign: 'center', marginBottom: 4, marginTop: 0 } }, venue),
        React.createElement('p', { style: { fontFamily: '"Raleway"', fontSize: 13, fontWeight: 400, color: '#A07080', textAlign: 'center', marginBottom: 0, marginTop: 0 } }, addr),
      ),

      rsvp &&
      React.createElement(
        "p",
        {
          style: {
            fontFamily: '"Raleway"',
            fontSize: 13,
            fontWeight: 600,
            color: rose,
            textAlign: "center",
            marginBottom: 0,
            marginTop: 0,
          },
        },
        `RSVP${rsvpBy ? ` by ${rsvpBy}` : ""}: ${rsvp}`,
      ),

      React.createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            paddingTop: 20,
            display: "flex",
            gap: 8,
            alignItems: "center",
          },
        },
        React.createElement("div", {
          style: { width: 5, height: 5, borderRadius: "50%", background: rose },
        }),
        React.createElement("div", {
          style: {
            width: 8,
            height: 8,
            background: rose,
            transform: "rotate(45deg)",
          },
        }),
        React.createElement("div", {
          style: { width: 5, height: 5, borderRadius: "50%", background: rose },
        }),
      ),
    ),
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType = "wedding", formValues = {}, bookingId = null, includeQR = true } = body;

    // Generate QR code if bookingId provided
    let qrCodeDataURL = null;
    if (includeQR && bookingId) {
      try {
        const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/gre/check-in?booking=${bookingId}`;
        qrCodeDataURL = await QRCode.toDataURL(checkInUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 200,
          color: {
            dark: '#1a1a1a',
            light: '#FFFFFF',
          },
        });
      } catch (qrErr) {
        console.warn('QR generation failed:', qrErr);
      }
    }

    // Load fonts — loadFonts() never throws; always returns ≥1 font
    const fonts = await loadFonts();

    // Select template element with QR code
    const templateProps = { f: formValues, qrCode: qrCodeDataURL };
    let element;
    switch (eventType) {
      case "birthday":
        element = React.createElement(BirthdayPoster, templateProps);
        break;
      case "anniversary":
        element = React.createElement(AnniversaryPoster, templateProps);
        break;
      case "corporate":
        element = React.createElement(CorporatePoster, templateProps);
        break;
      case "engagement":
        element = React.createElement(EngagementPoster, templateProps);
        break;
      default:
        element = React.createElement(WeddingPoster, templateProps);
    }

    // Dynamically import optional renderer libraries (satori + resvg)
    let satoriFn;
    let ResvgCtor;
    try {
      satoriFn = (await import("satori")).default || (await import("satori"));
      const mod = await import("@resvg/resvg-js");
      ResvgCtor = mod.Resvg || mod.default || mod;
    } catch (impErr) {
      console.error(
        "Optional poster generation deps missing:",
        impErr.message || impErr,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Optional dependencies missing: install `satori` and `@resvg/resvg-js` to enable poster generation",
        },
        { status: 501 },
      );
    }

    // Render SVG via satori
    const svg = await satoriFn(element, {
      width: 800,
      height: 1120,
      fonts,
    });

    // Convert SVG → PNG using Resvg
    const resvg = new ResvgCtor(svg, {
      fitTo: { mode: "width", value: 800 },
    });
    const pngBuffer = resvg.render().asPng();
    const base64 = Buffer.from(pngBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      imageBase64: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    console.error("generate-poster error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Poster generation failed" },
      { status: 500 },
    );
  }
}
