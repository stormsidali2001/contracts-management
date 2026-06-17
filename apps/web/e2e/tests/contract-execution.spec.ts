import { test, expect } from '../fixtures';

/**
 * Contract/Convention execution tests.
 *
 * Only JURIDICAL role has agreements.canExecute = true.
 * The execute button (#agreement-execute-btn) only renders for non-executed agreements.
 */

test.describe('Contract Execution', () => {
  // Navigate to the first not-executed contract's detail page.
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const detailLink = rows.first().getByRole('link').first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
    } else {
      await rows.first().click();
    }
    await expect(page.locator('#agreement-detail-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('contract detail page renders the execution section', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.locator('#agreement-detail-card')).toBeVisible();
    await expect(page.getByText('Exécution').first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('JURIDICAL sees the Exécuter button on a non-executed contract', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock returns full permissions for all users',
    );
    // Assert
    const execBtn = page.locator('#agreement-execute-btn');
    await expect(execBtn).toBeVisible({ timeout: 5_000 });
  });

  test('can execute a contract via the execution modal', async ({
    juridicalPage: page,
  }) => {
    // Arrange — find a non-executed contract (button must be enabled)
    const execBtn = page.locator('#agreement-execute-btn');
    if (await execBtn.isDisabled({ timeout: 3_000 }).catch(() => true)) {
      await page.goBack();
      const rows = page
        .getByRole('grid')
        .getByRole('row')
        .filter({ hasNot: page.getByRole('columnheader') });
      const secondLink = rows.nth(1).getByRole('link').first();
      if ((await secondLink.count()) > 0) await secondLink.click();
      else await rows.nth(1).click();
      await expect(page.locator('#agreement-detail-page')).toBeVisible({
        timeout: 10_000,
      });
    }

    // Skip gracefully if every listed contract is already executed
    const btn = page.locator('#agreement-execute-btn');
    if (!(await btn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'No executable contract available');
      return;
    }
    if (await btn.isDisabled({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'All visible contracts are already executed');
      return;
    }

    // Act — open execution modal
    await btn.click();
    await expect(page.getByText('Execution de Contrat')).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByLabel('date de debut')).toBeVisible({
      timeout: 3_000,
    });
    await expect(page.getByLabel('date de fin')).toBeVisible({
      timeout: 3_000,
    });
    await page.getByLabel('observation').fill('Exécution E2E test');
    await page.getByRole('button', { name: 'Executer' }).click();

    // Assert
    await expect(
      page.getByText(/executé|exécuté|succès|success/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('ADMIN does not see the Exécuter button', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock returns full permissions for all users',
    );
    // Arrange — navigate to a contract detail as ADMIN
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const detailLink = rows.first().getByRole('link').first();
    if ((await detailLink.count()) > 0) await detailLink.click();
    else await rows.first().click();
    await expect(page.locator('#agreement-detail-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(page.locator('#agreement-execute-btn')).not.toBeVisible();
  });
});

test.describe('Convention Execution', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const detailLink = rows.first().getByRole('link').first();
    if ((await detailLink.count()) > 0) await detailLink.click();
    else await rows.first().click();
    await expect(page.locator('#agreement-detail-page')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('convention detail page renders execution section', async ({
    juridicalPage: page,
  }) => {
    // Assert
    await expect(page.getByText('Exécution').first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('can execute a convention via the execution modal', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const btn = page.locator('#agreement-execute-btn');
    if (!(await btn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, 'No executable convention available');
      return;
    }
    if (await btn.isDisabled({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'All visible conventions are already executed');
      return;
    }

    // Act
    await btn.click();
    await expect(page.getByText('Execution de Contrat')).toBeVisible({
      timeout: 5_000,
    });
    await page.getByLabel('observation').fill('Exécution convention E2E');
    await page.getByRole('button', { name: 'Executer' }).click();

    // Assert
    await expect(
      page.getByText(/executé|exécuté|succès|success/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
