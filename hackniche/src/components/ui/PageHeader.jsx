'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fadeDown, staggerContainer, fadeUp } from '@/lib/motion-variants';

/**
 * PageHeader — responsive page title area with actions
 *
 * Props:
 *   title        (string)   - main heading
 *   subtitle     (string)   - sub / description text
 *   backHref     (string)   - if given, shows a Back link
 *   backLabel    (string)   - label for back link (default "Back")
 *   actions      (ReactNode) - buttons / links on the right
 *   breadcrumb   (ReactNode) - custom breadcrumb row
 *   animated     (bool)     - use framer-motion entrance
 */
export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  actions,
  breadcrumb,
  animated = true,
  className = '',
  style = {},
}) {
  const inner = (
    <div className={`page-header ${className}`} style={style}>
      <div className="page-header-left">
        {breadcrumb && <div style={{ marginBottom: 6 }}>{breadcrumb}</div>}
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--color-text-muted)',
              marginBottom: 8, textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
        )}
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );

  if (!animated) return inner;

  return (
    <motion.div
      variants={fadeDown}
      initial="hidden"
      animate="visible"
    >
      {inner}
    </motion.div>
  );
}
