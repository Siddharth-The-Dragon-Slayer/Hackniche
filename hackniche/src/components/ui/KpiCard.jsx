'use client';
import { motion } from 'framer-motion';
import { scaleIn, fadeUp } from '@/lib/motion-variants';

/**
 * KpiCard — animated KPI metric display
 */
export default function KpiCard({
  label,
  value,
  change,
  positive,
  icon,
  accentColor,
  index = 0,
  animated = true,
  style = {},
}) {
  const card = (
    <div className="kpi-card" style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="kpi-label">{label}</div>
        {icon && (
          <div style={{ color: accentColor || 'var(--color-primary)', opacity: 0.5 }}>
            {icon}
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '↑' : '⚠'} {change}
        </div>
      )}
    </div>
  );

  if (!animated) return card;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="kpi-card"
      style={style}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="kpi-label">{label}</div>
        {icon && (
          <div style={{ color: accentColor || 'var(--color-primary)', opacity: 0.5 }}>
            {icon}
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? '↑' : '⚠'} {change}
        </div>
      )}
    </motion.div>
  );
}
