'use client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from '@/lib/hooks/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '@/lib/theme';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
           <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
