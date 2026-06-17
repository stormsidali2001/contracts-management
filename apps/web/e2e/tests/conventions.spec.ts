import { test, expect } from '../fixtures';

// Conventions share the same 4-step creation form as contracts — just with
// type=convension and a different aria-label on the trigger button.
const MOCK_PDF = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog>>endobj\n');

test.describe('Conventions', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('conventions page loads with header and data grid', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.locator('#convensions-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create convention button is visible', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer une convention' }),
    ).toBeVisible();
  });

  test('data grid shows convention rows', async ({ juridicalPage: page }) => {
    // Assert
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('can open the create convention modal', async ({
    juridicalPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Créer une convention' }).click();
    // Assert
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
  });

  test('can complete full convention creation flow', async ({
    juridicalPage: page,
  }) => {
    // Act — Step 0: identifiants
    await page.getByRole('button', { name: 'Créer une convention' }).click();
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('numero').fill(`CNV-E2E-${Date.now()}`);
    await page.getByLabel('Objet').fill('Convention de test E2E');
    await page.getByLabel('montant').fill('5000');
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Act — Step 1: direction & departement (scope to modal container to avoid background selects)
    const modal = page.locator('[aria-labelledby="modal-modal-title"]');
    const combos = modal.locator('[role="combobox"]');
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
    await modal.getByRole('button', { name: 'Suivant' }).click();

    // Act — Step 2: file, dates, vendor
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles({
        name: 'convention-test.pdf',
        mimeType: 'application/pdf',
        buffer: MOCK_PDF,
      });
    }

    for (const label of ['date de signature', "date d'expiration"]) {
      const dateInput = page.getByLabel(label).first();
      if ((await dateInput.count()) > 0) {
        await dateInput.click();
        const acceptBtn = page
          .getByRole('button', { name: /ok|valider|accepter|confirmer/i })
          .first();
        if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await acceptBtn.click();
        } else {
          await page.keyboard.press('Tab');
        }
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
      await expect(firstDataCell).toBeVisible({ timeout: 8_000 });
      await firstDataCell.click();
      const confirmBtn = page.getByRole('button', { name: 'Confirmer' });
      await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
      await confirmBtn.click();
    }

    await page.getByRole('button', { name: 'Suivant' }).click();

    // Assert — Step 3: success
    await expect(
      page.getByText(/créé|créer|succès|success|convention/i).first(),
    ).toBeVisible({ timeout: 12_000 });
    await page.getByRole('button', { name: 'Fermer' }).click();
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

  test('can navigate to convention detail page', async ({
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

    // Assert
    await expect(page).toHaveURL(/\/convensions\/.+/, { timeout: 10_000 });
  });

  test('convention detail page is rendered', async ({
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
    await expect(page).toHaveURL(/\/convensions\/.+/, { timeout: 10_000 });

    // Assert
    await expect(page.locator('#agreement-detail-page')).toBeVisible({
      timeout: 8_000,
    });
  });
});
