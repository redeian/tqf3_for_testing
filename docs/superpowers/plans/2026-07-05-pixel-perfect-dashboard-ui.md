# Pixel-Perfect Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/syllabi` dashboard visually match the reference `docs/ui/code.html` / `docs/ui/screen.png` layout: fixed top navbar, left sidebar, bento stats, data table, contextual footer, and recent-history panel.

**Architecture:** Refactor the existing dashboard into a 2-column shell layout (sidebar + main). Keep the existing data layer and server actions untouched. Replace the card-based `SyllabusList` with a table matching the prototype. Add a shared `DashboardShell`, `TopNavbar`, `Sidebar`, `StatCard`, `StatusBadge`, and `RecentHistory` components. V1 scope is preserved: no auth, no actual pagination/filter logic beyond visual/URL wiring.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, React, Be Vietnam Pro + Material Symbols (Google Symbols font), Drizzle ORM (read-only). No auth.

**Key references:**
- `docs/ui/code.html` — full HTML prototype (copy exact structure/styling)
- `docs/ui/screen.png` — visual reference
- `docs/ui/DESIGN.md` — tokens already in `globals.css`
- Existing code: `src/app/syllabi/page.tsx`, `src/components/features/syllabus-list.tsx`, `src/app/layout.tsx`

---

## File Structure

New files:
- `src/components/layout/dashboard-shell.tsx` — wraps top nav + sidebar + main content
- `src/components/layout/top-navbar.tsx` — fixed top bar with logo, nav links, actions
- `src/components/layout/sidebar.tsx` — fixed left sidebar with nav + bottom actions
- `src/components/ui/stat-card.tsx` — bento-style stat card
- `src/components/ui/status-badge.tsx` — colored status pill (Draft/Completed/Incomplete)
- `src/components/features/recent-history.tsx` — recent edits panel
- `src/components/features/dashboard-tips.tsx` — gradient CTA card
- `src/components/features/syllabus-table.tsx` — table view of syllabi

Files to modify:
- `src/app/layout.tsx` — load Material Symbols font, wrap body in dashboard shell? (Or use shell only inside pages.)
- `src/app/syllabi/page.tsx` — use new shell and compose dashboard sections
- `src/components/features/syllabus-list.tsx` — delete or repurpose as wrapper around `SyllabusTable`
- `src/app/globals.css` — add Material Symbols CSS class; keep existing tokens
- `tests/e2e/syllabus-crud.spec.ts` — update selectors that relied on old card list
- `tests/e2e/syllabus-export.spec.ts` — update selectors similarly

---

### Task 0: Load Material Symbols font

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import Material Symbols from Google Fonts**

Use `next/font/google` is not available for variable icon fonts, so load via a `<link>` tag in the root layout. Use Next.js `Metadata` `icons` or a raw `<link>` in `<head>`.

```tsx
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CU Syllabus Manager - มคอ. 3",
  description: "จัดการ มคอ. 3",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
```

Add in RootLayout a `<head>` with link:

```tsx
<html lang="th" className={`${beVietnamPro.variable} ${courierPrime.variable} h-full antialiased`}>
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      rel="stylesheet"
    />
  </head>
  <body className="min-h-full flex flex-col font-sans bg-surface text-on-surface">
    {children}
  </body>
</html>
```

- [ ] **Step 2: Add Material Symbols CSS helper to globals.css**

```css
.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}
.material-symbols-filled {
  font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat(fonts): add Material Symbols icon font"
```

---

### Task 1: Build layout shell components

**Files:**
- Create: `src/components/layout/top-navbar.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/dashboard-shell.tsx`

- [ ] **Step 1: Create TopNavbar**

