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
- **타입 체크**: TypeScript
- **린터**: ESLint + Next.js Config
- **빌드 도구**: Next.js Built-in

## 📋 주요 기능

### ✅ 구현 완료

#### 사용자 페이지
- ✅ **홈페이지**: 히어로 섹션, 프로그램 카테고리, 핵심 가치, 최근 행사
- ✅ **회사 소개**: 회사 정보, 핵심 가치, 연혁
- ✅ **프로그램 목록/상세**: 카테고리별 필터링, 프로그램 상세 정보
- ✅ **행사 포트폴리오**: 학교별/연도별 필터링, 행사 상세 페이지
- ✅ **학교별 페이지**: 각 학교의 행사 기록 자동 생성
- ✅ **사업 실적**: 연도별/기관별 필터링, 실적 목록
- ✅ **자료실**: 문서 다운로드
- ✅ **문의하기**: 견적 요청 및 문의 폼

#### 관리자 페이지
- ✅ **프로그램 관리**: CRUD 기능
- ✅ **행사 관리**: 행사 등록 및 관리
- ✅ **학교 관리**: 학교 정보 관리
- ✅ **사업 실적 관리**: 실적 등록 및 관리
- ✅ **문의 관리**: 문의 내역 조회 및 상태 변경
- ✅ **자료실 관리**: 문서 업로드 및 관리

### 🔄 진행 중 / 예정
- 이미지 업로드 기능 (UploadThing 연동)
- 관리자 인증 시스템 완성
- 검색 기능
- 페이지네이션

## 🗄️ 데이터베이스 스키마

### 주요 모델
- **Program**: 프로그램 정보 (카테고리, 제목, 설명, 일정)
- **ProgramImage**: 프로그램 이미지
- **ProgramSchedule**: 프로그램 일정
- **School**: 학교 정보
- **Event**: 행사 정보 (학교, 프로그램, 날짜, 장소, 학생 수)
- **EventImage**: 행사 이미지
- **Inquiry**: 문의 내역
- **Document**: 자료실 문서
- **Achievement**: 사업 실적 (기관, 연도, 내용)

## 🏗️ 프로젝트 구조

```
Touch_The_World/
├── app/                          # Next.js App Router
│   ├── about/                    # 회사 소개 페이지
│   ├── achievements/             # 사업 실적 페이지
│   ├── admin/                    # 관리자 페이지
│   │   ├── achievements/         # 사업 실적 관리
│   │   ├── documents/           # 자료실 관리
│   │   ├── events/              # 행사 관리
│   │   ├── inquiries/           # 문의 관리
│   │   ├── programs/            # 프로그램 관리
│   │   └── schools/             # 학교 관리
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
│   ├── AdminNav.tsx              # 관리자 네비게이션
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
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?sslmode=require"

# 관리자 로그인 비밀번호 (반드시 변경하세요!)
ADMIN_PASSWORD="your-secure-password"

# NextAuth 설정 (필요시)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**중요**: 
- `DATABASE_URL`을 실제 Supabase 연결 정보로 변경하세요
- Supabase Connection Pooling을 사용하는 경우 포트는 `6543`을 사용하세요
- `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)

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

### 주요 컴포넌트 스타일
- 버튼: Primary (그린 배경), Secondary (아웃라인)
- 카드: 흰색 배경, 그림자 효과, 호버 시 확대
- 섹션: 회색 배경 (`bg-gray-50`)으로 구분

## 🔧 코드 최적화

### 최적화 완료 사항
- ✅ 중복 코드 제거: 상수 파일 분리 (`lib/constants.ts`)
- ✅ 타입 안정성 개선: 타입 정의 파일 생성 (`types/index.ts`)
- ✅ 이미지 최적화: Next.js Image 컴포넌트 `sizes` 속성 추가
- ✅ 컴포넌트 재사용성 향상: 공통 상수 및 타입 활용

### 코드 구조 개선
- 상수 중앙 관리: 프로그램 카테고리, 회사 정보 등
- 타입 안정성: Prisma 타입 확장 및 공통 타입 정의
- 컴포넌트 모듈화: 재사용 가능한 컴포넌트 구조

## 📦 배포

### Vercel 배포

1. GitHub에 프로젝트를 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. 빌드 설정 확인:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 배포 완료 후 데이터베이스 연결 확인

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```env
DATABASE_URL=your-database-url
ADMIN_PASSWORD=your-admin-password
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 📚 추가 문서

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 데이터베이스 설정 가이드
- [SUPABASE_CONNECTION.md](./SUPABASE_CONNECTION.md) - Supabase 연결 가이드

## 🤝 기여

이 프로젝트는 터치더월드의 내부 프로젝트입니다.

## 📄 라이선스

MIT

---

**Touch The World** - 1996년 설립 | 28년 이상의 운영 경험
