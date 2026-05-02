import { InquiryForm } from "@/components/InquiryForm";

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialMode = type === "detailed" ? "detailed" : "quick";
  return <InquiryForm initialMode={initialMode} />;
}
