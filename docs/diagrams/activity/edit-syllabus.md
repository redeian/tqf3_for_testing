---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Activity Diagram: Edit Syllabus

```mermaid
flowchart TD
    Start([Teacher logged in]) --> ViewList[View syllabus list]
    ViewList --> ClickEdit[Click edit icon on a syllabus]
    ClickEdit --> LoadSyllabus[Load syllabus from database\nwith all related data]
    
    LoadSyllabus --> CheckOwner{Is teacher the\nowner of this syllabus?}
    CheckOwner -->|No| DenyAccess[Show 'Access denied'\nerror message]
    CheckOwner -->|Yes| ShowForm[Show multi-section form\nwith existing data pre-filled]
    
    ShowForm --> SelectSection[User selects section\nto edit via stepper]
    SelectSection --> EditFields[User modifies fields]
    EditFields --> AutoSave[Auto-save on section\ntransition or debounce]
    
    AutoSave --> CheckStatus{Current syllabus\nstatus?}
    CheckStatus -->|Draft| ContinueEditing[Continue editing\nall sections available]
    CheckStatus -->|Completed| ConfirmEdit{Confirm editing\ncompleted syllabus?}
    
    ConfirmEdit -->|No| ReturnToDashboard[Return to dashboard]
    ConfirmEdit -->|Yes| ChangeToDraft[Change status back\nto 'Draft']
    ChangeToDraft --> ContinueEditing
    
    ContinueEditing --> UserDone{User done\nediting?}
    UserDone -->|No| SelectSection
    UserDone -->|Yes| SaveAll[Save all changes]
    
    SaveAll --> Revalidate[Revalidate dashboard\ncache]
    Revalidate --> ReturnToDashboard
    ReturnToDashboard --> End([End])
    DenyAccess --> End
```

## Notes

- Only the syllabus owner can edit (enforced by `auth()` session check in Server Action)
- Editing a "Completed" syllabus changes its status back to "Draft"
- Auto-save uses the same Server Action as create — `updateSyllabus()`
- All child records (instructors, objectives, materials, etc.) are loaded and editable
- Changes to dynamic lists (add/remove weeks, objectives) are saved per-item