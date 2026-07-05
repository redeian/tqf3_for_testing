import { z } from "zod";

export const ACTIVITY_TYPES = [
  "Lecture",
  "Lab / Practical",
  "Discussion",
  "Self-study",
  "Examination",
  "Presentation",
  "Project work",
] as const;

export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

export type ActivityType = z.infer<typeof activityTypeSchema>;

export const weeklyEntrySchema = z.object({
  weekNumber: z
    .number()
    .int("Week number must be an integer")
    .min(1, "Week number must be at least 1")
    .max(15, "Week number must be at most 15"),
  topic: z.string().max(500, "Topic cannot exceed 500 characters"),
  activityType: z.string().max(50, "Activity type cannot exceed 50 characters"),
});

export type WeeklyEntryInput = z.infer<typeof weeklyEntrySchema>;

export const syllabusSchema = z.object({
  courseCode: z
    .string()
    .min(1, "Course code is required")
    .max(20, "Course code cannot exceed 20 characters"),
  courseName: z
    .string()
    .min(1, "Course name is required")
    .max(200, "Course name cannot exceed 200 characters"),
  weeks: z.array(weeklyEntrySchema).max(15, "Cannot exceed 15 weeks"),
});

export type SyllabusInput = z.infer<typeof syllabusSchema>;
