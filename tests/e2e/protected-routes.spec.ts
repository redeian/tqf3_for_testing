/**
 * Example E2E test: Protected routes.
 *
 * Verifies that unauthenticated users are redirected to /login
 * and authenticated users can access /dashboard.
 *
 * See docs/TESTING.md Section 6, Pattern 4 for the full guide.
 */
import { test, expect } from "@playwright/test";

test.describe("Protected routes", () => {
  test("redirects unauthenticated user to login", async ({ browser }) => {
    // Use a fresh context WITHOUT saved auth state
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/dashboard");

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();

    await context.close();
  });

  test("allows authenticated user to access dashboard", async ({ page }) => {
    // This test uses the storageState from auth.setup.ts (authenticated)
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading")).toBeVisible();
  });
});