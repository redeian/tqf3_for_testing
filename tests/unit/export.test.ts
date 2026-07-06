import { describe, it, expect } from "vitest";
import { generateMarkdown } from "@/lib/export";

describe("generateMarkdown", () => {
  const baseSyllabus = {
    id: "test-id",
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    level: "undergraduate",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("generates markdown with course code and name", () => {
    const result = generateMarkdown(baseSyllabus, []);
    expect(result).toContain("# CS101 - Introduction to Programming");
    expect(result).toContain("**Course Code:** CS101");
    expect(result).toContain("**Course Name:** Introduction to Programming");
  });

  it("skips blank weeks", () => {
    const result = generateMarkdown(baseSyllabus, [
      {
        id: "w1",
        syllabusId: "test-id",
        weekNumber: 1,
        topic: "Intro",
        activityType: "Lecture",
        sortOrder: 1,
      },
      {
        id: "w2",
        syllabusId: "test-id",
        weekNumber: 2,
        topic: "",
        activityType: "",
        sortOrder: 2,
      },
    ]);
    expect(result).toContain("### Week 1");
    expect(result).not.toContain("### Week 2");
  });

  it("includes activity type when present", () => {
    const result = generateMarkdown(baseSyllabus, [
      {
        id: "w1",
        syllabusId: "test-id",
        weekNumber: 1,
        topic: "Intro",
        activityType: "Lecture",
        sortOrder: 1,
      },
    ]);
    expect(result).toContain("**Topic:** Intro");
    expect(result).toContain("**Activity:** Lecture");
  });

  it("handles missing course code", () => {
    const result = generateMarkdown({ ...baseSyllabus, courseCode: "" }, []);
    expect(result).toContain("# Introduction to Programming");
  });

  it("shows placeholder when no weeks are filled", () => {
    const result = generateMarkdown(baseSyllabus, []);
    expect(result).toContain("_No weekly plan entered._");
  });
});
