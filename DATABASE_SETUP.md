# 데이터베이스 설정

이 프로젝트는 **Supabase (PostgreSQL)**를 사용합니다.

## ✅ 현재 설정

- **데이터베이스**: Supabase PostgreSQL
- **Prisma Provider**: `postgresql`
- **연결**: Connection Pooler 사용 (포트 6543 또는 5432)

## 🔗 연결 정보

연결 문자열은 `.env` 파일의 `DATABASE_URL`에 설정되어 있습니다.

```env
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### 연결 파라미터 설명
- `sslmode=require`: SSL 연결 필수
- `pgbouncer=true`: Transaction Pooling 모드 (Prisma에 최적화)
- 포트 `6543`: Connection Pooling 사용 (포트 5432는 직접 연결, 비권장)

### 연결 오류 해결 방법

**일반적인 오류:**
- `Can't reach database server`: 연결 문자열 또는 Supabase 프로젝트 상태 확인
- `Error { kind: Closed, cause: None }`: 연결이 끊어짐, 재시도 필요

**빠른 해결:**
1. Supabase 프로젝트가 활성화되어 있는지 확인 (일시 중지된 경우 재개)
2. 연결 문자열이 올바른지 확인 (포트 6543 권장)
3. Vercel 환경 변수 확인 (프로덕션 환경)
4. 네트워크 연결 상태 확인
5. 개발 서버 재시작: `npm run dev`

**상세한 문제 해결 가이드:**
→ [docs/DATABASE_TROUBLESHOOTING.md](./docs/DATABASE_TROUBLESHOOTING.md) 파일을 참고하세요.

## 📋 주요 명령어

### Prisma 클라이언트 재생성
```bash
npx prisma generate
```

### 스키마를 데이터베이스에 적용
```bash
npx prisma db push
```

### 샘플 데이터 시드
```bash
npm run db:seed
```

### Prisma Studio (데이터 확인/수정)
```bash
npx prisma studio
```

## 🔒 보안 주의사항

- ✅ `.env` 파일은 절대 Git에 커밋하지 마세요
- ✅ 연결 문자열에 비밀번호가 포함되어 있으므로 안전하게 관리하세요
- ✅ Vercel 배포 시 환경 변수를 Vercel 대시보드에서 설정하세요

## 📚 Supabase 대시보드

- **대시보드**: https://supabase.com/dashboard
- **프로젝트**: `futafhvqfxktxnraqbhd`
- **기능**: 데이터 확인, SQL Editor, 스토리지 관리 등
