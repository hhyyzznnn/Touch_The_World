"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function PrintQuoteButton({ programId }: { programId: string }) {
  return (
    <Button asChild variant="outline" size="sm" className="gap-1.5">
      <Link href={`/programs/${programId}/quote`} target="_blank" rel="noopener noreferrer">
        <FileText className="w-4 h-4" />
        견적서
      </Link>
    </Button>
  );
}
