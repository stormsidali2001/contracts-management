'use client';

import { useEffect, useState } from 'react';
import { useOnborda } from 'onborda';
import { useAuthStore } from '@/features/auth/store/auth.store';
import WelcomeModal from '@/features/onboarding/components/WelcomeModal/WelcomeModal';

const ONBOARDING_KEY = (userId: string) => `onboarding_done_${userId}`;

const tourNameByRole: Record<string, string> = {
  ADMIN: 'admin-tour',
  JURIDICAL: 'juridical-tour',
  EMPLOYEE: 'employee-tour',
};

export default function OnboardingTrigger() {
  const { startOnborda } = useOnborda();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.sub || !user?.role) return;
    const key = ONBOARDING_KEY(user.sub);
    if (localStorage.getItem(key)) return;
    if (!tourNameByRole[user.role]) return;

    const timer = setTimeout(() => setShowWelcome(true), 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.sub, user?.role]);

  const handleStart = () => {
    setShowWelcome(false);
    const tourName = tourNameByRole[user!.role!];
    setTimeout(() => startOnborda(tourName), 100);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    if (user?.sub) localStorage.setItem(ONBOARDING_KEY(user.sub), 'true');
  };

  if (!showWelcome || !user?.role) return null;

  return (
    <WelcomeModal
      role={user.role}
      onStart={handleStart}
      onSkip={handleSkip}
    />
  );
}
