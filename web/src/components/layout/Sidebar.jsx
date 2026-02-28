'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';
import { sidebarMenus } from '@/lib/mock-data';
import { LogOut, X } from 'lucide-react';

export default function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, userProfile, franchiseProfile, role, logout } = useAuth();

  const currentRole  = role || 'branch_manager';
  const items        = sidebarMenus[currentRole] || sidebarMenus.branch_manager;
  const displayName  = userProfile?.name || user?.displayName || 'User';

  // Franchise users see their franchise's logo/name; everyone else sees BanquetEase
  const isFranchiseUser = !!userProfile?.franchise_id;
  const logoSrc   = (isFranchiseUser && franchiseProfile?.logo_url) ? franchiseProfile.logo_url : '/BanquetEase.png';
  const brandName = (isFranchiseUser && franchiseProfile?.name)    ? franchiseProfile.name    : 'BanquetEase';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Close button (mobile only) */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>

        {/* Brand */}
        <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--gradient-btn)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <Image src={logoSrc} alt={brandName} width={32} height={32} style={{ objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: 'var(--color-text-h)', letterSpacing: '-0.3px',
          }}>{brandName}</span>
        </Link>

        {/* User Info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--color-primary-ghost)', marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>{displayName[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div className="badge badge-accent" style={{ fontSize: 9, padding: '2px 6px', marginTop: 2 }}>{currentRole.replace(/_/g, ' ')}</div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {items.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`sidebar-item${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 12,
              background: 'var(--color-primary-ghost)', border: 'none',
              color: 'var(--color-text-body)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-body)',
            }}
          >
            {isDark ? '☀️' : '🌙'} {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {user && (
            <button
              onClick={() => { logout(); onClose?.(); }}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 12,
                background: 'rgba(192,57,43,0.08)', border: 'none',
                color: 'var(--color-danger)', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'var(--font-body)',
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
