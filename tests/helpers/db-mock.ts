/**
 * Mock helpers for Drizzle ORM database calls in unit tests.
 */
import { vi } from "vitest";

type MockDbConfig = {
  insertReturnId?: unknown[];
  findManyReturn?: unknown[];
  findFirstReturn?: unknown | null;
  updateReturn?: unknown[];
  deleteReturn?: unknown[];
};

export function mockDb(config: MockDbConfig = {}) {
  // Assumes @/db is already mocked in the test file
  const { db } = require("@/db");

  vi.mocked(db.insert).mockReturnValue({
    $returningId: vi.fn().mockResolvedValue(config.insertReturnId ?? []),
  } as any);

  if (db.query?.syllabi?.findMany) {
    vi.mocked(db.query.syllabi.findMany).mockResolvedValue(
      config.findManyReturn ?? []
    );
  }

  return db;
}

export function resetDbMock() {
  const { db } = require("@/db");
  vi.mocked(db.insert).mockReset();
  if (db.query?.syllabi?.findMany) {
    vi.mocked(db.query.syllabi.findMany).mockReset();
  }
}