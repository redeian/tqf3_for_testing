import { syllabi, weeklySchedules } from "@/db/schema";

type Syllabus = typeof syllabi.$inferSelect;
type WeeklySchedule = typeof weeklySchedules.$inferSelect;

export function generateMarkdown(
  syllabus: Syllabus,
  weeks: WeeklySchedule[]
): string {
  const heading = [syllabus.courseCode, syllabus.courseName]
    .filter(Boolean)
    .join(" - ");

  const lines: string[] = [`# ${heading || "Untitled Syllabus"}`, ""];
  lines.push("## Course Information", "");
  lines.push(`- **Course Code:** ${syllabus.courseCode || "N/A"}`);
  lines.push(`- **Course Name:** ${syllabus.courseName || "N/A"}`);
  lines.push("", "## Weekly Plan", "");

  const filledWeeks = weeks
    .filter((week) => week.topic?.trim())
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (filledWeeks.length === 0) {
    lines.push("_No weekly plan entered._", "");
  } else {
    filledWeeks.forEach((week) => {
      lines.push(`### Week ${week.weekNumber}`, "");
      lines.push(`- **Topic:** ${week.topic}`);
      if (week.activityType) {
        lines.push(`- **Activity:** ${week.activityType}`);
      }
      lines.push("");
    });
  }

  return lines.join("\n");
}
