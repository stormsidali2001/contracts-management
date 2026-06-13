import { test, expect } from '../fixtures';

test.describe('Users', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
  });

  test('users page loads with header and data grid', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#users-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create user button is visible', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('button', { name: 'Créer un utilisateur' })).toBeVisible();
  });

  test('can create a user via 4-step modal (Admin role, skips direction step)', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: 'Créer un utilisateur' }).click();

    // Step 0 — Identifiants: Nom, Prénom, Email
    // Use exact: true because 'Nom' is a substring of 'Prénom'
    await expect(page.getByLabel('Nom', { exact: true })).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Prénom', { exact: true }).fill('Jean');
    await page.getByLabel('Email').fill(`e2e.user.${Date.now()}@test.dz`);
    await page.getByRole('button', { name: /suivant/i }).click();

    // Step 1 — Profil: select Admin role card (use desc text which is unique in the form)
    await expect(page.getByText('Accès complet')).toBeVisible({ timeout: 5_000 });
    await page.getByText('Accès complet').click();

    // Clicking Suivant on step 1 with ADMIN role triggers submit and goes to step 3
    await page.getByRole('button', { name: /suivant/i }).click();

    // Step 3 — Validation: success state
    await expect(page.getByText(/creé|créé|success/i)).toBeVisible({ timeout: 10_000 });

    // Close the modal
    await page.getByRole('button', { name: /fermer|terminer/i }).click();
  });

  test('data grid shows user rows', async ({ authenticatedPage: page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('can navigate to user profile page', async ({ authenticatedPage: page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 5_000 });
    // The grid has a chevron-right link column for navigation
    const navLink = rows.first().getByRole('link');
    if (await navLink.count() > 0) {
      await navLink.first().click();
    } else {
      await rows.first().getByRole('button').last().click();
    }
    await expect(page).toHaveURL(/\/users\/.+/, { timeout: 5_000 });
  });
});
