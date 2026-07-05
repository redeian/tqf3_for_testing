# Development Process

> **For AI Agents and Humans:** This document defines the complete development lifecycle. The process has three independent stages, each with clear inputs and outputs. Each stage can be paused, resumed, or handed off independently.

## Overview

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   STAGE 1        │      │   STAGE 2        │      │   STAGE 3        │
│   DESIGN         │─────▶│  IMPLEMENTATION  │─────▶│  VERIFICATION    │
│                  │      │                  │      │                  │
│  Requirements    │      │  Code the system │      │  Test & deploy   │
│  Diagrams        │      │  Task by task    │      │  Verify & ship   │
│  Architecture    │      │  TDD + review    │      │  Health check     │
│                  │      │                  │      │                  │
│  Output:         │      │  Output:         │      │  Output:         │
│  Design Package  │      │  Working code    │      │  Live system     │
│  (versioned)     │      │  + tests         │      │  + deploy record │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                          │                         │
        │ Can be paused             │ Can be paused           │ Can be repeated
        │ and resumed               │ and resumed             │ (regression tests)
        ▼                          ▼                         ▼
   Independent              Independent               Independent
```

### Key Principle: Stage Independence

Each stage is **independent** — it can be:
- **Paused and resumed** later (all state is in files, not in memory)
- **Handed off** to a different person or AI agent
- **Repeated** without redoing previous stages (e.g., re-verify without re-coding)
- **Skipped backward** (e.g., fix a design issue found during implementation → go back to Stage 1 → produce new Design Package v1.1 → re-enter Stage 2)

The only connection between stages is the **artifact** passed from one to the next:
- Stage 1 → Stage 2: **Design Package** (versioned document set)
- Stage 2 → Stage 3: **Working code** + test results
- Stage 3 → Stage 1 (feedback loop): **User feedback** + bug reports

---

## STAGE 1: DESIGN

**Goal:** Understand what users need and document it as a complete, versioned design package. No code is written.

### What Happens

| Step | Who | Action | Output |
|------|-----|--------|--------|
| 1.1 | **You (Human)** | Interview users. Watch them work. Take detailed notes or record. | Raw interview notes |
| 1.2 | **You (Human)** | Give the AI agent your raw notes + any existing documents (paper forms, spreadsheets) | Notes handed to AI |
| 1.3 | **AI Agent** | Structure notes into a PRD following `docs/syllabus_system_prd.md` format | Draft PRD |
| 1.4 | **You (Human)** | Review the PRD. Does it match what users said? | Final PRD |
| 1.5 | **AI Agent** | Generate Use Case diagram (Mermaid) | `docs/diagrams/use-case.md` |
| 1.6 | **AI Agent** | Generate Activity diagrams — one per user process | `docs/diagrams/activity/*.md` |
| 1.7 | **AI Agent** | Generate Sequence diagrams — one per system action | `docs/diagrams/sequence/*.md` |
| 1.8 | **AI Agent** | Generate ER diagram (all tables + relationships) | `docs/diagrams/er.md` + `docs/database_schema.md` |
| 1.9 | **AI Agent** | Write Architecture overview | `docs/ARCHITECTURE.md` |
| 1.10 | **AI Agent** | Compile everything into the Design Package manifest | `docs/DESIGN_PACKAGE.md` |
| 1.11 | **You (Human)** | Take the **Activity Diagrams** to users. Ask: "Is this how you actually do it?" | Validated diagrams |
| 1.12 | **You (Human)** | If users say "no" → tell AI agent to fix → re-validate | Corrected diagrams |
| 1.13 | **You (Human)** | Complete the Design Package checklist. Set version number. Sign off. | Design Package v1.0.0 |

### Stage 1 Output

A **Design Package** — a versioned, self-contained document set:

```
docs/DESIGN_PACKAGE.md          ← Cover page with version + checklist
docs/syllabus_system_prd.md     ← What to build
docs/database_schema.md         ← Database structure
docs/diagrams/                  ← All visual flows (Mermaid)
docs/ui/DESIGN.md               ← Visual design system
docs/ui/code.html               ← UI mockup (reference)
docs/ARCHITECTURE.md            ← System architecture
```

### Stage 1 Rules

- **No code is written.** Zero. The output is documents only.
- **The AI agent cannot interview users.** Only you can do this.
- **Activity diagrams MUST be validated with real users** before the package is signed off.
- **The Design Package is versioned.** When requirements change, bump the version (1.0.0 → 1.1.0 for new features, → 2.0.0 for breaking changes).
- **All documents use relative cross-references.** No external paths.

### 🛑 Human Checkpoint: Stage 1 → Stage 2

> **Before starting Stage 2, verify:**
> - [ ] PRD reviewed and approved
> - [ ] All diagrams created
> - [ ] Activity diagrams validated with real users
> - [ ] ER diagram matches database schema
> - [ ] Design system defined
> - [ ] Architecture overview written
> - [ ] Design Package checklist complete
> - [ ] Version number set in `docs/DESIGN_PACKAGE.md`
>
> **Once signed off, this Design Package is the frozen input for Stage 2.**
> If something is wrong, fix it HERE — not during coding.

---

## STAGE 2: IMPLEMENTATION

**Goal:** Take the Design Package and build the system, task by task, with TDD and code review.

### Prerequisites

- Stage 1 is complete (Design Package signed off)
- `docs/DESIGN_PACKAGE.md` has a version number and all checklist items checked

### What Happens

#### Step 2.1: Create Implementation Plan

| Step | Who | Action | Output |
|------|-----|--------|--------|
| 2.1.1 | **AI Agent** | Read the entire Design Package + existing codebase | Understanding of what to build |
| 2.1.2 | **AI Agent** | Use Superpowers **writing-plans** skill to create implementation plan | `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` |
| 2.1.3 | **AI Agent** | Plan must include: exact file paths, complete code, TDD steps (RED→GREEN→REFACTOR→commit), verification commands | Detailed plan |
| 2.1.4 | **You (Human)** | Review the plan. Does it cover all features from the Design Package? No placeholders? | Plan approved |

#### Step 2.2: Execute the Plan (Task by Task)

For each task in the plan:

| Step | Who | Action | Output |
|------|-----|--------|--------|
| 2.2.1 | **AI Agent** | Dispatch implementer subagent (fresh context per task) | Code + tests written |
| 2.2.2 | **AI Agent** | Subagent follows strict TDD: write failing test → watch it fail → write minimal code → watch it pass → refactor → commit | TDD cycle complete |
| 2.2.3 | **AI Agent** | Dispatch spec reviewer subagent — does code match the plan? | Spec review result |
| 2.2.4 | **AI Agent** | Dispatch code quality reviewer subagent — is code clean? | Quality review result |
| 2.2.5 | **AI Agent** | Create execution record | `docs/superpowers/executions/<feature>/task-N-record.md` |
| 2.2.6 | **You (Human)** | Review the execution record. Check tests + CI. Sign off or request changes. | `docs/superpowers/verifications/<feature>/phase-2-task-N.md` |
| 2.2.7 | **AI Agent** | If approved → proceed to next task. If changes requested → fix → re-verify. | Next task or fixes |

#### Step 2.3: Finish Implementation

| Step | Who | Action | Output |
|------|-----|--------|--------|
| 2.3.1 | **AI Agent** | Use Superpowers **finishing-a-development-branch** skill | Branch ready for merge |
| 2.3.2 | **You (Human)** | Choose: Merge to main / Create PR / Keep branch / Discard | Decision made |
| 2.3.3 | **You (Human)** | Create final verification log | `docs/superpowers/verifications/<feature>/implementation-complete.md` |

### Stage 2 Output

```
docs/superpowers/plans/<feature>.md           ← The implementation plan
docs/superpowers/executions/<feature>/        ← Execution records (per task)
docs/superpowers/verifications/<feature>/     ← Human verification logs
src/                                          ← The actual code
tests/                                        ← Unit + E2E tests
drizzle/                                      ← Database migrations
```

### Stage 2 Rules

- **The AI agent reads the Design Package but does NOT modify it.** If a design issue is found, go back to Stage 1.
- **Every task follows TDD:** RED (failing test) → GREEN (minimal code) → REFACTOR → commit. No exceptions.
- **Every task gets two reviews:** spec compliance (does it match the plan?) + code quality (is it clean?).
- **Every task creates an execution record** in `docs/superpowers/executions/`.
- **Human verifies each task** (or batch) before the AI agent proceeds to the next.
- **Plans have no placeholders.** Every task contains complete code, exact commands, expected output.
- **Conventional commits only:** `feat(scope): description`

### 🛑 Human Checkpoint: Stage 2 → Stage 3

> **Before starting Stage 3, verify:**
> - [ ] All tasks in the plan are complete
> - [ ] All execution records created
> - [ ] All unit tests pass (`npm test`)
> - [ ] All E2E tests pass (`npm run test:e2e`)
> - [ ] Lint passes (`npm run lint`)
> - [ ] Type check passes (`npm run typecheck`)
> - [ ] Build succeeds (`npm run build`)
> - [ ] All human verification logs signed off
> - [ ] Code merged to main (or PR created)

---

## STAGE 3: VERIFICATION

**Goal:** Verify the implemented system matches the Design Package, then deploy to production.

### Prerequisites

- Stage 2 is complete (all tasks done, code merged, tests pass)

### What Happens

#### Step 3.1: Automated Verification

| Step | Who | Action | Pass Criteria |
|------|-----|--------|---------------|
| 3.1.1 | **CI/CD** | Run lint | 0 errors |
| 3.1.2 | **CI/CD** | Run type check | 0 errors |
| 3.1.3 | **CI/CD** | Run unit tests | 100% pass, 80%+ coverage |
| 3.1.4 | **CI/CD** | Run build | Exit 0 |
| 3.1.5 | **CI/CD** | Run E2E tests (Playwright, against production build) | 100% pass |
| 3.1.6 | **CI/CD** | Health check (if deploying) | GET /api/health → 200 |

#### Step 3.2: Manual Verification

| Step | Who | Action | Pass Criteria |
|------|-----|--------|---------------|
| 3.2.1 | **You (Human)** | Compare system against Design Package — does it match the PRD? | All features present |
| 3.2.2 | **You (Human)** | Compare UI against Design System — does it match `docs/ui/DESIGN.md`? | Visual compliance |
| 3.2.3 | **You (Human)** | Compare flows against Activity diagrams — does each flow work as designed? | All flows correct |
| 3.2.4 | **You (Human)** | Test error scenarios — does the system degrade gracefully? | No crashes, useful errors |
| 3.2.5 | **You (Human)** | Test auth — can unauthorized users access protected routes? | All routes protected |

#### Step 3.3: Deploy to Production

| Step | Who | Action | Output |
|------|-----|--------|--------|
| 3.3.1 | **You (Human)** | Set up VPS + Docker + Caddy (if first deploy — see `docs/DEPLOYMENT.md`) | Server configured |
| 3.3.2 | **You (Human)** | Set up GitHub Secrets (SSH, DB passwords, Auth secrets) | Secrets configured |
| 3.3.3 | **You (Human)** | Set up Google OAuth for production domain | OAuth configured |
| 3.3.4 | **You (Human)** | Merge to main (if not already merged) | Triggers CI/CD |
| 3.3.5 | **CI/CD** | GitHub Actions: lint → test → build → SSH deploy → health check | Auto-deploy |
| 3.3.6 | **You (Human)** | Verify production: visit URL, log in, create a test syllabus, export | Production works |
| 3.3.7 | **You (Human)** | Tag the release: `git tag -a v1.0.0 -m "Initial release"` | Version marker |
| 3.3.8 | **You (Human)** | Update CHANGELOG.md with release notes | Changelog updated |
| 3.3.9 | **You (Human)** | Create deployment verification log | `docs/superpowers/verifications/<feature>/deployment.md` |

### Stage 3 Output

```
Live production system
Deployment verification log
Git tag (v1.0.0)
CHANGELOG.md entry
```

### Stage 3 Rules

- **Automated tests run first.** If any fail, fix in Stage 2 — don't deploy broken code.
- **Manual verification checks against the Design Package** — not just "does it work" but "does it match what users asked for."
- **Health check must pass** after deployment. If it fails, rollback.
- **You decide when to deploy.** CI/CD automates the process, but you click "Merge."
- **Tag every release.** Git tags are permanent version markers.
- **Update CHANGELOG.md** with what changed in this release.

### 🛑 Human Checkpoint: Stage 3 → Feedback Loop

> **After deployment, verify:**
> - [ ] All automated tests pass in CI
> - [ ] All manual verification steps pass
> - [ ] Production URL accessible with HTTPS
> - [ ] Login works with Google OAuth
> - [ ] Can create, edit, export a syllabus
> - [ ] Health check returns 200
> - [ ] Git tag created
> - [ ] CHANGELOG.md updated
>
> **System is live. Now collect user feedback → feeds back to Stage 1.**

---

## The Feedback Loop

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    Stage 1          Stage 2          Stage 3                 │
│    DESIGN    ───▶  IMPLEMENT  ───▶  VERIFY  ───▶  LIVE      │
│      ▲                                              │         │
│      │                                              │         │
│      └───────────  USER FEEDBACK  ◀─────────────────┘         │
│                     & BUG REPORTS                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### When a New Requirement Comes In

```
1. User gives feedback ("I need to import existing Word docs")
   ↓
2. You interview the user (understand details) ← This is Stage 1 again
   ↓
3. You tell the AI agent:
   "New requirement: [description]
    User notes: [your notes]
    Priority: [must-have / nice-to-have]"
   ↓
4. AI agent updates the Design Package:
   a. Bumps version (1.0.0 → 1.1.0)
   b. Updates PRD (add feature)
   c. Creates new activity diagram
   d. Creates new sequence diagram
   e. Updates ER diagram if new table needed
   f. Updates Architecture if new component needed
   ↓
5. You validate new activity diagram with users ← Stage 1 checkpoint
   ↓
6. Stage 2: AI agent creates implementation plan for the new feature
   → Executes task by task with TDD + review
   ↓
7. Stage 3: Verify + deploy
   ↓
8. User tests → gives feedback → loop continues
```

### When a Bug Is Reported

```
1. User reports bug
   ↓
2. You create a GitHub Issue with reproduction steps
   ↓
3. You tell the AI agent:
   "Fix bug: Issue #X. Reproduction: [steps]"
   ↓
4. Stage 2 (implementation): AI agent:
   a. Writes a failing test that reproduces the bug (TDD RED)
   b. Fixes the code (TDD GREEN)
   c. Runs full test suite
   d. Updates CHANGELOG.md
   e. Creates PR
   ↓
5. Stage 3 (verification): You review → merge → CI/CD deploys
   ↓
6. Close the GitHub Issue
```

---

## Versioning

### Design Package Versions

| Change | Version Bump | Example |
|--------|-------------|---------|
| Initial design | 1.0.0 | First complete design package |
| New feature added | 1.0.0 → 1.1.0 | Add PDF export |
| Major scope change | 1.0.0 → 2.0.0 | Change from single-user to multi-tenant |
| Bug fix in design doc | 1.0.0 → 1.0.1 | Fix typo in ER diagram |

### Release Versions (Git Tags)

```
v1.0.0  →  v1.0.1  →  v1.1.0  →  v2.0.0
 │         │         │          │
 │         │         │          └── Breaking change (users need to relearn)
 │         │         └── New feature (backwards compatible)
 │         └── Bug fix (backwards compatible)
 └── First stable release
```

### Tracking

| Artifact | Location | Purpose |
|----------|----------|---------|
| Design Package version | `docs/DESIGN_PACKAGE.md` header | Which design the system implements |
| Implementation plans | `docs/superpowers/plans/` | What was planned |
| Execution records | `docs/superpowers/executions/` | What was done (audit trail) |
| Verification logs | `docs/superpowers/verifications/` | What humans approved |
| Git tags | `git tag -l` | Release markers |
| CHANGELOG.md | Root | Human-readable change history |
| Database migrations | `drizzle/` | Schema evolution |
| Document frontmatter | Each doc's YAML header | Per-document version tracking |

---

## Human Checkpoints Summary

| # | Stage | When | What You Must Do |
|---|-------|------|-----------------|
| HC-1 | Stage 1 | After user interview | Verify AI-generated PRD matches what users said |
| HC-2 | Stage 1 | After diagrams created | Validate Activity Diagrams with users |
| HC-3 | Stage 1 | Before signing off Design Package | Complete checklist, set version, sign off |
| HC-4 | Stage 2 | After plan created | Review implementation plan (no placeholders?) |
| HC-5 | Stage 2 | After each task/batch | Review execution record + tests + CI |
| HC-6 | Stage 2 | After all tasks done | Verify all tasks complete, all tests pass |
| HC-7 | Stage 3 | After automated tests | All CI checks green |
| HC-8 | Stage 3 | After manual verification | System matches Design Package |
| HC-9 | Stage 3 | After deployment | Production works, health check passes |
| HC-10 | Feedback | On new requirements | Talk to users before telling AI agent |

---

## AI Agent Rules Summary

### Stage 1 (Design) — AI Agent MUST:
1. Structure user interview notes into PRD
2. Create Mermaid diagrams (use case, activity, sequence, ER)
3. Write architecture overview
4. Compile Design Package manifest with version
5. **NOT write any code**
6. **NOT interview users** (human's job)

### Stage 2 (Implementation) — AI Agent MUST:
1. Read the Design Package (frozen input)
2. Create implementation plan with Superpowers writing-plans skill
3. Execute tasks with strict TDD (RED → GREEN → REFACTOR → commit)
4. Two-stage review per task (spec + quality)
5. Create execution records
6. **NOT modify the Design Package** (go back to Stage 1 if design is wrong)
7. **NOT proceed without human verification** of each task

### Stage 3 (Verification) — AI Agent MUST:
1. Run all automated tests
2. **NOT deploy directly** (CI/CD does that after human merges)
3. Assist with manual verification if asked
4. **NOT skip health checks**

### Cross-Stage Rules:
1. **Always read docs before working** — INDEX.md → DESIGN_PACKAGE.md → relevant stage docs
2. **Always use relative paths** in cross-references
3. **Always use conventional commits** — `feat(scope): description`
4. **Always create PRs** — never push directly to `main`
5. **Never delete** plan, execution, or verification files — they are the audit trail
6. **If blocked, stop and ask** — don't guess or skip steps