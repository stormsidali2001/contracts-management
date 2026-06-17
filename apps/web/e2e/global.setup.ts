import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/prod-state.json');

setup('authenticate for prod tests', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Identifiant').fill('admin.admin');
  await page.getByLabel('Mot de passe').fill('123456');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#sidebar-nav')).toBeVisible({ timeout: 15_000 });

  // Decode the refresh_token cookie to extract the user sub, then pre-set the
  // onboarding_done_<sub> localStorage key so the WelcomeModal never appears
  // in any prod test that loads this storageState.
  const cookies = await page.context().cookies();
  const refreshToken = cookies.find((c) => c.name === 'refresh_token')?.value;
  if (refreshToken) {
    const payload = JSON.parse(
      Buffer.from(refreshToken.split('.')[1], 'base64url').toString('utf8'),
    );
    const sub: string | undefined = payload?.user?.sub;
    if (sub) {
      await page.evaluate(
        (key) => localStorage.setItem(key, 'true'),
        `onboarding_done_${sub}`,
      );
    }
  }

  await page.context().storageState({ path: authFile });
});
