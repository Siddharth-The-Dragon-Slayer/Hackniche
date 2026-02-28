'use client';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const Card = forwardRef(function Card(
  {
    children,
    className = '',
    padding = true,
    hover = true,
    animated = false,
    initial,
    animate,
    variants,
    style = {},
    onClick,
    ...props
  },
  ref
) {
  const cls = ['card', padding ? 'card-padded' : '', className].filter(Boolean).join(' ');

  if (animated) {
    return (
      <motion.div
        ref={ref}
        className={cls}
        style={{ padding: padding ? undefined : 0, ...style }}
        initial={initial || 'hidden'}
        whileInView={animate || 'visible'}
        viewport={{ once: true, amount: 0.15 }}
        variants={variants}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cls}
      style={{ padding: padding ? undefined : 0, ...style }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
