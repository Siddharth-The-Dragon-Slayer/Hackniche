'use client';
import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  { label, hint, error, options = [], placeholder, className = '', wrapperClass = '', style = {}, children, ...props },
  ref
) {
  return (
    <div className={`form-field ${wrapperClass}`}>
      {label && <label className="form-label">{label}</label>}
      <select
        ref={ref}
        className={`select input ${className}`}
        style={{ borderColor: error ? 'var(--color-danger)' : undefined, ...style }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
        {children}
      </select>
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-hint" style={{ color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
});

export default Select;
