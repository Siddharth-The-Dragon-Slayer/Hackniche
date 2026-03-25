"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  Users,
  Star,
  ChevronRight,
  Eye,
  X,
  CalendarPlus,
  Phone,
  Sparkles,
  Building2,
} from "lucide-react";

// Dynamic import — Three.js should only load client-side, skip SSR
const HallTour360 = dynamic(() => import("@/components/HallTour360"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: 500,
        borderRadius: 16,
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading 3D viewer…
    </div>
  ),
});

/* ── Hall data (expandable — add more halls here) ───────────────── */
const HALLS = [
  {
    id: "kalyan-west",
    name: "Kalyan West Grand Hall",
    location: "Kalyan West, Mumbai",
    panoramaUrl: "/panoramas/kalyan-west-hall.jpg",
    capacity: { seating: 350, floating: 600 },
    rating: 4.8,
    reviews: 124,
    priceRange: "₹1,50,000 – ₹3,50,000",
    features: [
      "Central AC",
      "Valet Parking",
      "In-house DJ",
      "Bridal Suite",
      "Stage & Lighting",
      "Projector",
    ],
    description:
      "A premium banquet hall in the heart of Kalyan West featuring elegant interiors, crystal chandeliers, and state-of-the-art sound systems. Perfect for weddings, receptions, and grand celebrations.",
    has360: true,
  },
  {
    id: "thane-royal",
    name: "Thane Royal Banquet",
    location: "Thane West, Mumbai",
    panoramaUrl: "/panoramas/kalyan-west-hall.jpg", // reuse for demo
    capacity: { seating: 250, floating: 400 },
    rating: 4.6,
    reviews: 89,
    priceRange: "₹1,00,000 – ₹2,50,000",
    features: [
      "AC Hall",
      "Parking",
      "DJ Console",
      "Green Room",
      "Stage",
      "Catering Kitchen",
    ],
    description:
      "An elegant venue in Thane offering a blend of modern amenities and classic charm. Ideal for intimate celebrations and mid-sized events.",
    has360: true,
  },
  {
    id: "navi-mumbai-pearl",
    name: "Navi Mumbai Pearl Hall",
    location: "Vashi, Navi Mumbai",
    panoramaUrl: "/panoramas/kalyan-west-hall.jpg", // reuse for demo
    capacity: { seating: 500, floating: 800 },
    rating: 4.9,
    reviews: 201,
    priceRange: "₹2,00,000 – ₹5,00,000",
    features: [
      "Central AC",
      "Valet Parking",
      "Multiple Halls",
      "Lawn Area",
      "Bridal Suite",
      "In-house Decor",
    ],
    description:
      "The largest and most luxurious venue in our network. Multiple interconnected halls and an outdoor lawn make it perfect for grand destination-style weddings.",
    has360: true,
  },
];

/* ── Hall card ──────────────────────────────────────────────────── */
function HallCard({ hall, onView360 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
      style={{ overflow: "hidden" }}
    >
      {/* Preview banner */}
      <div
        style={{
          height: 180,
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={() => onView360(hall)}
      >
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(212,175,55,0.15)",
              border: "2px solid rgba(212,175,55,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <Eye size={28} style={{ color: "#D4AF37" }} />
          </div>
          <span
            style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.5px" }}
          >
            View 360° Tour
          </span>
        </div>

        {/* Rating badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: 8,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#FFD700",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Star size={13} fill="#FFD700" />
          {hall.rating}
          <span
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 400 }}
          >
            ({hall.reviews})
          </span>
        </div>

        {/* 360 badge */}
        {hall.has360 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(212,175,55,0.9)",
              borderRadius: 8,
              padding: "4px 10px",
              color: "#000",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            360°
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 20 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 4,
            fontFamily: "var(--font-display)",
          }}
        >
          {hall.name}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "var(--color-text-muted)",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <MapPin size={13} />
          {hall.location}
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {hall.description}
        </p>

        {/* Quick stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "var(--color-primary-ghost)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 2,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Seating
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--color-text-h)",
              }}
            >
              {hall.capacity.seating}
            </div>
          </div>
          <div
            style={{
              background: "var(--color-primary-ghost)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 2,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Floating
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--color-text-h)",
              }}
            >
              {hall.capacity.floating}
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 16,
          }}
        >
          {hall.features.map((f) => (
            <span
              key={f}
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Price */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 2,
              }}
            >
              Price Range
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--color-text-h)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {hall.priceRange}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onView360(hall)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
              }}
            >
              <Eye size={14} /> 360° Tour
            </button>
            <Link
              href="/leads/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
              }}
            >
              <CalendarPlus size={14} /> Book Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 360 Modal ──────────────────────────────────────────────────── */
