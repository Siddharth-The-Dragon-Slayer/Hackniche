'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Modal — accessible animated modal
 */
export default function Modal({
  open = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const maxWidths = { sm: 420, md: 560, lg: 720, xl: 900, full: '95vw' };
  const maxW = maxWidths[size] || 560;

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className={`modal ${className}`}
            style={{ maxWidth: maxW, width: '100%', margin: '16px' }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            {(title || onClose) && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, gap: 12,
              }}>
                {title && (
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                    color: 'var(--color-text-h)', margin: 0,
                  }}>
                    {title}
                  </h3>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--color-text-muted)', cursor: 'pointer',
                      padding: 4, borderRadius: 8, flexShrink: 0,
                    }}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div>{children}</div>

            {/* Footer */}
            {footer && (
              <div style={{
                display: 'flex', gap: 10, justifyContent: 'flex-end',
                marginTop: 24, flexWrap: 'wrap',
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
