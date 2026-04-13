import { CompanyNewsForm } from "@/components/CompanyNewsForm";

export default function NewProgramPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">새 프로그램 카드뉴스</h1>
      <CompanyNewsForm redirectPath="/admin/programs" />
    </div>
  );
}
