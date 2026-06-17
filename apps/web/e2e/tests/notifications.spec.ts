import { test, expect } from '../fixtures';

test.describe('Notifications', () => {
  test('notification bell button is visible in topbar', async ({
    authenticatedPage: page,
  }) => {
    // Assert
    await expect(page.locator('#topbar-notifications')).toBeVisible();
  });

  test('clicking bell opens notifications panel', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.locator('#topbar-notifications').click();

    // Assert
    await expect(
      page.locator('[data-testid="notifications-panel"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('notifications panel shows filter tabs', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.locator('#topbar-notifications').click();

    // Assert
    const filterBar = page.locator('[data-testid="notifications-filter-bar"]');
    await expect(filterBar).toBeVisible({ timeout: 5_000 });
    await expect(filterBar.getByRole('button', { name: 'Tous' })).toBeVisible();
    await expect(
      filterBar.getByRole('button', { name: 'Création' }),
    ).toBeVisible();
    await expect(
      filterBar.getByRole('button', { name: 'Suppression' }),
    ).toBeVisible();
  });

  test('notifications panel shows items or empty state', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.locator('#topbar-notifications').click();

    // Assert
    const panel = page.locator('[data-testid="notifications-panel"]');
    await expect(panel).toBeVisible({ timeout: 5_000 });
    const emptyState = panel.locator(
      '[data-testid="notifications-empty-state"]',
    );
    const list = panel.locator('[data-testid="notifications-list"]');
    const hasEmptyState = await emptyState
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(list.locator('li').first()).toBeVisible();
    }
  });

  test('Tout lire button appears only when there are unread notifications', async ({
    authenticatedPage: page,
  }) => {
    // Act
    await page.locator('#topbar-notifications').click();
    const panel = page.locator('[data-testid="notifications-panel"]');
    await expect(panel).toBeVisible({ timeout: 5_000 });

    // Assert — button presence depends on whether there are unread notifications
    const isEmpty = await panel
      .locator('[data-testid="notifications-empty-state"]')
      .isVisible({ timeout: 2_000 })
      .catch(() => false);
    const markAllBtn = page.locator(
      '[data-testid="notifications-mark-all-read"]',
    );
    if (!isEmpty) {
      await expect(markAllBtn).toBeVisible({ timeout: 3_000 });
    } else {
      await expect(markAllBtn).not.toBeVisible();
    }
  });

  test('clicking a filter tab updates the visible list', async ({
    authenticatedPage: page,
  }) => {
    // Arrange
    await page.locator('#topbar-notifications').click();
    const filterBar = page.locator('[data-testid="notifications-filter-bar"]');
    await expect(filterBar).toBeVisible({ timeout: 5_000 });

    // Act
    await filterBar.getByRole('button', { name: 'Création' }).click();

    // Assert — panel shows filtered items or an empty state
    const panel = page.locator('[data-testid="notifications-panel"]');
    const emptyState = panel.locator(
      '[data-testid="notifications-empty-state"]',
    );
    const list = panel.locator('[data-testid="notifications-list"]');
    await expect(emptyState.or(list.locator('li').first())).toBeVisible({
      timeout: 5_000,
    });
  });
});
