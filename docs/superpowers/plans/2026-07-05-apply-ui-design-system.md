# Apply UI Design System to V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the simplified V1 TQF3 syllabus app with the `docs/ui/DESIGN.md` design system, fixing functional and visual gaps.

**Architecture:** Apply the Academic Excellence Design System tokens (colors, typography, shadows, shapes, spacing) to the existing Next.js 16 + Tailwind CSS v4 app. Keep changes within V1 scope: no auth, no dashboard stats, no sidebar, no full PRD features.

**Tech Stack:** Next.js 16, Tailwind CSS v4, TypeScript, React, Be Vietnam Pro font.

**Key references:**
- `docs/ui/DESIGN.md` — design tokens and component guidelines
- `docs/ui/code.html` — full prototype (use only V1-relevant patterns)
- `docs/superpowers/specs/2026-07-05-tqf3-syllabus-v1-design.md` — V1 scope boundary

---

## File Structure

Files to modify:
- `src/app/globals.css` — add missing color tokens, shadow tokens, typography utilities
- `src/app/layout.tsx` — add Courier Prime font for code/markdown preview (optional)
- `src/components/ui/button.tsx` — align with design: primary deep blue, secondary outline, transitions, focus ring
- `src/components/ui/input.tsx` — align with design: white bg, outline-variant border, secondary focus glow
- `src/components/ui/select.tsx` — same as Input
- `src/components/features/syllabus-form.tsx` — use design card shadow for weekly rows, apply typography tokens
- `src/components/features/syllabus-list.tsx` — improve empty state and item card styling per design
- `src/components/features/view-syllabus.tsx` — **add weekly schedule display in view mode** (major gap)
- `src/app/syllabi/page.tsx` — apply headline typography tokens
- `src/app/syllabi/new/page.tsx` — apply headline typography tokens
- `src/app/syllabi/[id]/page.tsx` — pass weekly data correctly (no change likely needed)
- Tests as needed.

---

### Task 1: Extend design tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add missing CSS variables and Tailwind theme tokens**

Add to `:root`:
```css
--surface-tint: #455f88;
--inverse-surface: #2d3133;
--inverse-on-surface: #eef1f3;
--primary-fixed: #d6e3ff;
--primary-fixed-dim: #adc7f7;
--on-primary-fixed: #001b3c;
--on-primary-fixed-variant: #2d476f;
--secondary-fixed: #d2e4ff;
--secondary-fixed-dim: #9fcaff;
--on-secondary-fixed: #001d37;
--on-secondary-fixed-variant: #00497e;
--tertiary: #172328;
--on-tertiary: #ffffff;
--tertiary-container: #2c383d;
--on-tertiary-container: #94a1a8;
--tertiary-fixed: #d8e4eb;
--tertiary-fixed-dim: #bcc8cf;
--on-tertiary-fixed: #111d22;
--on-tertiary-fixed-variant: #3c494e;
--shadow-sm: 0 4px 12px rgba(26, 54, 93, 0.05);
--shadow-md: 0 8px 16px rgba(26, 54, 93, 0.08);
--shadow-lg: 0 12px 24px rgba(26, 54, 93, 0.1);
--font-mono: var(--font-courier-prime);
```

Map them in `@theme inline`:
```css
--color-surface-tint: var(--surface-tint);
--color-inverse-surface: var(--inverse-surface);
--color-inverse-on-surface: var(--inverse-on-surface);
--color-primary-fixed: var(--primary-fixed);
--color-primary-fixed-dim: var(--primary-fixed-dim);
--color-on-primary-fixed: var(--on-primary-fixed);
--color-on-primary-fixed-variant: var(--on-primary-fixed-variant);
--color-secondary-fixed: var(--secondary-fixed);
--color-secondary-fixed-dim: var(--secondary-fixed-dim);
--color-on-secondary-fixed: var(--on-secondary-fixed);
--color-on-secondary-fixed-variant: var(--on-secondary-fixed-variant);
--color-tertiary: var(--tertiary);
--color-on-tertiary: var(--on-tertiary);
--color-tertiary-container: var(--tertiary-container);
--color-on-tertiary-container: var(--on-tertiary-container);
--color-tertiary-fixed: var(--tertiary-fixed);
--color-tertiary-fixed-dim: var(--tertiary-fixed-dim);
--color-on-tertiary-fixed: var(--on-tertiary-fixed);
--color-on-tertiary-fixed-variant: var(--on-tertiary-fixed-variant);
--shadow-sm: var(--shadow-sm);
--shadow-md: var(--shadow-md);
--shadow-lg: var(--shadow-lg);
--font-mono: var(--font-courier-prime);
```

