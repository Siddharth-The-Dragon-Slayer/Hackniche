'use client';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';

export default function SectionHeader({ eyebrow, title, titleHighlight, subtitle, align = 'center' }) {
  const renderTitle = () => {
    if (!titleHighlight || !title.includes(titleHighlight)) {
      return title;
    }
    const parts = title.split(titleHighlight);
    return (
      <>
        {parts[0]}<span className="text-gradient">{titleHighlight}</span>{parts[1]}
      </>
    );
  };

  return (
    <motion.div
      className={`section-header ${align === 'center' ? 'center' : ''}`}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
    >
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{renderTitle()}</h2>
      {subtitle && <p>{subtitle}</p>}
      <div className="divider-ornament" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start', marginTop: 16 }}>
        <div className="divider-diamond" />
      </div>
    </motion.div>
  );
}
