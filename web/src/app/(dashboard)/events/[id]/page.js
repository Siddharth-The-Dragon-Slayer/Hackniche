"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Circle,
  Users,
  Clock,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TABS = ["Overview", "Checklist", "Staff", "Vendors", "Decor", "Notes"];

const DEFAULT_CHECKLIST = [
  { item: "Venue prepared and inspected", done: false },
  { item: "Stage setup completed", done: false },
  { item: "Lighting rig installed", done: false },
  { item: "Sound system tested", done: false },
  { item: "Catering setup ready", done: false },
  { item: "Welcome table arranged", done: false },
  { item: "Staff briefed", done: false },
  { item: "Backup generator checked", done: false },
];

const VSTATUS = {
  Confirmed: { bg: "#dcfce7", color: "#15803d" },
  Pending: { bg: "#fef9c3", color: "#854d0e" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

function mapStatus(bookingStatus) {
  const statusMap = {
    confirmed: "Upcoming",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[bookingStatus] || "Upcoming";
}

export default function EventDetailPage({ params }) {
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || "pfd";
  const bid = userProfile?.branch_id || "pfd_b1";
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [tab, setTab] = useState("Overview");
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific booking/event by ID
        const res = await fetch(
          `/api/bookings/${eventId}?franchise_id=${fid}&branch_id=${bid}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Event not found');

        const booking = data.booking;

        if (!booking) {
          throw new Error("Event/Booking not found");
        }

        // Transform booking to event format
        const eventData = {
          id: booking.id,
          bookingId: booking.id,
          clientName: booking.customer_name,
          eventType: booking.event_type,
          eventDate: booking.event_date,
          startTime: booking.event_start_time || "10:00",
          endTime: booking.event_end_time || "23:00",
          hall: booking.hall_name || "—",
          branch: "Branch",
          guestCount: booking.expected_guest_count || 0,
          status: mapStatus(booking.status),
          coordinator: "Event Coordinator",
          decorTheme: "Standard Decor",
          menuName: booking.menu?.name || "Standard Menu",
          staff: [],
          vendors: [],
        };

        setEvent(eventData);
      } catch (e) {
        setError(e.message);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, fid, bid]);

  const toggle = (i) =>
    setChecklist((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c)),
    );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <Loader2
          size={20}
          style={{
            color: "var(--color-primary)",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: 24 }}>
        <Link
          href="/events"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 16,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
        <div
          style={{
            padding: 16,
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            display: "flex",
            gap: 12,
          }}
        >
          <AlertCircle size={20} style={{ color: "#dc2626", flexShrink: 0 }} />
          <div style={{ color: "#991b1b" }}>{error || "Event not found"}</div>
        </div>
      </div>
    );
  }

  const e = event;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link
            href="/events"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 8,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Back to Events
          </Link>
          <h1>{e.clientName}</h1>
          <p
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {e.eventType} &bull; {e.eventDate} &bull; {e.hall}
            <span
              style={{
                background: "#dbeafe",
                color: "#1d4ed8",
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {e.status}
            </span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/bookings/${e.bookingId}`} className="btn btn-ghost">
            View Booking
          </Link>
          <Link href={`/events/${eventId}/edit`} className="btn btn-ghost">
            <Edit size={15} /> Edit
          </Link>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          {
            label: "Guest Count",
            val: e.guestCount,
            icon: <Users size={16} />,
          },
          { label: "Start Time", val: e.startTime, icon: <Clock size={16} /> },
          { label: "End Time", val: e.endTime, icon: <Clock size={16} /> },
          {
            label: "Checklist",
            val: `${checklist.filter((c) => c.done).length}/${checklist.length}`,
          },
        ].map((k) => (
          <div key={k.label} className="card" style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              {k.val}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: tab === t ? 700 : 400,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom:
                tab === t
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              color:
                tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Event Details</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="form-label">Coordinator</span>
                  <span>{e.coordinator}</span>
                </div>
                <div className="info-item">
                  <span className="form-label">Booking ID</span>
                  <span>
                    <Link href={`/bookings/${e.bookingId}`}>{e.bookingId}</Link>
                  </span>
                </div>
                <div className="info-item">
                  <span className="form-label">Decor Theme</span>
                  <span>{e.decorTheme}</span>
                </div>
                <div className="info-item">
                  <span className="form-label">Menu</span>
                  <span>{e.menuName}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Checklist Progress</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color:
                    checklist.filter((c) => c.done).length === checklist.length
                      ? "#16a34a"
                      : "var(--color-text-h)",
                  marginBottom: 6,
                }}
              >
                {checklist.filter((c) => c.done).length}/{checklist.length}
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(checklist.filter((c) => c.done).length / checklist.length) * 100}%`,
                  }}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 12, width: "100%" }}
                onClick={() => setTab("Checklist")}
              >
                View Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "Checklist" && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Event Day Checklist</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {checklist.map((c, i) => (
              <div key={i} className="checklist-item" onClick={() => toggle(i)}>
                {c.done ? (
                  <CheckCircle
                    size={18}
                    style={{ color: "#16a34a", flexShrink: 0 }}
                  />
                ) : (
                  <Circle
                    size={18}
                    style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
                  />
                )}
                <span
                  style={{
                    fontSize: 14,
                    color: c.done
                      ? "var(--color-text-muted)"
                      : "var(--color-text-body)",
                    textDecoration: c.done ? "line-through" : "none",
                  }}
                >
                  {c.item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Staff" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Assigned Staff ({e.staff.length})
            </span>
            <button className="btn btn-primary" style={{ fontSize: 12 }}>
              + Assign Staff
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-surface-2)",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Name
                </th>
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Role
                </th>
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {e.staff.map((s, i) => (
                <tr
                  key={i}
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    fontSize: 14,
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                    {s.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-body)",
                    }}
                  >
                    {s.role}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {s.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Vendors" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Vendors ({e.vendors.length})
            </span>
            <button className="btn btn-primary" style={{ fontSize: 12 }}>
              + Assign Vendor
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-surface-2)",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Vendor
                </th>
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Category
                </th>
                <th style={{ padding: "10px 16px", textAlign: "left" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {e.vendors.map((v, i) => {
                const vs = VSTATUS[v.status] || {};
                return (
                  <tr
                    key={i}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      fontSize: 14,
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                      {v.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--color-text-body)",
                      }}
                    >
                      {v.category}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: vs.bg,
                          color: vs.color,
                          borderRadius: 20,
                          padding: "2px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Decor" && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Decor Theme</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {e.decorTheme}
          </p>
          <Link href="/decor" className="btn btn-ghost">
            Browse Decor Packages
          </Link>
        </div>
      )}

      {tab === "Notes" && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Event Notes</div>
          <textarea
            className="input"
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this event..."
            style={{ width: "100%", resize: "vertical" }}
          />
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary">Save Notes</button>
          </div>
        </div>
      )}
    </div>
  );
}
