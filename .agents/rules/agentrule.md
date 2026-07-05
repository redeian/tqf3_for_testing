---
trigger: always_on
---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 changes you MUST know:
- `middleware.ts` → `proxy.ts` (middleware is deprecated)
- Turbopack is the default bundler (no webpack config needed)
- `params` and `searchParams` are async (must `await` them)
- `cookies()`, `headers()` are async (must `await` them)
- `next lint` command removed — use `eslint` directly
- ESLint uses Flat Config format
- Caching is explicit (opt-in with `"use cache"` directive)
<!-- END:nextjs-agent-rules -->

---

# Project: Syllabus Management System (TQF 3 / มคอ.3)

## 📖 Three-Stage Development

This project uses a three-stage development process. Each stage is independent:

| Stage | What Happens | Code? | Key Docs |
|-------|------------|-------|----------|
| **1. Design** | Requirements, diagrams, architecture | ❌ No code | `docs/DESIGN_PACKAGE.md`, `docs/DEVELOPMENT_PROCESS.md` |
| **2. Implementation** | Plan + code with TDD + review | ✅ All code | `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/superpowers/README.md` |
| **3. Verification** | Test, verify, deploy | ❌ No new code | `docs/TESTING.md`, `docs/DEPLOYMENT.md`, `docs/ERROR_HANDLING.md` |

**Before starting work, identify which stage you're in and read the relevant docs.**

## 📖 Documentation (READ BEFORE CODING)

All technical documentation is stored in `docs/`. Start with the index:

| Priority | Document | When to Read |
|----------|----------|--------------|
| 1st | [`docs/INDEX.md`](docs/INDEX.md) | **Always first** — document manifest and three-stage overview |
| 2nd | [`docs/DESIGN_PACKAGE.md`](docs/DESIGN_PACKAGE.md) | **Stage 2 start** — the versioned design you're implementing |
| 3rd | [`docs/DEVELOPMENT_PROCESS.md`](docs/DEVELOPMENT_PROCESS.md) | **Always** — defines the three stages, human checkpoints, your rules |
| 4th | [`docs/superpowers/README.md`](docs/superpowers/README.md) | **Stage 2** — how Superpowers integrates, plan/execution/verification recording |
| 5th | [`docs/syllabus_system_prd.md`](docs/syllabus_system_prd.md) | Before planning any feature — product requirements |
| 6th | [`docs/diagrams/README.md`](docs/diagrams/README.md) | Before coding any feature — visual flows (use case, activity, sequence) |
| 7th | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Before writing any code — system architecture, data flow, patterns |
| 8th | [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md) | Before writing any code — conventions, templates, security checklist |
| 9th | [`docs/TESTING.md`](docs/TESTING.md) | Before writing tests — Vitest + Playwright patterns, coverage, validation |
| 10th | [`docs/ERROR_HANDLING.md`](docs/ERROR_HANDLING.md) | Before writing Server Actions/API routes — error handling, health checks |
| 11th | [`docs/database_schema.md`](docs/database_schema.md) | Before writing database code — table definitions, relationships |
| 12th | [`docs/ui/DESIGN.md`](docs/ui/DESIGN.md) | Before writing UI — colors, typography, spacing, components |
| 13th | [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) | Before running locally — environment setup |
| 14th | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Before deploying — Docker, CI/CD, server config |

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Database:** MySQL 8.0 (Dockerized)
- **ORM:** Drizzle ORM (type-safe, SQL-first, migration-based)
- **Auth:** Auth.js v5 + Google OAuth + Drizzle adapter
- **Validation:** Zod (all Server Action inputs)
- **Styling:** Tailwind CSS v4 (custom design tokens)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **CI/CD:** GitHub Actions (Free tier)
- **Deployment:** Docker on VPS + Caddy reverse proxy (HTTPS)

## 🔑 Key Rules for AI Agents

1. **Always read docs before coding** — INDEX.md → DEVELOPMENT_PROCESS.md → CODING_STANDARDS.md → ARCHITECTURE.md
2. **Always read the relevant diagrams** — activity diagram (user flow) + sequence diagram (technical flow)
3. **Use Superpowers skills** — follow the Superpowers workflow (brainstorming → planning → TDD → review). See `docs/superpowers/README.md`
4. **Always save plans** to `docs/superpowers/plans/` with date prefix
5. **Always create execution records** after each task in `docs/superpowers/executions/`
6. **Never use `any` types** — TypeScript strict mode is enforced
7. **Always validate inputs with Zod** — before any database write
8. **Always check `auth()` session** — before any Server Action mutation
9. **Use `proxy.ts`** not `middleware.ts` (Next.js 16)
10. **Use `db:generate`** not `db:push` — create reviewable migration files
11. **Use design tokens** from `docs/ui/DESIGN.md` — never hardcode colors
12. **Always write tests** — unit (Vitest) + E2E (Playwright) for every feature
13. **Follow TDD strictly** — RED (failing test) → GREEN (minimal code) → REFACTOR → commit
14. **Run tests before PR** — `npm test` and `npm run test:e2e`
15. **Follow testing patterns** — see `docs/TESTING.md` for all patterns and rules
16. **Handle errors properly** — see `docs/ERROR_HANDLING.md` — return ActionResult<T>, never throw to client, log with context
17. **Always create PRs** — never push directly to `main`
18. **Update docs when scope changes** — PRD, diagrams, CHANGELOG.md
19. **Use conventional commits** — `feat(scope): description`
20. **Wait at human checkpoints** — do not proceed without human verification — create verification logs in `docs/superpowers/verifications/`

## 📂 Project Structure

```
src/
├── app/           # Next.js App Router (pages, layouts, route groups)
├── components/    # React components (ui/ for design system, features/ for domain)
├── db/            # Drizzle ORM (schema.ts, index.ts, migrations/)
├── actions/       # Server Actions (mutations with Zod validation)
├── lib/           # Shared logic (auth.ts, validations.ts, utils.ts)
└── types/         # Shared TypeScript types
tests/             # Vitest unit tests + Playwright E2E tests
docs/              # All technical documentation
.github/workflows/ # GitHub Actions CI/CD
```

## 🚀 Quick Commands

```bash
npm run dev:all        # Start dev server + MySQL (first time + daily use)
npm run build          # Production build
npm test               # Run unit tests (Vitest)
npm run test:watch     # Run unit tests in watch mode (on every save)
npm run test:coverage  # Run unit tests with coverage report
npm run test:e2e       # Run E2E tests (Playwright, against production build)
npm run test:e2e:debug # Run E2E tests in debug mode (step through)
npm run test:all       # Run both unit + E2E tests
npm run typecheck      # TypeScript type check (no emit)
npm run lint           # Lint with ESLint
npm run db:generate    # Generate database migration from schema changes
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio (visual DB browser)
```