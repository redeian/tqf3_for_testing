import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi, beforeAll } from "vitest";
import React from "react";

// --- Environment setup ---
beforeAll(() => {
  process.env.DATABASE_URL = "mysql://test:test@localhost:3306/test_db";
  process.env.AUTH_SECRET = "test-secret-not-for-production";
  process.env.AUTH_GOOGLE_ID = "test-google-id";
  process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
});

// --- Cleanup after each test ---
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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