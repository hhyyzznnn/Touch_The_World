"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");

    if (!token) {
      setStatus("error");
      setMessage("인증 토큰이 없습니다.");
      return;
    }

    // 이메일 인증 API 호출
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "이메일 인증이 완료되었습니다.");
        } else {
          setStatus("error");
          setMessage(data.error || "이메일 인증에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("이메일 인증 중 오류가 발생했습니다.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-brand-green-primary animate-spin" />
            <h2 className="text-2xl font-medium text-text-dark">
              이메일 인증 중...
            </h2>
            <p className="text-text-gray">잠시만 기다려주세요.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-medium text-text-dark">
              인증 완료
            </h2>
            <p className="text-text-gray">{message}</p>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/login">로그인하기</Link>
              </Button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <h2 className="text-2xl font-medium text-text-dark">
              인증 실패
            </h2>
            <p className="text-text-gray">{message}</p>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/register">다시 회원가입</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/">홈으로</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

