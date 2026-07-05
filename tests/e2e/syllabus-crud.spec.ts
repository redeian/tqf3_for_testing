import { test, expect } from "@playwright/test";
import { createSyllabusInputFixture } from "../fixtures/syllabus";

const uniqueCode = `E2E${Date.now()}`;

const input = createSyllabusInputFixture({
  courseCode: uniqueCode,
  courseName: "E2E Test Course",
  weeks: Array.from({ length: 15 }, (_, i) => ({
    weekNumber: i + 1,
    topic: i < 2 ? `E2E Topic ${i + 1}` : "",
    activityType: i < 2 ? "Lecture" : "",
  })),
});

test.describe.configure({ mode: "serial" });

test.describe("Syllabus CRUD", () => {
  test("create a new syllabus", async ({ page }) => {
    await page.goto("/syllabi");
    await page.getByRole("button", { name: /create new syllabus/i }).click();
    await expect(page).toHaveURL("/syllabi/new");

    await page.getByLabel(/course code/i).fill(input.courseCode);
    await page.getByLabel(/course name/i).fill(input.courseName);

    for (let i = 0; i < 2; i++) {
      await page.getByLabel(`Topic (Week ${i + 1})`).fill(input.weeks[i].topic);
      await page
        .getByLabel(`Activity (Week ${i + 1})`)
        .selectOption(input.weeks[i].activityType);
    }

    await page.getByRole("button", { name: /save syllabus/i }).click();
    await expect(page).toHaveURL(/\/syllabi\/[\w-]+/);
    await expect(page.getByText(input.courseCode)).toBeVisible();
  });

  test("edit an existing syllabus", async ({ page }) => {
    await page.goto("/syllabi");
    await page.getByText(`${input.courseCode} - ${input.courseName}`).first().click();
    await page.getByRole("button", { name: /edit/i }).click();

    const nameInput = page.getByLabel(/course name/i);
    await nameInput.clear();
    await nameInput.fill("Updated E2E Course");

    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText("Updated E2E Course")).toBeVisible();
  });

  test("delete a syllabus", async ({ page }) => {
    await page.goto("/syllabi");
    const row = page
      .getByRole("link", { name: new RegExp(`${input.courseCode} -`) })
      .locator("xpath=../..");
    await row.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /confirm delete/i }).click();
    await expect(page.getByText(input.courseCode)).not.toBeVisible();
  });
});
