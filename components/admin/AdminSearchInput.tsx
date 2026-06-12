"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

interface Props {
  basePath: string;
  defaultQ?: string;
  placeholder?: string;
}

export function AdminSearchInput({ basePath, defaultQ = "", placeholder = "검색…" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function navigate(q: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    if (q) p.set("q", q); else p.delete("q");
    router.push(`${basePath}?${p.toString()}`);
  }

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultQ}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter") navigate(inputRef.current?.value ?? ""); }}
        className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-primary/30"
      />
      {defaultQ && (
        <button
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            navigate("");
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
