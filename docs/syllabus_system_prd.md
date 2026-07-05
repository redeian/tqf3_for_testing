# Product Requirements Document (PRD): Syllabus Management System

## 1. Overview
The Syllabus Management System is a web-based application designed to help teachers and educators create, manage, and export course syllabi easily. The primary goal is to provide a structured, intuitive interface for inputting syllabus data and a seamless feature to export the completed syllabus into a formatted Markdown (`.md`) file. This allows the syllabus to be easily version-controlled, shared, or converted to other formats.

## 2. Target Audience
- **Primary Users:** Teachers, Professors, Instructors, and Teaching Assistants.
- **Secondary Users:** Students (who consume the exported syllabus).

## 3. Goals and Objectives
- **Simplify Syllabus Creation:** Provide a guided, form-based interface for drafting a syllabus so educators can focus on content rather than formatting.
- **Standardization:** Ensure all syllabi follow a consistent and professional structure.
- **Markdown Export:** Allow users to export the final syllabus as a clean, well-formatted Markdown file for easy integration with GitHub, Notion, LMS platforms, or static site generators.

## 4. Key Features & Requirements

### 4.1 Syllabus Creation (Input Fields)
The system must provide an interface to capture the following core sections of a standard syllabus:

**A. Course Information**
- Course Title
- Course Code
- Term / Semester
- Credit Hours
- Class Location & Schedule

**B. Instructor Information**
- Instructor Name(s)
- Contact Email
- Office Location
- Office Hours

**C. Course Details**
- Course Description
- Prerequisites
- Learning Objectives (Dynamic list format)
- Required Textbooks & Materials

**D. Grading & Assessment**
- Grading Breakdown (e.g., Assignments 40%, Midterm 30%, Final 30%) - dynamic table.
- Grading Scale (e.g., A = 90-100%).

**E. Course Schedule / Weekly Plan**
- Dynamic interface to add multiple weeks/modules.
- For each week: Week number/date, Topic, Assigned Readings, and Deliverables.

**F. Course Policies**
- Attendance Policy
- Academic Integrity Policy
- Late Work Policy
- Accommodations Policy

### 4.2 Syllabus Management & Preview
- **Save Draft:** Users can save their progress and return later.
- **Live Preview:** A side-by-side or toggleable preview panel showing how the Markdown will render visually as the user types.

### 4.3 Export Functionality
- **Markdown Export (`.md`):** A primary action button to generate and download a `.md` file containing all the inputted information, cleanly formatted with appropriate Markdown syntax (Headers, Lists, Tables, Bold, Italics, etc.).
- **Copy to Clipboard:** An option to copy the raw Markdown text directly to the user's clipboard.

## 5. Technology Stack & Database

### 5.1 Core Stack
- **Framework:** Next.js 16 (App Router, Turbopack default bundler)
  - React 19.2
  - Node.js 20.9+ (minimum required by Next.js 16)
  - `output: "standalone"` enabled for Docker deployment
  - `proxy.ts` (replaces deprecated `middleware.ts`) for auth route protection
- **Language:** TypeScript (strict mode)
- **Database:** MySQL 8.0 (Dockerized)
- **ORM:** Drizzle ORM (type-safe, SQL-first, with migration files)
- **Authentication:** Auth.js v5 (NextAuth) with Google OAuth provider
  - Drizzle adapter for session/account storage in MySQL
  - Protected routes via `proxy.ts`
- **Validation:** Zod (runtime validation + type inference for all Server Action inputs)
- **Styling:** Tailwind CSS v4 (custom design tokens from `docs/ui/DESIGN.md`)
- **Icons:** Material Symbols Outlined

### 5.2 Development & Testing
- **Package Manager:** npm
- **Dev Server:** `next dev` (Turbopack, 5–10x faster Fast Refresh)
- **Unit Testing:** Vitest
- **E2E Testing:** Playwright
- **Linting:** ESLint (Flat Config, Next.js 16 default)
- **Code Formatting:** Prettier

### 5.3 CI/CD & Deployment
- **CI/CD:** GitHub Actions (Free tier)
  - **GitHub Free plan:** 2,000 build minutes/month for private repositories
  - **Public repositories:** Unlimited free build minutes
  - **Artifact storage:** 500 MB included on Free plan
  - **Self-hosted runners:** Free (optional, for on-premise server deployment)
  - Workflow: lint → type-check → unit tests → build → (deploy on merge to `main`)
- **Deployment Target:** Docker container on a VPS (Hetzner/DigitalOcean)
  - `Dockerfile` (multi-stage build, standalone output)
  - `docker-compose.prod.yml` (Next.js app + MySQL)
  - Reverse proxy: Caddy (automatic HTTPS)
- **Database Migrations:** `drizzle-kit generate` (reviewable SQL files, applied via CI)

## 6. Initial Database Schema (Draft)
The database schema has been modularized for better maintainability. 

Please refer to [`docs/database_schema.md`](./database_schema.md) for the complete Entity-Relationship (ER) diagram and table definitions.

## 7. Non-Functional Requirements
- **Usability:** The interface must be modern, minimal, and highly user-friendly.
- **Performance:** Instantaneous live preview generation without lag.
- **Responsiveness:** The app should be fully functional on desktop and usable on tablet devices.
- **Scalability:** Must support up to 100 concurrent users comfortably. Single VPS deployment is sufficient.
- **Security:**
  - All routes protected via Auth.js + `proxy.ts` (Google OAuth)
  - Input validation on all mutations via Zod schemas
  - SQL injection prevention via Drizzle ORM parameterized queries
  - CSRF protection handled by Auth.js for Server Actions
  - HTTPS via Caddy reverse proxy (automatic Let's Encrypt certificates)
  - Secrets managed via environment variables (never committed to Git)
- **CI/CD:** Every push triggers GitHub Actions (lint → test → build). Merges to `main` trigger automated deployment.
- **AI-Agent Friendly:** The architecture is designed for AI-agent-driven development:
  - Strict TypeScript + Zod validation as safety nets
  - Comprehensive test suite as feedback loop
  - Reviewable database migrations (not auto-push)
  - Branch protection requires passing CI before merge

## 8. Future Enhancements (Out of Scope for V1)
- PDF and HTML export options.
- Role-based access control (admin, faculty, viewer) beyond basic auth.
- Collaborative editing for co-teachers.
- AI-assisted syllabus generation or policy drafting.
- Direct LMS (Canvas, Blackboard) integration.
- Database backup automation (cron + managed storage).

## 9. Architecture Decisions (Resolved)
> [!IMPORTANT]
> The following questions have been resolved during architecture review:
> 1. **Authentication:** ✅ Resolved — Auth.js v5 with Google OAuth will be implemented. Users authenticate via Google and can save multiple syllabi to their accounts. The `users`, `accounts`, and `sessions` tables are included in the database schema.
> 2. **Customization:** Sections will be strictly predefined for V1 to ensure standardization. Custom sections are a future enhancement.
> 3. **Frontend Framework:** ✅ Resolved — Next.js 16 (App Router) full-stack. Server Actions for mutations, Server Components for data fetching. No separate backend needed.
> 4. **CI/CD:** ✅ Resolved — GitHub Actions (Free tier, 2,000 min/month for private repos). Sufficient for this project's build frequency.
> 5. **Deployment:** ✅ Resolved — Docker container on VPS with Caddy reverse proxy for HTTPS.
