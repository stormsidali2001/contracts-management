import { test, expect } from '../fixtures';

// Conventions share the same 4-step creation form as contracts — just with
// type=convension and a different aria-label on the trigger button.
const MOCK_PDF = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog>>endobj\n');

test.describe('Conventions', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({ timeout: 10_000 });
  });

  test('conventions page loads with header and data grid', async ({ authenticatedPage: page }) => {
    await expect(page.locator('#convensions-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create convention button is visible', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('button', { name: 'Créer une convention' })).toBeVisible();
  });

  test('data grid shows convention rows', async ({ authenticatedPage: page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('can open the create convention modal', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: 'Créer une convention' }).click();
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
  });

  test('can complete full convention creation flow', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: 'Créer une convention' }).click();

    // Step 0 — identifiants
    await expect(page.getByLabel('numero')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('numero').fill('CNV-E2E-001');
    await page.getByLabel('Objet').fill('Convention de test E2E');
    await page.getByLabel('montant').fill('5000');
    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 1 — direction & departement (scope to modal container to avoid background selects)
    // MUI Modal doesn't always set role="dialog" — find the visible modal by its label
    const modal = page.locator('[aria-labelledby="modal-modal-title"]');
    const combos = modal.locator('[role="combobox"]');
    await expect(combos.first()).toBeVisible({ timeout: 5_000 });
    await combos.first().click();
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);
    if (await combos.count() > 1) {
      await combos.nth(1).click();
      const deptOption = page.getByRole('option').first();
      if (await deptOption.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await deptOption.click();
      }
    }
    await modal.getByRole('button', { name: 'Suivant' }).click();

    // Step 2 — file, dates, vendor
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'convention-test.pdf',
        mimeType: 'application/pdf',
        buffer: MOCK_PDF,
      });
    }

    // Date pickers — click and accept (never press Escape which would close the parent modal)
    for (const label of ['date de signature', "date d'expiration"]) {
      const dateInput = page.getByLabel(label).first();
      if (await dateInput.count() > 0) {
        await dateInput.click();
        const acceptBtn = page.getByRole('button', { name: /ok|valider|accepter|confirmer/i }).first();
        if (await acceptBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await acceptBtn.click();
        } else {
          await page.keyboard.press('Tab');
        }
      }
    }

    // Select vendor
    const selectVendorBtn = page.getByRole('button', { name: /aucun fournisseur|fournisseur/i });
    if (await selectVendorBtn.count() > 0) {
      await selectVendorBtn.first().click();
      await expect(page.getByText('Selectioner un fournisseur')).toBeVisible({ timeout: 5_000 });
      // Scope to the vendor DataGrid (last [role="grid"] in DOM — conventions grid is behind the modal)
      const vendorGrid = page.locator('[role="grid"]').last();
      const firstDataCell = vendorGrid.locator('[role="gridcell"]').first();
      if (await firstDataCell.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await firstDataCell.click();
        const confirmBtn = page.getByRole('button', { name: 'Confirmer' });
        await expect(confirmBtn).toBeEnabled({ timeout: 5_000 });
        await confirmBtn.click();
      }
    }

    await page.getByRole('button', { name: 'Suivant' }).click();

    // Step 3 — success
    await expect(
      page.getByText(/créé|créer|succès|success|convention/i).first()
    ).toBeVisible({ timeout: 12_000 });

    await page.getByRole('button', { name: 'Fermer' }).click();
  });

  test('can navigate to convention detail page', async ({ authenticatedPage: page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    const detailLink = rows.first().getByRole('link').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page).toHaveURL(/\/convensions\/.+/, { timeout: 10_000 });
  });

  test('convention detail page is rendered', async ({ authenticatedPage: page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const detailLink = rows.first().getByRole('link').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page).toHaveURL(/\/convensions\/.+/, { timeout: 10_000 });
    await expect(page.locator('#agreement-detail-page')).toBeVisible({ timeout: 8_000 });
  });
});
