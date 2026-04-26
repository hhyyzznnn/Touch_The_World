import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isStaff } from "@/lib/auth";

function checkApiKey(request: NextRequest): boolean {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) return false;

  const headerKey =
    request.headers.get("x-admin-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return headerKey === configuredKey;
}

export async function requireAdmin(request?: NextRequest) {
  if (request && checkApiKey(request)) return null;

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function requireStaff(request?: NextRequest) {
  if (request && checkApiKey(request)) return null;

  const staff = await isStaff();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function apiError(message: string, status: number = 500, error?: unknown) {
  if (error) {
    console.error(`${message}:`, error);
  }
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON in request body");
  }
}
