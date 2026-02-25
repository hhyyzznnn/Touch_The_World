#!/usr/bin/env tsx

/**
 * 환경 변수 검증 스크립트
 * 배포 전 필수 환경 변수가 설정되어 있는지 확인합니다.
 * 
 * 사용법:
 *   npm run validate-env
 *   또는
 *   tsx scripts/validate-env.ts
 */

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
    // .env 없음 - process.env만 사용 (Vercel 등 CI에서는 이미 설정됨)
  }
}

loadEnv();

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string) => boolean | string;
}

const requiredEnvVars: EnvVar[] = [
  {
    name: "DATABASE_URL",
    required: true,
    description: "데이터베이스 연결 문자열 (Supabase PostgreSQL)",
    validate: (value) => {
      if (!value.startsWith("postgresql://")) {
        return "DATABASE_URL은 postgresql://로 시작해야 합니다";
      }
      return true;
    },
  },
  {
    name: "ADMIN_PASSWORD",
    required: true,
    description: "관리자 로그인 비밀번호",
    validate: (value) => {
      if (value.length < 8) {
        return "ADMIN_PASSWORD는 최소 8자 이상이어야 합니다";
      }
      if (value === "admin123" || value === "password" || value === "12345678") {
        return "ADMIN_PASSWORD는 기본 비밀번호를 사용할 수 없습니다";
      }
      return true;
    },
  },
  {
    name: "UPLOADTHING_SECRET",
    required: false, // UPLOADTHING_TOKEN과 둘 중 하나만 있으면 됨
    description: "UploadThing Secret 키 (이미지/파일 업로드용)",
    validate: (value) => {
      if (!value.startsWith("sk_")) {
        return "UPLOADTHING_SECRET은 sk_로 시작해야 합니다";
      }
      return true;
    },
  },
  {
    name: "UPLOADTHING_TOKEN",
    required: false, // UPLOADTHING_SECRET과 둘 중 하나만 있으면 됨
    description: "UploadThing Token 키 (이미지/파일 업로드용)",
    validate: (value) => {
      if (!value.startsWith("sk_")) {
        return "UPLOADTHING_TOKEN은 sk_로 시작해야 합니다";
      }
      return true;
    },
  },
  {
    name: "UPLOADTHING_APP_ID",
    required: true,
    description: "UploadThing App ID",
  },
  {
    name: "OPENAI_API_KEY",
    required: true,
    description: "OpenAI API 키 (AI 채팅 상담용)",
    validate: (value) => {
      if (!value.startsWith("sk-")) {
        return "OPENAI_API_KEY은 sk-로 시작해야 합니다";
      }
      return true;
    },
  },
];

const optionalEnvVars: EnvVar[] = [
  {
    name: "DATABASE_DIRECT_URL",
    required: false,
    description: "Prisma CLI 전용 Direct URL (권장)",
  },
  {
    name: "DATABASE_POOLING_URL",
    required: false,
    description: "런타임/서버리스 전용 Pooler URL (권장)",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: false,
    description: "NextAuth Secret (사용자 로그인 기능 사용 시)",
  },
  {
    name: "NEXTAUTH_URL",
    required: false,
    description: "NextAuth URL (사용자 로그인 기능 사용 시)",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API 키 (이메일 인증용)",
  },
  {
    name: "RESEND_FROM_EMAIL",
    required: false,
    description: "Resend 발신 이메일 주소",
  },
  {
    name: "KAKAO_BM_CLIENT_ID",
    required: false,
    description: "카카오 비즈니스 메시지 Client ID (알림톡 인증번호 발송용)",
  },
  {
    name: "KAKAO_BM_CLIENT_SECRET",
    required: false,
    description: "카카오 비즈니스 메시지 Client Secret",
  },
  {
    name: "KAKAO_BM_SENDER_KEY",
    required: false,
    description: "카카오 비즈니스 메시지 발신 프로필 키",
  },
  {
    name: "KAKAO_BM_VERIFICATION_TEMPLATE_CODE",
    required: false,
    description: "카카오 알림톡 인증번호 템플릿 코드",
  },
  {
    name: "KAKAO_BM_BASE_URL",
    required: false,
    description: "카카오 비즈니스 메시지 API Base URL (기본값: https://bizmsg-web.kakaoenterprise.com)",
  },
  {
    name: "KAKAO_CLIENT_ID",
    required: false,
    description: "카카오 OAuth Client ID",
  },
  {
    name: "KAKAO_CLIENT_SECRET",
    required: false,
    description: "카카오 OAuth Client Secret",
  },
  {
    name: "NAVER_CLIENT_ID",
    required: false,
    description: "네이버 OAuth Client ID",
  },
  {
    name: "NAVER_CLIENT_SECRET",
    required: false,
    description: "네이버 OAuth Client Secret",
  },
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    description: "구글 OAuth Client ID",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    description: "구글 OAuth Client Secret",
  },
];

