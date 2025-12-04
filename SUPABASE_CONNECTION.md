# Supabase Connection Pooling 설정 가이드

IPv4/IPv6 호환 문제로 인해 Supabase Connection Pooler를 사용해야 합니다.

## Connection Pooling URL 확인 방법

1. Supabase 대시보드 접속
2. 프로젝트 선택
3. **Settings** > **Database** 메뉴로 이동
4. **Connection Pooling** 섹션에서 URL 확인

## Connection Pooling URL 형식

일반적으로 다음과 같은 형식입니다:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

또는 Transaction 모드:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
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

