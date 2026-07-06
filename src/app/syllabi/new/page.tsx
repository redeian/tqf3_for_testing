import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusForm } from "@/components/features/syllabus-form";
import { createSyllabus } from "@/actions/syllabus";

export const metadata = {
  title: "Create Syllabus | UTCC TQF3 Manager",
};

export default function NewSyllabusPage() {
  return (
    <DashboardShell>
      <h1 className="mb-6 text-headline-lg text-on-surface">
        Create New Syllabus
      </h1>
      <SyllabusForm
        onSubmit={createSyllabus}
        submitLabel="Save Syllabus"
        cancelHref="/syllabi"
      />
    </DashboardShell>
  );
}
