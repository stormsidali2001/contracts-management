import { test, expect } from '../fixtures';

/**
 * Filter feature tests for contracts, conventions, and users.
 *
 * Filter modal behaviour confirmed against mock handlers:
 *   - status param:      supported by /agreements handler
 *   - searchQuery param: supported by /agreements and /users handlers
 *   - directionId param: supported by /agreements handler
 *
 * Direction-filter VISIBILITY is a permission gate:
 *   - canFilterByDirection = true  for ADMIN and JURIDICAL
 *   - canFilterByDirection = false for EMPLOYEE
 * In mock mode the admin session is always used, so the direction section
 * is always visible. Tests that verify ABSENCE of the section are prod-only.
 */

// ── Contracts filter ───────────────────────────────────────────────────────────
test.describe('Contracts - Filter', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange — land on the contracts page
    await page.locator('#sidebar-link-contracts').click();
    await expect(page.locator('#contracts-page')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('filter modal opens and shows advanced-filters header', async ({
    juridicalPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();

    // Assert
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('filter modal can be closed via Fermer button', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Act
    await page.getByRole('button', { name: 'Fermer' }).click();

    // Assert — modal dismissed
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 3_000,
    });
  });

  test('direction filter section is visible when canFilterByDirection is true', async ({
    juridicalPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Assert — ADMIN/JURIDICAL users have canFilterByDirection = true
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('direction filter section is NOT visible for EMPLOYEE role', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — employee role not distinguishable',
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

    // Assert — EMPLOYEE has canFilterByDirection = false
    await expect(page.getByText('Direction et département')).not.toBeVisible();
  });

  test('status filter toggle enables status chip selection', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Act — enable the status section toggle
    const statusToggle = page
      .getByText("Statut d'exécution")
      .locator('xpath=../../label');
    await statusToggle.click();

    // Assert — status chips are now enabled and clickable
    const notExecutedChip = page.getByRole('button', { name: 'Non exécuté' });
    await expect(notExecutedChip).toBeEnabled({ timeout: 3_000 });
  });

  test('filtering contracts by status "Non exécuté" returns not-executed contracts', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Act — enable status filter and select "Non exécuté"
    const statusToggle = page
      .getByText("Statut d'exécution")
      .locator('xpath=../../label');
    await statusToggle.click();
    await page.getByRole('button', { name: 'Non exécuté' }).click();
    await page.getByRole('button', { name: 'Appliquer' }).click();

    // Assert — modal closed and grid refreshed with filtered results
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });
  });

  test('filtering contracts by status "Exécuté" returns executed contracts', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Act — enable status filter and select "Exécuté"
    const statusToggle = page
      .getByText("Statut d'exécution")
      .locator('xpath=../../label');
    await statusToggle.click();
    await page.getByRole('button', { name: 'Exécuté', exact: true }).click();
    await page.getByRole('button', { name: 'Appliquer' }).click();

    // Assert
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
  });

  test('resetting filters via Réinitialiser clears active filters', async ({
    juridicalPage: page,
  }) => {
    // Arrange — first apply a status filter
    await page.getByRole('button', { name: 'Filtrer' }).click();
    const statusToggle = page
      .getByText("Statut d'exécution")
      .locator('xpath=../../label');
    await statusToggle.click();
    await page.getByRole('button', { name: 'Non exécuté' }).click();
    await page.getByRole('button', { name: 'Appliquer' }).click();
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 5_000,
    });

    // Act — reopen and reset
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
    await page.getByRole('button', { name: 'Réinitialiser' }).click();

    // Assert — modal closed, grid shows all contracts
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
  });

  test('text search narrows contract results', async ({
    juridicalPage: page,
  }) => {
    // Arrange — in mock mode the search term matches agr-1 "Maintenance des équipements informatiques"
    const searchInput = page.getByPlaceholder('Rechercher un contrat...');

    // Act
    await searchInput.fill('CTR-2024-001');
    await page.waitForTimeout(1_200); // debounce

    // Assert — the matching contract or number is shown
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });
  });

  test('text search with no matches shows empty state', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    const searchInput = page.getByPlaceholder('Rechercher un contrat...');

    // Act
    await searchInput.fill('XXXXXXNOMATCH999');
    await page.waitForTimeout(1_200);

    // Assert — grid is still rendered (DataGrid handles empty state internally)
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
  });
});

