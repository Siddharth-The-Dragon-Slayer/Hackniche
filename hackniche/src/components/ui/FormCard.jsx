'use client';

/**
 * FormCard — responsive form card container with title
 */
export default function FormCard({
  title,
  titleIcon,
  children,
  className = '',
  style = {},
}) {
  return (
    <div className={`card form-card ${className}`} style={style}>
      {title && (
        <div className="form-section-title">
          {titleIcon && <span style={{ color: 'var(--color-primary)' }}>{titleIcon}</span>}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
