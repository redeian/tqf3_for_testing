import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // Retry only on CI to smooth transient flakes
  retries: process.env.CI ? 2 : 0,

  // Single worker in CI if tests share a database; auto locally
  workers: process.env.CI ? 1 : undefined,

  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",

    // Capture trace on first retry — full debugging forensics
    trace: "on-first-retry",

    // Screenshot only on failure
    screenshot: "only-on-failure",

    // Video retained on failure for debugging
    video: "retain-on-failure",
  },

  projects: [
    // --- Setup: authenticate once, save state ---
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // --- Main tests: run after setup, reuse auth state ---
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  // --- Start Next.js production build for E2E ---
  // Run against build (not dev) for realistic behavior
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});