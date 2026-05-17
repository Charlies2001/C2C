import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config — runs Playwright against a real Vite dev server + uvicorn backend.
 *
 * Local: both servers may already be running; webServer.reuseExistingServer=true.
 * CI: Playwright starts both itself with a clean sqlite DB (DATABASE_URL points to
 * an isolated file so we don't clobber dev data).
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'zh-CN',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'python -m uvicorn app.main:app --port 8000 --log-level warning',
      cwd: '../backend',
      port: 8000,
      timeout: 60_000,
      reuseExistingServer: !isCI,
      env: {
        DATABASE_URL: 'sqlite:///./e2e_test.db',
        JWT_SECRET_KEY: 'e2e-test-secret-key-do-not-use-in-prod',
        ENCRYPTION_KEY: 'e2e-test-encryption-key-32-bytes',
        CORS_ORIGINS: 'http://localhost:5173',
        SEED_LANGUAGE: 'zh-CN',
        ALLOW_ENV_KEY_FALLBACK: 'false',
      },
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      port: 5173,
      timeout: 60_000,
      reuseExistingServer: !isCI,
    },
  ],
});
