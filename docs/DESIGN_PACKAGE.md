---
version: 1.0.0
last_updated: 2025-07-05
status: draft
---

# Design Package — v1.0.0

> **This is the versioned output of Stage 1 (Design).** It is the single source of truth that Stage 2 (Implementation) consumes. No code is written during this stage — only requirements, diagrams, and architecture decisions.

## How to Use This Document

- **Stage 1 (Design)** produces and updates this document package. The version number bumps when requirements change.
- **Stage 2 (Implementation)** reads this document as its input. It does NOT modify it — it creates an implementation plan from it.
- **Stage 3 (Verification)** checks that the implemented system matches what this document specifies.

## Version History

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0.0 | 2025-07-05 | Initial design package | _pending_ |

## Contents

### 1. Product Requirements

| Document | Path | Description |
|----------|------|-------------|
| PRD | [`docs/syllabus_system_prd.md`](./syllabus_system_prd.md) | Product requirements, features, tech stack, non-functional requirements |
| Open Questions | (resolved in PRD Section 9) | Architecture decisions that were resolved during design |

### 2. Diagrams

| Diagram | Path | Type | Validated With Users |
|---------|------|------|---------------------|
| Use Case | [`docs/diagrams/use-case.md`](./diagrams/use-case.md) | Actors & capabilities | ✅ |
| ER Diagram | [`docs/diagrams/er.md`](./diagrams/er.md) | Database tables & relationships | ✅ (by developer) |
| Activity: Login | [`docs/diagrams/activity/login.md`](./diagrams/activity/login.md) | User flow | ✅ |
| Activity: Create Syllabus | [`docs/diagrams/activity/create-syllabus.md`](./diagrams/activity/create-syllabus.md) | User flow | ✅ |
| Activity: Edit Syllabus | [`docs/diagrams/activity/edit-syllabus.md`](./diagrams/activity/edit-syllabus.md) | User flow | ✅ |
| Activity: Export Syllabus | [`docs/diagrams/activity/export-syllabus.md`](./diagrams/activity/export-syllabus.md) | User flow | ✅ |
| Sequence: Auth Flow | [`docs/diagrams/sequence/auth-flow.md`](./diagrams/sequence/auth-flow.md) | Technical | N/A (developer only) |
| Sequence: Create Syllabus | [`docs/diagrams/sequence/create-syllabus.md`](./diagrams/sequence/create-syllabus.md) | Technical | N/A (developer only) |
| Sequence: Export Syllabus | [`docs/diagrams/sequence/export-syllabus.md`](./diagrams/sequence/export-syllabus.md) | Technical | N/A (developer only) |

### 3. Database Schema

| Document | Path | Description |
|----------|------|-------------|
| Schema Definition | [`docs/database_schema.md`](./database_schema.md) | Table definitions, field types, relationships |

### 4. Design System

| Document | Path | Description |
|----------|------|-------------|
| Design System | [`docs/ui/DESIGN.md`](./ui/DESIGN.md) | Colors, typography, spacing, components, visual language |
| UI Mockup | [`docs/ui/code.html`](./ui/code.html) | Static HTML mockup (reference only, not production code) |
| UI Screenshot | [`docs/ui/screen.png`](./ui/screen.png) | Visual reference of the target UI |

### 5. Architecture Overview

| Document | Path | Description |
|----------|------|-------------|
| Architecture | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) | System architecture, project structure, data flow patterns, auth flow |

---

## Design Package Checklist

Before this package is considered "complete" and ready for Stage 2:

- [ ] PRD reviewed and approved by product owner
- [ ] Use Case diagram created
- [ ] All Activity diagrams created (one per user flow)
- [ ] All Sequence diagrams created (one per system action)
- [ ] ER diagram created (includes all tables for the feature set)
- [ ] Database schema definition matches ER diagram
- [ ] Design system defined (colors, typography, spacing)
- [ ] UI mockup created (HTML or screenshot)
- [ ] Architecture overview written
- [ ] Activity diagrams validated with real users
- [ ] All cross-references between documents are correct
- [ ] Version number set and recorded in version history

## When Requirements Change

When a new requirement comes in:

1. Update the relevant documents (PRD, diagrams, schema)
2. Bump the version number:
   - **Minor** (1.0.0 → 1.1.0): New feature, backwards compatible
   - **Major** (1.0.0 → 2.0.0): Breaking change or major scope shift
3. Record the change in the Version History table above
4. Get user validation on any new/changed Activity diagrams
5. Mark this package as the new input for Stage 2

## Stage Boundaries

```
┌─────────────────────────────────────────────────────────┐
│  STAGE 1: DESIGN (this package)                         │
│                                                         │
│  Input:  User interviews, raw notes, existing forms     │
│  Output: This document package (versioned)              │
│  Who:    You (interview) + AI Agent (structure docs)    │
│  Code:   NONE. Zero code is written in this stage.      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Design Package v1.0.0
                        ▼
┌─────────────────────────────────────────────────────────┐
│  STAGE 2: IMPLEMENTATION                                │
│                                                         │
│  Input:  Design Package (this document)                 │
│  Output: Working code + implementation plan + tests     │
│  Who:    AI Agent (code) + You (review each task)        │
│  Code:   All code is written in this stage.             │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Working system + test results
                        ▼
┌─────────────────────────────────────────────────────────┐
│  STAGE 3: VERIFICATION                                  │
│                                                         │
│  Input:  Working code + Design Package (to verify      │
│          the system matches the design)                 │
│  Output: Pass/fail + deployment to production           │
│  Who:    Tests (automated) + You (manual verification)  │
│  Code:   No new code. Only testing and deploying.       │
└─────────────────────────────────────────────────────────┘
```