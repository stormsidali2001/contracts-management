import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/prod-state.json');

setup('authenticate for prod tests', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Identifiant').fill('admin.admin');
  await page.getByLabel('Mot de passe').fill('123456');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.locator('#sidebar-nav')).toBeVisible();
  await page.context().storageState({ path: authFile });
});
