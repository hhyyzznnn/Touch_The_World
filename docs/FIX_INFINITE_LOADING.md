# Prisma CLI 무한 로딩 해결 방법

## 🚨 문제
- `prisma db push` 또는 `prisma migrate` 실행 시 무한 로딩
- pgbouncer(포트 6543)를 통한 연결 사용 중

## ✅ 해결 방법

### 방법 1: Supabase CLI 사용 (권장)

Supabase CLI는 자동으로 올바른 연결을 사용합니다.

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref futafhvqfxktxnraqbhd

# 마이그레이션 적용
supabase db push
```

### 방법 2: 실제 Direct Connection URL 사용

Supabase Dashboard에서:
1. **Settings** → **Database**
2. **Connection String** 탭
3. **URI** 형식 선택
4. **포트 5432**인 URL 복사 (반드시 포트 5432)

**중요:** 
- `pooler.supabase.com`이 아닌 다른 도메인일 수 있음
- 예: `db.[PROJECT_REF].supabase.co` 또는 `[REGION].supabase.co`

### 방법 3: Supabase Dashboard SQL Editor 사용

1. Supabase Dashboard → **SQL Editor**
2. `prisma migrate dev` 대신 수동으로 SQL 실행
3. Prisma가 생성한 SQL을 복사해서 실행

### 방법 4: 임시 해결책 - prisma migrate deploy 사용

프로덕션 환경에서는 `prisma migrate deploy`를 사용:
```bash
npx prisma migrate deploy
```

이 명령어는 더 간단한 연결을 사용할 수 있습니다.

