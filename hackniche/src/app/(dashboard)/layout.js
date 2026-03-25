"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import BackToTop from "@/components/layout/BackToTop";
import LanguageSelector from "@/components/ui/LanguageSelector";
import OfflineBanner from "@/components/shared/OfflineBanner";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { initSyncManager } from "@/lib/sync-manager";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  // Initialise offline sync once the user profile is available
  useEffect(() => {
    if (!user) return;
    initSyncManager({
      franchiseId: user.franchise_id ?? user.franchiseId,
      branchId: user.branch_id ?? user.branchId,
    });
  }, [user]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  }, [pathname]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const isMobile = window.innerWidth <= 768;
        setSidebarOpen(!isMobile);
      };
      
      handleResize(); // Call once on mount
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <OfflineBanner />
      <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button
          onClick={() => setSidebarOpen(true)}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LanguageSelector />
        </div>
      </div>

      {/* Desktop toggle button — visible only when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className="sidebar-desktop-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      <main className={`dashboard-main${sidebarOpen ? "" : " sidebar-closed"}`}>
        {children}
      </main>
      <BackToTop />
    </div>
  );
}
