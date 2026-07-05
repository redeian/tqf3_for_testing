# Diagrams

> **For AI Agents:** All diagrams use Mermaid syntax (text-based). Update these when the PRD or requirements change. See `docs/DEVELOPMENT_PROCESS.md` Phase 2 for the validation process.

## Index

| Diagram | File | Type | Validated With Users? |
|---------|------|------|----------------------|
| Use Case | [`use-case.md`](./use-case.md) | Actors & capabilities | ✅ |
| ER Diagram | [`er.md`](./er.md) | Database tables & relationships | ✅ (by developer) |

### Activity Diagrams (User Flows)
| Flow | File | Validated With Users? |
|------|------|----------------------|
| Login / Authentication | [`activity/login.md`](./activity/login.md) | ✅ |
| Create Syllabus | [`activity/create-syllabus.md`](./activity/create-syllabus.md) | ✅ |
| Edit Syllabus | [`activity/edit-syllabus.md`](./activity/edit-syllabus.md) | ✅ |
| Export Syllabus | [`activity/export-syllabus.md`](./activity/export-syllabus.md) | ✅ |

### Sequence Diagrams (Technical)
| Flow | File |
|------|------|
| Auth Flow (Google OAuth) | [`sequence/auth-flow.md`](./sequence/auth-flow.md) |
| Create Syllabus | [`sequence/create-syllabus.md`](./sequence/create-syllabus.md) |
| Export Syllabus | [`sequence/export-syllabus.md`](./sequence/export-syllabus.md) |

## Diagram Standards

- **Syntax:** Mermaid (renders in GitHub, VS Code, and most markdown viewers)
- **Activity diagrams:** `flowchart TD` (top-down), use rounded boxes for actions, diamonds for decisions
- **Sequence diagrams:** `sequenceDiagram`, include all actors (Browser, Server, DB)
- **ER diagrams:** `erDiagram`, include all tables with PK/FK markers
- **Validation status:** Each diagram header includes a `validated` field — set to ✅ after user confirms, ❌ if pending

## How to Validate With Users

1. Open the activity diagram in GitHub (it renders automatically)
2. Show it to the user on screen or print it
3. Ask: "Walk me through this — is this how you actually do it?"
4. If they say "no" → note what's wrong → tell AI agent to fix → re-validate
5. Once confirmed → update the `validated` field to ✅