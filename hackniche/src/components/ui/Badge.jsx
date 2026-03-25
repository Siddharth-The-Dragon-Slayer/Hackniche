'use client';

const variantMap = {
  primary: 'badge-primary',
  accent: 'badge-accent',
  green: 'badge-green',
  red: 'badge-red',
  neutral: 'badge-neutral',
  warning: 'badge-warning',
  success: 'badge-green',
  danger: 'badge-red',
};

export default function Badge({ variant = 'neutral', children, className = '', style = {}, icon }) {
  const cls = ['badge', variantMap[variant] || 'badge-neutral', className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={style}>
      {icon && icon}
      {children}
    </span>
  );
}
