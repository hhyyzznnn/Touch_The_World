"use client";

import { HeroChatInput } from "./HeroChatInput";

interface HeroChatInputWrapperProps {
  category?: string;
}

export function HeroChatInputWrapper({ category }: HeroChatInputWrapperProps) {
  // 서버 컴포넌트에서 전달받은 category를 클라이언트 컴포넌트로 전달
  return <HeroChatInput initialCategory={category} />;
}


