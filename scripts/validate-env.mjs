#!/usr/bin/env node

import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const envFile = readFileSync(envPath, "utf-8");
    const lines = envFile.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          process.env[key.trim()] = value.trim();
        }
      }
    }
  } catch {
    // no-op
  }
}

function validateRequired(name, validate) {
  const value = process.env[name];
  if (!value) return `${name}이(가) 설정되지 않았습니다. (필수)`;
  if (validate) {
    const result = validate(value);
    if (result !== true) return `${name}: ${result}`;
  }
  return null;
}

loadEnv();

const errors = [];
const warnings = [];

const requiredChecks = [
  [
    "DATABASE_URL",
    (value) => (value.startsWith("postgresql://") ? true : "DATABASE_URL은 postgresql://로 시작해야 합니다"),
  ],
  [
    "ADMIN_PASSWORD",
    (value) => {
      if (value.length < 8) return "ADMIN_PASSWORD는 최소 8자 이상이어야 합니다";
      if (["admin123", "password", "12345678"].includes(value)) {
        return "ADMIN_PASSWORD는 기본 비밀번호를 사용할 수 없습니다";
      }
      return true;
    },
  ],
  [
    "UPLOADTHING_APP_ID",
    null,
  ],
  [
    "OPENAI_API_KEY",
    (value) => (value.startsWith("sk-") ? true : "OPENAI_API_KEY은 sk-로 시작해야 합니다"),
  ],
];

console.log("🔍 환경 변수 검증 중...\n");
console.log("📋 필수 환경 변수:");
for (const [name, validate] of requiredChecks) {
  const error = validateRequired(name, validate);
  if (error) {
    console.log(`  ❌ ${error}`);
    errors.push(error);
  } else {
    console.log(`  ✅ ${name}`);
  }
}

const hasUploadthingSecret = Boolean(process.env.UPLOADTHING_SECRET);
const hasUploadthingToken = Boolean(process.env.UPLOADTHING_TOKEN);
if (!hasUploadthingSecret && !hasUploadthingToken) {
  const message = "UPLOADTHING_SECRET 또는 UPLOADTHING_TOKEN 중 하나는 필수입니다.";
  console.log(`  ❌ ${message}`);
  errors.push(message);
}

const dbUrl = process.env.DATABASE_URL || "";
const directUrl = process.env.DATABASE_DIRECT_URL || "";
const poolUrl = process.env.DATABASE_POOLING_URL || "";
const isPoolLike = (value) => value.includes("pooler.supabase.com") || value.includes("pgbouncer=true");

if (!directUrl && isPoolLike(dbUrl)) {
  warnings.push(
    "DATABASE_URL이 pooler 주소로 보입니다. Prisma migrate/db push가 실패할 수 있습니다. DATABASE_DIRECT_URL(포트 5432)을 추가하세요."
  );
}
if (directUrl && isPoolLike(directUrl)) {
  warnings.push("DATABASE_DIRECT_URL이 pooler 주소로 보입니다. Direct URL(포트 5432)로 변경하세요.");
}
if (poolUrl && !isPoolLike(poolUrl)) {
  warnings.push("DATABASE_POOLING_URL이 direct 주소로 보입니다. Pooler URL(포트 6543 + pgbouncer=true) 사용을 권장합니다.");
}

console.log("\n📋 선택적 핵심 환경 변수:");
for (const key of [
  "DATABASE_DIRECT_URL",
  "DATABASE_POOLING_URL",
  "SESSION_SECRET",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_KAKAO_CHANNEL_URL",
  "KAKAO_CLIENT_ID",
  "NAVER_CLIENT_ID",
  "GOOGLE_CLIENT_ID",
  "KAKAO_BM_CLIENT_ID",
  "BIZM_CLIENT_ID",
]) {
  if (process.env[key]) console.log(`  ✅ ${key}`);
  else console.log(`  ⚪ ${key} (설정되지 않음)`);
}

console.log("\n" + "=".repeat(60));
if (errors.length > 0) {
  console.log("❌ 환경 변수 검증 실패\n");
  for (const error of errors) console.log(`  - ${error}`);
  process.exit(1);
}

console.log("✅ 환경 변수 검증 성공\n");
if (warnings.length > 0) {
  console.log("⚠️  경고:");
  for (const warning of warnings) console.log(`  - ${warning}`);
}
console.log("모든 필수 환경 변수가 올바르게 설정되었습니다.");
