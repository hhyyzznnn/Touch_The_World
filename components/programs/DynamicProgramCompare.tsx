"use client";

import dynamic from "next/dynamic";

const ProgramCompare = dynamic(
  () => import("@/components/programs/ProgramCompare").then((m) => ({ default: m.ProgramCompare })),
  { ssr: false }
);

export function DynamicProgramCompare() {
  return <ProgramCompare />;
}
