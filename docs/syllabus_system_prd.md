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
- **Backend / Frontend:** Next.js (App Router) / Node.js (TypeScript)
- **Database:** MySQL
- **ORM:** Drizzle ORM

## 6. Initial Database Schema (Draft)
The database schema has been modularized for better maintainability. 

Please refer to the [Database Schema](file:///Users/chatchaiwangwiwattana/.gemini/antigravity-ide/brain/128e137e-aee1-4c1e-9d0d-ae5af9a7cb8d/database_schema.md) artifact for the complete Entity-Relationship (ER) diagram and table definitions.

## 7. Non-Functional Requirements
- **Usability:** The interface must be modern, minimal, and highly user-friendly.
- **Performance:** Instantaneous live preview generation without lag.
- **Responsiveness:** The app should be fully functional on desktop and usable on tablet devices.

## 8. Future Enhancements (Out of Scope for V1)
- PDF and HTML export options.
- User authentication and cloud storage for managing multiple syllabi.
- Collaborative editing for co-teachers.
- AI-assisted syllabus generation or policy drafting.
- Direct LMS (Canvas, Blackboard) integration.

## 9. Open Questions / For User Review
> [!IMPORTANT]
> Please review the following questions to help refine the scope for V1:
> 1. **Authentication:** Since we are using a MySQL database, should we include a full user authentication flow (e.g., NextAuth/Auth.js) so teachers can save multiple syllabi to their accounts?
> 2. **Customization:** Do you want teachers to be able to add custom sections, or should the sections be strictly predefined?
> 3. **Frontend Framework:** Are you okay with using Next.js (App Router) for the full stack to keep development simple and fast, or do you prefer a separate frontend and backend architecture?
