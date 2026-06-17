import { test, expect } from '../fixtures';

// These pages are public — no authentication fixture needed.
test.describe('Forgot Password', () => {
  test('forgot-password page loads with email field', async ({ page }) => {
    // Arrange
    await page.goto('/forgot-password');

    // Assert
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 5_000 });
  });

  test('submit button is disabled when email field is empty', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/forgot-password');

    // Assert
    const submitBtn = page.getByRole('button', {
      name: /envoyer|réinitialiser|submit|confirmer/i,
    });
    await expect(submitBtn).toBeDisabled({ timeout: 5_000 });
  });

  test('submit button is disabled with invalid email format', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/forgot-password');

    // Act
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/email/i).blur();

    // Assert
    const submitBtn = page.getByRole('button', {
      name: /envoyer|réinitialiser|submit|confirmer/i,
    });
    await expect(submitBtn).toBeDisabled({ timeout: 3_000 });
  });

  test('submit button becomes enabled with valid email', async ({ page }) => {
    // Arrange
    await page.goto('/forgot-password');

    // Act
    await page.getByLabel(/email/i).fill('test@example.com');

    // Assert
    const submitBtn = page.getByRole('button', {
      name: /envoyer|réinitialiser|submit|confirmer/i,
    });
    await expect(submitBtn).toBeEnabled({ timeout: 3_000 });
  });

  test('submitting forgot-password shows a feedback message', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('test@example.com');

    // Act
    await page
      .getByRole('button', { name: /envoyer|réinitialiser|submit|confirmer/i })
      .click();

    // Assert — either success (link sent) or error (email not found) is valid
    await expect(
      page
        .getByText(/envoyé|réinitialisé|succès|associé|invalid|erreur/i)
        .first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('reset-password page loads with password fields', async ({ page }) => {
    // Arrange
    await page.goto('/reset-password?userId=fake-id&token=fake-token');

    // Assert
    const passwordFields = page.locator('input[type="password"]');
    await expect(passwordFields.first()).toBeVisible({ timeout: 5_000 });
    await expect(passwordFields).toHaveCount(2);
  });

  test('reset-password submit button is disabled when fields are empty', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/reset-password?userId=fake-id&token=fake-token');

    // Assert — "Mettre à jour le mot de passe" button is disabled by default
    const submitBtn = page.getByRole('button', {
      name: /réinitialiser|enregistrer|confirmer|submit|mettre/i,
    });
    await expect(submitBtn).toBeDisabled({ timeout: 5_000 });
  });

  test('reset-password submit button is disabled when passwords do not match', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/reset-password?userId=fake-id&token=fake-token');

    // Act
    const fields = page.locator('input[type="password"]');
    await fields.nth(0).fill('password123');
    await fields.nth(1).fill('different456');
    await fields.nth(1).blur();

    // Assert
    const submitBtn = page.getByRole('button', {
      name: /réinitialiser|enregistrer|confirmer|submit|mettre/i,
    });
    await expect(submitBtn).toBeDisabled({ timeout: 3_000 });
  });
});
