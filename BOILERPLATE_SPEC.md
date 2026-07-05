# BOILERPLATE SPECIFICATION v1.0.0

> **For coding agents:** Read this entire document before doing anything. It defines the complete project structure, development process, documentation system, and quality standards. Implement everything in this spec when initializing a new project. The tech stack is specified per-project (in the PRD), but the structure, process, and standards defined here are fixed.

---

## TABLE OF CONTENTS

1. [Overview & Philosophy](#1-overview--philosophy)
2. [The Three-Stage Process](#2-the-three-stage-process)
3. [Documentation Structure](#3-documentation-structure)
4. [Design Package Specification](#4-design-package-specification)
5. [Implementation Recording System](#5-implementation-recording-system)
6. [Testing Requirements](#6-testing-requirements)
7. [Error Handling Requirements](#7-error-handling-requirements)
8. [Health Check Requirements](#8-health-check-requirements)
9. [Deployment Requirements](#9-deployment-requirements)
10. [Versioning System](#10-versioning-system)
11. [Human Checkpoints](#11-human-checkpoints)
12. [AI Agent Rules](#12-ai-agent-rules)
13. [Project Initialization Checklist](#13-project-initialization-checklist)
14. [File Structure Template](#14-file-structure-template)

---

## 1. OVERVIEW & PHILOSOPHY

### Purpose

This specification defines a **company-standard boilerplate** for all new web applications. It is designed for:

- **AI-agent-driven development** — AI agents write the code; humans review and verify
- **Production readiness** — Docker, HTTPS, health checks, error handling from day one
- **Small-to-medium scale** — up to ~100 concurrent users on a single server
- **Full auditability** — every decision, task, and verification is recorded

### Design Principles

1. **Self-contained** — all documentation, configuration, and code live in one Git repository. No external dependencies (no Notion links, no Google Drive docs, no Confluence).
2. **Three independent stages** — Design, Implementation, Verification. Each can be paused, resumed, or handed off independently.
3. **Human-gated** — AI agents write code and tests; humans review, validate with users, and approve deployments. AI never deploys directly.
4. **Evidence over claims** — tests must run and pass before any work is declared complete.
5. **Simplicity first** — monolithic architecture, single server, no microservices, no Kubernetes, no message queues.
6. **Tech-stack agnostic** — the process, documentation structure, and standards defined here apply regardless of the programming language. Only the specific code patterns change.

### Tech Stack Independence

The boilerplate defines the **structure and process**. The **technology** is specified per-project in the PRD. The agent must:

- Read the tech stack from the PRD (Section 5: Technology Stack)
- Use the appropriate frameworks, ORMs, test runners, and deployment tools for that stack
- Follow the same documentation structure, testing philosophy, error handling patterns, and deployment approach regardless of stack

| Concern | Stack-Specific | Stack-Agnostic (Defined Here) |
|---------|---------------|------------------------------|
| Framework | Next.js, Laravel, Django, Express, etc. | ✅ Defined in PRD |
| Language | TypeScript, PHP, Python, Go, etc. | ✅ Defined in PRD |
| Database | MySQL, PostgreSQL, SQLite, etc. | ✅ Defined in PRD |
| ORM | Drizzle, Eloquent, SQLAlchemy, etc. | ✅ Defined in PRD |
| Auth | Auth.js, Laravel Sanctum, Django Auth, etc. | ✅ Defined in PRD |
| Validation | Zod, Joi, Pydantic, etc. | ✅ Defined in PRD |
| Unit test runner | Vitest, Jest, PHPUnit, pytest, etc. | ✅ Defined in PRD |
| E2E test runner | Playwright, Cypress, etc. | ✅ Defined in PRD |
| Container | Docker | ❌ Always Docker |
| Reverse proxy | Caddy, Nginx, Traefik | ❌ Always Docker-based |
| CI/CD | GitHub Actions | ❌ Always GitHub Actions |
| **Documentation structure** | — | ❌ Always this spec |
| **Development process** | — | ❌ Always this spec |
| **Testing philosophy** | — | ❌ Always this spec |
| **Error handling patterns** | — | ❌ Always this spec |
| **Deployment approach** | — | ❌ Always this spec |
| **Versioning system** | — | ❌ Always this spec |

---

## 2. THE THREE-STAGE PROCESS

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   STAGE 1        │      │   STAGE 2        │      │   STAGE 3        │
│   DESIGN         │─────▶│  IMPLEMENTATION  │─────▶│  VERIFICATION    │
│                  │      │                  │      │                  │
│  Requirements    │      │  Code the system │      │  Test & deploy   │
│  Diagrams        │      │  Task by task    │      │  Verify & ship   │
│  Architecture    │      │  TDD + review    │      │  Health check    │
│                  │      │                  │      │                  │
│  Output:         │      │  Output:         │      │  Output:         │
│  Design Package  │      │  Working code    │      │  Live system     │
│  (versioned)     │      │  + tests         │      │  + deploy record │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                          │                         │
        ▼                          ▼                         ▼
   INDEPENDENT              INDEPENDENT               INDEPENDENT
   (pause/resume)           (pause/resume)            (repeat/retest)
        │                          │                         │
        └──────── USER FEEDBACK & BUG REPORTS ───────────────┘
                     (feeds back to Stage 1)
```

### Stage Independence

Each stage is **independent**:
- **Can be paused and resumed** — all state is in files, not in memory
- **Can be handed off** — each stage's input is a well-defined document set
- **Can be repeated** — Stage 3 can re-run tests without re-coding
- **Can go backward** — if Stage 2 finds a design issue → back to Stage 1 → new Design Package version → re-enter Stage 2

### Stage 1: Design

**Goal:** Understand what users need and document it as a complete, versioned design package.

| Rule | Description |
|------|-------------|
| Code written? | **NONE. Zero code.** |
| Who does what? | Human interviews users. AI agent structures notes into documents. Human validates with users. |
| Output? | Design Package (versioned document set — see Section 4) |
| Human checkpoint? | Activity diagrams validated with real users + Design Package checklist signed off |

### Stage 2: Implementation

**Goal:** Take the Design Package and build the system, task by task, with TDD and code review.

| Rule | Description |
|------|-------------|
| Code written? | **ALL code is written here.** |
| Who does what? | AI agent reads Design Package, creates implementation plan, codes with TDD. Human reviews each task. |
| Input? | Design Package (frozen, versioned — the agent does NOT modify it) |
| Output? | Working code + tests + execution records + verification logs |
| Human checkpoint? | Review each task's execution record + tests + CI status before proceeding |

### Stage 3: Verification

**Goal:** Verify the implemented system matches the Design Package, then deploy to production.

| Rule | Description |
|------|-------------|
| Code written? | **No new code.** Only testing and deploying. |
| Who does what? | CI/CD runs automated tests. Human verifies manually against Design Package. Human deploys. |
| Input? | Working code + test results + Design Package (to verify against) |
| Output? | Live production system + deployment record + git tag + CHANGELOG entry |
| Human checkpoint? | All CI green + manual verification passes + health check passes |

---

## 3. DOCUMENTATION STRUCTURE

### Required Documents

Every project must have these documents. The content is stack-agnostic; the agent adapts examples to the project's tech stack.

#### Root-Level Files

| File | Purpose | Who Creates It |
|------|---------|---------------|
| `AGENTS.md` | AI agent entry point. Contains: tech stack summary, three-stage overview, reading order, key rules, quick commands. | AI Agent (during init) |
| `CLAUDE.md` | Points to `AGENTS.md`. (Platform convention for Claude Code.) | AI Agent |
| `GUIDE.md` | Master guide for reproducing this structure. Human-readable. Contains: quick start, document structure, process summary, AI agent workflow, versioning, deployment. | AI Agent |
| `CHANGELOG.md` | All notable changes per version. Format: Keep a Changelog. | AI Agent (updated per release) |
| `.env.example` | Environment variable template. All keys with dummy values. Committed to Git. | AI Agent |
| `.gitignore` | Ignores: node_modules, .env* (except .env.example), build artifacts, .DS_Store, IDE files. Must include `!.env.example` exception. | AI Agent |

#### `docs/` Directory

```
docs/
├── INDEX.md                      # Document manifest + three-stage overview
├── DESIGN_PACKAGE.md             # ⭐ Versioned output of Stage 1 (see Section 4)
├── prd.md                        # Product Requirements Document
├── database_schema.md            # Database schema definition
├── ARCHITECTURE.md               # System architecture, data flow, patterns
├── CODING_STANDARDS.md           # Naming, patterns, security checklist
├── DEVELOPMENT_PROCESS.md        # Three-stage process definition
├── TESTING.md                    # Testing strategy (unit + E2E)
├── ERROR_HANDLING.md             # Error handling, fault tolerance, health checks
├── DEPLOYMENT.md                 # Docker, CI/CD, server setup
├── SETUP_GUIDE.md                # Local development setup
├── docker-compose.yml            # Dev environment config (database)
├── diagrams/                     # All Mermaid diagrams
│   ├── README.md                 # Diagram index + validation instructions
│   ├── use-case.md               # Actors + capabilities
│   ├── er.md                     # Entity-Relationship diagram
│   ├── activity/                 # One file per user flow
│   │   ├── <flow-1>.md
│   │   └── <flow-2>.md
│   └── sequence/                 # One file per system action
│       ├── <action-1>.md
│       └── <action-2>.md
├── ui/                           # Visual design (if UI exists)
│   ├── DESIGN.md                 # Design system (colors, typography, spacing)
│   ├── code.html                 # UI mockup (optional, reference only)
│   └── screen.png                # UI screenshot (optional)
└── superpowers/                  # Superpowers integration
    ├── README.md                 # Integration guide
    ├── plans/                    # Implementation plans (generated in Stage 2)
    ├── executions/               # Task execution records (audit trail)
    └── verifications/            # Human verification logs (sign-offs)
```

### Document Format Standards

1. **Frontmatter** — every document starts with YAML frontmatter:
   ```yaml
   ---
   version: 1.0.0
   last_updated: YYYY-MM-DD
   validated: ✅ | ❌
   ---
   ```

2. **Cross-references** — always use relative paths:
   - ✅ `[Database Schema](./database_schema.md)`
   - ✅ `[Architecture](../ARCHITECTURE.md)`
   - ❌ `[Database Schema](file:///Users/.../database_schema.md)`

3. **No external dependencies** — all docs must be fully readable within the repository. No links to external sites for critical information.

4. **Mermaid for diagrams** — all diagrams use Mermaid syntax (text-based, renders in GitHub/VS Code).

5. **Commit docs with code** — documentation changes go in the same PR as code changes.

---

## 4. DESIGN PACKAGE SPECIFICATION

The Design Package is the **versioned output of Stage 1** and the **frozen input for Stage 2**.

### File: `docs/DESIGN_PACKAGE.md`

```yaml
---
version: 1.0.0
last_updated: YYYY-MM-DD
status: draft | approved
---
```

### Required Sections

1. **Version History** — table of all versions with date, changes, and approver
2. **Contents** — links to all design documents:
   - PRD
   - All diagrams (use case, activity, sequence, ER)
   - Database schema
   - Design system (if UI exists)
   - Architecture overview
3. **Checklist** — must be complete before Stage 2:
   - [ ] PRD reviewed and approved by product owner
   - [ ] Use Case diagram created
   - [ ] All Activity diagrams created (one per user flow)
   - [ ] All Sequence diagrams created (one per system action)
   - [ ] ER diagram created
   - [ ] Database schema matches ER diagram
   - [ ] Design system defined (if UI exists)
   - [ ] UI mockup created (if UI exists)
   - [ ] Architecture overview written
   - [ ] Activity diagrams validated with real users
   - [ ] All cross-references correct
   - [ ] Version number set
4. **Stage Boundaries** — diagram showing the three stages and what passes between them

### Versioning Rules

| Change | Version Bump |
|--------|-------------|
| Initial design | 1.0.0 |
| New feature added | 1.0.0 → 1.1.0 (minor) |
| Major scope change | 1.0.0 → 2.0.0 (major) |
| Fix typo/error in design | 1.0.0 → 1.0.1 (patch) |

### When Requirements Change

1. Update relevant documents (PRD, diagrams, schema)
2. Bump Design Package version
3. Record change in Version History table
4. Validate new/changed Activity diagrams with users
5. Mark package as new input for Stage 2

---

## 5. IMPLEMENTATION RECORDING SYSTEM

### Directory Structure

```
docs/superpowers/
├── plans/                         # Implementation plans
│   └── YYYY-MM-DD-<feature>.md
├── executions/                    # Task execution records (audit trail)
│   └── YYYY-MM-DD-<feature>/
│       ├── task-01-record.md
│       └── task-02-record.md
└── verifications/                 # Human verification logs (sign-offs)
    └── YYYY-MM-DD-<feature>/
        ├── plan-review.md
        ├── phase-2-task-01.md
        └── implementation-complete.md
```

### Plan File Format

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** [One sentence]
**Architecture:** [2-3 sentences]
**Tech Stack:** [From PRD Section 5]
**Source Documents:**
- Design Package: `docs/DESIGN_PACKAGE.md`
- PRD: `docs/prd.md`
- Architecture: `docs/ARCHITECTURE.md`
- Coding Standards: `docs/CODING_STANDARDS.md`
- Testing: `docs/TESTING.md`
- Error Handling: `docs/ERROR_HANDLING.md`
- Relevant diagrams: `docs/diagrams/activity/<feature>.md`, `docs/diagrams/sequence/<feature>.md`
```

### Task Structure (in the plan)

Every task follows this exact structure:

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file`
- Modify: `exact/path/to/existing`
- Test: `tests/path/to/test`

- [ ] **Step 1: Write the failing test**
[Complete test code — no placeholders]

- [ ] **Step 2: Run test to verify it fails**
Run: `[exact command]`
Expected: FAIL with "[specific message]"

- [ ] **Step 3: Write minimal implementation**
[Complete implementation code — no placeholders]

- [ ] **Step 4: Run test to verify it passes**
Run: `[exact command]`
Expected: PASS

- [ ] **Step 5: Commit**
[Exact git commands with conventional commit message]
```

### Plan Rules

1. **No placeholders** — every step contains complete code. No "TBD", "add error handling", "similar to Task N".
2. **Bite-sized tasks** — each step is one action taking 2-5 minutes.
3. **TDD explicit** — RED (write failing test), GREEN (minimal code), REFACTOR, COMMIT — each is a separate step.
4. **Exact commands** — every verification step includes the exact command and expected output.
5. **File paths** — every task lists exact file paths to create/modify/test.

### Execution Record Format

After each task is implemented:

```markdown
# Task [N]: [Task Name] — Execution Record

**Date:** YYYY-MM-DD
**Plan:** docs/superpowers/plans/YYYY-MM-DD-<feature>.md
**Task:** Task N
**Status:** ✅ Complete / ❌ Blocked

## What Was Implemented
- Created: `path/to/file`
- Modified: `path/to/existing`
- Tests: `path/to/test`

## TDD Cycle
### RED — Failing Test
- Test: `test('should ...')`
- Command: `[exact command]`
- Result: FAIL — "[message]" ✅

### GREEN — Minimal Implementation
- Code written: [description]
- Command: `[exact command]`
- Result: PASS ✅

### REFACTOR
- Changes: [what was refactored]
- All tests still pass: ✅

## Code Review
### Stage 1: Spec Compliance
- Result: ✅ / ❌

### Stage 2: Code Quality
- Result: ✅ / ❌

## Commit
git commit -m "feat(scope): description"
SHA: [hash]

## Human Verification
- [ ] Human reviewed this task
- [ ] Tests pass locally
- [ ] Code matches the plan
- [ ] Ready to proceed

**Sign-off:** [name] on [date] — ✅ Approved / ❌ Changes requested
```

### Verification Log Format

After a human verifies:

```markdown
# Verification — [Feature Name] — [Phase/Task]

**Date:** YYYY-MM-DD
**Reviewer:** [Name]
**Stage:** Stage 2 — Task N

## What Was Reviewed
- [ ] Code matches the plan
- [ ] Tests test the right thing
- [ ] Error handling follows ERROR_HANDLING.md
- [ ] No secrets in code
- [ ] CI passes

## Result
✅ Approved — proceed to next task
❌ Changes requested — see issues below

## Issues (if any)
1. [Issue] — [file:line] — [severity]
```

---

## 6. TESTING REQUIREMENTS

### Two-Layer Testing Strategy

```
Layer 1: Unit Tests (fast, isolated)
  - Validation schemas (all valid/invalid cases)
  - Business logic / controller actions (mocked DB)
  - Utility functions
  - Components (if framework supports it)

Layer 2: E2E Tests (browser-driven)
  - Authentication flows
  - CRUD operations (create, read, update, delete)
  - Export/download functionality
  - Protected route verification
  - Error scenarios
```

### Stack-Specific Tool Selection

The agent must select the appropriate test tools for the project's stack:

| Concern | Tool Category | Examples |
|---------|--------------|----------|
| Unit testing | Test runner | Vitest, Jest, PHPUnit, pytest, Go testing |
| E2E testing | Browser automation | Playwright (preferred), Cypress |
| DOM environment | Test DOM | happy-dom, jsdom (JS only) |
| Coverage | Code coverage | v8, istanbul, coverage.py |

### Coverage Targets

| Layer | Target |
|-------|--------|
| Business logic / actions / controllers | 90% |
| Validation schemas | 100% (every field: valid + invalid case) |
| Utility functions | 80% |
| UI Components | 60% (interactions, not visual) |
| Pages / Routes | N/A (covered by E2E) |
| **Overall** | **80%** (enforced by coverage thresholds) |

### E2E Best Practices (Must Follow)

1. **Web-first assertions** — use auto-retrying assertions (e.g., `await expect(loc).toBeVisible()`)
2. **Role-based locators** — `getByRole`, `getByLabel` over CSS selectors
3. **No hard waits** — never use `waitForTimeout`; wait for conditions
4. **Test isolation** — each test creates its own data with unique identifiers
5. **Auth setup project** — authenticate once, reuse session state
6. **Trace on first retry** — capture debugging traces only when needed
7. **Run against production build** — not dev mode (different caching behavior)
8. **Mock third-party APIs** — don't depend on external services

### Unit Test Best Practices (Must Follow)

1. **Mock at the boundary** — mock DB and external services, not internal logic
2. **Test behavior, not implementation** — test what the user sees, not how it works
3. **Clear test names** — `it("rejects empty email")` not `it("test1")`
4. **Every action test covers**: auth check, validation, success path, error path
5. **`clearAllMocks()` between tests** — prevent state contamination
6. **Use `safeParse()` for schema tests** — returns result without throwing

### CI Pipeline

```
On push/PR:
  Job 1 (fast): lint → type-check → unit tests → build
  Job 2 (after Job 1): E2E tests (against production build)
  Both pass → PR is mergeable
```

---

## 7. ERROR HANDLING REQUIREMENTS

### Error Handling Layers

Every project must implement these layers (adapted to the framework):

| Layer | What It Does | Example Implementation |
|-------|-------------|----------------------|
| **1. Action/Controller layer** | Return typed results, never throw to client | `ActionResult<T>` type, try/catch, log + generic message |
| **2. Error boundaries / error pages** | Catch render errors, show fallback UI | Error boundary component, 404 page, 500 page |
| **3. Loading states** | Show skeleton/spinner during data fetch | Suspense fallback, loading component |
| **4. Structured logging** | JSON to stdout in production | Logger module with debug/info/warn/error levels |
| **5. Client-side error display** | Toast/inline error messages | Error toast component with retry option |

### Error Categories

| Error Type | User Message | Logged? | Action |
|-----------|-------------|---------|--------|
| Validation error | Specific field message (e.g., "Email is required") | ❌ No (expected) | Return field errors |
| Auth error | "Please sign in" | ⚠️ Warn (if frequent) | Redirect to login |
| Authorization error | "You don't have access" | ⚠️ Warn | Show access denied |
| Not found | "Not found" | ❌ No (expected) | Show 404 |
| Database error | "Something went wrong. Try again." | ✅ Error (full stack) | Show retry option |
| Rate limit | "Too many attempts. Wait." | ⚠️ Warn | Show cooldown |
| Unknown error | "Something went wrong. Try again." | ✅ Error (full stack) | Show retry option |

### Rules

1. **Never expose internal errors** to the user (e.g., "ECONNREFUSED 127.0.0.1:3306")
2. **Never log sensitive data** (passwords, tokens, session IDs)
3. **Never silently swallow errors** (catching without logging or returning)
4. **Always log with context** — user ID, action name, error message
5. **Always provide a retry option** for recoverable errors

### Fault Tolerance Patterns

| Pattern | When to Use |
|---------|------------|
| **Database retry with backoff** | Transient DB failures (connection timeout, temporary unavailability). Retry 3× with exponential backoff (500ms, 1s, 2s). Don't retry on expected errors (duplicate entry, access denied). |
| **Graceful degradation** | When a dependency is unavailable, show a useful fallback (e.g., "Unable to load data" + retry button) instead of a blank page or crash. |
| **Session expiry handling** | When session expires, redirect to login with return URL. Check on every protected request. |
| **Rate limiting** | On login and any public endpoint. 5 attempts per 15 minutes per identifier. |

---

## 8. HEALTH CHECK REQUIREMENTS

### Health Check Endpoint

Every project must implement a health check endpoint:

| Property | Value |
|----------|-------|
| Path | `/api/health` (or framework equivalent) |
| Method | GET |
| Auth required? | No (public) |
| HTTP 200 | All checks healthy |
| HTTP 503 | One or more checks unhealthy |

### Response Format

```json
{
  "status": "healthy | unhealthy",
  "timestamp": "ISO-8601",
  "version": "app version",
  "checks": {
    "database": { "status": "healthy", "latency": 12 },
    "application": { "status": "healthy" }
  }
}
```

### Required Checks

1. **Database connectivity** — ping/SELECT 1, with 5-second timeout
2. **Application responsiveness** — always healthy if endpoint responds

### When Health Checks Run

| Consumer | Frequency | Action on Failure |
|---------|-----------|-------------------|
| Docker | Every 30 seconds | 3 consecutive failures → restart container |
| Reverse proxy | Every 10 seconds | Return 502 to users |
| CI/CD | Once after deploy | Fail deployment → rollback |
| Optional cron | Every 1 minute | Alert if unhealthy > 1 minute |

### Docker Healthcheck (required in docker-compose.prod.yml)

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:<PORT>/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 9. DEPLOYMENT REQUIREMENTS

### Architecture

```
Internet → Reverse Proxy (HTTPS:443) → Application (:APP_PORT) → Database (:DB_PORT)
```

All services run on a single VPS via Docker Compose.

### Required Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: build stage → production stage (minimal image) |
| `docker-compose.prod.yml` | Production: app + database + reverse proxy |
| `docker-compose.yml` | Development: database only |
| `Caddyfile` (or Nginx config) | Reverse proxy with automatic HTTPS |
| `.env.example` | Environment variable template (committed) |
| `.env.production` | Production secrets (gitignored, never committed) |

### Docker Requirements

1. **Multi-stage build** — build dependencies don't ship to production
2. **`restart: always`** on all services
3. **Database healthcheck** — `mysqladmin ping` or equivalent
4. **App healthcheck** — `GET /api/health`
5. **Volume for database** — persistent data
6. **Non-root user** in production container (if framework supports it)

### Reverse Proxy Requirements

1. **Automatic HTTPS** — Let's Encrypt certificates (Caddy does this automatically)
2. **Security headers** — HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
3. **Gzip/zstd compression**
4. **Health check** — proxy won't route to app if it's down

### CI/CD Requirements (GitHub Actions)

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | Push/PR | lint → type-check → unit tests → build |
| `e2e.yml` (or in ci.yml) | After CI passes | Playwright E2E against production build |
| `deploy.yml` | Merge to main | SSH → pull → migrate → rebuild → restart → health check |

### GitHub Actions Free Tier

- **Private repos:** 2,000 minutes/month (Free plan)
- **Public repos:** Unlimited minutes
- **Self-hosted runners:** Free (optional, for on-premise servers)
- **Artifact storage:** 500 MB (Free plan)

### Post-Deploy Verification

1. `curl https://domain/api/health` → 200
2. Manual smoke test: login → create → edit → export
3. Monitor logs for 24 hours
4. If issues → create GitHub Issue → AI agent fixes → new PR → deploy

### Disaster Recovery

| Scenario | Recovery Steps |
|----------|---------------|
| App down | Check Docker logs → restart → rebuild → rollback to previous git tag |
| DB corrupted | Stop app → restore from backup → run migrations → restart → verify health |
| Need rollback | `git checkout <previous-tag>` → rebuild → restart → verify health |

---

## 10. VERSIONING SYSTEM

### Semantic Versioning

```
v1.0.0 → v1.0.1 → v1.1.0 → v2.0.0
 │       │        │         │
 │       │        │         └── Breaking change
 │       │        └── New feature
 │       └── Bug fix
 └── First stable release
```

### What Gets Versioned

| Artifact | Location | How |
|----------|----------|-----|
| Design Package | `docs/DESIGN_PACKAGE.md` header | Frontmatter version field |
| Releases | Git tags | `git tag -a v1.0.0 -m "message"` |
| Changes | `CHANGELOG.md` | Keep a Changelog format |
| Documents | Each doc's frontmatter | `version`, `last_updated`, `updated_by` |
| Database | Migration files | Numbered, sequential, never edited |

### CHANGELOG.md Format

```markdown
# Changelog

## [Unreleased]
### Added
- [feature description] (PR #N)

### Fixed
- [bug description] (PR #N)

## [1.0.0] - YYYY-MM-DD
### Added
- Initial release
- [feature list]
```

### Release Process

```bash
git checkout main && git pull
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
# Update CHANGELOG.md with release date
```

---

## 11. HUMAN CHECKPOINTS

These are non-negotiable. The AI agent must stop and wait at each.

| # | Stage | When | What Human Must Do |
|---|-------|------|-------------------|
| HC-1 | Stage 1 | After user interview | Verify AI-generated PRD matches what users said |
| HC-2 | Stage 1 | After diagrams created | Validate Activity Diagrams with real users |
| HC-3 | Stage 1 | Before signing off Design Package | Complete checklist, set version, sign off |
| HC-4 | Stage 2 | After plan created | Review implementation plan (no placeholders?) |
| HC-5 | Stage 2 | After each task/batch | Review execution record + tests + CI |
| HC-6 | Stage 2 | After all tasks done | Verify all tests pass, code merged |
| HC-7 | Stage 3 | After automated tests | All CI checks green |
| HC-8 | Stage 3 | After manual verification | System matches Design Package |
| HC-9 | Stage 3 | After deployment | Production works, health check passes |
| HC-10 | Feedback | On new requirements | Talk to users before telling AI agent |

---

## 12. AI AGENT RULES

### Stage 1 (Design) — AI Agent MUST:
1. Structure user interview notes into PRD
2. Create Mermaid diagrams (use case, activity, sequence, ER)
3. Write architecture overview
4. Compile Design Package manifest with version
5. **NOT write any code**
6. **NOT interview users** (human's job)

### Stage 2 (Implementation) — AI Agent MUST:
1. Read the Design Package (frozen input — do NOT modify it)
2. Create implementation plan with Superpowers writing-plans skill
3. Execute tasks with strict TDD (RED → GREEN → REFACTOR → commit)
4. Two-stage review per task (spec compliance + code quality)
5. Create execution records for each task
6. **NOT proceed without human verification** of each task
7. Use conventional commits: `feat(scope): description`
8. Always create PRs — never push directly to `main`

### Stage 3 (Verification) — AI Agent MUST:
1. Run all automated tests
2. **NOT deploy directly** (CI/CD does that after human merges)
3. Assist with manual verification if asked
4. **NOT skip health checks**

### Cross-Stage Rules:
1. **Always read docs before working** — INDEX.md → DESIGN_PACKAGE.md → relevant stage docs
2. **Always use relative paths** in cross-references
3. **Always use conventional commits**
4. **Always create PRs** — never push directly to `main`
5. **Never delete** plan, execution, or verification files — they are the audit trail
6. **If blocked, stop and ask** — don't guess or skip steps
7. **Never write code before a failing test** (TDD iron law)
8. **Never claim work is complete without running verification** (evidence over claims)

---

## 13. PROJECT INITIALIZATION CHECKLIST

When initializing a new project with this spec, the AI agent must:

### Step 1: Create Directory Structure
```bash
mkdir -p docs/diagrams/activity docs/diagrams/sequence docs/ui
mkdir -p docs/superpowers/plans docs/superpowers/executions docs/superpowers/verifications
mkdir -p tests/unit tests/e2e tests/fixtures tests/helpers
mkdir -p src/actions src/components src/lib src/db
```

### Step 2: Create Root Files
- [ ] `AGENTS.md` — adapted to project name and tech stack
- [ ] `CLAUDE.md` — points to `AGENTS.md`
- [ ] `GUIDE.md` — adapted to project
- [ ] `CHANGELOG.md` — initial template
- [ ] `.env.example` — all required env vars with dummy values
- [ ] `.gitignore` — with `!.env.example` exception

### Step 3: Create Documentation
- [ ] `docs/INDEX.md` — document manifest
- [ ] `docs/DESIGN_PACKAGE.md` — versioned design package template
- [ ] `docs/prd.md` — PRD (filled during Stage 1)
- [ ] `docs/database_schema.md` — schema (filled during Stage 1)
- [ ] `docs/ARCHITECTURE.md` — architecture (filled during Stage 1)
- [ ] `docs/CODING_STANDARDS.md` — adapted to tech stack
- [ ] `docs/DEVELOPMENT_PROCESS.md` — three-stage process
- [ ] `docs/TESTING.md` — testing strategy adapted to test tools
- [ ] `docs/ERROR_HANDLING.md` — error handling adapted to framework
- [ ] `docs/DEPLOYMENT.md` — deployment guide adapted to stack
- [ ] `docs/SETUP_GUIDE.md` — local setup adapted to stack
- [ ] `docs/diagrams/README.md` — diagram index

### Step 4: Create Infrastructure Files
- [ ] `Dockerfile` — multi-stage build
- [ ] `docker-compose.yml` — dev database
- [ ] `docker-compose.prod.yml` — production (app + DB + reverse proxy)
- [ ] `Caddyfile` (or Nginx config) — reverse proxy with HTTPS
- [ ] `.github/workflows/ci.yml` — CI pipeline
- [ ] `.github/workflows/deploy.yml` — deploy pipeline

### Step 5: Create Test Infrastructure
- [ ] Unit test config (vitest.config.ts / phpunit.xml / pytest.ini / etc.)
- [ ] E2E test config (playwright.config.ts / cypress.config.ts)
- [ ] Test setup file (global mocks, environment setup)
- [ ] Test fixtures (data factories)
- [ ] Test helpers (mock helpers)
- [ ] Example unit test (validates test runner works)
- [ ] Example E2E test (validates browser automation works)

### Step 6: Create Source Files (skeleton)
- [ ] Health check endpoint (`/api/health` or equivalent)
- [ ] Error boundary / error page (framework-specific)
- [ ] 404 page
- [ ] Loading state component
- [ ] Logger module
- [ ] Rate limiter module
- [ ] DB retry module
- [ ] Shared types (ActionResult or equivalent)

### Step 7: Verify
- [ ] Type check passes
- [ ] Unit test runs and passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] `.env.example` committed, `.env*` gitignored
- [ ] All cross-references in docs use relative paths
- [ ] No external file path references

---

## 14. FILE STRUCTURE TEMPLATE

```
project-root/
├── AGENTS.md                          # AI agent entry point
├── CLAUDE.md                          # Points to AGENTS.md
├── GUIDE.md                           # Master guide for reproducing this structure
├── CHANGELOG.md                       # All notable changes per version
├── .env.example                       # Environment variable template (committed)
├── .gitignore                         # With !.env.example exception
│
├── docs/                              # ALL technical documentation
│   ├── INDEX.md                       # Document manifest + three-stage overview
│   ├── DESIGN_PACKAGE.md              # ⭐ Versioned output of Stage 1
│   ├── prd.md                         # Product Requirements Document
│   ├── database_schema.md             # Database schema definition
│   ├── ARCHITECTURE.md                # System architecture, data flow, patterns
│   ├── CODING_STANDARDS.md            # Naming, patterns, security checklist
│   ├── DEVELOPMENT_PROCESS.md         # Three-stage process definition
│   ├── TESTING.md                     # Testing strategy (unit + E2E)
│   ├── ERROR_HANDLING.md              # Error handling, fault tolerance, health checks
│   ├── DEPLOYMENT.md                  # Docker, CI/CD, server setup
│   ├── SETUP_GUIDE.md                 # Local development setup
│   ├── docker-compose.yml             # Dev environment config
│   ├── diagrams/                      # All Mermaid diagrams
│   │   ├── README.md
│   │   ├── use-case.md
│   │   ├── er.md
│   │   ├── activity/                  # One per user flow
│   │   └── sequence/                  # One per system action
│   ├── ui/                            # Visual design (if UI exists)
│   │   ├── DESIGN.md
│   │   ├── code.html                  # Optional mockup
│   │   └── screen.png                 # Optional screenshot
│   └── superpowers/                   # Implementation recording system
│       ├── README.md
│       ├── plans/                     # Implementation plans
│       ├── executions/                # Task execution records (audit trail)
│       └── verifications/             # Human verification logs (sign-offs)
│
├── src/                               # Application source code
│   ├── (framework-specific structure)
│   └── lib/                           # Shared modules
│       ├── logger.*                   # Structured logger
│       ├── rate-limit.*               # Rate limiter
│       ├── db-retry.*                 # DB retry with backoff
│       └── types.*                    # ActionResult and shared types
│
├── tests/                             # All tests
│   ├── unit/                          # Unit tests (fast, isolated)
│   ├── e2e/                           # E2E tests (browser-driven)
│   ├── fixtures/                      # Test data factories
│   └── helpers/                       # Test utilities (mocks, helpers)
│
├── migrations/                        # Database migrations (if applicable)
│
├── .github/workflows/                 # GitHub Actions CI/CD
│   ├── ci.yml                         # lint + typecheck + unit tests + build
│   └── deploy.yml                     # SSH deploy on merge to main
│
├── Dockerfile                         # Multi-stage production build
├── docker-compose.yml                 # Dev environment
├── docker-compose.prod.yml            # Production environment
├── Caddyfile                          # Reverse proxy (HTTPS)
│
├── (framework-specific config files)
└── package.json / composer.json / requirements.txt / go.mod / etc.
```

---

## END OF SPECIFICATION

> **For coding agents:** When you receive this spec, follow Section 13 (Project Initialization Checklist) to set up the complete project structure. Then follow Section 2 (The Three-Stage Process) to begin development. The tech stack is specified in the project's PRD — adapt all code patterns, test tools, and deployment configs to that stack while keeping the structure, process, and standards defined here unchanged.