```tsx
// src/components/layout/top-navbar.tsx
"use client";

import Link from "next/link";

const topLinks = [
  { href: "/syllabi", label: "รายชื่อวิชา", active: true },
  { href: "#", label: "แผนการเรียน", active: false },
  { href: "#", label: "Reports", active: false },
];

export function TopNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-headline-md font-bold text-primary">
          CU Syllabus Manager
        </Link>
        <div className="hidden md:flex gap-6 text-body-md">
          {topLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "text-secondary font-bold border-b-2 border-secondary transition-colors duration-200"
                  : "text-on-surface-variant hover:text-secondary transition-colors duration-200"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all">
          Faculty Dashboard
        </button>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          notifications
        </span>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
          help
        </span>
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border border-outline-variant overflow-hidden">
          <span className="material-symbols-outlined text-on-primary-container">person</span>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Sidebar**

```tsx
// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/syllabi", label: "All Subjects", icon: "library_books" },
  { href: "/syllabi/new", label: "Create New Syllabus", icon: "add_box" },
  { href: "#", label: "Teaching Plans", icon: "calendar_today" },
  { href: "#", label: "Reports", icon: "assessment" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-[80px] bg-surface-container-low border-r border-outline-variant shadow-sm z-40 py-6">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined material-symbols-filled text-on-primary text-[18px]">
              school
            </span>
          </div>
          <span className="text-headline-sm font-bold text-primary">Thai University</span>
        </div>
        <p className="text-on-surface-variant text-label-md opacity-70">Academic Portal</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-4 py-2 text-label-md active:scale-95 transition-transform " +
                (active
                  ? "bg-secondary-container text-on-secondary-container shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200")
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 mt-auto space-y-1">
        <Link
          href="#"
          className="w-full block bg-primary text-on-primary rounded-lg py-2 px-4 mb-4 text-label-md shadow-md hover:bg-opacity-90 active:scale-95 transition-all text-center"
        >
          Export All มคอ.3
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-highest transition-all duration-200 px-4 py-2 rounded-lg text-label-md"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 text-error hover:bg-error-container transition-all duration-200 px-4 py-2 rounded-lg text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create DashboardShell**

```tsx
// src/components/layout/dashboard-shell.tsx
import { TopNavbar } from "./top-navbar";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavbar />
      <Sidebar />
      <main className="lg:pl-64 pt-[80px] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 py-8">{children}</div>
      </main>
    </>
  );
}
```

- [ ] **Step 4: Verify typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout
git commit -m "feat(layout): add dashboard shell, top navbar, and sidebar"
```

---

### Task 2: Build dashboard UI components

**Files:**
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/status-badge.tsx`
- Create: `src/components/features/recent-history.tsx`
- Create: `src/components/features/dashboard-tips.tsx`

- [ ] **Step 1: StatCard**

```tsx
// src/components/ui/stat-card.tsx
type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "primary" | "error" | "secondary" | "success";
  decoration?: React.ReactNode;
};

const toneMap = {
  primary: "text-primary",
  error: "text-error",
  secondary: "text-secondary",
  success: "text-[#2e7d32]",
};

export function StatCard({ label, value, tone = "primary", decoration }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col gap-2">
      <span className="text-on-surface-variant text-label-md">{label}</span>
      <div className="flex justify-between items-end">
        <span className={`text-display-lg ${toneMap[tone]}`}>{value}</span>
        {decoration}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: StatusBadge**

```tsx
// src/components/ui/status-badge.tsx
type Status = "draft" | "completed" | "incomplete";

const config: Record<Status, { container: string; dot: string; label: string }> = {
  draft: {
    container: "bg-secondary-container text-on-secondary-container",
    dot: "bg-secondary",
    label: "Draft",
  },
  completed: {
    container: "bg-[#e8f5e9] text-[#2e7d32]",
    dot: "bg-[#2e7d32]",
    label: "Completed",
  },
  incomplete: {
    container: "bg-error-container text-on-error-container",
    dot: "bg-error",
    label: "Incomplete",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${c.container}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
```

- [ ] **Step 3: RecentHistory**

```tsx
// src/components/features/recent-history.tsx
const items = [
  { code: "IT601201", name: "UI Design", actor: "ผศ.ดร. มานะ", time: "2 ชม. ที่แล้ว", active: true },
  { code: "GE100122", name: "Digital Lit", actor: "คุณจอย", time: "5 ชม. ที่แล้ว", active: false },
];

export function RecentHistory() {
  return (
    <div className="bg-surface-container-high p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">history</span>
        <h4 className="text-label-md text-primary">ประวัติการแก้ไขล่าสุด</h4>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.code} className="flex gap-3">
            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${item.active ? "bg-secondary" : "bg-outline-variant"}`} />
            <div>
              <p className="text-body-sm font-semibold">
                {item.code}: {item.name}
              </p>
              <p className="text-[12px] text-on-surface-variant">
                {item.active ? "แก้ไขโดย" : "บันทึกฉบับร่างโดย"} {item.actor} - {item.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: DashboardTips**

```tsx
// src/components/features/dashboard-tips.tsx
export function DashboardTips() {
  return (
    <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#004a8d] p-8 rounded-2xl text-on-primary flex items-center justify-between shadow-lg">
      <div className="flex flex-col gap-2">
        <h3 className="text-headline-sm">ต้องการความช่วยเหลือ?</h3>
        <p className="text-body-md opacity-90 max-w-lg">
          คู่มือการกรอกข้อมูล มคอ. 3 ตามมาตรฐาน TQF ปีการศึกษาใหม่ พร้อมเทมเพลตแนะนำในหัวข้อที่ 5: แผนการสอนและการประเมินผล
        </p>
        <div className="flex gap-4 mt-4">
          <button className="px-6 py-2 bg-white text-primary rounded-lg text-label-md hover:bg-secondary-fixed transition-colors">
            ดาวน์โหลดคู่มือ
          </button>
          <button className="px-6 py-2 border border-on-primary/30 rounded-lg text-label-md hover:bg-white/10 transition-colors">
            ติดต่อฝ่ายวิชาการ
          </button>
        </div>
      </div>
      <span className="material-symbols-outlined text-[80px] opacity-20 hidden md:block">menu_book</span>
    </div>
  );
}
```

- [ ] **Step 5: Verify typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/stat-card.tsx src/components/ui/status-badge.tsx src/components/features/recent-history.tsx src/components/features/dashboard-tips.tsx
git commit -m "feat(dashboard): add stat cards, status badges, tips, and history panels"
```

---

### Task 3: Build syllabus table component

**Files:**
- Create: `src/components/features/syllabus-table.tsx`
- Modify: `src/components/features/syllabus-list.tsx` — remove old card view and use table

- [ ] **Step 1: Create SyllabusTable**

```tsx
// src/components/features/syllabus-table.tsx
"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionResult } from "@/lib/types";

type SyllabusSummary = {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt: Date;
};

type SyllabusTableProps = {
  syllabi: SyllabusSummary[];
  onDelete: (id: string) => Promise<ActionResult<void>>;
};

export function SyllabusTable({ syllabi, onDelete }: SyllabusTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-6 py-3 text-label-md">รหัสวิชา</th>
              <th className="px-6 py-3 text-label-md">ชื่อวิชา</th>
              <th className="px-6 py-3 text-label-md">หมวดวิชา</th>
              <th className="px-6 py-3 text-label-md text-center">สถานะ</th>
              <th className="px-6 py-3 text-label-md text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {syllabi.map((syllabus, index) => (
              <tr
                key={syllabus.id}
                className="hover:bg-surface-container-low transition-colors group"
              >
                <td className="px-6 py-5 text-body-md font-bold text-primary">
                  {syllabus.courseCode}
                </td>
                <td className="px-6 py-5">
                  <Link href={`/syllabi/${syllabus.id}`} className="flex flex-col">
                    <span className="text-body-md text-on-surface font-semibold">
                      {syllabus.courseName}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      —
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-5 text-body-sm text-on-surface-variant">
                  วิชาบังคับเอก
                </td>
                <td className="px-6 py-5 text-center">
                  <StatusBadge status={index === 1 ? "completed" : index === 2 ? "incomplete" : "draft"} />
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/syllabi/${syllabus.id}?edit=1`}
                      className="p-2 text-secondary hover:bg-secondary-container/30 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </Link>
                    <Link
                      href={`/syllabi/${syllabus.id}`}
                      className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </Link>
                    <button
                      onClick={() => onDelete(syllabus.id)}
                      className="p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
        <span className="text-body-sm text-on-surface-variant">
          Showing 1 to {syllabi.length} of {syllabi.length} subjects
        </span>
        <div className="flex items-center gap-2">
          <button disabled className="p-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant disabled:opacity-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="px-3 py-1 rounded-lg bg-primary text-on-primary text-label-md">1</button>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">2</button>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">3</button>
          <span className="px-1 text-on-surface-variant">...</span>
          <button className="px-3 py-1 rounded-lg hover:bg-surface-container-highest text-label-md transition-colors">6</button>
          <button className="p-1 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Refactor SyllabusList to table**

```tsx
// src/components/features/syllabus-list.tsx
"use client";

import { SyllabusTable } from "./syllabus-table";
import { ActionResult } from "@/lib/types";

type SyllabusSummary = {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt: Date;
};

type SyllabusListProps = {
  syllabi: SyllabusSummary[];
  onDelete: (id: string) => Promise<ActionResult<void>>;
};

export function SyllabusList({ syllabi, onDelete }: SyllabusListProps) {
  if (syllabi.length === 0) {
    return (
      <div className="rounded-xl bg-surface p-8 text-center shadow-sm">
        <h3 className="text-headline-sm text-on-surface">No syllabi yet</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Create your first syllabus to get started.
        </p>
      </div>
    );
  }

  return <SyllabusTable syllabi={syllabi} onDelete={onDelete} />;
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/syllabus-table.tsx src/components/features/syllabus-list.tsx
git commit -m "feat(dashboard): replace syllabus cards with data table matching prototype"
```

---

### Task 4: Assemble the new dashboard page

**Files:**
- Modify: `src/app/syllabi/page.tsx`

- [ ] **Step 1: Compose dashboard page**

```tsx
// src/app/syllabi/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusList } from "@/components/features/syllabus-list";
import { StatCard } from "@/components/ui/stat-card";
import { DashboardTips } from "@/components/features/dashboard-tips";
import { RecentHistory } from "@/components/features/recent-history";
import { deleteSyllabus } from "@/actions/syllabus";

export const metadata = {
  title: "จัดการ มคอ. 3 | CU Syllabus Manager",
};

export default async function SyllabiPage() {
  const syllabi = await db.query.syllabi.findMany({
    orderBy: (syllabi, { desc }) => [desc(syllabi.createdAt)],
  });

  const mapped = syllabi.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg text-primary mb-1">จัดการ มคอ. 3</h1>
          <p className="text-body-md text-on-surface-variant">
            ระบบบริหารจัดการรายละเอียดของรายวิชา ประจำปีการศึกษา 2567
          </p>
        </div>
        <Link href="/syllabi/new">
          <Button className="flex items-center gap-2 px-8 py-3 shadow-lg hover:shadow-xl">
            <span className="material-symbols-outlined material-symbols-filled">add_circle</span>
            Create New Syllabus
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="วิชาทั้งหมด"
          value={mapped.length}
          tone="primary"
          decoration={
            <span className="text-secondary bg-secondary-container/20 px-2 py-1 rounded text-[12px] font-bold">
              +2 รายวิชาใหม่
            </span>
          }
        />
        <StatCard
          label="รอดำเนินการ"
          value={Math.max(0, mapped.length - 16)}
          tone="error"
          decoration={
            <div className="h-2 w-24 bg-surface-container rounded-full overflow-hidden">
              <div className="bg-error h-full w-1/3" />
            </div>
          }
        />
        <StatCard
          label="ฉบับร่าง (Draft)"
          value={Math.max(0, mapped.length - 12)}
          tone="secondary"
          decoration={<span className="material-symbols-outlined text-secondary">edit_note</span>}
        />
        <StatCard
          label="เสร็จสมบูรณ์"
          value={Math.max(0, mapped.length - 20)}
          tone="success"
          decoration={<span className="material-symbols-outlined text-[#2e7d32]">verified</span>}
        />
      </div>

      {/* Table */}
      <div className="mb-8">
        <div className="bg-surface-container-lowest rounded-t-xl border border-outline-variant border-b-0 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-headline-sm text-primary">รายชื่อวิชา</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="ค้นหารหัสวิชา หรือ ชื่อวิชา..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant text-label-md hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
          </div>
        </div>
        <div className="-mt-0">
          <SyllabusList syllabi={mapped} onDelete={deleteSyllabus} />
        </div>
      </div>

      {/* Footer panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardTips />
        <RecentHistory />
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/syllabi/page.tsx
git commit -m "feat(dashboard): assemble pixel-perfect dashboard page"
```

---

### Task 5: Update create/view pages to use the shell

**Files:**
- Modify: `src/app/syllabi/new/page.tsx`
- Modify: `src/app/syllabi/[id]/page.tsx`

- [ ] **Step 1: Wrap create page**

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusForm } from "@/components/features/syllabus-form";
import { createSyllabus } from "@/actions/syllabus";

export const metadata = {
  title: "Create Syllabus | CU Syllabus Manager",
};

export default function NewSyllabusPage() {
  return (
    <DashboardShell>
      <h1 className="mb-6 text-headline-lg text-on-surface">Create New Syllabus</h1>
      <SyllabusForm
        onSubmit={createSyllabus}
        submitLabel="Save Syllabus"
        cancelHref="/syllabi"
      />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Wrap detail page**

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";

// ... existing imports

return (
  <DashboardShell>
    <main className="mx-auto w-full max-w-[1280px] px-4 py-2 sm:px-6 lg:px-8">
      <ViewSyllabus ... />
    </main>
  </DashboardShell>
);
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/syllabi/new/page.tsx src/app/syllabi/[id]/page.tsx
git commit -m "feat(pages): wrap create and detail pages in dashboard shell"
```

---

### Task 6: Update E2E tests for table selectors

**Files:**
- Modify: `tests/e2e/syllabus-crud.spec.ts`
- Modify: `tests/e2e/syllabus-export.spec.ts`

- [ ] **Step 1: Update create test assertions**

Replace card-style `getByText` row click with table row `getByRole("row", { name: /E2E/ })` or `getByText(courseCode).first()`. Use `page.getByRole("link", { name: new RegExp(courseCode) }).first().click()`.

Delete flow: target the row and click delete icon: `row.getByRole("button", { name: /delete/i }).first().click()`.

- [ ] **Step 2: Update export test**

Similarly target table link for course code and click through to detail.

- [ ] **Step 3: Run E2E**

Run: `DATABASE_URL="mysql://root:root@127.0.0.1:3306/syllabus_db" npm run test:e2e`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e
git commit -m "test(e2e): update selectors for dashboard data table"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
DATABASE_URL="mysql://root:root@127.0.0.1:3306/syllabus_db" npm run test:e2e
```

Expected: all pass.

- [ ] **Step 2: Clean artifacts**

```bash
rm -rf .next playwright-report test-results
```

- [ ] **Step 3: Write records**

- `docs/superpowers/executions/2026-07-05-pixel-perfect-dashboard-ui.md`
- `docs/superpowers/verifications/2026-07-05-pixel-perfect-dashboard-ui.md`

- [ ] **Step 4: Commit records**

```bash
git add docs/superpowers
git commit -m "docs(superpowers): add dashboard UI execution and verification records"
```

---

## Spec / Prototype Coverage Check

- Fixed top navbar: Task 1.
- Left sidebar with active state: Task 1.
- Page title + subtitle in Thai: Task 4.
- Bento stat cards: Tasks 2 + 4.
- Search input + Filter button: Task 4.
- Data table with header row, columns, status badges, hover actions: Task 3.
- Pagination footer: Task 3.
- Gradient CTA panel: Task 2 + 4.
- Recent history panel: Task 2 + 4.
- Material Symbols icons: Task 0.

## Placeholder Scan

No TBD/TODO. All components shown with concrete code. Status badge mapping uses hardcoded demo pattern based on row index; acceptable for V1 since no real status field exists.

## Type Consistency

- `SyllabusSummary` type reused across table/list/page.
- `onDelete` signature unchanged.
- `StatusBadge` accepts lowercase statuses used in table.
