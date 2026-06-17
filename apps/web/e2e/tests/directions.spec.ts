import { test, expect } from '../fixtures';

test.describe('Directions', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator('#sidebar-link-directions').click();
    await expect(page.locator('#directions-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('directions page loads with header', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#directions-page-header')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Créer une direction' }),
    ).toBeVisible();
  });

  test('existing directions are displayed', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    // Assert
    if (testMode === 'mock') {
      await expect(
        page
          .getByText('Direction des Ressources Humaines')
          .or(page.getByText('Direction Financière'))
          .or(page.getByText('Direction Générale'))
          .first(),
      ).toBeVisible({ timeout: 5_000 });
    } else {
      await expect(
        page
          .locator(
            '[class*="accordion"], [class*="direction-card"], [class*="directionCard"]',
          )
          .first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('can create a new direction', async ({ authenticatedPage: page }) => {
    // Arrange
    const ts = String(Date.now()).slice(-6);
    const dirTitle = `DirE2E${ts}`;
    const dirAbbr = `DE${ts.slice(-3)}`;

    // Act
    await page.getByRole('button', { name: 'Créer une direction' }).click();
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill(dirTitle);
    await page.getByLabel('Mnémonique').fill(dirAbbr);
    await page
      .getByRole('button', { name: /créer|valider|enregistrer|ajouter/i })
      .last()
      .click();

    // Assert
    await expect(
      page.getByText(dirAbbr).or(page.getByText(dirTitle)).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('can expand a direction accordion to see departments', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    const directionItems = page
      .locator('[class*="accordion"], [class*="direction"]')
      .first();
    await expect(directionItems).toBeVisible({ timeout: 5_000 });

    // Act
    await directionItems.click();

    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un département' }).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('can create a department within an existing direction', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    const ts = String(Date.now()).slice(-6);
    const deptTitle = `DeptE2E${ts}`;
    const deptAbbr = `DP${ts.slice(-3)}`;
    const createDeptBtn = page
      .getByRole('button', { name: 'Créer un département' })
      .first();
    if (!(await createDeptBtn.isVisible())) {
      await page
        .locator('[class*="accordion"], [class*="direction"]')
        .first()
        .click();
      await expect(createDeptBtn).toBeVisible({ timeout: 5_000 });
    }

    // Act
    await createDeptBtn.click();
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill(deptTitle);
    await page.getByLabel('Mnémonique').fill(deptAbbr);
    await page
      .getByRole('button', { name: /créer|valider|enregistrer|ajouter/i })
      .last()
      .click();

    // Assert
    await expect(
      page.getByText(deptAbbr).or(page.getByText(deptTitle)).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('can view department users list via Détails button', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — expand first direction accordion to reveal its departments table
    const firstDirection = page
      .locator('[class*="accordion"], [class*="direction"]')
      .first();
    await expect(firstDirection).toBeVisible({ timeout: 5_000 });
    await firstDirection.click();
    const detailsBtn = page.getByRole('button', { name: 'Détails' }).first();
    await expect(detailsBtn).toBeVisible({ timeout: 5_000 });

    // Act
    await detailsBtn.click();

    // Assert — DepartementUsersList modal opens with a DataGrid
    await expect(page.getByRole('grid').last()).toBeVisible({ timeout: 8_000 });
  });

  test('can delete a department via its delete button', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — expand the first direction accordion to reveal its departments table
    const firstDirection = page
      .locator('[class*="accordion"], [class*="direction"]')
      .first();
    await expect(firstDirection).toBeVisible({ timeout: 5_000 });
    await firstDirection.click();
    const createDeptBtn = page
      .getByRole('button', { name: 'Créer un département' })
      .first();
    await expect(createDeptBtn).toBeVisible({ timeout: 5_000 });

    // Create a unique department to delete
    const ts = String(Date.now()).slice(-6);
    const deptTitle = `DepDel${ts}`;
    const deptAbbr = `DL${ts.slice(-3)}`;
    await createDeptBtn.click();
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill(deptTitle);
    await page.getByLabel('Mnémonique').fill(deptAbbr);
    await page
      .getByRole('button', { name: /créer|valider|enregistrer|ajouter/i })
      .last()
      .click();
    await expect(page.getByText(deptAbbr).first()).toBeVisible({
      timeout: 8_000,
    });

    // Act — find the specific department row and click its delete button
    const deptRow = page.locator('tr').filter({ hasText: deptAbbr });
    const deleteDepBtn = deptRow.getByRole('button', {
      name: 'Supprimer le département',
    });
    await expect(deleteDepBtn).toBeVisible({ timeout: 5_000 });
    await deleteDepBtn.click();

    // Assert — success snackbar appears
    await expect(
      page
        .getByText(/suppression.*departement.*reusi/i)
        .first()
        .or(page.getByText(/succès|success/i).first()),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('can delete a direction via confirmation modal', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — create a unique direction to delete so the test is idempotent
    const ts = String(Date.now()).slice(-6);
    const dirTitle = `DelDir${ts}`;
    const dirAbbr = `DD${ts.slice(-3)}`;
    await page.getByRole('button', { name: 'Créer une direction' }).click();
    await expect(page.getByLabel('Titre')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel('Titre').fill(dirTitle);
    await page.getByLabel('Mnémonique').fill(dirAbbr);
    await page
      .getByRole('button', { name: /créer|valider|enregistrer|ajouter/i })
      .last()
      .click();
    await expect(
      page.getByText(dirAbbr).or(page.getByText(dirTitle)).first(),
    ).toBeVisible({ timeout: 8_000 });

    // Act — hover to reveal delete icon, then open confirmation modal
    const directionRow = page.getByText(dirTitle).first();
    await directionRow.hover();
    const deleteIconBtn = page
      .getByRole('button', { name: 'Supprimer la direction' })
      .or(page.locator('[data-testid="DeleteForeverIcon"]').first())
      .last();
    await expect(deleteIconBtn).toBeVisible({ timeout: 5_000 });
    await deleteIconBtn.click();

    await expect(page.getByText('Supprimer la direction')).toBeVisible({
      timeout: 5_000,
    });
    await page.getByPlaceholder(dirAbbr).fill(dirAbbr);
    const confirmBtn = page.getByRole('button', { name: 'Supprimer' });
    await expect(confirmBtn).toBeEnabled({ timeout: 3_000 });
    await confirmBtn.click();

    // Assert — modal closes then direction disappears from the list
    await expect(page.getByRole('button', { name: 'Annuler' })).not.toBeVisible(
      { timeout: 8_000 },
    );
    await expect(page.getByText(dirTitle).first()).not.toBeVisible({
      timeout: 8_000,
    });
  });
});
