# Supabase pgbouncer와 Prisma CLI 충돌 문제 완전 분석

## 🚨 문제 현상

**증상:**
- `prisma migrate`, `prisma db push`, `supabase db push` 실행 시 **무한 로딩**
- 명령어가 멈추고 응답 없음
- 타임아웃 발생 또는 프로세스 강제 종료 필요

**원인:**
- `DATABASE_URL`에 **pgbouncer(pooler, 포트 6543)** 주소를 사용하고 있음
- Prisma CLI는 **prepared statements**와 **세션 레벨 기능**을 필요로 함
- pgbouncer는 **Transaction Pooling 모드**에서 이러한 기능을 **제한**함

---

## 🔍 핵심 원인 분석

### 1. pgbouncer가 Prisma CLI와 충돌하는 이유

#### pgbouncer의 동작 방식

pgbouncer는 **연결 풀링**을 위해 중간 프록시 역할을 합니다:

```
애플리케이션 → pgbouncer (6543) → PostgreSQL (5432)
```

**Transaction Pooling 모드 특징:**
- 여러 클라이언트의 연결을 **재사용** (연결 수 제한 완화)
- 각 **트랜잭션 단위**로 연결을 할당/반환
- 트랜잭션이 끝나면 연결이 **즉시 다른 클라이언트로 전환**됨

#### Prisma CLI가 필요로 하는 것

1. **Prepared Statements**
   - Prisma는 스키마 변경 시 복잡한 SQL을 실행
   - `PREPARE`, `EXECUTE` 구문 사용
   - pgbouncer는 Transaction 모드에서 prepared statements를 **지원하지 않음**

2. **세션 레벨 기능**
   - `SET` 명령어로 세션 변수 설정
   - 트랜잭션 범위를 넘어서는 상태 유지 필요
   - pgbouncer는 트랜잭션 종료 시 **세션 상태를 초기화**

3. **긴 실행 시간**
   - 마이그레이션은 수 초~수 분 소요 가능
   - pgbouncer는 타임아웃 설정이 있거나 연결 재사용으로 인해 **중간에 끊길 수 있음**

#### 왜 무한 로딩이 발생하는가?

```
1. Prisma CLI가 pgbouncer(6543)에 연결
2. PREPARE 문 실행 시도
3. pgbouncer가 prepared statements를 지원하지 않음
4. 에러가 발생하거나 무시됨
5. Prisma가 재시도 → 무한 루프
6. 또는 타임아웃 대기 → 무한 로딩
```

**결론:** pgbouncer는 **런타임 애플리케이션**에는 최적이지만, **CLI 도구**에는 부적합합니다.

---

## 📊 Direct Connection vs Pooler 비교

| 구분 | Direct Connection (5432) | Pooler (6543) |
|------|-------------------------|---------------|
| **포트** | 5432 | 6543 |
| **경로** | `direct` 또는 `pooler` 없음 | `pooler.supabase.com` |
| **Prepared Statements** | ✅ 완벽 지원 | ❌ Transaction 모드에서 미지원 |
| **세션 변수** | ✅ 완벽 지원 | ❌ 트랜잭션 종료 시 초기화 |
| **연결 수 제한** | ⚠️ 제한적 (무료: 60개) | ✅ 제한 완화 (무료: 200개) |
| **동시성** | ⚠️ 낮음 | ✅ 높음 |
| **CLI 도구 호환성** | ✅ 완벽 | ❌ 충돌 |
| **런타임 호환성** | ✅ 가능하나 비권장 | ✅ 최적화됨 |
| **사용 시나리오** | 마이그레이션, 스키마 변경 | Next.js 서버리스 런타임 |

---

## ✅ 올바른 설정 방법

### 1. .env 파일 구조

**핵심:** 두 개의 URL을 분리합니다.

```env
# CLI용: Direct Connection (5432)
# prisma migrate, db push, generate 등에 사용
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# 런타임용: Connection Pooler (6543)
# Next.js 서버리스 환경에서 사용
DATABASE_POOLING_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**주의사항:**
- Direct Connection URL은 `pooler.supabase.com`이지만 **포트는 5432**
- 또는 `direct` 서브도메인 사용 가능 (Supabase 프로젝트마다 다름)
- Pooler URL은 반드시 **포트 6543**과 **`pgbouncer=true`** 파라미터 필요

### 2. Supabase에서 올바른 URL 확인 방법

**Supabase Dashboard → Settings → Database → Connection String**

1. **Connection Pooling** 탭 선택
2. **Transaction** 모드 선택
3. 포트 **6543** 확인
4. `pgbouncer=true` 파라미터 포함 확인

**Direct Connection URL:**
1. **Connection String** 탭 선택 (또는 **URI** 탭)
2. 포트 **5432** 확인
3. `pooler` 서브도메인이 아닌 경우도 있음 (프로젝트마다 다름)

---

## 🔧 코드 수정 가이드

### 1. prisma/schema.prisma

**현재 (문제 있음):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**수정 (CLI용 Direct Connection 사용):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // CLI용: Direct Connection (5432)
}
```

