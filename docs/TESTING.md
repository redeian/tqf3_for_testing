---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Testing & Validation Strategy

> **For AI Agents and Humans:** This document defines the complete testing strategy, validation process, and quality gates. Read this before writing any tests.

## 1. Testing Philosophy

### Core Principles

1. **Test user-visible behavior, not implementation details** — Test what the user sees and does, not internal function names or CSS classes
2. **Tests are the AI agent's feedback loop** — Write tests first or alongside code; run them before every PR
3. **Every test must be isolated** — No test depends on another test's data or state
4. **Fast feedback first** — Unit tests run in milliseconds; E2E tests run in seconds
5. **Don't chase 100% coverage** — Test what matters: business logic, auth, validation, critical user flows

### What to Test vs What to Skip

| ✅ Test This | ❌ Skip This | Why |
|-------------|-------------|-----|
| Zod validation schemas (valid + invalid) | Third-party SDK internals | You control your schemas; trust their SDK |
| Server Action decision logic | Next.js framework internals | Framework is already tested |
| Auth checks (authorized vs unauthorized) | CSS class names / layout pixels | Visual regression is separate investment |
| Database queries (with mocked DB) | Trivial getters/setters | Not worth the maintenance |
| Full user flows (login → create → export) | Static content rendering | Playwright page test already covers this |
| Error handling (invalid input, DB failure) | React rendering internals | Test behavior, not implementation |
| Form validation (client + server) | Route handler boilerplate | NTARH covers this if needed |

---

## 2. Testing Architecture

### Two-Layer Strategy

```
┌─────────────────────────────────────────────────────┐
│                    Layer 1: Unit Tests                │
│                   Tool: Vitest + happy-dom            │
│                                                       │
│  • Zod schema validation (all valid/invalid cases)    │
│  • Server Action logic (mocked DB + auth)             │
│  • Utility functions (formatDate, generateMD, etc.)   │
│  • Client Components (React Testing Library)          │
│  • Synchronous Server Components                      │
│                                                       │
│  Speed: < 2 seconds total                             │
│  Runs: On every save (watch mode) + CI               │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Layer 2: E2E Tests                  │
│              Tool: Playwright (Chromium)              │
│                                                       │
│  • Auth flows (login, logout, session expiry)         │
│  • Syllabus CRUD (create, edit, delete)               │
│  • Export to Markdown (download + clipboard)          │
│  • Async Server Components (dashboard, list)          │
│  • Form submissions through real Next.js server       │
│  • Protected route redirects                          │
│                                                       │
│  Speed: < 30 seconds total                            │
│  Runs: Before PR creation + CI (against prod build)   │
└─────────────────────────────────────────────────────┘
```

### Why This Split?

| What | Tool | Why |
|------|------|-----|
| Zod schemas | Vitest | Pure functions, no dependencies, fastest tests |
| Server Actions (logic) | Vitest | Mock DB + auth, test decision logic in isolation |
| Async Server Components | Playwright | Vitest can't render async components (React limitation) |
| Auth flows | Playwright | Need real browser, real cookies, real session |
| Form submissions | Playwright | Need real Next.js server, real Server Action invocation |
| Client Components | Vitest | React Testing Library + happy-dom, fast feedback |

---

## 3. Test File Structure

```
tests/
├── unit/                           # Vitest unit tests
│   ├── validations.test.ts         # Zod schema tests
│   ├── actions/
│   │   ├── syllabus.test.ts        # Server Action tests (mocked DB)
│   │   └── user.test.ts
│   ├── lib/
│   │   ├── markdown.test.ts        # Markdown generation utility
│   │   └── utils.test.ts           # General utility functions
│   └── components/
│       ├── syllabus-form.test.tsx  # Client component tests
│       └── syllabus-list.test.tsx
│
├── e2e/                            # Playwright E2E tests
│   ├── auth.setup.ts               # Authentication setup (runs once)
│   ├── auth.spec.ts                # Login/logout/session flows
│   ├── syllabus-crud.spec.ts       # Create, edit, delete syllabus
│   ├── syllabus-export.spec.ts     # Export to Markdown + clipboard
│   └── protected-routes.spec.ts    # Route protection verification
│
├── fixtures/                       # Test data factories
│   ├── syllabus.ts                 # Factory for syllabus test data
│   └── user.ts                     # Factory for user test data
│
└── helpers/                        # Shared test utilities
    ├── db-mock.ts                  # Drizzle ORM mock helpers
    └── auth-mock.ts                # Auth.js session mock helpers
```

