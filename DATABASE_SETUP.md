# 데이터베이스 설정 가이드

실무에서 사용하기 좋은 클라우드 데이터베이스 서비스 추천 및 설정 방법입니다.

## 🏆 추천 순위

### 1. **PlanetScale** (MySQL) ⭐ 추천
**현재 프로젝트와 바로 호환됩니다!**

**장점:**
- ✅ MySQL 호환 (현재 스키마 그대로 사용 가능)
- ✅ 서버리스 - 자동 스케일링, 다운타임 없음
- ✅ 무료 티어 제공 (5GB 스토리지, 10억 읽기/월)
- ✅ Vercel과 완벽 통합
- ✅ 브랜칭 기능 (개발/프로덕션 분리)
- ✅ 관리형 서비스 - 백업, 모니터링 자동 제공
- ✅ SSL 자동 설정

**비용:**
- 무료: 5GB, 1개 데이터베이스
- Scaler ($29/월): 50GB, 무제한 데이터베이스
- Enterprise: 맞춤형

**설정 방법:**
1. [PlanetScale](https://planetscale.com) 가입
2. 새 데이터베이스 생성
3. 연결 문자열 복사
4. `.env` 파일에 `DATABASE_URL` 설정

---

### 2. **Supabase** (PostgreSQL) ⭐⭐ 강력 추천
**더 많은 기능을 원한다면!**

**장점:**
- ✅ PostgreSQL - 강력한 기능
- ✅ 무료 티어 제공 (500MB DB, 1GB 파일 스토리지)
- ✅ 관리자 UI 제공 (데이터 직접 확인/수정 가능)
- ✅ 실시간 기능, 인증, 스토리지 포함
- ✅ 이미지 업로드용 스토리지 내장
- ✅ 자동 백업, 모니터링
- ✅ 한국어 지원

**비용:**
- 무료: 500MB DB, 1GB 스토리지
- Pro ($25/월): 8GB DB, 100GB 스토리지
- Team ($599/월): 더 많은 리소스

**설정 방법:**
1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. 연결 문자열 복사 (Settings > Database > Connection string)
4. Prisma 스키마를 PostgreSQL로 변경 필요

tTw_2025!Project_DB_pw

---

### 3. **Vercel Postgres** (PostgreSQL)
**Vercel에 배포한다면 가장 간단!**

**장점:**
- ✅ Vercel과 완벽 통합
- ✅ 원클릭 설정
- ✅ 자동 백업
- ✅ Edge Functions와 통합

**비용:**
- Hobby ($20/월): 256MB
- Pro ($20/월): 8GB

---

## 🚀 빠른 시작 가이드

### 옵션 1: PlanetScale (MySQL) - 가장 빠름

1. **PlanetScale 가입 및 데이터베이스 생성**
   - https://planetscale.com 접속
   - 무료 계정 생성
   - "Create database" 클릭
   - 데이터베이스 이름 입력 (예: `touchtheworld`)
   - 리전 선택 (가장 가까운 곳)

2. **연결 문자열 복사**
   - 데이터베이스 대시보드에서 "Connect" 클릭
   - "Prisma" 탭 선택
   - 연결 문자열 복사
   - 예: `mysql://username:password@host.planetscale.com/database?sslaccept=strict`

3. **환경 변수 설정**
   ```bash
   # .env 파일 수정
   DATABASE_URL="복사한_연결_문자열"
   ```

4. **마이그레이션 실행**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

### 옵션 2: Supabase (PostgreSQL) - 더 많은 기능

1. **Prisma 스키마 변경**
   ```prisma
   datasource db {
     provider = "postgresql"  // mysql → postgresql로 변경
     url      = env("DATABASE_URL")
   }
   ```

2. **Supabase 가입 및 프로젝트 생성**
   - https://supabase.com 접속
   - 무료 계정 생성
   - "New Project" 클릭
   - 프로젝트 이름, 비밀번호, 리전 설정

3. **연결 문자열 복사**
   - Settings > Database
   - "Connection string" > "URI" 복사
   - 예: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **환경 변수 설정**
   ```bash
   # .env 파일 수정
   DATABASE_URL="복사한_연결_문자열"
   ```

5. **마이그레이션 실행**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 💡 실무 추천

### 작은 규모 ~ 중간 규모 프로젝트
**→ PlanetScale 추천**
- 설정이 가장 간단
- 현재 스키마 그대로 사용 가능
- 무료 티어로 시작 가능
- Vercel 배포 시 완벽 통합

### 이미지 업로드, 실시간 기능 필요
**→ Supabase 추천**
- 스토리지 내장 (이미지 업로드 용이)
- 관리자 UI로 데이터 직접 확인 가능
- 향후 확장 기능 많음

### Vercel 전용 배포
**→ Vercel Postgres 추천**
- 가장 간단한 설정
- Vercel 대시보드에서 통합 관리

---

## 📝 다음 단계

1. 위의 옵션 중 하나 선택
2. 데이터베이스 생성 및 연결 문자열 복사
3. `.env` 파일에 `DATABASE_URL` 설정
4. `npx prisma generate` 실행
5. `npx prisma db push` 실행 (또는 `npx prisma migrate dev`)
6. 개발 서버 실행: `npm run dev`

---

## 🔒 보안 주의사항

- ✅ `.env` 파일은 절대 Git에 커밋하지 마세요
- ✅ 프로덕션 환경에서는 강력한 비밀번호 사용
- ✅ 연결 문자열에 비밀번호가 포함되어 있으므로 안전하게 관리하세요
- ✅ Vercel 배포 시 환경 변수를 Vercel 대시보드에서 설정하세요

