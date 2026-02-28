'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  { name: 'Starter', price: '₹9,999', period: '/month', desc: 'Perfect for single-branch venues getting started.', features: ['1 Franchise', '2 Branches', '5 Staff accounts', 'Lead Management', 'Booking Calendar', 'Event Checklists', 'Basic Billing', 'Email Notifications', 'Basic Analytics', 'Email Support'], cta: 'Start Free Trial' },
  { name: 'Professional', price: '₹24,999', period: '/month', desc: 'For growing businesses with multiple branches.', features: ['1 Franchise', '5 Branches', '25 Staff accounts', 'Everything in Starter', 'AI Lead Scoring', 'Dynamic Pricing Engine', 'Inventory Management', 'Purchase Orders', 'Decor Package Catalog', 'WhatsApp & Email Notifications', 'Advanced Analytics (7 tabs)', 'Review Management', 'Priority Support'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For multi-franchise operations at scale.', features: ['Unlimited Franchises', 'Unlimited Branches', 'Unlimited Staff', 'Everything in Professional', 'AI Revenue Forecasting', 'AI Chatbot (Lead Capture)', 'Auto-generated Proposals', 'Custom Integrations', 'White-label Option', 'Dedicated Account Manager', 'SLA Guarantee', 'Priority 24/7 Support'], cta: 'Contact Sales' },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes! All plans come with a 14-day free trial. No credit card required.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade at any time.' },
  { q: 'How does temporary staff access work?', a: 'You can create temporary staff accounts with 24-hour auto-expiring access.' },
  { q: 'Do you support multiple franchises?', a: 'Yes, the Enterprise plan supports unlimited franchises and branches.' },
  { q: 'What payment methods do you accept?', a: 'UPI, credit/debit cards, net banking, and bank transfers.' },
];

export default function PricingPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '96px 32px 64px', background: 'var(--color-bg-alt)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>
            Plans that scale with your business
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-text-muted)', maxWidth: 550, margin: '0 auto' }}>
            Start free for 14 days. No credit card required.
          </p>
        </motion.div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1100 }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {plans.map((p, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="card" style={{ padding: 36, display: 'flex', flexDirection: 'column', border: p.popular ? '2px solid var(--color-accent)' : undefined, position: 'relative' }}>
                {p.popular && <div className="badge badge-accent" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>Most Popular</div>}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>{p.desc}</p>
                <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginBottom: 24 }}>
                  {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)' }}>{p.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-body)' }}>
                      <Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>
                <button className={`btn ${p.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                  {p.cta} {p.cta !== 'Contact Sales' && <ArrowRight size={14} />}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container-narrow">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', textAlign: 'center', marginBottom: 40 }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ padding: 24, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-h)', marginBottom: 8 }}>{faq.q}</h4>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
