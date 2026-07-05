---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Error Handling, Fault Tolerance & Health Checks

> **For AI Agents and Humans:** This document defines how the system handles errors, recovers from failures, and reports its health status. Read this before writing any Server Action or API route.

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Error       │  │ Toast /      │  │ Loading / Suspense       │ │
│  │ Boundary    │  │ Inline Error │  │ Fallbacks                │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────────┘ │
└─────────┼────────────────┼──────────────────────┼────────────────┘
          │                │                      │
┌─────────▼────────────────▼──────────────────────▼────────────────┐
│                    Next.js 16 Application                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Server Action Error Boundary                               │ │
│  │  All actions return ActionResult<T> (never throw to client)  │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                              │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │  Error Logger (src/lib/logger.ts)                           │ │
│  │  Structured JSON logs → stdout (Docker captures)             │ │
│  └──────────┬───────────────────────────────────┬──────────────┘ │
│             │                                    │                 │
│  ┌──────────▼─────────┐         ┌──────────────▼──────────────┐  │
│  │  DB Error Handler   │         │  Auth Error Handler         │  │
│  │  Retry × 3 + backoff│         │  Redirect to /login         │  │
│  └──────────┬─────────┘         └──────────────┬──────────────┘  │
│             │                                    │                 │
│  ┌──────────▼────────────────────────────────────▼──────────────┐ │
│  │  Health Check Endpoint: /api/health                          │ │
│  │  Checks: DB connectivity, app responsiveness, auth service    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
          │                                          │
┌─────────▼──────────────────────────────────────────▼─────────────┐
│                    Docker / Infrastructure                       │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Docker      │  │ Caddy       │  │ CI/CD Post-Deploy         │ │
│  │ healthcheck │  │ health      │  │ curl /api/health → 200     │ │
│  │ every 30s   │  │ route       │  │                            │ │
│  └─────────────┘  └─────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Error Handling Layers

### Layer 1: Server Actions (Business Logic)

Every Server Action returns a typed result. **Never throw to the client.**

```typescript
// src/lib/types.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };
```

#### Error Categories

| Error Type | HTTP Equivalent | User Message | Logged? | Action |
|-----------|----------------|---------------|---------|--------|
| **Validation error** | 400 | "Course title is required" | ❌ No (expected) | Return fieldErrors to form |
| **Auth error** | 401 | "Please sign in to continue" | ⚠️ Warn (if frequent) | Redirect to /login |
| **Authorization error** | 403 | "You don't have access to this" | ⚠️ Warn | Show access denied |
| **Not found** | 404 | "Syllabus not found" | ❌ No (expected) | Show not found page |
| **Database error** | 500 | "Something went wrong. Please try again." | ✅ Error (full stack) | Show retry option |
| **Rate limit** | 429 | "Too many attempts. Please wait." | ⚠️ Warn | Show cooldown timer |
| **Unknown error** | 500 | "Something went wrong. Please try again." | ✅ Error (full stack) | Show retry option |

#### Server Action Error Template

```typescript
"use server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types";

export async function doSomething(input: unknown): Promise<ActionResult<{ id: string }>> {
  // --- 1. Auth check ---
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Please sign in to continue." };
  }

  // --- 2. Validation (Zod) ---
  const validated = someSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: "Please check your input.",
      fieldErrors: Object.fromEntries(
        validated.error.issues.map(i => [i.path[0].toString(), i.message])
      ),
    };
  }

  // --- 3. Database operation with error handling ---
  try {
    const [result] = await db.insert(someTable).values({
      ...validated.data,
      userId: session.user.id,
    }).$returningId();

    revalidatePath("/dashboard");
    return { success: true, data: { id: result.id } };
  } catch (error) {
    // Log full error internally, return generic message to client
    logger.error("doSomething failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check for specific DB errors
    if (error instanceof Error && error.message.includes("Duplicate entry")) {
      return {
        success: false,
        error: "This course code already exists.",
        fieldErrors: { courseCode: "Already in use" },
      };
    }

    // Generic fallback — never expose internal details
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
```

### Layer 2: Error Boundaries (UI)

Next.js App Router has built-in error boundaries. Create these files:

#### Global Error (catches everything, including root layout errors)

