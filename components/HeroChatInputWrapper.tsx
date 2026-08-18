"use client";

import { HeroChatInput } from "./HeroChatInput";

interface HeroChatInputWrapperProps {
  category?: string;
}

export function HeroChatInputWrapper({ category }: HeroChatInputWrapperProps) {
  return <HeroChatInput initialCategory={category} />;
}
