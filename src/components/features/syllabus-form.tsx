"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPES, SyllabusInput } from "@/lib/validations";
import { ActionResult } from "@/lib/types";

type SyllabusFormProps = {
  initialValues?: SyllabusInput;
  onSubmit: (input: SyllabusInput) => Promise<ActionResult<unknown>>;
  submitLabel: string;
  cancelHref?: string;
};

const DEFAULT_WEEKS: SyllabusInput["weeks"] = Array.from(
  { length: 15 },
  (_, i) => ({
    weekNumber: i + 1,
    topic: "",
    activityType: "",
  })
);

const activityOptions = [
  { value: "", label: "-- Select activity --" },
  ...ACTIVITY_TYPES.map((type) => ({ value: type, label: type })),
];

export function SyllabusForm({
  initialValues,
  onSubmit,
  submitLabel,
  cancelHref = "/syllabi",
}: SyllabusFormProps) {
  const router = useRouter();
  const [courseCode, setCourseCode] = useState(
    initialValues?.courseCode ?? ""
  );
  const [courseName, setCourseName] = useState(
    initialValues?.courseName ?? ""
  );
  const [weeks, setWeeks] = useState<SyllabusInput["weeks"]>(
    initialValues?.weeks ?? DEFAULT_WEEKS
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateWeek(
    index: number,
    field: "topic" | "activityType",
    value: string
  ) {
    setWeeks((prev) =>
      prev.map((week, i) => (i === index ? { ...week, [field]: value } : week))
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const result = await onSubmit({
      courseCode,
      courseName,
      weeks,
    });

    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const redirectTarget =
      typeof result.data === "object" &&
      result.data !== null &&
      "id" in result.data &&
      typeof result.data.id === "string"
        ? `/syllabi/${result.data.id}`
        : cancelHref;

    router.push(redirectTarget);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="e.g., CS101"
          required
        />
        <Input
          label="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g., Introduction to Programming"
          required
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-headline-sm text-primary">Weekly Plan</h2>
        <div className="flex flex-col gap-4">
          {weeks.map((week, index) => (
            <div
              key={week.weekNumber}
              className="grid grid-cols-12 gap-4 rounded-lg bg-surface p-4 shadow-sm"
            >
              <div className="col-span-12 md:col-span-1">
                <span className="text-label-md text-on-surface-variant">
                  Week {week.weekNumber}
                </span>
              </div>
              <div className="col-span-12 md:col-span-7">
                <Input
                  label={`Topic (Week ${week.weekNumber})`}
                  value={week.topic}
                  onChange={(e) => updateWeek(index, "topic", e.target.value)}
                  placeholder="Enter topic for this week"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <Select
                  label={`Activity (Week ${week.weekNumber})`}
                  value={week.activityType}
                  onChange={(e) =>
                    updateWeek(index, "activityType", e.target.value)
                  }
                  options={activityOptions}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-error-container p-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(cancelHref)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
