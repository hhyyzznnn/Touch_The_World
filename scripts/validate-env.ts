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
      if (!value.includes("sslmode=require")) {
        return "DATABASE_URL에 sslmode=require가 포함되어야 합니다";
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
    required: true,
    description: "UploadThing Secret 키 (이미지/파일 업로드용)",
    validate: (value) => {
      if (!value.startsWith("sk_")) {
        return "UPLOADTHING_SECRET은 sk_로 시작해야 합니다";
      }
      return true;
    },
  },
  {
    name: "UPLOADTHING_APP_ID",
    required: true,
    description: "UploadThing App ID",
  },
];

const optionalEnvVars: EnvVar[] = [
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
    name: "TWILIO_ACCOUNT_SID",
    required: false,
    description: "Twilio Account SID (SMS 인증용)",
  },
  {
    name: "TWILIO_AUTH_TOKEN",
    required: false,
    description: "Twilio Auth Token",
  },
  {
    name: "TWILIO_PHONE_NUMBER",
    required: false,
    description: "Twilio 전화번호",
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

  // 필수 환경 변수 검증
  console.log("📋 필수 환경 변수:");
  for (const envVar of requiredEnvVars) {
    const result = validateEnvVar(envVar);
    if (result.valid) {
      console.log(`  ✅ ${envVar.name}`);
    } else {
      console.log(`  ❌ ${envVar.name}: ${result.error}`);
      errors.push(`${envVar.name}: ${result.error}`);
      hasErrors = true;
    }
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

