import { test as base, expect, type Page } from '@playwright/test';

type TestMode = 'mock' | 'prod';

interface CustomFixtures {
  testMode: TestMode;
  /** A page that is already authenticated and sitting on /dashboard. */
  authenticatedPage: Page;
}

export const test = base.extend<CustomFixtures>({
  testMode: async ({}, use, testInfo) => {
    const mode = (testInfo.project.metadata?.testMode ?? 'prod') as TestMode;
    await use(mode);
  },

  authenticatedPage: async ({ page, testMode }, use) => {
    if (testMode === 'mock') {
      // Navigate to a public page first so localStorage is accessible, then
      // pre-set the onboarding flag so the WelcomeModal never blocks tests.
      await page.goto('/signin');
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
      await page.goto('/dashboard');
    } else {
      // Prod: storageState already has the refresh-token httpOnly cookie.
      await page.goto('/signin');
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
      await page.goto('/dashboard');
    }

    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15_000 });

    // Dismiss the welcome modal if it still appears (race condition safety net)
    const skipBtn = page.getByRole('button', { name: 'Passer' });
    if (await skipBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipBtn.click();
    }

    await use(page);
  },
});

export { expect };
