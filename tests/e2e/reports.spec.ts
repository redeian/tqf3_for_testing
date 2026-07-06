import { test, expect } from "@playwright/test";

test.describe("Reports Page", () => {
  test("displays report title and stat cards", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText("รายงานสรุปสำหรับผู้บริหาร")).toBeVisible();
    await expect(page.getByText("วิชาทั้งหมด")).toBeVisible();
  });

  test("shows level breakdown charts", async ({ page }) => {
    await page.goto("/reports");
    await expect(
      page.getByText("สัดส่วนหลักสูตร (Bar Chart)")
    ).toBeVisible();
    await expect(
      page.getByText("สัดส่วนหลักสูตร (Pie Chart)")
    ).toBeVisible();
  });

  test("shows syllabus table", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText("รายชื่อวิชาทั้งหมด")).toBeVisible();
  });
});
