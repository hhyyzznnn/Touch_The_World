"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string | null;
  name: string;
  phone: string | null;
  school: string | null;
  marketingEmailOptIn?: boolean;
  marketingAlimtalkOptIn?: boolean;
  role?: string;
}

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
    school: user.school || "",
    marketingEmailOptIn: user.marketingEmailOptIn || false,
    marketingAlimtalkOptIn: user.marketingAlimtalkOptIn || false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("회원 정보가 수정되었습니다.");
        router.refresh();
      } else {
        setError(data.error || "정보 수정에 실패했습니다.");
      }
    } catch (error) {
      setError("정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          value={user.email || ""}
          disabled
          className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="010-1234-5678"
        />
      </div>

      <div>
        <label
          htmlFor="school"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          소속 학교
        </label>
        <input
          id="school"
          name="school"
          type="text"
          value={formData.school}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-primary focus:border-brand-green-primary"
          placeholder="예: 서울고등학교"
        />
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
