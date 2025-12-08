# TouchTheWorld - 교육 여행 플랫폼

1996년 설립된 터치더월드의 교육·체험·AI 융합 프로그램 전문 플랫폼입니다. 학교와 지자체를 위한 교육 여행 및 체험학습을 제공합니다.

## 🚀 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 15 (App Router, React Server Components)
- **언어**: TypeScript 5.7
- **스타일링**: 
  - TailwindCSS 3.4
  - ShadCN UI
  - Noto Serif KR (포인트 폰트)
- **아이콘**: Lucide React
- **폼 관리**: React Hook Form + Zod

### 백엔드 & 데이터베이스
- **ORM**: Prisma 5.20
- **데이터베이스**: PostgreSQL (Supabase)
- **인증**: NextAuth v5 (Beta)
- **파일 업로드**: UploadThing

### 개발 도구
- **패키지 관리**: npm
- **타입 체크**: TypeScript 5.7
- **린터**: ESLint + Next.js Config
- **빌드 도구**: Next.js Built-in
- **선택적 의존성**: Twilio (SMS 인증용, optional)

## 📋 주요 기능

### ✅ 구현 완료

#### 사용자 페이지
- ✅ **홈페이지**: 히어로 섹션, 프로그램 카테고리, 핵심 가치, 최근 행사
- ✅ **회사 소개**: 회사 정보, 핵심 가치, 연혁
- ✅ **프로그램 목록/상세**: 카테고리별 필터링, 프로그램 상세 정보
- ✅ **행사 포트폴리오**: 연도/행사 종류/지역/키워드 필터링, 행사 목록
- ✅ **사업 실적**: 연도별/기관별 필터링, 실적 목록, 최근 행사 섹션
- ✅ **자료실**: 문서 다운로드
- ✅ **문의하기**: 견적 요청 및 문의 폼
- ✅ **소셜 미디어**: 인스타그램, 페이스북 링크

#### 관리자 페이지
- ✅ **대시보드**: 운영 현황 요약, 진행 중인 프로그램, 빠른 링크
- ✅ **상품 관리**: 상품(프로그램) CRUD 기능, 이미지 업로드
- ✅ **진행 내역 관리**: 행사 등록 및 관리, 상태 관리 (진행 중/완료)
- ✅ **문의 관리**: 문의 내역 조회, 상세 보기 모달, 상태 변경 (대기/완료)
- ✅ **사업 실적 관리**: 실적 등록 및 관리
- ✅ **자료실 관리**: 문서 업로드 및 관리
- ✅ **고객사 관리**: 고객사 정보 관리
- ✅ **전역 검색**: 상품, 진행 내역, 학교 검색

#### 기술적 기능
- ✅ **이미지 업로드**: UploadThing 연동 (프로그램, 상품, 행사 이미지)
- ✅ **파일 업로드**: 자료실 문서 업로드
- ✅ **모바일 반응형**: 모든 페이지 모바일 최적화
- ✅ **관리자 인증**: NextAuth 기반 인증 시스템

### 🔄 진행 중 / 예정
- 페이지네이션
- 고급 검색 필터
- 통계 및 리포트 기능

## 🗄️ 데이터베이스 스키마

### 주요 모델
- **Program**: 프로그램 정보 (카테고리, 제목, 설명, 일정)
- **ProgramImage**: 프로그램 이미지
- **ProgramSchedule**: 프로그램 일정
- **Product**: 상품 정보 (카테고리, 지역)
- **School**: 학교 정보
- **Event**: 행사 정보 (학교, 프로그램, 날짜, 장소, 학생 수, 상태, 메모)
- **EventImage**: 행사 이미지
- **Inquiry**: 문의 내역 (학교명, 담당자, 연락처, 문의 내용, 상태)
- **Document**: 자료실 문서
- **Achievement**: 사업 실적 (기관, 연도, 내용)
- **Client**: 고객사 정보

## 🏗️ 프로젝트 구조

