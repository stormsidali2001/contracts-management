import { test, expect } from '../fixtures';

test.describe('Vendor Detail', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Navigate to the first vendor's detail page
    await page.locator('#sidebar-link-vendors').click();
    await expect(page.locator('#vendors-page')).toBeVisible({
      timeout: 10_000,
    });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const navLink = rows.first().getByRole('link').first();
    if ((await navLink.count()) > 0) {
      await navLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page.locator('#vendor-detail-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('vendor detail page shows vendor info card', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.locator('#vendor-detail-card')).toBeVisible();
  });

  test('vendor detail page shows contracts and conventions stat cards', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.getByText('Contrats').first()).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText('Conventions').first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('JURIDICAL sees Modifier button on vendor detail', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock returns full permissions for all users',
    );

    // Assert
    await expect(page.getByRole('button', { name: 'Modifier' })).toBeVisible({
      timeout: 5_000,
    });
  });

  test('can edit vendor address via Modifier button', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const modifyBtn = page.getByRole('button', { name: 'Modifier' });
    await expect(modifyBtn).toBeVisible({ timeout: 5_000 });

    // Act
    await modifyBtn.click();
    const addressInput = page.locator('input[type="text"]').last();
    await expect(addressInput).toBeVisible({ timeout: 3_000 });
    const currentValue = await addressInput.inputValue();
    await addressInput.fill(currentValue || 'Adresse de test E2E');
    await page.getByRole('button', { name: 'Sauvegarder' }).click();

    // Assert
    await expect(
      page.getByText(/mis à jour|succès|success/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('"Voir les contrats" button opens the associated contracts list', async ({
    juridicalPage: page,
  }) => {
    // Arrange — the first vendor in mock (TechSoft Algérie) has contractCount=3
    const viewContractsBtn = page.getByRole('button', {
      name: 'Voir les contrats',
    });
    await expect(viewContractsBtn).toBeVisible({ timeout: 5_000 });

    // Act
    await viewContractsBtn.click();

    // Assert — AgreementList modal opens and renders a DataGrid
    const agreementGrid = page.getByRole('grid').last();
    await expect(agreementGrid).toBeVisible({ timeout: 8_000 });
  });

  test('"Voir les conventions" button opens the associated conventions list', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const viewConventionsBtn = page.getByRole('button', {
      name: 'Voir les conventions',
    });
    await expect(viewConventionsBtn).toBeVisible({ timeout: 5_000 });
    // Skip if the vendor has no conventions
    if (
      await viewConventionsBtn.isDisabled({ timeout: 2_000 }).catch(() => false)
    ) {
      test.skip(true, 'Vendor has no associated conventions');
      return;
    }

    // Act
    await viewConventionsBtn.click();

    // Assert — AgreementList modal opens
    const agreementGrid = page.getByRole('grid').last();
    await expect(agreementGrid).toBeVisible({ timeout: 8_000 });
  });

  test('ADMIN does not see Modifier button on vendor detail', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock returns full permissions for all users',
    );

    // Arrange — navigate to vendor detail as ADMIN
    await page.locator('#sidebar-link-vendors').click();
    await expect(page.locator('#vendors-page')).toBeVisible({
      timeout: 10_000,
    });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const navLink = rows.first().getByRole('link').first();
    if ((await navLink.count()) > 0) {
      await navLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page.locator('#vendor-detail-page')).toBeVisible({
      timeout: 10_000,
    });

    // Assert
    await expect(
      page.getByRole('button', { name: 'Modifier' }),
    ).not.toBeVisible();
  });
});

test.describe('Vendor Delete', () => {
  test('can delete a vendor via the grid delete button', async ({
    juridicalPage: page,
  }) => {
    // Arrange — create a unique vendor so deletion is idempotent across runs
    await page.locator('#sidebar-link-vendors').click();
    await expect(page.locator('#vendors-page')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Créer un fournisseur' }).click();
    await expect(page.getByText('Nouveau Fournisseur').first()).toBeVisible({
      timeout: 5_000,
    });

    const ts = String(Date.now()).slice(-8);
    await page.getByLabel('numero', { exact: true }).fill(`DEL${ts}`);
    const companyName = `Del${ts}`;
    await page.getByLabel('raison sociale').fill(companyName);
    await page
      .getByLabel("numero d'identification fiscale")
      .fill(`A${ts.slice(0, 7)}B`);
    await page.getByLabel('numero de registre de commerce').fill(`NRC${ts}`);
    await page.getByRole('button', { name: 'Suivant' }).click();
    await page.getByLabel('adresse').fill('Adresse Suppression Test');
    await page.getByLabel('fixe').fill('0231234567');
    await page.getByLabel('mobile').fill('0551234567');
    await page.getByRole('button', { name: 'Suivant' }).click();
    await expect(page.getByText('Fournisseur cree !')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Fermer' }).click();

    // Arrange — search for the newly created vendor
    const searchInput = page
      .getByPlaceholder(/recherche/i)
      .or(page.locator('[type="search"]'))
      .first();
    await searchInput.fill(companyName);
    await page.keyboard.press('Enter');
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });

    // Act — click the DeleteForever icon in the Supprimer column
    const deleteBtn = rows.first().locator('[data-testid="DeleteForeverIcon"]');
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();

    // Assert — success snackbar confirms deletion
    await expect(page.getByText(/supprimé|deleted/i).first()).toBeVisible({
      timeout: 8_000,
    });
  });
});
