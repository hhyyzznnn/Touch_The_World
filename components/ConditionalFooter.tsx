import { headers } from "next/headers";
import { Footer } from "@/components/Footer";

export async function ConditionalFooter() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // 관리자 페이지는 Footer 숨김
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return <Footer />;
}

