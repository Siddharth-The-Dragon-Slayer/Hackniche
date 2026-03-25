# BanquetEase — Complete UI & CSS Reference

> Generated: February 28, 2026  
> Framework: Next.js 14 (App Router) · Styling: Custom CSS Design System + selective Tailwind utilities · Animation: Framer Motion + GSAP

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [CSS Architecture](#2-css-architecture)
   - [globals.css](#21-globalscss)
   - [tokens.css — Design Token System](#22-tokenscss--design-token-system)
   - [animations.css](#23-animationscss)
   - [typography.css](#24-typographycss)
   - [components.css](#25-componentscss)
3. [Shared UI Components](#3-shared-ui-components)
   - [Button](#31-button)
   - [Card](#32-card)
   - [Badge](#33-badge)
   - [Input](#34-input)
   - [Select](#35-select)
   - [Modal](#36-modal)
   - [Tabs](#37-tabs)
   - [DataTable](#38-datatable)
   - [MobileCardList](#39-mobilecardlist)
   - [KpiCard](#310-kpicard)
   - [StatsCard](#311-statscard)
   - [PageHeader](#312-pageheader)
   - [SearchRow](#313-searchrow)
   - [FormCard](#314-formcard)
   - [EmptyState](#315-emptystate)
   - [AnimatedSection](#316-animatedsection)
   - [GsapReveal](#317-gsapreveal)
   - [SectionWrapper](#318-sectionwrapper)
   - [ResponsiveGrid](#319-responsivegrid)
   - [Preloader](#320-preloader)
4. [Layout Components](#4-layout-components)
   - [Sidebar](#41-sidebar)
   - [Navbar](#42-navbar)
   - [Footer](#43-footer)
   - [BackToTop](#44-backtotop)
   - [SectionHeader (shared)](#45-sectionheader-shared)
5. [Root & Layout Files](#5-root--layout-files)
   - [Root Layout (app/layout.js)](#51-root-layout-applayout)
   - [Marketing Layout](#52-marketing-layout)
   - [Dashboard Layout](#53-dashboard-layout)
6. [Auth Pages](#6-auth-pages)
   - [Login](#61-login)
   - [Signup](#62-signup)
7. [Marketing Pages](#7-marketing-pages)
   - [Home (Landing)](#71-home-landing)
   - [About](#72-about)
   - [Features](#73-features)
   - [Contact](#74-contact)
   - [Pricing](#75-pricing)
8. [Dashboard Pages](#8-dashboard-pages)
   - [Branch Dashboard](#81-branch-dashboard)
   - [Customer Dashboard](#82-customer-dashboard)
   - [Franchise Dashboard](#83-franchise-dashboard)
   - [Platform Dashboard (Super Admin)](#84-platform-dashboard-super-admin)
   - [Analytics](#85-analytics)
   - [Bookings — List](#86-bookings--list)
   - [Bookings — Detail](#87-bookings--detail)
   - [Bookings — Create](#88-bookings--create)
   - [Branches — List](#89-branches--list)
   - [Branches — Detail](#810-branches--detail)
   - [Branches — Create](#811-branches--create)
   - [Calendar](#812-calendar)
   - [Staff — List](#813-staff--list)
   - [Staff — Detail](#814-staff--detail)
   - [Staff — Create](#815-staff--create)
   - [Menus — List](#816-menus--list)
   - [Menus — Detail](#817-menus--detail)
   - [Menus — Create](#818-menus--create)
   - [Leads — List](#819-leads--list)
   - [Leads — Detail](#820-leads--detail)
   - [Leads — Create](#821-leads--create)
   - [Inventory — List](#822-inventory--list)
   - [Inventory — Detail](#823-inventory--detail)
   - [Inventory — Create](#824-inventory--create)
   - [Payments](#825-payments)
   - [Purchase Orders — List](#826-purchase-orders--list)
   - [Purchase Orders — Detail](#827-purchase-orders--detail)
   - [Purchase Orders — Create](#828-purchase-orders--create)
   - [Vendors — List](#829-vendors--list)
   - [Vendors — Detail](#830-vendors--detail)
   - [Vendors — Create](#831-vendors--create)
   - [Events — List](#832-events--list)
   - [Events — Detail](#833-events--detail)
   - [Decor — List](#834-decor--list)
   - [Decor — Detail](#835-decor--detail)
   - [Decor — Create](#836-decor--create)
   - [Franchises — List](#837-franchises--list)
   - [Franchises — Detail](#838-franchises--detail)
   - [Franchises — Create](#839-franchises--create)
   - [Users](#840-users)
   - [Reviews](#841-reviews)
   - [Dynamic Pricing — List](#842-dynamic-pricing--list)
   - [Dynamic Pricing — Create](#843-dynamic-pricing--create)
   - [Billing — List](#844-billing--list)
   - [Billing — Detail](#845-billing--detail)
   - [Audit Logs](#846-audit-logs)
   - [Settings — Global](#847-settings--global)
   - [Settings — Branch](#848-settings--branch)
   - [Settings — Franchise](#849-settings--franchise)
9. [CSS Class Quick Reference](#9-css-class-quick-reference)

---

## 1. Design System Overview

BanquetEase uses a **token-first custom CSS design system** with a luxury banquet hall aesthetic. The palette is built around deep crimson (`#7B1C1C`) and antique gold (`#C9921A`) in light mode, shifting to warm orange-red (`#C9603A`) and amber (`#E8B84B`) in dark mode.

| Dimension | Choice |
|---|---|
| Display font | `Cormorant Garamond` — serif, italic, luxury feel |
| Body font | `DM Sans` — clean, modern sans-serif |
| Mono font | `JetBrains Mono` — used for currency, IDs, codes |
| Theming | `data-theme="light/dark"` on `<html>` |
| Animation libs | Framer Motion (React) + GSAP (marketing) |
| Responsive | Mobile-first via `@media (max-width: 768px)` |
| Grid system | CSS `grid` with custom token-based column classes |

---

## 2. CSS Architecture

All styles live under `src/styles/` (4 files) plus `src/app/globals.css` as the entry point.

```
globals.css
 ├── @import tokens.css        ← all CSS variables
 ├── @import animations.css    ← @keyframes and utility animation classes
 ├── @import typography.css    ← headings, body text, display classes
 └── @import components.css    ← all component/layout classes
```

---

### 2.1 globals.css

**File:** `src/app/globals.css`

| Role | Detail |
|---|---|
| Entry point | Imports Google Fonts + all 4 partial stylesheets |
| Fonts loaded | Cormorant Garamond (400/500/600/700 + italic), DM Sans (300–700), JetBrains Mono (400/500) |
| Resets | Universal `box-sizing: border-box`, zero margins/padding |
| Scroll | `scroll-behavior: smooth` on `<html>` |
| Body defaults | `background: var(--color-bg)`, `color: var(--color-text-body)`, `font-family: var(--font-body)`, antialiased |
| Theme transition | `background` + `color` both animate via `var(--dur-medium) var(--ease-out)` |
| Links | `color: inherit; text-decoration: none` |
| Images | `max-width: 100%; height: auto` |

---

### 2.2 tokens.css — Design Token System

**File:** `src/styles/tokens.css`

#### Font Tokens

| Token | Value |
|---|---|
| `--font-display` | `'Cormorant Garamond', 'Libre Baskerville', Georgia, serif` |
| `--font-body` | `'DM Sans', 'Outfit', Helvetica, sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` |

#### Type Scale (fluid)

| Token | Value |
|---|---|
| `--text-hero` | `clamp(3rem, 7vw, 5.5rem)` |
| `--text-h1` | `clamp(2.5rem, 5vw, 4rem)` |
| `--text-h2` | `clamp(2rem, 3.5vw, 2.75rem)` |
| `--text-h3` | `clamp(1.5rem, 2.5vw, 2rem)` |
| `--text-h4` | `1.375rem` |
| `--text-xl` | `1.25rem` |
| `--text-lg` | `1.125rem` |
| `--text-base` | `1rem` |
| `--text-sm` | `0.875rem` |
| `--text-xs` | `0.75rem` |
| `--text-2xs` | `0.6875rem` |

#### Spacing (8px base grid)

| Token | Value | Token | Value |
|---|---|---|---|
| `--space-1` | 4px | `--space-12` | 48px |
| `--space-2` | 8px | `--space-14` | 56px |
| `--space-3` | 12px | `--space-16` | 64px |
| `--space-4` | 16px | `--space-18` | 72px |
| `--space-5` | 20px | `--space-20` | 80px |
| `--space-6` | 24px | `--space-24` | 96px |
| `--space-8` | 32px | `--space-28` | 112px |
| `--space-10` | 40px | `--space-32` | 128px |

#### Border Radius

| Token | Value |
|---|---|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 24px |
| `--radius-3xl` | 32px |
| `--radius-full` | 9999px |

#### Animation Durations

| Token | Value |
|---|---|
| `--dur-instant` | 80ms |
| `--dur-fast` | 150ms |
| `--dur-normal` | 250ms |
| `--dur-medium` | 400ms |
| `--dur-slow` | 600ms |
| `--dur-slower` | 800ms |
| `--dur-slowest` | 1100ms |
| `--dur-cinematic` | 1500ms |

#### Easing

| Token | Curve |
|---|---|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--ease-dramatic` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-smooth` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |

#### Layout

| Token | Value |
|---|---|
| `--max-width` | 1200px |
| `--max-width-wide` | 1440px |
| `--max-width-narrow` | 880px |
| `--max-width-xs` | 640px |
| `--nav-height` | 72px |

#### Z-Index Scale

| Token | Value |
|---|---|
| `--z-below` | -1 |
| `--z-base` | 0 |
| `--z-raised` | 10 |
| `--z-dropdown` | 100 |
| `--z-sticky` | 200 |
| `--z-overlay` | 500 |
| `--z-nav` | 1000 |
| `--z-modal` | 9000 |
| `--z-toast` | 9500 |
| `--z-top` | 9999 |

#### Color Tokens — Light Theme

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-alt` | `#FFF8E7` | Alternate section bg |
| `--color-bg-card` | `#FFFFFF` | Card surface |
| `--color-bg-nav` | `rgba(255,255,255,0.96)` | Navbar glassmorphism |
| `--color-primary` | `#7B1C1C` | Deep crimson — primary brand |
| `--color-primary-dark` | `#5A1010` | Darker crimson |
| `--color-primary-ghost` | `rgba(123,28,28,0.08)` | Subtle backgrounds |
| `--color-accent` | `#C9921A` | Antique gold |
| `--color-accent-ghost` | `rgba(201,146,26,0.10)` | Focus ring, subtle |
| `--color-text-h` | `#1A1A1A` | Headings |
| `--color-text-body` | `#4A4A4A` | Body text |
| `--color-text-muted` | `#888888` | Placeholder, labels |
| `--color-border` | `#E8E0D0` | Default border |
| `--color-success` | `#2E7D32` | Green |
| `--color-danger` | `#C0392B` | Red / error |
| `--color-warning` | `#E67E22` | Orange |
| `--color-info` | `#1565C0` | Blue |

#### Color Tokens — Dark Theme

| Token | Value |
|---|---|
| `--color-bg` | `#0F0508` |
| `--color-bg-card` | `#1C0D0D` |
| `--color-primary` | `#C9603A` (warm orange-red) |
| `--color-accent` | `#E8B84B` (amber) |
| `--color-text-h` | `#F5EDE0` |
| `--color-text-body` | `#BFA89A` |
| `--color-text-muted` | `#7A5A50` |
| `--color-border` | `rgba(201,96,58,0.15)` |

#### Shadows

| Token | Effect |
|---|---|
| `--shadow-card` | Subtle crimson-tinted card shadow |
| `--shadow-hover` | Deep lift shadow on card hover |
| `--shadow-nav` | Navbar drop shadow |
| `--shadow-btn` | Gold glow under primary buttons |
| `--shadow-btn-hover` | Stronger gold glow on hover |
| `--shadow-modal` | Deep modal shadow |

#### Gradients

| Token | Description |
|---|---|
| `--gradient-hero` | Dark red overlay for hero backgrounds |
| `--gradient-btn` | Gold gradient (`#C9921A → #A87510`) for primary buttons |
| `--gradient-btn-alt` | Crimson gradient for secondary buttons |
| `--gradient-text` | Red→gold→amber text gradient |
| `--gradient-bar` | Red→gold used for progress bars |
| `--gradient-shimmer` | Warm shimmer for skeleton loading |
| `--gradient-footer` | Dark crimson footer background |

---

### 2.3 animations.css

**File:** `src/styles/animations.css`

#### @keyframes

| Name | Effect |
|---|---|
| `fadeUp` | `opacity:0, translateY(40px), blur(5px)` → natural |
| `fadeIn` | Opacity 0 → 1 only |
| `fadeDown` | Slides in from above with blur |
| `scaleIn` | Scale `0.88 → 1` with opacity |
| `slideLeft` | Translates from right (`+50px`) |
| `slideRight` | Translates from left (`-50px`) |
| `float` | Infinite vertical bob ±10px |
| `floatX` | Infinite horizontal bob ±8px |
| `pulse` | Scale + opacity pulse loop |
| `spin` | 360° continuous rotation |
| `glow` | Box-shadow amber pulse (12px→32px) |
| `glowAmber` | Stronger amber glow pulse |
| `heroZoom` | Hero image subtle zoom `1.08 → 1.00` |
| `toastIn` / `toastOut` | Slide in/out from right with scale |
| `ticker` | Continuous horizontal scroll `translateX(-50%)` |
| `skeletonShimmer` | Background-position sweep for skeleton |
| `bounceDot` | Three-dot bounce-scale loader |
| `gradientShift` | Animated 270° gradient (`8s infinite`) |
| `scrollBounce` | Scroll indicator dot bounce |

#### Utility Classes

| Class | Effect |
|---|---|
| `.skeleton` | Shimmer loading placeholder |
| `.page-enter` | `fadeUp 0.55s` page transition |
| `.hover-lift` | `translateY(-4px)` + `shadow-hover` on hover |
| `.focus-ring` | Accent `outline: 2px` on `:focus-visible` |
| `.animated-gradient-text` | Red→gold looping gradient on text |
| `.bounce-dot` | Staggered bounce dot (nth-child delays: 0, 0.16s, 0.32s) |

---

### 2.4 typography.css

**File:** `src/styles/typography.css`

Defines heading hierarchy and display text styles using design tokens:

| Selector | Font | Size Token | Weight | Notes |
|---|---|---|---|---|
| `h1` | display | `--text-h1` | 700 | italic, display serif |
| `h2` | display | `--text-h2` | 700 | italic, letter-spacing -0.5px |
| `h3` | display | `--text-h3` | 600 | |
| `h4` | display | `--text-h4` | 600 | |
| `h5, h6` | body | `--text-lg` | 600 | |
| `p` | — | `--text-base` | — | `line-height: 1.7`, muted color |
| `.display-hero` | display | `--text-hero` | 800 | italic, luxury display |
| `.eyebrow` | body | `--text-xs` | 700 | UPPERCASE, letter-spacing 3px, accent color |
| `.text-gradient` | — | — | — | Red→gold clipped background text |
| `.mono` | mono | `--text-sm` | 400 | tabular numbers |

---

### 2.5 components.css

**File:** `src/styles/components.css`  
The largest stylesheet (~946 lines). All reusable component and layout classes.

#### Containers

| Class | Max-width | Padding |
|---|---|---|
| `.container` | 1200px | `--space-8` (32px) sides |
| `.container-wide` | 1440px | `--space-8` |
| `.container-narrow` | 880px | `--space-8` |
| `.container-xs` | 640px | `--space-6` |

#### Sections

| Class | Padding |
|---|---|
| `.section` | `--space-28` (112px) top & bottom |
| `.section-xl` | `--space-36` (144px) |
| `.section-lg` | `--space-32` (128px) |
| `.section-sm` | `--space-18` (72px) |

#### Grid Classes

| Class | Columns |
|---|---|
| `.grid-1` | 1fr |
| `.grid-2` | repeat(2, 1fr) |
| `.grid-3` | repeat(3, 1fr) |
| `.grid-4` | repeat(4, 1fr) |
| `.grid-dashboard` | 260px 1fr (sidebar + main) |
| `.kpi-row` | `auto-fit, minmax(180px, 1fr)` |
| `.card-grid-2` | repeat(2, 1fr) |
| `.card-grid-3` | repeat(3, 1fr) |
| `.card-grid-4` | repeat(4, 1fr) |
| `.form-grid` | 1fr 1fr |
| `.form-grid-3` | 1fr 1fr 1fr |
| `.form-grid-4` | 1fr 1fr 1fr 1fr |
| `.info-grid` | 1fr 1fr |
| `.info-grid-3` | 1fr 1fr 1fr |
| `.info-grid-4` | repeat(4, 1fr) |
| `.two-col` | 1fr 1fr |
| `.three-col` | 1fr 1fr 1fr |

#### Spacing Utilities

| Class | Value |
|---|---|
| `.mb-xs` | `--space-3` (12px) |
| `.mb-sm` | `--space-4` (16px) |
| `.mb-md` | `--space-6` (24px) |
| `.mb-lg` | `--space-8` (32px) |
| `.mb-xl` | `--space-10` (40px) |
| `.mb-2xl` | `--space-16` (64px) |
| `.gap-xs` → `.gap-xl` | 8px → 32px |

#### Key Component Classes (Summary)

| Class | Description |
|---|---|
| `.card` | Surface with border, `border-radius: --radius-xl`, hover lift + top-border sweep animation |
| `.card-padded` | Adds `padding: --space-6` to cards |
| `.card-icon` | 54px circular icon container, gold on hover |
| `.btn` | Base button — flex, overflow ripple, `bounce` scale active |
| `.btn-primary` | Gold gradient, box-shadow glow |
| `.btn-secondary` | Crimson gradient, white text |
| `.btn-outline` | Transparent + primary border → filled on hover |
| `.btn-ghost` | Frosted glass, white/transparent |
| `.btn-sm/md/lg/xl` | 8/12/14/18px padding sizes |
| `.badge` | Pill, uppercase, 11px, letter-spacing 1.2px |
| `.badge-primary/accent/green/red/neutral/warning` | Semantic badge variants |
| `.input` / `.select` | Field styles with focus ring (accent glow ring) |
| `.input-label` | Floating label — animates up on focus |
| `.sidebar` | 260px fixed left nav, z=200 |
| `.sidebar-item` | Nav link — active shows 3px left border accent |
| `.footer` | Dark crimson gradient bg with clip-path wave |
| `.modal-overlay` | Fixed inset, `backdrop-filter: blur(4px)` |
| `.modal` | Card-style, `border: 1px solid --color-border-accent` |
| `.toast` | Sided colored left border — success/error/info/warning |
| `.page-header` | Flex between, space-between, align flex-start |
| `.form-card` | `padding: 32px`, max-width 860px |
| `.kpi-card` | Stat display with label/value/change slots |
| `.timeline` | Flex column with dot + content rows |
| `.checklist-item` | Row with checkbox, border-bottom separator |
| `.progress-bar-wrap` | 8px height container with full-radius |
| `.progress-bar-fill` | Gold gradient fill with `0.5s` width transition |
| `.back-to-top` | Fixed bottom-right pill, opacity 0→1 when `.visible` |
| `.scroll-indicator` | Centered mouse + bouncing dot animation |
| `.testimonial-card` | Card variant with `::before` open-quote |
| `.divider-ornament` | Flex row with gradient line + diamond |
| `.mobile-topbar` | Dashboard mobile header (hidden on desktop) |
| `.dashboard-main` | Main content area offset from sidebar |
| `.desktop-table-wrap` | Shown only on ≥769px |
| `.mobile-card-list` | Shown only on ≤768px (replaces table) |

#### Responsive Breakpoints

| Breakpoint | Rules |
|---|---|
| `≤768px` (mobile) | `.grid-2/3/4` → 1 col; `.form-grid/3/4` → 1 col; `.two-col` → 1 col; sidebar hidden; `.desktop-table-wrap` hidden; `.mobile-card-list` shown; `kpi-row` → `repeat(2, 1fr)` |
| `769px–1024px` (tablet) | `.grid-3/4` → 2 cols; `.form-grid-3/4` → 2 cols |
| `≥1025px` (desktop) | Full grid layouts |

---

## 3. Shared UI Components

All located in `src/components/ui/`. Barrel exported via `src/components/ui/index.js`.

---

### 3.1 Button

**File:** `src/components/ui/Button.jsx`  
**Export:** `default Button` (forwarded ref)

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `primary\|secondary\|outline\|ghost\|danger` | `'primary'` | Visual style |
| `size` | `xs\|sm\|md\|lg\|xl` | `'md'` | Padding/font-size |
| `loading` | `boolean` | `false` | Shows spinner, disables |
| `fullWidth` | `boolean` | `false` | Adds `w-full` |
| `icon` | ReactNode | — | Left icon slot |
| `iconRight` | ReactNode | — | Right icon slot |
| `animated` | `boolean` | `true` | Framer Motion hover/tap |

#### CSS Classes Used

`btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-sm`, `btn-md`, `btn-lg`, `btn-xl`, `w-full`

#### Behavior

- `animated=true`: `whileHover={{ y: -2 }}`, `whileTap={{ scale: 0.96 }}` via Framer Motion spring
- `loading=true`: renders CSS-animated spinner border circle (`animation: spin 0.6s linear infinite`)
- `danger` variant maps to `btn btn-outline` classes

---

### 3.2 Card

**File:** `src/components/ui/Card.jsx`  
**Export:** `default Card` (forwarded ref)

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding` | `boolean` | `true` | Applies `.card-padded` |
| `hover` | `boolean` | `true` | Accepted (hover handled via CSS) |
| `animated` | `boolean` | `false` | Enables Framer Motion viewport entrance |

#### CSS Classes Used

`.card`, `.card-padded`

#### Behavior

- `animated=true`: `motion.div` with `whileInView="visible"`, `viewport={{ once: true, amount: 0.15 }}`
- Card CSS has two pseudo-elements: `::before` — gold sweep line top, `::after` — gradient top border on hover
- Hover: `translateY(-6px)` + deeper shadow

---

### 3.3 Badge

**File:** `src/components/ui/Badge.jsx`  
**Export:** `default Badge`

#### Props

| Prop | Type | Options |
|---|---|---|
| `variant` | string | `primary`, `accent`, `green`, `red`, `neutral`, `warning`, `success` (→green), `danger` (→red) |
| `icon` | ReactNode | Optional left icon |

#### CSS Classes Used

`.badge`, `.badge-primary`, `.badge-accent`, `.badge-green`, `.badge-red`, `.badge-neutral`, `.badge-warning`

---

### 3.4 Input

**File:** `src/components/ui/Input.jsx`  
**Export:** `default Input` (forwarded ref)

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | string | — | Renders `<label>` above |
| `hint` | string | — | Renders muted hint below |
| `error` | string | — | Sets `borderColor: var(--color-danger)` |
| `icon` | ReactNode | — | Left icon (adds `paddingLeft: 40`) |
| `iconRight` | ReactNode | — | Right icon |
| `as` | `'input'\|'textarea'` | `'input'` | Renders `<textarea>` when needed |
| `type` | string | `'text'` | HTML input type |

#### Structure

```
div.form-field
  label.form-label
  div.input-group
    [span] left icon (if icon prop)
    input.input  (or textarea.input)
    [span] right icon (if iconRight)
  span.form-hint
```

---

### 3.5 Select

**File:** `src/components/ui/Select.jsx`  
**Export:** `default Select` (forwarded ref)

#### Props

| Prop | Description |
|---|---|
| `label` | Above label text |
| `hint` / `error` | Hint text or error styling |
| `options` | Array of strings or `{value, label}` objects |
| `placeholder` | Disabled first option |
| `children` | Custom `<option>` elements |

#### Structure

```
div.form-field
  label.form-label
  select.select.input
    [options or children]
  span.form-hint
```

---

### 3.6 Modal

**File:** `src/components/ui/Modal.jsx`  
**Export:** `default Modal`

#### Props

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | — |
| `onClose` | function | — |
| `title` | string | — |
| `footer` | ReactNode | — |
| `size` | `sm\|md\|lg\|xl\|full` | `'md'` |

#### Structure

```
AnimatePresence
  motion.div.modal-overlay    [backdrop click → onClose]
    motion.div.modal
      div  [header: h3 + X button]
      div  [children body]
      div  [footer if provided]
```

#### Behavior

- `Escape` key listener closes modal
- `document.body.style.overflow = 'hidden'` while open
- Spring animation: `stiffness: 400, damping: 30`; enters from `scale: 0.92, y: 24`
- Max-widths per size: sm=400, md=560, lg=720, xl=960, full=100%

---

### 3.7 Tabs

**File:** `src/components/ui/Tabs.jsx`  
**Export:** `default Tabs`

#### Props

| Prop | Type | Description |
|---|---|---|
| `tabs` | `{key, label, count?}[]` | Tab definitions |
| `activeTab` | string | Controlled active key |
| `onChange` | function | Called with tab key |

#### Structure

```
div.tab-list[role=tablist]
  button.tab-item[role=tab][aria-selected]  (× N)
    label text
    [span count badge]  (if count provided)
```

#### Behavior

- `useRef` tracks active tab element
- `useEffect` auto-scrolls active tab into viewport on tab change (mobile support)
- Active count badge: primary bg + white text; inactive: border-color bg + muted text

---

### 3.8 DataTable

**File:** `src/components/ui/DataTable.jsx`  
**Export:** `default DataTable`

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `{key, label, render?, align?, width?}[]` | — | Column definitions |
| `data` | array | — | Row data |
| `keyField` | string | `'id'` | Row key |
| `onRowClick` | function | — | Row click handler |
| `mobileRender` | function | — | Custom mobile card renderer |
| `loading` | boolean | — | Shows skeleton |
| `emptyMessage` | string | `'No data found'` | Empty state text |

#### Structure (dual-mode)

```
[Desktop — hidden on ≤768px]
div.desktop-table-wrap
  div.card
    TableSkeleton | empty message | table.data-table
      thead > tr > th (per column)
      tbody > motion.tr > td (per row, staggered)

[Mobile — hidden on ≥769px]
div.mobile-card-list
  div.card
    motion.div.mobile-card-item (per row, staggered)
      [mobileRender(row) || DefaultMobileCard]
```

#### Sub-components

- **`TableSkeleton({ cols })`** — 5 rows × N shimmer divs
- **`DefaultMobileCard({ row, columns })`** — col[0] as heading, col[1] as subtitle, rest as labeled pairs

---

### 3.9 MobileCardList

**File:** `src/components/ui/MobileCardList.jsx`  
**Export:** `default MobileCardList`

#### Props

| Prop | Default | Description |
|---|---|---|
| `data` | `[]` | Array of items |
| `keyField` | `'id'` | Row key field |
| `renderCard` | required | `(row, index) => ReactNode` |

#### Structure

```
div.mobile-card-list
  div.card (no-padding, overflow-hidden)
    div.mobile-card-item × N
```

Returns `null` if `data` is empty.

---

### 3.10 KpiCard

**File:** `src/components/ui/KpiCard.jsx`  
**Export:** `default KpiCard`

#### Props

| Prop | Default | Description |
|---|---|---|
| `label` | — | Metric name |
| `value` | — | Display value |
| `change` | — | Delta text (e.g. "+12%") |
| `positive` | — | `true`→green arrow, `false`→red warning |
| `icon` | — | Optional icon |
| `accentColor` | CSS color | Icon accent color |
| `index` | `0` | Stagger delay index |
| `animated` | `true` | Framer Motion entrance |

#### Structure

```
div.kpi-card
  div.kpi-label + [icon]
  div.kpi-value
  div.kpi-change.positive|negative  [if change prop]
```

#### Behavior

- `animated=true`: `motion.div` with `fadeUp` variants, `custom={index}` for stagger
- Change indicator: `↑` for positive, `⚠` for negative

---

### 3.11 StatsCard

**File:** `src/components/ui/StatsCard.jsx`  
**Export:** `default StatsCard`

#### Props

| Prop | Default | Description |
|---|---|---|
| `icon` | — | Icon above title |
| `title` | — | Card heading |
| `subtitle` | — | Subheading |
| `value` | — | Primary metric |
| `trend` | — | Trend text |
| `colorAccent` | `'var(--color-primary)'` | Icon/accent color |
| `index` | `0` | Stagger index |
| `animated` | `true` | Framer Motion `whileInView` |

#### Structure

```
div.card  (padding: 24px)
  div.card-icon
  h4
  p
  div  [value]
  div  [trend]
  {children}
```

---

### 3.12 PageHeader

**File:** `src/components/ui/PageHeader.jsx`  
**Export:** `default PageHeader`

#### Props

| Prop | Default | Description |
|---|---|---|
| `title` | — | Page `<h1>` |
| `subtitle` | — | Muted subtext |
| `backHref` | — | Back link URL |
| `backLabel` | `'Back'` | Back link text |
| `actions` | ReactNode | Right-side action buttons |
| `breadcrumb` | ReactNode | Breadcrumb slot above title |
| `animated` | `true` | `fadeDown` entrance animation |

#### Structure

```
div.page-header
  div.page-header-left
    [breadcrumb]
    [Link.back-link with ArrowLeft icon]
    h1
    p
  div.page-actions
    [actions]
```

---

### 3.13 SearchRow

**File:** `src/components/ui/SearchRow.jsx`  
**Export:** `default SearchRow`

#### Props

`placeholder`, `value`, `onChange`, `children` (filter slots), `className`, `style`

#### Structure

```
div.search-row
  div.search-input-wrap
    Search icon (16px, .search-icon)
    input.input  [paddingLeft: 40]
  {children}
```

---

### 3.14 FormCard

**File:** `src/components/ui/FormCard.jsx`  
**Export:** `default FormCard`

#### Props

`title`, `titleIcon`, `children`, `className`, `style`

#### Structure

```
div.card.form-card
  div.form-section-title
    span  [icon — primary color]
    title text
  {children}
```

---

### 3.15 EmptyState

**File:** `src/components/ui/EmptyState.jsx`  
**Export:** `default EmptyState`

#### Props

| Prop | Default |
|---|---|
| `title` | `'Nothing here yet'` |
| `description` | — |
| `icon` | — |
| `action` | ReactNode |

#### Structure

```
div.card  (padding: 48px/32px, centered flex column)
  div  [icon circle — primary-ghost bg, primary color]
  h3   [title]
  p    [description, max-width 320px]
  div  [action]
```

---

### 3.16 AnimatedSection

**File:** `src/components/ui/AnimatedSection.jsx`  
**Export:** `default AnimatedSection`

#### Props

| Prop | Default | Description |
|---|---|---|
| `variants` | `fadeUp` | Framer Motion variants |
| `delay` | `0` | Animation delay (`custom` prop) |
| `once` | `true` | Fire only once in viewport |
| `amount` | `0.15` | Viewport intersection threshold |

Uses `motion.div` with `whileInView` trigger. Supports staggered entrance via `delay` + `custom`.

---

### 3.17 GsapReveal

**File:** `src/components/ui/GsapReveal.jsx`  
**Export:** `default GsapReveal`

#### Props

| Prop | Default | Options |
|---|---|---|
| `animation` | `'fadeUp'` | `fadeUp`, `fadeIn`, `slideLeft`, `slideRight`, `scaleIn`, `stagger` |
| `stagger` | `0.1` | Stagger delay between children |
| `duration` | `0.8` | Seconds |
| `delay` | `0` | Seconds before start |
| `ease` | `'power3.out'` | GSAP ease string |
| `once` | `true` | Kill trigger after first fire |
| `start` | `'top 88%'` | ScrollTrigger start position |

#### Behavior

- Dynamically imports `gsap` + `gsap/ScrollTrigger` (avoids SSR)
- `stagger` mode targets `Array.from(el.children)` instead of wrapper
- Uses `gsap.context()` for scoped cleanup

---

### 3.18 SectionWrapper

**File:** `src/components/ui/SectionWrapper.jsx`  
**Export:** `default SectionWrapper`

#### Props

| Prop | Default | Options |
|---|---|---|
| `size` | `'md'` | `sm\|md\|lg\|xl` |
| `narrow` | `false` | Uses `container-narrow` vs `container` |
| `background` | — | CSS background value |

#### Structure

```
section.section[-sm|-lg|-xl]  [background inline style if provided]
  div.container | div.container-narrow
    {children}
```

---

### 3.19 ResponsiveGrid

**File:** `src/components/ui/ResponsiveGrid.jsx`  
**Export:** `default ResponsiveGrid`

#### Props

| Prop | Default |
|---|---|
| `cols` | `{ mobile: 1, tablet: 2, desktop: 3 }` |

Uses **Tailwind** utility classes: `grid`, `gap-5`, `grid-cols-{n}`, `md:grid-cols-{n}`, `lg:grid-cols-{n}`.

---

### 3.20 Preloader

**File:** `src/components/ui/Preloader.jsx`  
**Export:** `default Preloader` (no props)

Full-screen animated intro sequence for the BanquetEase brand.

#### Structure

```
div.pre-overlay  (fixed full-screen)
  div.pre-particles   [ambient gold dots]
  div.pre-stage
    div.pre-center-container
      [SVG ornament]
      next/image  [logo PNG]
    div.pre-text-wrap
      span.pre-typewriter   ['BANQUETEASE' typed out]
      [Tagline text]
```

#### Animation Phases

| Phase | Trigger | Effect |
|---|---|---|
| `draw` | 0ms | SVG path draw animation |
| `logo` | 1800ms | Logo fades/scales in |
| `text` | 3000ms | Typewriter starts |
| `tagline` | 4200ms | Tagline appears |
| `exit` | 5000ms | Adds `.exit` class (opacity:0, scale:1.04) |
| Unmount | 5800ms | `mounted = false` |

Typewriter: `setInterval` every 80ms, starting at 3200ms.

---

## 4. Layout Components

All located in `src/components/layout/`.

---

### 4.1 Sidebar

**File:** `src/components/layout/Sidebar.jsx`  
**Export:** `default Sidebar({ mobileOpen, onClose })`

#### Structure

```
Fragment
  div.sidebar-backdrop  [conditional on mobileOpen]
  aside.sidebar.sidebar-open?
    button.sidebar-close-btn         [X icon]
    Link  [brand logo/franchise logo]
    div   [user avatar + displayName + role]
    nav
      Link.sidebar-item.active?  × N  [nav items]
    div   [bottom: theme toggle + logout button]
```

#### Key Details

| Feature | Implementation |
|---|---|
| Active state | `pathname === item.href \|\| pathname.startsWith(item.href)` |
| Theme toggle | `useTheme()` hook |
| Auth data | `useAuth()` — user, userProfile, franchiseProfile, role, logout |
| Nav items | `sidebarMenus[currentRole]` from `@/lib/mock-data` |
| Avatar | `displayName[0].toUpperCase()` in gold gradient circle |
| Franchise mode | Shows franchise name/logo instead of BanquetEase branding |

#### CSS Classes

`.sidebar`, `.sidebar-item`, `.sidebar-item.active`, `.sidebar-backdrop`

---

### 4.2 Navbar

**File:** `src/components/layout/Navbar.jsx`  
**Export:** `default Navbar`

#### Structure

```
Fragment
  nav  [fixed, 70px, glassmorphism on scroll]
    Link  [brand logo]
    div.desktop-nav  [page links]
    div.desktop-nav  [CTA buttons]
    div.mobile-menu-btn-wrap  [burger + ThemeToggle]
  motion.div  [mobile backdrop overlay]
  motion.div  [mobile slide-in panel]
    [nav links]
    [auth buttons]
```

#### State

| State | Behavior |
|---|---|
| `scrolled` | Set when `window.scrollY > 50` — enables glassmorphism bg |
| `mobileOpen` | Controls mobile panel; sets `body.overflow = 'hidden'` when open |

#### Mobile Panel Animation

Spring slide from `x: '100%'` to `x: 0`, width `min(85vw, 320px)`.

#### `ThemeToggle` (internal)

Animated pill with sliding indicator (`motion.div` translates left/right).

---

### 4.3 Footer

**File:** `src/components/layout/Footer.jsx`  
**Export:** `default Footer`

#### Structure

```
footer.footer
  div.container
    4-column grid (auto-fit, minmax 200px)
      Col 1: Brand (logo, tagline, social icons)
      Col 2: Product links
      Col 3: Platform links
      Col 4: Contact (Mail, Phone, MapPin)
    Bottom bar: copyright | Privacy Policy | Terms of Service
```

#### CSS Classes

`.footer`, `.container`, `.footer-link`, `.social-icon`

Static content — no state or hooks. Uses Lucide icons for social (`Instagram, Facebook, Youtube, Twitter`) and contact (`Mail, Phone, MapPin`).

---

### 4.4 BackToTop

**File:** `src/components/layout/BackToTop.jsx`  
**Export:** `default BackToTop`

```
button.back-to-top.visible?
  ArrowUp  (18px Lucide)
```

- `visible` state set when `window.scrollY > 300`
- Click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- CSS `.visible` transitions opacity 0→1 and `translateY(16px → 0)`

---

### 4.5 SectionHeader (shared)

**File:** `src/components/shared/SectionHeader.jsx`  
**Export:** `default SectionHeader`

#### Props

| Prop | Description |
|---|---|
| `eyebrow` | Small uppercase label above heading |
| `title` | `<h2>` text |
| `titleHighlight` | Substring of title to wrap in `.text-gradient` |
| `subtitle` | Muted paragraph below heading |
| `align` | `'center'` centers everything |

#### Structure

```
motion.div.section-header.center?  [fadeUp whileInView]
  div.eyebrow
  h2  [with optional span.text-gradient for titleHighlight]
  p   [subtitle]
  div.divider-ornament
    div.divider-diamond
```

---

## 5. Root & Layout Files

---

### 5.1 Root Layout (app/layout.js)

**File:** `src/app/layout.js`

```html
<html data-theme="light">
  <head>
    Google Fonts: Cormorant Garamond, DM Sans, JetBrains Mono
    <link rel="icon" favicon />
    <title>BanquetEase</title>
  </head>
  <body>
    <Preloader />
    <AuthProvider>
      {children}
    </AuthProvider>
  </body>
</html>
```

- **CSS:** Imports `globals.css`
- **Providers:** `AuthProvider` from `@/contexts/auth-context`
- **Components:** `Preloader` from `@/components/ui`

---

### 5.2 Marketing Layout

**File:** `src/app/(marketing)/layout.js`

```jsx
<>
  <Navbar />
  <main>{children}</main>
  <Footer />
  <BackToTop />
</>
```

No state, no providers. Delegates all styles to children.

---

### 5.3 Dashboard Layout

**File:** `src/app/(dashboard)/layout.js`

#### State

`useState(mobileOpen)` — mobile hamburger toggle

#### Structure

```
div  [grid-dashboard flex container]
  Sidebar  [mobileOpen, onClose={()=>setMobile(false)}]
  div
    div.mobile-topbar
      button  [Menu icon → setMobile(true)]
      span    [BanquetEase brand text]
    main.dashboard-main
      {children}
BackToTop
```

#### CSS Classes

`.mobile-topbar`, `.dashboard-main`, inline CSS vars `--color-text-h`, `--font-display`

---

## 6. Auth Pages

---

### 6.1 Login

**File:** `src/app/login/page.js`

#### State

`email`, `password`, `showPwd`, `error`, `loading` — all `useState`  
`useAuth()` for `login()` function

#### UI Structure

```
div  [full-viewport flex row]
  div.login-brand-panel  [left — gradient-hero bg]
    Logo image (next/image)
    h1 tagline (--font-display italic)
    3 stat items (Franchises, Branches, Success Rate)
  div  [right — form panel]
    h2 "Welcome Back"
    input.input  [email]
    div.input-group  [password + Eye toggle button]
    button.btn.btn-primary  [Sign In + spinner when loading]
    Link  [Sign Up]
    div  [Dev quick-login panel: 8 role buttons]
```

#### Notable Classes

`.login-brand-panel`, `.input`, `.btn.btn-primary`, `.btn.btn-outline.btn-sm`

#### Dev Panel

8 quick-login buttons for roles: Super Admin, Franchise Admin, Branch Manager, Sales, Event Coordinator, Finance, Inventory, Customer — each uses `--color-primary-ghost` ghost style.

---

### 6.2 Signup

**File:** `src/app/signup/page.js`

#### State

`form: {name, email, phone, password, confirm}`, `showPwd`, `error`, `loading`  
`useAuth()` for `signup()`

#### UI Structure

Same two-panel layout as login. Right form panel contains:
- Full Name input
- Email input
- Phone input
- Password with Eye toggle
- Confirm Password
- `btn-primary` "Create Account" submit
- "Already have an account?" login link

---

## 7. Marketing Pages

---

### 7.1 Home (Landing)

**File:** `src/app/(marketing)/page.js`

11 sections, all as named function components:

| Section | Layout | Key Elements |
|---|---|---|
| `HeroSection` | Full-viewport with `gradient-hero` bg | Animated badge, h1 with `.text-gradient` split, CTA buttons, stats grid, scroll indicator |
| `TrustedBy` | Ticker strip | `animation: ticker` infinite horizontal scroll |
| `ProblemSolution` | `.two-col` | Icon list of problems → solutions |
| `FeaturesGrid` | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` | 6 feature cards |
| `LeadPipeline` | Horizontal 9-step row | Numbered circles connected by lines |
| `AnalyticsPreview` | `.kpi-row` grid | 4 KPI cards with change indicators |
| `ReviewSystem` | 3-col grid | Star rating cards with avatar |
| `BonusFeatures` | 2-col grid | 6 feature items with icons |
| `Testimonials` | 3-col grid | `.testimonial-card` with quote |
| `PricingSection` | 3-col grid | Plan cards with feature checklists |
| `CTABanner` | Full-width | Call-to-action with gradient bg |

**Shared UI used:** `SectionHeader`, `GsapReveal`; Framer Motion: `fadeUp`, `staggerContainer`, `heroBadge`, `heroLine`, `heroCTA`, `heroStats`, `scaleIn`, `slideInLeft`, `slideInRight`

---

### 7.2 About

**File:** `src/app/(marketing)/about/page.js`

| Section | Layout |
|---|---|
| Hero | Badge + h1 + subtitle, centered |
| Our Story | 3-paragraph prose in `.container-narrow` |
| Our Values | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` — 4 cards with `.card-icon` |
| Team | Same 4-col grid — avatar circle with initial letter |

---

### 7.3 Features

**File:** `src/app/(marketing)/features/page.js`

| Section | Layout |
|---|---|
| Hero | Badge "14 Modules", h1, subtitle |
| Features Grid | `grid grid-cols-1 md:grid-cols-2 gap-8` — 14 `.card` items each with `.card-icon`, title, description |

Uses `SectionHeader`, Framer Motion `staggerContainer`/`fadeUp`.

---

### 7.4 Contact

**File:** `src/app/(marketing)/contact/page.js`

| Section | Layout |
|---|---|
| Hero | Centered badge + h1 |
| Main | `grid grid-cols-1 md:grid-cols-2 gap-12` |
| Left | Form: name, email, phone, venue, topic select, message textarea, `.btn-primary` Send |
| Right | 3 info cards (Mail, Phone, MapPin) + "Schedule a Demo" card |

---

### 7.5 Pricing

**File:** `src/app/(marketing)/pricing-page/page.js`

| Section | Layout |
|---|---|
| Hero | Badge + h1 + subtitle |
| Plans | `grid grid-cols-1 md:grid-cols-3 gap-7` — Starter/Pro/Enterprise cards |
| Popular plan | Gold border (`--color-accent`), "Most Popular" `.badge-accent`, elevated z-index |
| FAQ | `.container-narrow` — static Q&A `.card` list |

---

## 8. Dashboard Pages

---

### 8.1 Branch Dashboard

**File:** `src/app/(dashboard)/dashboard/branch/page.js`

| Component | Description |
|---|---|
| KPI Row | 6 cards: Total Bookings, Revenue MTD, Upcoming Events, Occupancy, Active Leads, Avg Rating |
| Revenue Chart | Recharts `BarChart` (monthly revenue) |
| Hot Leads | Inline card list with lead name, event type, score `.badge` |
| Upcoming Events | Inline list with hall name, date, guest count |
| Recent Bookings | Mini table with client, type, status `.badge` |

**CSS:** `kpi-row`, `kpi-card`, `kpi-label`, `kpi-value`, `kpi-change positive/negative`, `badge badge-green`, `badge-accent`, `card`, `page-header`, `btn btn-primary`

---

### 8.2 Customer Dashboard

**File:** `src/app/(dashboard)/dashboard/customer/page.js`

| Component | Description |
|---|---|
| KPI Row | 4 cards: Total Bookings, Active Events, Amount Paid, Amount Due |
| Event cards | Grid of upcoming events with checklist progress bar |
| Booking history | `data-table` CSS table |
| Venue cards | Available halls grid with capacity/pricing |
| Review CTA | Single card prompting a review |

KPI totals derived via `Array.reduce` from mock data. Progress bar uses inline `div` with `background: var(--gradient-bar)`.

---

### 8.3 Franchise Dashboard

**File:** `src/app/(dashboard)/dashboard/franchise/page.js`

| Component | Description |
|---|---|
| KPI Row | 5 cards: Branches, Staff, MTD Revenue, Active Bookings, Lead Win Rate |
| Revenue Chart | Recharts `BarChart` (cross-branch monthly) |
| Lead Funnel | Vertical bar chart of pipeline stages |
| Branches Table | `data-table` with all branches, occupancy, revenue |

---

### 8.4 Platform Dashboard (Super Admin)

**File:** `src/app/(dashboard)/dashboard/platform/page.js`

| Component | Description |
|---|---|
| KPI Row | 6 cards: Franchises, Branches, Staff, Bookings MTD, Revenue MTD, System Health |
| Revenue Chart | Recharts `BarChart` (all franchises combined) |
| Revenue by Branch | Recharts `PieChart` + `Cell` |
| Franchise Table | `data-table` summary |

---

### 8.5 Analytics

**File:** `src/app/(dashboard)/analytics/page.js`

**State:** `useState(active)` — active tab

| Tab | Chart/Content |
|---|---|
| Revenue | `BarChart` monthly revenue |
| Bookings | `PieChart` by status |
| Leads | Vertical `BarChart` by source |
| Payments | KPI grid: collected, pending, outstanding |
| Inventory | Low-stock summary KPIs |
| Events | Event completion rate KPIs |
| Staff | Staff utilization KPIs |

**CSS:** `tab-list`, `tab-item active`, `kpi-card`, `card`, `btn btn-outline btn-sm`  
**Tailwind:** `grid grid-cols-1 md:grid-cols-2`, `md:grid-cols-3`, `sm:grid-cols-2 lg:grid-cols-4`, `gap-4`, `mb-6`

---

### 8.6 Bookings — List

**File:** `src/app/(dashboard)/bookings/page.js`

**State:** `useState(activeTab)`, `useState(search)`

| Component | Usage |
|---|---|
| `PageHeader` | Title + Calendar View, Export, New Booking actions |
| `SearchRow` | Free-text filter |
| `Tabs` | Status tabs: All, Confirmed, Tentative, Cancelled, Completed |
| `DataTable` | 7 columns: ID (mono), client, event type, date, hall, amount (mono), status badge |

**Shared UI:** `DataTable`, `Tabs`, `SearchRow`, `Badge`

---

### 8.7 Bookings — Detail

**File:** `src/app/(dashboard)/bookings/[id]/page.js`

**State:** `useState(tab)`, `useState(checklist)`

| Tab | Content |
|---|---|
| Overview | `detail-row` with `info-grid` (booking info) + `detail-aside` (financial breakdown card) |
| Payments | Inline payments table |
| Invoice | Printable invoice layout with line items |
| Event Checklist | Toggleable `.checklist-item` rows |
| Decor | Decor package info |

**Layout:** `page-header` → 4-KPI row → custom tab bar → tab content using `detail-row/detail-main/detail-aside`

---

### 8.8 Bookings — Create

**File:** `src/app/(dashboard)/bookings/create/page.js`

**State:** `useState(form)` — ~25 fields

5-section form in a single `.form-card`:
1. **Client & Event** — clientName, phone, eventType, guestCount, date, hall
2. **Package & Menu** — package, menu selection
3. **Decor** — decor package, custom notes
4. **Financials** — total amount, advance %, dynamic pricing badge
5. **Requirements** — special requirements textarea

**CSS:** `form-card`, `form-section-title`, `form-grid`, `form-field`, `form-span-2`, `form-actions`

---

### 8.9 Branches — List

**File:** `src/app/(dashboard)/branches/page.js`

| Column | Notes |
|---|---|
| Branch Name | Display font |
| City | — |
| Manager | — |
| Occupancy | Inline mini progress bar with `--gradient-bar` |
| Status | `Badge` |
| Bookings MTD | `--font-mono` |
| Revenue MTD | `--font-mono` |
| Actions | Link to detail |

**Shared UI:** `DataTable`, `Badge`

---

### 8.10 Branches — Detail

**File:** `src/app/(dashboard)/branches/[id]/page.js`

**State:** `useState(tab)`

| Tab | Content |
|---|---|
| Overview | `detail-row`: `info-grid` (address, hours, contact) + `detail-aside` (quick actions) |
| Halls | Table of hall inventory |
| Staff | Placeholder |
| Reports | Placeholder |
| Settings | Link button |

**Layout:** Page header + 4-KPI row + tab bar + tab content

---

### 8.11 Branches — Create

**File:** `src/app/(dashboard)/branches/create/page.js`

**State:** `useState(form)` — ~20 fields; `useRouter`

3-card form:
1. **Branch Information** — name, address fields, operating hours
2. **Financial Details** — GST, tax rate, advance %, bank details
3. **Branch Manager Account** — name, email, temp password

---

### 8.12 Calendar

**File:** `src/app/(dashboard)/calendar/page.js`

**State:** `useState(year)`, `useState(month)` — with `prev()`/`next()` handlers

Custom monthly calendar grid from scratch:
- 7-column CSS `grid` with day headers (Sun–Sat)
- Day cells with day number + event pills
- Event pills color-coded: green = confirmed, yellow = tentative
- Prev/Next month navigation buttons

---

### 8.13 Staff — List

**File:** `src/app/(dashboard)/staff/page.js`

| Column | Notes |
|---|---|
| Employee | Avatar circle (gold gradient initial) + name |
| Role | `Badge` |
| Branch | — |
| Email | — |
| Type | `Badge` (Permanent/Temporary) |
| Join Date | — |
| Status | `Badge` |

**Shared UI:** `DataTable`, `Badge`  
Page header has "Add Temp Staff" + "Add Staff Member" buttons.

---

### 8.14 Staff — Detail

**File:** `src/app/(dashboard)/staff/[id]/page.js`

**State:** `useState(tab)`

| Tab | Content |
|---|---|
| Overview | `detail-row`: info-grid (personal info + emergency contact) + `detail-aside` (actions) |
| Schedule | Placeholder |
| Attendance | Placeholder |
| Payroll | Placeholder |
| Documents | Placeholder |

**Layout:** Page header + 3-KPI row (Events handled, Avg Rating, Attendance %)

---

### 8.15 Staff — Create

**File:** `src/app/(dashboard)/staff/create/page.js`

**State:** `useState(staffType)` — `'permanent'|'temporary'`; `useState(form)` — ~20 fields

Toggle pill at top (Permanent / Temporary) changes visible form sections:
1. Personal Details
2. Role & Assignment
3. Contract Details *(conditional — temp only)*
4. Emergency Contact
5. Notification Preferences

---

### 8.16 Menus — List

**File:** `src/app/(dashboard)/menus/page.js`

Animated `staggerContainer` 2-column card grid. Each card shows:
- Menu name (display font)
- Status badge (green = active)
- Cuisine type, Price/plate (mono), Min plates, Applicability

**Tailwind:** `grid grid-cols-1 md:grid-cols-2 gap-6`

---

### 8.17 Menus — Detail

**File:** `src/app/(dashboard)/menus/[id]/page.js`

**State:** `useState(tab)`

| Tab | Content |
|---|---|
| Overview | `info-grid`: price, cuisine, type, dietary flags |
| Items | Course sections with item pill lists |
| Bookings | Placeholder |

4-KPI row: Price/plate, Min/Max pax, Courses count.

---

### 8.18 Menus — Create

**File:** `src/app/(dashboard)/menus/create/page.js`

**State:** `useState(form)` — 12 fields; `useState(items)` — dynamic course/item array

Handlers: `addCourse`, `updateCourse`, `addItem`, `updateItem`/`removeItem`, `removeCourse`

2-section form:
1. Menu Details — name, cuisine, type, price, pax range, dietary checkboxes
2. Courses & Items — dynamic course blocks, each with add/remove item capability

---

### 8.19 Leads — List

**File:** `src/app/(dashboard)/leads/page.js`

**State:** `useState(activeTab)`, `useState(search)`

| Component | Usage |
|---|---|
| `SearchRow` | Free text search |
| `Tabs` | 9 status tabs: All, New, Contacted, Follow-up, Site Visit, Proposal Sent, Negotiation, Won, Lost |
| `DataTable` | Columns: lead name, phone, event type, budget (mono), source, AI score badge (gradient), status badge |

**Shared UI:** `DataTable`, `Tabs`, `SearchRow`, `Badge`

---

### 8.20 Leads — Detail

**File:** `src/app/(dashboard)/leads/[id]/page.js`

**State:** `useState(tab)`, `useState(aiRescoring)`

| Tab | Content |
|---|---|
| Overview | `detail-row`: lead info + aside (stage, score, assignment) |
| Activity | Timeline of events (`.timeline`, `.timeline-item`, `.timeline-dot`) |
| Follow-ups | Table of scheduled follow-up tasks |
| Proposal | Proposal preview card |
| Decor Preview | AI-generated decor images slot |
| Notes | Textarea + saved notes list |
| AI Panel | Lead risk score, win probability, suggestions |

4-KPI row: Budget, Score, Days in Pipeline, Event Date.

---

### 8.21 Leads — Create

**File:** `src/app/(dashboard)/leads/create/page.js`

**State:** `useState(form)` — 17 fields; `useRouter`

5-section `.form-card`:
1. Client Info — name, phone, email, `clientType` (individual/corporate)
2. Corporate Details *(conditional when corporate)*
3. Event Details — type, date, guests, hall, duration
4. Budget — range, notes
5. Lead Source + conditional Referrer field; Assignment & Follow-up date

---

### 8.22 Inventory — List

**File:** `src/app/(dashboard)/inventory/page.js`

Features conditional low-stock alert banner (amber bg with ` AlertTriangle` icon).

| Column | Notes |
|---|---|
| Item Name | — |
| Category | Badge |
| Quantity | Mono, red if below reorder level |
| Unit | — |
| Reorder Level | — |
| Last Updated | — |
| Status | Badge (In Stock / Low Stock / Out of Stock) |

**Shared UI:** `DataTable`, `Badge`

---

### 8.23 Inventory — Detail

**File:** `src/app/(dashboard)/inventory/[id]/page.js`

**State:** `useState(tab)` — Overview / Stock Ledger

| Tab | Content |
|---|---|
| Overview | `info-grid`: category, unit, reorder level, supplier, branch, last count date |
| Stock Ledger | Full-width table of transactions with color-coded type (Received=green, Consumed=red, Adjusted=blue) |

4-KPI row: Current Stock, Reorder Level, Last Received, Valuation.

---

### 8.24 Inventory — Create

**File:** `src/app/(dashboard)/inventory/create/page.js`

**State:** `useState(form)` — 14 fields

3-card form:
1. Item Information — name, category, unit, description
2. Stock & Pricing — quantity, reorder level, unit price, supplier
3. Assignment — branch, vendor

---

### 8.25 Payments

**File:** `src/app/(dashboard)/payments/page.js`

Read-only payments ledger. Single `DataTable`:

| Column | Notes |
|---|---|
| Payment ID | Mono |
| Booking | Link to booking |
| Client | — |
| Amount | Mono, green |
| Method | Badge |
| Date | — |
| Status | Badge |

Page header buttons: Export, Record Payment.

**Shared UI:** `DataTable`, `Badge`

---

### 8.26 Purchase Orders — List

**File:** `src/app/(dashboard)/purchase-orders/page.js`

| Column | Description |
|---|---|
| PO Number | Mono |
| Vendor | — |
| Branch | — |
| Items | Count |
| Total | Mono |
| Date | — |
| Status | Badge |

**Shared UI:** `DataTable`, `Badge`

---

### 8.27 Purchase Orders — Detail

**File:** `src/app/(dashboard)/purchase-orders/[id]/page.js`

**State:** `useState(tab)` — Overview / Items

| Tab | Content |
|---|---|
| Overview | `info-grid`: vendor, branch, order date, delivery date, terms, notes |
| Items | Full-width table with `<tfoot>` showing subtotal, GST 18%, total |

Page actions: Download PDF, Mark as Received.

---

### 8.28 Purchase Orders — Create

**File:** `src/app/(dashboard)/purchase-orders/create/page.js`

**State:** `useState(form)` + `useState(items)` — dynamic line-item rows

3-card form:
1. Order Details — vendor, branch, order date, expected delivery, payment terms
2. Line Items — dynamic table rows (item name, unit, qty, rate, amount = auto-calculated); Subtotal / GST 18% / Total live computation
3. Notes

Form actions: Cancel, Save as Draft, Submit PO.

---

### 8.29 Vendors — List

**File:** `src/app/(dashboard)/vendors/page.js`

Responsive `grid grid-cols-1 md:grid-cols-2 gap-6` card grid. Each card:
- Vendor name (display font)
- Type badge
- Contact name, phone
- Rate (mono)
- Star rating (⭐ × 5 with `--color-star`)

Uses `.badge` CSS classes directly (not `Badge` component).

---

### 8.30 Vendors — Detail

**File:** `src/app/(dashboard)/vendors/[id]/page.js`

**State:** `useState(tab)` — Overview / Bookings / Reviews / Documents

| Tab | Content |
|---|---|
| Overview | `detail-row`: info-grid (contact, address, GST, rate) + `detail-aside` (actions: Edit, Call, Email, Create PO) |
| Bookings | Placeholder |
| Reviews | Placeholder |
| Documents | Placeholder |

4-KPI row: Total Orders, Total Spend, Rating, Last Order.

---

### 8.31 Vendors — Create

**File:** `src/app/(dashboard)/vendors/create/page.js`

**State:** `useState(form)` — 18 fields

3-card form:
1. Vendor Information — name, type, contact name, email, phone, address
2. Financial & Legal Details — GST, PAN, bank account, IFSC, rate, credit terms
3. Additional Notes — textarea

---

### 8.32 Events — List

**File:** `src/app/(dashboard)/events/page.js`

**State:** `useState(activeTab)` — All / Upcoming / In Progress / Completed

`Tabs` component + `grid grid-cols-1 md:grid-cols-2 gap-6` of animated event cards:
- Event name, booking link
- Hall, date, guest count
- Staff count
- Animated progress bar (% checklist complete)
- Status badge

**Shared UI:** `Tabs`, `Badge`

---

### 8.33 Events — Detail

**File:** `src/app/(dashboard)/events/[id]/page.js`

**State:** `useState(tab)`, `useState(checklist)`, `useState(notes)`

| Tab | Content |
|---|---|
| Overview | `detail-row`: event info + aside (client, booking, actions) |
| Checklist | Clickable `.checklist-item` rows; `CheckCircle`/`Circle` icons toggle done state; progress bar at top |
| Staff | Table with assigned staff + status |
| Vendors | Table with vendor name, service, status badge |
| Decor | Decor package info |
| Notes | `<textarea>` + save button |

4-KPI row: Event Date, Guest Count, Checklist %, Hall.

---

### 8.34 Decor — List

**File:** `src/app/(dashboard)/decor/page.js`

`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` of animated cards:
- Package name (display font)
- Theme badge
- Price range (mono)
- `suitableFor` event-type tags

---

### 8.35 Decor — Detail

**File:** `src/app/(dashboard)/decor/[id]/page.js`

**State:** `useState(tab)` — Overview / AI Preview / Bookings

| Tab | Content |
|---|---|
| Overview | `detail-row`: info-grid (theme, palette, event types, pricing) + `detail-aside` (Generate AI Preview button) |
| AI Preview | Centered `Brain` icon placeholder ("Generate AI visual below") |
| Bookings | Placeholder |

4-KPI row: Min Price, Max Pax, Color Palette, Suitable Events count.

---

### 8.36 Decor — Create

**File:** `src/app/(dashboard)/decor/create/page.js`

Uses Framer Motion `staggerContainer`/`fadeUp` on the entire page.

Form fields (single large card): name, theme, event type, palette, base/max price, min/max pax, branch, tags, description, image URL.

Below the form: **AI tip banner** — gold primary bg card with `Brain` icon explaining AI preview generation.

---

### 8.37 Franchises — List

**File:** `src/app/(dashboard)/franchises/page.js`

`grid grid-cols-1 md:grid-cols-2 gap-6` of animated cards per franchise:
- `Building2` Lucide icon circle (primary color)
- Franchise name + city
- Owner name
- Branch count
- Revenue (formatted to "X.X L" Lakhs)
- Subscription plan badge

**Shared UI:** `Badge`

---

### 8.38 Franchises — Detail

**File:** `src/app/(dashboard)/franchises/[id]/page.js`

**State:** `useState(tab)` — Overview / Branches / Staff / Reports / Settings

| Tab | Content |
|---|---|
| Overview | `detail-row`: info-grid (address, GST, plan, owner) + `detail-aside` (quick actions + KPI cards) |
| Branches | Table with branch rows → Link to branch detail |
| Staff | Centered icon + link to Staff Management |
| Reports | Centered icon + placeholder |
| Settings | Link button to franchise settings |

4-KPI row: Branches, Staff, Bookings YTD, Revenue YTD — each with Lucide icon.

---

### 8.39 Franchises — Create

**File:** `src/app/(dashboard)/franchises/create/page.js`

**State:** `useState(form)` — 22 fields

4-card form (most comprehensive create form):
1. **Franchise Information** — name, city, address, owner name/email/phone, GST, advance %, cancellation policy, subscription plan
2. **Branding** — logo URL, banner URL, primary/accent color pickers (`input[type=color]`)
3. **Franchise Admin Account** — name, email, temp password, phone
4. **Notification Preferences** — Resend API key, WATI API key, 3 boolean checkboxes

---

### 8.40 Users

**File:** `src/app/(dashboard)/users/page.js`

Single `DataTable` using `staffData` as proxy:

| Column | Notes |
|---|---|
| User | Avatar circle (gold gradient) + name |
| Email | — |
| Role | `Badge` |
| Branch | — |
| Status | `Badge` |
| Last Active | — |

---

### 8.41 Reviews

**File:** `src/app/(dashboard)/reviews/page.js`

Page header with "Generate QR" button.

4-KPI row: Avg Rating, Total Reviews, Positive %, This Month.

Staggered card list per review:
- Avatar circle with customer initial
- Customer name, date
- Star rating row (`--color-star`)
- Sentiment badge (Positive/Neutral/Negative)
- Review text
- Reply button + "AI Suggest Reply" button

---

### 8.42 Dynamic Pricing — List

**File:** `src/app/(dashboard)/dynamic-pricing/page.js`

`grid grid-cols-1 md:grid-cols-2 gap-6` of rule cards:
- Rule icon (Lucide based on type)
- Rule name
- Type badge (Season/Day/Demand/Promo)
- Multiplier value (e.g. "1.25×", mono)
- Active status badge

---

### 8.43 Dynamic Pricing — Create

**File:** `src/app/(dashboard)/dynamic-pricing/create/page.js`

**State:** `useState(form)` — ruleName, ruleType, dateFrom/To, recurringDays[], halls[], menus[], modifierType, modifierValue, priority, active, notes

5-section `.form-card`:
1. Rule Details — name, type
2. Date Range — `from`/`to` date inputs *(conditional on date-based)*; OR Day Selector — button toggles for Mon–Sun *(conditional on recurring)*
3. Price Modifier — type (percentage/fixed/multiplier) + value
4. Applies To — toggle-button selectors for halls list and menus list
5. Status & Notes — active toggle (`input[type=checkbox]`) + notes textarea

---

### 8.44 Billing — List

**File:** `src/app/(dashboard)/billing/page.js`

**State:** `useState(activeTab)` — All / Paid / Partial / Unpaid

`Tabs` → `DataTable`:

| Column | Notes |
|---|---|
| Invoice # | `--font-mono` |
| Booking | — |
| Client | — |
| Amount | Mono |
| Paid | Mono, green |
| Due | Mono, red if > 0 |
| Status | Badge |

**Shared UI:** `DataTable`, `Tabs`, `Badge`

---

### 8.45 Billing — Detail

**File:** `src/app/(dashboard)/billing/[id]/page.js`

Full invoice document view in a `.card`:
- Brand header (logo + company info)
- "INVOICE" title with invoice number
- Bill To section
- Line items `<table>` with description, qty, rate, amount
- `<tfoot>` with subtotal, GST 18%, total
- Payment history list

Page actions: Download PDF, Send Invoice, Record Payment.
4-KPI row: Invoice Date, Due Date, Total Amount, Balance Due.

---

### 8.46 Audit Logs

**File:** `src/app/(dashboard)/audit-logs/page.js`

**State:** `useState(search)` — client-side filter by user/action

`SearchRow` → `DataTable`:

| Column | Notes |
|---|---|
| Timestamp | Mono |
| User | — |
| Role | `Badge` |
| Action | Pill with `--color-primary-ghost` bg, mono font |
| Resource | — |
| Details | Muted small text |
| IP Address | Mono |

---

### 8.47 Settings — Global

**File:** `src/app/(dashboard)/settings/global/page.js`

Uncontrolled form with `defaultValue`. Super Admin only.

`.card .form-card` with 2 sections:
1. **Platform Configuration** — Platform Name, Default Currency, Date Format, Timezone
2. **API Keys** — Resend, WATI, Google AI, Firebase Admin, Custom Webhook (all `type=password`)

---

### 8.48 Settings — Branch

**File:** `src/app/(dashboard)/settings/branch/page.js`

Uncontrolled `.form-card` with 3 sections:
1. **Branch Information** — name, address fields, phone, email, operating hours
2. **Billing Details** — GST number, PAN, advance %, tax rate, bank account, IFSC
3. **Notification Preferences** — 5 `checkbox` toggles: booking confirmed, payment received, lead assigned, low stock, event reminders

---

### 8.49 Settings — Franchise

**File:** `src/app/(dashboard)/settings/franchise/page.js`

Uncontrolled `.form-card` with 4 sections:
1. **Franchise Information** — name, email, phone, city, address, subscription plan
2. **Branding** — logo URL, banner URL, primary/accent color
3. **Notifications** — WATI API key, Resend API key
4. **Default Settings** — default tax %, default advance %, currency (disabled — display only)

---

## 9. CSS Class Quick Reference

### Layout

| Class | Purpose |
|---|---|
| `.container` | 1200px max-width centered |
| `.container-narrow` | 880px max-width |
| `.container-wide` | 1440px max-width |
| `.section` | 112px vertical padding |
| `.grid-dashboard` | 260px sidebar + 1fr main |
| `.kpi-row` | Auto-fit minmax(180px) grid |
| `.two-col` / `.three-col` | 2/3 equal column grids |
| `.detail-row` | Flex row for main + aside layout |
| `.form-grid` | 2-column form grid |
| `.info-grid` | 2-column info display grid |

### Components

| Class | Purpose |
|---|---|
| `.card` | Surface with hover lift + sweep animation |
| `.card-icon` | 54px circle icon container |
| `.btn` | Base button styles |
| `.btn-primary` | Gold gradient CTA |
| `.btn-outline` | Crimson outline button |
| `.btn-ghost` | Frosted glass button |
| `.badge` | Pill status indicator |
| `.input` | Form field with focus glow |
| `.select` | Custom dropdown with SVG arrow |
| `.sidebar` | 260px fixed left navigation |
| `.modal-overlay` | Blurred fixed overlay |
| `.toast` | Notification with colored left border |
| `.progress-bar-fill` | Gold gradient progress fill |
| `.checklist-item` | Checkbox row with separator |
| `.timeline-item` | Timeline row with dot |
| `.skeleton` | Shimmer loading placeholder |

### Typography

| Class | Purpose |
|---|---|
| `.text-gradient` | Red→gold background-clip text |
| `.animated-gradient-text` | Looping gradient animation on text |
| `.eyebrow` | Small uppercase section label |
| `.display-hero` | Largest display heading |

### Animation Utilities

| Class | Purpose |
|---|---|
| `.page-enter` | `fadeUp` page transition |
| `.hover-lift` | Lift + shadow on hover |
| `.focus-ring` | Accent focus-visible ring |
| `.bounce-dot` | Three-dot bounce loader |
| `.skeleton` | Shimmer loading state |

### Status

| Class | Color |
|---|---|
| `.badge-green` / `.toast-success` | Green (`--color-success`) |
| `.badge-red` / `.toast-error` | Red (`--color-danger`) |
| `.badge-accent` / `.toast-warning` | Gold (`--color-accent`) |
| `.badge-primary` / `.toast-info` | Crimson (`--color-primary`) |
| `.badge-neutral` | Gray (`--color-text-muted`) |
| `.kpi-change.positive` | Green text with ↑ |
| `.kpi-change.negative` | Red text with ⚠ |

---

*End of BanquetEase UI & CSS Reference*
