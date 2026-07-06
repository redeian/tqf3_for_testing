"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SyllabusForm } from "./syllabus-form";
import { ConfirmDelete } from "./confirm-delete";
import { SyllabusInput } from "@/lib/validations";
import { ActionResult } from "@/lib/types";

type Syllabus = {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt: Date;
  updatedAt: Date;
};

type ViewSyllabusProps = {
  syllabus: Syllabus;
  initialValues: SyllabusInput;
  onUpdate: (input: SyllabusInput) => Promise<ActionResult<void>>;
  onDelete: () => Promise<ActionResult<void>>;
  onExport: () => Promise<ActionResult<string>>;
};

export function ViewSyllabus({
  syllabus,
  initialValues,
  onUpdate,
  onDelete,
  onExport,
}: ViewSyllabusProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "1";
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);

  const filledWeeks = initialValues.weeks.filter(
    (week) => week.topic?.trim() && week.activityType?.trim()
  );

  async function handleExport() {
    setExportError(null);
    startTransition(async () => {
      const result = await onExport();
      if (!result.success) {
        setExportError(result.error);
        return;
      }

      const blob = new Blob([result.data], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${syllabus.courseCode || "syllabus"}-syllabus.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        router.push("/syllabi");
        router.refresh();
      }
    });
  }

  if (isEditing) {
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-headline-lg text-on-surface">Edit Syllabus</h1>
          <Link href="/syllabi">
            <Button variant="secondary">Back to List</Button>
          </Link>
        </div>
        <SyllabusForm
          initialValues={initialValues}
          onSubmit={async (input) => {
            const result = await onUpdate(input);
            if (result.success) {
              router.replace(`/syllabi/${syllabus.id}`);
            }
            return result;
          }}
          submitLabel="Save Changes"
          cancelHref={`/syllabi/${syllabus.id}`}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">
            {syllabus.courseCode} - {syllabus.courseName}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Created {syllabus.createdAt.toLocaleDateString()} · Updated{" "}
            {syllabus.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(`/syllabi/${syllabus.id}?edit=1`)}>
            Edit
          </Button>
          <Button onClick={handleExport} disabled={isPending}>
            {isPending ? "Exporting..." : "Export to Markdown"}
          </Button>
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded-md bg-error-container p-3 text-sm text-on-error-container">
          {exportError}
        </div>
      )}

      <Link
        href="/syllabi"
        className="text-secondary hover:text-secondary-fixed-variant hover:underline"
      >
        ← Back to syllabi list
      </Link>

      <div className="mt-8 rounded-[1rem] bg-surface p-6 shadow-sm">
        <h2 className="text-headline-sm text-primary mb-4">Weekly Plan</h2>
        {filledWeeks.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            No weekly topics have been added yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {filledWeeks.map((week) => (
              <div
                key={week.weekNumber}
                className="grid grid-cols-12 gap-4 rounded-lg bg-surface-container-low p-4 border border-outline-variant"
              >
                <div className="col-span-12 md:col-span-2">
                  <span className="text-label-md text-on-surface-variant">
                    Week {week.weekNumber}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <span className="text-body-md text-on-surface font-semibold">
                    {week.topic}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <span className="inline-flex items-center rounded-full bg-secondary-container/30 px-3 py-1 text-label-md text-on-secondary-container">
                    {week.activityType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDelete
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
