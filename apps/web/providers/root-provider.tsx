'use client';

import { ThemeProvider } from '@mui/material';
import { theme } from '@/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import WithPrivate from '@/features/auth/components/withPrivate';
import WithSnackbar from '@/global/withSnackbar';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { OnbordaProvider, Onborda } from 'onborda';
import OnboardingCard from '@/features/onboarding/components/OnboardingCard/OnboardingCard';
import OnboardingTrigger from '@/features/onboarding/components/OnboardingTrigger/OnboardingTrigger';
import { allTours } from '@/features/onboarding/data/tours';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <OnbordaProvider>
              <Onborda
                steps={allTours}
                shadowRgb="15,23,42"
                shadowOpacity="0.35"
                cardComponent={OnboardingCard}
              >
                <WithSnackbar>
                  <WithPrivate>
                    <OnboardingTrigger />
                    {children}
                  </WithPrivate>
                </WithSnackbar>
              </Onborda>
            </OnbordaProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
