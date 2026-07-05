"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-bold text-on-surface">Edit Syllabus</h1>
          <Link href="/syllabi">
            <Button variant="secondary">Back to List</Button>
          </Link>
        </div>
        <SyllabusForm
          initialValues={initialValues}
          onSubmit={async (input) => {
            const result = await onUpdate(input);
            if (result.success) {
              setIsEditing(false);
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
          <h1 className="text-3xl font-bold text-on-surface">
            {syllabus.courseCode} - {syllabus.courseName}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Created {syllabus.createdAt.toLocaleDateString()} · Updated{" "}
            {syllabus.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
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

      <Link href="/syllabi" className="text-secondary hover:underline">
        ← Back to syllabi list
      </Link>

      <ConfirmDelete
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