---

## 4. Vitest Configuration

### `vitest.config.ts` (Project Root)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "happy-dom",  // ESM-compatible, faster than jsdom
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/actions/**", "src/lib/**", "src/db/schema.ts"],
      exclude: ["node_modules/**", "**/*.config.*", "**/*.test.*"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### `vitest.setup.ts` (Project Root)

```typescript
import "@testing-library/jest-dom";
import { cleanup, afterEach, vi, beforeAll } from "vitest";
import React from "react";

// --- Environment setup ---
beforeAll(() => {
  process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test_db";
  process.env.AUTH_SECRET = "test-secret";
  process.env.AUTH_GOOGLE_ID = "test-google-id";
  process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
});

// --- Cleanup after each test ---
afterEach(() => {
  cleanup();
  vi.clearAllMocks();  // Critical: prevents state contamination between tests
});

// --- Mock Next.js server APIs ---

// next/headers: cookies() and headers() are async in Next.js 15+
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(() => []),
    })
  ),
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      entries: vi.fn(() => []),
    })
  ),
}));

// next/navigation: redirect() MUST throw (otherwise false positives!)
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// next/cache: mock revalidation functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
  refresh: vi.fn(),
}));

// next/image: render as plain img tag in tests
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement("img", props),
}));

// server-only: prevent import error in test environment
vi.mock("server-only", () => ({}));
```

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| `happy-dom` not `jsdom` | Pure ESM, 2-3x faster, no CommonJS errors with Next.js 16 |
| `redirect()` mock throws | Real Next.js throws `NEXT_REDIRECT`; without throw, code continues = false positives |
| `cookies()` returns Promise | Next.js 15+ made cookies async; mock must match |
| `vi.clearAllMocks()` in `afterEach` | Prevents mock state leaking between tests |
| Coverage thresholds at 80% | Covers business logic without chasing trivial code |
| Coverage includes only `src/actions`, `src/lib`, `src/db` | These contain the critical business logic |

---

## 5. Playwright Configuration

### `playwright.config.ts` (Project Root)

```typescript
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

    // Screenshot only on failure — no success noise
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
        // Load saved auth state so every test starts logged in
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  // --- Start Next.js production build for E2E ---
  // Run against build (not dev) for realistic behavior in CI
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Chromium only (not Firefox/Safari) | Reduces CI minutes; Safari/Firefox covered by manual testing if needed |
| `storageState` + setup project | Login once per run, not per test — massive speed gain |
| `trace: "on-first-retry"` | Full debugging forensics when CI fails, no performance cost on passing tests |
| `screenshot: "only-on-failure"` | Failure snapshots without success noise |
| `webServer` runs `build && start` | Test against production build, not dev mode (avoids hot-reload flakes) |
| `workers: 1` in CI | Prevents database conflicts if tests share a test DB |
| `retries: 2` in CI | Smooths transient infrastructure flakes |

---

## 6. Writing Tests: Patterns & Templates

### Pattern 1: Zod Schema Test (Vitest)

```typescript
// tests/unit/validations.test.ts
import { describe, it, expect } from "vitest";
import { createSyllabusSchema } from "@/lib/validations";

describe("createSyllabusSchema", () => {
  // ✅ Valid input
  it("accepts valid syllabus data", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Web Programming",
      courseCode: "IT601205",
      term: "2567-1",
      creditHours: 3,
    });
    expect(result.success).toBe(true);
  });

  // ❌ Invalid: empty title
  it("rejects empty course title", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "",
      courseCode: "IT601205",
      term: "2567-1",
      creditHours: 3,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("required");
    }
  });

  // ❌ Invalid: credit hours out of range
  it("rejects credit hours > 10", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 15,
    });
    expect(result.success).toBe(false);
  });

  // ✅ Optional fields omitted
  it("accepts data without optional fields", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 3,
      // classLocation, schedule, etc. are optional
    });
    expect(result.success).toBe(true);
  });
});
```

### Pattern 2: Server Action Test (Vitest, Mocked DB)

```typescript
// tests/unit/actions/syllabus.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies BEFORE importing the action
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      $returningId: vi.fn(),
    }),
    query: {
      syllabi: {
        findMany: vi.fn(),
      },
    },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createSyllabus } from "@/actions/syllabus";
import { auth } from "@/lib/auth";
import { db } from "@/db";

describe("createSyllabus", () => {
  beforeEach(() => {
    vi.clearAllMocks();  // Critical: reset between tests
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createSyllabus({
      courseTitle: "Test",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 3,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error for invalid input", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    } as any);

    const result = await createSyllabus({
      courseTitle: "",  // Invalid: empty
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 3,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("required");
  });

  it("creates syllabus successfully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    } as any);

    vi.mocked(db.insert).mockReturnValue({
      $returningId: vi.fn().mockResolvedValue([{ id: "new-syllabus-1" }]),
    } as any);

    const result = await createSyllabus({
      courseTitle: "Web Programming",
      courseCode: "IT601205",
      term: "2567-1",
      creditHours: 3,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "new-syllabus-1" });
  });
});
```

### Pattern 3: E2E Auth Setup (Playwright)

```typescript
// tests/e2e/auth.setup.ts
import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // For Google OAuth, mock the callback or use a test account
  // Option A: Use a test Google account
  // Option B: Mock the auth callback by injecting session directly

  // For this project: navigate to login, click Google sign-in
  // In test environment, use a mock OAuth provider or test account
  await page.goto("/login");
  await page.getByRole("button", { name: /sign in with google/i }).click();

  // Wait for dashboard to load (auth completed)
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: / syllabus/i })).toBeVisible();

  // Save session state for all other tests
  await page.context().storageState({ path: authFile });
});
```

### Pattern 4: E2E Feature Test (Playwright)

```typescript
// tests/e2e/syllabus-crud.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Syllabus CRUD", () => {
  test("create a new syllabus", async ({ page }) => {
    // 1. Navigate to dashboard
    await page.goto("/dashboard");

    // 2. Click create button (role-based locator, not CSS)
    await page.getByRole("button", { name: /create new syllabus/i }).click();

    // 3. Fill Course Information (Section A)
    await expect(page).toHaveURL(/\/syllabus\/new/);
    await page.getByLabel(/course title/i).fill("Web Programming");
    await page.getByLabel(/course code/i).fill("IT601205");
    await page.getByLabel(/term/i).fill("2567-1");
    await page.getByLabel(/credit hours/i).fill("3");

    // 4. Save draft
    await page.getByRole("button", { name: /save/i }).click();

    // 5. Verify success (web-first assertion — auto-retries)
    await expect(page.getByText(/draft saved/i)).toBeVisible();

    // 6. Verify it appears in the list
    await page.goto("/dashboard");
    await expect(page.getByText("Web Programming")).toBeVisible();
  });

  test("edit an existing syllabus", async ({ page }) => {
    // Assumes a syllabus exists (created by previous test or seed data)
    await page.goto("/dashboard");

    // Click edit on the first syllabus
    await page.getByRole("button", { name: /edit/i }).first().click();

    // Modify title
    const titleInput = page.getByLabel(/course title/i);
    await titleInput.clear();
    await titleInput.fill("Advanced Web Programming");

    // Save
    await page.getByRole("button", { name: /save/i }).click();

    // Verify update
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  test("delete a syllabus", async ({ page }) => {
    await page.goto("/dashboard");

    const initialCount = await page.getByRole("row").count();

    // Click delete on the last syllabus
    await page.getByRole("button", { name: /delete/i }).last().click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify row count decreased
    await expect(page.getByRole("row")).toHaveCount(initialCount - 1);
  });
});
```

### Pattern 5: E2E Export Test (Playwright)

```typescript
// tests/e2e/syllabus-export.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Export Syllabus", () => {
  test("download Markdown file", async ({ page }) => {
    // Navigate to a syllabus
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /edit/i }).first().click();

    // Click export
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /export/i }).click();
    const download = await downloadPromise;

    // Verify file name pattern
    expect(download.suggestedFilename()).toMatch(/\.md$/);

    // Verify file content (read the download)
    const stream = await download.createReadStream();
    // ... read and assert Markdown content
  });

  test("copy to clipboard", async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: /edit/i }).first().click();

    await page.getByRole("button", { name: /copy to clipboard/i }).click();

    // Verify success toast
    await expect(page.getByText(/copied to clipboard/i)).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("# ");
    expect(clipboardText).toContain("Course");
  });
});
```

---

## 7. Playwright Best Practices (Must Follow)

### DO

| Practice | Example |
|----------|---------|
| Use web-first assertions | `await expect(loc).toBeVisible()` (retries automatically) |
| Use role-based locators | `page.getByRole('button', { name: 'Submit' })` |
| Use label-based locators for forms | `page.getByLabel('Email')` |
| Wait for conditions, not time | `await expect(loc).toHaveCount(5)` not `waitForTimeout(3000)` |
| Isolate tests with unique data | `const email = \`test-${Date.now()}@test.com\`` |
| Use setup project for auth | Login once, reuse `storageState` |
| Mock third-party APIs | `page.route('**/api/external', route => route.fulfill(...))` |
| Capture traces on retry | `trace: 'on-first-retry'` in config |
| Run against production build in CI | `npm run build && npm run start` not `npm run dev` |
| Use soft assertions for multi-check | `await expect.soft(loc).toHaveText('A')` |

