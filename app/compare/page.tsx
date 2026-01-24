import { prisma } from "@/lib/prisma";
import { getCategoryDisplayName } from "@/lib/category-utils";
import { ProgramCompareTable } from "@/components/ProgramCompareTable";
import { EmptyState } from "@/components/EmptyState";
import { Scale } from "lucide-react";

export default async function ComparePage() {
  // localStorage는 서버 컴포넌트에서 접근할 수 없으므로 클라이언트 컴포넌트로 처리
  // 실제로는 클라이언트 컴포넌트에서 처리해야 함
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">프로그램 비교</h1>
        <p className="text-text-gray">
          선택한 프로그램을 비교하여 최적의 프로그램을 찾아보세요.
        </p>
      </div>
      <ProgramCompareTable />
    </div>
  );
}
