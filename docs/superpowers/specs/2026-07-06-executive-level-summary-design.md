# Executive Dashboard: Course Count by Level

**Date:** 2026-07-06
**Status:** Approved Design
**Author:** AI Agent (Brainstorming Session)

## Overview

Add a feature to display the number of courses (syllabi) grouped by educational level on the executive dashboard. This allows administrators and executives to quickly see the distribution of courses across undergraduate, graduate, and doctoral levels.

## Data Model Change

### Schema (`src/db/schema.ts`)

Add a `level` column to the `syllabi` table:

```typescript
export const syllabi = mysqlTable("syllabi", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  courseName: varchar("course_name", { length: 200 }).notNull(),
  level: varchar("level", { length: 20 }).notNull().default("undergraduate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

**Valid values:** `undergraduate`, `graduate`, `doctoral`

### Migration

- Run `npm run db:generate` to create migration file
- Review generated SQL
- Run `npm run db:migrate` to apply

## Validation (`src/lib/validations.ts`)

```typescript
export const syllabusSchema = z.object({
  courseCode: z.string().min(1).max(20),
  courseName: z.string().min(1).max(200),
  level: z.enum(["undergraduate", "graduate", "doctoral"]),
});
```

## UI Components

### Level Summary Section (`src/components/features/level-summary.tsx`)

New component displayed on `/syllabi` dashboard page, positioned between the existing stats row and the syllabus table.

**Layout:**
- Section title: "ภาพรวมหลักสูตรแยกตามระดับ"
- Row of 3 `StatCard` components showing count per level
- CSS-only bar chart showing relative proportions

**Data Query:**
```typescript
const levelCounts = await db
  .select({ level: syllabi.level, count: count() })
  .from(syllabi)
  .groupBy(syllabi.level);
```

### Form Changes (`src/components/features/syllabus-form.tsx`)

Add a `<Select>` dropdown for `level` in both create and edit forms:

| Value | Label |
|-------|-------|
| `undergraduate` | ปริญญาตรี |
| `graduate` | ปริญญาโท |
| `doctoral` | ปริญญาเอก |

### Server Actions (`src/actions/syllabus.ts`)

- `createSyllabus`: Add `level` to Zod schema and Drizzle insert
- `updateSyllabus`: Add `level` to Zod schema and Drizzle update

## Files Changed

| File | Change |
|------|--------|
| `src/db/schema.ts` | Add `level` column to `syllabi` table |
| `src/lib/validations.ts` | Add `level` to `syllabusSchema` |
| `src/actions/syllabus.ts` | Include `level` in create/update |
| `src/components/features/level-summary.tsx` | **New** — level stats component |
| `src/app/syllabi/page.tsx` | Add level summary section |
| `src/components/features/syllabus-form.tsx` | Add level dropdown |
| `drizzle/` | New migration file (generated) |

## Testing

- **Unit:** Zod schema validates all 3 levels + rejects invalid values
- **Unit:** Server Action creates syllabus with correct level
- **E2E:** Create syllabus → verify level appears in dashboard stats