**설명:**
- `schema.prisma`의 `url`은 **Prisma CLI**가 읽습니다
- `prisma migrate`, `prisma db push`, `prisma generate` 실행 시 사용
- 따라서 **Direct Connection (5432)**을 사용해야 합니다

---

### 2. lib/prisma.ts

**현재 (문제 있음):**
```typescript
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,  // ❌ CLI용 URL 사용 중
  });
```

**수정 (런타임용 Pooler URL 사용):**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 런타임 환경에서는 Pooler URL 사용
// CLI 환경에서는 DATABASE_URL이 자동으로 사용됨 (schema.prisma에서)
const databaseUrl = process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**더 안전한 패턴 (환경별 분리):**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // 런타임 환경 (Next.js 서버리스)
  if (process.env.DATABASE_POOLING_URL) {
    return process.env.DATABASE_POOLING_URL;
  }
  
  // 폴백: DATABASE_URL (개발 환경에서만 사용)
  if (process.env.DATABASE_URL) {
    // 경고: 프로덕션에서는 Pooler URL을 사용해야 함
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  DATABASE_POOLING_URL이 설정되지 않았습니다. " +
        "프로덕션 환경에서는 Connection Pooler를 사용해야 합니다."
      );
    }
    return process.env.DATABASE_URL;
  }
  
  throw new Error(
    "DATABASE_URL 또는 DATABASE_POOLING_URL 환경 변수가 설정되지 않았습니다."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**설명:**
- `PrismaClient` 생성 시 `datasourceUrl`을 명시적으로 지정
- 런타임에서는 **DATABASE_POOLING_URL** 우선 사용
- 폴백으로 `DATABASE_URL` 사용 (개발 환경)

---

## 📋 증상-원인 매핑표

| 증상 | 원인 | 해결 방법 |
|------|------|----------|
| **무한 로딩** | CLI가 pgbouncer(6543) 사용 | `DATABASE_URL`을 Direct Connection(5432)로 변경 |
| **Prepared statement 오류** | pgbouncer가 prepared statements 미지원 | CLI용 Direct Connection 사용 |
| **세션 변수 초기화** | pgbouncer가 트랜잭션 종료 시 상태 초기화 | CLI용 Direct Connection 사용 |
| **연결 수 초과** | 런타임에서 Direct Connection 사용 | `DATABASE_POOLING_URL` 사용 |
| **타임아웃** | pgbouncer 연결 재사용으로 인한 끊김 | CLI용 Direct Connection 사용 |
| **마이그레이션 실패** | pgbouncer가 긴 실행 시간 지원 안 함 | CLI용 Direct Connection 사용 |
| **서버리스 Cold Start 느림** | Direct Connection 사용으로 연결 수 제한 | `DATABASE_POOLING_URL` 사용 |

---

## 🎯 실무 체크리스트

### ✅ 이렇게 안 하면 100% 문제가 나는 이유

#### 1. CLI에서 Pooler URL 사용 시

**문제:**
```env
# ❌ 잘못된 설정
DATABASE_URL="...pooler.supabase.com:6543/...&pgbouncer=true"
```

**결과:**
- `prisma migrate` → 무한 로딩 또는 에러
- `prisma db push` → 타임아웃
- `supabase db push` → 실패

**이유:**
- pgbouncer는 prepared statements를 지원하지 않음
- Prisma CLI는 스키마 변경 시 복잡한 SQL 실행 필요
- 세션 레벨 기능이 필요한데 pgbouncer는 트랜잭션 단위로 연결 재사용

#### 2. 런타임에서 Direct Connection 사용 시

**문제:**
```typescript
// ❌ 잘못된 설정
new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,  // Direct Connection (5432)
});
```

**결과:**
- Vercel 서버리스 환경에서 **연결 수 초과** 에러
- 동시 요청 처리 불가
- Cold Start 시 연결 실패

**이유:**
- Next.js 서버리스는 각 함수마다 독립적인 연결 필요
- Direct Connection은 연결 수 제한이 엄격함 (무료: 60개)
- Pooler는 연결 재사용으로 제한 완화 (무료: 200개)

#### 3. schema.prisma에서 Pooler URL 사용 시

**문제:**
```prisma
# ❌ 잘못된 설정
datasource db {
  url = env("DATABASE_POOLING_URL")  # Pooler URL
}
```

**결과:**
- `prisma generate`는 성공 (단순 코드 생성)
- `prisma migrate` → 무한 로딩
- `prisma db push` → 실패

**이유:**
- `schema.prisma`의 `url`은 **Prisma CLI**가 읽음
- CLI는 prepared statements와 세션 기능 필요
- Pooler는 이러한 기능을 지원하지 않음

---

## 🚀 완전한 설정 예시

### .env.local (로컬 개발)

```env
# CLI용: Direct Connection (5432)
# prisma migrate, db push, generate 등에 사용
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# 런타임용: Connection Pooler (6543)
# Next.js 서버리스 환경에서 사용
DATABASE_POOLING_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### Vercel 환경 변수

**Production, Preview, Development 모두 설정:**

1. **DATABASE_URL** (CLI용)
   ```
   postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
   ```

2. **DATABASE_POOLING_URL** (런타임용)
   ```
   postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
   ```

**주의:** Vercel에서는 따옴표(`"`) 없이 값만 입력합니다.

---

## 📝 명령어별 사용 URL

| 명령어 | 사용 URL | 이유 |
|-------|---------|------|
| `prisma migrate dev` | `DATABASE_URL` (5432) | 스키마 변경, prepared statements 필요 |
| `prisma migrate deploy` | `DATABASE_URL` (5432) | 프로덕션 마이그레이션, prepared statements 필요 |
| `prisma db push` | `DATABASE_URL` (5432) | 스키마 동기화, prepared statements 필요 |
| `prisma generate` | `DATABASE_URL` (5432) | schema.prisma 읽음, 실제 DB 접근은 안 하지만 일관성 유지 |
| `prisma studio` | `DATABASE_URL` (5432) | CLI 도구, prepared statements 필요 |
| `supabase db push` | `DATABASE_URL` (5432) | Supabase CLI도 prepared statements 필요 |
| `npm run dev` | `DATABASE_POOLING_URL` (6543) | Next.js 런타임, 연결 풀링 필요 |
| `npm run build` | `DATABASE_POOLING_URL` (6543) | 빌드 시 API Route 실행, 연결 풀링 필요 |
| Vercel 배포 | `DATABASE_POOLING_URL` (6543) | 서버리스 환경, 연결 수 제한 완화 필요 |

---

## 🔍 문제 해결 단계

### 1단계: .env 파일 확인

```bash
# 현재 DATABASE_URL 확인
cat .env | grep DATABASE_URL

# 포트 확인
# ❌ :6543 → CLI에서 문제 발생
# ✅ :5432 → CLI에서 정상 작동
```

### 2단계: prisma/schema.prisma 확인

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  # Direct Connection (5432) 사용해야 함
}
```

### 3단계: lib/prisma.ts 확인

```typescript
// 런타임에서는 DATABASE_POOLING_URL 사용
const databaseUrl = process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;
```

### 4단계: 테스트

```bash
# CLI 테스트 (Direct Connection 사용)
npx prisma db push

