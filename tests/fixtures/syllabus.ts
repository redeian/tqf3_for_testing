export function createSyllabusFixture(
  overrides?: Partial<{
    id: string;
    courseCode: string;
    courseName: string;
    createdAt: Date;
    updatedAt: Date;
  }>
) {
  return {
    id: "syllabus-test-id",
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    createdAt: new Date("2026-07-05T00:00:00Z"),
    updatedAt: new Date("2026-07-05T00:00:00Z"),
    ...overrides,
  };
}

export function createWeeklyScheduleFixture(
  overrides?: Partial<{
    id: string;
    syllabusId: string;
    weekNumber: number;
    topic: string;
    activityType: string;
    sortOrder: number;
  }>
) {
  return {
    id: "weekly-test-id",
    syllabusId: "syllabus-test-id",
    weekNumber: 1,
    topic: "Introduction to the course",
    activityType: "Lecture",
    sortOrder: 1,
    ...overrides,
  };
}

export function createSyllabusInputFixture(
  overrides?: Partial<{
    courseCode: string;
    courseName: string;
    level: "undergraduate" | "graduate" | "doctoral";
    weeks: { weekNumber: number; topic: string; activityType: string }[];
  }>
) {
  return {
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    level: "undergraduate",
    weeks: Array.from({ length: 15 }, (_, i) => ({
      weekNumber: i + 1,
      topic: i === 0 ? "Introduction" : "",
      activityType: i === 0 ? "Lecture" : "",
    })),
    ...overrides,
  };
}
