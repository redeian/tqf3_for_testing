import Link from "next/link";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { syllabi } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusList } from "@/components/features/syllabus-list";
import { StatCard } from "@/components/ui/stat-card";
import { LevelSummary } from "@/components/features/level-summary";
import { DashboardTips } from "@/components/features/dashboard-tips";
import { RecentHistory } from "@/components/features/recent-history";
import { deleteSyllabus } from "@/actions/syllabus";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "จัดการ มคอ. 3 | UTCC TQF3 Manager",
};

export default async function SyllabiPage() {
  const syllabusList = await db.query.syllabi.findMany({
    orderBy: (syllabi, { desc }) => [desc(syllabi.createdAt)],
  });

  const mapped = syllabusList.map((s) => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }));

  const levelCounts = await db
    .select({
      level: syllabi.level,
      count: count(),
    })
    .from(syllabi)
    .groupBy(syllabi.level)
    .then((rows) =>
      rows.map((r) => ({
        level: r.level as "undergraduate" | "graduate" | "doctoral",
        count: r.count,
      }))
    );

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg text-primary mb-1">
            จัดการ มคอ. 3
          </h1>
          <p className="text-body-md text-on-surface-variant">
            ระบบบริหารจัดการรายละเอียดของรายวิชา ประจำปีการศึกษา 2567
          </p>
        </div>
        <Link href="/syllabi/new">
          <Button className="flex items-center gap-2 px-8 py-3 shadow-lg hover:shadow-xl">
            <span className="material-symbols-outlined material-symbols-filled">
              add_circle
            </span>
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
          decoration={
            <span className="material-symbols-outlined text-secondary">
              edit_note
            </span>
          }
        />
        <StatCard
          label="เสร็จสมบูรณ์"
          value={Math.max(0, mapped.length - 20)}
          tone="success"
          decoration={
            <span className="material-symbols-outlined text-[#2e7d32]">
              verified
            </span>
          }
        />
      </div>

      {/* Level Summary */}
      <LevelSummary counts={levelCounts} />

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
