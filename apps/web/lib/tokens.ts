/**
 * Design tokens — single source of truth for the design system.
 *
 * Consumed by:
 *   • theme.ts      → MUI ThemeProvider (palette, shape, shadows, typography, component overrides)
 *   • globals.css   → CSS custom properties (must stay in sync with these values)
 *   • Component sx props / inline styles that need raw values
 *
 * Palette direction: "Deep Slate + Electric Blue"
 *   Light, airy surfaces with a strong dark brand and a vivid blue accent.
 *   Inspired by modern SaaS design (Linear, Vercel, Stripe).
 *
 * WCAG contrast notes (on --surface #fff):
 *   textPrimary  (#0F172A) → 19.4:1 ✓ AAA
 *   textSecondary (#475569) → 7.0:1 ✓ AAA
 *   textMuted    (#94A3B8) → 2.9:1  (decorative / large text only)
 *   textOnDark on navy (#0F172A) → 19.4:1 ✓
 */
export const tokens = {
  color: {
    /* ── Brand ── */
    navy: '#0F172A', // slate-950   — deep, clean dark
    navyMid: '#2563EB', // blue-600    — vivid modern accent
    navyLight: '#EFF6FF', // blue-50     — soft tint for hovers / highlights

    amber: '#F59E0B', // amber-400
    amberLight: '#FEF9C3', // yellow-100

    /* ── Surfaces ── */
    bg: '#F1F5F9', // slate-100   — clean off-white page background
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC', // slate-50    — inset sections, table headers

    /* ── Text ── */
    textPrimary: '#0F172A', // slate-950
    textSecondary: '#475569', // slate-600
    textBody: '#334155', // slate-700
    textLabel: '#64748B', // slate-500
    textMuted: '#94A3B8', // slate-400
    textOnDark: '#FFFFFF',

    /* ── Borders ── */
    border: '#CBD5E1', // slate-300
    borderSubtle: '#E2E8F0', // slate-200

    /* ── Semantic ── */
    success: '#10B981', // emerald-500
    successDark: '#059669', // emerald-600
    error: '#EF4444', // red-500
    errorDark: '#DC2626', // red-600
    warning: '#F59E0B', // amber-400
    warningDark: '#D97706', // amber-600
    info: '#2563EB', // blue-600
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },

  shadow: {
    xs: '0 1px 2px rgba(15,23,42,0.05)',
    sm: '0 1px 3px rgba(15,23,42,0.07), 0 2px 8px rgba(15,23,42,0.04)',
    md: '0 4px 16px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)',
    lg: '0 12px 40px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)',
  },

  font: {
    display: "'Outfit', sans-serif",
    body: "'Inter', sans-serif",
  },

  layout: {
    sidebarWidth: 260,
    topbarHeight: 60,
  },
} as const;

export type Tokens = typeof tokens;
