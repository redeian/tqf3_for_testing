# Deployment Architecture Guide

> **Purpose:** Learn how deployment pipelines work — from local development to production — and how to choose the right setup for your project.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Local Development (Docker)](#2-local-development-docker)
3. [Production Server](#3-production-server)
4. [CI/CD Pipeline (GitHub Actions)](#4-cicd-pipeline-github-actions)
5. [Staging vs UAT vs Production](#5-staging-vs-uat-vs-production)
6. [How to Choose Your Setup](#6-how-to-choose-your-setup)
7. [Common Deployment Patterns](#7-common-deployment-patterns)
8. [Glossary](#8-glossary)

---

## 1. The Big Picture

A deployment pipeline moves your code from your laptop to real users. Here's the full journey:

```
Your Laptop
    │
    │  git push
    ▼
GitHub (source of truth)
    │
    │  GitHub Actions (CI/CD)
    ▼
Server (VPS) → Users
```

### Key concepts:

| Concept | What it is |
|---------|-----------|
| **Local** | Your machine. You write code, run tests, test with Docker |
| **CI** (Continuous Integration) | Automatically lint, type-check, test, and build your code on every push |
| **CD** (Continuous Deployment) | Automatically deploy to a server after CI passes |
| **Environment** | A named deployment target (production, staging, etc.) |
| **VPS** | Virtual Private Server — a rented machine in the cloud |

---

## 2. Local Development (Docker)

You can run the **exact same stack** locally using Docker. This is your first line of defense.

### What local Docker gives you:

```
Your Laptop
    │
    ├── Next.js app (:3000)
    ├── MySQL (:3306)
    └── Everything in containers
```

### What you can test locally:

| Test | How |
|------|-----|
| App starts | `docker compose up` |
| Database works | Create/read/update data |
| Auth flow | Google OAuth with `localhost` redirect |
| API endpoints | `curl localhost:3000/api/...` |
| UI | Open `http://localhost:3000` |
| Migrations | `npm run db:migrate` |

### What you CANNOT test locally:

| Test | Why not |
|------|---------|
| HTTPS | No real SSL cert for `localhost` |
| Real domain | `localhost` is not a real domain |
| Production traffic | No real users hitting it |
| Server environment | Different OS, kernel, resources |

### Local Docker command:

```bash
# Start everything
npm run dev:all

# Or manually:
docker compose up -d
npm run dev
```

---

## 3. Production Server

A VPS (Virtual Private Server) is a machine you rent in the cloud. It runs 24/7 and serves real users.

### Typical VPS setup:

```
Internet
    │
    ▼
┌──────────┐
│  Caddy   │  ← HTTPS reverse proxy (port 443)
│  (proxy) │     Auto SSL certs via Let's Encrypt
└────┬─────┘
     │
     ▼
┌──────────┐
│  Next.js │  ← Your app (port 3000)
│  (app)   │
└────┬─────┘
     │
     ▼
┌──────────┐
│  MySQL   │  ← Database (port 3306)
│  (db)    │
└──────────┘
```

### Why Docker on the server?

- **Same environment** as your local machine — no "it works on my machine" problems
- **Isolated** — each service in its own container
- **Easy restart** — `docker compose up -d --build`
- **Easy rollback** — rebuild with an older commit

### Popular VPS providers:

| Provider | Cheapest | Notes |
|----------|----------|-------|
| Hetzner | ~€4/month | Best value |
| DigitalOcean | $6/month | Easy to use |
| Linode | $5/month | Good docs |
| AWS EC2 | Free tier (1 year) | Complex |

---

## 4. CI/CD Pipeline (GitHub Actions)

GitHub Actions runs automated tasks when you push code. It's like having a robot assistant that checks your work and deploys it.

### The pipeline flow:

```
You: git push
    │
    ▼
┌─────────────────────┐
│  CI (ci.yml)        │
│                     │
│  1. Lint code       │  ← Check code style
│  2. Type check      │  ← Check TypeScript types
│  3. Run tests       │  ← Run unit tests
│  4. Build app       │  ← Try to build
│                     │
│  If any fails → ❌  │  ← You get a red X, fix and push again
└─────────┬───────────┘
          │ (all pass ✅)
          ▼
┌─────────────────────┐
│  CD (deploy.yml)    │
│                     │
│  1. SSH into server │  ← Connect to your VPS
│  2. git pull        │  ← Get latest code
│  3. Run migrations  │  ← Update database
│  4. Rebuild Docker  │  ← Build new containers
│  5. Restart         │  ← Start serving new version
│  6. Health check    │  ← Verify it's working
│                     │
│  If any fails → ❌  │  ← Server stays on old version
└─────────────────────┘
```

### What happens when CI fails:

- The deploy **never runs** — your server stays on the old, working version
- You get a notification (email/ Slack)
- You fix the issue and push again

### What happens when deploy fails:

- The server keeps running the **previous version** — users aren't affected
- You SSH in and check logs to debug

### GitHub Secrets:

Secrets are encrypted values stored in your repo settings. The CI/CD pipeline uses them but never shows them in logs.

```
GitHub Secrets (encrypted)
    │
    ├── SSH_HOST      →  "123.123.123.123"  (your server IP)
    ├── SSH_USER      →  "root"             (SSH username)
    ├── SSH_KEY       →  "-----BEGIN..."     (private key)
    ├── DB_PASSWORD   →  "s3cret!"          (database password)
    └── DOMAIN        →  "myapp.com"        (your domain)
```

---

## 5. Staging vs UAT vs Production

These are different **environments** — separate servers (or configurations) for different purposes.

### The full pipeline:

```
Local → Staging → UAT → Production
  │        │       │        │
  │     Auto-    Manual    Manual
  │     deploy   test      approval
  │     on push  & sign-off needed
  │
  ▼
You code here
```

### Environment comparison:

| Aspect | Local | Staging | UAT | Production |
|--------|-------|---------|-----|------------|
| **Who uses it** | You | You + devs | Stakeholders (teachers, admins) | Real users |
| **Purpose** | Write & test code | Verify integration | User acceptance testing | Serve real traffic |
| **Deploy trigger** | Manual (`docker compose up`) | Auto on push | Manual (from staging) | Manual approval |
| **Data** | Test data | Copy of production (or test) | Copy of production | Real user data |
| **Domain** | `localhost` | `staging.myapp.com` | `uat.myapp.com` | `myapp.com` |
| **HTTPS** | ❌ | ✅ | ✅ | ✅ |
| **Cost** | Free | ~$4-12/month | ~$4-12/month | ~$4-12/month |
| **Is it needed?** | ✅ Always | ✅ Recommended | ❌ Optional | ✅ Always |

### Staging (recommended for most projects)

A staging server is a **copy of production** where you test before going live.

**Why you want it:**
- Catches environment-specific bugs (different OS, missing system deps)
- Tests HTTPS, OAuth redirects, and domain config
- Safe place to test database migrations
- You can break it without affecting users

**When you can skip it:**
- Solo project with tolerant users
- You test thoroughly with local Docker
- You can quickly rollback if something breaks

### UAT (User Acceptance Testing)

A UAT server is for **non-technical people** to test and approve changes.

**Why you want it:**
- Stakeholders (teachers, admins) can test without knowing technical details
- Formal sign-off gate before production
- They can play with real-looking data

**When you can skip it:**
- No non-technical stakeholders
- You are the only decision-maker
- Small project, fast iteration

---

## 6. How to Choose Your Setup

### Decision tree:

```
Are you the only developer?
    │
    ├── Yes ──→ Are users tolerant of occasional bugs?
    │              │
    │              ├── Yes ──→ Local + Production only ✅
    │              │           (what you have now)
    │              │
    │              └── No ───→ Local + Staging + Production
    │
    ├── No (team of 2-5) ──→ Local + Staging + Production
    │
    └── No (team + external stakeholders)
                 ──→ Local + Staging + UAT + Production
```

### Cost comparison:

| Setup | VPS count | Monthly cost |
|-------|-----------|-------------|
| Production only | 1 | ~$4-12 |
| Staging + Production | 2 | ~$8-24 |
| Staging + UAT + Production | 3 | ~$12-36 |

### Our current setup:

```
Local (Docker) → CI (GitHub Actions) → Production (1 VPS)
```

This is the **simplest possible** production setup. It works well for a solo project.

---

## 7. Common Deployment Patterns

### Pattern 1: Production Only (current)

```
Push → CI → Deploy to Production
```

- **Pros:** Simple, cheap, fast
- **Cons:** No safety net before production
- **Best for:** Solo projects, prototypes, internal tools

### Pattern 2: Staging + Production

```
Push → CI → Deploy to Staging → Manual Approve → Deploy to Production
```

- **Pros:** Safety net, test in production-like environment
- **Cons:** Extra VPS cost, more maintenance
- **Best for:** Small teams, client projects

### Pattern 3: Full Pipeline

```
Push → CI → Deploy to Staging → Deploy to UAT → Approve → Production
```

- **Pros:** Maximum safety, formal sign-off process
- **Cons:** 3 VPS, complex, slow deployment
- **Best for:** Enterprise, regulated industries, large teams

### Pattern 4: Preview Deployments (advanced)

```
Push → CI → Create temporary URL for this branch → Test → Merge → Deploy
```

- **Pros:** Test every branch in isolation
- **Cons:** Complex setup, costs more
- **Best for:** Teams that need to review UI changes
- **Tools:** Vercel Preview Deployments, Render, Railway

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **VPS** | Virtual Private Server — a rented server in the cloud |
| **CI** | Continuous Integration — automatically test code on every push |
| **CD** | Continuous Deployment — automatically deploy code after tests pass |
| **Environment** | A named deployment target (production, staging, etc.) |
| **Staging** | A production-like environment for testing before release |
| **UAT** | User Acceptance Testing — stakeholders test and approve changes |
| **Production** | The live environment serving real users |
| **Docker** | Container technology that packages your app with its dependencies |
| **Docker Compose** | Tool to run multiple containers together (app + db + proxy) |
| **GitHub Actions** | GitHub's built-in CI/CD system |
| **GitHub Secrets** | Encrypted environment variables stored in your repo |
| **SSH** | Secure Shell — protocol to securely connect to a remote server |
| **Reverse Proxy** | A server (like Caddy) that sits in front of your app, handling HTTPS |
| **Health Check** | A request to verify your app is running correctly |
| **Rollback** | Reverting to a previous version of your app |
| **Migration** | A script that changes your database schema |
| **Let's Encrypt** | Free automated SSL certificate provider |

---

## Quick Reference

### Commands by environment:

| Action | Local | Server |
|--------|-------|--------|
| Start | `npm run dev:all` | `docker compose -f docker-compose.prod.yml up -d` |
| Rebuild | `docker compose up -d --build` | `docker compose -f docker-compose.prod.yml up -d --build` |
| Stop | `docker compose down` | `docker compose -f docker-compose.prod.yml down` |
| Logs | `docker compose logs app` | `docker compose -f docker-compose.prod.yml logs app` |
| Migrate | `npm run db:migrate` | `docker compose -f docker-compose.prod.yml exec app npm run db:migrate` |
| Rollback | `git checkout <hash>` + rebuild | `git checkout <hash>` + rebuild + restart |

### GitHub Actions workflow files:

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, typecheck, test, build (every push) |
| `.github/workflows/deploy.yml` | Deploy to production (on push to main) |
