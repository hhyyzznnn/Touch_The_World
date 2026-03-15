"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock4, ShieldCheck } from "lucide-react";

interface PhoneVerificationProps {
  phone: string;
  onVerified: (verified: boolean) => void;
}

export function PhoneVerification({ phone, onVerified }: PhoneVerificationProps) {
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [prevPhone, setPrevPhone] = useState(phone);
  const hasSentCode = timeLeft > 0;

  // 전화번호가 변경되면 상태 초기화
  useEffect(() => {
    if (phone !== prevPhone) {
      setCode("");
      setIsSending(false);
      setIsVerifying(false);
      setError("");
      setSuccess("");
      setTimeLeft(0);
      setIsVerified(false);
      onVerified(false);
      setPrevPhone(phone);
    }
  }, [phone, prevPhone, onVerified]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSendCode = async () => {
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("인증 코드가 발송되었습니다.");
        setTimeLeft(300); // 5분
      } else {
        setError(data.error || "인증 코드 발송에 실패했습니다.");
      }
    } catch (error) {
      setError("인증 코드 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("6자리 인증 코드를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        setSuccess("휴대폰 인증이 완료되었습니다.");
        onVerified(true);
      } else {
        setError(data.error || "인증 코드가 올바르지 않습니다.");
      }
    } catch (error) {
      setError("인증 코드 확인 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 인증 완료 시 컴포넌트를 숨김 (부모 컴포넌트에서 처리)
  if (isVerified) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">휴대폰 본인 확인</p>
          <p className="text-xs text-gray-500 mt-0.5">
            입력한 번호로 6자리 인증번호를 전송합니다.
          </p>
        </div>
        {hasSentCode && (
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-700 whitespace-nowrap">
            <Clock4 className="w-3 h-3" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0">
          <input
            type="tel"
            value={phone}
            disabled
            className="w-full px-4 py-2 border rounded-md bg-white text-gray-700"
          />
        </div>
        <Button
          type="button"
          onClick={handleSendCode}
          disabled={isSending || timeLeft > 0}
          variant="outline"
          className="whitespace-nowrap flex-shrink-0"
        >
          {isSending ? "발송 중..." : timeLeft > 0 ? "재발송 대기" : "인증번호 발송"}
        </Button>
      </div>

      {success && !isVerified && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {timeLeft > 0 && !isVerified && (
        <div className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
          <label className="block text-sm font-medium text-gray-700">
            인증 코드 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.length === 6 && !isVerifying) {
                  e.preventDefault();
                  handleVerifyCode();
                }
              }}
              placeholder="6자리 숫자 입력"
              maxLength={6}
              inputMode="numeric"
              className="flex-1 min-w-0 px-4 py-2 h-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary text-center text-lg font-semibold tracking-[0.3em] placeholder:text-center placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={isVerifying || code.length !== 6}
              className="whitespace-nowrap flex-shrink-0 h-11"
            >
              {isVerifying ? "확인 중..." : "인증 확인"}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            인증번호 6자리를 정확히 입력해 주세요.
          </p>
          {timeLeft > 0 && timeLeft < 60 && (
            <p className="text-xs text-red-500">
              인증 코드가 곧 만료됩니다. ({Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
