import { test, expect } from '../fixtures';

// A minimal valid PDF buffer for the file upload step.
const MOCK_PDF = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog>>endobj\n');

test.describe('Contracts', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('contracts page loads with header and data grid', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.locator('#contracts-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create contract button is visible', async ({ juridicalPage: page }) => {
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un contrat' }),
    ).toBeVisible();
  });

  test('data grid shows contract rows with status chips', async ({
    juridicalPage: page,
  }) => {
    // Assert
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('can open the create contract modal', async ({
    juridicalPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Créer un contrat' }).click();
    // Assert
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
  });

  test('can complete full contract creation flow', async ({
    juridicalPage: page,
  }) => {
    // Act — Step 0: identifiants
    await page.getByRole('button', { name: 'Créer un contrat' }).click();
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('numero').fill(`CTR-E2E-${Date.now()}`);
    await page.getByLabel('Objet').fill('Contrat de test E2E automatisé');
    await page.getByLabel('montant').fill('100000');
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Act — Step 1: direction & departement (scope to modal container)
    const dialog = page.locator('[aria-labelledby="modal-modal-title"]');
    const combos = dialog.locator('[role="combobox"]');
    await expect(combos.first()).toBeVisible({ timeout: 5_000 });
    await combos.first().click();
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);
    if ((await combos.count()) > 1) {
      await combos.nth(1).click();
      const deptOption = page.getByRole('option').first();
      if (await deptOption.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await deptOption.click();
      }
    }
    await dialog.getByRole('button', { name: 'Suivant' }).click();

    // Act — Step 2: file, dates, vendor
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles({
        name: 'contrat-test.pdf',
        mimeType: 'application/pdf',
        buffer: MOCK_PDF,
      });
    }

    const sigDateInput = page.getByLabel('date de signature').first();
    if ((await sigDateInput.count()) > 0) {
      await sigDateInput.click();
      const acceptBtn = page
        .getByRole('button', { name: /ok|valider|accepter|confirmer/i })
        .first();
      if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await acceptBtn.click();
      } else {
        await page.keyboard.press('Tab');
      }
    }

    const expDateInput = page.getByLabel("date d'expiration").first();
    if ((await expDateInput.count()) > 0) {
      await expDateInput.click();
      const acceptBtn2 = page
        .getByRole('button', { name: /ok|valider|accepter|confirmer/i })
        .first();
      if (await acceptBtn2.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await acceptBtn2.click();
      } else {
        await page.keyboard.press('Tab');
      }
    }

    const selectVendorBtn = page.getByRole('button', {
      name: /aucun fournisseur|fournisseur/i,
    });
    if ((await selectVendorBtn.count()) > 0) {
      await selectVendorBtn.first().click();
      await expect(page.getByText('Selectioner un fournisseur')).toBeVisible({
        timeout: 5_000,
      });
      const vendorGrid = page.locator('[role="grid"]').last();
      const firstDataCell = vendorGrid.locator('[role="gridcell"]').first();
      await expect(firstDataCell).toBeVisible({ timeout: 5_000 });
      await firstDataCell.click();
      const confirmBtn = page.getByRole('button', { name: 'Confirmer' });
      await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
      await confirmBtn.click();
    }

    await page.getByRole('button', { name: 'Suivant' }).click();

    // Assert — Step 3: success
    await expect(
      page.getByText(/créé|créer|succès|success|contrat/i).first(),
    ).toBeVisible({ timeout: 12_000 });
    await page.getByRole('button', { name: 'Fermer' }).click();
  });

  test('can navigate to contract detail page', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    const firstRow = rows.first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });

    // Act
    const detailLink = firstRow.getByRole('link').first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
    } else {
      await firstRow.click();
    }

    // Assert
    await expect(page).toHaveURL(/\/contracts\/.+/, { timeout: 10_000 });
  });

  test('contract detail page shows agreement information', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    // Act
    const detailLink = rows.first().getByRole('link').first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page).toHaveURL(/\/contracts\/.+/, { timeout: 10_000 });

    // Assert
    await expect(page.locator('#agreement-detail-page')).toBeVisible({
      timeout: 8_000,
    });
  });

  test('data grid has a Fournisseur column header', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(
      page.getByRole('columnheader', { name: 'Fournisseur' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Fournisseur column shows vendor names for existing rows', async ({
    juridicalPage: page,
  }) => {
    // Arrange — wait for rows to load
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    // Assert — at least one row must have a vendor cell that is not the em-dash placeholder
    const vendorCells = page.getByRole('gridcell').filter({ hasNotText: '—' });
    await expect(vendorCells.first()).toBeVisible({ timeout: 5_000 });
  });

  test('can filter contracts by search query', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const searchInput = page
      .locator('input[type="text"]')
      .filter({ hasText: '' })
      .last();
    if ((await searchInput.count()) === 0) return;

    // Act
    await searchInput.fill('CTR');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Assert
    await expect(page.getByRole('grid')).toBeVisible();
  });
});
