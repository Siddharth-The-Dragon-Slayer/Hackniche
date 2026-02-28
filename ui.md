# BanquetOS — UI Design System & Color Specification
### Inspired by Prasad Food Divine · Dark & Light Theme · v2.0
> **Complete developer reference** for all colors, typography, animations, components, and page templates. Follows the warm maroon–gold–cream palette of the Prasad Food Divine brand, adapted for both a rich dark SaaS theme and a luminous light theme.

---

## Table of Contents

1. [Brand Color Extraction (from Prasad)](#1-brand-color-extraction-from-prasad)
2. [Color System — Light Theme](#2-color-system--light-theme)
3. [Color System — Dark Theme](#3-color-system--dark-theme)
4. [Theme Switching Architecture](#4-theme-switching-architecture)
5. [Typography System](#5-typography-system)
6. [Spacing & Layout Grid](#6-spacing--layout-grid)
7. [Gradient & Effect Library](#7-gradient--effect-library)
8. [Animation & Motion System](#8-animation--motion-system)
   - Framer Motion Variants
   - GSAP Patterns
   - CSS Keyframes
   - Scroll Animation Rules
   - Page Load Sequence
9. [Component Library](#9-component-library)
10. [Page Templates & Section Order](#10-page-templates--section-order)
11. [Visual Effects & Backgrounds](#11-visual-effects--backgrounds)
12. [Micro-interactions Catalogue](#12-micro-interactions-catalogue)
13. [Responsive Design Rules](#13-responsive-design-rules)
14. [Accessibility Standards](#14-accessibility-standards)
15. [CSS Variables Master Sheet](#15-css-variables-master-sheet)
16. [Tech Stack & Library Setup](#16-tech-stack--library-setup)
17. [File & Folder Structure](#17-file--folder-structure)
18. [Implementation Checklist](#18-implementation-checklist)

---

## 1. Brand Color Extraction (from Prasad)

Colors extracted directly from the Prasad Food Divine website screenshot:

```
EXTRACTED PALETTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary Maroon     ████  #7B1C1C   — Navbar, hero overlay, CTA buttons, icons
Dark Maroon        ████  #5A1010   — Footer background, hover darken
Light Maroon       ████  #9B3A3A   — Hover tints, icon backgrounds
Warm Gold / Amber  ████  #C9921A   — Primary CTA buttons, highlights, stars
Amber Light        ████  #E8B84B   — Decorative accents, gradients
Cream / Off-White  ████  #FFF8E7   — Section backgrounds (Why Choose Us, etc.)
Warm Yellow        ████  #FEFAE0   — Alternate section backgrounds
Charcoal           ████  #1A1A1A   — Primary headings
Medium Grey        ████  #4A4A4A   — Body copy
Muted Grey         ████  #888888   — Captions, secondary text
White              ████  #FFFFFF   — Cards, navbar background
FSSAI Green        ████  #2E7D32   — Certification badges
Star Amber         ████  #F5A623   — Review star ratings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Color Role Mapping (from site analysis)

| Observed Element | Color Used | Hex |
|---|---|---|
| Navbar background | White | `#FFFFFF` |
| Nav active link | Maroon | `#7B1C1C` |
| Hero section overlay | Dark Maroon gradient | `#5A1010 → transparent` |
| Hero CTA button | Warm Gold | `#C9921A` |
| Section headings | Charcoal | `#1A1A1A` |
| Section subtitles | Medium Grey | `#4A4A4A` |
| "Why Choose Us" bg | Cream | `#FFF8E7` |
| Feature card bg | White | `#FFFFFF` |
| Feature card border | Warm border | `#E8E0D0` |
| Feature icon container | Maroon circle | `#7B1C1C` |
| Icon foreground | White | `#FFFFFF` |
| Star ratings | Amber | `#F5A623` |
| Footer background | Deep Maroon | `#5A1010` |
| Footer text | Soft White | `rgba(255,255,255,0.75)` |
| Footer link hover | Gold | `#C9921A` |
| CTA / Reserve button | Gold gradient | `#C9921A → #A87510` |
| Certification badge | Green | `#2E7D32` |
| Card hover border | Maroon tint | `rgba(123,28,28,0.3)` |

---

## 2. Color System — Light Theme

> **Default theme.** Warm, inviting, cream-and-maroon palette. Evokes traditional Indian fine dining and premium hospitality.

### 2.1 Core Light Palette

```css
/* Light Theme Core */
--lt-bg-primary:       #FFFFFF;          /* Main page background */
--lt-bg-secondary:     #FFF8E7;          /* Section alt: cream */
--lt-bg-tertiary:      #FEFAE0;          /* Section alt: warm yellow */
--lt-bg-card:          #FFFFFF;          /* Card backgrounds */
--lt-bg-card-hover:    #FFFDF5;          /* Card hover state */
--lt-bg-nav:           rgba(255,255,255,0.96); /* Navbar */
--lt-bg-footer:        #5A1010;          /* Footer bg */
--lt-bg-overlay:       rgba(90,16,16,0.72); /* Hero overlay */

--lt-primary:          #7B1C1C;          /* Deep Maroon — brand primary */
--lt-primary-dark:     #5A1010;          /* Darker maroon — hover/active */
--lt-primary-light:    #9B3A3A;          /* Lighter maroon — tints */
--lt-primary-xlight:   rgba(123,28,28,0.08); /* Ghost tint for icon bg */

--lt-accent:           #C9921A;          /* Warm Gold — CTA, highlights */
--lt-accent-dark:      #A87510;          /* Darker gold — hover */
--lt-accent-light:     #E8B84B;          /* Light gold — decorative */
--lt-accent-xlight:    rgba(201,146,26,0.10); /* Ghost tint */

--lt-text-primary:     #1A1A1A;          /* Headings */
--lt-text-secondary:   #4A4A4A;          /* Body copy */
--lt-text-muted:       #888888;          /* Captions, meta */
--lt-text-on-dark:     #FFFFFF;          /* Text on maroon/dark bg */
--lt-text-on-footer:   rgba(255,255,255,0.75); /* Footer body text */

--lt-border:           #E8E0D0;          /* Card borders */
--lt-border-hover:     rgba(123,28,28,0.25); /* Hover border */
--lt-border-accent:    rgba(201,146,26,0.30); /* Gold accent border */

--lt-success:          #2E7D32;          /* FSSAI, verified */
--lt-star:             #F5A623;          /* Star ratings */
--lt-danger:           #C0392B;          /* Errors, alerts */

--lt-shadow-card:      0 2px 12px rgba(123,28,28,0.08), 0 1px 3px rgba(0,0,0,0.05);
--lt-shadow-hover:     0 12px 40px rgba(123,28,28,0.15), 0 4px 16px rgba(0,0,0,0.08);
--lt-shadow-nav:       0 2px 20px rgba(0,0,0,0.08);
--lt-shadow-btn:       0 4px 16px rgba(201,146,26,0.35);
--lt-shadow-btn-hover: 0 8px 28px rgba(201,146,26,0.50);
```

### 2.2 Light Theme Section Colors

| Section | Background | Use Case |
|---|---|---|
| Navbar | `#FFFFFF` / `rgba(255,255,255,0.96)` | Sticky top nav |
| Hero | Image + `rgba(90,16,16,0.72)` overlay | Full-bleed hero |
| Signature Dishes | `#FFFFFF` | Image grid |
| Why Choose Us | `#FFF8E7` | Feature cards |
| Commitment | `#FEFAE0` | Safety/quality cards |
| Testimonials | `#FFFFFF` | Review cards |
| About/Welcome | `#FFF8E7` | 2-col split |
| Gallery | `#FFFFFF` | Image grid |
| Pricing | `#FFF8E7` | Pricing cards |
| CTA Banner | `#7B1C1C` | Dark maroon callout |
| Footer | `#5A1010` | Deep maroon |

---

## 3. Color System — Dark Theme

> **Dark theme.** Deep burgundy night with gold shimmer. Feels like a premium evening dining experience — candlelit, rich, sophisticated.

### 3.1 Core Dark Palette

```css
/* Dark Theme Core */
--dt-bg-primary:       #0F0508;          /* Deepest bg — near-black with maroon tint */
--dt-bg-secondary:     #160A0A;          /* Slightly elevated section bg */
--dt-bg-tertiary:      #1C0D0D;          /* Card-level bg */
--dt-bg-card:          #1C0D0D;          /* Card backgrounds */
--dt-bg-card-hover:    #221010;          /* Card hover state */
--dt-bg-nav:           rgba(15,5,8,0.94); /* Navbar (scrolled) */
--dt-bg-footer:        #0A0306;          /* Footer — darkest */
--dt-bg-overlay:       rgba(15,5,8,0.85); /* Hero overlay */

--dt-primary:          #C9603A;          /* Warm burnt maroon-orange — primary */
--dt-primary-dark:     #A8492A;          /* Darker hover */
--dt-primary-light:    #E07050;          /* Lighter tint */
--dt-primary-xlight:   rgba(201,96,58,0.12); /* Ghost tint */

--dt-accent:           #E8B84B;          /* Gold/Amber — CTA, highlights */
--dt-accent-dark:      #C9921A;          /* Deeper gold */
--dt-accent-light:     #F5D07A;          /* Light gold shimmer */
--dt-accent-xlight:    rgba(232,184,75,0.12); /* Ghost tint */

--dt-text-primary:     #F5EDE0;          /* Warm off-white headings */
--dt-text-secondary:   #BFA89A;          /* Warm muted body */
--dt-text-muted:       #7A5A50;          /* Captions, disabled */
--dt-text-on-accent:   #1A0A05;          /* Text on gold bg */
--dt-text-on-footer:   rgba(245,237,224,0.65); /* Footer body */

--dt-border:           rgba(201,96,58,0.15);  /* Warm maroon-tinted border */
--dt-border-hover:     rgba(232,184,75,0.35); /* Gold hover border */
--dt-border-accent:    rgba(232,184,75,0.25); /* Gold accent border */
--dt-border-card:      rgba(255,255,255,0.06); /* Subtle card edge */

--dt-success:          #4CAF50;          /* Green for badges */
--dt-star:             #E8B84B;          /* Star ratings (gold) */
--dt-danger:           #E74C3C;          /* Errors, negative reviews */

--dt-shadow-card:      0 4px 20px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.25);
--dt-shadow-hover:     0 16px 48px rgba(0,0,0,0.55), 0 0 40px rgba(232,184,75,0.08);
--dt-shadow-nav:       0 4px 24px rgba(0,0,0,0.50);
--dt-shadow-btn:       0 4px 16px rgba(232,184,75,0.30);
--dt-shadow-btn-hover: 0 8px 32px rgba(232,184,75,0.45);
```

### 3.2 Dark Theme Section Colors

| Section | Background | Use Case |
|---|---|---|
| Navbar | Transparent → `rgba(15,5,8,0.94)` | Sticky nav with glass |
| Hero | Image + `rgba(15,5,8,0.85)` overlay | Full-bleed |
| Features | `#160A0A` | Alt section bg |
| Feature Cards | `#1C0D0D` | Card base |
| Pipeline | `#0F0508` | Main bg |
| Analytics | `#160A0A` | Slight elevation |
| Testimonials | `#1C0D0D` | Cards |
| Pricing | `#0F0508` | Main bg |
| CTA Banner | `#1C0D0D` + gold glow | Featured card |
| Footer | `#0A0306` | Deepest dark |

### 3.3 Dark Theme Glow Effects

```css
/* Unique to dark theme — ambient glow to simulate candlelight */
--dt-glow-primary:    0 0 30px rgba(201,96,58,0.25),  0 0 60px rgba(201,96,58,0.08);
--dt-glow-accent:     0 0 30px rgba(232,184,75,0.30),  0 0 60px rgba(232,184,75,0.10);
--dt-glow-card-top:   radial-gradient(ellipse at 50% 0%, rgba(232,184,75,0.08), transparent 60%);
--dt-glow-hero-left:  radial-gradient(ellipse 60% 80% at 15% 50%, rgba(201,96,58,0.15), transparent 60%);
--dt-glow-hero-right: radial-gradient(ellipse 50% 60% at 85% 40%, rgba(232,184,75,0.08), transparent 60%);
```

---

## 4. Theme Switching Architecture

### 4.1 CSS Strategy — Attribute-Based Theming

```css
/* globals.css — base tokens always present */
:root {
  /* Neutral/structural tokens (same both themes) */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', 'Outfit', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  /* spacing, radius, duration tokens... */
}

/* LIGHT THEME (default) */
:root,
[data-theme="light"] {
  --color-bg:            #FFFFFF;
  --color-bg-alt:        #FFF8E7;
  --color-bg-alt2:       #FEFAE0;
  --color-bg-card:       #FFFFFF;
  --color-bg-card-hover: #FFFDF5;
  --color-bg-nav:        rgba(255,255,255,0.96);
  --color-bg-overlay:    rgba(90,16,16,0.72);
  --color-bg-footer:     #5A1010;

  --color-primary:       #7B1C1C;
  --color-primary-dark:  #5A1010;
  --color-primary-light: #9B3A3A;
  --color-primary-ghost: rgba(123,28,28,0.08);

  --color-accent:        #C9921A;
  --color-accent-dark:   #A87510;
  --color-accent-light:  #E8B84B;
  --color-accent-ghost:  rgba(201,146,26,0.10);

  --color-text-h:        #1A1A1A;
  --color-text-body:     #4A4A4A;
  --color-text-muted:    #888888;
  --color-text-inverse:  #FFFFFF;
  --color-text-footer:   rgba(255,255,255,0.75);

  --color-border:        #E8E0D0;
  --color-border-hover:  rgba(123,28,28,0.25);
  --color-border-accent: rgba(201,146,26,0.30);

  --color-star:          #F5A623;
  --color-success:       #2E7D32;
  --color-danger:        #C0392B;
  --color-warning:       #E67E22;

  --shadow-card:   0 2px 12px rgba(123,28,28,0.08), 0 1px 3px rgba(0,0,0,0.05);
  --shadow-hover:  0 12px 40px rgba(123,28,28,0.14), 0 4px 16px rgba(0,0,0,0.08);
  --shadow-nav:    0 2px 20px rgba(0,0,0,0.08);
  --shadow-btn:    0 4px 16px rgba(201,146,26,0.35);
  --shadow-modal:  0 24px 80px rgba(0,0,0,0.25);

  /* Gradients */
  --gradient-hero:    linear-gradient(135deg, rgba(90,16,16,0.82) 0%, rgba(26,10,10,0.55) 60%, rgba(201,146,26,0.10) 100%);
  --gradient-btn:     linear-gradient(135deg, #C9921A 0%, #A87510 100%);
  --gradient-btn-alt: linear-gradient(135deg, #9B3A3A 0%, #7B1C1C 100%);
  --gradient-text:    linear-gradient(135deg, #7B1C1C 0%, #C9921A 100%);
  --gradient-footer:  linear-gradient(180deg, #5A1010 0%, #3D0A0A 100%);
  --gradient-section: linear-gradient(180deg, #FFF8E7 0%, #FEFAE0 50%, #FFF8E7 100%);
}

/* DARK THEME */
[data-theme="dark"] {
  --color-bg:            #0F0508;
  --color-bg-alt:        #160A0A;
  --color-bg-alt2:       #1C0D0D;
  --color-bg-card:       #1C0D0D;
  --color-bg-card-hover: #221010;
  --color-bg-nav:        rgba(15,5,8,0.94);
  --color-bg-overlay:    rgba(15,5,8,0.85);
  --color-bg-footer:     #0A0306;

  --color-primary:       #C9603A;
  --color-primary-dark:  #A8492A;
  --color-primary-light: #E07050;
  --color-primary-ghost: rgba(201,96,58,0.12);

  --color-accent:        #E8B84B;
  --color-accent-dark:   #C9921A;
  --color-accent-light:  #F5D07A;
  --color-accent-ghost:  rgba(232,184,75,0.12);

  --color-text-h:        #F5EDE0;
  --color-text-body:     #BFA89A;
  --color-text-muted:    #7A5A50;
  --color-text-inverse:  #1A0A05;
  --color-text-footer:   rgba(245,237,224,0.65);

  --color-border:        rgba(201,96,58,0.15);
  --color-border-hover:  rgba(232,184,75,0.35);
  --color-border-accent: rgba(232,184,75,0.25);

  --color-star:          #E8B84B;
  --color-success:       #4CAF50;
  --color-danger:        #E74C3C;
  --color-warning:       #F97316;

  --shadow-card:   0 4px 20px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.25);
  --shadow-hover:  0 16px 48px rgba(0,0,0,0.55), 0 0 40px rgba(232,184,75,0.08);
  --shadow-nav:    0 4px 24px rgba(0,0,0,0.50);
  --shadow-btn:    0 4px 16px rgba(232,184,75,0.30);
  --shadow-modal:  0 24px 80px rgba(0,0,0,0.60);

  /* Gradients */
  --gradient-hero:    linear-gradient(135deg, rgba(15,5,8,0.90) 0%, rgba(30,8,8,0.70) 60%, rgba(232,184,75,0.05) 100%);
  --gradient-btn:     linear-gradient(135deg, #E8B84B 0%, #C9921A 100%);
  --gradient-btn-alt: linear-gradient(135deg, #E07050 0%, #C9603A 100%);
  --gradient-text:    linear-gradient(135deg, #E07050 0%, #E8B84B 100%);
  --gradient-footer:  linear-gradient(180deg, #0A0306 0%, #050106 100%);
  --gradient-section: linear-gradient(180deg, #160A0A 0%, #1C0D0D 50%, #160A0A 100%);
}
```

### 4.2 Theme Toggle Implementation

```typescript
// src/hooks/use-theme.ts
import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem("banquetos-theme") as Theme;
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("banquetos-theme", next);
  };

  return { theme, toggleTheme, isDark: theme === "dark" };
}
```

### 4.3 Theme Toggle Button Component

```tsx
// Animated sun/moon toggle
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        background: isDark
          ? "linear-gradient(135deg, #E8B84B, #C9921A)"
          : "rgba(123,28,28,0.12)",
        border: `1.5px solid ${isDark ? "rgba(232,184,75,0.4)" : "rgba(123,28,28,0.2)"}`,
        position: "relative", cursor: "pointer",
        padding: 0, overflow: "hidden",
      }}
    >
      {/* Track icons */}
      <span style={{ position: "absolute", left: 5,  top: "50%", transform: "translateY(-50%)", fontSize: 10 }}>🌙</span>
      <span style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", fontSize: 10 }}>☀️</span>

      {/* Thumb */}
      <motion.div
        animate={{ x: isDark ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{
          position: "absolute", top: 2,
          width: 18, height: 18,
          borderRadius: "50%",
          background: isDark ? "#1A0A05" : "#7B1C1C",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </motion.button>
  );
}
```

---

## 5. Typography System

### 5.1 Font Stack

```css
/* Google Fonts — include in <head> */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

/*
  WHY THESE FONTS:
  - Cormorant Garamond: Elegant serif — matches the traditional, devotional,
    premium Indian hospitality feel of Prasad Food Divine perfectly.
    Used for ALL headings and display text.
  - DM Sans: Geometric humanist sans-serif — clean, readable, modern.
    Used for all body text, labels, buttons.
  - JetBrains Mono: For data values, metrics, invoice numbers.
*/

--font-display: 'Cormorant Garamond', 'Libre Baskerville', Georgia, serif;
--font-body:    'DM Sans', 'Outfit', Helvetica, sans-serif;
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;
```

### 5.2 Type Scale

| Token | rem | px | Weight | Font | Usage |
|---|---|---|---|---|---|
| `--text-hero` | clamp(3rem, 7vw, 5.5rem) | 48–88px | 700 | Display | Hero H1 |
| `--text-h1` | clamp(2.5rem, 5vw, 4rem) | 40–64px | 700 | Display | Page titles |
| `--text-h2` | clamp(2rem, 3.5vw, 2.75rem) | 32–44px | 700 | Display | Section headers |
| `--text-h3` | clamp(1.5rem, 2.5vw, 2rem) | 24–32px | 600 | Display | Sub-sections |
| `--text-h4` | 1.375rem | 22px | 600 | Display | Card titles |
| `--text-xl` | 1.25rem | 20px | 400 | Body | Lead text |
| `--text-lg` | 1.125rem | 18px | 400 | Body | Large body |
| `--text-base` | 1rem | 16px | 400 | Body | Standard body |
| `--text-sm` | 0.875rem | 14px | 400 | Body | Secondary |
| `--text-xs` | 0.75rem | 12px | 500 | Body | Labels, badges |
| `--text-2xs` | 0.6875rem | 11px | 600 | Body | Eyebrows, caps |
| `--text-mono` | 0.875rem | 14px | 400 | Mono | Numbers, IDs |

### 5.3 Typography Rules

```css
/* Display headings — Cormorant Garamond-specific rules */
h1, h2, h3, .display {
  font-family: var(--font-display);
  color: var(--color-text-h);
  letter-spacing: -0.5px;     /* Cormorant looks best slightly tight */
  line-height: 1.15;
}

/* H2 section headers — standard pattern */
.section-title {
  font-size: var(--text-h2);
  font-weight: 700;
  font-style: italic;          /* Cormorant Garamond italic = very elegant */
}

/* Eyebrow label above sections */
.eyebrow {
  font-family: var(--font-body);
  font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--color-accent);
  display: inline-flex; align-items: center; gap: 10px;
}
.eyebrow::before, .eyebrow::after {
  content: '';
  width: 28px; height: 1px;
  background: var(--color-accent);
  opacity: 0.7;
}

/* Italic accent — Cormorant italics are beautiful, use them */
.text-italic {
  font-style: italic;
  font-weight: 400;
  color: var(--color-primary);
}

/* Gradient text — use only once per section for headlines */
.text-gradient {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: textGlow 4s linear infinite;
}

/* Body text */
p, .body-text {
  font-family: var(--font-body);
  color: var(--color-text-body);
  line-height: 1.70;
}

/* Metric numbers in dashboard */
.metric-value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}
```

### 5.4 Light vs Dark Typography Differences

| Element | Light | Dark |
|---|---|---|
| H1 color | `#1A1A1A` charcoal | `#F5EDE0` warm off-white |
| Body text | `#4A4A4A` grey | `#BFA89A` warm muted |
| Muted text | `#888888` | `#7A5A50` warm brown-grey |
| Accent color | `#C9921A` gold | `#E8B84B` lighter gold |
| Primary color | `#7B1C1C` maroon | `#C9603A` burnt orange-maroon |
| Gradient text | Maroon → Gold | Burnt orange → Light gold |

---

## 6. Spacing & Layout Grid

### 6.1 Spacing Scale (8px base)

```css
--space-1:   4px;  --space-2:   8px;   --space-3:  12px;
--space-4:  16px;  --space-5:  20px;   --space-6:  24px;
--space-7:  28px;  --space-8:  32px;   --space-9:  36px;
--space-10: 40px;  --space-12: 48px;   --space-14: 56px;
--space-16: 64px;  --space-18: 72px;   --space-20: 80px;
--space-24: 96px;  --space-28: 112px;  --space-32: 128px;
--space-36: 144px; --space-40: 160px;
```

### 6.2 Container System

```css
.container        { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-8); }
.container-wide   { max-width: 1440px; margin: 0 auto; padding: 0 var(--space-8); }
.container-narrow { max-width: 880px;  margin: 0 auto; padding: 0 var(--space-8); }
.container-xs     { max-width: 640px;  margin: 0 auto; padding: 0 var(--space-6); }

/* Section vertical rhythm */
.section    { padding: var(--space-28) 0; }
.section-xl { padding: var(--space-36) 0; }
.section-lg { padding: var(--space-32) 0; }
.section-sm { padding: var(--space-18) 0; }
```

### 6.3 Grid Templates

```css
/* Standard grids */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); }

/* Prasad-style 3×2 food grid */
.grid-food { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }

/* 2-col alternating (About/Welcome section) */
.grid-about      { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-16); align-items: center; }
.grid-about-flip { grid-template-columns: 1fr 1fr; direction: rtl; } /* flip image side */
.grid-about > * { direction: ltr; }

/* Asymmetric */
.grid-60-40 { display: grid; grid-template-columns: 60fr 40fr; gap: var(--space-16); align-items: center; }
.grid-40-60 { display: grid; grid-template-columns: 40fr 60fr; gap: var(--space-16); align-items: center; }

/* Dashboard layout */
.grid-dashboard { display: grid; grid-template-columns: 260px 1fr; }
```

### 6.4 Border Radius Scale

```css
--radius-sm:   4px;    /* Inline badges, small chips */
--radius-md:   8px;    /* Inputs, small cards */
--radius-lg:   12px;   /* Buttons, form elements */
--radius-xl:   16px;   /* Standard cards */
--radius-2xl:  24px;   /* Large cards, modals */
--radius-3xl:  32px;   /* Hero image frames, big cards */
--radius-full: 9999px; /* Badges, pills, avatars */
```

---

## 7. Gradient & Effect Library

### 7.1 Complete Gradient Definitions

```css
/* ── BUTTONS ────────────────────────────────────────────── */
/* Primary CTA — Gold (light) / Gold shimmer (dark) */
--gradient-btn-primary-lt: linear-gradient(135deg, #C9921A 0%, #A87510 100%);
--gradient-btn-primary-dt: linear-gradient(135deg, #E8B84B 0%, #C9921A 100%);

/* Secondary CTA — Maroon (light) / Burnt orange (dark) */
--gradient-btn-alt-lt:     linear-gradient(135deg, #9B3A3A 0%, #7B1C1C 100%);
--gradient-btn-alt-dt:     linear-gradient(135deg, #E07050 0%, #C9603A 100%);

/* ── HERO OVERLAYS ──────────────────────────────────────── */
--gradient-hero-lt: linear-gradient(
  135deg,
  rgba(90,16,16,0.82)  0%,
  rgba(26,10,10,0.55) 60%,
  rgba(201,146,26,0.08) 100%
);
--gradient-hero-dt: linear-gradient(
  135deg,
  rgba(15,5,8,0.92)    0%,
  rgba(30,8,8,0.72)   60%,
  rgba(232,184,75,0.06) 100%
);

/* ── TEXT GRADIENTS ─────────────────────────────────────── */
--gradient-text-lt: linear-gradient(135deg, #7B1C1C 0%, #C9921A 60%, #E8B84B 100%);
--gradient-text-dt: linear-gradient(135deg, #E07050 0%, #E8B84B 60%, #F5D07A 100%);

/* ── DECORATIVE SECTION GRADIENTS ───────────────────────── */
--gradient-warm-lt: linear-gradient(180deg, #FFF8E7 0%, #FEFAE0 50%, #FFF8E7 100%);
--gradient-warm-dt: linear-gradient(180deg, #160A0A 0%, #1C0D0D 50%, #160A0A 100%);

/* ── FOOTER ─────────────────────────────────────────────── */
--gradient-footer-lt: linear-gradient(180deg, #5A1010 0%, #3D0A0A 100%);
--gradient-footer-dt: linear-gradient(180deg, #0A0306 0%, #050106 100%);

/* ── AMBIENT / MESH BACKGROUNDS ────────────────────────── */
/* Light: subtle warmth */
--gradient-mesh-lt:
  radial-gradient(ellipse 70% 60% at 15% 40%, rgba(201,146,26,0.07) 0%, transparent 60%),
  radial-gradient(ellipse 60% 50% at 85% 60%, rgba(123,28,28,0.05) 0%, transparent 55%),
  #FFFFFF;

/* Dark: dramatic candlelight glow */
--gradient-mesh-dt:
  radial-gradient(ellipse 70% 60% at 15% 50%, rgba(201,96,58,0.12) 0%, transparent 60%),
  radial-gradient(ellipse 55% 50% at 85% 40%, rgba(232,184,75,0.08) 0%, transparent 55%),
  radial-gradient(ellipse 40% 40% at 50% 90%, rgba(90,16,16,0.20) 0%, transparent 60%),
  #0F0508;

/* ── CARD GLOW (dark theme only) ────────────────────────── */
--gradient-card-glow-dt:
  radial-gradient(ellipse at 50% 0%, rgba(232,184,75,0.08), transparent 65%);

/* ── SHIMMER (skeleton loaders) ─────────────────────────── */
--gradient-shimmer-lt: linear-gradient(90deg, #F5EDE0 0%, #FEFAE0 50%, #F5EDE0 100%);
--gradient-shimmer-dt: linear-gradient(90deg, #1C0D0D 0%, #2A1212 50%, #1C0D0D 100%);

/* ── PROGRESS / CHART BARS ──────────────────────────────── */
--gradient-bar:       linear-gradient(90deg, #7B1C1C, #C9921A);
--gradient-bar-dark:  linear-gradient(90deg, #C9603A, #E8B84B);
```

### 7.2 Ornamental Dividers

```css
/* Gold diamond divider — used between section header and content */
.divider-ornament {
  display: flex; align-items: center; gap: 12px;
  margin: var(--space-5) 0;
}
.divider-ornament::before,
.divider-ornament::after {
  content: ''; flex: 0 0 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-accent));
  transition: flex var(--dur-slow) var(--ease-dramatic);
}
.divider-ornament::after {
  background: linear-gradient(to left, transparent, var(--color-accent));
}
.divider-ornament.in-view::before,
.divider-ornament.in-view::after { flex: 0 0 60px; }

.divider-diamond {
  width: 8px; height: 8px;
  background: var(--color-accent);
  transform: rotate(45deg);
}

/* Double line with text */
.divider-text {
  display: flex; align-items: center; gap: 16px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--color-text-muted);
}
.divider-text::before,
.divider-text::after {
  content: ''; flex: 1; height: 1px;
  background: var(--color-border);
}
```

---

## 8. Animation & Motion System

### 8.1 Animation Tokens

```css
/* Durations */
--dur-instant:   80ms;     /* Checkbox, toggle state */
--dur-fast:      150ms;    /* Hover highlights */
--dur-normal:    250ms;    /* Button, nav transitions */
--dur-medium:    400ms;    /* Card entrances */
--dur-slow:      600ms;    /* Section reveals */
--dur-slower:    800ms;    /* Hero elements */
--dur-slowest:   1100ms;   /* Major reveals */
--dur-cinematic: 1500ms;   /* Page transitions */

/* Easing */
--ease-default:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-out:       cubic-bezier(0, 0, 0.2, 1);       /* Entrances */
--ease-in:        cubic-bezier(0.4, 0, 1, 1);       /* Exits */
--ease-bounce:    cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring/pop */
--ease-dramatic:  cubic-bezier(0.16, 1, 0.3, 1);    /* Fast-in, slow-out */
--ease-smooth:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### 8.2 Framer Motion Variants

```typescript
// src/lib/motion-variants.ts

// ── ENTRANCE ──────────────────────────────────────────────
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

// ── STAGGER CONTAINERS ─────────────────────────────────────
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

// ── HERO SEQUENCE ──────────────────────────────────────────
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

// ── INTERACTIVE ────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0, boxShadow: "0 2px 12px rgba(123,28,28,0.08)" },
  hover: { y: -6, boxShadow: "0 16px 40px rgba(123,28,28,0.18)",
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }
};

export const cardHoverDark = {
  rest:  { y: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.40)" },
  hover: { y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.55), 0 0 40px rgba(232,184,75,0.10)",
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

// ── PAGE TRANSITION ────────────────────────────────────────
export const pageTransition = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.30, ease: [0.4, 0, 1, 1] } }
};
```

### 8.3 GSAP Patterns

```typescript
// src/lib/gsap-animations.ts
import { gsap }          from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText }     from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ── PARALLAX HERO BG ──────────────────────────────────────
export function initParallax(selector: string, speed = 0.3) {
  gsap.to(selector, {
    yPercent: speed * 100, ease: "none",
    scrollTrigger: { trigger: selector, start: "top top", end: "bottom top", scrub: true }
  });
}

// ── ANIMATED COUNTER ──────────────────────────────────────
export function animateCounter(el: HTMLElement, target: number, suffix = "", duration = 2.2) {
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el, start: "top 82%", once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target, duration, ease: "power2.out",
        onUpdate: () => { el.textContent = Math.floor(obj.val).toLocaleString() + suffix; }
      });
    }
  });
}

// ── SPLIT TEXT HEADLINE ───────────────────────────────────
export function splitReveal(selector: string, delay = 0) {
  const el = document.querySelector(selector);
  if (!el) return;
  const split = new SplitText(el, { type: "lines,words" });
  gsap.from(split.words, {
    opacity: 0, y: 36, rotateX: -20,
    stagger: 0.025, duration: 0.65,
    ease: "back.out(1.5)", delay,
    scrollTrigger: { trigger: selector, start: "top 82%", once: true }
  });
}

// ── PIPELINE PROGRESS LINE ────────────────────────────────
export function animatePipelineLine(lineEl: string, triggerEl: string) {
  gsap.fromTo(lineEl,
    { scaleX: 0, transformOrigin: "left" },
    { scaleX: 1, duration: 2.0, ease: "power2.out",
      scrollTrigger: { trigger: triggerEl, start: "top 72%", once: true }
    }
  );
}

// ── FLOATING ORBS ─────────────────────────────────────────
export function initFloatingOrbs(selector: string) {
  const orbs = gsap.utils.toArray<HTMLElement>(selector);
  orbs.forEach((orb, i) => {
    gsap.to(orb, {
      y: "random(-25, 25)", x: "random(-18, 18)",
      scale: "random(0.92, 1.08)",
      duration: "random(5, 9)", repeat: -1, yoyo: true,
      ease: "sine.inOut", delay: i * 0.9,
    });
  });
}

// ── HORIZONTAL SCROLL (feature showcase) ──────────────────
export function initHorizontalScroll(containerEl: string) {
  const cards = gsap.utils.toArray<HTMLElement>(`${containerEl} .h-card`);
  const totalWidth = cards.reduce((acc, c) => acc + c.offsetWidth + 20, 0);
  gsap.to(cards, {
    x: () => -(totalWidth - window.innerWidth + 96),
    ease: "none",
    scrollTrigger: {
      trigger: containerEl, pin: true, scrub: 1.0,
      start: "top top", end: () => `+=${totalWidth}`
    }
  });
}

// ── STAGGER CARD REVEAL ───────────────────────────────────
export function staggerReveal(containerEl: string, childEl: string) {
  ScrollTrigger.create({
    trigger: containerEl, start: "top 76%", once: true,
    onEnter: () => {
      gsap.from(`${containerEl} ${childEl}`, {
        opacity: 0, y: 44, scale: 0.94,
        stagger: 0.10, duration: 0.65, ease: "power3.out"
      });
    }
  });
}

// ── PROGRESS BARS (analytics) ─────────────────────────────
export function animateProgressBar(el: string, width: string, delay = 0) {
  gsap.fromTo(el,
    { width: "0%", opacity: 0.5 },
    { width, opacity: 1, duration: 1.5, delay, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 84%", once: true }
    }
  );
}

// ── NAVBAR SCROLL GLASS EFFECT ────────────────────────────
export function initNavbarScroll(navEl: string) {
  let lastScroll = 0;
  ScrollTrigger.create({
    start: 50,
    onUpdate: (self) => {
      const nav = document.querySelector(navEl) as HTMLElement;
      if (!nav) return;
      const curr = self.scroll();
      const down = curr > lastScroll;
      // Glass effect
      gsap.to(nav, {
        background: curr > 50
          ? "var(--color-bg-nav)"
          : "transparent",
        backdropFilter: curr > 50 ? "blur(20px) saturate(160%)" : "blur(0px)",
        boxShadow: curr > 50 ? "var(--shadow-nav)" : "none",
        duration: 0.4
      });
      // Hide on scroll down
      gsap.to(nav, {
        y: down && curr > 280 ? -76 : 0,
        duration: 0.4, ease: "power2.out"
      });
      lastScroll = curr;
    }
  });
}

// ── MAGNETIC BUTTON ───────────────────────────────────────
export function initMagneticButton(selector: string, strength = 0.28) {
  const btn = document.querySelector(selector) as HTMLElement;
  if (!btn) return;
  btn.addEventListener("mousemove", (e: MouseEvent) => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * strength;
    const dy = (e.clientY - (r.top  + r.height / 2)) * strength;
    gsap.to(btn, { x: dx, y: dy, duration: 0.35, ease: "power2.out" });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.5)" });
  });
}
```

### 8.4 CSS Keyframe Library

```css
/* ── ENTRANCE ─────────────────────────────── */
@keyframes fadeUp    { from { opacity:0; transform:translateY(40px); filter:blur(5px); } to { opacity:1; transform:none; filter:none; } }
@keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
@keyframes scaleIn   { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
@keyframes slideLeft { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:none; } }

/* ── LOOPING / AMBIENT ────────────────────── */
@keyframes float    { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }
@keyframes floatX   { 0%,100%{ transform:translateX(0); } 50%{ transform:translateX(8px); } }
@keyframes pulse    { 0%,100%{ opacity:.7; transform:scale(1); } 50%{ opacity:1; transform:scale(1.05); } }
@keyframes spin     { from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
@keyframes glow     { 0%,100%{ box-shadow:0 0 12px rgba(201,146,26,.2); } 50%{ box-shadow:0 0 32px rgba(201,146,26,.55); } }

/* Dark theme glow (amber) */
@keyframes glowAmber { 0%,100%{ box-shadow:0 0 16px rgba(232,184,75,.15); } 50%{ box-shadow:0 0 40px rgba(232,184,75,.45), 0 0 80px rgba(232,184,75,.10); } }

/* ── TEXT ─────────────────────────────────── */
@keyframes textGlow { 0%{ background-position:200% center; } 100%{ background-position:-200% center; } }
@keyframes typewriter { from{ width:0; } to{ width:100%; } }
@keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0; } }

/* ── DECORATIVE ───────────────────────────── */
@keyframes drawLine { from{ width:0; } to{ width:100%; } }
@keyframes shimmer { 0%{ background-position:-200% 0; } 100%{ background-position:200% 0; } }
@keyframes scrollBounce { 0%,100%{ transform:translateY(0); opacity:1; } 50%{ transform:translateY(10px); opacity:.4; } }
@keyframes scanLine { from{ background-position:0 -100%; } to{ background-position:0 200%; } }

/* ── TOASTS / NOTIFICATIONS ───────────────── */
@keyframes toastIn  { from{ opacity:0; transform:translateX(100%) scale(.9); } to{ opacity:1; transform:none; } }
@keyframes toastOut { from{ opacity:1; transform:none; } to{ opacity:0; transform:translateX(100%); } }
```

### 8.5 Page Load Sequence

```
TIMELINE (every page):
   0ms   ─ Navbar fades down (fadeDown, 500ms)
 200ms   ─ Hero badge pops in (scaleIn + bounce, 450ms)
 400ms   ─ Hero line 1 rises (heroLine, 880ms, blur fade)
 540ms   ─ Hero line 2 rises (heroLine, 880ms)
 680ms   ─ Hero line 3 rises (heroLine, 880ms)
 780ms   ─ Hero subtext fades up (fadeUp, 620ms)
 860ms   ─ Hero CTAs bounce in (scaleIn + spring, 550ms)
1050ms   ─ Scroll indicator fades in → float loop begins
1100ms   ─ Stats row staggered up (100ms apart)
1300ms   ─ BG orbs float animation starts (GSAP)
1500ms   ─ Hero image parallax begins on scroll
```

### 8.6 Scroll Animation Rules

```
RULE 1: Trigger at 15% visibility (amount: 0.15 in Framer, "top 80%" in GSAP)
RULE 2: All grids use stagger — left-to-right, top-to-bottom
RULE 3: Use blur(5px→0) on headlines only — DO NOT use on elements <28px
RULE 4: Exits: opacity 0 + translateY(-12px) — feel natural, go up
RULE 5: Reduced motion: opacity only — no transform, no blur, no stagger
RULE 6: Only animate: opacity, transform, filter — NEVER layout properties
RULE 7: will-change: transform on any element animating > 3 times per session
```

---

## 9. Component Library

### 9.1 Navbar

```
Layout:
  [Logo mark + Brand name]          [Nav links]          [Theme toggle + CTA]

Spec:
  Height:          72px desktop / 60px mobile
  Default:         transparent bg
  Scrolled:        var(--color-bg-nav) + backdrop-filter: blur(20px)
  Border-bottom:   none → 1px solid var(--color-border) on scroll
  Auto-hide:       translateY(-76px) when scrolling down, restores up
  z-index:         1000

Nav link:
  Font:            14px, 500 weight, var(--font-body)
  Default color:   var(--color-text-muted)
  Hover:           var(--color-text-h)
  Active:          var(--color-primary) + bg: var(--color-primary-ghost)
  Underline anim:  pseudo ::after, scaleX(0→1) from left, height 2px, var(--color-accent)

Mobile nav:
  Hamburger → X: 3 lines animated with GSAP stagger
  Drawer: full-height right panel, translateX(100%→0)
  Backdrop: rgba overlay + blur
```

### 9.2 Button System

```css
/* Base */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 28px;
  font-family: var(--font-body); font-size: 14px; font-weight: 600;
  border-radius: var(--radius-lg);
  border: 1.5px solid transparent;
  cursor: pointer; white-space: nowrap; user-select: none;
  position: relative; overflow: hidden;
  transition:
    transform var(--dur-normal) var(--ease-bounce),
    box-shadow var(--dur-normal) var(--ease-out),
    filter var(--dur-normal) var(--ease-out);
}
.btn:active { transform: scale(0.96); }

/* Ripple on click */
.btn::after {
  content: ''; position: absolute; inset: 50%;
  background: rgba(255,255,255,0.25);
  border-radius: 50%; transform: scale(0); transition: none;
}
.btn:active::after {
  inset: -50%; transform: scale(1); opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

/* PRIMARY — Gold CTA (like Prasad's "Reserve a Table") */
.btn-primary {
  background: var(--gradient-btn);
  color: #fff;
  box-shadow: var(--shadow-btn);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-btn-hover);
  filter: brightness(1.08);
}

/* SECONDARY — Maroon/Brand */
.btn-secondary {
  background: var(--gradient-btn-alt);
  color: #fff;
  box-shadow: 0 4px 16px rgba(123,28,28,0.30);
}
.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(123,28,28,0.45);
}

/* OUTLINE */
.btn-outline {
  background: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn-outline:hover {
  background: var(--color-primary);
  color: #fff;
  transform: translateY(-2px);
}

/* GHOST — For dark hero/overlay areas */
.btn-ghost {
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(12px);
  border-color: rgba(255,255,255,0.25);
  color: #fff;
}
.btn-ghost:hover { background: rgba(255,255,255,0.18); }

/* SIZES */
.btn-sm  { padding: 8px 20px;  font-size: 13px; }
.btn-md  { padding: 12px 28px; font-size: 14px; } /* default */
.btn-lg  { padding: 14px 36px; font-size: 15px; }
.btn-xl  { padding: 18px 48px; font-size: 16px; }
```

### 9.3 Card Component

```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  position: relative; overflow: hidden;
  transition:
    transform var(--dur-normal) var(--ease-out),
    border-color var(--dur-normal) var(--ease-out),
    box-shadow var(--dur-normal) var(--ease-out);
  box-shadow: var(--shadow-card);
}

/* Sweep shimmer on hover */
.card::before {
  content: '';
  position: absolute; top: 0; left: -100%; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  transition: left var(--dur-slow) var(--ease-out);
}
.card:hover::before { left: 100%; }

/* Top accent bar */
.card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--gradient-btn);
  transform: scaleX(0); transform-origin: left;
  transition: transform var(--dur-medium) var(--ease-dramatic);
}
.card:hover::after { transform: scaleX(1); }

.card:hover {
  transform: translateY(-6px);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-hover);
}

/* Icon container — maroon circle (matches Prasad style) */
.card-icon {
  width: 54px; height: 54px; border-radius: 50%;
  background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: #fff; margin-bottom: 18px;
  transition: transform var(--dur-normal) var(--ease-bounce),
              background var(--dur-normal) var(--ease-out);
}
.card:hover .card-icon {
  transform: scale(1.10) rotate(8deg);
  background: var(--color-accent);
}

/* Dark theme card — inner top glow */
[data-theme="dark"] .card::before {
  /* Override with amber glow for dark theme */
  background: linear-gradient(90deg, transparent, rgba(232,184,75,0.6), transparent);
}
[data-theme="dark"] .card:hover {
  box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 32px rgba(232,184,75,0.08);
}
```

### 9.4 Feature Card (Prasad-Style)

```
Matches the "Why Choose Us" and "Commitment to Excellence" cards from Prasad:

Structure:
  [Icon — round maroon bg, white icon, 54px]
  [Badge]
  [Title — 18px, 700, display font]
  [Description — 14px, muted color, 3 lines max]

Light theme:
  Background: #FFFFFF
  Border: 1px solid #E8E0D0
  Shadow: 0 2px 12px rgba(123,28,28,0.08)
  Hover border: rgba(123,28,28,0.25)
  Hover shadow: 0 12px 40px rgba(123,28,28,0.14)
  Icon bg: #7B1C1C → #C9921A on hover

Dark theme:
  Background: #1C0D0D
  Border: 1px solid rgba(201,96,58,0.15)
  Shadow: 0 4px 20px rgba(0,0,0,0.40)
  Hover border: rgba(232,184,75,0.35)
  Hover shadow: 0 20px 48px rgba(0,0,0,0.55) + amber glow
  Icon bg: #C9603A → #E8B84B on hover
```

### 9.5 Badge / Chip System

```css
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 11px; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
  white-space: nowrap;
}

