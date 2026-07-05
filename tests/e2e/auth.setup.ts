/**
 * Placeholder auth setup file.
 *
 * This file runs ONCE before all E2E tests.
 * It authenticates a test user and saves the session state
 * to playwright/.auth/user.json for all other tests to reuse.
 *
 * IMPORTANT: This is a placeholder. Once the auth system is implemented,
 * replace the login logic below with the actual Google OAuth flow
 * or a test-specific auth bypass.
 *
 * See docs/TESTING.md Section 6, Pattern 3 for the full guide.
 */
import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // TODO: Replace with actual auth flow once implemented
  //
  // Option A: Use a test Google account (recommended for production)
  //   await page.goto("/login");
  //   await page.getByRole("button", { name: /sign in with google/i }).click();
  //   ... complete Google OAuth with test account ...
  //   await expect(page).toHaveURL(/\/dashboard/);
  //
  // Option B: Use a test-specific auth bypass (faster for CI)
  //   await page.goto("/api/auth/test-login?user=test-user");
  //   await expect(page).toHaveURL(/\/dashboard/);

  // For now, just navigate to the app and save state
  await page.goto("/");
  await page.context().storageState({ path: authFile });
});