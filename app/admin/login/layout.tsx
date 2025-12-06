// 로그인 페이지는 인증 없이 접근 가능하도록 별도 레이아웃 사용
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

