# RLS와 스키마 변경

## 🔒 RLS(Row Level Security)는 스키마 변경에 영향을 주지 않습니다

**RLS의 역할:**
- ✅ 데이터 접근 제어 (SELECT, INSERT, UPDATE, DELETE)
- ❌ 스키마 변경(DDL)에는 영향 없음

**Prisma CLI는:**
- `postgres` 사용자로 연결 (최고 권한)
- DDL 작업 수행 (CREATE TABLE, ALTER TABLE 등)
- RLS와 무관하게 작동해야 함

## 🚨 현재 문제: 연결 실패

현재 "Can't reach database server" 에러는:
- ❌ RLS 문제가 아님
- ✅ 네트워크/연결 문제

## ✅ 해결 방법

### 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

1. **Supabase Dashboard** → **SQL Editor**
2. Prisma가 생성할 SQL을 직접 실행

**Prisma 스키마 변경 SQL 생성:**
```bash
# SQL만 생성 (실행 안 함)
npx prisma migrate dev --create-only

# 생성된 SQL 파일 확인
# prisma/migrations/[timestamp]_[name]/migration.sql
```

3. SQL Editor에서 해당 SQL 복사해서 실행

### 방법 2: Transaction Pooler로 시도 (무한 로딩 가능)

```bash
# DATABASE_URL을 Transaction Pooler로 임시 변경
DATABASE_URL="$DATABASE_POOLING_URL" npx prisma db push
```

⚠️ 무한 로딩이 발생할 수 있음

### 방법 3: 네트워크 확인

Direct Connection이 작동하지 않는 경우:
- 방화벽 설정 확인
- Supabase 프로젝트의 Direct Connection 활성화 확인
- VPN/프록시 설정 확인

### 방법 4: Supabase CLI 사용

```bash
# Homebrew로 설치
brew install supabase/tap/supabase

# 로그인 및 연결
supabase login
supabase link --project-ref futafhvqfxktxnraqbhd

# 마이그레이션
supabase db push
```

