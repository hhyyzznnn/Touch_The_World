import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// 동적 import로 번들 크기 최적화
const ProgramForm = dynamic(
  () => import("@/components/ProgramForm").then((mod) => ({ default: mod.ProgramForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

export default function NewProgramPage() {
  return (
    <div className="mx-auto max-w-4xl w-full">
      <h1 className="text-3xl font-bold mb-8 text-center">새 프로그램 추가</h1>
      <ProgramForm />
    </div>
  );
}

