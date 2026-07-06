# Executive Level Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `level` field to syllabi and display course counts grouped by educational level on the dashboard.

**Architecture:** Add `level` column to existing `syllabi` table (Drizzle migration), update Zod validation + Server Actions, create a new `LevelSummary` component, and add a level dropdown to the syllabus form.

**Tech Stack:** Next.js 16, Drizzle ORM, MySQL 8.0, Zod, Tailwind CSS v4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/db/schema.ts` | Modify | Add `level` column to `syllabi` table |
| `src/lib/validations.ts` | Modify | Add `level` to `syllabusSchema` |
| `src/actions/syllabus.ts` | Modify | Include `level` in create/update Server Actions |
| `src/components/features/level-summary.tsx` | **Create** | Level stats cards + bar chart |
| `src/app/syllabi/page.tsx` | Modify | Add level summary section between stats and table |
| `src/components/features/syllabus-form.tsx` | Modify | Add level dropdown to create/edit form |
| `drizzle/` | Auto | New migration file (generated) |
| `tests/unit/validations.test.ts` | Modify | Test level validation |
| `tests/e2e/syllabus.spec.ts` | Modify | Test level in create flow + dashboard |

---

### Task 1: Add `level` column to database schema

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Add `level` field to syllabi table**

Edit `src/db/schema.ts` — add `level` after `courseName`:

```typescript
export const syllabi = mysqlTable("syllabi", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  courseName: varchar("course_name", { length: 200 }).notNull(),
  level: varchar("level", { length: 20 }).notNull().default("undergraduate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

- [ ] **Step 2: Generate migration**

Run: `npm run db:generate`
Expected: New migration file created in `drizzle/` directory

- [ ] **Step 3: Review migration SQL**

Read the generated migration file to verify it adds the `level` column with correct type and default.

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat(db): add level column to syllabi table"
```

---

### Task 2: Add `level` to Zod validation

**Files:**
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Write the failing test**

Edit `tests/unit/validations.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { syllabusSchema } from "@/lib/validations";

describe("syllabusSchema", () => {
  it("accepts valid level values", () => {
    const valid = syllabusSchema.parse({
      courseCode: "CS101",
      courseName: "Intro to CS",
      level: "undergraduate",
    });
    expect(valid.level).toBe("undergraduate");
  });

  it("accepts graduate level", () => {
    const valid = syllabusSchema.parse({
      courseCode: "CS501",
      courseName: "Advanced CS",
      level: "graduate",
    });
    expect(valid.level).toBe("graduate");
  });

  it("accepts doctoral level", () => {
    const valid = syllabusSchema.parse({
      courseCode: "CS701",
      courseName: "Doctoral Seminar",
      level: "doctoral",
    });
    expect(valid.level).toBe("doctoral");
  });

  it("rejects invalid level values", () => {
    expect(() =>
      syllabusSchema.parse({
        courseCode: "CS101",
        courseName: "Test",
        level: "invalid",
      })
    ).toThrow();
  });

  it("defaults to undergraduate when level is missing", () => {
    const valid = syllabusSchema.parse({
      courseCode: "CS101",
      courseName: "Test",
    });
    expect(valid.level).toBe("undergraduate");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest tests/unit/validations.test.ts -t "syllabusSchema" --reporter=verbose`
Expected: FAIL — `level` not in schema yet

- [ ] **Step 3: Add `level` to syllabusSchema**

Edit `src/lib/validations.ts`:

```typescript
export const syllabusSchema = z.object({
  courseCode: z.string().min(1).max(20),
  courseName: z.string().min(1).max(200),
  level: z.enum(["undergraduate", "graduate", "doctoral"]).default("undergraduate"),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest tests/unit/validations.test.ts -t "syllabusSchema" --reporter=verbose`
Expected: PASS — all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations.ts tests/unit/validations.test.ts
git commit -m "feat(validation): add level field to syllabus schema"
```

---

### Task 3: Update Server Actions to include `level`

**Files:**
- Modify: `src/actions/syllabus.ts`

- [ ] **Step 1: Read current Server Actions**

Read `src/actions/syllabus.ts` to understand current create/update structure.

- [ ] **Step 2: Update `createSyllabus` to include level**

Add `level` to the destructured input and Drizzle insert:

```typescript
export async function createSyllabus(
  prevState: ActionResult<Syllabus> | null,
  formData: FormData
): Promise<ActionResult<Syllabus>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    courseCode: formData.get("courseCode") as string,
    courseName: formData.get("courseName") as string,
    level: formData.get("level") as string,
  };

  const validated = syllabusSchema.safeParse(raw);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  try {
    const [syllabus] = await db
      .insert(syllabi)
      .values({
        courseCode: validated.data.courseCode,
        courseName: validated.data.courseName,
        level: validated.data.level,
        userId: session.user.id,
      })
      .$returningId();

    revalidatePath("/syllabi");
    return { success: true, data: { id: syllabus.id, ...validated.data } };
  } catch (e) {
    return { success: false, error: "Failed to create syllabus" };
  }
}
```

- [ ] **Step 3: Update `updateSyllabus` to include level**

Add `level` to the update payload similarly.

- [ ] **Step 4: Run existing tests to verify no regressions**

Run: `npm test`
Expected: All existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/actions/syllabus.ts
git commit -m "feat(actions): include level in create/update syllabus"
```

---

### Task 4: Create LevelSummary component

**Files:**
- Create: `src/components/features/level-summary.tsx`

- [ ] **Step 1: Create the LevelSummary component**

```tsx
type LevelCount = {
  level: "undergraduate" | "graduate" | "doctoral";
  count: number;
};

type LevelSummaryProps = {
  counts: LevelCount[];
};

const LEVEL_CONFIG = {
  undergraduate: { label: "ปริญญาตรี", color: "bg-secondary", barColor: "bg-secondary" },
  graduate: { label: "ปริญญาโท", color: "bg-[#2e7d32]", barColor: "bg-[#2e7d32]" },
  doctoral: { label: "ปริญญาเอก", color: "bg-[#e65100]", barColor: "bg-[#e65100]" },
} as const;

export function LevelSummary({ counts }: LevelSummaryProps) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mb-8">
      <h2 className="text-headline-sm text-primary mb-4">
        ภาพรวมหลักสูตรแยกตามระดับ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {counts.map(({ level, count }) => {
          const config = LEVEL_CONFIG[level];
          return (
            <div
              key={level}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5"
            >
              <p className="text-body-sm text-on-surface-variant mb-1">
                {config.label}
              </p>
              <p className="text-display-sm font-bold text-primary">
                {count}
              </p>
              <p className="text-body-sm text-on-surface-variant">วิชา</p>
            </div>
          );
        })}
      </div>
      {/* CSS Bar Chart */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
        <p className="text-body-sm text-on-surface-variant mb-3">
          สัดส่วนหลักสูตร
        </p>
        <div className="space-y-3">
          {counts.map(({ level, count }) => {
            const config = LEVEL_CONFIG[level];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="w-20 text-body-sm text-on-surface font-medium shrink-0">
                  {config.label}
                </span>
                <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-body-sm text-on-surface-variant text-right shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/level-summary.tsx
git commit -m "feat(ui): create LevelSummary component with bar chart"
```

---

### Task 5: Add LevelSummary to dashboard page

**Files:**
- Modify: `src/app/syllabi/page.tsx`

- [ ] **Step 1: Read current dashboard page**

Read `src/app/syllabi/page.tsx` to understand current layout.

- [ ] **Step 2: Add level query and LevelSummary component**

Import and add between the stats row and the table section:

```typescript
import { sql, count } from "drizzle-orm";
import { LevelSummary } from "@/components/features/level-summary";

// Inside the page component, after the stats grid:
const levelCounts = await db
  .select({
    level: syllabi.level,
    count: count(),
  })
  .from(syllabi)
  .groupBy(syllabi.level)
  .then((rows) =>
    rows.map((r) => ({ level: r.level as "undergraduate" | "graduate" | "doctoral", count: r.count }))
  );

// In the JSX, between stats grid and table:
<LevelSummary counts={levelCounts} />
```

- [ ] **Step 3: Run type check**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/app/syllabi/page.tsx
git commit -m "feat(dashboard): add level summary section to syllabus page"
```

---

### Task 6: Add level dropdown to syllabus form

**Files:**
- Modify: `src/components/features/syllabus-form.tsx`

- [ ] **Step 1: Read current form**

Read `src/components/features/syllabus-form.tsx` to understand current form structure.

- [ ] **Step 2: Add level dropdown**

Add a `<Select>` component for level after the course name field:

```tsx
<div className="space-y-2">
  <label htmlFor="level" className="text-label-md text-on-surface">
    ระดับการศึกษา
  </label>
  <select
    id="level"
    name="level"
    defaultValue="undergraduate"
    className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
  >
    <option value="undergraduate">ปริญญาตรี</option>
    <option value="graduate">ปริญญาโท</option>
    <option value="doctoral">ปริญญาเอก</option>
  </select>
</div>
```

- [ ] **Step 3: Run type check**

Run: `npm run typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/components/features/syllabus-form.tsx
git commit -m "feat(form): add level dropdown to syllabus create/edit form"
```

---

### Task 7: E2E test for level feature

**Files:**
- Modify: `tests/e2e/syllabus.spec.ts`

- [ ] **Step 1: Add E2E test for level selection**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Syllabus Level", () => {
  test("creates syllabus with undergraduate level and shows in dashboard", async ({ page }) => {
    await page.goto("/syllabi/new");

    await page.fill('[name="courseCode"]', "CS101");
    await page.fill('[name="courseName"]', "Test Course");
    await page.selectOption('[name="level"]', "undergraduate");
    await page.click('button[type="submit"]');

    await page.waitForURL("/syllabi");
    await expect(page.locator("text=ปริญญาตรี")).toBeVisible();
  });

  test("shows level counts on dashboard", async ({ page }) => {
    await page.goto("/syllabi");
    await expect(page.locator("text=ภาพรวมหลักสูตรแยกตามระดับ")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npm run test:e2e`
Expected: All E2E tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/syllabus.spec.ts
git commit -m "test(e2e): add level selection and dashboard display tests"
```

---

### Task 8: Apply migration to database

**Files:**
- Modify: (none — run command)

- [ ] **Step 1: Apply migration**

Run: `npm run db:migrate`
Expected: Migration applied successfully, `level` column added to `syllabi` table

- [ ] **Step 2: Verify migration**

Run: `npm run db:studio` (optional) to visually verify the column exists

- [ ] **Step 3: Commit**

```bash
git add drizzle/
git commit -m "chore(db): apply level column migration"
```