/* Light theme badges */
[data-theme="light"] .badge-primary { background:rgba(123,28,28,.10); border:1px solid rgba(123,28,28,.22); color:#7B1C1C; }
[data-theme="light"] .badge-accent  { background:rgba(201,146,26,.10);border:1px solid rgba(201,146,26,.22);color:#A87510; }
[data-theme="light"] .badge-green   { background:rgba(46,125,50,.10); border:1px solid rgba(46,125,50,.22); color:#2E7D32; }
[data-theme="light"] .badge-neutral { background:rgba(136,136,136,.10);border:1px solid rgba(136,136,136,.20);color:#555; }

/* Dark theme badges */
[data-theme="dark"]  .badge-primary { background:rgba(201,96,58,.15);  border:1px solid rgba(201,96,58,.30);  color:#E07050; }
[data-theme="dark"]  .badge-accent  { background:rgba(232,184,75,.12); border:1px solid rgba(232,184,75,.28); color:#E8B84B; }
[data-theme="dark"]  .badge-green   { background:rgba(76,175,80,.12);  border:1px solid rgba(76,175,80,.28);  color:#4CAF50; }
[data-theme="dark"]  .badge-neutral { background:rgba(122,90,80,.15);  border:1px solid rgba(122,90,80,.25);  color:#BFA89A; }
```

### 9.6 Section Header

```tsx
// Pattern: used on EVERY section, both themes
<SectionHeader
  eyebrow="Lead Pipeline"
  title="End-to-end lifecycle, tracked."
  titleHighlight="lifecycle,"     // gradient highlight on this word
  subtitle="From first call to final feedback — 9 structured stages."
  align="center" // or "left"
/>
```

```css
.section-header { margin-bottom: var(--space-16); }
.section-header.center { text-align: center; }

.eyebrow {
  font-family: var(--font-body);
  font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--color-accent);
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.eyebrow::before, .eyebrow::after {
  content: ''; width: 24px; height: 1px;
  background: var(--color-accent); opacity: 0.6;
}
.center .eyebrow { justify-content: center; }

.section-header h2 {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 700;
  font-style: italic;               /* Cormorant italic is key */
  color: var(--color-text-h);
  letter-spacing: -0.5px;
  line-height: 1.18;
  margin-bottom: 14px;
}

.section-header p {
  font-size: 17px;
  color: var(--color-text-muted);
  line-height: 1.72;
  max-width: 580px;
}
.center .section-header p { margin: 0 auto; }
```

### 9.7 Form Inputs

```css
.input {
  width: 100%; padding: 13px 16px;
  background: var(--color-primary-ghost);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-body); font-size: 15px;
  color: var(--color-text-h); outline: none;
  transition: border-color var(--dur-normal) var(--ease-out),
              background var(--dur-normal) var(--ease-out),
              box-shadow var(--dur-normal) var(--ease-out);
}
.input::placeholder { color: var(--color-text-muted); }
.input:hover { border-color: rgba(123,28,28,0.25); }
.input:focus {
  background: var(--color-accent-ghost);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(201,146,26,0.12);
}
[data-theme="dark"] .input:focus {
  box-shadow: 0 0 0 4px rgba(232,184,75,0.12);
}

/* Floating label */
.input-group { position: relative; }
.input-label {
  position: absolute; left: 14px; top: 14px;
  font-size: 15px; color: var(--color-text-muted);
  pointer-events: none; padding: 0 4px;
  transition: all var(--dur-medium) var(--ease-out);
}
.input:focus ~ .input-label,
.input:not(:placeholder-shown) ~ .input-label {
  top: -8px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.5px; color: var(--color-accent);
  background: var(--color-bg-card);
}
```

### 9.8 Testimonial Card (Prasad-Style)

```css
/* Matches the "What Our Guests Say About Us" cards exactly */
.testimonial-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-7);
  position: relative;
  transition: transform var(--dur-normal) var(--ease-out),
              box-shadow var(--dur-normal) var(--ease-out);
  box-shadow: var(--shadow-card);
}

/* Large quote mark */
.testimonial-card::before {
  content: '\201C';
  position: absolute; top: -8px; left: 20px;
  font-family: var(--font-display);
  font-size: 72px; line-height: 1;
  color: var(--color-accent); opacity: 0.2;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

/* Avatar */
.testimonial-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--color-primary-ghost);
  border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--color-primary);
  margin-bottom: var(--space-3);
}

/* Stars — animated on scroll enter */
.star-rating .star {
  color: var(--color-star);
  animation: scaleIn var(--dur-fast) var(--ease-bounce) both;
}
.star-rating .star:nth-child(1) { animation-delay: 0.05s; }
.star-rating .star:nth-child(2) { animation-delay: 0.10s; }
.star-rating .star:nth-child(3) { animation-delay: 0.15s; }
.star-rating .star:nth-child(4) { animation-delay: 0.20s; }
.star-rating .star:nth-child(5) { animation-delay: 0.25s; }
```

### 9.9 Sidebar Navigation

```css
.sidebar {
  width: 260px; min-height: 100vh;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-1);
}

.sidebar-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: 10px var(--space-4);
  border-radius: var(--radius-lg);
  font-size: 14px; font-weight: 500;
  color: var(--color-text-muted); cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
  position: relative;
}
.sidebar-item:hover {
  background: var(--color-primary-ghost);
  color: var(--color-text-h);
}
.sidebar-item.active {
  background: var(--color-primary-ghost);
  color: var(--color-primary);
  font-weight: 600;
}
.sidebar-item.active::before {
  content: '';
  position: absolute; left: 0; top: 6px; bottom: 6px;
  width: 3px; background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}
```

### 9.10 Footer Component

```css
/* Matches Prasad footer — deep maroon bg */
.footer {
  background: var(--gradient-footer);
  color: var(--color-text-footer);
  padding: var(--space-24) 0 0;
  position: relative;
}

/* Diagonal top cut */
.footer::before {
  content: '';
  position: absolute; top: -48px; left: 0; right: 0; height: 80px;
  background: var(--gradient-footer);
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}

/* Footer link hover */
.footer-link {
  font-size: 14px; color: var(--color-text-footer);
  transition: color var(--dur-fast) var(--ease-out),
              padding-left var(--dur-fast) var(--ease-out);
  cursor: pointer;
}
.footer-link:hover {
  color: var(--color-accent);
  padding-left: var(--space-2);
}

/* Social icons */
.social-icon {
  width: 38px; height: 38px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: rgba(255,255,255,0.65);
  transition: all var(--dur-normal) var(--ease-bounce);
}
.social-icon:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
  transform: translateY(-3px);
}
```

### 9.11 Modal / Dialog

```tsx
const modalVariants = {
  hidden:  { opacity: 0, scale: 0.90, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] } },
  exit:    { opacity: 0, scale: 0.96, y: -14,
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } }
};
```

```css
.modal {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-accent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-modal);
  max-width: 560px; width: 100%;
}
[data-theme="dark"] .modal {
  box-shadow: 0 24px 80px rgba(0,0,0,0.70), 0 0 60px rgba(232,184,75,0.05);
}
```

### 9.12 Toast Notifications

```css
.toast {
  display: flex; align-items: flex-start; gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  backdrop-filter: blur(16px);
}
.toast-success { border-left: 3px solid var(--color-success); }
.toast-error   { border-left: 3px solid var(--color-danger); }
.toast-info    { border-left: 3px solid var(--color-primary); }
.toast-warning { border-left: 3px solid var(--color-accent); }
```

---

## 10. Page Templates & Section Order

### 10.1 Global Page Wrapper

```
<body data-theme="light | dark">
  <Navbar />                ← fixed, z: 1000
  <main>
    [HERO or PAGE BANNER]
    [SECTIONS...]
  </main>
  <Footer />
  <BackToTop />
  <ToastContainer />
