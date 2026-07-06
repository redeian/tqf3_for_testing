# Reports Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated `/reports` page for executives showing course statistics by level with bar chart, pie chart, and filterable table.

**Architecture:** New App Router page at `src/app/reports/page.tsx` reusing existing `LevelSummary` component and `SyllabusList` component. Add PieChart component using CSS conic-gradient. Update sidebar link.

**Tech Stack:** Next.js 16, Drizzle ORM, Tailwind CSS v4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/reports/page.tsx` | **Create** | Reports page with stats, charts, table |
| `src/components/layout/sidebar.tsx` | Modify | Change Reports link from `#` to `/reports` |
| `tests/e2e/reports.spec.ts` | **Create** | E2E test for reports page |

---

### Task 1: Create Reports page

**Files:**
- Create: `src/app/reports/page.tsx`

- [ ] **Step 1: Create the reports page**

```tsx
import { count } from "drizzle-orm";
import { db } from "@/db";
import { syllabi } from "@/db/schema";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LevelSummary } from "@/components/features/level-summary";
import { SyllabusList } from "@/components/features/syllabus-list";
import { StatCard } from "@/components/ui/stat-card";
import { deleteSyllabus } from "@/actions/syllabus";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "รายงานสรุป | CU Syllabus Manager",
};

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: "ปริญญาตรี",
  graduate: "ปริญญาโท",
  doctoral: "ปริญญาเอก",
};

const LEVEL_COLORS: Record<string, string> = {
  undergraduate: "#6750a4",
  graduate: "#2e7d32",
  doctoral: "#e65100",
};

export default async function ReportsPage() {
  const allSyllabi = await db.query.syllabi.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });

  const mapped = allSyllabi.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));

  const levelCounts = await db
    .select({
      level: syllabi.level,
      count: count(),
    })
    .from(syllabi)
    .groupBy(syllabi.level)
    .then((rows) =>
      rows.map((r) => ({
        level: r.level as "undergraduate" | "graduate" | "doctoral",
        count: r.count,
      }))
    );

  const total = levelCounts.reduce((sum, c) => sum + c.count, 0);

  // Build conic-gradient for pie chart
  let cumulativePercent = 0;
  const gradientParts = levelCounts.map(({ level, count }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += pct;
    const color = LEVEL_COLORS[level] || "#ccc";
    return `${color} ${start}% ${cumulativePercent}%`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-lg text-primary mb-1">
          รายงานสรุปสำหรับผู้บริหาร
        </h1>
        <p className="text-body-md text-on-surface-variant">
          ภาพรวมหลักสูตรทั้งหมดแยกตามระดับการศึกษา
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="วิชาทั้งหมด"
          value={total}
          tone="primary"
        />
        {levelCounts.map(({ level, count }) => (
          <StatCard
            key={level}
            label={LEVEL_LABELS[level] || level}
            value={count}
            tone="primary"
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart (reuse LevelSummary) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h2 className="text-headline-sm text-primary mb-4">
            สัดส่วนหลักสูตร (Bar Chart)
          </h2>
          <div className="space-y-3">
            {levelCounts.map(({ level, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-24 text-body-sm text-on-surface font-medium shrink-0">
                    {LEVEL_LABELS[level] || level}
                  </span>
                  <div className="flex-1 h-6 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: LEVEL_COLORS[level],
                      }}
                    />
                  </div>
                  <span className="w-16 text-body-sm text-on-surface-variant text-right shrink-0">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h2 className="text-headline-sm text-primary mb-4">
            สัดส่วนหลักสูตร (Pie Chart)
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-48 h-48 rounded-full shadow-lg"
              style={{ background: conicGradient }}
            />
            <div className="flex flex-wrap gap-4 justify-center">
              {levelCounts.map(({ level, count }) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LEVEL_COLORS[level] }}
                    />
                    <span className="text-body-sm text-on-surface">
                      {LEVEL_LABELS[level] || level} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="mb-8">
        <div className="bg-surface-container-lowest rounded-t-xl border border-outline-variant border-b-0 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-headline-sm text-primary">รายชื่อวิชาทั้งหมด</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="ค้นหารหัสวิชา หรือ ชื่อวิชา..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <div className="-mt-0">
          <SyllabusList syllabi={mapped} onDelete={deleteSyllabus} />
        </div>
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/app/reports/page.tsx
git commit -m "feat(reports): create executive reports page with charts and table"
```

---

### Task 2: Update sidebar link

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Change Reports link from `#` to `/reports`**

Edit the navItems array:
```typescript
const navItems = [
  { href: "/syllabi", label: "All Subjects", icon: "library_books" },
  { href: "/syllabi/new", label: "Create New Syllabus", icon: "add_box" },
  { href: "#", label: "Teaching Plans", icon: "calendar_today" },
  { href: "/reports", label: "Reports", icon: "assessment" },
];
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat(sidebar): link Reports to /reports page"
```

---

### Task 3: E2E test for reports page

**Files:**
- Create: `tests/e2e/reports.spec.ts`

- [ ] **Step 1: Create E2E test**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Reports Page", () => {
  test("displays report title and stat cards", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText("รายงานสรุปสำหรับผู้บริหาร")).toBeVisible();
    await expect(page.getByText("วิชาทั้งหมด")).toBeVisible();
  });

  test("shows level breakdown charts", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText("สัดส่วนหลักสูตร (Bar Chart)")).toBeVisible();
    await expect(page.getByText("สัดส่วนหลักสูตร (Pie Chart)")).toBeVisible();
  });

  test("shows syllabus table", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByText("รายชื่อวิชาทั้งหมด")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/reports.spec.ts
git commit -m "test(e2e): add reports page tests"
```
