"use client";

import { Button } from "@/components/ui/button";

type ConfirmDeleteProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDelete({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmDeleteProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-on-surface">
          Delete Syllabus
        </h2>
        <p className="mt-2 text-on-surface-variant">
          Are you sure you want to delete this syllabus? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
