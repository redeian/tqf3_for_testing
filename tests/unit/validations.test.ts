import { describe, it, expect } from "vitest";
import {
  activityTypeSchema,
  weeklyEntrySchema,
  syllabusSchema,
} from "@/lib/validations";

describe("activityTypeSchema", () => {
  it("accepts valid activity types", () => {
    const validTypes = [
      "Lecture",
      "Lab / Practical",
      "Discussion",
      "Self-study",
      "Examination",
      "Presentation",
      "Project work",
    ];
    validTypes.forEach((type) => {
      expect(activityTypeSchema.safeParse(type).success).toBe(true);
    });
  });

  it("rejects invalid activity types", () => {
    const result = activityTypeSchema.safeParse("Invalid Type");
    expect(result.success).toBe(false);
  });
});

describe("weeklyEntrySchema", () => {
  it("accepts a complete week entry", () => {
    const result = weeklyEntrySchema.safeParse({
      weekNumber: 1,
      topic: "Introduction",
      activityType: "Lecture",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a blank week entry", () => {
    const result = weeklyEntrySchema.safeParse({
      weekNumber: 1,
      topic: "",
      activityType: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects week number below 1", () => {
    const result = weeklyEntrySchema.safeParse({
      weekNumber: 0,
      topic: "Introduction",
      activityType: "Lecture",
    });
    expect(result.success).toBe(false);
  });

  it("rejects week number above 15", () => {
    const result = weeklyEntrySchema.safeParse({
      weekNumber: 16,
      topic: "Introduction",
      activityType: "Lecture",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a topic that is too long", () => {
    const result = weeklyEntrySchema.safeParse({
      weekNumber: 1,
      topic: "A".repeat(501),
      activityType: "Lecture",
    });
    expect(result.success).toBe(false);
  });
});

describe("syllabusSchema", () => {
  it("accepts valid syllabus data with all weeks", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "CS101",
      courseName: "Introduction to Programming",
      weeks: Array.from({ length: 15 }, (_, i) => ({
        weekNumber: i + 1,
        topic: `Week ${i + 1} topic`,
        activityType: "Lecture",
      })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty course code", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "",
      courseName: "Introduction to Programming",
      weeks: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Course code is required");
    }
  });

  it("rejects empty course name", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "CS101",
      courseName: "",
      weeks: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Course name is required");
    }
  });

  it("rejects a course code that is too long", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "A".repeat(21),
      courseName: "Introduction to Programming",
      weeks: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a course name that is too long", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "CS101",
      courseName: "A".repeat(201),
      weeks: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 15 weeks", () => {
    const result = syllabusSchema.safeParse({
      courseCode: "CS101",
      courseName: "Introduction to Programming",
      weeks: Array.from({ length: 16 }, (_, i) => ({
        weekNumber: i + 1,
        topic: `Week ${i + 1} topic`,
        activityType: "Lecture",
      })),
    });
    expect(result.success).toBe(false);
  });
});
