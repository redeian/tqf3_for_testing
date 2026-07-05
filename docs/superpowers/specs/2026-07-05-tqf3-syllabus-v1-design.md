# Design Spec: TQF3 Syllabus Management System (V1)

> **Status:** Approved  
> **Date:** 2026-07-05  
> **Scope:** Simplified V1 — no auth, shared workspace, core syllabus CRUD + Markdown export

---

## 1. Overview

A web-based application that lets teachers create, edit, and export TQF3 course syllabi. Each syllabus captures a course name, course code, and a 15-week plan where each week has a topic and an activity type. Teachers can export the completed syllabus as a Markdown (`.md`) file.

This is a simplified V1. Auth, instructor details, grading, policies, materials, and live preview are out of scope.

---

## 2. Scope

### In Scope
- Create, view, edit, delete syllabi (full CRUD)
- Course code + course name fields
- 15-week plan: each week has a topic (free text) and an activity type (dropdown)
- 7 predefined activity types (Lecture, Lab / Practical, Discussion, Self-study, Examination, Presentation, Project work)
- Export to `.md` file
- Database persistence (MySQL)
- Shared workspace — all syllabi visible to everyone, no user separation

### Out of Scope (V1)
- Authentication (Google OAuth, Auth.js, `proxy.ts` route protection)
- User/session/account database tables
- Instructor info, grading breakdown, learning objectives, materials, policies
- Live Markdown preview
- PDF/HTML export
- Role-based access control
- Collaborative editing
- AI-assisted generation

---

## 3. Architecture & Tech Stack

Keeps the existing scaffolded stack:

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Database:** MySQL 8.0 (Dockerized)
- **ORM:** Drizzle ORM (migration-based, `db:generate` not `db:push`)
- **Styling:** Tailwind CSS v4 (design tokens from `docs/ui/DESIGN.md`)
- **Validation:** Zod (all server action inputs)
- **Testing:** Vitest (unit) + Playwright (E2E)

### Patterns
- Server Components for data fetching (read)
- Server Actions for mutations (create/update/delete)
- `ActionResult<T>` return type for all server actions (never throw to client)
- Zod validation before any database write
- `revalidatePath()` after mutations to refresh cached pages
- All multi-table writes wrapped in Drizzle transactions

---

## 4. Database Schema

Two tables only — no auth tables.

### Table: `syllabi`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `course_code` | `varchar(20)` | e.g., "CS101" |
| `course_name` | `varchar(200)` | e.g., "Introduction to Programming" |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Auto-updated on modify |

### Table: `weekly_schedules`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key |
| `syllabus_id` | `uuid` | Foreign key → `syllabi.id` (cascade delete) |
| `week_number` | `int` | 1–15 |
| `topic` | `varchar(500)` | Week topic text |
| `activity_type` | `varchar(50)` | One of 7 predefined types |
| `sort_order` | `int` | Defaults to `week_number` |

### Design Decisions
- No `user_id` column — shared workspace, no auth
- `activity_type` stored as a string, validated by Zod against the 7 allowed values
- Weeks with no topic/activity are not inserted (blank weeks skipped)
- `sort_order` defaults to `week_number` for V1, exists for future flexibility
- Foreign key cascade delete ensures weekly_schedules are removed when a syllabus is deleted

---

## 5. Pages & Routes

All pages in a single route group, no auth protection.

### `/` (Landing page)
- Redirects to `/syllabi`

### `/syllabi` (Dashboard — list view)
- Server Component that fetches all syllabi
- Table/list: course code, course name, created date, action buttons (View, Edit, Delete)
- "Create New Syllabus" button at the top
- Delete uses a confirmation dialog before calling server action
- Empty state: friendly message + "Create your first syllabus" CTA

### `/syllabi/new` (Create form)
- Client Component form:
  - Course code (text input)
  - Course name (text input)
  - 15 week entries: week number (read-only label), topic (text input), activity type (dropdown)
- "Save" → calls `createSyllabus` server action → redirects to `/syllabi/[id]`
- "Cancel" → redirects back to `/syllabi`

### `/syllabi/[id]` (View & Edit)
- Server Component fetches syllabus + weekly schedule
- Read-only view by default
- "Edit" button toggles to edit mode inline (same page)
- "Export to Markdown" button → triggers `.md` file download
- "Delete" button → confirmation dialog → `deleteSyllabus` server action → redirect to `/syllabi`
- "Back to list" link
- Edit mode uses the same form layout as `/syllabi/new`, calls `updateSyllabus` on save

---

## 6. Server Actions & Validation

All server actions in `src/actions/syllabus.ts`, returning `ActionResult<T>`.

### Zod Schemas

