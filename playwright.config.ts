import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Reduce parallelism for stability
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries - fail fast */
  retries: 0,
  /* Single worker for reliability */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  /* Reduced global test timeout for faster failures */
  timeout: 10000, // 10 seconds per test max
  /* Global expect timeout */
  expect: {
    timeout: 3000, // 3 seconds for expects
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'off',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Reduced timeouts for faster failures */
    navigationTimeout: 5000, // 5 seconds
    actionTimeout: 3000, // 3 seconds
  },

  /* Configure projects - ONLY Chromium */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 seconds to start server
    stdout: 'ignore',
    stderr: 'pipe',
  },
}); 