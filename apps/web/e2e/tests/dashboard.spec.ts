import { test, expect } from '../fixtures';

test.describe('Dashboard', () => {
  test('loads with sidebar and topbar', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#sidebar-nav')).toBeVisible();
    await expect(page.locator('#topbar')).toBeVisible();
  });

  test('sidebar contains all navigation links', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#sidebar-link-dashboard')).toBeVisible();
    await expect(page.locator('#sidebar-link-convensions')).toBeVisible();
    await expect(page.locator('#sidebar-link-contracts')).toBeVisible();
  });

  test('admin user sees Directions, Utilisateurs, Fournisseurs links', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#sidebar-link-directions')).toBeVisible();
    await expect(page.locator('#sidebar-link-users')).toBeVisible();
    await expect(page.locator('#sidebar-link-vendors')).toBeVisible();
  });

  test('topbar shows notifications button', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#topbar-notifications')).toBeVisible();
  });

  test('dashboard shows statistics content', async ({ authenticatedPage: page }) => {
    // The dashboard page should have visible content after auth resolves
    await expect(page.locator('#sidebar-nav')).toBeVisible();
    // Page should not be a blank/error state
    await expect(page.getByText('Tableau de board')).toBeVisible();
  });

  test('can navigate to dashboard via sidebar Accueil link', async ({ authenticatedPage: page }) => {
    // Navigate away first
    await page.locator('#sidebar-link-vendors').click();
    await expect(page).toHaveURL(/\/vendors/);

    // Navigate back via Accueil
    await page.locator('#sidebar-link-dashboard').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
