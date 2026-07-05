# Local Environment Setup Guide

This guide provides step-by-step instructions on how to initialize and run the Syllabus Management System locally using Next.js, MySQL (via Docker), and Drizzle ORM.

## Prerequisites
- **Node.js** (v18+)
- **Docker** and **Docker Compose** installed on your machine.

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

## Step 2: Initialize Next.js
At the root of your project repository, run the following command to scaffold the Next.js frontend:

```bash
npx create-next-app@latest .
```
*When prompted:*
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **No**

---

## Step 3: Install Drizzle ORM
Next, install the database ORM and MySQL driver:

```bash
npm install drizzle-orm mysql2
npm install -D drizzle-kit tsx dotenv
```

---

## Step 4: Environment Variables
Create a `.env` file at the root of your project and add the database connection string:

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/syllabus_db"
```

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
*(Refer to the `database_schema.md` document to build out your Drizzle tables here).*
```typescript
import { mysqlTable, varchar, serial } from "drizzle-orm/mysql-core";

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  email: varchar('email', { length: 256 }),
});
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
To make development lightning fast, update your `package.json` to include unified commands. We will use the `concurrently` package to run Next.js and ensure Docker is up at the same time.

1. Install `concurrently`:
   ```bash
   npm install -D concurrently
   ```

2. Update the `scripts` section in `package.json`:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "db:up": "docker-compose up -d",
     "db:push": "drizzle-kit push",
     "db:studio": "drizzle-kit studio",
     "dev:all": "concurrently \"npm run db:up\" \"npm run dev\""
   }
   ```

## Daily Development Workflow
From now on, whenever you want to work on the project, you only need to run **one command**:

```bash
npm run dev:all
```
This will automatically ensure your MySQL database is running and start the Next.js development server on `localhost:3000`.