```typescript
// src/app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-2xl font-bold text-error mb-4">
            Something went wrong
          </h1>
          <p className="text-on-surface-variant mb-6 text-center max-w-md">
            An unexpected error occurred. Your data is safe. Try again or
            refresh the page.
          </p>
          <button
            onClick={reset}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

#### Route Error (catches errors within the dashboard route group)

```typescript
// src/app/(dashboard)/error.tsx
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <span className="material-symbols-outlined text-error text-6xl mb-4">
        error_outline
      </span>
      <h2 className="text-xl font-semibold text-on-surface mb-2">
        This page couldn't load
      </h2>
      <p className="text-on-surface-variant mb-6 text-center">
        {error.message || "An error occurred while loading this page."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="border border-outline-variant text-on-surface px-6 py-2 rounded-lg"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
```

#### Not Found (404)

```typescript
// src/app/(dashboard)/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">
        search_off
      </span>
      <h2 className="text-xl font-semibold text-on-surface mb-2">
        Page not found
      </h2>
      <p className="text-on-surface-variant mb-6">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/dashboard"
        className="bg-primary text-on-primary px-6 py-2 rounded-lg"
      >
        Back to dashboard
      </a>
    </div>
  );
}
```

### Layer 3: Loading States (Suspense)

Every page that fetches data should have a loading fallback:

```typescript
// src/app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-8 bg-surface-container rounded w-1/4" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-surface-container rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-surface-container rounded-xl" />
    </div>
  );
}
```

### Layer 4: Structured Logging

```typescript
// src/lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // In production: JSON to stdout (Docker captures)
  // In development: pretty print to console
  if (process.env.NODE_ENV === "production") {
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  } else {
    const prefix = level.toUpperCase().padEnd(5);
    console[level === "debug" ? "log" : level](
      `[${prefix}] ${message}`,
      context ? context : ""
    );
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};
```

### Layer 5: Client-Side Error Handling

```typescript
// src/components/ui/error-toast.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner"; // or your toast library

export function useErrorHandler() {
  return {
    showError: (message: string) => {
      toast.error(message, {
        action: { label: "Retry", onClick: () => window.location.reload() },
      });
    },
    showSuccess: (message: string) => {
      toast.success(message);
    },
    showWarning: (message: string) => {
      toast.warning(message);
    },
  };
}
```

---

## 3. Health Check System

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // --- Check 1: Database connectivity ---
  try {
    const start = Date.now();
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      connectTimeout: 5000, // 5 second timeout
    });
    await connection.ping();
    await connection.end();
    checks.database = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // --- Check 2: Application responsiveness ---
  checks.application = { status: "healthy" };

  // --- Determine overall status ---
  const allHealthy = Object.values(checks).every(c => c.status === "healthy");
  const status = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      checks,
    },
    { status }
  );
}
```

### Health Check Response Format

**Healthy (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-05T12:00:00.000Z",
  "version": "0.1.0",
  "checks": {
    "database": { "status": "healthy", "latency": 12 },
    "application": { "status": "healthy" }
  }
}
```

**Unhealthy (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-07-05T12:00:00.000Z",
  "version": "0.1.0",
  "checks": {
    "database": { "status": "unhealthy", "error": "ECONNREFUSED" },
    "application": { "status": "healthy" }
  }
}
```

### When Health Checks Run

| Consumer | Frequency | Action on Failure |
|---------|-----------|-------------------|
| **Docker** | Every 30 seconds | Marks container unhealthy → restarts after 3 failures |
| **Caddy** | Every 10 seconds | Returns 502 to users if app is down |
| **CI/CD** | Once after deploy | Fails deployment → rollback |
| **Cron (optional)** | Every 1 minute | Sends alert if unhealthy for > 1 minute |

### Docker Healthcheck

Add to `docker-compose.prod.yml`:

```yaml
services:
  app:
    build: .
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s  # Wait for app to boot before checking
    ports:
      - "3000:3000"
    # ... rest of config
```

### Caddy Health Check (Optional)

Add to `Caddyfile`:

```caddyfile
{$DOMAIN} {
    # Health check: Caddy won't route to app if it's down
    reverse_proxy app:3000 {
        health_uri /api/health
        health_interval 10s
        health_timeout 5s
        health_port 3000
    }
    # ... rest of config
}
```

### CI/CD Post-Deploy Health Check

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Health check
  run: |
    echo "Waiting for app to start..."
    sleep 10

    for i in {1..5}; do
      echo "Attempt $i/5..."
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${{ secrets.DOMAIN }}/api/health)

      if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Health check passed (HTTP 200)"
        exit 0
      fi
      echo "⏳ Health check returned $HTTP_CODE, retrying in 5s..."
      sleep 5
    done

    echo "❌ Health check failed after 5 attempts"
    exit 1
