# Local Environment Setup Guide

This guide provides step-by-step instructions on how to initialize and run the Syllabus Management System locally using Next.js 16, MySQL (via Docker), Drizzle ORM, and Auth.js v5.

## Prerequisites
- **Node.js** (v20.9+ — required by Next.js 16)
- **Docker** and **Docker Compose** installed on your machine.
- **Google OAuth credentials** (see Step 4b)

---

## Step 1: Start the Database (Docker)
We use Docker Compose to spin up a local MySQL database. A `docker-compose.yml` file has been provided in this directory.

1. Move the `docker-compose.yml` file to the root of your project (or run it from here):
   ```bash
   cp docs/docker-compose.yml ./docker-compose.yml
   docker-compose up -d
   ```
2. The MySQL database is now running on `localhost:3306`.
   - **User:** `root`
   - **Password:** `root`
   - **Database Name:** `syllabus_db`

---

## Step 2: Initialize Next.js 16
At the root of your project repository, run the following command to scaffold the Next.js frontend:

```bash
npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app-router --no-import-alias --use-npm
```

Next.js 16 defaults:
- Turbopack is the default bundler (no webpack config needed)
- ESLint uses Flat Config format
- `proxy.ts` replaces the deprecated `middleware.ts` for route protection
- React 19.2 is included
- `params` and `searchParams` are async (must be `await`ed)

---

## Step 3: Install Dependencies

### Database (Drizzle ORM + MySQL)
```bash
npm install drizzle-orm mysql2
npm install -D drizzle-kit tsx dotenv
```

### Authentication (Auth.js v5)
```bash
npm install next-auth@beta @auth/drizzle-adapter
```

### Validation (Zod)
```bash
npm install zod
```

### Testing (Vitest + Playwright)
```bash
npm install -D vitest @playwright/test
```

### Development Utilities
```bash
npm install -D concurrently
```

---

## Step 4: Environment Variables
Create a `.env.local` file at the root of your project (never commit this file):

```env
# Database
DATABASE_URL="mysql://root:root@127.0.0.1:3306/syllabus_db"

# Auth.js v5
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
AUTH_TRUST_HOST=true
```

> **Important:** Also create a `.env.example` file with the same keys but dummy values. This file IS committed to Git as a template.

### Step 4b: Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Set application type to **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret into your `.env.local`

---

## Step 5: Database Schema Configuration
Create the database configuration files in your Next.js `src/` folder.

**1. Create `src/db/index.ts`**
```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
```

**2. Create `src/db/schema.ts`**
*(Refer to [`docs/database_schema.md`](./database_schema.md) to build out your Drizzle tables here.)*
Use UUID primary keys (not serial/auto-increment) for all tables:
```typescript
import { mysqlTable, varchar, text, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';

// Auth.js tables (users, accounts, sessions, verificationTokens)
// + Syllabus tables (syllabi, instructors, learning_objectives, etc.)
// See docs/database_schema.md for full schema definition
```

**3. Create `drizzle.config.ts` (at the root of the project)**
```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Step 6: The "Simple Command" to Run Everything
To make development lightning fast, update your `package.json` to include unified commands:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest",
  "test:e2e": "playwright test",
  "db:up": "docker-compose up -d",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "dev:all": "concurrently \"npm run db:up\" \"npm run dev\""
}
```

> **Note:** Next.js 16 removed the `next lint` command. Use `eslint` directly instead.
> **Note:** Use `db:generate` (not `db:push`) to create reviewable migration files.

## Daily Development Workflow
From now on, whenever you want to work on the project, you only need to run **one command**:

```bash
npm run dev:all
```
This will automatically ensure your MySQL database is running and start the Next.js development server on `localhost:3000` (with Turbopack for fast refresh).

### First-time setup (after cloning):
```bash
npm install
cp .env.example .env.local  # Then fill in your real values
npm run db:up
npm run db:generate
npm run db:migrate
npm run dev
```