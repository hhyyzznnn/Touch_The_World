"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneVerification } from "@/components/PhoneVerification";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    school: "",
    marketingEmailOptIn: false,
    marketingAlimtalkOptIn: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const router = useRouter();

  const isPasswordMismatch =
    confirmPasswordTouched &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;
  const isPasswordMatch =
    confirmPasswordTouched &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 휴대폰 인증 확인
    if (!phoneVerified) {
      setError("휴대폰 인증을 완료해주세요.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          school: formData.school || undefined,
          marketingEmailOptIn: formData.marketingEmailOptIn,
          marketingAlimtalkOptIn: formData.marketingAlimtalkOptIn,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 회원가입 성공 시 이메일 인증 안내 페이지로 이동
        const sentQuery = data.verificationEmailSent === false ? "&sent=0" : "&sent=1";
        router.push(
          `/register/success?email=${encodeURIComponent(formData.email)}${sentQuery}`
        );
      } else {
        setError(data.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-3xl font-medium text-text-dark">
            교사/담당자 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-text-gray">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-green-primary hover:text-brand-green"
            >
              로그인
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-text-gray">
            학교·기관 담당자 기준 기본 정보를 입력해 주세요.
          </p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                로그인 아이디 <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9]{3,20}"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="영문/숫자 3~20자"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="최소 6자 이상"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => setConfirmPasswordTouched(true)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {isPasswordMismatch && (
                <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
              )}
              {isPasswordMatch && (
                <p className="mt-1 text-sm text-green-600">비밀번호가 일치합니다.</p>
              )}
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                담당자 이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                소속 학교/기관 (담당 부서) <span className="text-red-500">*</span>
              </label>
              <input
                id="school"
                name="school"
                type="text"
                required
                value={formData.school}
                onChange={handleChange}
                autoComplete="organization"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
                placeholder="예: 서울고등학교 2학년부(체험학습 담당)"
              />
              <p className="mt-1 text-xs text-gray-500">
                교사/행사 담당자 확인용 정보입니다. 학교(기관)명과 담당 부서 또는 역할을 함께 입력해 주세요.
              </p>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                전화번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    let formatted = "";
                    if (value.length <= 3) {
                      formatted = value;
                    } else if (value.length <= 7) {
                      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
                    } else {
                      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
                    }
                    setFormData({
                      ...formData,
                      phone: formatted,
                    });
                    setError("");
                    // 전화번호가 변경되면 인증 상태 초기화
                    if (phoneVerified) {
                      setPhoneVerified(false);
                    }
                  }}
                  disabled={phoneVerified}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary ${
                    phoneVerified
                      ? "bg-green-50 border-green-200 text-gray-600 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="010-1234-5678"
                  maxLength={13}
                />
                {phoneVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneVerified(false);
                      setFormData({
                        ...formData,
                        phone: "",
                      });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    변경
                  </button>
                )}
              </div>
              {formData.phone && formData.phone.replace(/-/g, "").length >= 10 && !phoneVerified && (
                <div className="mt-2">
                  <PhoneVerification
                    key={formData.phone} // 전화번호가 변경되면 컴포넌트 재마운트
                    phone={formData.phone}
                    onVerified={(verified) => {
                      setPhoneVerified(verified);
                    }}
                  />
                </div>
              )}
              {phoneVerified && (
                <p className="mt-2 text-sm text-green-600">✓ 휴대폰 인증이 완료되었습니다.</p>
              )}
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">마케팅 정보 수신 동의 (선택)</p>
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  id="marketingEmailOptIn"
                  name="marketingEmailOptIn"
                  type="checkbox"
                  checked={formData.marketingEmailOptIn}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-green-primary focus:ring-brand-green-primary"
                />
                <span>이메일로 유용한 교육여행/연수 정보를 받겠습니다.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  id="marketingAlimtalkOptIn"
                  name="marketingAlimtalkOptIn"
                  type="checkbox"
                  checked={formData.marketingAlimtalkOptIn}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-green-primary focus:ring-brand-green-primary"
                />
                <span>알림톡으로 유용한 교육여행/연수 정보를 받겠습니다.</span>
              </label>
              <p className="text-xs text-gray-500">
                선택 동의이며, 회원가입 후 프로필에서 언제든지 변경할 수 있습니다.
              </p>
            </div>
          </div>

          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError("")}
            />
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                처리 중...
              </>
            ) : (
              "회원가입"
            )}
          </Button>
        </form>

        {/* 소셜 회원가입 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
