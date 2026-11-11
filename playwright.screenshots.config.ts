// Playwright setup for `npm run screenshots`: renders fixed scenes of the game
// into docs/images/. Not part of `npm run e2e` or `npm run check`.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'scripts',
  testMatch: 'screenshots.spec.ts',
  outputDir: 'test-results/screenshots',
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
    viewport: { width: 600, height: 750 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
