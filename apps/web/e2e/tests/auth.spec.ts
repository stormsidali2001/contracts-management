import { test, expect } from '../fixtures';

test.describe('Authentication', () => {
  test('sign-in page loads', async ({ page }) => {
    // Arrange
    await page.goto('/signin');

    // Assert
    await expect(
      page.getByRole('heading', { name: 'Connexion' }),
    ).toBeVisible();
    await expect(page.getByLabel('Identifiant')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Se connecter' }),
    ).toBeVisible();
  });

  test('submit button is disabled when fields are empty', async ({ page }) => {
    // Arrange
    await page.goto('/signin');

    // Assert
    await expect(
      page.getByRole('button', { name: 'Se connecter' }),
    ).toBeDisabled();
  });

  test('can log in and reach the dashboard', async ({ page, testMode }) => {
    // Arrange
    await page.goto('/signin');
    if (testMode === 'mock') {
      await page.evaluate(() =>
        localStorage.setItem('onboarding_done_mock-admin-id', 'true'),
      );
    }

    // Act
    await page.getByLabel('Identifiant').fill('admin.admin');
    await page.getByLabel('Mot de passe').fill('123456');
    const navPromise = page.waitForURL('**/dashboard', { timeout: 30_000 });
    await page
      .getByRole('button', { name: 'Se connecter' })
      .click({ timeout: 10_000 })
      .catch(() => {});
    await navPromise;
    await page.waitForLoadState('domcontentloaded');

    const skipBtn = page.getByRole('button', { name: 'Passer' });
    if (await skipBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await skipBtn.click();
    }

    // Assert
    await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 20_000 });
  });

  test('unauthenticated access to protected route redirects to sign-in', async ({
    page,
    testMode,
  }) => {
    // Arrange
    await page.goto('/signin');
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());

    // Act + Assert
    if (testMode !== 'mock') {
      await page.goto('/vendors');
      await page.waitForURL('**/signin', { timeout: 10_000 });
      await expect(
        page.getByRole('heading', { name: 'Connexion' }),
      ).toBeVisible();
    } else {
      await page.goto('/dashboard');
      await expect(page.locator('#sidebar-nav')).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test('can log out and is redirected to sign-in', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.locator('#topbar').getByRole('button').last().click();
    await expect(page.getByText('Deconnexion')).toBeVisible();
    await page.getByText('Deconnexion').click();

    // Assert
    await page.waitForURL('**/signin', { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { name: 'Connexion' }),
    ).toBeVisible();
  });

  test('forgot-password page is accessible', async ({ page }) => {
    // Act
    await page.goto('/forgot-password');

    // Assert
    await expect(page).toHaveURL(/forgot-password/);
  });
});
