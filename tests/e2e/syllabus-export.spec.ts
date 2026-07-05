import { test, expect } from "@playwright/test";
import { createSyllabusInputFixture } from "../fixtures/syllabus";

const uniqueCode = `EXP${Date.now()}`;

const input = createSyllabusInputFixture({
  courseCode: uniqueCode,
  courseName: "Export Test Course",
  weeks: Array.from({ length: 15 }, (_, i) => ({
    weekNumber: i + 1,
    topic: i === 0 ? "Export Week Topic" : "",
    activityType: i === 0 ? "Lecture" : "",
  })),
});

test.describe("Syllabus Export", () => {
  test("create and export a syllabus", async ({ page }) => {
    await page.goto("/syllabi/new");
    await page.getByLabel(/course code/i).fill(input.courseCode);
    await page.getByLabel(/course name/i).fill(input.courseName);

    await page.getByLabel("Topic (Week 1)").fill(input.weeks[0].topic);
    await page
      .getByLabel("Activity (Week 1)")
      .selectOption(input.weeks[0].activityType);

    await page.getByRole("button", { name: /save syllabus/i }).click();
    await expect(page).toHaveURL(/\/syllabi\/[\w-]+/);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /export to markdown/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.md$/);
  });
});
