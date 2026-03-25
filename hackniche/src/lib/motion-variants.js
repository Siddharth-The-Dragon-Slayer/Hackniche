// Framer Motion variants from ui.md §8.2

// ── ENTRANCE ──────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 44, filter: "blur(5px)" },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.70, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }
  })
};

export const fadeDown = {
  hidden:  { opacity: 0, y: -28, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.55, delay: i * 0.07 }
  })
};

export const slideInLeft = {
  hidden:  { opacity: 0, x: -56, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] } }
};

export const slideInRight = {
  hidden:  { opacity: 0, x: 56, filter: "blur(4px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)",
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] } }
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.86, filter: "blur(4px)" },
  visible: (i = 0) => ({
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.34, 1.56, 0.64, 1] }
  })
};

export const revealClip = {
  hidden:  { clipPath: "inset(100% 0 0 0)" },
  visible: { clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
};

// ── STAGGER CONTAINERS ─────────────────────────────
export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10, delayChildren: 0.18 } }
};
export const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.10 } }
};
export const staggerSlow = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.25 } }
};

// ── HERO SEQUENCE ──────────────────────────────────
export const heroBadge = {
  hidden:  { opacity: 0, y: 16, scale: 0.88 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.50, delay: 0.20, ease: [0.34, 1.56, 0.64, 1] } }
};
export const heroLine = (lineIndex = 0) => ({
  hidden:  { opacity: 0, y: 48, skewY: 1.5, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, skewY: 0, filter: "blur(0px)",
    transition: { duration: 0.90, delay: 0.40 + lineIndex * 0.14, ease: [0.16, 1, 0.3, 1] } }
});
export const heroCTA = {
  hidden:  { opacity: 0, y: 24, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, delay: 0.82, ease: [0.34, 1.56, 0.64, 1] } }
};
export const heroStats = (i = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.50, delay: 1.05 + i * 0.10, ease: [0.16, 1, 0.3, 1] } }
});

// ── INTERACTIVE ────────────────────────────────────
export const cardHover = {
  rest:  { y: 0, boxShadow: "0 2px 12px rgba(123,28,28,0.08)" },
  hover: { y: -6, boxShadow: "0 16px 40px rgba(123,28,28,0.18)",
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }
};

export const arrowSlide = {
  rest:  { x: 0 },
  hover: { x: 5, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }
};

export const iconSpin = {
  rest:  { rotate: 0, scale: 1 },
  hover: { rotate: 12, scale: 1.08,
    transition: { duration: 0.32, ease: [0.34, 1.56, 0.64, 1] } }
};

// ── PAGE TRANSITION ────────────────────────────────
export const pageTransition = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.30, ease: [0.4, 0, 1, 1] } }
};

// ── MODAL ──────────────────────────────────────────
export const modalVariants = {
  hidden:  { opacity: 0, scale: 0.90, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -14,
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } }
};
