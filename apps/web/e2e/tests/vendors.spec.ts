import { test, expect } from '../fixtures';

test.describe('Vendors', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    await page.locator('#sidebar-link-vendors').click();
    await expect(page.locator('#vendors-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('vendors page loads with header and data grid', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.locator('#vendors-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create vendor button is visible', async ({ juridicalPage: page }) => {
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un fournisseur' }),
    ).toBeVisible();
  });

  test('can create a vendor via 3-step modal', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const ts = String(Date.now()).slice(-8);
    const companyName = `TC${ts}`;

    // Act — Step 0: Identifiants
    await page.getByRole('button', { name: 'Créer un fournisseur' }).click();
    await expect(page.getByText('Nouveau Fournisseur').first()).toBeVisible({
      timeout: 5_000,
    });
    await page.getByLabel('numero', { exact: true }).fill(`FE2E${ts}`);
    await page.getByLabel('raison sociale').fill(companyName);
    // NIF format: 1 char + 7 digits + 1 char (validateNif regex requires exactly 9 chars)
    await page
      .getByLabel("numero d'identification fiscale")
      .fill(`A${ts.slice(0, 7)}B`);
    await page.getByLabel('numero de registre de commerce').fill(`NRC${ts}`);
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Act — Step 1: Localisation
    await page.getByLabel('adresse').fill('15 Rue Test, Alger');
    await page.getByLabel('fixe').fill('0231234567');
    await page.getByLabel('mobile').fill('0551234567');
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Assert — Step 2: Success
    await expect(page.getByText('Fournisseur cree !')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Fermer' }).click();

    // Assert — vendor appears in search results (may not be on page 1 with 678+ entries)
    const searchInput = page
      .getByPlaceholder(/recherche/i)
      .or(page.locator('[type="search"]'))
      .first();
    await searchInput.fill(companyName);
    await page.keyboard.press('Enter');
    await expect(page.getByText(companyName)).toBeVisible({ timeout: 8_000 });
  });

  test('can search vendors by name', async ({
    juridicalPage: page,
    testMode,
  }) => {
    // Arrange
    const searchTerm = testMode === 'mock' ? 'TechSoft' : 'Fisher';
    const searchInput = page
      .getByPlaceholder(/recherche/i)
      .or(page.locator('[type="search"]'));

    if ((await searchInput.count()) === 0) {
      test.skip(true, 'Search input not found');
      return;
    }

    // Act
    await searchInput.first().fill(searchTerm);
    await page.keyboard.press('Enter');

    // Assert
    await expect(
      page.getByText(new RegExp(searchTerm, 'i')).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('can navigate to vendor detail page', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 5_000 });

    // Act
    const navLink = rows.first().getByRole('link');
    if ((await navLink.count()) > 0) {
      await navLink.first().click();
    } else {
      await rows.first().click();
    }

    // Assert
    await expect(page).toHaveURL(/\/vendors\/.+/, { timeout: 15_000 });
  });
});