```
ActivityType = "Lecture" | "Lab / Practical" | "Discussion" | "Self-study" | "Examination" | "Presentation" | "Project work"

WeeklyEntrySchema = {
  week_number: int (1-15),
  topic: string max 500 (optional — blank weeks allowed),
  activity_type: ActivityType (required if topic is filled; if topic is blank, both are skipped)
}

SyllabusSchema = {
  course_code: string min 1 max 20,
  course_name: string min 1 max 200,
  weeks: array of WeeklyEntrySchema, max 15 items
}
```

### Actions

| Action | Input | Returns | Notes |
|--------|-------|---------|-------|
| `createSyllabus` | `SyllabusSchema` | `ActionResult<{ id: string }>` | Inserts syllabus + non-blank weeks in a transaction |
| `updateSyllabus` | `{ id: string } & SyllabusSchema` | `ActionResult<void>` | Updates syllabus, deletes old weeks, inserts new non-blank weeks (transaction) |
| `deleteSyllabus` | `{ id: string }` | `ActionResult<void>` | Cascade deletes weekly_schedules, then syllabus (transaction) |
| `exportSyllabus` | `{ id: string }` | `ActionResult<string>` | Fetches data, calls `generateMarkdown()`, returns Markdown string |

### Key Patterns
- Zod validation before any DB write
- Weeks where both `topic` and `activity_type` are empty are filtered out before insert
- All multi-table writes wrapped in Drizzle transactions
- `revalidatePath("/syllabi")` after each mutation

---

## 7. Markdown Export

### How It Works
- "Export to Markdown" button on the view page triggers a client-side function
- Calls `exportSyllabus` server action → fetches data → calls `generateMarkdown()` → returns string
- Client creates `new Blob([markdown], { type: "text/markdown" })`, triggers download via `URL.createObjectURL`
- Filename: `[course_code]-syllabus.md` (e.g., `CS101-syllabus.md`)

### Export Format

```markdown
# CS101 - Introduction to Programming

## Course Information
- **Course Code:** CS101
- **Course Name:** Introduction to Programming

## Weekly Plan

### Week 1
- **Topic:** Introduction to the course
- **Activity:** Lecture

### Week 2
- **Topic:** Variables and data types
- **Activity:** Lab / Practical

### Week 15
- **Topic:** Final examination
- **Activity:** Examination
```

### Rules
- Heading uses available course code and/or name
- Blank weeks (no topic) are skipped entirely — no `### Week N` entry appears
- Activity type displayed as-is from the dropdown value
- `generateMarkdown(syllabus, weeks)` is a pure function in `src/lib/export.ts` — easy to unit test

---

## 8. Testing

### Unit Tests (Vitest)

| Test File | What It Covers |
|-----------|---------------|
| `validations.test.ts` | Zod schemas — valid input passes, invalid input (empty course code, bad activity type, week number out of range) fails with correct errors |
| `export.test.ts` | `generateMarkdown()` — correct format, blank weeks skipped, missing fields handled |
| `actions.test.ts` | Server actions with mocked DB — correct `ActionResult` shapes, transactions called correctly |

### E2E Tests (Playwright)

| Test | Flow |
|------|------|
| `create-syllabus.spec.ts` | `/syllabi` → "Create New" → fill form → save → redirected to view page → syllabus appears in list |
| `edit-syllabus.spec.ts` | View existing → "Edit" → modify fields → save → changes reflected |
| `delete-syllabus.spec.ts` | View existing → "Delete" → confirm → redirected to list → syllabus gone |
| `export-syllabus.spec.ts` | View existing → "Export" → verify `.md` file download triggered with correct filename |

### Test Data
- Reuse `tests/fixtures/syllabus.ts`, updated for the simplified schema

---

## 9. File Structure (New & Modified)

```
src/
├── app/
│   ├── page.tsx                    # Redirect to /syllabi (modified)
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Simple layout (no sidebar needed, or minimal)
│   │   └── syllabi/
│   │       ├── page.tsx            # List view
│   │       ├── new/
│   │       │   └── page.tsx        # Create form
│   │       └── [id]/
│   │           └── page.tsx        # View & edit
├── actions/
│   └── syllabus.ts                 # createSyllabus, updateSyllabus, deleteSyllabus, exportSyllabus
├── db/
│   ├── index.ts                    # Drizzle client (new)
│   ├── schema.ts                   # syllabi + weekly_schedules tables (new)
│   └── migrations/                 # Generated by drizzle-kit (new)
├── lib/
│   ├── types.ts                    # ActionResult<T> (existing)
│   ├── validations.ts              # Zod schemas (new)
│   └── export.ts                   # generateMarkdown() pure function (new)
└── components/
    ├── ui/
    │   ├── button.tsx              # Reusable button (new)
    │   ├── input.tsx               # Reusable text input (new)
    │   └── select.tsx              # Reusable dropdown (new)
    └── features/
        ├── syllabus-form.tsx       # Shared form for create & edit (new)
        ├── syllabus-list.tsx       # List component for dashboard (new)
        └── confirm-delete.tsx      # Delete confirmation dialog (new)
```