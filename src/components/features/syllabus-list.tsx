"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "./confirm-delete";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      {syllabi.map((syllabus) => (
        <div
          key={syllabus.id}
          className="flex items-center justify-between rounded-xl bg-surface p-4 shadow-sm"
        >
          <div>
            <Link
              href={`/syllabi/${syllabus.id}`}
              className="text-headline-sm text-primary hover:text-secondary hover:underline"
            >
              {syllabus.courseCode} - {syllabus.courseName}
            </Link>
            <p className="text-body-sm text-on-surface-variant">
              Created {syllabus.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/syllabi/${syllabus.id}`}>
              <Button variant="secondary" size="sm">
                View
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteId(syllabus.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      <ConfirmDelete
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await onDelete(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
