# Coding Standards & AI Agent Guidelines

> **For AI Agents:** Follow these rules strictly. They are the project's conventions and violating them will cause code review failures.

## 1. General Rules

### TypeScript
- **Strict mode is ON** — no `any` types, no `// @ts-ignore`
- **Use `type` for unions/intersections**, `interface` for object shapes
- **All function parameters and return types must be explicit** (no inferred returns on exported functions)
- **Use `satisfies` operator** instead of `as` where possible

### File Naming
- **Components**: `kebab-case.tsx` (e.g., `syllabus-form.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `format-date.ts`)
- **Server Actions**: `kebab-case.ts` (e.g., `syllabus.ts`)
- **Tests**: `*.test.ts` (unit) or `*.spec.ts` (E2E)
- **Types**: Inline in the file that defines them, or in `src/types/` for shared types

### Import Order
```typescript
// 1. React/Next.js imports
import { useState } from "react";
import { revalidatePath } from "next/cache";

// 2. Third-party imports
import { z } from "zod";
import { eq } from "drizzle-orm";

// 3. Internal imports (use @/ alias)
import { db } from "@/db";
import { syllabi } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// 4. Relative imports (only for co-located files)
import { helper } from "./helper";
```

## 2. Server Actions

### Rules
- Always start with `"use server"` directive
- Always validate input with Zod before any database operation
- Always check `auth()` session before any mutation
- Always return `ActionResult<T>` type (never throw to client)
- Always call `revalidatePath()` after successful mutations
- Never expose raw database errors to the client

### Template
```typescript
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

// 1. Define Zod schema
const ExampleSchema = z.object({
  field: z.string().min(1, "Field is required").max(200),
});

// 2. Define return type
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// 3. Implement action
export async function doSomething(
  input: z.infer<typeof ExampleSchema>
): Promise<ActionResult<{ id: string }>> {
  // 3a. Check auth
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // 3b. Validate input
  const validated = ExampleSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  // 3c. Database operation
  try {
    const [result] = await db.insert(someTable).values({
      ...validated.data,
      userId: session.user.id,
    }).$returningId();

    // 3d. Revalidate cache
    revalidatePath("/dashboard");

    return { success: true, data: { id: result.id } };
  } catch (error) {
    console.error("doSomething failed:", error);
    return { success: false, error: "Failed to save. Please try again." };
  }
}
```

## 3. Database (Drizzle ORM)

### Schema Rules
- All tables use **UUID primary keys** (not auto-increment integers)
- All tables have `createdAt` and `updatedAt` timestamps
- Use `varchar` with explicit length for string fields
- Use `text` for long-form content (descriptions, policies)
- Use `mysqlEnum` for status fields
- Define relationships with `relations()` for Drizzle query API

### Query Rules
- **Never use raw SQL** — always use Drizzle's query builder
- **Always filter by userId** in queries (data isolation per user)
- **Use transactions** for multi-table operations
- **Use `$returningId()`** after inserts to get the new ID

### Migration Rules
- Use `npm run db:generate` to create migration files (never edit migrations manually)
- Review generated SQL before applying
- Use `npm run db:migrate` to apply migrations
- Never use `db:push` in production

## 4. Validation (Zod)

### Rules
- **Every Server Action input** must have a Zod schema
- **Every form** must validate on the client using the same Zod schema
- Schemas live in `src/lib/validations.ts`
- Use descriptive error messages in Zod rules
- Reuse schemas — don't duplicate validation logic

### Schema Template
```typescript
import { z } from "zod";

export const createSyllabusSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required").max(200),
  courseCode: z.string().min(1, "Course code is required").max(20),
  term: z.string().min(1, "Term is required").max(50),
  creditHours: z.number().int().min(1).max(10),
  classLocation: z.string().max(200).optional(),
  schedule: z.string().max(500).optional(),
  courseDescription: z.string().max(5000).optional(),
  prerequisites: z.string().max(2000).optional(),
});

export type CreateSyllabusInput = z.infer<typeof createSyllabusSchema>;
```

## 5. Components

### Server Components (Default)
- No `"use client"` directive
- Can directly query the database
- Can call Server Actions
- Cannot use hooks (`useState`, `useEffect`, etc.)

### Client Components
- Must have `"use client"` directive at top
- Cannot directly query the database
- Call Server Actions via `useTransition` or form actions
- Keep client components small — push logic to server

### Design System Compliance
- All components must use the design tokens defined in `docs/ui/DESIGN.md`
- Use Tailwind CSS classes with custom tokens (e.g., `bg-primary`, `text-on-surface`)
- Refer to `docs/ui/code.html` for component patterns and layout structure
- Never hardcode colors — always use design tokens

## 6. Testing

### Unit Tests (Vitest)
- Test every Zod schema (valid input, invalid input, edge cases)
- Test every Server Action (success path, auth failure, validation failure)
- Mock the database in unit tests
- File naming: `*.test.ts`

### E2E Tests (Playwright)
- Test full user flows: login → create → edit → export
- Use a test database (separate from dev/prod)
- File naming: `*.spec.ts`
- Always clean up test data after each test

### CI Gate
- All tests must pass before merge to `main`
- AI agents must run `npm test` and `npm run test:e2e` before submitting PRs

## 7. Security Checklist (For AI Agents)

Before submitting any code, verify:

- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] No `console.log` with sensitive data
- [ ] All Server Actions check `auth()` session
- [ ] All inputs validated with Zod
- [ ] No raw SQL queries
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `any` types
- [ ] No disabled ESLint rules without justification comment

## 8. Git Conventions

### Branch Naming
- `feature/<description>` — new features
- `fix/<description>` — bug fixes
- `chore/<description>` — maintenance, deps, config
- `docs/<description>` — documentation only

### Commit Messages
```
<type>(<scope>): <description>

[optional body]
```
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
Scope: the area affected (e.g., `auth`, `syllabus`, `ui`, `db`)

Examples:
```
feat(syllabus): add create syllabus server action with Zod validation
fix(auth): redirect to login when session expires
chore(deps): update drizzle-orm to latest
docs(architecture): add deployment diagram
```

### PR Rules
- PR title follows commit message format
- PR description includes: what changed, why, how to test
- All CI checks must pass
- No direct commits to `main` (branch protection enabled)