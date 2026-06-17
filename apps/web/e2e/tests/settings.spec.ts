import { test, expect } from '../fixtures';

test.describe('Settings', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Arrange
    await page.goto('/settings');
    await expect(page.locator('#settings-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('settings page loads with correct title', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#settings-page-header')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Paramètres' }),
    ).toBeVisible();
  });

  test('profile strip shows authenticated user info', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    // Arrange
    const expectedName = testMode === 'mock' ? 'Admin System' : 'admin admin';
    // Assert
    await expect(page.getByText(expectedName)).toBeVisible({ timeout: 5_000 });
  });

  test('notifications preference toggle is visible', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.getByText('Notifications par email')).toBeVisible();
    expect(
      await page.locator('input[type="checkbox"]').count(),
    ).toBeGreaterThan(0);
  });

  test('can toggle email notifications preference', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    const toggle = page.locator('input[type="checkbox"]').first();
    const initialState = await toggle.isChecked();
    const toggleLabel = page
      .locator('label')
      .filter({ has: page.locator('input[type="checkbox"]') })
      .first();

    // Act
    await toggleLabel.click();
    await page.waitForTimeout(1_500);

    // Assert
    const newState = await toggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('change password section is visible and opens modal', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.getByText('Mot de passe').first()).toBeVisible();

    // Act
    await page.getByRole('button', { name: 'Changer' }).click();

    // Assert
    await expect(page.getByText('Changer le mot de passe').first()).toBeVisible(
      { timeout: 5_000 },
    );
  });

  test('can navigate to settings via sidebar', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act
    await page.locator('#topbar').getByRole('button').last().click();
    await page.getByText('Parametres').click();

    // Assert
    await expect(page).toHaveURL(/\/settings/, { timeout: 10_000 });
  });
});
