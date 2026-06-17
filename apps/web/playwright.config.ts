import { defineConfig, devices } from '@playwright/test';

/**
 * Two test projects:
 *
 * mock  — starts Next.js on port 3001 with NEXT_PUBLIC_MOCK_MODE=true.
 *         All API calls are intercepted by MSW. No backend required.
 *         Run: pnpm test:e2e:mock
 *
 * prod  — connects to an already-running Next.js on port 3000 with a live
 *         backend (docker compose up -d && pnpm dev from apps/api).
 *         Run: pnpm test:e2e:prod
 */

const MOCK_PORT = 3001;
const PROD_PORT = 3000;

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'mock',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${MOCK_PORT}`,
      },
      metadata: { testMode: 'mock' },
    },
    {
      name: 'prod',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PROD_PORT}`,
        // No storageState here: authenticatedPage/juridicalPage fixtures each do a fresh
        // login, and auth tests (which use plain `page`) need to start unauthenticated so
        // navigating to /signin shows the form instead of auto-redirecting to /dashboard.
      },
      metadata: { testMode: 'prod' },
    },
    {
      name: 'prod-setup',
      testDir: './e2e',
      testMatch: '**/global.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PROD_PORT}`,
      },
      metadata: { testMode: 'prod' },
    },
  ],

  webServer: [
    {
      command: 'pnpm dev --port 3001',
      url: `http://localhost:${MOCK_PORT}`,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_MOCK_MODE: 'true',
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
        NEXT_DIST_DIR: '.next-mock',
      },
    },
    {
      url: `http://localhost:${PROD_PORT}`,
      reuseExistingServer: true,
      timeout: 10_000,
      command: 'pnpm dev --port 3000',
    },
  ],
});
