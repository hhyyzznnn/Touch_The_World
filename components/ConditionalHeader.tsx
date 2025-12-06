import { headers } from "next/headers";
import { Header } from "@/components/Header";

export async function ConditionalHeader() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // 관리자 페이지는 Header 숨김
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return <Header />;
}

