import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProgramForm } from "@/components/ProgramForm";

async function getProgram(id: string) {
  return await prisma.program.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
      },
      schedules: {
        orderBy: { day: "asc" },
      },
    },
  });
}

export default async function EditProgramPage({
  params,
}: {
  params: { id: string };
}) {
  const program = await getProgram(params.id);

  if (!program) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">프로그램 수정</h1>
      <ProgramForm program={program} />
    </div>
  );
}

