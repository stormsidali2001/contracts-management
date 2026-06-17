import { test, expect } from '../fixtures';

/**
 * Permission matrix (from AccessPolicy):
 *
 * | Permission              | ADMIN | JURIDICAL | EMPLOYEE |
 * |-------------------------|-------|-----------|----------|
 * | agreements.canCreate    | false | true      | false    |
 * | agreements.canExecute   | false | true      | false    |
 * | vendors.canCreate/Edit  | false | true      | false    |
 * | vendors.canDelete       | false | true      | false    |
 * | directions.canCreate    | true  | false     | false    |
 * | directions.canDelete    | true  | false     | false    |
 * | users.canCreate/Delete  | true  | false     | false    |
 *
 * Sidebar visibility:
 * - Directions  → ADMIN only  (directions.canCreate)
 * - Utilisateurs → ADMIN only (users.canCreate)
 * - Fournisseurs → ADMIN or JURIDICAL (vendors.canCreate || directions.canCreate)
 * - Convensions / Contrats → always visible
 *
 * Note: mock mode returns FULL_PERMISSIONS for every user, so permission tests
 * that check for ABSENCE of buttons/links are skipped in mock mode.
 */

// ── EMPLOYEE role ──────────────────────────────────────────────────────────────
test.describe('Permissions - EMPLOYEE', () => {
  test('sidebar does not show Directions link', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Assert
    await expect(page.locator('#sidebar-link-directions')).not.toBeVisible();
  });

  test('sidebar does not show Utilisateurs link', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Assert
    await expect(page.locator('#sidebar-link-users')).not.toBeVisible();
  });

  test('sidebar does not show Fournisseurs link', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Assert
    await expect(page.locator('#sidebar-link-vendors')).not.toBeVisible();
  });

  test('contracts page does not show create button', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un contrat' }),
    ).not.toBeVisible();
  });

  test('conventions page does not show create button', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer une convention' }),
    ).not.toBeVisible();
  });
});

// ── JURIDICAL role ─────────────────────────────────────────────────────────────
test.describe('Permissions - JURIDICAL', () => {
  test('sidebar does not show Directions link', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Assert
    await expect(page.locator('#sidebar-link-directions')).not.toBeVisible();
  });

  test('sidebar does not show Utilisateurs link', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Assert
    await expect(page.locator('#sidebar-link-users')).not.toBeVisible();
  });

  test('sidebar shows Fournisseurs link', async ({ juridicalPage: page }) => {
    // Assert
    await expect(page.locator('#sidebar-link-vendors')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('contracts page shows create button', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un contrat' }),
    ).toBeVisible();
  });

  test('conventions page shows create button', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer une convention' }),
    ).toBeVisible();
  });

  test('vendors page shows create button', async ({ juridicalPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-vendors').click();
    await expect(page.locator('#vendors-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un fournisseur' }),
    ).toBeVisible();
  });
});

// ── JURIDICAL role — vendor permissions ────────────────────────────────────────
test.describe('Permissions - JURIDICAL (vendor edit/delete)', () => {
  test('JURIDICAL sees Modifier button on vendor detail', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
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
    await expect(page.getByRole('button', { name: 'Modifier' })).toBeVisible({
      timeout: 5_000,
    });
  });

  test('ADMIN does not see Modifier button on vendor detail', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
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

  test('EMPLOYEE does not see Modifier button on vendor detail', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
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

// ── Direction filter permission ─────────────────────────────────────────────────
test.describe('Permissions - Direction filter (canFilterByDirection)', () => {
  test('ADMIN sees direction filter in contracts filter modal', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — direction filter is visible for all fixtures',
    );
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    // Assert
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('JURIDICAL sees direction filter in contracts filter modal', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — direction filter is visible for all fixtures',
    );
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    // Assert
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('EMPLOYEE does not see direction filter in contracts filter modal', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — direction filter is visible for all fixtures',
    );
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    // Assert
    await expect(page.getByText('Direction et département')).not.toBeVisible();
  });

  test('ADMIN sees direction filter in users filter modal', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — direction filter is visible for all fixtures',
    );
    // Arrange
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    // Assert
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('EMPLOYEE does not see direction filter in users filter modal', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — direction filter is visible for all fixtures',
    );
    // Arrange
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    // Assert
    await expect(page.getByText('Direction et département')).not.toBeVisible();
  });
});

// ── ADMIN role ─────────────────────────────────────────────────────────────────
test.describe('Permissions - ADMIN', () => {
  test('sidebar shows Directions link', async ({ authenticatedPage: page }) => {
    // Assert
    await expect(page.locator('#sidebar-link-directions')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('sidebar shows Utilisateurs link', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#sidebar-link-users')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('sidebar shows Fournisseurs link', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#sidebar-link-vendors')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('contracts page does not show create button', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un contrat' }),
    ).not.toBeVisible();
  });

  test('conventions page does not show create button', async ({
    authenticatedPage: page,
    testMode,
  }) => {
    test.skip(testMode === 'mock', 'Mock returns full permissions');
    // Arrange
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer une convention' }),
    ).not.toBeVisible();
  });

  test('directions page shows create button', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    await page.locator('#sidebar-link-directions').click();
    await expect(page.locator('#directions-page')).toBeVisible({
      timeout: 10_000,
    });
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer une direction' }),
    ).toBeVisible();
  });

  test('users page shows create button', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
    // Assert
    await expect(
      page.getByRole('button', {
        name: /créer un utilisateur|nouvel utilisateur/i,
      }),
    ).toBeVisible();
  });
});
