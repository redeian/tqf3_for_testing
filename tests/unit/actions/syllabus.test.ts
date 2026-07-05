import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    transaction: vi.fn(),
    query: {
      syllabi: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      weeklySchedules: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  exportSyllabus,
} from "@/actions/syllabus";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

const validInput = {
  courseCode: "CS101",
  courseName: "Introduction to Programming",
  weeks: Array.from({ length: 15 }, (_, i) => ({
    weekNumber: i + 1,
    topic: i < 3 ? `Topic ${i + 1}` : "",
    activityType: i < 3 ? "Lecture" : "",
  })),
};

describe("createSyllabus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid input", async () => {
    const result = await createSyllabus({ ...validInput, courseCode: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Course code is required");
    }
  });

  it("creates a syllabus with non-blank weeks", async () => {
    vi.mocked(db.transaction).mockResolvedValue({ id: "new-id" });

    const result = await createSyllabus(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("new-id");
    }
    expect(db.transaction).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/syllabi");
  });

  it("returns error when database transaction fails", async () => {
    vi.mocked(db.transaction).mockRejectedValue(new Error("DB error"));

    const result = await createSyllabus(validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to save syllabus. Please try again.");
    }
  });
});

describe("updateSyllabus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error for invalid input", async () => {
    const result = await updateSyllabus("id-1", {
      ...validInput,
      courseName: "",
    });
    expect(result.success).toBe(false);
  });

  it("returns not found when syllabus does not exist", async () => {
    vi.mocked(db.transaction).mockRejectedValue(new Error("Syllabus not found"));

    const result = await updateSyllabus("id-1", validInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Syllabus not found");
    }
  });

  it("updates successfully", async () => {
    vi.mocked(db.transaction).mockResolvedValue(undefined);

    const result = await updateSyllabus("id-1", validInput);
    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/syllabi");
    expect(revalidatePath).toHaveBeenCalledWith("/syllabi/id-1");
  });
});

describe("deleteSyllabus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not found when syllabus does not exist", async () => {
    vi.mocked(db.transaction).mockRejectedValue(new Error("Syllabus not found"));

    const result = await deleteSyllabus("missing-id");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Syllabus not found");
    }
  });

  it("deletes successfully", async () => {
    vi.mocked(db.transaction).mockResolvedValue(undefined);

    const result = await deleteSyllabus("id-1");
    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/syllabi");
  });
});

describe("exportSyllabus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when syllabus not found", async () => {
    vi.mocked(db.query.syllabi.findFirst).mockResolvedValue(null);

    const result = await exportSyllabus("missing-id");
    expect(result.success).toBe(false);
  });

  it("returns markdown string on success", async () => {
    vi.mocked(db.query.syllabi.findFirst).mockResolvedValue({
      id: "id-1",
      courseCode: "CS101",
      courseName: "Introduction to Programming",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.mocked(db.query.weeklySchedules.findMany).mockResolvedValue([
      {
        id: "w1",
        syllabusId: "id-1",
        weekNumber: 1,
        topic: "Intro",
        activityType: "Lecture",
        sortOrder: 1,
      },
    ]);

    const result = await exportSyllabus("id-1");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toContain("# CS101 - Introduction to Programming");
      expect(result.data).toContain("### Week 1");
    }
  });
});
