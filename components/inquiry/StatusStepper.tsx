import { Check } from "lucide-react";

const STEPS = [
  { value: "pending", label: "접수됨" },
  { value: "reviewing", label: "검토 중" },
  { value: "quoted", label: "견적 발송" },
  { value: "completed", label: "완료" },
] as const;

export function StatusStepper({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.value === status);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-start w-full">
      {STEPS.map((step, i) => {
        const isCompleted = i < safeIndex;
        const isCurrent = i === safeIndex;

        return (
          <div key={step.value} className="flex-1 flex flex-col items-center relative">
            {/* 연결선 */}
            {i < STEPS.length - 1 && (
              <div
                className={`absolute top-3.5 left-1/2 w-full h-0.5 transition-colors ${
                  i < safeIndex ? "bg-brand-green-primary" : "bg-gray-200"
                }`}
              />
            )}
            {/* 원형 스텝 */}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                isCompleted
                  ? "bg-brand-green-primary text-white"
                  : isCurrent
                  ? "bg-brand-green-primary text-white ring-4 ring-brand-green-primary/20"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
            </div>
            {/* 라벨 */}
            <span
              className={`mt-2 text-[11px] text-center leading-tight transition-colors ${
                isCurrent
                  ? "text-brand-green-primary font-semibold"
                  : isCompleted
                  ? "text-gray-500"
                  : "text-gray-300"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