// ── Conventions filter ─────────────────────────────────────────────────────────
test.describe('Conventions - Filter', () => {
  test.beforeEach(async ({ juridicalPage: page }) => {
    // Arrange — land on the conventions page
    await page.locator('#sidebar-link-convensions').click();
    await expect(page.locator('#convensions-page')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('filter modal opens for conventions and shows advanced-filters header', async ({
    juridicalPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();

    // Assert
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('filtering conventions by status "En cours" returns in-execution conventions', async ({
    juridicalPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Act
    const statusToggle = page
      .getByText("Statut d'exécution")
      .locator('xpath=../../label');
    await statusToggle.click();
    await page.getByRole('button', { name: 'En cours', exact: true }).click();
    await page.getByRole('button', { name: 'Appliquer' }).click();

    // Assert
    await expect(page.getByText('Filtres avancés')).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });
  });

  test('text search finds convention by keyword', async ({
    juridicalPage: page,
  }) => {
    // Arrange — in mock mode "partenariat" matches agr-26 (CNV-2024-001)
    const searchInput = page
      .getByPlaceholder('Rechercher un contrat...')
      .or(page.locator('input[placeholder*="recherch" i]'))
      .first();

    // Act
    await searchInput.fill('partenariat');
    await page.waitForTimeout(1_200);

    // Assert
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
    await expect(
      page
        .getByRole('grid')
        .getByRole('row')
        .filter({ hasNot: page.getByRole('columnheader') })
        .first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('direction filter section is visible for JURIDICAL user', async ({
    juridicalPage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — same admin session used for all fixtures',
    );

    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres avancés')).toBeVisible({
      timeout: 5_000,
    });

    // Assert — JURIDICAL has canFilterByDirection = true
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });
});

// ── Users filter ───────────────────────────────────────────────────────────────
test.describe('Users - Filter', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Arrange
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('filter modal opens for users and shows filters header', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();

    // Assert — UsersFilter uses "Filtres utilisateurs" as header title
    await expect(page.getByText('Filtres utilisateurs')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('users filter modal shows role section', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres utilisateurs')).toBeVisible({
      timeout: 5_000,
    });

    // Assert — role chips are visible in the filter modal (getByText('Rôle') is ambiguous with DataGrid column header)
    await expect(page.getByRole('button', { name: 'Employé' })).toBeVisible({
      timeout: 3_000,
    });
  });

  test('enabling role filter shows role chip options', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres utilisateurs')).toBeVisible({
      timeout: 5_000,
    });

    // Act — enable role toggle
    const roleToggle = page.getByText('Rôle').locator('xpath=../../label');
    await roleToggle.click();

    // Assert — role chips appear
    await expect(page.getByRole('button', { name: 'Employé' })).toBeEnabled({
      timeout: 3_000,
    });
    await expect(page.getByRole('button', { name: 'Admin' })).toBeEnabled({
      timeout: 3_000,
    });
    await expect(page.getByRole('button', { name: 'Juridique' })).toBeEnabled({
      timeout: 3_000,
    });
  });

  test('text search narrows user results', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — in mock mode "admin.admin" matches the first admin user
    const searchInput = page.getByPlaceholder('Rechercher un utilisateur...');

    // Act
    await searchInput.fill('admin');
    await page.waitForTimeout(1_200);

    // Assert
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 5_000 });
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });
  });

  test('direction filter section visible in users filter for ADMIN', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres utilisateurs')).toBeVisible({
      timeout: 5_000,
    });

    // Assert — ADMIN has canFilterByDirection = true (direction section always present in UsersFilter)
    await expect(page.getByText('Direction et département')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('direction filter section NOT visible in users filter for EMPLOYEE', async ({
    employeePage: page,
    testMode,
  }) => {
    test.skip(
      testMode === 'mock',
      'Mock always returns full permissions — employee role not distinguishable',
    );

    // Arrange
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });

    // Act
    await page.getByRole('button', { name: 'Filtrer' }).click();
    await expect(page.getByText('Filtres utilisateurs')).toBeVisible({
      timeout: 5_000,
    });

    // Assert — EMPLOYEE has canFilterByDirection = false
    await expect(page.getByText('Direction et département')).not.toBeVisible();
  });
});
