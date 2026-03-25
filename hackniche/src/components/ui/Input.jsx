'use client';
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    icon,
    iconRight,
    className = '',
    wrapperClass = '',
    style = {},
    type = 'text',
    as: Tag = 'input',
    rows,
    ...props
  },
  ref
) {
  return (
    <div className={`form-field ${wrapperClass}`}>
      {label && <label className="form-label">{label}</label>}
      <div className="input-group" style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none', zIndex: 1,
          }}>
            {icon}
          </span>
        )}
        <Tag
          ref={ref}
          type={type}
          className={`input ${icon ? 'pl-10' : ''} ${className}`}
          style={{
            paddingLeft: icon ? 40 : undefined,
            paddingRight: iconRight ? 40 : undefined,
            borderColor: error ? 'var(--color-danger)' : undefined,
            ...style,
          }}
          rows={rows}
          {...props}
        />
        {iconRight && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none',
          }}>
            {iconRight}
          </span>
        )}
      </div>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-hint" style={{ color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
});

export default Input;
