'use client';

/**
 * EmptyState — empty list / zero-data state
 */
export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`card ${className}`}
      style={{
        padding: '48px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
    >
      {icon && (
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-primary-ghost)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)', marginBottom: 8,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
        color: 'var(--color-text-h)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