```

---

## 4. Fault Tolerance Patterns

### Pattern 1: Database Connection Retry

```typescript
// src/lib/db-retry.ts
import { logger } from "@/lib/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;
const RETRY_BACKOFF = 2; // exponential

export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors or auth errors
      if (
        lastError.message.includes("Duplicate entry") ||
        lastError.message.includes("Access denied")
      ) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF, attempt - 1);
        logger.warn(`DB operation failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms`, {
          context,
          error: lastError.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`DB operation failed after ${MAX_RETRIES} attempts`, {
    context,
    error: lastError?.message,
  });
  throw lastError!;
}
```

**Usage in Server Actions:**
```typescript
const result = await withRetry(
  () => db.insert(syllabi).values(data).$returningId(),
  "createSyllabus"
);
```

### Pattern 2: Graceful Degradation

When the database is unavailable, the app should still show something useful:

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { db } from "@/db";
import { logger } from "@/lib/logger";

export default async function DashboardPage() {
  let syllabi: Syllabus[] = [];

  try {
    syllabi = await db.query.syllabi.findMany();
  } catch (error) {
    logger.error("Failed to load syllabi list", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fall through to empty list — UI shows "Connection issue" banner
  }

  return (
    <div>
      {syllabi.length === 0 && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-4">
          <p>Unable to load your syllabi. Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      <SyllabusList items={syllabi} />
    </div>
  );
}
```

### Pattern 3: Session Expiry Handling

```typescript
// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip health check (always public)
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check session
  const token = await getToken({ req: request });

  if (!token) {
    // Redirect to login with redirect back URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)"],
};
```

### Pattern 4: Rate Limiting (Login)

```typescript
// src/lib/rate-limit.ts
import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 attempts per window

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = attempts.get(identifier);

  // Reset if window expired
  if (!existing || existing.resetAt < now) {
    attempts.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  // Increment attempt count
  existing.count++;

  if (existing.count > RATE_LIMIT_MAX) {
    logger.warn("Rate limit exceeded", { identifier, attempts: existing.count });
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: existing.resetAt,
    };
  }

  return {
    allowed: true,
    remainingAttempts: RATE_LIMIT_MAX - existing.count,
    resetAt: existing.resetAt,
  };
}
```

---

## 5. Error Recovery Matrix

| Scenario | What Happens | User Sees | System Does |
|----------|-------------|-----------|-------------|
| **DB connection lost** | Query fails | "Unable to load data" + Retry button | Retry × 3 with backoff → log error → graceful degradation |
| **DB connection restored** | Retry succeeds | Data loads normally | Nothing special (auto-recovered) |
| **Session expired** | Auth check fails | Redirect to /login | `proxy.ts` redirects with callbackUrl |
| **Server Action throws** | Caught in try/catch | "Something went wrong" + Retry | Log full error → return generic message |
| **Page render error** | Error boundary catches | "Page couldn't load" + Try again | `error.tsx` renders → user can reset |
| **Root layout error** | Global error catches | "Something went wrong" + Try again | `global-error.tsx` renders |
| **Health check fails** | Docker detects | Container restarts | 3 consecutive failures → Docker restarts container |
| **Rate limit exceeded** | Login blocked | "Too many attempts, wait 15 min" | Return 429-style message |
| **Network timeout** | Request times out | "Connection timed out" | 5s timeout on DB, 30s on page load |
| **Duplicate entry** | DB rejects | "This course code already exists" | Return fieldErrors for courseCode |
| **OAuth failure** | Google returns error | "Sign-in failed, try again" | Log OAuth error → redirect to /login with error |

---

## 6. Logging Strategy

### Log Levels

| Level | When to Use | Example |
|-------|------------|---------|
| **debug** | Detailed dev info (dev only) | "Query executed in 12ms", "Session validated" |
| **info** | Normal operations | "User logged in", "Syllabus created", "Export downloaded" |
| **warn** | Something unusual but not broken | "Rate limit exceeded", "Retry attempt 2/3", "Session near expiry" |
| **error** | Something failed | "DB connection failed", "Server Action threw", "OAuth callback failed" |

### What to Log

