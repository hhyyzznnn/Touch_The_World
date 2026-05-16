"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintTrigger() {
  return (
    <Button onClick={() => window.print()} size="sm" className="gap-2">
      <Printer className="w-4 h-4" />
      인쇄 / PDF 저장
    </Button>
  );
}
