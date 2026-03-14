import { createTheme, ThemeOptions, PaletteMode } from '@mui/material';
import { amber, deepOrange, grey, blue, purple, green } from '@mui/material/colors';

// Define your brand colors
const brandColors = {
  primary: '#17498E',
  secondary: '#FFB359',
  accent: '#992CFF',
  success: '#59FF91',
  error: '#FF5C5C',
};

// Common theme options that apply to both modes
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: brandColors.primary,
            light: '#4a6bb8',
            dark: '#0d2f5f',
            contrastText: '#ffffff',
          },
          secondary: {
            main: brandColors.secondary,
            light: '#ffcc7a',
            dark: '#cc8f46',
            contrastText: '#000000',
          },
          error: {
            main: brandColors.error,
            light: '#ff8a8a',
            dark: '#cc4a4a',
            contrastText: '#ffffff',
          },
          warning: {
            main: amber[500],
            light: amber[300],
            dark: amber[700],
            contrastText: '#000000',
          },
          info: {
            main: blue[500],
            light: blue[300],
            dark: blue[700],
            contrastText: '#ffffff',
          },
          success: {
            main: brandColors.success,
            light: '#7eff9f',
            dark: '#46cc73',
            contrastText: '#000000',
          },
          background: {
            default: '#fafbfc',
            paper: '#ffffff',
          },
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            disabled: '#94a3b8',
          },
          divider: 'rgba(23, 73, 142, 0.12)',
          action: {
            active: brandColors.primary,
            hover: 'rgba(23, 73, 142, 0.04)',
            selected: 'rgba(23, 73, 142, 0.08)',
            disabled: 'rgba(23, 73, 142, 0.26)',
            disabledBackground: 'rgba(23, 73, 142, 0.12)',
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: '#4a6bb8', // Lighter shade for better contrast on dark
            light: '#7a8cc8',
            dark: brandColors.primary,
            contrastText: '#ffffff',
          },
          secondary: {
            main: brandColors.secondary,
            light: '#ffcc7a',
            dark: '#cc8f46',
            contrastText: '#000000',
          },
          error: {
            main: '#ff7a7a',
            light: '#ff9999',
            dark: brandColors.error,
            contrastText: '#ffffff',
          },
          warning: {
            main: amber[400],
            light: amber[200],
            dark: amber[600],
            contrastText: '#000000',
          },
          info: {
            main: blue[400],
            light: blue[200],
            dark: blue[600],
            contrastText: '#ffffff',
          },
          success: {
            main: '#7eff9f',
            light: '#9fffb5',
            dark: brandColors.success,
            contrastText: '#000000',
          },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            disabled: '#64748b',
          },
          divider: 'rgba(148, 163, 184, 0.12)',
          action: {
            active: '#4a6bb8',
            hover: 'rgba(74, 107, 184, 0.08)',
            selected: 'rgba(74, 107, 184, 0.12)',
            disabled: 'rgba(148, 163, 184, 0.26)',
            disabledBackground: 'rgba(148, 163, 184, 0.12)',
          },
        }),
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
    '0px 25px 50px rgba(0, 0, 0, 0.15)',
  ],
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(23, 73, 142, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(23, 73, 142, 0.2)',
          },
        },
      },
    },
    
    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(148, 163, 184, 0.12)'}`,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(23, 73, 142, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(23, 73, 142, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 8px 24px rgba(23, 73, 142, 0.12)',
        },
      },
    },
    
    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(148, 163, 184, 0.12)'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: mode === 'light' ? 'rgba(23, 73, 142, 0.12)' : 'rgba(148, 163, 184, 0.2)',
          },
        },
      },
    },
    
    // TextField customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? 'rgba(23, 73, 142, 0.3)' : 'rgba(74, 107, 184, 0.3)',
            },
          },
        },
      },
    },
    
    // StepIcon customizations (your original)
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: brandColors.primary,
          },
          '&.Mui-completed': {
            color: brandColors.success,
          },
          '& .MuiStepIcon-text': {
            fill: '#ffffff',
            fontWeight: 600,
          },
        },
      },
    },
    
    // Tab customizations
    MuiTabs: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: mode === 'light' ? 'rgba(23, 73, 142, 0.04)' : 'rgba(74, 107, 184, 0.08)',
        },
        indicator: {
          borderRadius: 8,
          height: 3,
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          margin: '0 4px',
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(74, 107, 184, 0.12)',
          },
        },
      },
    },
    
    // Dialog customizations
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: `1px solid ${mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(148, 163, 184, 0.12)'}`,
        },
      },
    },
    
    // Chip customizations
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: mode === 'light' ? brandColors.primary : '#4a6bb8',
            color: '#ffffff',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: brandColors.secondary,
            color: '#000000',
          },
        },
      },
    },
    
    // Tooltip customizations
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: mode === 'light' ? '#1e293b' : '#f1f5f9',
          color: mode === 'light' ? '#ffffff' : '#000000',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
    
    // AppBar customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          color: mode === 'light' ? '#1e293b' : '#f1f5f9',
          boxShadow: `0px 1px 3px ${mode === 'light' ? 'rgba(23, 73, 142, 0.1)' : 'rgba(0, 0, 0, 0.2)'}`,
          borderBottom: `1px solid ${mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(148, 163, 184, 0.12)'}`,
        },
      },
    },
    
    // Switch customizations
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: brandColors.primary,
            '& + .MuiSwitch-track': {
              backgroundColor: brandColors.primary,
            },
          },
        },
      },
    },
    
    // Drawer customizations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 16px 16px 0',
          border: `1px solid ${mode === 'light' ? 'rgba(23, 73, 142, 0.08)' : 'rgba(148, 163, 184, 0.12)'}`,
        },
      },
    },
  },
});

// Create themes
export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));

// Default export (light theme for backward compatibility)
export const theme = lightTheme;

// Helper function to get theme based on mode
export const getTheme = (mode: PaletteMode) => 
  mode === 'dark' ? darkTheme : lightTheme;