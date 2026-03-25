"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import Tabs from "@/components/ui/Tabs";
import Badge from "@/components/ui/Badge";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const STATUSES = ["All", "Upcoming", "In Progress", "Completed"];
const STATUS_VARIANT = {
  Completed: "green",
  "In Progress": "primary",
  Upcoming: "accent",
};
const VARIANT_MAP = {
  completed: "green",
  "in progress": "primary",
  upcoming: "accent",
};

export default function EventsPage() {
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || "pfd";
  const bid = userProfile?.branch_id || "pfd_b1";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  const fetch_ = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const r = await fetch(
          `/api/events?franchise_id=${fid}&branch_id=${bid}`,
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setEvents(d.events || []);
      } catch (e) {
        if (!silent) setError(e.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [fid, bid],
  );

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  // Auto-poll every 30s
  useEffect(() => {
    const id = setInterval(() => fetch_(true), 30_000);
    return () => clearInterval(id);
  }, [fetch_]);

  // Normalize status strings for robust matching (handles case/whitespace/underscores)
  const normalizeKey = (v) =>
    (v || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const normalizedEvents = events.map((e) => ({
    ...e,
    _statusKey: normalizeKey(e.status),
  }));
  const activeKey = normalizeKey(activeTab);
  const filtered =
    activeKey === "all"
      ? normalizedEvents
      : normalizedEvents.filter((e) => e._statusKey === activeKey);
  const tabs = STATUSES.map((s) => {
    const key = normalizeKey(s);
    return {
      key: s,
      label: s,
      count:
        key === "all"
          ? normalizedEvents.length
          : normalizedEvents.filter((e) => e._statusKey === key).length,
    };
  });

  const totalCount = normalizedEvents.length;
  const upcomingCount = normalizedEvents.filter(
    (e) => e._statusKey === normalizeKey("Upcoming"),
  ).length;
  const inProgressCount = normalizedEvents.filter(
    (e) => e._statusKey === normalizeKey("In Progress"),
  ).length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div
        variants={fadeUp}
        className="page-header"
        style={{ marginBottom: 24 }}
      >
        <div className="page-header-left">
          <h1>Events</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {loading
              ? "Loading…"
              : `${totalCount} total · ${upcomingCount} upcoming · ${inProgressCount} in progress`}
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={fetch_}
            disabled={loading}
            style={{ textDecoration: "none" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link
            href="/calendar"
            className="btn btn-outline btn-sm"
            style={{ textDecoration: "none" }}
          >
            <Calendar size={14} /> Calendar View
          </Link>
        </div>
      </motion.div>

      {error && (
        <motion.div
          variants={fadeUp}
          style={{
            padding: 16,
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            marginBottom: 24,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <AlertCircle size={20} style={{ color: "#dc2626", flexShrink: 0 }} />
          <div style={{ color: "#991b1b" }}>{error}</div>
        </motion.div>
      )}

      {loading ? (
        <motion.div
          variants={fadeUp}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <Loader2
            size={20}
            style={{
              color: "var(--color-primary)",
              animation: "spin 1s linear infinite",
            }}
          />
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp}>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
          >
            {filtered.map((e, i) => (
              <motion.div
                key={e.id}
                variants={fadeUp}
                custom={i}
                className="card"
                style={{
                  padding: 24,
                  cursor: "pointer",
                  visibility: "visible",
                  opacity: 1,
                }}
                onClick={() => (window.location.href = `/events/${e.id}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {e.name || "Unnamed Event"}
                  </h3>
                  <Badge variant={VARIANT_MAP[e._statusKey] || "neutral"}>
                    {e.status || "—"}
                  </Badge>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Hall
                    </div>
                    <div style={{ fontSize: 14, color: "var(--color-text-h)" }}>
                      {e.hall}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Date
                    </div>
                    <div style={{ fontSize: 14, color: "var(--color-text-h)" }}>
                      {e.date
                        ? new Date(e.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Guests
                    </div>
                    <div style={{ fontSize: 14, color: "var(--color-text-h)" }}>
                      {e.guests}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Staff
                    </div>
                    <div style={{ fontSize: 14, color: "var(--color-text-h)" }}>
                      {e.staff} assigned
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    <span>
                      <CheckCircle2
                        size={12}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      Checklist Progress
                    </span>
                    <span>
                      {e.checklistDone || 0}/{e.checklistTotal || 0}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "var(--color-primary-ghost)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${e.checklistTotal ? ((e.checklistDone || 0) / e.checklistTotal) * 100 : 0}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3 + i * 0.05,
                        ease: "easeOut",
                      }}
                      style={{
                        height: "100%",
                        background: "var(--gradient-bar)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {!loading && filtered.length === 0 && (
            <motion.div
              variants={fadeUp}
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--color-text-muted)",
              }}
            >
              <p>No events found for the selected filter.</p>
            </motion.div>
          )}

          {!loading && events.length > 0 && filtered.length > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 12,
                padding: 12,
                background: "var(--color-surface-2)",
                borderRadius: 8,
              }}
            >
              Debug: {filtered.length} filtered events showing (out of{" "}
              {events.length} total)
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
