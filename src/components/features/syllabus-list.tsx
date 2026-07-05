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
