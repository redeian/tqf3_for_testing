import { count } from "drizzle-orm";
import { db } from "@/db";
import { syllabi } from "@/db/schema";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusList } from "@/components/features/syllabus-list";
import { StatCard } from "@/components/ui/stat-card";
import { deleteSyllabus } from "@/actions/syllabus";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "รายงานสรุป | CU Syllabus Manager",
};

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: "ปริญญาตรี",
  graduate: "ปริญญาโท",
  doctoral: "ปริญญาเอก",
};

const LEVEL_COLORS: Record<string, string> = {
  undergraduate: "#6750a4",
  graduate: "#2e7d32",
  doctoral: "#e65100",
};

export default async function ReportsPage() {
  const allSyllabi = await db.query.syllabi.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });

  const mapped = allSyllabi.map((s) => ({
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

  const total = levelCounts.reduce((sum, c) => sum + c.count, 0);

  // Build conic-gradient for pie chart
  let cumulativePercent = 0;
  const gradientParts = levelCounts.map(({ level, count }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += pct;
    const color = LEVEL_COLORS[level] || "#ccc";
    return `${color} ${start}% ${cumulativePercent}%`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-lg text-primary mb-1">
          รายงานสรุปสำหรับผู้บริหาร
        </h1>
        <p className="text-body-md text-on-surface-variant">
          ภาพรวมหลักสูตรทั้งหมดแยกตามระดับการศึกษา
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="วิชาทั้งหมด" value={total} tone="primary" />
        {levelCounts.map(({ level, count }) => (
          <StatCard
            key={level}
            label={LEVEL_LABELS[level] || level}
            value={count}
            tone="primary"
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h2 className="text-headline-sm text-primary mb-4">
            สัดส่วนหลักสูตร (Bar Chart)
          </h2>
          <div className="space-y-3">
            {levelCounts.map(({ level, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-24 text-body-sm text-on-surface font-medium shrink-0">
                    {LEVEL_LABELS[level] || level}
                  </span>
                  <div className="flex-1 h-6 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: LEVEL_COLORS[level],
                      }}
                    />
                  </div>
                  <span className="w-16 text-body-sm text-on-surface-variant text-right shrink-0">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h2 className="text-headline-sm text-primary mb-4">
            สัดส่วนหลักสูตร (Pie Chart)
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-48 h-48 rounded-full shadow-lg"
              style={{ background: conicGradient }}
            />
            <div className="flex flex-wrap gap-4 justify-center">
              {levelCounts.map(({ level, count }) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LEVEL_COLORS[level] }}
                    />
                    <span className="text-body-sm text-on-surface">
                      {LEVEL_LABELS[level] || level} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="mb-8">
        <div className="bg-surface-container-lowest rounded-t-xl border border-outline-variant border-b-0 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-headline-sm text-primary">รายชื่อวิชาทั้งหมด</h2>
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
          </div>
        </div>
        <div className="-mt-0">
          <SyllabusList syllabi={mapped} onDelete={deleteSyllabus} />
        </div>
      </div>
    </DashboardShell>
  );
}
