// =========================================================================
// Playwright-E2E gegen den gebauten Staging-Output (npm test baut vorher via
// build:staging — Prod-Domain-URLs, Root-Base, noindex aktiv).
// =========================================================================
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    // Optionaler System-Chromium (z. B. Sandbox-/Container-Umgebungen ohne
    // Playwright-Download): PW_CHROMIUM=/pfad/zu/chrome npx playwright test
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
