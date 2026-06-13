import { test, expect } from '../fixtures';

test.describe('Authentication', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('Identifiant')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('submit button is disabled when fields are empty', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });

  test('can log in and reach the dashboard', async ({ page, testMode }) => {
    await page.goto('/signin');

    // Pre-set onboarding key so WelcomeModal doesn't block in mock mode
    if (testMode === 'mock') {
      await page.evaluate(() => localStorage.setItem('onboarding_done_mock-admin-id', 'true'));
    }

    await page.getByLabel('Identifiant').fill('admin.admin');
    await page.getByLabel('Mot de passe').fill('123456');

    // Start waiting for navigation BEFORE the click to avoid missing the event
    const navPromise = page.waitForURL('**/dashboard', { timeout: 30_000 });
    // Click and tolerate element detachment caused by page navigation
    await page.getByRole('button', { name: 'Se connecter' }).click({ timeout: 10_000 }).catch(() => {});
    await navPromise;
    // Wait for page to be fully settled before querying the DOM
    await page.waitForLoadState('domcontentloaded');

    // Dismiss WelcomeModal if it appears (first login in fresh context)
    const skipBtn = page.getByRole('button', { name: 'Passer' });
    if (await skipBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await skipBtn.click();
    }

    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 20_000 });
  });

  test('unauthenticated access to protected route redirects to sign-in', async ({ page, testMode }) => {
    // Navigate first so the page origin is set, then clear session state
    await page.goto('/signin');
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());

    // In mock mode WithPrivate calls refresh() which MSW answers — auth succeeds.
    // In prod mode with no cookie, refresh() fails and the user is redirected.
    if (testMode !== 'mock') {
      await page.goto('/vendors');
      await page.waitForURL('**/signin', { timeout: 10_000 });
      await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    } else {
      // Mock mode always authenticates — just verify dashboard is reachable.
      await page.goto('/dashboard');
      await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('can log out and is redirected to sign-in', async ({ authenticatedPage: page }) => {
    // Open topbar profile popover
    await page.locator('#topbar').getByRole('button').last().click();
    await expect(page.getByText('Deconnexion')).toBeVisible();
    await page.getByText('Deconnexion').click();

    await page.waitForURL('**/signin', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('forgot-password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/forgot-password/);
  });
});
