# GUIDE.md — Company Standard Boilerplate Guide

> **This document is the master guide for reproducing this project structure and development process for any new application in your company.**

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start: Reproduce This Structure](#3-quick-start-reproduce-this-structure)
4. [Document Structure](#4-document-structure)
5. [The Development Process](#5-the-development-process)
6. [Working with AI Agents](#6-working-with-ai-agents)
7. [Versioning & Releases](#7-versioning--releases)
8. [Handling New Requirements](#8-handling-new-requirements)
9. [Deployment](#9-deployment)
10. [Checklist: Starting a New Project](#10-checklist-starting-a-new-project)

---

## 1. What This Is

This is the **standard boilerplate** for all new web applications in the company. It defines:

- **Technology stack** — Next.js 16, MySQL, Drizzle ORM, Auth.js v5, Zod, Tailwind CSS
- **Project structure** — folder layout, file naming, code patterns
- **Documentation system** — all technical docs stored in `docs/`, fully self-contained
- **Development process** — 6-phase lifecycle from user interview to production
- **AI agent workflow** — how AI agents write code, when humans review, what the guardrails are
- **Deployment pipeline** — Docker, GitHub Actions, Caddy, VPS

### Design Principles

1. **Self-contained** — all docs, config, and code live in one Git repository. No external dependencies.
2. **AI-agent friendly** — strict TypeScript, Zod validation, comprehensive tests, and clear documentation as safety nets.
3. **Human-gated** — AI agents code and test; humans review, validate with users, and approve deployments.
4. **Production-ready** — Docker, HTTPS, auth, security headers, CI/CD from day one.
5. **Simple** — monolithic architecture, single VPS. No microservices, no Kubernetes, no message queues.

---

## 2. Prerequisites

### For Humans

| Skill | Required? | Why |
|-------|-----------|-----|
| Can talk to users | ✅ Yes | You interview users and validate diagrams |
| Can read code reviews | ✅ Yes | You review AI-generated PRs |
| Can use Git (commit, branch, merge) | ✅ Yes | You manage the repository |
| Can write code | ❌ Optional | AI agents handle coding. You only review. |
| Can configure a server | ❌ Optional | AI agents + docs guide you. Copy-paste commands. |

### Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.9+ | JavaScript runtime |
| Docker + Docker Compose | Latest | Database (dev) + Full stack (prod) |
| Git | Latest | Version control |
| GitHub account | Free plan | Repository + CI/CD (2,000 free min/month) |
| A code editor | VS Code recommended | Reviewing PRs, reading code |
| An AI coding agent | Your choice | Writing code (Claude, Cursor, Copilot, etc.) |

### For a New Project

- A domain name (~$10/year)
- A VPS server (~$5-12/month: Hetzner, DigitalOcean, etc.)
- A Google Cloud Console account (free) — for OAuth

---

## 3. Quick Start: Reproduce This Structure

To create a new project with this boilerplate:

### Step 1: Scaffold Next.js

```bash
mkdir my-new-project && cd my-new-project
npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app-router --no-import-alias --use-npm
```

### Step 2: Install Dependencies

```bash
# Database
npm install drizzle-orm mysql2
npm install -D drizzle-kit tsx dotenv

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# Validation
npm install zod

# Testing
npm install -D vitest @playwright/test

# Dev utilities
npm install -D concurrently
```

### Step 3: Create the Documentation Structure

```bash
mkdir -p docs/diagrams/activity docs/diagrams/sequence docs/ui
mkdir -p docs/superpowers/plans docs/superpowers/executions docs/superpowers/verifications
```

Copy these files from this boilerplate and adapt them to your project:

```
docs/
├── INDEX.md                    # Document manifest (update project name, structure)
├── prd.md                      # Product Requirements Document (rewrite for your product)
├── database_schema.md          # Database schema (rewrite for your tables)
├── ARCHITECTURE.md             # System architecture (adapt patterns)
├── CODING_STANDARDS.md         # Coding conventions (keep as-is, adapt if needed)
├── SETUP_GUIDE.md              # Local setup guide (keep as-is)
├── DEPLOYMENT.md               # Deployment guide (keep as-is, change domain)
├── DEVELOPMENT_PROCESS.md      # Development process (keep as-is)
├── TESTING.md                  # Testing strategy (keep as-is)
├── ERROR_HANDLING.md           # Error handling, fault tolerance, health checks (keep as-is)
├── docker-compose.yml          # Dev MySQL config (keep as-is)
├── superpowers/                # Superpowers integration (keep as-is)
│   ├── README.md               # Integration guide
│   ├── plans/                  # Implementation plans (generated during dev)
│   ├── executions/             # Task execution records (audit trail)
│   └── verifications/          # Human verification logs (sign-offs)
├── diagrams/
│   ├── README.md               # Diagram index
│   ├── use-case.md             # Your use case diagram
│   ├── er.md                   # Your ER diagram
│   ├── activity/               # One file per user flow
│   └── sequence/               # One file per system action
└── ui/
    ├── DESIGN.md               # Your design system
    ├── code.html               # UI mockup (optional)
    └── screen.png              # UI screenshot (optional)
```

### Step 4: Create Root Files

```bash
# AI agent entry point (copy from this boilerplate, adapt project name/stack)
# AGENTS.md

# Changelog
# CHANGELOG.md

# Environment template
# .env.example

# Production Docker
# Dockerfile
# docker-compose.prod.yml
# Caddyfile
```

### Step 5: Create Config Files

```bash
# Drizzle config
# drizzle.config.ts

# Next.js config (enable standalone output)
# next.config.ts → add: output: "standalone"
```

### Step 6: Create CI/CD

```bash
mkdir -p .github/workflows
# ci.yml      → lint, type-check, test, build (runs on every push/PR)
# deploy.yml  → SSH deploy on merge to main
```

### Step 7: Initialize Database

```bash
cp docs/docker-compose.yml ./docker-compose.yml
docker-compose up -d
npm run db:generate
npm run db:migrate
```

### Step 8: Start Development

```bash
npm run dev:all
```

---

## 4. Document Structure

### Why All Docs Are in the Repository

```
Everything an AI agent or developer needs is in ONE place:
the Git repository.

No Google Drive links. No Notion pages. No Confluence spaces.
If it's not in the repo, it doesn't exist.
```

### Document Hierarchy

```
AGENTS.md (root)               ← AI agents read this FIRST
  └─ points to → docs/INDEX.md ← Document manifest
                    ├─ docs/prd.md              ← What to build
                    ├─ docs/ARCHITECTURE.md     ← How to build it
                    ├─ docs/CODING_STANDARDS.md  ← Rules to follow
                    ├─ docs/database_schema.md   ← Database structure
                    ├─ docs/diagrams/            ← Visual flows
                    │   ├─ use-case.md
                    │   ├─ er.md
                    │   ├─ activity/*.md
                    │   └─ sequence/*.md
                    ├─ docs/SETUP_GUIDE.md       ← How to run locally
                    ├─ docs/DEPLOYMENT.md        ← How to deploy
                    ├─ docs/DEVELOPMENT_PROCESS.md← How the team works
                    └─ docs/ui/                  ← Visual design
                        ├─ DESIGN.md
                        ├─ code.html
                        └─ screen.png
```

### Rules

1. **All docs live in `docs/`** — never store technical docs outside this folder
2. **Use relative paths** in cross-references (e.g., `./ARCHITECTURE.md`, not `file:///Users/...`)
3. **Keep docs in sync** — if you change the schema, update `database_schema.md` and `diagrams/er.md`
4. **Commit docs with code** — documentation changes go in the same PR as code changes
5. **No external dependencies** — docs must be fully self-contained within the repo
6. **Mermaid for diagrams** — text-based, renders in GitHub, AI agents can read and update them

---

## 5. The Development Process

The full process is defined in [`docs/DEVELOPMENT_PROCESS.md`](docs/DEVELOPMENT_PROCESS.md). The process has **three independent stages**:

```
Stage 1: DESIGN          → Output: Design Package (versioned documents)
  You interview users → AI agent creates PRD, diagrams, schema, architecture
  No code is written. Output is a complete, versioned document set.
  Human validates diagrams with real users.

Stage 2: IMPLEMENTATION  → Output: Working code + tests
  AI agent reads Design Package → creates implementation plan → codes with TDD
  Each task: RED (failing test) → GREEN (minimal code) → REFACTOR → commit
  Two-stage review per task (spec + quality)
  Human reviews each task before proceeding

Stage 3: VERIFICATION    → Output: Live system
  Automated: lint + typecheck + unit tests + build + E2E tests
  Manual: verify against Design Package, test error scenarios
  Deploy: CI/CD auto-deploys, health check, git tag, CHANGELOG
```

Each stage is **independent** — can be paused, resumed, or handed off.

### The Four Diagram Types (Stage 1)

| Diagram | Purpose | Validated With Users? |
|---------|---------|----------------------|
| Use Case | Who are the actors and what can they do? | ✅ Yes |
| Activity | Step-by-step flow of each user process | ✅ Yes (most important!) |
| Sequence | Technical: how system components interact | ❌ No (developer only) |
| ER | Database tables and relationships | ❌ No (developer only) |

### Human Checkpoints (Non-Negotiable)

| Checkpoint | Stage | What You Do |
|-----------|-------|------------|
| After user interview | 1 | Verify AI-generated PRD |
| After diagrams | 1 | Validate Activity Diagrams with users |
| Design Package sign-off | 1 | Complete checklist, set version |
| After plan created | 2 | Review implementation plan (no placeholders) |
| After each task | 2 | Review execution record + tests + CI |
| After all tasks | 2 | Verify all tests pass, code merged |
| After automated tests | 3 | All CI checks green |
| After manual verification | 3 | System matches Design Package |
| After deployment | 3 | Production works, health check passes |
| On new requirements | Feedback | Talk to users before telling AI |

---

## 6. Working with AI Agents

### What AI Agents Do

- ✅ Structure interview notes into PRDs
- ✅ Create Mermaid diagrams (use case, activity, sequence, ER)
- ✅ Write Drizzle schema and migrations
- ✅ Write Server Actions with Zod validation
- ✅ Write React components and pages
- ✅ Write unit tests (Vitest) and E2E tests (Playwright)
- ✅ Run tests and fix failures
- ✅ Create PRs with descriptions
- ✅ Update documentation when requirements change
- ✅ Maintain CHANGELOG.md

### What AI Agents Do NOT Do

- ❌ Interview users (that's your job)
- ❌ Validate diagrams with users (that's your job)
- ❌ Push directly to `main` (always go through PR)
- ❌ Deploy to production (CI/CD does that after you merge)
- ❌ Make product decisions (you decide what to build)

### How to Give Instructions to AI Agents

**Good instruction:**
> "Create the 'Create Syllabus' feature. Read docs/diagrams/activity/create-syllabus.md for the user flow and docs/diagrams/sequence/create-syllabus.md for the technical flow. Follow docs/CODING_STANDARDS.md. Write the Server Action, UI components, page, unit tests, and E2E tests. Create a PR."

**Bad instruction:**
> "Build a form to create syllabi"

**For new requirements:**
> "New requirement from user interview: [description]. Here are my notes: [paste notes]. Priority: [must-have/nice-to-have]. Update the PRD, create new activity and sequence diagrams, update the ER diagram if needed, then code it with tests. Create a PR."

### AI Agent Reading Order

When an AI agent starts working on this project, it should read in this order:

```
1. AGENTS.md              → Project overview, tech stack, rules
2. docs/INDEX.md          → Document manifest
3. docs/prd.md            → Product requirements
4. docs/ARCHITECTURE.md   → System architecture
5. docs/CODING_STANDARDS.md → Coding conventions
6. docs/diagrams/         → Relevant diagrams for the task
7. docs/database_schema.md → Database structure
8. docs/ui/DESIGN.md      → Visual design system
```

---

## 7. Versioning & Releases

### Semantic Versioning

```
v1.0.0  →  v1.0.1  →  v1.1.0  →  v2.0.0
 │         │         │          │
 │         │         │          └── Breaking change
 │         │         └── New feature
 │         └── Bug fix
 └── First release
```

### Release Process

```bash
git tag -a v1.1.0 -m "Add PDF export"
git push origin v1.1.0
```

### Tracking Changes

- **`CHANGELOG.md`** — Human-readable list of all changes per version
- **Git tags** — Permanent markers for each release
- **Git history** — Every change is a commit with a conventional message
- **Database migrations** — `drizzle/` folder tracks all schema changes
- **Document frontmatter** — Each doc has `version`, `last_updated`, `updated_by`

### Conventional Commits

```
feat(syllabus): add create syllabus server action with Zod validation
fix(auth): redirect to login when session expires
chore(deps): update drizzle-orm to latest
docs(architecture): add deployment diagram
test(syllabus): add E2E test for export flow
refactor(db): consolidate schema into single file
```

---

## 8. Handling New Requirements

### The Full Flow

```
1. User gives feedback
   ↓
2. You interview the user (understand details)
   ↓
3. You tell the AI agent:
   "New requirement: [description]
    User notes: [your notes]
    Priority: [must-have / nice-to-have]"
   ↓
4. AI agent updates everything in one PR:
   a. PRD (add feature)
   b. Activity diagram (new user flow)
   c. Sequence diagram (new system flow)
   d. ER diagram (if new table needed)
   e. Database schema + migration
   f. Code (Server Action + Components + Pages)
   g. Tests (unit + E2E)
   h. CHANGELOG.md
   ↓
5. You validate the activity diagram with users (if major feature)
   ↓
6. You review the PR
   ↓
7. You merge → CI/CD deploys automatically
   ↓
8. User tests → gives feedback → loop continues
```

### Bug Reports

```
1. User reports bug
   ↓
2. You create a GitHub Issue:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/device info
   ↓
3. You tell the AI agent:
   "Fix bug: Issue #X. Reproduction: [steps]"
   ↓
4. AI agent:
   a. Writes a failing test reproducing the bug
   b. Fixes the code
   c. Verifies test passes
   d. Runs full test suite
   e. Updates CHANGELOG.md
   f. Creates PR: "Fixes #X"
   ↓
5. You review → merge → deploy → close issue
```

---

## 9. Deployment

### Architecture

```
Internet → Caddy (HTTPS:443) → Next.js App (:3000) → MySQL (:3306)
```

All on a single VPS via Docker Compose. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the complete guide.

### Cost Estimate

| Item | Cost |
|------|------|
| VPS (Hetzner CX22) | ~$4.50/month |
| Domain name | ~$10/year |
| GitHub (Free plan) | $0 (2,000 Actions min/month) |
| Google OAuth | $0 |
| Caddy (HTTPS certs) | $0 (Let's Encrypt) |
| **Total** | **~$5.50/month** |

### CI/CD Flow

```
You merge PR to main
  → GitHub Actions: lint + type-check + unit tests + build
  → All pass? → SSH to server → git pull → db:migrate → docker build → restart
  → Any fail? → You get notified → AI agent fixes → new PR
```

---

## 10. Checklist: Starting a New Project

Use this checklist when creating a new application with this boilerplate:

### Setup Phase

- [ ] Scaffold Next.js 16 project
- [ ] Install all dependencies (Drizzle, Auth.js, Zod, Vitest, Playwright)
- [ ] Create `docs/` folder structure (copy from this boilerplate)
- [ ] Create `AGENTS.md` (adapt project name and description)
- [ ] Create `.env.example` (add all required env vars)
- [ ] Fix `.gitignore` (add `!.env.example` exception)
- [ ] Enable `output: "standalone"` in `next.config.ts`
- [ ] Create `drizzle.config.ts`
- [ ] Create `Dockerfile`, `docker-compose.prod.yml`, `Caddyfile`
- [ ] Create `.github/workflows/ci.yml` and `deploy.yml`
- [ ] Create `CHANGELOG.md`

### Discovery Phase

- [ ] Interview users (take detailed notes)
- [ ] Give notes to AI agent → generate PRD
- [ ] Review PRD — does it match what users said?

### Diagram Phase

- [ ] AI agent generates Use Case diagram
- [ ] AI agent generates Activity diagrams (one per user flow)
- [ ] AI agent generates Sequence diagrams (one per system action)
- [ ] AI agent generates ER diagram
- [ ] **Validate Activity Diagrams with users** ← critical
- [ ] Update diagrams based on user feedback

### Architecture Phase

- [ ] AI agent writes Drizzle schema (`src/db/schema.ts`)
- [ ] AI agent generates migration (`npm run db:generate`)
- [ ] AI agent sets up Auth.js (`src/lib/auth.ts`)
- [ ] AI agent sets up route protection (`src/proxy.ts`)
- [ ] AI agent writes Zod validation schemas
- [ ] **You review the schema and architecture**

### Coding Phase

- [ ] AI agent builds features in dependency order (auth → layout → CRUD → export)
- [ ] Each feature is a separate PR with tests
- [ ] **You review every PR before merging**

### Deployment Phase

- [ ] Set up VPS (Docker + Docker Compose)
- [ ] Point domain DNS to server IP
- [ ] Set up GitHub Secrets (SSH, DB passwords, Auth secrets)
- [ ] Set up Google OAuth for production domain
- [ ] Merge first release PR to `main`
- [ ] CI/CD deploys automatically
- [ ] **You test production manually**
- [ ] Tag release: `git tag -a v1.0.0 -m "Initial release"`
- [ ] Update CHANGELOG.md

### Ongoing

- [ ] Collect user feedback
- [ ] Create GitHub Issues for bugs/features
- [ ] AI agent handles each as a PR
- [ ] You review → merge → deploy
- [ ] Tag new versions as needed