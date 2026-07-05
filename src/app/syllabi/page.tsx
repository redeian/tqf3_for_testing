import Link from "next/link";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { SyllabusList } from "@/components/features/syllabus-list";
import { deleteSyllabus } from "@/actions/syllabus";

export const metadata = {
  title: "Syllabi | TQF3 Syllabus Manager",
};

export default async function SyllabiPage() {
  const syllabi = await db.query.syllabi.findMany({
    orderBy: (syllabi, { desc }) => [desc(syllabi.createdAt)],
  });

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Course Syllabi</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Manage and export your TQF3 syllabi
          </p>
        </div>
        <Link href="/syllabi/new">
          <Button>Create New Syllabus</Button>
        </Link>
      </div>

      <SyllabusList
        syllabi={syllabi.map((s) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        }))}
        onDelete={deleteSyllabus}
      />
    </main>
  );
}
