/**
 * Mock helpers for Auth.js session in unit tests.
 */
import { vi } from "vitest";
import { createSessionFixture, createUserFixture } from "../fixtures/user";

export function mockAuthSession(
  userOverrides?: Partial<ReturnType<typeof createUserFixture>>,
) {
  // Assumes @/lib/auth is already mocked in the test file
  const { auth } = require("@/lib/auth");
  vi.mocked(auth).mockResolvedValue(createSessionFixture(userOverrides));
}

export function mockAuthNoSession() {
  const { auth } = require("@/lib/auth");
  vi.mocked(auth).mockResolvedValue(null);
}