```
Touch_The_World/
├── app/                          # Next.js App Router
│   ├── about/                    # 회사 소개 페이지
│   ├── achievements/             # 사업 실적 페이지
│   ├── admin/                    # 관리자 페이지
│   │   ├── achievements/         # 사업 실적 관리
│   │   ├── clients/             # 고객사 관리
│   │   ├── documents/           # 자료실 관리
│   │   ├── events/              # 진행 내역 관리
│   │   ├── inquiries/           # 문의 관리
│   │   ├── programs/            # 상품 관리
│   │   └── products/           # 상품 관리 (기존)
│   ├── api/                      # API 라우트
│   │   ├── admin/               # 관리자 API
│   │   └── inquiry/             # 문의 API
│   ├── documents/                # 자료실 페이지
│   ├── events/                   # 행사 포트폴리오
│   ├── inquiry/                  # 문의하기 페이지
│   ├── programs/                 # 프로그램 페이지
│   ├── school/                   # 학교별 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지
│   └── globals.css               # 전역 스타일
├── components/                   # 재사용 컴포넌트
│   ├── ui/                       # ShadCN UI 컴포넌트
│   ├── Header.tsx                # 헤더
│   ├── Footer.tsx                # 푸터
│   ├── Logo.tsx                  # 로고
│   ├── AdminNav.tsx              # 관리자 네비게이션 (모바일 반응형)
│   ├── GlobalSearchBar.tsx       # 전역 검색 바
│   ├── InquiryDetailModal.tsx    # 문의 상세 모달
│   ├── InquiryActions.tsx        # 문의 작업 버튼
│   └── *Form.tsx                 # 폼 컴포넌트들
├── lib/                          # 유틸리티 및 설정
│   ├── constants.ts              # 상수 정의
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── utils.ts                  # 유틸리티 함수
│   └── auth.ts                   # 인증 설정
├── types/                        # TypeScript 타입 정의
│   └── index.ts                  # 공통 타입
├── prisma/                       # Prisma 설정
│   ├── schema.prisma             # 데이터베이스 스키마
│   └── migrations/               # 마이그레이션 파일
├── scripts/                      # 스크립트
│   └── seed-achievements.ts      # 사업 실적 시드 스크립트
├── public/                       # 정적 파일
│   └── ttw_logo.png              # 로고 이미지
└── package.json                  # 프로젝트 설정
```

