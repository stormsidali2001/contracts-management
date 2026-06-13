import { test, expect } from '../fixtures';

test.describe('Directions', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator('#sidebar-link-directions').click();
    await expect(page.locator('#directions-page')).toBeVisible({ timeout: 10_000 });
  });

  test('directions page loads with header', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#directions-page-header')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Créer une direction' })).toBeVisible();
  });

  test('existing directions are displayed', async ({ authenticatedPage: page }) => {
    // Check for direction full titles (badges show computed 2-letter icons, not stored abbreviations)
    await expect(
      page.getByText('Direction des Ressources Humaines')
        .or(page.getByText('Direction Financière'))
        .or(page.getByText('Direction Générale')).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('can create a new direction', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: 'Créer une direction' }).click();

    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill('Direction Test E2E');
    await page.getByLabel('Mnémonique').fill('DTE');

    // Submit button (labeled "Créer" or "Valider" or similar)
    await page.getByRole('button', { name: /créer|valider|enregistrer|ajouter/i }).last().click();

    await expect((page.getByText('DTE').or(page.getByText('Direction Test E2E'))).first()).toBeVisible({ timeout: 8_000 });
  });

  test('can expand a direction accordion to see departments', async ({ authenticatedPage: page }) => {
    // Find a direction card/accordion — try expanding the first one
    const directionItems = page.locator('[class*="accordion"], [class*="direction"]').first();
    if (await directionItems.count() > 0) {
      await directionItems.click();
    } else {
      // Try clicking on a direction abbreviation element
      await page.getByText('DRH').click();
    }
    // After expanding, the "Créer un département" button should appear
    await expect(page.getByRole('button', { name: 'Créer un département' }).first()).toBeVisible({ timeout: 5_000 });
  });

  test('can create a department within an existing direction', async ({ authenticatedPage: page }) => {
    // Expand the first direction
    const createDeptBtn = page.getByRole('button', { name: 'Créer un département' }).first();

    // Try to find the button — it may require expanding first
    if (await createDeptBtn.isVisible()) {
      await createDeptBtn.click();
    } else {
      // Expand a direction first
      await page.getByText('DRH').click();
      await expect(createDeptBtn).toBeVisible({ timeout: 5_000 });
      await createDeptBtn.click();
    }

    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill('Dept Test E2E');
    await page.getByLabel('Mnémonique').fill('DTE');
    await page.getByRole('button', { name: /créer|valider|enregistrer|ajouter/i }).last().click();

    await expect((page.getByText('DTE').or(page.getByText('Dept Test E2E'))).first()).toBeVisible({ timeout: 8_000 });
  });
});
