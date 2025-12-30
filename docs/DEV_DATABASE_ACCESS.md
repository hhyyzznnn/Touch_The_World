# 개발 환경에서 데이터베이스 접근 가이드

## ✅ 현재 작동하는 방법

### 1. Prisma Studio (데이터 확인/수정)

**Transaction Pooler 사용:**
```bash
DATABASE_URL="$DATABASE_POOLING_URL" npx prisma studio
```

또는 스크립트 사용:
```bash
./scripts/dev-db-studio.sh
```

**접속:** http://localhost:5555

**기능:**
- ✅ 데이터 조회
- ✅ 데이터 수정/삭제
- ✅ 데이터 추가
- ⚠️ 스키마 변경은 제한적 (Transaction Pooler 제약)

### 2. Supabase Dashboard

**접속:** https://supabase.com/dashboard

**기능:**
- ✅ 데이터 조회/수정
- ✅ SQL Editor로 직접 쿼리 실행
- ✅ 스키마 변경 (Table Editor)
- ✅ 완전한 권한

## 🚨 Direct Connection 문제

**현재 상태:**
- Direct Connection (포트 5432): DNS 해석 실패
- Transaction Pooler (포트 6543): 정상 작동

**원인:**
- Supabase에서 Direct Connection이 비활성화되었을 수 있음
- 또는 네트워크 설정 문제

**해결 방법:**

### 옵션 1: Supabase Dashboard에서 Direct Connection 활성화

1. Supabase Dashboard → Settings → Database
2. Direct Connection 활성화 확인
3. 올바른 Direct Connection URL 확인

### 옵션 2: Transaction Pooler로 개발 (현재 방법)

**장점:**
- ✅ 연결 성공
- ✅ Prisma Studio 작동
- ✅ 데이터 조회/수정 가능

**단점:**
- ❌ `prisma db push` 무한 로딩
- ❌ `prisma migrate` 제한적

**해결책:**
- 스키마 변경은 Supabase Dashboard SQL Editor 사용

## 📋 개발 워크플로우

### 데이터 확인/수정
```bash
# Prisma Studio 실행
DATABASE_URL="$DATABASE_POOLING_URL" npx prisma studio
```

### 스키마 변경
1. `prisma/schema.prisma` 수정
2. Supabase Dashboard → SQL Editor
3. 필요한 SQL 직접 실행

또는:
```bash
# SQL 생성만 (실행 안 함)
npx prisma migrate dev --create-only

# 생성된 SQL 확인 후 Supabase Dashboard에서 실행
cat prisma/migrations/*/migration.sql
```

### 데이터 시드
```bash
# Transaction Pooler 사용
DATABASE_URL="$DATABASE_POOLING_URL" npm run db:seed
```

## 🔧 유틸리티 스크립트

### Prisma Studio 실행
```bash
./scripts/dev-db-studio.sh
```

### 환경 변수 확인
```bash
cat .env | grep DATABASE
```

## 💡 권장 사항

**개발 환경:**
- 데이터 확인/수정: Prisma Studio (Transaction Pooler 사용)
- 스키마 변경: Supabase Dashboard SQL Editor
- 데이터 시드: Transaction Pooler 사용

**프로덕션:**
- 런타임: Transaction Pooler (DATABASE_POOLING_URL)
- 마이그레이션: Supabase Dashboard 또는 CI/CD 파이프라인

