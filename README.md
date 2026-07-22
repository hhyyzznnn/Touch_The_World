# Touch The World

학교·지자체 대상 교육여행·체험학습 프로그램을 운영하기 위한 웹 플랫폼입니다.  
사용자용 서비스(프로그램 탐색, 후기, 문의, AI 상담)와 관리자용 운영 도구(CRUD, 문의/공지/문서 관리)를 하나의 Next.js 앱으로 제공합니다.

## 핵심 기능

### 사용자 서비스
- 프로그램 탐색/필터/정렬/상세 조회, 비교, 즐겨찾기, 후기 작성
- 행사 포트폴리오, 자료실, 회사 소식(뉴스 티커)
- **문의 접수**: 빠른 문의 + 상세 문의(30개 항목 · 6개 카테고리)
- 내 문의/내 후기 확인
- 회원가입/로그인(일반 + 소셜), 프로필 관리
- OpenAI 기반 AI 상담 채팅 (카테고리/프로그램 연동)
- **카드뉴스**: PC 4열 그리드(영상 1 + 카드뉴스 3), 모바일 가로 스크롤

### 관리자 서비스
- 프로그램/상품/학교/고객사/진행 내역 CRUD
- 문의 상태 관리, 자료실/공지 관리
- 사용자 통계 및 운영 대시보드
- 이미지/파일 업로드 (UploadThing)

### 운영 자동화
- 나라장터(G2B) 공고 수집 및 알림 로그 관리
- Vercel Cron 정기 실행 (`/api/cron/g2b-notification`)

### 분석
- GA4 커스텀 이벤트: `chat_start`, `category_click`, `card_news_click`, `inquiry_submit`, `kakao_contact_click`, `phone_click`, `program_view`

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19 |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS, shadcn/ui |
| 폰트 | Pretendard Variable (self-hosted), Noto Serif KR, Bona Nova SC |
| 데이터베이스 | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| 인증 | NextAuth v5 + 자체 계정 인증 |
| 외부 연동 | OpenAI, UploadThing, Resend, BizM, Google Analytics 4 |
| 배포 | Vercel (ISR revalidate 600s) |

## 빠른 시작

### 1) 설치

```bash
git clone <repository-url>
cd Touch_The_World
npm install
```

### 2) 환경 변수 설정

```bash
cp .env.example .env
```

필수:
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `UPLOADTHING_APP_ID`, `UPLOADTHING_SECRET` (또는 `UPLOADTHING_TOKEN`)
- `OPENAI_API_KEY`

권장:
- `DATABASE_DIRECT_URL` (Prisma CLI용 direct 5432)
- `DATABASE_POOLING_URL` (런타임용 pooler 6543 + pgbouncer)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SESSION_SECRET`
- `NEXT_PUBLIC_GA_ID` (GA4 측정 ID)

### 3) 데이터베이스 반영

```bash
npm run db:generate
npm run db:push
```

> Supabase 환경에서 `db:push`가 안 될 경우 Supabase SQL 에디터에서 직접 `ALTER TABLE` 실행 후 `db:generate`만 사용합니다.

샘플 데이터:

```bash
npm run db:seed
```

### 4) 개발 서버 실행

```bash
npm run dev
```

기본 주소: `http://localhost:3000`

## 주요 스크립트

### 앱 실행/검증
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (`prisma generate` 포함)
- `npm run start` — 프로덕션 실행
- `npm run lint` — 린트
- `npm run validate-env` — 환경 변수 검증

### 데이터베이스
- `npm run db:generate` — Prisma Client 생성
- `npm run db:push` — 스키마 반영
- `npm run db:migrate:dev` — 개발 마이그레이션
- `npm run db:migrate:deploy` — 배포 마이그레이션
- `npm run db:status` — 마이그레이션 상태 확인
- `npm run db:studio` — Prisma Studio
- `npm run db:sql -- --sql "<SQL>"` — SQL 직접 실행
- `npm run db:sql -- --file <path.sql>` — SQL 파일 실행

### 시드/운영
- `npm run db:seed` — 전체 시드
- `npm run db:seed:achievements` — 실적 시드
- `npm run db:seed:clients` — 고객사/상품 시드
- `npm run db:check` — DB 상태 점검
- `npm run db:security:check` — Supabase 보안 점검

## 데이터 모델 요약

주요 Prisma 모델:
- **콘텐츠/운영**: `Program`, `Product`, `Event`, `Inquiry`, `Document`, `CompanyNews`, `Achievement`, `Client`, `School`
- **사용자**: `User`, `Account`, `Favorite`, `Review`, `EmailVerification`, `PhoneVerification`
- **알림/자동화**: `G2BNotice`, `NotificationSetting`, `NotificationLog`, `ConsultingLog`

`Inquiry` 모델은 30개 필드(6개 카테고리)로 구성됩니다: 기본 정보 / 일정 및 인원 / 여행 형태 / 숙박 및 식사 / 교육 및 프로그램 / 안전·행정.

자세한 내용은 `prisma/schema.prisma`를 참고하세요.

## 프로젝트 구조

```text
Touch_The_World/
├── app/                 # App Router 페이지 및 API 라우트
│   ├── admin/           # 관리자 UI
│   ├── api/             # 서버 API (auth/chat/inquiry/cron/greeting 등)
│   └── inquiry/         # 문의 페이지
├── components/
│   ├── forms/           # InquiryForm (30항목 6카테고리)
│   ├── home/            # 홈페이지 전용 컴포넌트
│   └── ui/              # shadcn/ui 기반 공통 컴포넌트
├── lib/                 # 인증/DB/유틸/외부 연동 로직
├── prisma/              # Prisma 스키마
├── public/
│   ├── fonts/           # Pretendard Variable (self-hosted)
│   └── images/          # WebP 최적화 이미지
├── scripts/             # 운영/마이그레이션/시드 스크립트
└── README.md
```

## 배포 (Vercel)

1. GitHub 저장소를 Vercel에 연결합니다.
2. 로컬 `.env`와 동일한 환경 변수를 Vercel에 등록합니다.
3. Build Command: `npm run build`
4. `NEXTAUTH_URL`은 실제 배포 도메인으로 설정합니다.

`vercel.json`은 Supabase DB 리전(싱가포르)과 맞춰 함수 리전을 `sin1`으로 고정합니다. G2B 크론 작업은 GitHub Actions(`.github/workflows/g2b-notification.yml`)에서 하루 1회 실행됩니다.

홈페이지는 ISR(`revalidate = 600`)로 운영됩니다. `searchParams` 접근이나 `cookies()` 호출이 페이지 렌더 트리에 포함되면 dynamic rendering으로 전환되어 캐시가 무력화되므로 주의하세요.

## 참고

- 환경 변수 예시: `.env.example`

## 라이선스

MIT
