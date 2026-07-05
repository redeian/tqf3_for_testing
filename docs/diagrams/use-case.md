---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Use Case Diagram

```mermaid
graph LR
    %% Actors
    Teacher((Teacher))
    Admin((Faculty Admin))
    Student((Student))

    %% System boundary
    subgraph Syllabus Management System
        UC1([Login with Google])
        UC2([View Syllabus List])
        UC3([Create New Syllabus])
        UC4([Edit Syllabus])
        UC5([Delete Syllabus])
        UC6([Save Draft])
        UC7([Live Preview])
        UC8([Export to Markdown])
        UC9([Copy to Clipboard])
        UC10([View All Syllabi])
        UC11([Export All Syllabi])
        UC12([View Published Syllabus])
        UC13([Manage Settings])
    end

    %% Teacher relationships
    Teacher --- UC1
    Teacher --- UC2
    Teacher --- UC3
    Teacher --- UC4
    Teacher --- UC5
    Teacher --- UC6
    Teacher --- UC7
    Teacher --- UC8
    Teacher --- UC9
    Teacher --- UC13

    %% Admin relationships
    Admin --- UC1
    Admin --- UC2
    Admin --- UC10
    Admin --- UC11
    Admin --- UC4

    %% Student relationships
    Student --- UC12

    %% Include relationships
    UC3 -.->|includes| UC6
    UC4 -.->|includes| UC6
    UC8 -.->|includes| UC7
    UC9 -.->|extends| UC8
```

## Actor Descriptions

| Actor | Description | Authentication |
|-------|-------------|---------------|
| **Teacher** | Primary user. Creates and manages their own syllabi. | Google OAuth (faculty email) |
| **Faculty Admin** | Department administrator. Can view all teachers' syllabi and export them in bulk. | Google OAuth (admin email) |
| **Student** | End consumer. Views the exported/published syllabus. No login required if syllabus is published. | None (public link) |

## Use Case Descriptions

| Use Case | Description |
|----------|-------------|
| Login with Google | User signs in using their Google account (faculty email) |
| View Syllabus List | Teacher sees their own syllabi; Admin sees all syllabi |
| Create New Syllabus | Teacher fills out the มคอ.3 form (multi-section) |
| Edit Syllabus | Teacher modifies an existing syllabus |
| Delete Syllabus | Teacher removes a syllabus (soft delete) |
| Save Draft | Auto-saves or manual save while filling out the form |
| Live Preview | Side-by-side preview of how the Markdown will render |
| Export to Markdown | Downloads a .md file of the completed syllabus |
| Copy to Clipboard | Copies the raw Markdown text to clipboard |
| View All Syllabi | Admin views all teachers' syllabi across the department |
| Export All Syllabi | Admin exports all syllabi as a batch |
| View Published Syllabus | Student views the final published syllabus (read-only) |
| Manage Settings | User updates their profile and preferences |