import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 | 터치더월드",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
