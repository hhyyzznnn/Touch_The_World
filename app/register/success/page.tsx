"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");
  const sent = searchParams?.get("sent");
  const [isResending, setIsResending] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error" | "">("");

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setNotice("");
    setNoticeType("");

    try {
      const response = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotice(data.message || "인증 메일을 재발송했습니다.");
        setNoticeType("success");
      } else {
        setNotice(data.error || "재발송에 실패했습니다.");
        setNoticeType("error");
      }
    } catch {
      setNotice("재발송 요청 중 오류가 발생했습니다.");
      setNoticeType("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-medium text-text-dark">
          회원가입 완료
        </h2>
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-center gap-2 text-text-gray">
            <Mail className="w-5 h-5" />
            <p className="text-sm">
              {email ? `${email}로` : "이메일로"} 인증 메일을 발송했습니다.
            </p>
          </div>
          <p className="text-sm text-text-gray">
            이메일을 확인하여 인증을 완료해주세요.
            <br />
            인증 링크는 24시간 동안 유효합니다.
          </p>
          {sent === "0" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              인증 메일 발송이 실패했을 수 있습니다. 아래 버튼으로 재발송해 주세요.
            </p>
          )}
          <div className="pt-4 border-t">
            <p className="text-xs text-text-gray mb-4">
              이메일이 오지 않았나요?
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleResend}
                disabled={!email || isResending}
              >
                {isResending ? "재발송 중..." : "인증 메일 재발송"}
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login">로그인 페이지로</Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/">홈으로</Link>
              </Button>
            </div>
            {notice && (
              <p
                className={`mt-3 text-xs ${
                  noticeType === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {notice}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-medium text-text-dark">
            로딩 중...
          </h2>
        </div>
      </div>
    }>
      <RegisterSuccessContent />
    </Suspense>
  );
}
