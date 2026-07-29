/**
 * ResuMap design tokens — single source of truth for the editorial
 * monograph aesthetic across all pages (Landing, Login, Dashboard, Analyze).
 *
 * Import `tokens` for raw values or `theme` for inline-style helper objects.
 */

// ── Color palette ────────────────────────────────────────────────────
export const colors = {
  /** Page background — deepest ink */
  ink: '#0A0907',
  /** Card / section background — slightly lifted */
  card: '#0F0D0A',
  /** Elevated surface */
  elevated: '#15120E',

  /** Primary gold / brass */
  gold: '#C9A961',
  /** Gold hover state */
  goldLight: '#D4B97A',
  /** Gold semi-transparent */
  goldMuted: 'rgba(201, 169, 97, 0.3)',
  goldBorder: 'rgba(201, 169, 97, 0.6)',
  goldBg: 'rgba(201, 169, 97, 0.06)',

  /** Bright headline cream */
  cream: '#F8F2E4',
  /** Slightly dimmer cream */
  creamDim: '#F2E9D8',

  /** Body / secondary text */
  textMuted: '#7A7268',
  textDim: '#5C5550',

  /** Borders */
  border: '#26221B',
  borderLight: '#111',

  /** Feedback */
  success: 'rgba(16, 185, 129, 0.15)',
  successText: '#34D399',
  error: 'rgba(239, 68, 68, 0.15)',
  errorText: '#F87171',
  warning: 'rgba(245, 158, 11, 0.15)',
  warningText: '#FBBF24',

  /** CTA section background */
  forest: '#0E1F19',
};

// ── Typography ───────────────────────────────────────────────────────
export const fonts = {
  serif: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// ── Spacing ──────────────────────────────────────────────────────────
export const spacing = {
  maxWidth: 1280,
  sectionPy: 'clamp(6rem, 14vh, 12rem)',
  contentPx: '0 clamp(1.25rem, 4vw, 4rem)',
  cardPadding: 'clamp(1.5rem, 3vw, 2.5rem)',
};

// ── Animation ────────────────────────────────────────────────────────
export const easing = {
  /** Ease-out quint approximation */
  smooth: [0.22, 1, 0.36, 1],
  /** Slower, more dramatic editorial reveal */
  editorial: [0.16, 1, 0.3, 1],
};

// ── Reusable inline-style objects ────────────────────────────────────
export const theme = {
  // Page wrapper — full-bleed dark background
  page: {
    background: colors.ink,
    minHeight: '100vh',
    color: colors.creamDim,
  },

  // Navbar shared across app pages
  nav: {
    background: colors.ink,
    borderBottom: `1px solid ${colors.border}`,
    padding: '24px 48px',
  },

  // Card — the standard container
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 0,
  },

  // Card with some padding
  cardPadded: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 0,
    padding: spacing.cardPadding,
  },

  // Label / uppercase eyebrow text
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: colors.gold,
  },

  // Body text
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 1.6,
  },

  // Small muted text
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textDim,
  },

  // Input / textarea
  input: {
    width: '100%',
    padding: '14px 16px',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 0,
    color: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  },

  // Gold progress bar track
  progressTrack: {
    height: 1,
    background: colors.border,
    borderRadius: 0,
    overflow: 'hidden',
  },

  // Gold progress bar fill
  progressFill: (score) => ({
    height: '100%',
    background: colors.gold,
    width: `${Math.min(Math.max(score, 0), 100)}%`,
  }),

  // Sidebar link
  sidebarLink: (active) => ({
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: active ? colors.creamDim : colors.textDim,
    background: active ? colors.elevated : 'transparent',
    border: 'none',
    borderRadius: 0,
    cursor: 'pointer',
    padding: '10px 16px',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transition: 'color 0.2s, background 0.2s',
  }),

  // Heading style for app pages (serif, but smaller than Landing)
  appHeading: {
    fontFamily: fonts.serif,
    fontWeight: 400,
    color: colors.cream,
    letterSpacing: '-0.02em',
  },
};
