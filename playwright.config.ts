import fs from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath = process.env.PW_CHROMIUM || (fs.existsSync(macChrome) ? macChrome : undefined);

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results/artifacts',
  timeout: 35_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['line'], ['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4321',
    locale: 'de-DE',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ...(executablePath ? { launchOptions: { executablePath } } : { channel: 'chrome' }),
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 1_000 },
    timeout: 60_000,
  },
});
