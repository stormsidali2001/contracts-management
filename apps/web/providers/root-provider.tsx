'use client';

import { useState, useEffect } from 'react';
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

const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(!isMock);

  useEffect(() => {
    console.log(`[App] Mode: ${isMock ? 'mock' : 'production'}`);

    if (!isMock) {
      console.log('[App] Data: live (backend)');
      return;
    }

    import('@/mocks').then(({ initMocks }) =>
      initMocks().then(() => {
        console.log('[App] Data: seeded (MSW fixtures active)');
        setReady(true);
      }),
    );
  }, []);

  if (!ready) return null;

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