</body>
```

### 10.2 Home / Landing Page Sections

```
1.  HERO                — full viewport, parallax bg, overlay, headline + CTA
2.  TRUSTED BY STRIP    — client logos, horizontal scroll ticker
3.  PROBLEM/SOLUTION    — 2-col: pain points + live dashboard mockup
4.  FEATURES GRID       — 3×3 card grid, stagger reveal, Prasad-style icons
5.  LEAD PIPELINE       — 9-step interactive horizontal timeline
6.  ANALYTICS PREVIEW   — 2-col: bar chart + KPI meter cards
7.  REVIEW SYSTEM       — sentiment summary + filterable review cards
8.  BONUS FEATURES      — 3×2 icon card grid
9.  TESTIMONIALS        — 3 testimonial cards (Prasad-style)
10. PRICING             — 3 tier cards + monthly/annual toggle
11. CTA BANNER          — full-width card with gradient bg + dual CTAs
12. FOOTER              — 4-5 col, deep maroon (matches Prasad footer)
```

### 10.3 Other Pages

**Features Page:** Banner → Tabbed feature showcase → Deep-dive 2-col sections → Module grid → Integration strip → CTA

**Pricing Page:** Banner → Toggle → 3-tier cards → Comparison table → FAQ accordion → CTA

**About Page:** Banner → Mission callout → Stats row (animated counters) → Team grid → Timeline → Values → CTA

**Contact Page:** Banner → 40/60 split (contact info / form) → FAQ

**Dashboard (App):** Sidebar + main canvas → Stats row → Charts → Tables → Calendar

---

## 11. Visual Effects & Backgrounds

### 11.1 Hero Background (Both Themes)

```css
/* LIGHT — Warm restaurant image + maroon overlay */
.hero-bg-lt {
  background-image:
    var(--gradient-hero),  /* maroon overlay */
    url('/images/hero-restaurant.jpg');
  background-size: cover;
  background-position: center;
}

