'use client';

import { ThemeProvider } from '@mui/material';
import theme from '@/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import WithPrivate from '@/features/auth/components/withPrivate';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <WithPrivate>
              {children}
            </WithPrivate>
          </LocalizationProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
