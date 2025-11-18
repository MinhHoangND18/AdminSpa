'use client';

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { viVN } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      success: {
        main: '#2e7d32',
      },
      info: {
        main: '#0288d1',
      },
      warning: {
        main: '#f57c00',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  viVN
);

export default function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}