/* DARK — Same image, deeper overlay + ambient warmth */
.hero-bg-dt {
  background-image:
    var(--gradient-hero),
    radial-gradient(ellipse 60% 80% at 15% 50%, rgba(201,96,58,0.15), transparent 60%),
    radial-gradient(ellipse 50% 60% at 85% 40%, rgba(232,184,75,0.08), transparent 60%),
    url('/images/hero-restaurant.jpg');
  background-size: cover;
  background-position: center;
}

/* Parallax wrapper */
.hero-img {
  position: absolute; inset: 0;
  will-change: transform;
  animation: heroZoom 12s var(--ease-smooth) forwards;
}
@keyframes heroZoom {
  from { transform: scale(1.08); }
  to   { transform: scale(1.00); }
}
```

### 11.2 Ambient Mesh Backgrounds (Section BGs)

```css
/* LIGHT THEME — subtle warm mesh */
.bg-mesh-lt {
  background:
    radial-gradient(ellipse 65% 55% at 12% 38%, rgba(201,146,26,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 55% 45% at 88% 62%, rgba(123,28,28,0.04) 0%, transparent 55%),
    #FFFFFF;
}

/* DARK THEME — dramatic candlelight warmth */
.bg-mesh-dt {
  background:
    radial-gradient(ellipse 65% 55% at 12% 42%, rgba(201,96,58,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 55% 45% at 88% 58%, rgba(232,184,75,0.09) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 50% 88%, rgba(90,16,16,0.18) 0%, transparent 60%),
    #0F0508;
}
```

### 11.3 Section Background Patterns

```css
/* Cream section (light) — matches Prasad's "Why Choose Us" */
.section-cream {
  background: #FFF8E7;
}
/* Dark equivalent */
[data-theme="dark"] .section-cream {
  background: #160A0A;
}

/* Dot pattern overlay — subtle texture */
.bg-dots {
  background-image: radial-gradient(
    circle,
    var(--color-border) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

/* Diagonal lines texture */
.bg-lines {
  background-image: repeating-linear-gradient(
    45deg,
    var(--color-border) 0px,
    var(--color-border) 1px,
    transparent 1px,
    transparent 20px
  );
}
```

### 11.4 Glow Orb Component

```css
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(56px);
  pointer-events: none;
  /* color, width, height, opacity, left, top via inline style */
}

/* Light theme — subtle warmth */
/* Usage: color="#C9921A" size={300} opacity={0.08} */

/* Dark theme — dramatic glow */
/* Usage: color="#E8B84B" size={400} opacity={0.15} */
```

### 11.5 Noise Grain Texture

```css
/* Apply to hero and CTA sections for premium tactility */
.texture-grain::after {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.35; mix-blend-mode: multiply;
  pointer-events: none;
}
[data-theme="dark"] .texture-grain::after {
  mix-blend-mode: screen; opacity: 0.20;
}
```

---

## 12. Micro-interactions Catalogue

### Complete Hover State Reference

| Element | Light Theme Hover | Dark Theme Hover | Duration |
|---|---|---|---|
| Nav link | color → maroon, underline expands | color → warm off-white | 200ms |
| Nav CTA btn | gold brightens + lift | amber brightens + glow | 200ms |
| Feature card | lift -6px, border → maroon tint, shadow | lift -6px, border → amber, amber glow | 250ms |
| Gold CTA btn | brightness + shadow intensify | brightness + amber glow pulse | 200ms |
| Maroon btn | darken + shadow | burnt-orange intensify | 200ms |
| Testimonial card | lift -5px + shadow | lift -5px + dark shadow | 250ms |
| Food image | scale(1.06) + warm overlay | scale(1.06) + dark amber overlay | 350ms |
| Gallery item | scale + overlay + icon appears | scale + dark overlay | 350ms |
| Sidebar item | maroon ghost bg | burnt orange ghost bg | 120ms |
| Footer link | color → gold + indent | color → light gold + indent | 150ms |
| Social icon | gold bg fill + lift | amber fill + glow | 200ms |
| Input field | border → maroon tint | border → amber tint | 200ms |
| Input focused | gold border + glow ring | amber border + glow | 250ms |
| Star rating | pulse glow | amber pulse glow | 300ms |
| Badge | scale(1.02) | scale(1.02) + subtle glow | 150ms |
| Pipeline step | scale(1.12) + maroon glow | scale(1.12) + amber glow | 300ms |
| Accordion row | chevron rotates 180° | chevron rotates 180° | 250ms |

### Scroll Indicator

```css
.scroll-indicator { position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); }
.scroll-mouse {
  width: 22px; height: 36px;
  border: 2px solid rgba(255,255,255,0.35);
  border-radius: 11px;
  display: flex; justify-content: center; padding-top: 6px;
}
.scroll-dot {
  width: 3px; height: 7px;
  background: var(--color-accent);
  border-radius: 2px;
  animation: scrollBounce 2s ease-in-out infinite;
}
```

### Back-to-Top Button

```css
.back-to-top {
  position: fixed; bottom: var(--space-6); right: var(--space-6);
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--gradient-btn);
  color: #fff; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-btn);
  opacity: 0; transform: translateY(16px);
  transition: all var(--dur-normal) var(--ease-out);
  z-index: 500; cursor: pointer;
}
.back-to-top.visible { opacity: 1; transform: translateY(0); }
.back-to-top:hover { transform: translateY(-3px); box-shadow: var(--shadow-btn-hover); }
```

---

## 13. Responsive Design Rules

### 13.1 Breakpoints

```css
--bp-xs:   375px;   /* iPhone SE */
--bp-sm:   640px;   /* Large mobile */
--bp-md:   768px;   /* Tablet portrait */
--bp-lg:   1024px;  /* Tablet landscape / small desktop */
--bp-xl:   1200px;  /* Standard desktop */
--bp-2xl:  1440px;  /* Large desktop */
```

### 13.2 Component Responsive Rules

| Component | Mobile (<768) | Tablet (768-1024) | Desktop (>1024) |
|---|---|---|---|
| Container padding | 16px | 24px | 32px |
| Hero min-height | 100svh | 90vh | 100vh |
| Hero H1 | 38px | 52px | clamp |
| Section padding | 56px 0 | 72px 0 | 112px 0 |
| Feature grid | 1 col | 2 col | 3 col |
| Food/Gallery grid | 2 col | 3 col | 3 col |
| Testimonials | 1 col | 2 col | 3 col |
| Pipeline steps | 3×3 | 5+4 | 9 in a row |
| About 2-col | stacked | stacked | side-by-side |
| Pricing | stacked | stacked | 3-col |
| Footer | 2 col | 2 col | 4-5 col |
| Navbar | hamburger + drawer | hamburger | full links |
| Dashboard | bottom tabs | icon sidebar | full sidebar |

---

## 14. Accessibility Standards

### 14.1 Contrast Ratios

| Foreground | Background | Ratio | Result |
|---|---|---|---|
| `#1A1A1A` on `#FFFFFF` | | 16.1:1 | ✅ AAA |
| `#4A4A4A` on `#FFFFFF` | | 9.7:1 | ✅ AAA |
| `#888888` on `#FFFFFF` | | 3.9:1 | ⚠️ AA large only |
| `#FFFFFF` on `#7B1C1C` | | 8.5:1 | ✅ AAA |
| `#FFFFFF` on `#C9921A` | | 2.7:1 | ❌ Use dark text on gold |
| `#1A1A1A` on `#C9921A` | | 7.6:1 | ✅ AAA — use this |
| `#F5EDE0` on `#0F0508` | | 14.2:1 | ✅ AAA (dark theme) |
| `#BFA89A` on `#0F0508` | | 7.1:1 | ✅ AAA (dark theme) |
| `#E8B84B` on `#1C0D0D` | | 9.4:1 | ✅ AAA (dark theme) |

**Important:** Never place white text on gold (`#C9921A`). Always use dark text (`#1A0A05` or `#1A1A1A`) on gold backgrounds.

### 14.2 Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 6px;
}
:focus:not(:focus-visible) { outline: none; }

