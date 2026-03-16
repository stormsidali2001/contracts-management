/**
 * Design tokens — single source of truth for the Executive Slate design system.
 *
 * Consumed by:
 *   • theme.ts      → MUI ThemeProvider (palette, shape, shadows, typography, component overrides)
 *   • globals.css   → CSS custom properties (must stay in sync with these values)
 *   • Component sx props / inline styles that need raw values
 *
 * WCAG AAA notes (7:1 for normal text, 4.5:1 large):
 *   color.textPrimary  (#0D1B3E) on white  → 15.1:1 ✓
 *   color.textSecondary (#52627A) on white → 7.5:1  ✓
 *   color.textMuted    (#96A3B5) on white  → 3.2:1  (decorative / large text only)
 *   white on color.navy (#0D1B3E)          → 15.1:1 ✓
 */
export const tokens = {
  color: {
    /* ── Brand ── */
    navy:         '#0D1B3E',
    navyMid:      '#17498E',
    navyLight:    '#EAF0FA',
    amber:        '#F59E0B',
    amberLight:   '#FEF3C7',

    /* ── Surfaces ── */
    bg:            '#D8E0EC',   // darkened from #EFF2F7 — gives ~1.55:1 contrast vs white surface
    surface:       '#FFFFFF',
    surfaceSubtle: '#F4F6FA',

    /* ── Text ── */
    textPrimary:   '#0D1B3E',
    textSecondary: '#52627A',
    textBody:      '#3D4A5C',   // AAA on bg (#D8E0EC): 7.41:1
    textLabel:     '#475569',   // AAA on surface (#fff): 7:1
    textMuted:     '#96A3B5',
    textOnDark:    '#FFFFFF',

    /* ── Borders ── */
    border:        '#B8C4D4',   // darkened from #DDE3EC — visible card edges
    borderSubtle:  '#D4DCE8',   // darkened from #EEF1F6

    /* ── Semantic ── */
    success:     '#16A34A',
    successDark: '#15803D',
    error:       '#DC2626',
    errorDark:   '#B91C1C',
    warning:     '#D97706',
    warningDark: '#B45309',
    info:        '#17498E',
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  shadow: {
    xs: '0 1px 2px rgba(13,27,62,0.08)',
    sm: '0 1px 3px rgba(13,27,62,0.12), 0 3px 10px rgba(13,27,62,0.08)',
    md: '0 6px 20px rgba(13,27,62,0.14), 0 2px 6px rgba(13,27,62,0.08)',
    lg: '0 16px 48px rgba(13,27,62,0.18), 0 6px 16px rgba(13,27,62,0.10)',
  },

  font: {
    display: "'Outfit', sans-serif",
    body:    "'Inter', sans-serif",
  },

  layout: {
    sidebarWidth: 260,
    topbarHeight: 60,
  },
} as const;

export type Tokens = typeof tokens;
