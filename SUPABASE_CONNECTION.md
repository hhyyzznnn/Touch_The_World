# Supabase Connection Pooling 설정 가이드

IPv4/IPv6 호환 문제로 인해 Supabase Connection Pooler를 사용해야 합니다.

## Connection Pooling URL 확인 방법

1. Supabase 대시보드 접속
2. 프로젝트 선택
3. **Settings** > **Database** 메뉴로 이동
4. **Connection Pooling** 섹션에서 URL 확인

## Connection Pooling 모드 선택

### Transaction Pooling (권장) - Prisma/Next.js에 최적화

**포트 6543, Transaction 모드:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**특징:**
- ✅ Prisma 트랜잭션 완벽 지원
- ✅ 연결 수 제한 완화 (무료 플랜에서 중요)
- ✅ 높은 동시성 처리
- ✅ 프로덕션 환경에 최적화
- ✅ **Prisma와 Next.js 사용 시 권장**

**사용 시기:**
- Prisma ORM 사용
- Next.js App Router 사용
- 트랜잭션이 필요한 경우
- 프로덕션 환경

### Session Pooling (대안)

**포트 6543, Session 모드:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**특징:**
- 세션 레벨 변수 사용 가능
- Prepared statements 지원
- Prisma에서 일부 제한 가능

**사용 시기:**
- 세션 레벨 설정이 필요한 경우
- Prepared statements를 직접 사용
- Prisma를 사용하지 않는 경우

### 직접 연결 (비권장)

**포트 5432:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**주의:**
- ❌ 연결 수 제한 엄격 (무료 플랜: 최대 4개)
- ❌ 프로덕션에서 권장하지 않음
- ✅ 개발 환경에서만 고려

## 📊 모드 비교

| 모드 | 포트 | 파라미터 | Prisma 지원 | 연결 수 | 권장 사용 |
|------|------|----------|-------------|---------|-----------|
| **Transaction** | 6543 | `pgbouncer=true` | ✅ 완벽 | 높음 | **프로덕션 (권장)** |
| **Session** | 6543 | 없음 | ⚠️ 제한적 | 높음 | 특수한 경우 |
| **직접 연결** | 5432 | 없음 | ✅ 완벽 | 낮음 | 개발 환경만 |

## 🎯 권장 설정

**이 프로젝트 (Prisma + Next.js)에는 Transaction Pooling을 권장합니다:**

```env
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

## 현재 설정

현재 프로젝트 정보:
- 프로젝트 레퍼런스: `futafhvqfxktxnraqbhd`
- 비밀번호: `tTw_2025!Project_DB_pw` (URL 인코딩: `tTw_2025%21Project_DB_pw`)

## .env 파일 설정

Supabase 대시보드에서 복사한 Connection Pooling URL을 `.env` 파일의 `DATABASE_URL`에 붙여넣으세요.

비밀번호에 특수문자(`!`)가 있으므로 URL 인코딩이 필요합니다:
- `!` → `%21`

## 대안: Supabase CLI 사용

Connection Pooling이 작동하지 않는 경우, Supabase CLI를 사용할 수도 있습니다:

```bash
npm install -g supabase
supabase login
supabase db push
```

## 대안: Supabase 대시보드 SQL Editor

1. Supabase 대시보드 > **SQL Editor**로 이동
2. Prisma가 생성한 SQL을 직접 실행
3. `npx prisma migrate dev` 대신 수동으로 SQL 실행