Add typography utility classes after `body`:
```css
.text-display-lg { font-size: 48px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
.text-headline-lg { font-size: 32px; line-height: 1.3; font-weight: 700; }
.text-headline-md { font-size: 24px; line-height: 1.4; font-weight: 600; }
.text-headline-sm { font-size: 20px; line-height: 1.4; font-weight: 600; }
.text-body-lg { font-size: 18px; line-height: 1.6; font-weight: 400; }
.text-body-md { font-size: 16px; line-height: 1.6; font-weight: 400; }
.text-body-sm { font-size: 14px; line-height: 1.5; font-weight: 400; }
.text-label-md { font-size: 14px; line-height: 1.2; font-weight: 600; letter-spacing: 0.05em; }
.text-code-sm { font-family: var(--font-mono), monospace; font-size: 14px; line-height: 1.5; font-weight: 400; }
```

- [ ] **Step 2: Verify CSS compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "design(tokens): add missing color, shadow, and typography tokens"
```

---

### Task 2: Add Courier Prime font in layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Load Courier Prime alongside Be Vietnam Pro**

```typescript
import { Be_Vietnam_Pro, Courier_Prime } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});
```

Apply both variables to `<html>`:
```html
<html lang="en" className={`${beVietnamPro.variable} ${courierPrime.variable} h-full antialiased`}>
```

- [ ] **Step 2: Verify build**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "design(fonts): add Courier Prime for code/markdown typography"
```

---

### Task 3: Refine Button component

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Apply design system styling**

Update `base` and `variants`:
```typescript
const base =
  "inline-flex items-center justify-center rounded-[0.5rem] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const variants = {
  primary:
    "bg-primary text-on-primary hover:bg-[#132945] shadow-sm hover:shadow-md",
  secondary:
    "bg-transparent text-secondary border border-secondary hover:bg-secondary-container/20",
  danger:
    "bg-error text-on-error hover:bg-[#93000a] shadow-sm hover:shadow-md",
  ghost: "bg-transparent text-on-surface hover:bg-surface-container",
};
```

- [ ] **Step 2: Verify tests pass**

Run: `npm run lint && npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "design(button): align button variants with design system"
```

---

### Task 4: Refine Input and Select components

**Files:**
- Modify: `src/components/ui/input.tsx`, `src/components/ui/select.tsx`

- [ ] **Step 1: Apply design input styling**

Common input/select classes:
```
rounded-[0.5rem] border border-outline-variant bg-surface px-3 py-2 text-base text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all duration-200
```

Update both components to use this exact class string. Labels use `text-label-md text-on-surface`.

