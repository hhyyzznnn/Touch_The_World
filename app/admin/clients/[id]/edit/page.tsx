import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/ClientForm";
import { notFound } from "next/navigation";

async function getClient(id: string) {
  return await prisma.client.findUnique({
    where: { id },
  });
}

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="py-2">
      <h1 className="text-3xl font-bold mb-8">고객사 수정</h1>
      <ClientForm client={client} />
    </div>
  );
}
