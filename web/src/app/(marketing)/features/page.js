'use client';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/shared/SectionHeader';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Target, CalendarDays, BarChart3, Users, CreditCard, ChefHat, Palette, TrendingUp, MessageSquare, Shield, Zap, Globe, Star, Laptop, Settings, FileText, Bell, Clock, Database } from 'lucide-react';

const allFeatures = [
  { icon: <Target size={22} />, title: 'Lead Management', desc: 'Capture leads from 22+ sources including WhatsApp, Instagram, walk-in, and AI chatbot. 12-stage lifecycle tracking with AI-powered scoring (0-100) using Google Gemini. Smart follow-up suggestions with best channel and time recommendations.' },
  { icon: <CalendarDays size={22} />, title: 'Booking System', desc: 'Complete booking lifecycle from tentative to completed. Visual hall availability calendar with real-time conflict prevention. Multi-hall, multi-slot support with automatic price calculation including festival and season surcharges.' },
  { icon: <Users size={22} />, title: 'Event Management', desc: 'Day-of execution checklists with staff assignments. Vendor coordination and catering management. Real-time progress tracking with completion percentage. Post-event review collection via QR codes.' },
  { icon: <CreditCard size={22} />, title: 'Billing & Payments', desc: 'Automatic invoice generation with dynamic line items. Payment tracking with receipts. GST-compliant formatting with branch-specific details. PDF generation and delivery via email and WhatsApp.' },
  { icon: <ChefHat size={22} />, title: 'Kitchen & Inventory', desc: 'Raw material stock management with automatic low-stock alerts. Stock ledger with complete audit trail. Purchase order workflow from draft to delivery. Vendor-linked procurement.' },
  { icon: <Palette size={22} />, title: 'Decor Packages', desc: 'Visual decor package catalog with image galleries. Client-facing selection flow during booking. Add-ons and upgrades management. Customization notes per event.' },
  { icon: <TrendingUp size={22} />, title: 'Dynamic Pricing', desc: 'Rule-based pricing with festival surcharges, peak season multipliers, and day-of-week premiums. Visual calendar preview showing effective prices. Multiple hall and franchise-level rules.' },
  { icon: <BarChart3 size={22} />, title: 'Analytics & Reports', desc: '7 analytics tabs: Revenue, Bookings, Leads, Payments, Inventory, Events, and Staff. Export to CSV, Excel, and PDF. Date range filters and comparison periods.' },
  { icon: <MessageSquare size={22} />, title: 'Review System', desc: 'QR code-based review collection with multi-category rating. AI sentiment analysis and keyword extraction. Management responses with AI-suggested templates. Google review integration.' },
  { icon: <Shield size={22} />, title: 'RBAC Security', desc: '8 granular roles: Super Admin, Franchise Admin, Branch Manager, Accountant, Kitchen Manager, Sales Executive, Operations Staff, and Receptionist. Field-level permissions and temp staff with auto-expiring access.' },
  { icon: <Bell size={22} />, title: 'Notifications', desc: 'Multi-channel notifications via push (OneSignal), WhatsApp (WATI), and email (Resend). Configurable per-user preferences. Follow-up reminders, payment alerts, and booking confirmations.' },
  { icon: <Zap size={22} />, title: 'AI Features', desc: 'Lead scoring, smart follow-up suggestions, revenue forecasting, auto-generated proposals, sentiment analysis, menu recommendations, and dynamic pricing suggestions — all powered by Gemini API.' },
  { icon: <Globe size={22} />, title: 'Multi-Franchise', desc: '4-level hierarchy: Platform → Franchise → Branch → Hall. Franchise-level and branch-level settings. Cross-branch analytics and reporting for franchise admins.' },
  { icon: <Database size={22} />, title: 'Audit Logs', desc: 'Immutable audit trail for all operations. User action tracking with before/after snapshots. IP address logging. Filterable by entity type and user.' },
];

export default function FeaturesPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <section style={{ padding: '96px 32px 64px', background: 'var(--color-bg-alt)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>14 Modules</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>
            Every feature your banquet business needs
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            From lead capture to final payment, BanquetEase covers every aspect of venue management.
          </p>
        </motion.div>
      </section>

      {/* Features List */}
      <section className="section">
        <div className="container">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {allFeatures.map((f, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="card" style={{ padding: 32, display: 'flex', gap: 20 }}>
                <div className="card-icon" style={{ flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
