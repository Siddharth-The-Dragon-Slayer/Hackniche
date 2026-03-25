'use client';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const variantMap = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-outline',
};

const sizeMap = {
  xs: 'btn-sm',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    loading = false,
    fullWidth = false,
    icon,
    iconRight,
    animated = true,
    style = {},
    ...props
  },
  ref
) {
  const cls = [
    variantMap[variant] || 'btn btn-primary',
    sizeMap[size] || '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && (
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {!loading && icon && icon}
      {children}
      {!loading && iconRight && iconRight}
    </>
  );

  if (animated) {
    return (
      <motion.button
        ref={ref}
        className={cls}
        style={style}
        whileTap={{ scale: 0.96 }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button ref={ref} className={cls} style={style} {...props}>
      {content}
    </button>
  );
});

export default Button;
