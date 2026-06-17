import { test, expect } from '../fixtures';

test.describe('Dashboard', () => {
  test('loads with sidebar and topbar', async ({ authenticatedPage: page }) => {
    // Assert
    await expect(page.locator('#sidebar-nav')).toBeVisible();
    await expect(page.locator('#topbar')).toBeVisible();
  });

  test('sidebar contains all navigation links', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#sidebar-link-dashboard')).toBeVisible();
    await expect(page.locator('#sidebar-link-convensions')).toBeVisible();
    await expect(page.locator('#sidebar-link-contracts')).toBeVisible();
  });

  test('admin user sees Directions, Utilisateurs, Fournisseurs links', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#sidebar-link-directions')).toBeVisible();
    await expect(page.locator('#sidebar-link-users')).toBeVisible();
    await expect(page.locator('#sidebar-link-vendors')).toBeVisible();
  });

  test('topbar shows notifications button', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#topbar-notifications')).toBeVisible();
  });

  test('dashboard shows statistics content', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#sidebar-nav')).toBeVisible();
    await expect(page.getByText('Tableau de board')).toBeVisible();
  });

  test('can navigate to dashboard via sidebar Accueil link', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — navigate away first
    await page.locator('#sidebar-link-vendors').click();
    await expect(page).toHaveURL(/\/vendors/);

    // Act
    await page.locator('#sidebar-link-dashboard').click();

    // Assert
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
