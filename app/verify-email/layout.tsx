import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이메일 인증 | 터치더월드",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
