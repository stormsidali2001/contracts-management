import { test as base, expect, type Page } from '@playwright/test';

type TestMode = 'mock' | 'prod';

interface CustomFixtures {
  testMode: TestMode;
  /** A page authenticated as ADMIN and sitting on /dashboard. */
  authenticatedPage: Page;
  /**
   * A page authenticated as a user with full agreement + vendor creation rights.
   * In mock mode: same as authenticatedPage (MSW returns all permissions true).
   * In prod mode: logs in as juridical.adala who has canCreate=true for agreements and vendors.
   */
  juridicalPage: Page;
  /**
   * A page authenticated as an EMPLOYEE (read-only role).
   * In mock mode: same session as authenticatedPage (MSW always returns full permissions).
   * In prod mode: logs in as storm.sidali who has no create/edit/delete permissions.
   */
  employeePage: Page;
}

/**
 * Patches localStorage.getItem so any onboarding_done_* key returns 'true'.
 * This prevents OnboardingTrigger from ever scheduling its 500ms timer.
 * Must be called before page.goto so addInitScript fires first.
 */
async function suppressOnboardingModal(page: Page) {
  await page.addInitScript(function () {
    var origGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (typeof key === 'string' && key.startsWith('onboarding_done_'))
        return 'true';
      return origGetItem.call(this, key);
    };
  });
}

export const test = base.extend<CustomFixtures>({
  testMode: async ({}, use, testInfo) => {
    const mode = (testInfo.project.metadata?.testMode ?? 'prod') as TestMode;
    await use(mode);
  },

  authenticatedPage: async ({ page, testMode }, use) => {
    if (testMode === 'mock') {
      await page.goto('/signin');
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
      await page.goto('/dashboard');
    } else {
      // Patch localStorage before page load so OnboardingTrigger never schedules
      // its modal timer — the getItem patch runs before any page JS via addInitScript.
      await suppressOnboardingModal(page);
      await page.goto('/signin');
      await page.getByLabel('Identifiant').fill('admin.admin');
      await page.getByLabel('Mot de passe').fill('123456');
      const navPromise = page.waitForURL('**/dashboard', { timeout: 30_000 });
      await page
        .getByRole('button', { name: 'Se connecter' })
        .click()
        .catch(() => {});
      await navPromise;
      await page.waitForLoadState('domcontentloaded');
    }

    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15_000 });
    await use(page);
  },

  juridicalPage: async ({ page, testMode }, use) => {
    if (testMode === 'mock') {
      await page.goto('/signin');
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
      await page.goto('/dashboard');
    } else {
      await suppressOnboardingModal(page);
      await page.goto('/signin');
      await page.getByLabel('Identifiant').fill('juridical.adala');
      await page.getByLabel('Mot de passe').fill('123456');
      const navPromise = page.waitForURL('**/dashboard', { timeout: 30_000 });
      await page
        .getByRole('button', { name: 'Se connecter' })
        .click()
        .catch(() => {});
      await navPromise;
      await page.waitForLoadState('domcontentloaded');
    }

    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15_000 });
    await use(page);
  },

  employeePage: async ({ page, testMode }, use) => {
    if (testMode === 'mock') {
      // Mock always returns full permissions — employee session reuses admin mock user.
      await page.goto('/signin');
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
      await page.goto('/dashboard');
    } else {
      await suppressOnboardingModal(page);
      await page.goto('/signin');
      await page.getByLabel('Identifiant').fill('storm.sidali');
      await page.getByLabel('Mot de passe').fill('123456');
      const navPromise = page.waitForURL('**/dashboard', { timeout: 30_000 });
      await page
        .getByRole('button', { name: 'Se connecter' })
        .click()
        .catch(() => {});
      await navPromise;
      await page.waitForLoadState('domcontentloaded');
    }
    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15_000 });
    await use(page);
  },
});

export { expect };
