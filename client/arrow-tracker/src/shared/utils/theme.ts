import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define color palette based on archery themes
// Using greens and earth tones that reflect outdoor archery environments
const palette = {
  primary: {
    main: '#2E7D32', // Forest green - representing archery fields
    light: '#60ad5e',
    dark: '#005005',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#795548', // Brown - representing wooden bows and traditional archery
    light: '#a98274',
    dark: '#4b2c20',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#f57c00',
    light: '#ffb74d',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#388e3c',
    light: '#4caf50',
    dark: '#2e7d32',
  },
  background: {
    default: '#f9f9f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#263238',
    secondary: '#546e7a',
    disabled: '#90a4ae',
  },
};

// Create a base theme
let theme = createTheme({
  palette,
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Avoid all caps in buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
        outlinedPrimary: {
          borderColor: palette.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.primary.main,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default theme;