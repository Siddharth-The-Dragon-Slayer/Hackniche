'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BackToTop from '@/components/layout/BackToTop';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile Header Bar */}
      <div className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-h)', cursor: 'pointer', padding: 8 }}
        >
          <Menu size={24} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)' }}>BanquetOS</span>
        <div style={{ width: 40 }} />
      </div>

      <main className="dashboard-main">
        {children}
      </main>
      <BackToTop />
    </div>
  );
}
