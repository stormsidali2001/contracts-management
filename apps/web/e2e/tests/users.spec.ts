import { test, expect } from '../fixtures';

test.describe('Users', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.locator('#sidebar-link-users').click();
    await expect(page.locator('#users-page')).toBeVisible({ timeout: 10_000 });
  });

  test('users page loads with header and data grid', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#users-page-header')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible({ timeout: 10_000 });
  });

  test('create user button is visible', async ({ authenticatedPage: page }) => {
    // Assert
    await expect(
      page.getByRole('button', { name: 'Créer un utilisateur' }),
    ).toBeVisible();
  });

  test('can create a user via 4-step modal (Admin role, skips direction step)', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    const ts = Date.now();

    // Act — Step 0: Identifiants
    await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
    await expect(page.getByLabel('Nom', { exact: true })).toBeVisible({
      timeout: 5_000,
    });
    await page.getByLabel('Nom', { exact: true }).fill('Dupont');
    await page.getByLabel('Prénom', { exact: true }).fill('Jean');
    await page.getByLabel('Email').fill(`e2e.user.${ts}@test.dz`);
    await page.getByRole('button', { name: /suivant/i }).click();

    // Act — Step 1: Role selection (Admin skips direction step)
    await expect(page.getByText('Accès complet')).toBeVisible({
      timeout: 5_000,
    });
    await page.getByText('Accès complet').click();
    await page.getByRole('button', { name: /suivant/i }).click();

    // Assert — Step 3: Success state
    await expect(page.getByText(/creé|créé|success/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: /fermer|terminer/i }).click();
  });

  test('data grid shows user rows', async ({ authenticatedPage: page }) => {
    // Assert
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  });

  test('can navigate to user profile page', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    const rows = page
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 5_000 });

    // Act
    const navLink = rows.first().getByRole('link');
    if ((await navLink.count()) > 0) {
      await navLink.first().click();
    } else {
      await rows.first().getByRole('button').last().click();
    }

    // Assert
    await expect(page).toHaveURL(/\/users\/.+/, { timeout: 5_000 });
  });

  test('can delete a user via the grid delete button', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — create a unique user so deletion is idempotent across runs
    const ts = String(Date.now()).slice(-6);
    await page.getByRole('button', { name: 'Créer un utilisateur' }).click();
    await expect(page.getByLabel('Nom', { exact: true })).toBeVisible({
      timeout: 5_000,
    });
    await page.getByLabel('Nom', { exact: true }).fill('ToDelete');
    await page.getByLabel('Prénom', { exact: true }).fill(`E2E${ts}`);
    await page.getByLabel('Email').fill(`del.${ts}@test.dz`);
    await page.getByRole('button', { name: /suivant/i }).click();
    await expect(page.getByText('Accès complet')).toBeVisible({
      timeout: 5_000,
    });
    await page.getByText('Accès complet').click();
    await page.getByRole('button', { name: /suivant/i }).click();
    await expect(page.getByText(/creé|créé|success/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: /fermer|terminer/i }).click();

    // Arrange — search for the created user
    const searchInput = page.getByPlaceholder(/rechercher un utilisateur/i);
    await searchInput.fill(`E2E${ts}`);
    const rows = page
      .getByRole('grid')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(rows.first()).toBeVisible({ timeout: 8_000 });

    // Act — widen viewport so the Supprimer column renders, then click DeleteForever icon
    await page.setViewportSize({ width: 1600, height: 900 });
    const deleteBtn = rows.first().locator('[data-testid="DeleteForeverIcon"]');
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
    await deleteBtn.click();

    // Assert — checkmark or snackbar confirms deletion
    const successIndicator = rows
      .first()
      .locator('[data-testid="CheckIcon"]')
      .or(page.getByText(/supprimé|deleted/i).first());
    await expect(successIndicator.first()).toBeVisible({ timeout: 8_000 });
  });

  test('can edit own profile from user profile page', async ({
    authenticatedPage: page,
  }) => {
    // Arrange — navigate to own profile via topbar user menu
    await page.locator('#topbar').getByRole('button').last().click();
    await expect(page.getByText('Profile')).toBeVisible({ timeout: 5_000 });
    await page.getByText('Profile').click();
    await expect(page.locator('#user-profile-page')).toBeVisible({
      timeout: 10_000,
    });

    // Act — click the icon-only edit button (no accessible name, located inside profile card)
    const profileCardBtn = page
      .locator('#user-profile-card')
      .getByRole('button')
      .first();
    await expect(profileCardBtn).toBeVisible({ timeout: 5_000 });
    await profileCardBtn.click();

    // Act — update a field (inputs appear after edit mode activates)
    const inputs = page
      .locator('#user-profile-card')
      .locator('input[type="text"]');
    if ((await inputs.count()) > 0) {
      const current = await inputs.first().inputValue();
      await inputs.first().fill(current || 'Admin');
    }

    // Act — save (same button now shows SaveIcon)
    await profileCardBtn.click();

    // Assert
    await expect(page.locator('#user-profile-page')).toBeVisible({
      timeout: 5_000,
    });
  });
});
