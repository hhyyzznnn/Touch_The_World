"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // 관리자 페이지는 Footer 숨김
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return <Footer />;
}

