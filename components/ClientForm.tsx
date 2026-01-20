"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Client } from "@prisma/client";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(client?.name || "");
  const [type, setType] = useState(client?.type || "corporation");
  const [country, setCountry] = useState(client?.country || "KR");
  const [logoUrl, setLogoUrl] = useState(client?.logoUrl || "");
  const [description, setDescription] = useState(client?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = client
        ? `/api/admin/clients/${client.id}`
        : "/api/admin/clients";
      const method = client ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          country,
          logoUrl,
          description,
        }),
      });

      if (response.ok) {
        router.push("/admin/clients");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "저장에 실패했습니다.");
      }
    } catch (error: any) {
      setError(error.message || "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          기관명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          유형 <span className="text-red-500">*</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="public">공공·교육기관</option>
          <option value="university">대학교</option>
          <option value="highschool">고등학교</option>
          <option value="corporation">기업·단체</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          국가 <span className="text-red-500">*</span>
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="KR">한국 (KR)</option>
          <option value="JP">일본 (JP)</option>
          <option value="TW">대만 (TW)</option>
          <option value="US">미국 (US)</option>
          <option value="PH">필리핀 (PH)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          로고 URL
        </label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="고객사에 대한 간단한 설명을 입력하세요"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
      </div>
    </form>
  );
}

