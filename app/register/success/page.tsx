"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");

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
          <div className="pt-4 border-t">
            <p className="text-xs text-text-gray mb-4">
              이메일이 오지 않았나요?
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login">로그인 페이지로</Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/">홈으로</Link>
              </Button>
            </div>
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

