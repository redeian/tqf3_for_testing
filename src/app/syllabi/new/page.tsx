import { redirect } from "next/navigation";
import { SyllabusForm } from "@/components/features/syllabus-form";
import { createSyllabus } from "@/actions/syllabus";
import { SyllabusInput } from "@/lib/validations";

export const metadata = {
  title: "Create Syllabus | TQF3 Syllabus Manager",
};

export default function NewSyllabusPage() {
  async function handleCreate(input: SyllabusInput) {
    const result = await createSyllabus(input);
    if (result.success) {
      redirect(`/syllabi/${result.data.id}`);
    }
    return result;
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-on-surface">
        Create New Syllabus
      </h1>
      <SyllabusForm onSubmit={handleCreate} submitLabel="Save Syllabus" />
    </main>
  );
}
