'use client';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Award, Users, MapPin, Calendar, Rocket, Heart } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: <Rocket size={22} />, title: 'Innovation First', desc: 'We build cutting-edge tools that transform how banquet businesses operate.' },
    { icon: <Heart size={22} />, title: 'Client Success', desc: 'Your success is our success. We measure ourselves by the value we deliver.' },
    { icon: <Users size={22} />, title: 'Team Culture', desc: 'A diverse team of engineers, designers, and hospitality experts.' },
    { icon: <Award size={22} />, title: 'Quality', desc: 'Every feature is crafted to the highest standard of reliability and design.' },
  ];

  const teamMembers = [
    { name: 'Darshan Pol', role: 'Founder & CEO', bio: 'Full-stack developer with a passion for building scalable SaaS platforms.' },
    { name: 'Prasad Rao', role: 'Domain Expert', bio: '20+ years in banquet operations. Knows every pain point firsthand.' },
    { name: 'Arjun Singh', role: 'Lead Engineer', bio: 'React & Firebase specialist. Built the core platform architecture.' },
    { name: 'Priya Nair', role: 'UX Designer', bio: 'Creates intuitive interfaces that banquet staff love to use.' },
  ];

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '96px 32px 64px', background: 'var(--color-bg-alt)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>About Us</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16 }}>
            Built for banquets, by banquet people
          </h1>
          <p style={{ fontSize: 18, color: 'var(--color-text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            BanquetEase was born from real experience managing banquet operations. We understand the chaos and built the solution.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 16, textAlign: 'center' }}>Our Story</h2>
            <p style={{ fontSize: 16, color: 'var(--color-text-body)', lineHeight: 1.8, marginBottom: 16 }}>
              BanquetEase started when our founders realized that even the most successful banquet businesses were running on spreadsheets, WhatsApp groups, and paper registers. Leads were falling through cracks, halls were getting double-booked, and revenue insights were practically nonexistent.
            </p>
            <p style={{ fontSize: 16, color: 'var(--color-text-body)', lineHeight: 1.8, marginBottom: 16 }}>
              We partnered with Prasad Food Divine — one of Hyderabad&apos;s most respected banquet venues — to build the platform from the ground up. Every feature was validated with real operations, real staff, and real events.
            </p>
            <p style={{ fontSize: 16, color: 'var(--color-text-body)', lineHeight: 1.8 }}>
              Today, BanquetEase powers multiple franchises and branches, managing thousands of leads and hundreds of events every month. And we&apos;re just getting started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 40, textAlign: 'center' }}>Our Values</h2>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="card" style={{ padding: 28, textAlign: 'center' }}>
                <div className="card-icon" style={{ margin: '0 auto 16px' }}>{v.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{v.title}</h4>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 40, textAlign: 'center' }}>Meet the Team</h2>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((m, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="card" style={{ padding: 28, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--color-text-on-gold)', margin: '0 auto 16px' }}>{m.name[0]}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 4 }}>{m.name}</h4>
                <div className="badge badge-primary" style={{ marginBottom: 12 }}>{m.role}</div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{m.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