## 🚦 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd Touch_The_World
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 연결 문자열 (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?sslmode=require&pgbouncer=true"

# 관리자 로그인 비밀번호 (반드시 변경하세요!)
ADMIN_PASSWORD="your-secure-password"

# NextAuth 설정
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# 이메일 인증 (Resend) - 선택사항
# 개발 환경에서는 설정하지 않으면 터미널에 인증 링크가 출력됩니다
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# SMS 인증 (Twilio) - 선택사항
# 개발 환경에서는 설정하지 않으면 터미널에 인증 코드가 출력됩니다
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# 소셜 로그인 (선택사항)
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**중요**: 
- `DATABASE_URL`을 실제 Supabase 연결 정보로 변경하세요
- **Prisma + Next.js 사용 시 Transaction Pooling 권장**: 포트 `6543` 사용하고 `&pgbouncer=true` 추가
  ```env
  DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
  ```
- `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 상세한 연결 모드 비교는 [SUPABASE_CONNECTION.md](./SUPABASE_CONNECTION.md) 참고
- **이메일 인증**: `RESEND_API_KEY`를 설정하지 않으면 개발 환경에서 터미널에 인증 링크가 출력됩니다
- **SMS 인증**: `TWILIO_ACCOUNT_SID`를 설정하지 않으면 개발 환경에서 터미널에 인증 코드가 출력됩니다

**📚 데이터베이스 설정 가이드**: 
→ [DATABASE_SETUP.md](./DATABASE_SETUP.md) 파일을 참고하세요.

### 4. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# (선택) 사업 실적 시드 데이터 추가
npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📝 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 사업 실적 시드 데이터 추가
npm run db:seed

# 클라이언트 및 상품 시드 데이터 추가
npm run db:seed:clients

# 사업 실적만 시드 데이터 추가
npm run db:seed:achievements
```

## 🎨 디자인 시스템

### 브랜드 컬러
- **메인 그린**: `#00954B` (`brand-green`)
- **프라이머리 그린**: `#2E6D45` (`brand-green-primary`)
- **텍스트 그레이**: `#969696` (`text-gray`)
- **텍스트 다크**: `#1D1D1B` (`text-dark`)

### 폰트
- **본문**: Inter
- **포인트**: Noto Serif KR (서체)
- **폰트 굵기**: 주로 `font-medium` 사용 (일관성 있는 디자인)

### 주요 컴포넌트 스타일
- 버튼: Primary (그린 배경), Secondary (아웃라인)
- 카드: 흰색 배경, 그림자 효과, 호버 시 확대
- 섹션: 회색 배경 (`bg-gray-50`)으로 구분
- 입력 필드: 초록색 포커스 링 (`focus:ring-brand-green-primary`)
- 라디오/체크박스: 초록색 강조 (`accent-color: #2E6D45`)

### 반응형 디자인
- **모바일 우선**: Mobile-first 접근 방식
- **브레이크포인트**: `sm:`, `md:`, `lg:` 사용
- **테이블**: 모바일에서 가로 스크롤 (`overflow-x-auto`)
- **네비게이션**: 모바일에서 햄버거 메뉴

## 🔧 코드 최적화

### 최적화 완료 사항
- ✅ 중복 코드 제거: 상수 파일 분리 (`lib/constants.ts`)
- ✅ 타입 안정성 개선: 타입 정의 파일 생성 (`types/index.ts`)
- ✅ 이미지 최적화: Next.js Image 컴포넌트 `sizes` 속성 추가
- ✅ 컴포넌트 재사용성 향상: 공통 상수 및 타입 활용
- ✅ 모바일 반응형: 모든 페이지 모바일 최적화
- ✅ 폼 검증: React Hook Form + Zod로 타입 안전한 폼 관리

### 코드 구조 개선
- 상수 중앙 관리: 프로그램 카테고리, 회사 정보, 소셜 미디어 링크 등
- 타입 안정성: Prisma 타입 확장 및 공통 타입 정의
- 컴포넌트 모듈화: 재사용 가능한 컴포넌트 구조
- 모달 컴포넌트: 문의 상세 보기 등 재사용 가능한 모달
- API 라우트: RESTful API 구조로 일관성 유지

## 📦 배포

### ✅ 배포 상태
- **현재 상태**: Vercel에 성공적으로 배포 완료
- **빌드 상태**: 모든 오류 해결 완료
- **호환성**: Next.js 15, NextAuth v5 완전 호환

### Vercel 배포

1. GitHub에 프로젝트를 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (배포된 도메인 URL)
   - `RESEND_API_KEY` (이메일 인증용, 선택사항)
   - `RESEND_FROM_EMAIL` (이메일 발신 주소, 선택사항)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (SMS 인증용, 선택사항)
4. 빌드 설정 확인:
   - Build Command: `npm run build` (자동으로 `prisma generate` 포함)
   - Output Directory: `.next`
   - Install Command: `npm install` (기본값)
5. 배포 완료 후 데이터베이스 연결 확인

**참고**: 
- Prisma Client는 빌드 과정에서 자동으로 생성됩니다 (`package.json`의 `build` 스크립트에 포함)
- Next.js 15와 NextAuth v5 호환성 문제는 모두 해결되었습니다
- 모든 타입 오류와 빌드 경고가 해결되어 안정적으로 배포됩니다

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```env
DATABASE_URL=your-database-url
ADMIN_PASSWORD=your-admin-password
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🎯 주요 업데이트 내역

### 2025년 업데이트

#### 최근 업데이트 (배포 최적화)
- ✅ **Next.js 15 호환성**: params와 searchParams를 Promise 타입으로 변경
- ✅ **NextAuth v5**: handlers를 올바르게 export하여 라우트 핸들러 호환성 확보
- ✅ **Suspense Boundary**: useSearchParams()를 Suspense로 감싸서 빌드 오류 해결
- ✅ **Prisma Client**: Vercel 빌드 시 자동 생성 설정 추가
- ✅ **타입 안정성**: 모든 TypeScript 타입 오류 수정
- ✅ **빌드 최적화**: ESLint 오류 및 이미지 최적화 경고 해결

#### 기능 업데이트
- ✅ 용어 정리: "프로그램" → "상품", "행사" → "진행 내역"
- ✅ 문의 관리 개선: 상세 보기 모달, 상태 변경 기능
- ✅ 이미지 업로드: UploadThing 연동 완료
- ✅ 모바일 반응형: 모든 admin 페이지 모바일 최적화
- ✅ 소셜 미디어: 인스타그램, 페이스북 링크 추가
- ✅ Event 모델 확장: 상태(status), 메모(notes) 필드 추가
- ✅ 행사 포트폴리오: 필터링 시스템 개선 (학교 제거, 연도 통합)

## 📚 추가 문서

### 데이터베이스
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 데이터베이스 설정 가이드
- [SUPABASE_CONNECTION.md](./SUPABASE_CONNECTION.md) - Supabase 연결 가이드
- [docs/DATABASE_TROUBLESHOOTING.md](./docs/DATABASE_TROUBLESHOOTING.md) - 데이터베이스 연결 오류 해결 가이드
- [docs/QUICK_FIX_DATABASE.md](./docs/QUICK_FIX_DATABASE.md) - 데이터베이스 연결 오류 빠른 해결 가이드

### 인증 기능 설정
- [docs/SOCIAL_LOGIN_SETUP.md](./docs/SOCIAL_LOGIN_SETUP.md) - 소셜 로그인 설정 가이드 (카카오, 네이버, 구글)
- [docs/KAKAO_LOGIN_REST_API.md](./docs/KAKAO_LOGIN_REST_API.md) - 카카오 로그인 REST API 상세 가이드
- [docs/EMAIL_VERIFICATION_SETUP.md](./docs/EMAIL_VERIFICATION_SETUP.md) - 이메일 인증 설정 가이드 (Resend)
- [docs/SMS_VERIFICATION_SETUP.md](./docs/SMS_VERIFICATION_SETUP.md) - SMS 인증 설정 가이드 (Twilio)
- [docs/AUTH_IMPLEMENTATION.md](./docs/AUTH_IMPLEMENTATION.md) - 인증 기능 구현 가이드

### 도메인 연결
- [docs/DOMAIN_SETUP.md](./docs/DOMAIN_SETUP.md) - 가비아 도메인을 Vercel에 연결하는 가이드

### 모니터링 및 로깅
- [docs/VERCEL_MONITORING.md](./docs/VERCEL_MONITORING.md) - Vercel 에러 모니터링 및 로그 확인 가이드

### 환경 변수 관리
- [docs/VERCEL_ENV_UPDATE.md](./docs/VERCEL_ENV_UPDATE.md) - Vercel 환경 변수 업데이트 가이드

## 🤝 기여

이 프로젝트는 터치더월드의 내부 프로젝트입니다.

## 📄 라이선스

MIT

---

**Touch The World** - 1996년 설립 | 28년 이상의 운영 경험
