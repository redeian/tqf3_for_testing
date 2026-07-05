---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Activity Diagram: Export Syllabus

```mermaid
flowchart TD
    Start([Syllabus open in\nedit or view mode]) --> ClickExport[Click 'Export' button]
    
    ClickExport --> CheckComplete{All required\nfields filled?}
    CheckComplete -->|No| ShowWarning[Show warning:\n'Incomplete sections will\nbe marked in export']
    ShowWarning --> ConfirmExport{User continues?}
    ConfirmExport -->|No| BackToEdit[Return to editing]
    ConfirmExport -->|Yes| GenerateMD
    CheckComplete -->|Yes| GenerateMD[Generate Markdown\nfrom syllabus data]
    
    GenerateMD --> BuildSections[Build MD sections:\n# Course Info\n## Instructor\n## Objectives\n## Grading\n## Weekly Plan\n## Policies]
    
    BuildSections --> FormatMD[Format as clean Markdown:\nHeaders, Lists, Tables,\nBold, Italics]
    FormatMD --> ShowPreview[Show Live Preview\nof generated Markdown]
    
    ShowPreview --> UserChoice{User chooses}
    UserChoice -->|Download .md| DownloadFile[Trigger browser\ndownload of .md file]
    UserChoice -->|Copy to clipboard| CopyMD[Copy raw Markdown\nto clipboard]
    UserChoice -->|Edit more| BackToEdit
    
    DownloadFile --> ShowToast[Show success toast:\n'Downloaded successfully']
    CopyMD --> ShowToast
    
    ShowToast --> Done([End])
    BackToEdit --> Done
```

## Notes

- Export is available from both **Edit mode** and **View mode**
- The Markdown file is named: `{course_code}_{term}.md` (e.g., `IT601201_2567-1.md`)
- Incomplete sections are included but marked with `> ⚠️ This section is incomplete`
- Grading breakdown is rendered as a Markdown table
- Weekly schedule is rendered as a Markdown table
- The "Copy to Clipboard" option uses the browser's Clipboard API
- No server-side file storage — the .md file is generated client-side and downloaded directly