### DON'T

| Anti-Pattern | Why It's Bad | Fix |
|--------------|-------------|-----|
| `page.waitForTimeout(3000)` | Flaky in both directions (too short = fail, too long = slow) | Wait for condition: `await expect(loc).toBeVisible()` |
| `page.locator('.btn-primary')` | Breaks when CSS class changes | Use `page.getByRole('button', { name })` |
| `expect(await loc.isVisible()).toBe(true)` | No retry — checks once at random instant | Use `await expect(loc).toBeVisible()` |
| Login in every test | Slow and wasteful | Use setup project + `storageState` |
| Shared module-level state | Tests leak into each other | Each test sets up its own data |
| Testing external sites | Slow, uncontrollable, third-party changes | Mock with `page.route()` |
| `console.log` debugging in CI | No context, hard to trace | Use Trace Viewer (`npx playwright show-trace`) |

---

## 8. Vitest Best Practices (Must Follow)

### DO

| Practice | Example |
|----------|---------|
| Use `happy-dom` not `jsdom` | ESM-compatible, 2-3x faster for Next.js 16 |
| Mock `next/headers` globally | Prevents import errors in all tests |
| Make `redirect()` mock throw | Matches real behavior, prevents false positives |
| Call `vi.clearAllMocks()` in `afterEach` | Prevents mock state leaking between tests |
| Test Zod schemas with valid + invalid cases | Catches validation regressions |
| Mock DB in Server Action tests | Unit tests should be fast and isolated |
| Use `safeParse()` not `parse()` | `safeParse` returns `{ success, error }` without throwing |

