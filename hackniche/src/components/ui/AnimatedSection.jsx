'use client';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';

/**
 * AnimatedSection — wraps any section with a viewport-triggered entrance
 */
export default function AnimatedSection({
  children,
  variants = fadeUp,
  className = '',
  style = {},
  delay = 0,
  once = true,
  amount = 0.15,
  ...props
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={delay}
      {...props}
    >
      {children}
    </motion.div>
  );
}
