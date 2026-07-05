---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Entity-Relationship (ER) Diagram

> This diagram includes Auth.js tables (users, accounts, sessions) plus all syllabus system tables.
> For detailed field definitions, see [`docs/database_schema.md`](../database_schema.md).

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email
        datetime emailVerified
        varchar image
        varchar role "admin | teacher (default: teacher)"
        datetime createdAt
        datetime updatedAt
    }

    ACCOUNTS {
        uuid id PK
        uuid userId FK
        varchar type
        varchar provider
        varchar providerAccountId
        text refresh_token
        text access_token
        int expires_at
        varchar token_type
        varchar scope
        text id_token
        datetime createdAt
        datetime updatedAt
    }

    SESSIONS {
        uuid id PK
        uuid userId FK
        datetime expires
        varchar sessionToken
        datetime createdAt
        datetime updatedAt
    }

    VERIFICATION_TOKENS {
        varchar identifier PK
        varchar token PK
        datetime expires
    }

    SYLLABI {
        uuid id PK
        uuid userId FK
        varchar courseTitle
        varchar courseCode
        varchar term
        int creditHours
        varchar classLocation
        varchar schedule
        text courseDescription
        text prerequisites
        varchar status "draft | incomplete | completed"
        datetime deletedAt "soft delete (nullable)"
        datetime createdAt
        datetime updatedAt
    }

    INSTRUCTORS {
        uuid id PK
        uuid syllabusId FK
        varchar name
        varchar email
        varchar officeLocation
        varchar officeHours
        datetime createdAt
        datetime updatedAt
    }

    LEARNING_OBJECTIVES {
        uuid id PK
        uuid syllabusId FK
        text description
        int sortOrder
        datetime createdAt
        datetime updatedAt
    }

    MATERIALS {
        uuid id PK
        uuid syllabusId FK
        varchar title
        varchar author
        boolean isRequired
        int sortOrder
        datetime createdAt
        datetime updatedAt
    }

    GRADING_BREAKDOWNS {
        uuid id PK
        uuid syllabusId FK
        varchar category
        float percentage
        int sortOrder
        datetime createdAt
        datetime updatedAt
    }

    GRADING_SCALES {
        uuid id PK
        uuid syllabusId FK
        varchar grade "A, B+, B, etc."
        float minPercentage
        float maxPercentage
        datetime createdAt
        datetime updatedAt
    }

    WEEKLY_SCHEDULES {
        uuid id PK
        uuid syllabusId FK
        int weekNumber
        varchar topic
        text readings
        text deliverables
        datetime createdAt
        datetime updatedAt
    }

    POLICIES {
        uuid id PK
        uuid syllabusId FK
        varchar type "attendance | academic_integrity | late_work | accommodations | custom"
        text description
        int sortOrder
        datetime createdAt
        datetime updatedAt
    }

    %% Auth.js relationships
    USERS ||--o{ ACCOUNTS : "has"
    USERS ||--o{ SESSIONS : "has"

    %% Syllabus system relationships
    USERS ||--o{ SYLLABI : "creates"
    SYLLABI ||--o{ INSTRUCTORS : "has"
    SYLLABI ||--o{ LEARNING_OBJECTIVES : "has"
    SYLLABI ||--o{ MATERIALS : "has"
    SYLLABI ||--o{ GRADING_BREAKDOWNS : "has"
    SYLLABI ||--o{ GRADING_SCALES : "has"
    SYLLABI ||--o{ WEEKLY_SCHEDULES : "has"
    SYLLABI ||--o{ POLICIES : "has"
```

## Changes from Original Schema

| Change | Reason |
|--------|--------|
| Added `ACCOUNTS`, `SESSIONS`, `VERIFICATION_TOKENS` tables | Required by Auth.js v5 Drizzle adapter |
| Added `role` to `USERS` | Support admin vs teacher access levels |
| Added `emailVerified`, `image` to `USERS` | Required by Auth.js user model |
| Added `status` to `SYLLABI` | Track draft/incomplete/completed (matches UI) |
| Added `deletedAt` to `SYLLABI` | Soft delete for academic audit trail |
| Added `GRADING_SCALES` table | PRD mentions grading scale (A = 90-100%) but original schema had no table |
| Added `sortOrder` to child tables | Maintain user-defined ordering for dynamic lists |
| Added `createdAt` + `updatedAt` to ALL tables | Audit trail and debugging |
| Changed `POLICIES.type` to enum | Enforce standard policy types |
| All PKs are UUID (not serial/auto-increment) | Security, non-enumerable IDs |