### DON'T

| Anti-Pattern | Why It's Bad | Fix |
|--------------|-------------|-----|
| Using `jsdom` | ESM/CJS errors with Next.js 16 | Use `happy-dom` |
| `redirect()` mock returns `undefined` | Code continues after redirect = false positive | Make it throw `Error('NEXT_REDIRECT: url')` |
| Not resetting mocks between tests | Previous test's mock values leak | `beforeEach(() => vi.clearAllMocks())` |
| Testing async Server Components | Vitest can't render them | Use Playwright E2E instead |
| Importing `server-only` without mock | Throws environment error | `vi.mock('server-only', () => ({}))` |
| `as any` on everything | Loses type safety | Cast only where types are complex (Session) |

---

## 9. Validation Process

### When Tests Run

```
┌─────────────────────────────────────────────────────────┐
│  Development (Local)                                     │
│                                                          │
│  On save:     vitest --watch (instant unit test feedback)│
│  Before PR:   npm test && npm run test:e2e               │
│  Debug E2E:   npx playwright test --debug                │
│  Debug trace: npx playwright show-trace trace.zip        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CI/CD (GitHub Actions)                                  │
│                                                          │
│  On push/PR:                                             │
│    Job 1: lint → type-check → unit tests → build         │
│    Job 2 (after Job 1): playwright E2E (against build)   │
│    Both pass → PR is mergeable                           │
│                                                          │
│  On merge to main:                                       │
│    CI passes → deploy to production                      │
│    Post-deploy smoke test (curl health endpoint)         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Post-Deploy (Production)                                │
│                                                          │
│  1. Health check: GET https://domain/api/health → 200    │
│  2. Manual smoke test: login → create → export           │
│  3. Monitor logs for 24 hours                            │
│  4. If issues → create GitHub Issue → AI agent fixes     │
└─────────────────────────────────────────────────────────┘
```