# 런타임 테스트 (Pooler URL 사용)
npm run dev
# 브라우저에서 데이터베이스 연결이 필요한 페이지 접속
```

---

## 💡 추가 팁

### Supabase Direct Connection URL 찾기

Supabase Dashboard에서:
1. **Settings** → **Database**
2. **Connection String** 탭
3. **URI** 형식 선택
4. 포트가 **5432**인 URL 복사

또는:
- **Connection Pooling** 탭에서 **Session** 모드 선택 (Transaction 모드 아님)
- 포트 6543이지만 Session 모드는 prepared statements 지원 (단, 성능은 낮음)

### 개발 환경에서만 Direct Connection 사용

프로덕션에서는 항상 Pooler를 사용하되, 로컬 개발에서만 Direct Connection 사용:

```env
# .env.local (로컬 개발)
DATABASE_URL="postgresql://...:5432/..."  # Direct Connection
DATABASE_POOLING_URL="postgresql://...:6543/...&pgbouncer=true"  # Pooler
```

```typescript
// lib/prisma.ts
const databaseUrl = 
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_POOLING_URL  // 프로덕션: Pooler 필수
    : process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL;  // 개발: Pooler 우선, 폴백 Direct
```

---

## ✅ 최종 정리

1. **CLI 도구** (`prisma migrate`, `db push` 등) → **Direct Connection (5432)**
2. **런타임** (Next.js 서버리스) → **Connection Pooler (6543)**
3. **schema.prisma** → `DATABASE_URL` (Direct Connection)
4. **lib/prisma.ts** → `DATABASE_POOLING_URL` (Pooler) 우선 사용

이렇게 설정하지 않으면:
- CLI에서 무한 로딩 또는 에러 발생
- 런타임에서 연결 수 초과 에러 발생
- 프로덕션 환경에서 서비스 중단 가능