- [ ] **Step 2: Verify build**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/input.tsx src/components/ui/select.tsx
git commit -m "design(inputs): apply design system border, focus glow, and label style"
```

---

### Task 5: Add weekly schedule display to ViewSyllabus

**Files:**
- Modify: `src/components/features/view-syllabus.tsx`

- [ ] **Step 1: Render weekly schedule table/card in view mode**

In the non-editing branch of `ViewSyllabus`, after the header and error banner, add a section that lists the weekly entries. Use `initialValues.weeks` (already passed in). Show only filled weeks first, then optionally show all 15 in a muted style.

Use the design system's card shadow and typography:
```tsx
<div className="mt-8 rounded-[1rem] bg-surface p-6 shadow-sm">
  <h2 className="text-headline-sm text-primary mb-4">Weekly Plan</h2>
  {filledWeeks.length === 0 ? (
    <p className="text-body-md text-on-surface-variant">No weekly topics have been added yet.</p>
  ) : (
    <div className="flex flex-col gap-4">
      {filledWeeks.map((week) => (
        <div
          key={week.weekNumber}
          className="grid grid-cols-12 gap-4 rounded-lg bg-surface-container-low p-4 border border-outline-variant"
        >
          <div className="col-span-12 md:col-span-2">
            <span className="text-label-md text-on-surface-variant">Week {week.weekNumber}</span>
          </div>
          <div className="col-span-12 md:col-span-6">
            <span className="text-body-md text-on-surface font-semibold">{week.topic}</span>
          </div>
          <div className="col-span-12 md:col-span-4">
            <span className="inline-flex items-center rounded-full bg-secondary-container/30 px-3 py-1 text-label-md text-on-secondary-container">
              {week.activityType}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 2: Add E2E assertion for weekly plan visibility**

In `tests/e2e/syllabus-crud.spec.ts`, in the create test, after redirect to detail page, assert that the weekly topic and activity type are visible.

- [ ] **Step 3: Run tests**

Run: `npm test && npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/view-syllabus.tsx tests/e2e/syllabus-crud.spec.ts
git commit -m "feat(view): display weekly plan on syllabus detail page"
```

---

### Task 6: Refine SyllabusForm weekly row cards

**Files:**
- Modify: `src/components/features/syllabus-form.tsx`

- [ ] **Step 1: Apply design card shadow and section title**

Change the weekly section title to `text-headline-sm text-primary`.
Change weekly row wrapper from `shadow-sm` to the design card shadow class (`shadow-sm` token now maps to `0 4px 12px rgba(26, 54, 93, 0.05)` after Task 1).

- [ ] **Step 2: Verify build**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/syllabus-form.tsx
git commit -m "design(form): apply design card shadow and headline tokens to weekly plan"
```

---

### Task 7: Refine SyllabusList styling

**Files:**
- Modify: `src/components/features/syllabus-list.tsx`

- [ ] **Step 1: Improve empty state and list item cards**

Empty state: use `shadow-sm` and rounded-xl.
List items: keep structure but apply design shadow, ensure metadata uses `text-body-sm`.

- [ ] **Step 2: Verify build**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/syllabus-list.tsx
git commit -m "design(list): apply design card shadow and typography to syllabus list"
```

---

### Task 8: Apply typography tokens to page headings

**Files:**
- Modify: `src/app/syllabi/page.tsx`, `src/app/syllabi/new/page.tsx`, `src/app/syllabi/[id]/page.tsx`

- [ ] **Step 1: Replace arbitrary Tailwind sizes with design tokens**

Use `text-headline-lg` for page titles, `text-body-md` for subtitles.

- [ ] **Step 2: Verify build**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/app/syllabi/page.tsx src/app/syllabi/new/page.tsx src/app/syllabi/[id]/page.tsx
git commit -m "design(pages): apply headline typography tokens to page headers"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full verification suite**

```bash
npm run lint
npm run typecheck
npm test
npm run build
DATABASE_URL="mysql://root:root@127.0.0.1:3306/syllabus_db" npm run test:e2e
```

Expected: all pass.

- [ ] **Step 2: Clean test artifacts**

```bash
rm -rf playwright-report test-results
```

- [ ] **Step 3: Write execution/verification records**

- Create `docs/superpowers/executions/2026-07-05-apply-ui-design-system.md`
- Create `docs/superpowers/verifications/2026-07-05-apply-ui-design-system.md`

- [ ] **Step 4: Commit records**

```bash
git add docs/superpowers/executions/2026-07-05-apply-ui-design-system.md docs/superpowers/verifications/2026-07-05-apply-ui-design-system.md
git commit -m "docs(superpowers): add design system execution and verification records"
```

---

## Spec Coverage Check

- Colors: Task 1 covers missing tokens.
- Typography: Tasks 1, 2, 5, 6, 7, 8 apply Be Vietnam Pro and Courier Prime tokens.
- Layout/spacing: existing container max-width remains; page padding updated to match token use.
- Elevation/shadows: Tasks 1, 3, 6, 7 apply design shadows.
- Buttons: Task 3.
- Input fields: Task 4.
- Cards: Tasks 5, 6, 7.
- Data tables: V1 uses card rows for weekly plan instead of a full table, matching simplified scope.
- Syllabus progress stepper: out of V1 scope.

## Placeholder Scan

All steps include concrete code/commands. No TBD, TODO, or vague instructions.

## Type Consistency

- `SyllabusInput.weeks` type unchanged; ViewSyllabus receives it as `initialValues`.
- New tokens added to `globals.css` via Tailwind v4 `@theme inline`.
- Courier Prime variable added to layout.
