import { NextRequest, NextResponse } from "next/server";
import schoolsRaw from "@/lib/data/schools.json";

type School = { n: string; l: string; r: string | null };
const schools = schoolsRaw as School[];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || schools.length === 0) return NextResponse.json([]);

  const lower = q.toLowerCase();
  const results = schools
    .filter((s) => s.n.includes(q) || s.n.toLowerCase().includes(lower))
    .slice(0, 10)
    .map((s) => ({ name: s.n, level: s.l, region: s.r }));

  return NextResponse.json(results);
}
