/**
 * Test data factory for syllabus records.
 * Use these in both unit and E2E tests for consistent test data.
 */

export function createSyllabusFixture(overrides?: Partial<{
  id: string;
  userId: string;
  courseTitle: string;
  courseCode: string;
  term: string;
  creditHours: number;
  classLocation: string;
  schedule: string;
  courseDescription: string;
  prerequisites: string;
  status: "draft" | "incomplete" | "completed";
}>) {
  return {
    id: "syllabus-test-id",
    userId: "user-test-id",
    courseTitle: "Web Programming",
    courseCode: "IT601205",
    term: "2567-1",
    creditHours: 3,
    classLocation: "Room 301, Building A",
    schedule: "Mon/Wed 10:00-12:00",
    courseDescription: "Introduction to web development with modern frameworks.",
    prerequisites: "Basic programming knowledge",
    status: "draft" as const,
    ...overrides,
  };
}

export function createSyllabusInputFixture(overrides?: Record<string, unknown>) {
  return {
    courseTitle: "Web Programming",
    courseCode: "IT601205",
    term: "2567-1",
    creditHours: 3,
    classLocation: "Room 301",
    schedule: "Mon/Wed 10:00-12:00",
    courseDescription: "Introduction to web development.",
    prerequisites: "Basic programming",
    ...overrides,
  };
}