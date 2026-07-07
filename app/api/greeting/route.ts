import { NextResponse } from "next/server";
import { getPersonalizedGreeting } from "@/lib/greeting";

export const dynamic = "force-dynamic";

export async function GET() {
  const greeting = await getPersonalizedGreeting();
  return NextResponse.json({ greeting });
}
