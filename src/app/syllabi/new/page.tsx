import { SyllabusForm } from "@/components/features/syllabus-form";
import { createSyllabus } from "@/actions/syllabus";

export const metadata = {
  title: "Create Syllabus | TQF3 Syllabus Manager",
};

export default function NewSyllabusPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-headline-lg text-on-surface">
        Create New Syllabus
      </h1>
      <SyllabusForm
        onSubmit={createSyllabus}
        submitLabel="Save Syllabus"
        cancelHref="/syllabi"
      />
    </main>
  );
}
