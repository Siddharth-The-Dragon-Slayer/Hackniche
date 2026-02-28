'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';

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

export default function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, userProfile, franchiseProfile, role, logout } = useAuth();

  // Use franchise logo when a franchise/branch user is logged in
  const isFranchiseUser = !!userProfile?.franchise_id;
  const logoSrc    = (isFranchiseUser && franchiseProfile?.logo_url) ? franchiseProfile.logo_url : '/BanquetEase.png';
  const brandName  = (isFranchiseUser && franchiseProfile?.name)    ? franchiseProfile.name    : 'BanquetEase';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const dashboardHref = role ? (ROLE_REDIRECTS[role] || '/dashboard/branch') : '/login';

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 70, zIndex: 1000,
          background: scrolled ? 'var(--color-bg-nav)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
          boxShadow: scrolled ? 'var(--shadow-nav)' : 'none',
          borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 40px)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-btn)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <Image src={logoSrc} alt={brandName} width={36} height={36} style={{ objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 700,
            color: 'var(--color-text-h)', letterSpacing: '-0.5px',
          }}>{brandName}</span>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navLinks.map((link, i) => (
            <motion.div key={link.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Link href={link.href} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-h)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >{link.label}</Link>
            </motion.div>
          ))}
        </div>

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          {user ? (
            <>
              <Link href={dashboardHref} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
              <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Login</Link>
              <Link href="/signup" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="mobile-menu-btn-wrap">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <motion.button onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}
            style={{ background: mobileOpen ? 'var(--color-primary-ghost)' : 'none', border: '1.5px solid', borderColor: mobileOpen ? 'var(--color-primary)' : 'transparent', borderRadius: 10, padding: 8, color: 'var(--color-text-h)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} /></motion.span>
                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={22} /></motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(85vw, 320px)', background: 'var(--color-bg-card)', zIndex: 1001, boxShadow: 'var(--shadow-modal)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--color-text-on-gold)' }}>B</div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)' }}>BanquetOS</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 500, color: 'var(--color-text-h)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-ghost)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >{link.label}</Link>
                </motion.div>
              ))}
            </div>
            <div style={{ padding: '16px 24px 32px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <>
                  <Link href={dashboardHref} className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', justifyContent: 'center' }}>Dashboard</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-outline">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', justifyContent: 'center' }}>Login</Link>
                  <Link href="/signup" className="btn btn-outline" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', justifyContent: 'center' }}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn-wrap { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn-wrap { display: none !important; }
        }
      `}</style>
    </>
  );
}

function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button onClick={onToggle} whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: isDark ? 'linear-gradient(135deg, #E8B84B, #C9921A)' : 'rgba(123,28,28,0.12)', cursor: 'pointer', position: 'relative', padding: 0, flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)', fontSize: 10 }}>🌙</span>
      <span style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', fontSize: 10 }}>☀️</span>
      <motion.div animate={{ x: isDark ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: isDark ? '#1A0A05' : '#7B1C1C', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
      />
    </motion.button>
  );
}
