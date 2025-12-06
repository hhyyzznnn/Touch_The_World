import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const program = await getProgram(params.id);

  if (!program) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/programs" className="text-brand-green-primary hover:text-brand-green-primary/80 hover:underline">
          ← 프로그램 목록으로
        </Link>
      </div>

      <div className="mb-8">
        <div className="text-sm text-brand-green-primary mb-2">{program.category}</div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 break-words">{program.title}</h1>
        {program.summary && (
          <p className="text-lg sm:text-xl text-gray-600 mb-6 break-words">{program.summary}</p>
        )}
      </div>

      {program.images.length > 0 && (
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {program.images.map((image) => (
              <div key={image.id} className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {program.description && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">프로그램 소개</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line text-gray-700 text-sm sm:text-base break-words">{program.description}</p>
          </div>
        </div>
      )}

      {program.schedules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">일정표</h2>
          <div className="space-y-4">
            {program.schedules.map((schedule) => (
              <div key={schedule.id} className="border-l-4 border-brand-green-primary pl-4 py-2">
                <div className="font-semibold mb-1">{schedule.day}일차</div>
                <p className="text-gray-700 whitespace-pre-line">
                  {schedule.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Button asChild size="lg">
          <Link href="/inquiry">이 프로그램 문의하기</Link>
        </Button>
      </div>
    </div>
  );
}

