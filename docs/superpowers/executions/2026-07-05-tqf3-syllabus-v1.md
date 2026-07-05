# TQF3 Syllabus V1 Execution Record

**Date:** 2026-07-05
**Branch:** `feature/tqf3-v1`
**Worktree:** `.worktrees/feature-tqf3-v1`
**Approach:** Inline execution (subagent dispatch unavailable in harness)

## Scope
Implement the simplified V1 TQF3 syllabus management system defined in
[`docs/superpowers/plans/2026-07-05-tqf3-syllabus-v1.md`](../plans/2026-07-05-tqf3-syllabus-v1.md)
and
[`docs/superpowers/specs/2026-07-05-tqf3-syllabus-v1-design.md`](../specs/2026-07-05-tqf3-syllabus-v1-design.md).

Features:
- Create, view, edit, delete course syllabi
- 15 weekly topic/activity entries
- Predefined activity types (Lecture, Lab / Practical, Discussion, Self-study, Examination, Presentation, Project work)
- Markdown export
- Multi-page app: `/syllabi`, `/syllabi/new`, `/syllabi/[id]`
- No auth in V1; shared workspace

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Database schema + Drizzle config + migration | ✅ | a42ca3f |
| 2 | Validations (Zod) | ✅ | d3ac2f6, 4571b1e |
| 3 | Markdown export utility | ✅ | 456ef8d |
| 4 | Server actions (CRUD + export) | ✅ | 3f7fc68, 4571b1e |
| 5 | Design tokens + font | ✅ | 66a204e |
| 6 | Reusable UI components (Button, Input, Select) | ✅ | 115db81 |
| 7 | Syllabus form component | ✅ | 592a93d |
| 8 | Syllabus list + confirm delete dialog | ✅ | f66e905 |
| 9 | Dashboard page (`/syllabi`) | ✅ | 324bbad |
| 10 | Create syllabus page (`/syllabi/new`) | ✅ | 6460b04 |
| 11 | View/edit/export page (`/syllabi/[id]`) | ✅ | 0ceedb9 |
| 12 | Landing redirect | ✅ | 827755c |
| 13 | Unit tests + fixtures | ✅ | 3f7fc68, 456ef8d, d3ac2f6, 16b0cec, 4571b1e |
| 14 | E2E tests | ✅ | 4731bc6 |
| 15 | Final verification | ✅ | this record |

## Key Decisions & Fixes
- Used `timestamp` columns (not `datetime`) to support Drizzle `.defaultNow()` / `.onUpdateNow()`.
- Disabled `output: "standalone"` in `next.config.ts` so `next start` works for E2E; re-enable for Docker deployment.
- Added `turbopack.root: __dirname` to resolve multi-lockfile worktree build warnings.
- Configured Playwright `webServer` with `DATABASE_URL` env fallback.
- Added server-side validation for activity types in addition to Zod schema validation.
- Cleaned stale test data from MySQL and killed stale dev servers before E2E runs.

## Verification Results

```
npm run lint         ✅ pass
npm run typecheck    ✅ pass
npm test             ✅ 29 unit tests pass
npm run build        ✅ production build succeeds
npm run test:e2e     ✅ 4 E2E tests pass
```

## Notes
- E2E tests leave created syllabi in the local MySQL database. Acceptable for V1; CI will start with a fresh database.
- No auth/user separation per V1 scope.
- Standalone output disabled; deployment docs should be updated when Docker/standalone is configured.
