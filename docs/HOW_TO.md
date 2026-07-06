# 🛠️ How To: Practical Workflow Guide

> **For humans and AI agents.** A decision guide for choosing the right workflow for any task — from a one-line text change to a full feature.

---

## The Core Principle

**Use the minimum process necessary for the risk level of the change.**

| Risk Level | Examples | Workflow |
|-----------|----------|----------|
| 🟢 **Trivial** | Site title, typo, copy text, color hex | Edit directly on `main` |
| 🟡 **Small** | One-line config, button label, CSS tweak | Edit directly or quick branch |
| 🟠 **Moderate** | Logic fix, new component, API tweak | Branch + PR (no worktree) |
| 🔴 **Complex** | New feature, schema change, auth flow | Full Superpowers + worktree |

---

## 🟢 Trivial Changes — Edit Directly on `main`

**When:** The change touches **zero logic, zero data, zero behavior**. It's purely cosmetic or textual.

**Examples:**
- Site/Page title
- Typo in UI text
- Button label
- Color hex value
- Margin/padding value
- Alt text on an image
- Meta description

**Workflow:**

```
1. Tell the agent what to change
2. Agent reads the file, makes the edit
3. Commit directly to main
   git commit -m "fix: update site title to TQF3 Syllabus Manager"
```

**No brainstorming. No worktree. No plan. No TDD. No review cycle.**

---

## 🟡 Small Changes — Edit Directly or Quick Branch

**When:** The change is small but touches a config file, a single CSS class, or a non-critical template.

**Examples:**
- Add a Tailwind utility class
- Change a default value in config
- Update a dependency version
- Rename a CSS class
- Add a missing import

**Workflow (Solo):**

```
1. Tell the agent what to change
2. Agent reads the file, makes the edit
3. Run relevant tests (if any)
4. Commit directly to main
```

**Workflow (Team):**

```
1. Create a lightweight branch (no worktree)
   git checkout -b fix/update-config
2. Make the change
3. Push + open PR
4. Merge after CI passes
```

---

## 🟠 Moderate Changes — Branch + PR

**When:** The change touches **logic, behavior, or data** but is small in scope.

**Examples:**
- Fix a conditional bug
- Add a form validation rule
- Modify an API response
- Add a new UI component
- Refactor a single function

**Workflow:**

```
1. Create a branch (no worktree needed)
   git checkout -b feat/add-validation

2. Make the change with basic testing
   - Write/update tests for the change
   - Implement
   - Run tests: npm test

3. Commit with conventional message
   git commit -m "feat(validation): add email format check"

4. Push + open PR
5. Merge after review + CI passes
```

**No brainstorming. No worktree. No subagents. But DO write tests for the change.**

---

## 🔴 Complex Changes — Full Superpowers Workflow

**When:** The change involves multiple files, new pages, database schema, auth, or any feature that could break things if done wrong.

**Examples:**
- New page/route
- Database schema change
- Authentication flow
- New API endpoint
- File upload system
- Any feature spanning 3+ files

**Workflow:**

```
Step 1: Brainstorming
  → Agent asks questions, proposes approaches
  → You approve a design spec
  → Output: docs/superpowers/specs/YYYY-MM-DD--design.md

Step 2: Worktree
  → Agent creates isolated workspace on new branch
  → Verifies clean test baseline

Step 3: Write Plan
  → Agent breaks into 2-5 min tasks
  → Output: docs/superpowers/plans/YYYY-MM-DD-<feature>.md
  → You review the plan

Step 4: Execute (Subagent-Driven)
  → Fresh subagent per task
  → Each task: TDD (RED→GREEN→REFACTOR)
  → Two-stage review after each task

Step 5: Finish
  → Full test suite verified
  → You choose: merge / PR / keep / discard
```

---

## 📊 Quick Decision Matrix

```
┌─────────────────────────────────────┬──────────┬───────────┬──────────────┐
│             Change Type             │  Solo    │  Team     │  Production  │
├─────────────────────────────────────┼──────────┼───────────┼──────────────┤
│ Site title, typo, copy text         │ main ✅  │ main ✅   │ branch+PR    │
│ Color, margin, CSS tweak            │ main ✅  │ main ✅   │ branch+PR    │
│ Config value, env var               │ main ✅  │ branch    │ branch+PR    │
│ Dependency version bump             │ branch   │ branch+PR │ branch+PR    │
│ Single component change             │ branch   │ branch+PR │ branch+PR    │
│ Bug fix (one function)              │ branch   │ branch+PR │ branch+PR    │
│ New UI component                    │ branch   │ branch+PR │ branch+PR    │
│ New API endpoint                    │ worktree │ worktree  │ worktree     │
│ Database schema change             │ worktree │ worktree  │ worktree     │
│ Auth flow                           │ worktree │ worktree  │ worktree     │
│ New feature (3+ files)              │ worktree │ worktree  │ worktree     │
│ Full page/route                     │ worktree │ worktree  │ worktree     │
└─────────────────────────────────────┴──────────┴───────────┴──────────────┘
```

---

## 🧠 How to Think About It

### Ask These Questions

1. **Does this touch logic, data, or behavior?**
   - No → Edit directly on `main` 🟢
   - Yes → Continue

2. **Can I describe the change in one sentence?**
   - Yes, and it's one file → Branch 🟠
   - No, or multiple files → Superpowers 🔴

3. **Could this break something if done wrong?**
   - No → Branch 🟠
   - Yes → Superpowers + worktree 🔴

4. **Does this need a database migration?**
   - Yes → Superpowers + worktree 🔴 (always)

### The 30-Second Rule

If you can make the change in **under 30 seconds** and it touches **zero logic/data/behavior**, go straight to `main`.

---

## 🛠️ Common Scenarios

### Scenario 1: "Change the site title"

```
You: "Change the site title to 'TQF3 Syllabus Manager'"
Agent: Reads layout.tsx → edits <title> tag → commits to main
Time: ~10 seconds
```

### Scenario 2: "Fix a typo in the login form"

```
You: "Fix 'Welcom' to 'Welcome' on the login page"
Agent: Reads login page → fixes typo → commits to main
Time: ~10 seconds
```

### Scenario 3: "Add email validation to the registration form"

```
You: "Add email format validation to the registration form"
Agent: Creates branch → adds Zod validation → writes test → commits → PR
Time: ~2 minutes
```

### Scenario 4: "Add a dashboard page"

```
You: "Add a dashboard page showing course statistics"
Agent: Brainstorms → worktree → writes plan → subagents execute TDD → review → finish
Time: ~15-30 minutes (autonomous)
```

### Scenario 5: "Add a new database table for student grades"

```
You: "Add a grades table to track student scores"
Agent: Brainstorms schema → worktree → plan → TDD → migration → review → finish
Time: ~20-40 minutes (autonomous)
```

---

## 📝 Summary

| If you're changing... | Do this |
|----------------------|---------|
| Text, copy, labels | Edit on `main` ✅ |
| Colors, spacing, CSS | Edit on `main` ✅ |
| Config, env vars | Branch or `main` |
| One function/component | Branch + test |
| Multiple files/features | Superpowers + worktree |
| Database schema | Superpowers + worktree 🔴 |
| Auth/security | Superpowers + worktree 🔴 |

**When in doubt:** If the change feels "risky" or "complex," use Superpowers. If it feels "obvious" and "safe," just edit.

**The goal is not to follow process for its own sake — it's to match the process to the risk.**