function validateEnvVar(envVar: EnvVar): { valid: boolean; error?: string } {
  const value = process.env[envVar.name];

  if (envVar.required && !value) {
    return {
      valid: false,
      error: `${envVar.name}이(가) 설정되지 않았습니다. (필수)`,
    };
  }

  if (value && envVar.validate) {
    const validationResult = envVar.validate(value);
    if (validationResult !== true) {
      return {
        valid: false,
        error: validationResult as string,
      };
    }
  }

  return { valid: true };
}

function main() {
  console.log("🔍 환경 변수 검증 중...\n");

  let hasErrors = false;
  const errors: string[] = [];
  const warnings: string[] = [];

  // UPLOADTHING_SECRET 또는 UPLOADTHING_TOKEN 중 하나는 필수
  const hasUploadThingSecret = !!process.env.UPLOADTHING_SECRET;
  const hasUploadThingToken = !!process.env.UPLOADTHING_TOKEN;
  if (!hasUploadThingSecret && !hasUploadThingToken) {
    console.log(`  ❌ UPLOADTHING_SECRET 또는 UPLOADTHING_TOKEN: 둘 중 하나는 필수입니다.`);
    errors.push("UPLOADTHING_SECRET 또는 UPLOADTHING_TOKEN 중 하나는 필수입니다.");
    hasErrors = true;
  }

  // 필수 환경 변수 검증
  console.log("📋 필수 환경 변수:");
  for (const envVar of requiredEnvVars) {
    // UPLOADTHING_SECRET과 UPLOADTHING_TOKEN은 별도로 체크했으므로 스킵
    if (envVar.name === "UPLOADTHING_SECRET" || envVar.name === "UPLOADTHING_TOKEN") {
      continue;
    }
    
    const result = validateEnvVar(envVar);
    if (result.valid) {
      console.log(`  ✅ ${envVar.name}`);
    } else {
      console.log(`  ❌ ${envVar.name}: ${result.error}`);
      errors.push(`${envVar.name}: ${result.error}`);
      hasErrors = true;
    }
  }

  // UPLOADTHING_SECRET 또는 UPLOADTHING_TOKEN 체크 (위에서 이미 체크함)

  const dbUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DATABASE_DIRECT_URL || "";
  const poolUrl = process.env.DATABASE_POOLING_URL || "";
  const isPoolLike = (value: string) => value.includes("pooler.supabase.com") || value.includes("pgbouncer=true");

  if (!directUrl && isPoolLike(dbUrl)) {
    warnings.push(
      "DATABASE_URL이 pooler 주소로 보입니다. Prisma migrate/db push가 실패할 수 있습니다. DATABASE_DIRECT_URL(포트 5432)을 추가하세요."
    );
  }

  if (directUrl && isPoolLike(directUrl)) {
    warnings.push(
      "DATABASE_DIRECT_URL이 pooler 주소로 보입니다. Direct URL(포트 5432)로 변경하세요."
    );
  }

  if (poolUrl && !isPoolLike(poolUrl)) {
    warnings.push(
      "DATABASE_POOLING_URL이 direct 주소로 보입니다. Pooler URL(포트 6543 + pgbouncer=true) 사용을 권장합니다."
    );
  }

  // 선택적 환경 변수 확인
  console.log("\n📋 선택적 환경 변수:");
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar.name];
    if (value) {
      console.log(`  ✅ ${envVar.name}`);
    } else {
      console.log(`  ⚪ ${envVar.name} (설정되지 않음)`);
    }
  }

  // 프로덕션 환경 체크
  if (process.env.NODE_ENV === "production") {
    console.log("\n⚠️  프로덕션 환경 감지");
    
    // 프로덕션에서 권장되는 설정 확인
    if (!process.env.NEXTAUTH_SECRET) {
      warnings.push("프로덕션 환경에서는 NEXTAUTH_SECRET 설정을 권장합니다");
    }
    
    if (process.env.NEXTAUTH_URL?.includes("localhost")) {
      warnings.push("프로덕션 환경에서는 NEXTAUTH_URL을 실제 도메인으로 설정하세요");
    }
  }

  // 결과 출력
  console.log("\n" + "=".repeat(60));
  if (hasErrors) {
    console.log("❌ 환경 변수 검증 실패\n");
    console.log("오류:");
    errors.forEach((error) => console.log(`  - ${error}`));
    console.log("\n.env.example 파일을 참고하여 환경 변수를 설정하세요.");
    process.exit(1);
  } else {
    console.log("✅ 환경 변수 검증 성공\n");
    if (warnings.length > 0) {
      console.log("⚠️  경고:");
      warnings.forEach((warning) => console.log(`  - ${warning}`));
    }
    console.log("모든 필수 환경 변수가 올바르게 설정되었습니다.");
    process.exit(0);
  }
}

main();
