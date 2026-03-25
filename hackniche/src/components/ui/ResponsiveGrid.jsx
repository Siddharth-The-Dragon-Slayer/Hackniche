'use client';

/**
 * ResponsiveGrid — CSS grid that adapts to breakpoints
 *
 * cols: { mobile, tablet, desktop } — number of columns
 * gap: Tailwind gap size or CSS value
 */
export default function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  className = '',
  style = {},
}) {
  const colClasses = [
    `grid-cols-${cols.mobile || 1}`,
    `md:grid-cols-${cols.tablet || 2}`,
    `lg:grid-cols-${cols.desktop || 3}`,
  ].join(' ');

  return (
    <div
      className={`grid gap-5 ${colClasses} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
