---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Sequence Diagram: Export Syllabus to Markdown

```mermaid
sequenceDiagram
    actor U as Teacher
    participant B as Browser
    participant SC as Server Component
    participant SA as Server Action
    participant DB as MySQL (Drizzle)

    Note over U,B: User is viewing a completed (or draft) syllabus

    U->>B: Clicks "Export to Markdown"
    
    Note over B: Markdown generation is CLIENT-SIDE\n(no server round-trip needed)
    
    B->>B: Get syllabus data from page props\n(already loaded via Server Component)
    
    B->>B: Build Markdown string:
    Note right of B: # {courseTitle}\n\n
    Note right of B: **Course Code:** {courseCode}\n
    Note right of B: **Term:** {term}\n
    Note right of B: **Credits:** {creditHours}\n\n
    Note right of B: ## Instructor\n{Name, Email, Office, Hours}\n\n
    Note right of B: ## Learning Objectives\n- {obj1}\n- {obj2}\n\n
    Note right of B: ## Grading\n| Category | % |\n|---|---|\n| {cat} | {pct} |\n\n
    Note right of B: ## Weekly Schedule\n| Week | Topic | Readings | Deliverables |\n...\n\n
    Note right of B: ## Policies\n### Attendance\n{policy}\n...
    
    B->>B: Format filename: {courseCode}_{term}.md
    
    B->>B: Create Blob from Markdown string
    B->>B: Create <a download> element
    B->>B: Click the link programmatically
    B-->>U: Browser downloads .md file
    
    B->>B: Show success toast: "Downloaded {filename}"

    Note over U,B: Alternative: Copy to Clipboard

    U->>B: Clicks "Copy to Clipboard"
    B->>B: navigator.clipboard.writeText(markdownString)
    B-->>U: Shows "Copied to clipboard" toast
```

## Notes

- Export is **entirely client-side** — no server call needed because the syllabus data is already loaded in the page (Server Component)
- The Markdown is generated from the in-memory syllabus object using a template function
- File download uses the Blob API + programmatic `<a>` click (works in all modern browsers)
- Clipboard copy uses `navigator.clipboard.writeText()` (requires HTTPS in production — Caddy provides this)
- If the syllabus has incomplete sections, they are included with a warning marker: `> ⚠️ Incomplete`
- The filename follows the pattern: `{courseCode}_{term}.md` (e.g., `IT601201_2567-1.md`)