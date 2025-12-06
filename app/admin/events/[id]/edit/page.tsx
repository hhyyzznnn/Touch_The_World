import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/EventForm";

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      school: true,
      program: true,
      images: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-medium mb-8">진행 내역 수정</h1>
      <EventForm event={event} />
    </div>
  );
}

