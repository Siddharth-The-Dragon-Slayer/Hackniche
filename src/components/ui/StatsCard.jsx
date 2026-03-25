'use client';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/motion-variants';

/**
 * StatsCard — feature/stat card for marketing pages
 */
export default function StatsCard({
  icon,
  title,
  subtitle,
  value,
  trend,
  colorAccent = 'var(--color-primary)',
  index = 0,
  animated = true,
  className = '',
  style = {},
  children,
}) {
  const content = (
    <div className={`card ${className}`} style={{ padding: 24, ...style }}>
      {icon && (
        <div
          className="card-icon"
          style={{ background: colorAccent, marginBottom: 16 }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h4 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--color-text-h)', marginBottom: 6,
        }}>
          {title}
        </h4>
      )}
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
      {value && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700,
          color: colorAccent, marginTop: 12,
        }}>
          {value}
        </div>
      )}
      {trend && (
        <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4 }}>
          ↑ {trend}
        </div>
      )}
      {children}
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={`card ${className}`}
      style={{ padding: 24, ...style }}
    >
      {icon && (
        <div className="card-icon" style={{ background: colorAccent, marginBottom: 16 }}>
          {icon}
        </div>
      )}
      {title && (
        <h4 style={{
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--color-text-h)', marginBottom: 6,
        }}>
          {title}
        </h4>
      )}
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
      {value && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700,
          color: colorAccent, marginTop: 12,
        }}>
          {value}
        </div>
      )}
      {trend && (
        <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 4 }}>
          ↑ {trend}
        </div>
      )}
      {children}
    </motion.div>
  );
}
