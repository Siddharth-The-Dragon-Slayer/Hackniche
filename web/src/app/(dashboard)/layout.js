"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BackToTop from "@/components/layout/BackToTop";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{ background: "none", border: "none", padding: 8 }}
        >
          <Menu size={24} />
        </button>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          BanquetEase
        </span>
        <div style={{ width: 40 }} />
      </div>
      <main className="dashboard-main">{children}</main>
      <BackToTop />
    </div>
  );
}
