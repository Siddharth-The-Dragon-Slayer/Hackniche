'use client';

/**
 * SectionWrapper — controls section padding + container width
 */
export default function SectionWrapper({
  children,
  background,
  size = 'md',
  narrow = false,
  className = '',
  style = {},
  id,
}) {
  const sectionClass = { sm: 'section-sm', md: 'section', lg: 'section-lg', xl: 'section-xl' }[size] || 'section';
  const containerClass = narrow ? 'container-narrow' : 'container';
  return (
    <section
      id={id}
      className={`${sectionClass} ${className}`}
      style={{ background, ...style }}
    >
      <div className={containerClass}>{children}</div>
    </section>
  );
}
