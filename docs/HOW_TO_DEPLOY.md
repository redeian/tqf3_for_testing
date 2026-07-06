# How To: Deploy a Next.js App with Docker + GitHub Actions

> A step-by-step guide written from real experience deploying the TQF3 Syllabus Management System.

---

## Table of Contents

1. [Overview](#1-overview)
2. [The Dockerfile — Building the App](#2-the-dockerfile--building-the-app)
3. [Docker Compose — Orchestrating Services](#3-docker-compose--orchestrating-services)
4. [Caddy — Reverse Proxy with Auto-HTTPS](#4-caddy--reverse-proxy-with-auto-https)
5. [GitHub Actions CI — Quality Checks on Every Push](#5-github-actions-ci--quality-checks-on-every-push)
6. [GitHub Actions Deploy — Auto-Deploy on Merge](#6-github-actions-deploy--auto-deploy-on-merge)
7. [The force-dynamic Gotcha](#7-the-force-dynamic-gotcha)
8. [First-Time Server Setup](#8-first-time-server-setup)
9. [Running Database Migrations](#9-running-database-migrations)
10. [Troubleshooting](#10-troubleshooting)
11. [Glossary](#11-glossary)

---

## 1. Overview

The architecture looks like this:

```
Internet → Caddy (port 80/443) → Next.js App (port 3000) → MySQL (port 3306)
         (or direct to app if no domain)
```

All three services run inside Docker containers on a single VPS. GitHub Actions handles CI (lint, test, build) and CD (SSH into server, pull, migrate, restart).

### Files we created/modified

| File | Purpose |
|------|---------|
| `Dockerfile` | How to build the Next.js app into a production image |
| `docker-compose.prod.yml` | Defines the 3 services (app, db, caddy) and how they connect |
| `Caddyfile` | Configuration for the Caddy reverse proxy |
| `.github/workflows/ci.yml` | Runs on every push: lint → typecheck → test → build |
| `.github/workflows/deploy.yml` | Runs on merge to main: SSH → pull → migrate → rebuild |
| `next.config.ts` | Must have `output: "standalone"` for Docker |

---

## 2. The Dockerfile — Building the App

```dockerfile
# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed to run
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/db/migrations ./src/db/migrations

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

### Key concepts

**Multi-stage build** — The `FROM ... AS builder` stage installs everything and compiles the app. The second `FROM` stage starts fresh and only copies the compiled output. This keeps the final image **small** (no dev dependencies, no source code).

**`output: "standalone"`** — In `next.config.ts`, this tells Next.js to compile into a self-contained folder (`.next/standalone/`) that can run with just `node server.js`. Without this, you'd need `next start` which requires all of Next.js installed.

**Non-root user** — Running as `nextjs` instead of `root` is a security best practice. If someone exploits the app, they don't get root access to the container.

**HEALTHCHECK** — Docker checks every 30s if the app is alive by hitting `/api/health`. If it fails 3 times, Docker restarts the container.

### Why not just copy everything?

The builder image has `node_modules` with dev dependencies (TypeScript, ESLint, Vitest, etc.) — hundreds of MB. The runner only needs the compiled JS, so we copy only `.next/standalone/`, `.next/static/`, and `public/`.

---

## 3. Docker Compose — Orchestrating Services

```yaml
services:
  app:
    build: .
    restart: always
    ports:
      - "80:3000"          # Host port 80 → container port 3000
    environment:
      - DATABASE_URL=mysql://appuser:${DB_PASSWORD}@db:3306/syllabus_db
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    networks:
      - internal

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: syllabus_db
      MYSQL_USER: appuser
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  caddy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
    networks:
      - internal
```

### Key concepts

**`ports: "80:3000"`** — Maps port 80 on the host machine to port 3000 inside the container. So visiting `http://your-server-ip:80` (or just `http://your-server-ip`) reaches the app.

**`${DB_PASSWORD}`** — Environment variables from a `.env` file. Docker Compose reads these with `--env-file .env.production`. Never hardcode secrets!

**`depends_on: condition: service_healthy`** — The app won't start until MySQL is fully ready (accepting connections). Without this, the app would crash on startup trying to connect to a database that isn't ready yet.

**`networks: internal`** — All three services share a private Docker network. The app can reach the database at `db:3306` (using the service name as hostname). This is why `DATABASE_URL` uses `@db` instead of `@127.0.0.1`.

**Volumes** — `mysql_data` persists the database files so data survives container restarts. `caddy_data` and `caddy_config` store SSL certificates.

### Port conflict: Caddy vs App

Both Caddy and the app want port 80. You have two options:

| Scenario | App port | Caddy port | How to access |
|----------|----------|------------|---------------|
| **No domain** (testing) | `"80:3000"` | Stop Caddy | `http://server-ip` |
| **With domain** (production) | `"127.0.0.1:3000:3000"` | `"80:80"` + `"443:443"` | `https://yourdomain.com` |

When you have a domain, Caddy handles public traffic and proxies to the app on localhost only (the `127.0.0.1:` prefix means "don't expose to the internet").

---

## 4. Caddy — Reverse Proxy with Auto-HTTPS

```caddyfile
{$DOMAIN} {
    reverse_proxy app:3000
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

### What Caddy does

1. **Auto-HTTPS** — When you give it a real domain (e.g., `syllabus.example.com`), it automatically gets a free SSL certificate from Let's Encrypt and renews it every 60 days. You never touch certificates.
2. **Reverse proxy** — Forwards requests from `https://yourdomain.com` → `app:3000` (the Next.js container).
3. **Security headers** — Adds HSTS, X-Frame-Options, etc. to every response.
4. **Compression** — gzip/zstd for faster page loads.

### Why Caddy fails without a domain

Caddy tries to get an SSL certificate for `{$DOMAIN}`. If `DOMAIN` is an IP address (like `167.233.236.255`), Let's Encrypt won't issue a certificate (they only issue for real domain names). So Caddy will keep restarting.

**Fix:** Stop Caddy when testing without a domain:
```bash
docker compose -f docker-compose.prod.yml stop caddy
```

---

## 5. GitHub Actions CI — Quality Checks on Every Push

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: syllabus_db
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
        env:
          DATABASE_URL: mysql://root:root@127.0.0.1:3306/syllabus_db
      - run: npm run build
        env:
          DATABASE_URL: mysql://root:root@127.0.0.1:3306/syllabus_db
```

### What happens on every push

1. GitHub spins up a fresh Ubuntu VM
2. Starts a MySQL container (so tests that need a DB can run)
3. Checks out your code
4. Installs dependencies (`npm ci` — clean install, faster than `npm install`)
5. Runs lint → type check → unit tests → production build

If any step fails, the whole workflow fails and you get a red ❌ on your PR.

### Why we need MySQL in CI

Some pages query the database at build time (static generation). Without a MySQL service, the build would fail with `ECONNREFUSED`. The `services.mysql` block spins up a temporary MySQL just for the CI run.

---

## 6. GitHub Actions Deploy — Auto-Deploy on Merge

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.2
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/tqf3
            git pull origin main
            # Create .env.production from secrets
            cat > .env.production << 'ENVEOF'
            DB_ROOT_PASSWORD=${{ secrets.DB_ROOT_PASSWORD }}
            DB_PASSWORD=${{ secrets.DB_PASSWORD }}
            DOMAIN=${{ secrets.DOMAIN }}
            NODE_ENV=production
            ENVEOF
            # Run migrations
            docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
            # Health check
            curl -sf --retry 5 https://${{ secrets.DOMAIN }}/api/health
```

### How it works

1. You merge a PR to `main`
2. GitHub Actions SSHes into your server (using the private key from `SSH_KEY`)
3. Pulls the latest code from GitHub
4. Creates `.env.production` from GitHub Secrets (so secrets never live in your repo)
5. Rebuilds Docker images and restarts containers
6. Checks the health endpoint to confirm the deploy worked

### GitHub Secrets you need to set

Go to **GitHub → repo → Settings → Secrets and Variables → Actions**:

| Secret | What it is |
|--------|------------|
| `SSH_HOST` | Your server's IP address |
| `SSH_USER` | SSH username (e.g., `root`) |
| `SSH_KEY` | Your private SSH key (the whole file, including `-----BEGIN...-----`) |
| `DB_ROOT_PASSWORD` | MySQL root password |
| `DB_PASSWORD` | MySQL app user password |
| `DOMAIN` | Your domain (e.g., `syllabus.example.com`) |

---

## 7. The `force-dynamic` Gotcha

### The problem

When we ran `npm run build` inside Docker, it failed with:

```
Error: connect ECONNREFUSED 127.0.0.1:3306
Table 'syllabus_db.syllabi' doesn't exist
```

This happened because Next.js tries to **statically prerender** pages at build time. The `/syllabi` page queries the database, but there's no MySQL during the Docker build stage.

### The fix

Add this to any page that queries the database:

```typescript
export const dynamic = "force-dynamic";
```

This tells Next.js: "Don't try to render this page at build time. Wait until someone actually visits it, then query the database."

### Which pages need it

Any page that calls `db.query...` or `db.select...` directly:

- `src/app/syllabi/page.tsx` — lists all syllabi
- `src/app/syllabi/[id]/page.tsx` — shows one syllabus

Pages that don't query the database (like `/syllabi/new`) are fine without it.

---

## 8. First-Time Server Setup

### Prerequisites

- A VPS with Ubuntu 22.04+
- Docker and Docker Compose installed
- Your domain's DNS pointing to the server's IP

### Step-by-step

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker
apt update
apt install -y docker.io docker-compose-v2

# 3. Clone the repo
git clone https://github.com/your-org/your-repo.git ~/tqf3
cd ~/tqf3

# 4. Create .env.production
cat > .env.production << 'EOF'
DB_ROOT_PASSWORD=your-strong-password
DB_PASSWORD=your-strong-password
DOMAIN=yourdomain.com
NODE_ENV=production
EOF

# 5. Start the database first
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db

# 6. Wait for MySQL to be ready (about 15 seconds)
sleep 15

# 7. Run database migrations
docker run --rm \
  --network tqf3_internal \
  -v $PWD:/app -w /app \
  node:20-alpine \
  sh -c "DATABASE_URL=mysql://appuser:your-password@db:3306/syllabus_db npx drizzle-kit migrate"

# 8. Start everything
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 9. Verify
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

---

## 9. Running Database Migrations

### Why migrations?

Drizzle ORM uses a "migrations" approach: you define your schema in `src/db/schema.ts`, then run `drizzle-kit generate` to create SQL migration files, then `drizzle-kit migrate` to apply them to the database.

### The problem with production

The production Docker image is stripped down — it doesn't have `npx` or `drizzle-kit`. So you can't run migrations from inside the running container.

### Solutions

**Option A: Run from a temporary container (what we did)**

```bash
docker run --rm \
  --network tqf3_internal \
  -v $PWD:/app -w /app \
  node:20-alpine \
  sh -c "DATABASE_URL=mysql://appuser:password@db:3306/syllabus_db npx drizzle-kit migrate"
```

This spins up a temporary Node container, connects to the same Docker network as the database, runs the migration, then deletes itself.

**Option B: Run from the host (if MySQL port is exposed)**

```bash
DATABASE_URL="mysql://appuser:password@127.0.0.1:3306/syllabus_db" npx drizzle-kit migrate
```

This only works if the `db` service has `ports: "3306:3306"` in docker-compose.prod.yml.

### Why we used Option A

The `db` service doesn't expose port 3306 to the host (it's only accessible within the Docker network). This is more secure — the database isn't publicly accessible.

---

## 10. Troubleshooting

### "Connection refused" when visiting the site

**Cause 1:** The app port is bound to `127.0.0.1` (localhost only).

Check your `docker-compose.prod.yml`:
```yaml
ports:
  - "80:3000"           # ✅ Accessible from anywhere
  - "127.0.0.1:80:3000" # ❌ Only accessible from the server itself
```

**Cause 2:** A firewall is blocking the port.

```bash
# Check if the port is listening
ss -tlnp | grep 80

# Check firewall rules
ufw status
iptables -L
```

### "Table doesn't exist" error

The database migrations haven't been run yet. See [Section 9](#9-running-database-migrations).

### Caddy keeps restarting

Caddy needs a real domain name to get SSL certificates. If you're testing with an IP address, stop Caddy:

```bash
docker compose -f docker-compose.prod.yml stop caddy
```

### "Access denied for user" from MySQL

The MySQL container was created with different credentials than what you're using now. The fix is to delete the MySQL volume and recreate:

```bash
docker compose -f docker-compose.prod.yml down -v   # ⚠️ Deletes all data!
docker compose -f docker-compose.prod.yml up -d db
```

The `-v` flag deletes the volume (the actual database files). Without it, the old data persists with the old credentials.

### Build fails with "ECONNREFUSED" in CI

Make sure your CI workflow has a MySQL service:

```yaml
services:
  mysql:
    image: mysql:8.0
    env:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: syllabus_db
    ports:
      - 3306:3306
```

And pass `DATABASE_URL` to the build step:
```yaml
- run: npm run build
  env:
    DATABASE_URL: mysql://root:root@127.0.0.1:3306/syllabus_db
```

### "Cannot find module 'esbuild'"

The production Docker image doesn't have dev dependencies. Run migrations from a temporary container instead (see Section 9).

---

## 11. Glossary

| Term | Meaning |
|------|---------|
| **Docker** | A tool that packages an app and its dependencies into a "container" — like a lightweight VM |
| **Docker Compose** | A tool to define and run multiple containers together (e.g., app + database + proxy) |
| **Image** | A blueprint for a container (like a class in OOP) |
| **Container** | A running instance of an image (like an object) |
| **Volume** | Persistent storage that survives container restarts |
| **Multi-stage build** | Using multiple `FROM` statements in a Dockerfile to keep the final image small |
| **Reverse proxy** | A server that sits in front of your app, handling SSL, headers, and routing |
| **Caddy** | A web server that auto-configures HTTPS |
| **Let's Encrypt** | A free certificate authority that issues SSL certificates |
| **GitHub Actions** | GitHub's built-in CI/CD system |
| **CI** | Continuous Integration — automatically run tests on every push |
| **CD** | Continuous Deployment — automatically deploy on every merge to main |
| **Static generation** | Next.js renders pages at build time (faster, but needs data available at build) |
| **force-dynamic** | Tells Next.js to render a page at request time instead of build time |
| **Standalone output** | Next.js compiles into a self-contained folder that runs with just `node server.js` |
| **Migration** | A version-controlled SQL file that changes the database schema |
| **SSH** | Secure Shell — a protocol to remotely control a server |
| **SSH key** | A cryptographic key pair used to authenticate without a password |
