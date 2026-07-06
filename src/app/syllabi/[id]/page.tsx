import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { syllabi } from "@/db/schema";
import {
  updateSyllabus,
  deleteSyllabus,
  exportSyllabus,
} from "@/actions/syllabus";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ViewSyllabus } from "@/components/features/view-syllabus";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SyllabusDetailPage({ params }: PageProps) {
  const { id } = await params;

  const syllabus = await db.query.syllabi.findFirst({
    where: eq(syllabi.id, id),
    with: {
      weeklySchedules: true,
    },
  });

  if (!syllabus) {
    notFound();
  }

  const weeks = Array.from({ length: 15 }, (_, i) => {
    const existing = syllabus.weeklySchedules.find(
      (w) => w.weekNumber === i + 1
    );
    return {
      weekNumber: i + 1,
      topic: existing?.topic ?? "",
      activityType: existing?.activityType ?? "",
    };
  });

  const initialValues = {
    courseCode: syllabus.courseCode,
    courseName: syllabus.courseName,
    level: syllabus.level as "undergraduate" | "graduate" | "doctoral",
    weeks,
  };

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-2 sm:px-6 lg:px-8">
        <ViewSyllabus
          syllabus={syllabus}
          initialValues={initialValues}
          onUpdate={updateSyllabus.bind(null, id)}
          onDelete={deleteSyllabus.bind(null, id)}
          onExport={exportSyllabus.bind(null, id)}
        />
      </main>
    </DashboardShell>
  );
}
