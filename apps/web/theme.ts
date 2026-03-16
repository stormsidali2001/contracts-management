import { createTheme } from '@mui/material';
import { tokens } from '@/lib/tokens';

const { color, radius, shadow, font } = tokens;

export const theme = createTheme({
  /* ─────────────────────────── Palette ─────────────────────────── */
  palette: {
    mode: 'light',
    primary: {
      main:          color.navyMid,
      light:         color.navyLight,
      dark:          color.navy,
      contrastText:  color.textOnDark,
    },
    secondary: {
      main:          color.amber,
      light:         color.amberLight,
      dark:          '#B45309',
      contrastText:  color.navy,
    },
    error: {
      main:          color.error,
      contrastText:  color.textOnDark,
    },
    warning: {
      main:          color.warning,
      contrastText:  color.textOnDark,
    },
    info: {
      main:          color.info,
      contrastText:  color.textOnDark,
    },
    success: {
      main:          color.success,
      contrastText:  color.textOnDark,
    },
    background: {
      default: color.bg,
      paper:   color.surface,
    },
    text: {
      primary:   color.textPrimary,
      secondary: color.textSecondary,
      disabled:  color.textMuted,
    },
    divider: color.border,
    action: {
      active:             color.navyMid,
      hover:              `${color.navyMid}0D`,   /* navyMid @ 5% */
      selected:           `${color.navyMid}17`,   /* navyMid @ 9% */
      disabled:           color.textMuted,
      disabledBackground: color.borderSubtle,
    },
  },

  /* ─────────────────────────── Typography ─────────────────────────── */
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    h1: { fontFamily: font.display, fontWeight: 700, fontSize: '2.25rem',  lineHeight: 1.2, letterSpacing: '-0.5px' },
    h2: { fontFamily: font.display, fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25, letterSpacing: '-0.4px' },
    h3: { fontFamily: font.display, fontWeight: 700, fontSize: '1.5rem',   lineHeight: 1.3, letterSpacing: '-0.3px' },
    h4: { fontFamily: font.display, fontWeight: 700, fontSize: '1.25rem',  lineHeight: 1.35 },
    h5: { fontFamily: font.display, fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontFamily: font.display, fontWeight: 600, fontSize: '1rem',     lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.5 },
    body1:     { fontWeight: 400, fontSize: '0.9375rem', lineHeight: 1.6 },
    body2:     { fontWeight: 400, fontSize: '0.875rem',  lineHeight: 1.55 },
    caption:   { fontWeight: 400, fontSize: '0.75rem',   lineHeight: 1.4 },
    button:    { fontWeight: 600, fontSize: '0.875rem',  textTransform: 'none' },
    overline:  { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.09em', textTransform: 'uppercase' },
  },

  /* ─────────────────────────── Shape ─────────────────────────── */
  shape: {
    borderRadius: radius.md,
  },

  /* ─────────────────────────── Shadows ─────────────────────────── */
  shadows: [
    'none',
    shadow.xs,
    shadow.sm,
    shadow.md,
    shadow.lg,
    shadow.lg, shadow.lg, shadow.lg, shadow.lg, shadow.lg,
    shadow.lg, shadow.lg, shadow.lg, shadow.lg, shadow.lg,
    shadow.lg, shadow.lg, shadow.lg, shadow.lg, shadow.lg,
    shadow.lg, shadow.lg, shadow.lg, shadow.lg, shadow.lg,
  ],

  /* ─────────────────────────── Component overrides ─────────────────────────── */
  components: {
    /* Button */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: shadow.sm },
        },
        containedPrimary: {
          '&:hover': { boxShadow: shadow.md },
        },
        containedSecondary: {
          color: color.navy,
        },
      },
    },

    /* Paper */
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          border: `1px solid ${color.border}`,
          backgroundImage: 'none',
        },
        elevation1: { boxShadow: shadow.xs },
        elevation2: { boxShadow: shadow.sm },
        elevation3: { boxShadow: shadow.md },
        elevation4: { boxShadow: shadow.lg },
      },
    },

    /* Card */
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.sm,
          backgroundImage: 'none',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: shadow.md,
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    /* TextField */
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.sm,
            backgroundColor: color.surface,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: color.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: color.navyMid,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: color.navyMid,
            borderWidth: 2,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: color.navyMid },
        },
      },
    },

    /* Select */
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: radius.sm },
      },
    },

    /* Dialog */
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius.lg,
          border: `1px solid ${color.border}`,
          boxShadow: shadow.lg,
        },
      },
    },

    /* Modal backdrop */
    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: `${color.navy}66`,   /* navy @ 40% */
          backdropFilter: 'blur(2px)',
        },
      },
    },

    /* Chip */
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        filledPrimary: {
          backgroundColor: color.navy,
          color: color.textOnDark,
        },
        filledSecondary: {
          backgroundColor: color.amberLight,
          color: color.navy,
        },
      },
    },

    /* Tooltip */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: color.navy,
          color: color.textOnDark,
          borderRadius: radius.sm,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        arrow: { color: color.navy },
      },
    },

    /* Accordion */
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: `${radius.sm}px !important`,
          boxShadow: 'none',
          marginBottom: 8,
          '&::before': { display: 'none' },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 20px',
          minHeight: 52,
          borderRadius: radius.sm,
          '&:hover': { backgroundColor: color.bg },
          '&.Mui-expanded': {
            borderBottom: `1px solid ${color.border}`,
          },
        },
        expandIconWrapper: { color: color.navyMid },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          backgroundColor: color.bg,
          borderRadius: `0 0 ${radius.sm}px ${radius.sm}px`,
        },
      },
    },

    /* AppBar */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: color.surface,
          color: color.textPrimary,
          boxShadow: shadow.xs,
          borderBottom: `1px solid ${color.border}`,
        },
      },
    },

    /* Tabs */
    MuiTabs: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: color.bg,
        },
        indicator: {
          borderRadius: 4,
          height: 3,
          backgroundColor: color.navyMid,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: radius.sm,
          '&:hover': { backgroundColor: `${color.navyMid}12` },  /* navyMid @ 7% */
          '&.Mui-selected': { color: color.navyMid, fontWeight: 600 },
        },
      },
    },

    /* Switch */
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: color.navyMid,
            '& + .MuiSwitch-track': { backgroundColor: color.navyMid },
          },
        },
      },
    },

    /* Snackbar / Alert */
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          fontWeight: 500,
        },
      },
    },

    /* LinearProgress */
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 99,
          backgroundColor: color.borderSubtle,
        },
        bar: { borderRadius: 99 },
      },
    },
  },
});

export default theme;
