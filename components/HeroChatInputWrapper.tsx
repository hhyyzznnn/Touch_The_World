"use client";

import { HeroChatInput } from "./HeroChatInput";

interface HeroChatInputWrapperProps {
  category?: string;
  greeting?: string | null;
}

export function HeroChatInputWrapper({ category, greeting }: HeroChatInputWrapperProps) {
  return <HeroChatInput initialCategory={category} greeting={greeting} />;
}