function Tour360Modal({ hall, onClose }) {
  if (!hall) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 2,
          }}
        >
          <div>
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
              }}
            >
              {hall.name}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              <MapPin
                size={12}
                style={{ display: "inline", marginRight: 4 }}
              />
              {hall.location}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/leads/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
              }}
            >
              <CalendarPlus size={14} /> Book This Hall
            </Link>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 360 Viewer */}
        <div style={{ flex: 1, position: "relative" }}>
          <HallTour360
            panoramaUrl={hall.panoramaUrl}
            hallName={hall.name}
            height="100%"
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            zIndex: 2,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
              <Users
                size={13}
                style={{ display: "inline", marginRight: 4 }}
              />
              {hall.capacity.seating} seating · {hall.capacity.floating}{" "}
              floating
            </div>
            <div style={{ color: "#FFD700", fontSize: 13, fontWeight: 600 }}>
              <Star
                size={13}
                fill="#FFD700"
                style={{ display: "inline", marginRight: 4 }}
              />
              {hall.rating} ({hall.reviews} reviews)
            </div>
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            {hall.priceRange}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function HallToursPage() {
  const [viewingHall, setViewingHall] = useState(null);

  return (
    <div>
      {/* Modal */}
      {viewingHall && (
        <Tour360Modal
          hall={viewingHall}
          onClose={() => setViewingHall(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-text-h)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Sparkles size={24} style={{ color: "var(--color-primary)" }} />
            360° Hall Tours
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Explore our banquet halls from every angle before booking
          </p>
        </div>
        <Link
          href="/leads/create"
          className="btn btn-primary"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CalendarPlus size={16} /> Book a Hall
        </Link>
      </div>

      {/* Featured: Kalyan West */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Building2 size={18} style={{ color: "var(--color-primary)" }} />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-text-h)",
            }}
          >
            Featured — Kalyan West Grand Hall
          </h2>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <HallTour360
            panoramaUrl="/panoramas/kalyan-west-hall.jpg"
            hallName="Kalyan West Grand Hall"
            height={480}
          />
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-h)",
                  marginBottom: 4,
                }}
              >
                Kalyan West Grand Hall
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MapPin size={13} /> Kalyan West, Mumbai ·{" "}
                <Users size={13} /> 350 seating / 600 floating ·{" "}
                <Star size={13} fill="#FFD700" style={{ color: "#FFD700" }} />{" "}
                4.8 (124 reviews)
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="tel:+919876543210"
                className="btn btn-ghost btn-sm"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <Phone size={14} /> Call Now
              </Link>
              <Link
                href="/leads/create"
                className="btn btn-primary"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CalendarPlus size={16} /> Book This Hall
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* All Halls Grid */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 16,
          }}
        >
          All Venues
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 24,
          marginBottom: 40,
        }}
      >
        {HALLS.map((hall) => (
          <HallCard
            key={hall.id}
            hall={hall}
            onView360={setViewingHall}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div
        className="card"
        style={{
          padding: "40px 32px",
          textAlign: "center",
          background: "var(--color-primary-ghost)",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--color-text-h)",
            marginBottom: 8,
          }}
        >
          Ready to Book Your Dream Venue?
        </h3>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 14,
            maxWidth: 460,
            margin: "0 auto 20px",
            lineHeight: 1.6,
          }}
        >
          Submit an enquiry and our team will help you plan the perfect event.
          We'll follow up with a personalised quote and available dates.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/leads/create"
            className="btn btn-primary"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CalendarPlus size={16} /> Submit Enquiry
          </Link>
          <Link
            href="tel:+919876543210"
            className="btn btn-ghost"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Phone size={16} /> Call Us
          </Link>
        </div>
      </div>
    </div>
  );
}
