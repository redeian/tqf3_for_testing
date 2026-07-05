/**
 * Example unit test for Zod validation schemas.
 *
 * This file demonstrates the pattern all validation tests should follow.
 * When the AI agent creates new Zod schemas in src/lib/validations.ts,
 * it should create corresponding tests following this pattern.
 *
 * See docs/TESTING.md Section 6, Pattern 1 for the full guide.
 */
import { describe, it, expect } from "vitest";

// Placeholder — replace with actual import once validations.ts exists
// import { createSyllabusSchema } from "@/lib/validations";

// For now, define a minimal schema to demonstrate the pattern
import { z } from "zod";

const createSyllabusSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required").max(200),
  courseCode: z.string().min(1, "Course code is required").max(20),
  term: z.string().min(1, "Term is required").max(50),
  creditHours: z.number().int().min(1, "Credit hours must be at least 1").max(10, "Credit hours cannot exceed 10"),
  classLocation: z.string().max(200).optional(),
  schedule: z.string().max(500).optional(),
  courseDescription: z.string().max(5000).optional(),
  prerequisites: z.string().max(2000).optional(),
});

describe("createSyllabusSchema", () => {
  // ✅ Valid input — happy path
  it("accepts valid syllabus data with all fields", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Web Programming",
      courseCode: "IT601205",
      term: "2567-1",
      creditHours: 3,
      classLocation: "Room 301",
      schedule: "Mon/Wed 10:00-12:00",
      courseDescription: "Introduction to web development.",
      prerequisites: "Basic programming knowledge",
    });
    expect(result.success).toBe(true);
  });

  // ✅ Valid input — only required fields
  it("accepts data with only required fields (optional fields omitted)", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Data Structures",
      courseCode: "IT601302",
      term: "2567-2",
      creditHours: 4,
    });
    expect(result.success).toBe(true);
  });

  // ❌ Invalid: empty course title
  it("rejects empty course title", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "",
      courseCode: "IT601205",
      term: "2567-1",
      creditHours: 3,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Course title is required");
    }
  });

  // ❌ Invalid: empty course code
  it("rejects empty course code", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "",
      term: "2567-1",
      creditHours: 3,
    });
    expect(result.success).toBe(false);
  });

  // ❌ Invalid: credit hours below minimum
  it("rejects credit hours of 0", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 1");
    }
  });

  // ❌ Invalid: credit hours above maximum
  it("rejects credit hours above 10", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 15,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed 10");
    }
  });

  // ❌ Invalid: non-integer credit hours
  it("rejects non-integer credit hours", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 3.5,
    });
    expect(result.success).toBe(false);
  });

  // ❌ Invalid: course title too long
  it("rejects course title longer than 200 characters", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "A".repeat(201),
      courseCode: "IT001",
      term: "2567-1",
      creditHours: 3,
    });
    expect(result.success).toBe(false);
  });

  // ❌ Invalid: missing required field entirely
  it("rejects when term is missing", () => {
    const result = createSyllabusSchema.safeParse({
      courseTitle: "Test Course",
      courseCode: "IT001",
      creditHours: 3,
    });
    expect(result.success).toBe(false);
  });
});