### CI Pipeline Detail

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  # --- Job 1: Fast feedback (lint + unit tests) ---
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint              # ESLint
      - run: npx tsc --noEmit          # TypeScript type check
      - run: npm test                  # Vitest unit tests
      - run: npm run build             # Next.js production build

  # --- Job 2: E2E tests (slower, runs after quality passes) ---
  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium  # Only Chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()  # Upload report even on failure
        with:
          name: playwright-report
          path: |
            playwright-report/
            test-results/
          retention-days: 14
```

### Quality Gates

| Gate | What Must Pass | Who Checks |
|------|---------------|------------|
| Pre-PR (AI Agent) | `npm test` + `npm run test:e2e` + `npm run lint` | AI agent runs before creating PR |
| PR Review (CI) | Lint + type-check + unit tests + build + E2E | GitHub Actions automatically |
| PR Review (Human) | Code matches diagrams, tests test the right thing | You review manually |
| Pre-Deploy (CI) | All CI checks green on `main` | GitHub branch protection |
| Post-Deploy (Human) | Health check + manual smoke test | You verify production |

---

## 10. Test Coverage Strategy

### Coverage Targets

| Layer | Target | What Counts |
|-------|--------|-------------|
| Server Actions (`src/actions/**`) | 90% | All decision paths: auth check, validation, DB call, error handling |
| Validation schemas (`src/lib/validations.ts`) | 100% | Every field: valid case + at least one invalid case |
| Utility functions (`src/lib/**`) | 80% | Core logic functions |
| Database schema (`src/db/schema.ts`) | N/A | Not measured (declarative, no logic) |
| UI Components (`src/components/**`) | 60% | Interaction tests, not visual |
| Pages (`src/app/**`) | N/A | Covered by E2E tests |
| **Overall weighted** | **80%** | Enforced by Vitest coverage thresholds |

### What 80% Means in Practice

```
Total lines of business logic: 1000
Covered by tests:              800 (80%)
Uncovered:                     200 (20%)

The 20% uncovered should be:
  - Error logging paths
  - Edge cases that are hard to trigger
  - Trivial wrapper functions
  - UI rendering (covered by E2E instead)
```

### How to Check Coverage

```bash
# Run tests with coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/index.html
```

---

## 11. Handling Flaky Tests

### Prevention

1. **Never use `waitForTimeout`** — Always wait for conditions
2. **Isolate test data** — Each test creates its own data with unique identifiers
3. **Mock external dependencies** — Don't depend on network or third-party APIs
4. **Run E2E against production build** — Dev mode has different caching behavior
5. **Use web-first assertions** — They retry automatically

### When a Test is Flaky

```
1. Reproduce locally:
   npx playwright test --debug tests/e2e/flaky-test.spec.ts

2. Check the trace:
   npx playwright show-trace trace.zip

3. Identify the root cause:
   - Timing issue? → Use web-first assertion instead of manual wait
   - Data conflict? → Use unique data per test (Date.now() or UUID)
   - Network flake? → Mock the external call with page.route()
   - Shared state? → Ensure proper isolation (fresh context per test)

4. Fix and verify:
   npx playwright test tests/e2e/flaky-test.spec.ts --repeat=10
   (Run 10 times to confirm it's no longer flaky)
```

### Quarantine Policy

If a test is flaky and can't be fixed immediately:
1. Mark it with `test.fixme()` (not `test.skip()`) — shows it's known and tracked
2. Create a GitHub Issue to fix it
3. Set a deadline (max 1 week before it must be fixed or removed)

---

## 12. AI Agent Testing Rules

### Before Creating a PR, the AI Agent MUST:

1. **Write unit tests** for every new Server Action and Zod schema
2. **Write E2E tests** for every new user-facing feature
3. **Run `npm test`** — all unit tests must pass
4. **Run `npm run test:e2e`** — all E2E tests must pass
5. **Run `npm run lint`** — no lint errors
6. **Run `npx tsc --noEmit`** — no type errors
7. **Check coverage** — new code should maintain 80%+ coverage

### Test Writing Rules for AI Agents

1. **One test file per feature** — Don't mix unrelated tests
2. **Test name describes the behavior** — `it("rejects empty course title")` not `it("test1")`
3. **Test the happy path first** — Then add edge cases and error paths
4. **Mock at the boundary** — Mock DB and external services, not internal logic
5. **Never test implementation details** — Test what the user sees, not how it works
6. **Every Server Action test must cover**: auth check, validation, success path, error path
7. **Every Zod schema test must cover**: valid input, empty input, invalid type, boundary values