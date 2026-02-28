"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import { sidebarMenus } from "@/lib/mock-data";
import { LogOut, X, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

/* ── Change-Password Modal ─────────────────────────────────────── */
function ChangePwdModal({ onClose }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    if (next !== confirm) {
      setErr("New passwords do not match.");
      return;
    }
    if (next.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (ex) {
      const code = ex.code || "";
      setErr(
        code === "auth/wrong-password" || code === "auth/invalid-credential"
          ? "Current password is incorrect."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Try again later."
            : ex.message || "Failed to change password.",
      );
    }
    setBusy(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          padding: 28,
          width: "100%",
          maxWidth: 400,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={18} />
        </button>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 4,
          }}
        >
          Change Password
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 20,
          }}
        >
          Enter your current password and choose a new one.
        </p>
        {done ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "var(--color-success, #27ae60)",
            }}
          >
            <CheckCircle2
              size={40}
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ fontWeight: 600 }}>Password updated successfully!</p>
          </div>
        ) : (
          <form
            onSubmit={handle}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(192,57,43,0.08)",
                  border: "1px solid rgba(192,57,43,0.2)",
                  color: "var(--color-danger)",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}
            {[
              {
                label: "Current Password",
                val: current,
                set: setCurrent,
                show: showCur,
                toggleShow: () => setShowCur((v) => !v),
              },
              {
                label: "New Password",
                val: next,
                set: setNext,
                show: showNew,
                toggleShow: () => setShowNew((v) => !v),
              },
              {
                label: "Confirm New Password",
                val: confirm,
                set: setConfirm,
                show: showNew,
                toggleShow: () => setShowNew((v) => !v),
              },
            ].map(({ label, val, set, show, toggleShow }, i) => (
              <div key={i}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={toggleShow}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      padding: 4,
                    }}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
              style={{ marginTop: 4 }}
            >
              {busy ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, userProfile, franchiseProfile, role, logout } = useAuth();
  const [showChangePwd, setShowChangePwd] = useState(false);
 

  const currentRole  = role || userProfile?.role || 'customer';
  const items        = sidebarMenus[currentRole] || sidebarMenus.customer;
  const displayName  = userProfile?.name || user?.displayName || 'User';

  // Franchise users see their franchise's logo/name; everyone else sees BanquetEase
  const isFranchiseUser = !!userProfile?.franchise_id;
  const logoSrc =
    isFranchiseUser && franchiseProfile?.logo_url
      ? franchiseProfile.logo_url
      : "/BanquetEase.png";
  const brandName =
    isFranchiseUser && franchiseProfile?.name
      ? franchiseProfile.name
      : "BanquetEase";

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      {/* Change Password Modal */}
      {showChangePwd && (
        <ChangePwdModal onClose={() => setShowChangePwd(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        {/* Close button (mobile only) */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Brand */}
        <Link
          href="/"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--gradient-btn)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image
              src={logoSrc}
              alt={brandName}
              width={32}
              height={32}
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text-h)",
              letterSpacing: "-0.3px",
            }}
          >
            {brandName}
          </span>
        </Link>

        {/* User Info */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--color-primary-ghost)",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--gradient-btn)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text-on-gold)",
                flexShrink: 0,
              }}
            >
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-h)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </div>
              <div
                className="badge badge-accent"
                style={{ fontSize: 9, padding: "2px 6px", marginTop: 2 }}
              >
                {currentRole.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        )}

        {/* Nav Items — scrollable region */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-item${isActive ? " active" : ""}`}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 12,
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 12,
              background: "var(--color-primary-ghost)",
              border: "none",
              color: "var(--color-text-body)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-body)",
            }}
          >
            {isDark ? "☀️" : "🌙"} {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          {user && (
            <button
              onClick={() => setShowChangePwd(true)}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 12,
                background: "var(--color-primary-ghost)",
                border: "none",
                color: "var(--color-text-body)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-body)",
              }}
            >
              <KeyRound size={15} /> Change Password
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                logout();
                onClose?.();
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(192,57,43,0.08)",
                border: "none",
                color: "var(--color-danger)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-body)",
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
