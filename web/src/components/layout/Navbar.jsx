'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';

export default function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, userProfile, role, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing-page' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const ROLE_REDIRECTS = {
    super_admin: '/dashboard/platform',
    franchise_admin: '/dashboard/franchise',
    customer: '/dashboard/customer',
  };
  const dashboardHref = role ? (ROLE_REDIRECTS[role] || '/dashboard/branch') : '/login';

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 72, zIndex: 1000,
          background: scrolled ? 'var(--color-bg-nav)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          boxShadow: scrolled ? 'var(--shadow-nav)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-btn)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: 'var(--color-text-on-gold)',
          }}>B</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: 'var(--color-text-h)', letterSpacing: '-0.5px',
          }}>BanquetOS</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)', position: 'relative',
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-text-h)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
            >{link.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none',
              background: isDark ? 'linear-gradient(135deg, #E8B84B, #C9921A)' : 'rgba(123,28,28,0.12)',
              cursor: 'pointer', position: 'relative', padding: 0,
            }}
          >
            <span style={{ position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)', fontSize: 10 }}>🌙</span>
            <span style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', fontSize: 10 }}>☀️</span>
            <motion.div
              animate={{ x: isDark ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              style={{
                position: 'absolute', top: 2,
                width: 18, height: 18, borderRadius: '50%',
                background: isDark ? '#1A0A05' : '#7B1C1C',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>

          {user ? (
            <>
              <Link href={dashboardHref} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
              <button onClick={logout} className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Login</Link>
              <Link href="/signup" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--color-text-h)', cursor: 'pointer' }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: 320,
              background: 'var(--color-bg-card)', zIndex: 1001,
              padding: '80px 32px 32px', boxShadow: 'var(--shadow-modal)',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
          >
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-h)', fontFamily: 'var(--font-body)' }}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashboardHref} className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', marginTop: 16 }}>Dashboard</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-outline">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', marginTop: 16 }}>Login</Link>
                <Link href="/signup" className="btn btn-outline" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
