/**
 * Test data factory for user records.
 */

export function createUserFixture(overrides?: Partial<{
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin" | "teacher";
}>) {
  return {
    id: "user-test-id",
    name: "Test Teacher",
    email: "test@university.ac.th",
    image: null,
    role: "teacher" as const,
    ...overrides,
  };
}

export function createAdminFixture(overrides?: Partial<{
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher";
}>) {
  return createUserFixture({
    id: "admin-test-id",
    name: "Test Admin",
    email: "admin@university.ac.th",
    role: "admin",
    ...overrides,
  });
}

export function createSessionFixture(userOverrides?: Partial<{
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher";
}>) {
  return {
    user: createUserFixture(userOverrides),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}