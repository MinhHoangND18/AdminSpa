'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#9e2265' },
    secondary: { main: '#f50057' },
    background: { default: '#f9f9f9' },
  },
  shape: { borderRadius: 10 },
});

export default theme;