| ✅ Log This | ❌ Don't Log This |
|-------------|-------------------|
| Server Action failures (with userId) | User passwords or tokens |
| DB connection errors | Full request bodies |
| Auth failures (with IP) | User PII (email, name) in production |
| Rate limit exceeded | Successful operations (use "info" level) |
| Health check failures | Static asset requests |
| Session expiry | Expected validation errors |

### Log Format (Production)

```json
{
  "timestamp": "2025-07-05T12:00:00.000Z",
  "level": "error",
  "message": "createSyllabus failed",
  "userId": "uuid-xxx",
  "error": "ECONNREFUSED",
  "stack": "Error: ECONNREFUSED\n    at ...",
  "action": "createSyllabus",
  "duration": 5123
}
```

Docker captures stdout. View with:
```bash
docker-compose -f docker-compose.prod.yml logs app --tail 100 -f
```

---

## 7. Monitoring Checklist

### Daily (Manual or Automated)

- [ ] Check health endpoint: `curl https://domain/api/health`
- [ ] Check Docker container status: `docker-compose ps`
- [ ] Review error logs: `docker-compose logs app --since 24h | grep error`
- [ ] Check disk space: `df -h`
- [ ] Check MySQL connections: `docker exec syllabus_db mysqladmin status`

### Weekly

- [ ] Review error patterns — same error repeating?
- [ ] Check backup files exist
- [ ] Update Docker images if needed
- [ ] Review rate limit logs — any brute force attempts?

### Monthly

- [ ] Update dependencies (`npm audit`, `npm update`)
- [ ] Rotate secrets (AUTH_SECRET, DB passwords)
- [ ] Review log size — clean up old logs
- [ ] Test rollback procedure

---

## 8. Disaster Recovery

### If the App Goes Down

```bash
# 1. Check what's wrong
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs app --tail 50
docker-compose -f docker-compose.prod.yml logs db --tail 50

# 2. Try restarting
docker-compose -f docker-compose.prod.yml restart app

# 3. If DB is down, restart DB first
docker-compose -f docker-compose.prod.yml restart db
# Wait 10 seconds, then restart app
docker-compose -f docker-compose.prod.yml restart app

# 4. If app won't start, rebuild
docker-compose -f docker-compose.prod.yml up -d --build app

# 5. If still broken, rollback to previous version
git log --oneline -5
git checkout <previous-tag>
docker-compose -f docker-compose.prod.yml up -d --build
```

### If the Database Is Corrupted

```bash
# 1. Stop the app (so it doesn't write to a broken DB)
docker-compose -f docker-compose.prod.yml stop app

# 2. Restore from latest backup
gunzip < /backups/syllabus_20250705.sql.gz | \
  docker exec -i syllabus_db mysql -u root -p${DB_ROOT_PASSWORD} syllabus_db

# 3. Run migrations (in case schema changed since backup)
docker-compose -f docker-compose.prod.yml start app
docker exec <app_container> npm run db:migrate

# 4. Verify
curl https://domain/api/health
```

### If You Need to Roll Back

```bash
# 1. Find the last good version
git tag -l --sort=-version:refname | head -5

# 2. Checkout that version
git checkout v1.0.2

# 3. Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Run migrations (downgrade if needed)
npm run db:migrate

# 5. Verify health
curl https://domain/api/health
```

---

## 9. AI Agent Rules for Error Handling

### Every Server Action MUST:

1. **Return `ActionResult<T>`** — never throw to the client
2. **Catch all database errors** in try/catch
3. **Log errors with context** — userId, action name, error message
4. **Return generic error message** — never expose internal details
5. **Handle specific known errors** — duplicate entry, connection refused, etc.

### Every Page MUST:

1. **Have a loading.tsx** — Suspense fallback while data loads
2. **Have an error.tsx** — Error boundary for render failures
3. **Gracefully degrade** — show something useful even if data fetch fails

### Every API Route MUST:

1. **Return proper HTTP status codes** — 200, 400, 401, 403, 404, 500, 503
2. **Never expose stack traces** in production
3. **Log errors** with request context
4. **Handle timeouts** — don't hang indefinitely

### The AI Agent MUST NOT:

1. **Expose raw error messages** to the user (e.g., `ECONNREFUSED 127.0.0.1:3306`)
2. **Log sensitive data** (passwords, tokens, session IDs)
3. **Silently swallow errors** (catching without logging or returning)
4. **Use `console.log` for errors** — use `logger.error()` instead
5. **Leave error boundaries empty** — every error.tsx must show a useful message + retry