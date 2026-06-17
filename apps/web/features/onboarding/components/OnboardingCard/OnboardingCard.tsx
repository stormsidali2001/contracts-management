'use client';

import { CardComponentProps, useOnborda } from 'onborda';
import { Button, LinearProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './OnboardingCard.module.css';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { allTours } from '@/features/onboarding/data/tours';
import {
  useContracts,
  useConvensions,
} from '@/features/contract/queries/contract.queries';
import { useVendors } from '@/features/vendor/queries/vendor.queries';

const ONBOARDING_KEY = (userId: string) => `onboarding_done_${userId}`;

/** Routes that require a "first record" to exist and may be unresolvable. */
function isDataRoute(route: string): boolean {
  return (
    route === '/contracts/first' ||
    route === '/convensions/first' ||
    route === '/vendors/first'
  );
}

/** Poll rAF until `selector` exists in the DOM, then call `callback`. Gives up after `maxMs`. */
function waitForElement(selector: string, callback: () => void, maxMs = 4000) {
  const deadline = Date.now() + maxMs;
  const poll = () => {
    if (document.querySelector(selector)) {
      callback();
    } else if (Date.now() < deadline) {
      requestAnimationFrame(poll);
    }
  };
  requestAnimationFrame(poll);
}

export default function OnboardingCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda, setCurrentStep, currentTour } = useOnborda();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // Pre-fetch the first record of each type so we can navigate to their detail pages.
  const { data: contractsData } = useContracts({ page: 1, pageSize: 1 });
  const { data: convensionsData } = useConvensions({ page: 1, pageSize: 1 });
  const { data: vendorsData } = useVendors({ page: 1, pageSize: 1 });
  const firstContractId = contractsData?.data?.[0]?.id;
  const firstConvensionId = convensionsData?.data?.[0]?.id;
  const firstVendorId = vendorsData?.data?.[0]?.id;

  // Disable Onborda's built-in scrollIntoView while the card is mounted.
  // All target elements are already visible; the auto-scroll only causes jarring movement.
  useEffect(() => {
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () {};
    return () => {
      Element.prototype.scrollIntoView = original;
    };
  }, []);

  const markDone = () => {
    if (user?.sub) localStorage.setItem(ONBOARDING_KEY(user.sub), 'true');
    closeOnborda();
  };

  const getTourSteps = () =>
    allTours.find((t) => t.tour === currentTour)?.steps ?? [];

  /** Resolve special placeholder routes to real URLs at runtime. */
  const resolveRoute = (route: string) => {
    if (route === '/users/me' && user?.sub) return `/users/${user.sub}`;
    if (route === '/contracts/first' && firstContractId)
      return `/contracts/${firstContractId}`;
    if (route === '/convensions/first' && firstConvensionId)
      return `/convensions/${firstConvensionId}`;
    if (route === '/vendors/first' && firstVendorId)
      return `/vendors/${firstVendorId}`;
    return route;
  };

  // For cross-page steps: navigate first, then wait for the target element to appear.
  // Using rAF polling instead of a fixed timeout avoids race conditions with Next.js App Router.
  const handleNext = () => {
    if (step.nextRoute) {
      const resolved = resolveRoute(step.nextRoute);

      // Placeholder couldn't be resolved (no first record) — skip dependent steps.
      if (isDataRoute(step.nextRoute) && resolved === step.nextRoute) {
        const steps = getTourSteps();
        let skipTo = currentStep + 1;
        let exitRoute: string | undefined;

        // Walk forward until we find a step that exits via a concrete (non-data) route.
        while (skipTo < steps.length) {
          const s = steps[skipTo];
          if (s.nextRoute && !isDataRoute(s.nextRoute)) {
            exitRoute = s.nextRoute;
            skipTo++; // skip the exit step itself (it belongs to the missing-data page)
            break;
          }
          skipTo++;
        }

        if (skipTo >= steps.length) {
          markDone();
          return;
        }

        if (exitRoute) {
          const targetSelector = steps[skipTo]?.selector;
          router.push(exitRoute);
          if (targetSelector)
            waitForElement(targetSelector, () => setCurrentStep(skipTo));
          else setTimeout(() => setCurrentStep(skipTo), 600);
        } else {
          setCurrentStep(skipTo);
        }
        return;
      }

      const targetSelector = getTourSteps()[currentStep + 1]?.selector;
      router.push(resolved);
      if (targetSelector) {
        waitForElement(targetSelector, () => setCurrentStep(currentStep + 1));
      } else {
        setTimeout(() => setCurrentStep(currentStep + 1), 600);
      }
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (step.prevRoute) {
      const steps = getTourSteps();
      let landOn = currentStep - 1;

      // Skip backward over steps that depend on an unresolved data route.
      while (landOn > 0) {
        // A step is "dependent" if the nearest preceding step-with-a-nextRoute points to an
        // unresolved placeholder — meaning the data it navigated to didn't exist.
        let dependent = false;
        for (let i = landOn - 1; i >= 0; i--) {
          if (steps[i].nextRoute) {
            const r = steps[i].nextRoute!;
            dependent = isDataRoute(r) && resolveRoute(r) === r;
            break;
          }
        }
        if (!dependent) break;
        landOn--;
      }

      const targetSelector = steps[landOn]?.selector;
      router.push(resolveRoute(step.prevRoute));
      if (targetSelector) {
        waitForElement(targetSelector, () => setCurrentStep(landOn));
      } else {
        setTimeout(() => setCurrentStep(landOn), 600);
      }
    } else {
      prevStep();
    }
  };

  const isLast = currentStep === totalSteps - 1;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className={styles.card}>
      {arrow}

      {/* Skip button — top-right corner */}
      <button
        className={styles.btnClose}
        onClick={markDone}
        aria-label="Ignorer le tutoriel"
      >
        ✕
      </button>

      <div className={styles.header}>
        {step.icon && <span className={styles.icon}>{step.icon}</span>}
        <span className={styles.title}>{step.title}</span>
      </div>

      <p className={styles.content}>{step.content}</p>

      <LinearProgress
        className={styles.progressBar}
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          borderRadius: 99,
          backgroundColor: 'var(--border-subtle)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'var(--navy-mid)',
            borderRadius: 99,
          },
        }}
      />

      <div className={styles.footer}>
        <span className={styles.stepCounter}>
          {currentStep + 1} / {totalSteps}
        </span>

        <div className={styles.actions}>
          {currentStep > 0 && (
            <Button className={styles.btnPrev} onClick={handlePrev}>
              ← Précédent
            </Button>
          )}

          {isLast ? (
            <Button className={styles.btnNext} onClick={markDone}>
              Terminer ✓
            </Button>
          ) : (
            <Button className={styles.btnNext} onClick={handleNext}>
              Suivant →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