.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  box-shadow: 0 0 0 6px var(--color-accent-ghost);
}
```

### 14.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
  [data-animate], [data-animate-stagger] > * {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
```

```tsx
// Framer Motion
import { useReducedMotion } from "framer-motion";
const reduce = useReducedMotion();
// If reduce === true, skip all animation variants
```

---

## 15. CSS Variables Master Sheet

```css
/* ================================================================
   BANQUETOS — FULL DESIGN TOKEN SYSTEM
   Include as: src/styles/tokens.css → imported in globals.css
   Theme is controlled via: data-theme="light|dark" on <html>
   ================================================================ */

:root {
  /* ── FONTS ──────────────────────────────────────── */
  --font-display: 'Cormorant Garamond', 'Libre Baskerville', Georgia, serif;
  --font-body:    'DM Sans', 'Outfit', Helvetica, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  /* ── TYPE SCALE ─────────────────────────────────── */
  --text-hero:  clamp(3rem,   7vw, 5.5rem);
  --text-h1:    clamp(2.5rem, 5vw, 4rem);
  --text-h2:    clamp(2rem,   3.5vw, 2.75rem);
  --text-h3:    clamp(1.5rem, 2.5vw, 2rem);
  --text-h4:    1.375rem;
  --text-xl:    1.25rem;
  --text-lg:    1.125rem;
  --text-base:  1rem;
  --text-sm:    0.875rem;
  --text-xs:    0.75rem;
  --text-2xs:   0.6875rem;

  /* ── SPACING ─────────────────────────────────────── */
  --space-1:  4px;  --space-2:  8px;   --space-3:  12px;
  --space-4:  16px; --space-5:  20px;  --space-6:  24px;
  --space-7:  28px; --space-8:  32px;  --space-9:  36px;
  --space-10: 40px; --space-12: 48px;  --space-14: 56px;
  --space-16: 64px; --space-18: 72px;  --space-20: 80px;
  --space-24: 96px; --space-28: 112px; --space-32: 128px;
  --space-36: 144px;--space-40: 160px;

  /* ── BORDER RADIUS ───────────────────────────────── */
  --radius-sm:   4px;   --radius-md:   8px;
  --radius-lg:   12px;  --radius-xl:   16px;
  --radius-2xl:  24px;  --radius-3xl:  32px;
  --radius-full: 9999px;

  /* ── ANIMATION DURATIONS ─────────────────────────── */
  --dur-instant:   80ms;  --dur-fast:    150ms;
  --dur-normal:    250ms; --dur-medium:  400ms;
  --dur-slow:      600ms; --dur-slower:  800ms;
  --dur-slowest:   1100ms;--dur-cinematic:1500ms;

  /* ── EASING ──────────────────────────────────────── */
  --ease-default:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-dramatic: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-smooth:   cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring:   cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ── LAYOUT ──────────────────────────────────────── */
  --max-width:        1200px;
  --max-width-wide:   1440px;
  --max-width-narrow: 880px;
  --max-width-xs:     640px;
  --nav-height:       72px;

  /* ── Z-INDEX ─────────────────────────────────────── */
  --z-below:    -1;   --z-base:      0;
  --z-raised:   10;   --z-dropdown:  100;
  --z-sticky:   200;  --z-overlay:   500;
  --z-nav:      1000; --z-modal:     9000;
  --z-toast:    9500; --z-top:       9999;
}

/* ════════════════════════════════════════════════════
   LIGHT THEME (default)
   ════════════════════════════════════════════════════ */
:root, [data-theme="light"] {

  /* Backgrounds */
  --color-bg:            #FFFFFF;
  --color-bg-alt:        #FFF8E7;
  --color-bg-alt2:       #FEFAE0;
  --color-bg-card:       #FFFFFF;
  --color-bg-card-hover: #FFFDF5;
  --color-bg-nav:        rgba(255,255,255,0.96);
  --color-bg-overlay:    rgba(90,16,16,0.72);
  --color-bg-footer:     #5A1010;

  /* Brand */
  --color-primary:       #7B1C1C;
  --color-primary-dark:  #5A1010;
  --color-primary-light: #9B3A3A;
  --color-primary-ghost: rgba(123,28,28,0.08);
  --color-accent:        #C9921A;
  --color-accent-dark:   #A87510;
  --color-accent-light:  #E8B84B;
  --color-accent-ghost:  rgba(201,146,26,0.10);

  /* Text */
  --color-text-h:        #1A1A1A;
  --color-text-body:     #4A4A4A;
  --color-text-muted:    #888888;
  --color-text-inverse:  #FFFFFF;
  --color-text-on-gold:  #1A1A1A;
  --color-text-footer:   rgba(255,255,255,0.75);

  /* Borders */
  --color-border:        #E8E0D0;
  --color-border-hover:  rgba(123,28,28,0.25);
  --color-border-accent: rgba(201,146,26,0.30);

  /* Semantic */
  --color-star:          #F5A623;
  --color-success:       #2E7D32;
  --color-danger:        #C0392B;
  --color-warning:       #E67E22;
  --color-info:          #1565C0;

  /* Shadows */
  --shadow-card:   0 2px 12px rgba(123,28,28,0.08), 0 1px 3px rgba(0,0,0,0.05);
  --shadow-hover:  0 12px 40px rgba(123,28,28,0.14), 0 4px 16px rgba(0,0,0,0.08);
  --shadow-nav:    0 2px 20px rgba(0,0,0,0.08);
  --shadow-btn:    0 4px 16px rgba(201,146,26,0.35);
  --shadow-btn-hover: 0 8px 28px rgba(201,146,26,0.50);
  --shadow-modal:  0 24px 80px rgba(0,0,0,0.25);

  /* Gradients */
  --gradient-hero:    linear-gradient(135deg, rgba(90,16,16,0.82) 0%, rgba(26,10,10,0.55) 60%, rgba(201,146,26,0.08) 100%);
  --gradient-btn:     linear-gradient(135deg, #C9921A 0%, #A87510 100%);
  --gradient-btn-alt: linear-gradient(135deg, #9B3A3A 0%, #7B1C1C 100%);
  --gradient-text:    linear-gradient(135deg, #7B1C1C 0%, #C9921A 60%, #E8B84B 100%);
  --gradient-footer:  linear-gradient(180deg, #5A1010 0%, #3D0A0A 100%);
  --gradient-bar:     linear-gradient(90deg, #7B1C1C, #C9921A);
  --gradient-shimmer: linear-gradient(90deg, #F5EDE0 0%, #FEFAE0 50%, #F5EDE0 100%);
  --gradient-section: linear-gradient(180deg, #FFF8E7 0%, #FEFAE0 50%, #FFF8E7 100%);
}

/* ════════════════════════════════════════════════════
   DARK THEME
   ════════════════════════════════════════════════════ */
[data-theme="dark"] {

  /* Backgrounds */
  --color-bg:            #0F0508;
  --color-bg-alt:        #160A0A;
  --color-bg-alt2:       #1C0D0D;
  --color-bg-card:       #1C0D0D;
  --color-bg-card-hover: #221010;
  --color-bg-nav:        rgba(15,5,8,0.94);
  --color-bg-overlay:    rgba(15,5,8,0.85);
  --color-bg-footer:     #0A0306;

  /* Brand — shifted warmer for dark bg */
  --color-primary:       #C9603A;
  --color-primary-dark:  #A8492A;
  --color-primary-light: #E07050;
  --color-primary-ghost: rgba(201,96,58,0.12);
  --color-accent:        #E8B84B;
  --color-accent-dark:   #C9921A;
  --color-accent-light:  #F5D07A;
  --color-accent-ghost:  rgba(232,184,75,0.12);

  /* Text */
  --color-text-h:        #F5EDE0;
  --color-text-body:     #BFA89A;
  --color-text-muted:    #7A5A50;
  --color-text-inverse:  #1A0A05;
  --color-text-on-gold:  #1A0A05;
  --color-text-footer:   rgba(245,237,224,0.65);

  /* Borders */
  --color-border:        rgba(201,96,58,0.15);
  --color-border-hover:  rgba(232,184,75,0.35);
  --color-border-accent: rgba(232,184,75,0.25);

  /* Semantic */
  --color-star:          #E8B84B;
  --color-success:       #4CAF50;
  --color-danger:        #E74C3C;
  --color-warning:       #F97316;
  --color-info:          #29B6F6;

  /* Shadows */
  --shadow-card:   0 4px 20px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.25);
  --shadow-hover:  0 16px 48px rgba(0,0,0,0.55), 0 0 40px rgba(232,184,75,0.08);
  --shadow-nav:    0 4px 24px rgba(0,0,0,0.50);
  --shadow-btn:    0 4px 16px rgba(232,184,75,0.30);
  --shadow-btn-hover: 0 8px 32px rgba(232,184,75,0.45);
  --shadow-modal:  0 24px 80px rgba(0,0,0,0.70);

  /* Gradients */
  --gradient-hero:    linear-gradient(135deg, rgba(15,5,8,0.92) 0%, rgba(30,8,8,0.72) 60%, rgba(232,184,75,0.06) 100%);
  --gradient-btn:     linear-gradient(135deg, #E8B84B 0%, #C9921A 100%);
  --gradient-btn-alt: linear-gradient(135deg, #E07050 0%, #C9603A 100%);
  --gradient-text:    linear-gradient(135deg, #E07050 0%, #E8B84B 60%, #F5D07A 100%);
  --gradient-footer:  linear-gradient(180deg, #0A0306 0%, #050106 100%);
  --gradient-bar:     linear-gradient(90deg, #C9603A, #E8B84B);
  --gradient-shimmer: linear-gradient(90deg, #1C0D0D 0%, #2A1212 50%, #1C0D0D 100%);
  --gradient-section: linear-gradient(180deg, #160A0A 0%, #1C0D0D 50%, #160A0A 100%);
}
```

