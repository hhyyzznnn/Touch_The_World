// 문의 페이지는 매번 서버에서 그려 1~3초가 걸린다. 그동안 화면이 그대로면 버튼이 안 눌린 줄 알고
// 다시 누르거나 떠나는 경우가 Clarity 녹화에서 반복 확인돼(2026-10), 누르는 즉시 폼 모양을 먼저 보여준다.
export default function InquiryLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-medium mb-6">문의하기</h1>
        <div className="h-16 w-full animate-pulse rounded-xl bg-gray-100" />
        <div className="mt-10 space-y-5">
          {Array.from({ length: 4 }, (_, idx) => (
            <div key={`inquiry-loading-${idx}`} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
          <div className="h-12 w-full animate-pulse rounded-lg bg-brand-green-primary/20" />
        </div>
      </div>
    </div>
  );
}
