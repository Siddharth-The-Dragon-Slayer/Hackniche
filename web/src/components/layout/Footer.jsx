import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, paddingBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--gradient-btn)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <Image src="/BanquetEase.png" alt="BanquetEase" width={36} height={36} style={{ objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' }}>BanquetEase</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.75, marginBottom: 20 }}>
              Multi-franchise banquet management platform. Streamline leads, bookings, events, and billing.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="social-icon"><Instagram size={14} /></div>
              <div className="social-icon"><Facebook size={14} /></div>
              <div className="social-icon"><Youtube size={14} /></div>
              <div className="social-icon"><Twitter size={14} /></div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/features" className="footer-link">Features</Link>
              <Link href="/pricing-page" className="footer-link">Pricing</Link>
              <Link href="/about" className="footer-link">About Us</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/login" className="footer-link">Login</Link>
              <Link href="/dashboard/branch" className="footer-link">Dashboard</Link>
              <Link href="/leads" className="footer-link">Lead Management</Link>
              <Link href="/bookings" className="footer-link">Bookings</Link>
              <Link href="/analytics" className="footer-link">Analytics</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: 0.75 }}>
                <Mail size={14} /> support@codinggurus.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: 0.75 }}>
                <Phone size={14} /> +91-9000000000
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: 0.75 }}>
                <MapPin size={14} /> Hyderabad, India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.12)',
          paddingTop: 24, paddingBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
          fontSize: 13, opacity: 0.6,
        }}>
          <span>© 2026 Coding Gurus. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