---

## 16. Tech Stack & Library Setup

```
Framework:    Next.js 14+ (App Router) + TypeScript
Styling:      Tailwind CSS v3 + CSS Modules (tokens.css)
Animation:    Framer Motion 11 + GSAP 3.12 + ScrollTrigger
Fonts:        next/font/google (Cormorant Garamond + DM Sans)
Icons:        Lucide React + React Icons (for platform logos)
Forms:        React Hook Form + Zod
State:        Zustand (UI) + TanStack Query (data)
Charts:       Recharts
Tables:       TanStack Table
Toasts:       Sonner
Theme:        Custom useTheme hook (see Section 4)
```

### GSAP Setup

```typescript
// src/lib/gsap.ts
import { gsap }          from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out", duration: 0.65 });
  ScrollTrigger.defaults({ once: true, start: "top 80%" });
}
export { gsap, ScrollTrigger };
```

### Framer Motion Setup

```typescript
// src/providers/providers.tsx
"use client";
import { LazyMotion, domAnimation } from "framer-motion";
export function Providers({ children }) {
  return (
    <LazyMotion features={domAnimation}>{children}</LazyMotion>
  );
}
// Use m.div instead of motion.div in components
```

---

## 17. File & Folder Structure

```
src/
├── app/
│   ├── (marketing)/          # Public pages
│   │   ├── page.tsx          # Home
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── about/
│   │   └── contact/
│   ├── (dashboard)/          # App pages
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── bookings/
│   │   ├── events/
│   │   ├── billing/
│   │   ├── inventory/
│   │   ├── vendors/
│   │   ├── reviews/
│   │   ├── analytics/
│   │   └── settings/
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                   # Atomic components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Table.tsx
│   │   ├── Skeleton.tsx
│   │   └── ThemeToggle.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── BackToTop.tsx
│   ├── sections/             # Marketing sections
│   │   ├── Hero.tsx
│   │   ├── ProblemSolution.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── LeadPipeline.tsx
│   │   ├── Analytics.tsx
│   │   ├── ReviewSystem.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   └── CTABanner.tsx
│   └── shared/
│       ├── SectionHeader.tsx
│       ├── GlowOrb.tsx
│       ├── GradientText.tsx
│       ├── AnimatedSection.tsx
│       └── DividerOrnament.tsx
│
├── lib/
│   ├── gsap.ts
│   ├── gsap-animations.ts
│   └── motion-variants.ts
│
├── hooks/
│   ├── use-theme.ts
│   ├── use-scroll-animation.ts
│   ├── use-count-up.ts
│   └── use-parallax.ts
│
└── styles/
    ├── tokens.css            # All CSS variables (this file)
    ├── typography.css
    ├── animations.css        # CSS keyframes
    └── components.css
```

