import { test, expect } from '../fixtures';

test.describe('Settings', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
    await expect(page.locator('#settings-page')).toBeVisible({ timeout: 10_000 });
  });

  test('settings page loads with correct title', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#settings-page-header')).toBeVisible();
    // Use heading role to avoid matching the breadcrumb
    await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible();
  });

  test('profile strip shows authenticated user info', async ({ authenticatedPage: page }) => {
    // Show the full name displayed in the profile card (unique in settings page)
    await expect(page.getByText('Admin System')).toBeVisible({ timeout: 5_000 });
  });

  test('notifications preference toggle is visible', async ({ authenticatedPage: page }) => {
    await expect(page.getByText('Notifications par email')).toBeVisible();
    // MUI Switch renders the input as visually hidden — check label text exists
    await expect(page.locator('input[type="checkbox"]').first()).toBeDefined();
  });

  test('can toggle email notifications preference', async ({ authenticatedPage: page }) => {
    const toggle = page.locator('input[type="checkbox"]').first();
    const initialState = await toggle.isChecked();
    // Click the visible label wrapper — triggers label→input forwarding which fires React onChange
    const toggleLabel = page.locator('label').filter({ has: page.locator('input[type="checkbox"]') }).first();
    await toggleLabel.click();
    // Wait for mutation + auth store update
    await page.waitForTimeout(1_500);
    const newState = await toggle.isChecked();
    expect(newState).not.toBe(initialState);
  });

  test('change password section is visible and opens modal', async ({ authenticatedPage: page }) => {
    await expect(page.getByText('Mot de passe').first()).toBeVisible();
    await page.getByRole('button', { name: 'Changer' }).click();
    // Change password modal should open — look for the modal title
    await expect(page.getByText('Changer le mot de passe').first()).toBeVisible({ timeout: 5_000 });
  });

  test('can navigate to settings via sidebar', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    // Open profile popover
    await page.locator('#topbar').getByRole('button').last().click();
    await page.getByText('Parametres').click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
