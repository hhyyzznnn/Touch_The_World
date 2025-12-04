import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SchoolForm } from "@/components/SchoolForm";

async function getSchool(id: string) {
  return await prisma.school.findUnique({
    where: { id },
  });
}

export default async function EditSchoolPage({
  params,
}: {
  params: { id: string };
}) {
  const school = await getSchool(params.id);

  if (!school) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">학교 수정</h1>
      <SchoolForm school={school} />
    </div>
  );
}