---

## 18. Implementation Checklist

### Per Page
- [ ] `data-theme` attribute on `<html>` propagates correctly
- [ ] Navbar scrolled state works (transparent → glass)
- [ ] All sections use `<SectionHeader>` component
- [ ] All card grids use stagger animation
- [ ] `useReducedMotion()` check in all animated components
- [ ] GSAP ScrollTrigger instances cleaned up on unmount
- [ ] Loading skeletons using `--gradient-shimmer` variable
- [ ] Smooth scroll on anchor links
- [ ] Back-to-top button appears after 300px scroll

### Color / Theme Checks
- [ ] Light theme: white text never on gold backgrounds
- [ ] Dark theme: `#E8B84B` accent on dark bg (not `#C9921A` — too dark)
- [ ] Both themes tested for WCAG AA contrast (4.5:1 minimum)
- [ ] Theme preference persisted to localStorage
- [ ] System preference (`prefers-color-scheme`) respected on first load
- [ ] ThemeToggle button in navbar renders in both themes

### Animation Checks
- [ ] Hero page load sequence runs in correct order (200ms → 1500ms)
- [ ] All scroll animations trigger at 15% element visibility
- [ ] Pipeline progress line animates via GSAP on scroll
- [ ] Analytics bars animate in with GSAP
- [ ] Counter stats use `useCountUp` hook
- [ ] Floating orbs run GSAP float loop
- [ ] Hero image has subtle zoom (scale 1.08 → 1.0)

### Performance
- [ ] Images: WebP, `next/image`, lazy loading below fold
- [ ] Fonts: `font-display: swap`, only required weights
- [ ] Framer: `LazyMotion` + `domAnimation` (not full bundle)
- [ ] GSAP: Only registered plugins imported
- [ ] `will-change: transform` on parallax + orb elements
- [ ] No `width`/`height`/`margin` animations (layout thrashing)
- [ ] Lighthouse Performance ≥ 85

### Cross-Device Testing
- [ ] 375px (iPhone SE) — mobile layout
- [ ] 390px (iPhone 14 Pro)
- [ ] 768px (iPad) — tablet layout
- [ ] 1200px — desktop
- [ ] 1440px — large desktop
- [ ] Tested: Chrome, Safari, Firefox, Safari iOS

---

*BanquetOS UI Design System v2.0 — Prasad Color Scheme Edition*
*Light & Dark Theme · Cormorant Garamond + DM Sans · Framer Motion + GSAP*
*Maroon #7B1C1C · Gold #C9921A · Cream #FFF8E7 · Deep Maroon #5A1010*