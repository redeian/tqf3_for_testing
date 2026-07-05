"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { syllabi, weeklySchedules } from "@/db/schema";
import { ActionResult } from "@/lib/types";
import { generateMarkdown } from "@/lib/export";
import { syllabusSchema, SyllabusInput } from "@/lib/validations";
import { logger } from "@/lib/logger";

function filterFilledWeeks(weeks: SyllabusInput["weeks"]) {
  return weeks.filter(
    (week) => week.topic?.trim() && week.activityType?.trim()
  );
}

export async function createSyllabus(
  input: SyllabusInput
): Promise<ActionResult<{ id: string }>> {
  const validated = syllabusSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [syllabus] = await tx
        .insert(syllabi)
        .values({
          courseCode: validated.data.courseCode,
          courseName: validated.data.courseName,
        })
        .$returningId();

      const filledWeeks = filterFilledWeeks(validated.data.weeks);
      if (filledWeeks.length > 0) {
        await tx.insert(weeklySchedules).values(
          filledWeeks.map((week) => ({
            syllabusId: syllabus.id,
            weekNumber: week.weekNumber,
            topic: week.topic.trim(),
            activityType: week.activityType.trim(),
            sortOrder: week.weekNumber,
          }))
        );
      }

      return syllabus;
    });

    revalidatePath("/syllabi");
    return { success: true, data: { id: result.id } };
  } catch (error) {
    logger.error("createSyllabus failed", { error: String(error) });
    return {
      success: false,
      error: "Failed to save syllabus. Please try again.",
    };
  }
}

export async function updateSyllabus(
  id: string,
  input: SyllabusInput
): Promise<ActionResult<void>> {
  const validated = syllabusSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    await db.transaction(async (tx) => {
      const existing = await tx.query.syllabi.findFirst({
        where: eq(syllabi.id, id),
      });

      if (!existing) {
        throw new Error("Syllabus not found");
      }

      await tx
        .update(syllabi)
        .set({
          courseCode: validated.data.courseCode,
          courseName: validated.data.courseName,
        })
        .where(eq(syllabi.id, id));

      await tx
        .delete(weeklySchedules)
        .where(eq(weeklySchedules.syllabusId, id));

      const filledWeeks = filterFilledWeeks(validated.data.weeks);
      if (filledWeeks.length > 0) {
        await tx.insert(weeklySchedules).values(
          filledWeeks.map((week) => ({
            syllabusId: id,
            weekNumber: week.weekNumber,
            topic: week.topic.trim(),
            activityType: week.activityType.trim(),
            sortOrder: week.weekNumber,
          }))
        );
      }
    });

    revalidatePath("/syllabi");
    revalidatePath(`/syllabi/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "Syllabus not found") {
      return { success: false, error: "Syllabus not found" };
    }
    logger.error("updateSyllabus failed", { id, error: String(error) });
    return {
      success: false,
      error: "Failed to update syllabus. Please try again.",
    };
  }
}

export async function deleteSyllabus(
  id: string
): Promise<ActionResult<void>> {
  try {
    await db.transaction(async (tx) => {
      const existing = await tx.query.syllabi.findFirst({
        where: eq(syllabi.id, id),
      });

      if (!existing) {
        throw new Error("Syllabus not found");
      }

      await tx
        .delete(weeklySchedules)
        .where(eq(weeklySchedules.syllabusId, id));
      await tx.delete(syllabi).where(eq(syllabi.id, id));
    });

    revalidatePath("/syllabi");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message === "Syllabus not found") {
      return { success: false, error: "Syllabus not found" };
    }
    logger.error("deleteSyllabus failed", { id, error: String(error) });
    return {
      success: false,
      error: "Failed to delete syllabus. Please try again.",
    };
  }
}

export async function exportSyllabus(
  id: string
): Promise<ActionResult<string>> {
  try {
    const syllabus = await db.query.syllabi.findFirst({
      where: eq(syllabi.id, id),
    });

    if (!syllabus) {
      return { success: false, error: "Syllabus not found" };
    }

    const weeks = await db.query.weeklySchedules.findMany({
      where: eq(weeklySchedules.syllabusId, id),
    });

    const markdown = generateMarkdown(syllabus, weeks);
    return { success: true, data: markdown };
  } catch (error) {
    logger.error("exportSyllabus failed", { id, error: String(error) });
    return {
      success: false,
      error: "Failed to export syllabus. Please try again.",
    };
  }
}
