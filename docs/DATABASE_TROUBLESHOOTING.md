# Prisma 데이터베이스 연결 오류 해결 가이드

## 🚨 일반적인 연결 오류

### 오류: `Can't reach database server at ...`

이 오류는 데이터베이스 서버에 연결할 수 없을 때 발생합니다.

## 🔍 문제 진단 단계

### 1. Supabase 프로젝트 상태 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 `futafhvqfxktxnraqbhd` 선택
3. 프로젝트 상태 확인:
   - ✅ **Active**: 정상
   - ⏸️ **Paused**: 일시 중지됨 (재개 필요)
   - ❌ **Deleted**: 삭제됨 (새 프로젝트 필요)

**프로젝트가 일시 중지된 경우:**
- Settings > General > Restore Project 클릭

### 2. 환경 변수 확인

#### 로컬 개발 환경

`.env` 파일 확인:
```bash
# .env 파일이 있는지 확인
cat .env | grep DATABASE_URL
```

**올바른 형식:**
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

#### Vercel 프로덕션 환경

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** > **Environment Variables**
4. `DATABASE_URL` 확인:
   - 값이 설정되어 있는지 확인
   - 올바른 형식인지 확인

### 3. 연결 문자열 형식 확인

#### Connection Pooling 사용 (권장)

**포트 6543 사용:**
```env
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**특징:**
- 포트: `6543` (Connection Pooling)
- `pgbouncer=true` 파라미터 포함
- `pooler.supabase.com` 도메인 사용

#### 직접 연결 (대안)

**포트 5432 사용:**
```env
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**주의:** 직접 연결은 연결 수 제한이 있어 프로덕션에서는 권장하지 않습니다.

### 4. Supabase에서 최신 연결 정보 확인

1. Supabase Dashboard > 프로젝트 선택
2. **Settings** > **Database**
3. **Connection Pooling** 섹션 확인
4. **Connection string** 복사
5. **Transaction** 모드 URL 사용 권장

**Connection Pooling URL 형식:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔧 해결 방법

### 방법 1: Transaction Pooling으로 변경 (권장)

현재 포트 5432 또는 Session 모드를 사용 중이라면 Transaction Pooling으로 변경:

```env
# 기존 (포트 5432 - 직접 연결)
DATABASE_URL="...@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres..."

# 수정 (포트 6543 - Transaction Pooling, 권장)
DATABASE_URL="...@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**중요:**
- 포트 `6543` 사용
- `pgbouncer=true` 파라미터 포함 (Transaction 모드)
- Prisma와 Next.js에 최적화

### 방법 2: Supabase에서 최신 연결 정보 가져오기

1. Supabase Dashboard > Settings > Database
2. **Connection Pooling** 섹션
3. **Transaction** 모드 URL 복사
4. `.env` 파일 또는 Vercel 환경 변수에 붙여넣기

### 방법 3: 비밀번호 URL 인코딩 확인

비밀번호에 특수문자가 있으면 URL 인코딩 필요:

- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**예시:**
```
비밀번호: tTw_2025!Project_DB_pw
인코딩: tTw_2025%21Project_DB_pw
```

### 방법 4: Vercel 환경 변수 업데이트

1. Vercel Dashboard > 프로젝트 > Settings > Environment Variables
2. `DATABASE_URL` 찾기
3. **Edit** 클릭
4. 올바른 연결 문자열로 업데이트
5. **Save** 클릭
6. **Redeploy** 실행 (자동으로 재배포되거나 수동으로 재배포)

### 방법 5: 네트워크 연결 테스트

터미널에서 연결 테스트:

```bash
# PostgreSQL 클라이언트로 연결 테스트
psql "postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

또는:

```bash
# telnet으로 포트 연결 확인
telnet aws-1-ap-southeast-1.pooler.supabase.com 6543
```

## 🛠️ 단계별 해결 체크리스트

### 로컬 개발 환경

- [ ] `.env` 파일이 프로젝트 루트에 있는지 확인
- [ ] `DATABASE_URL` 환경 변수가 설정되어 있는지 확인
- [ ] 연결 문자열이 올바른 형식인지 확인 (포트 6543 권장)
- [ ] 비밀번호 URL 인코딩 확인
- [ ] Supabase 프로젝트가 활성화되어 있는지 확인
- [ ] 개발 서버 재시작: `npm run dev`

### Vercel 프로덕션 환경

- [ ] Vercel Dashboard에서 `DATABASE_URL` 환경 변수 확인
- [ ] 연결 문자열이 올바른 형식인지 확인
- [ ] Supabase 프로젝트가 활성화되어 있는지 확인
- [ ] 환경 변수 업데이트 후 재배포
- [ ] Vercel 로그에서 에러 메시지 확인

## 🔄 재시도 로직 개선

`lib/prisma.ts`에 재시도 로직이 이미 포함되어 있지만, 추가 개선이 필요할 수 있습니다:

```typescript
// lib/prisma.ts 개선 예시
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// 연결 테스트
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ 데이터베이스 연결 성공");
  } catch (error) {
    console.error("❌ 데이터베이스 연결 실패:", error);
    throw error;
  }
}

// 앱 시작 시 연결 테스트 (선택사항)
if (process.env.NODE_ENV !== "production") {
  testConnection();
}
```

## 📞 추가 지원

### Supabase 지원

- [Supabase Status](https://status.supabase.com) - 서비스 상태 확인
- [Supabase Discord](https://discord.supabase.com) - 커뮤니티 지원
- [Supabase 문서](https://supabase.com/docs) - 공식 문서

### 일반적인 문제

1. **프로젝트 일시 중지**: Supabase 무료 플랜은 1주일 비활성 시 일시 중지됩니다
2. **연결 수 제한**: 무료 플랜은 동시 연결 수 제한이 있습니다 (Connection Pooling 사용 권장)
3. **네트워크 문제**: 방화벽이나 네트워크 설정 확인

## 🔗 관련 문서

- [DATABASE_SETUP.md](../DATABASE_SETUP.md) - 데이터베이스 설정 가이드
- [SUPABASE_CONNECTION.md](../SUPABASE_CONNECTION.md) - Supabase 연결 가이드
- [VERCEL_MONITORING.md](./VERCEL_MONITORING.md) - Vercel 모니터링 가이드

---

**팁**: Connection Pooling(포트 6543)을 사용하면 연결 안정성과 성능이 향상됩니다!
