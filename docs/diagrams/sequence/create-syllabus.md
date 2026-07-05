---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Sequence Diagram: Create Syllabus

```mermaid
sequenceDiagram
    actor U as Teacher
    participant B as Browser
    participant SA as Server Action
    participant Z as Zod Validation
    participant A as Auth.js
    participant DB as MySQL (Drizzle)
    participant C as Cache (Next.js)

    U->>B: Fills out Course Info section
    B->>B: Debounced auto-save (1.5s after last keystroke)
    
    Note over B,SA: Auto-save triggers
    B->>SA: createSyllabusDraft(input)
    SA->>A: auth() — get session
    A-->>SA: session.user.id = "uuid-xxx"
    
    SA->>Z: createSyllabusSchema.safeParse(input)
    Z-->>SA: { success: true, data: validated }
    
    SA->>DB: INSERT INTO syllabi (userId, courseTitle, ...) 
    DB-->>SA: { id: "uuid-yyy" }
    
    SA->>C: revalidatePath("/dashboard")
    SA-->>B: { success: true, data: { id: "uuid-yyy" } }
    B-->>U: Shows "Draft saved" indicator

    Note over U,B: User continues filling sections B-F
    
    U->>B: Fills Instructor Info (Section B)
    B->>SA: updateSyllabus(syllabusId, instructorData)
    SA->>A: auth() — verify session
    SA->>Z: instructorSchema.safeParse(instructorData)
    SA->>DB: INSERT INTO instructors (syllabusId, ...)
    SA->>C: revalidatePath("/dashboard/syllabus/" + id)
    SA-->>B: { success: true }
    B-->>U: Shows "Section B saved"

    Note over U,B: User completes all sections A-F
    
    U->>B: Clicks "Mark as Complete"
    B->>SA: completeSyllabus(syllabusId)
    SA->>A: auth() — verify session + ownership
    SA->>DB: UPDATE syllabi SET status='completed' WHERE id=? AND userId=?
    SA->>C: revalidatePath("/dashboard")
    SA-->>B: { success: true }
    B-->>U: Shows "Syllabus completed" + success toast
```

## Notes

- Each section saves independently via Server Actions
- Auto-save uses React's `useTransition` + debounce (1.5 seconds)
- Zod validation runs on **both** client (form) and server (Server Action)
- Every Server Action checks `auth()` before any DB operation
- `revalidatePath()` refreshes the dashboard list after changes
- The syllabus ID is created on first save (Section A), then reused for subsequent sections