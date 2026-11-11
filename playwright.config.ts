import { defineConfig, devices } from '@playwright/test';

// Node's `process` without @types/node (tsconfig has `types: []`); only the
// environment is read here.
declare const process: { env: Record<string, string | undefined> };

// A51: only in the CI (GitHub sets `CI`) a failed test is retried once, and a
// report with screenshots is written for upload. Locally a test never retries.
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: isCI ? 'only-on-failure' : 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
