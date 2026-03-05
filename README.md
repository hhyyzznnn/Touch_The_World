# Touch The World

학교·지자체 대상 교육 여행/체험 프로그램을 운영하기 위한 웹 플랫폼입니다.  
사용자용 서비스(프로그램 탐색, 후기, 문의, AI 상담)와 관리자용 운영 도구(CRUD, 문의/공지/문서 관리)를 하나의 Next.js 앱으로 제공합니다.

## 핵심 기능

### 사용자 서비스
- 프로그램 탐색/필터/정렬/상세 조회
- 프로그램 비교, 즐겨찾기, 후기 작성
- 행사 포트폴리오, 자료실, 회사 소식(뉴스)
- 문의 접수, 내 문의/내 후기 확인
- 회원가입/로그인(일반 + 소셜), 프로필 관리
- OpenAI 기반 상담 채팅

### 관리자 서비스
- 프로그램/상품/학교/고객사/진행 내역 CRUD
- 문의 상태 관리, 자료실/공지 관리
- 사용자 통계 및 운영 대시보드
- 이미지/파일 업로드(UploadThing)

### 운영 자동화
- 나라장터(G2B) 공고 수집 및 알림 로그 관리
- Vercel Cron을 통한 정기 실행 (`/api/cron/g2b-notification`)

## 기술 스택

- 프레임워크: Next.js 15 (App Router), React 19
- 언어: TypeScript 5
- 스타일: Tailwind CSS, shadcn/ui
- 데이터베이스: PostgreSQL (Supabase)
- ORM: Prisma 5
- 인증: NextAuth v5 + 자체 계정 인증
- 외부 연동: OpenAI, UploadThing, Resend(선택), BizM(선택)
- 배포: Vercel

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

필수(빌드 전 검증 기준):
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `UPLOADTHING_APP_ID`
- `UPLOADTHING_SECRET` 또는 `UPLOADTHING_TOKEN` 중 하나
- `OPENAI_API_KEY`

권장:
- `DATABASE_DIRECT_URL` (Prisma CLI용 direct 5432)
- `DATABASE_POOLING_URL` (런타임용 pooler 6543 + pgbouncer)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `SESSION_SECRET`

참고:
- `DATABASE_URL`은 가능하면 Direct URL(5432)을 사용하세요.
- 소셜 로그인/이메일/알림톡 연동 키는 사용 시에만 설정하면 됩니다.

### 3) 데이터베이스 반영

```bash
npm run db:generate
npm run db:status
npm run db:push
```

선택(샘플 데이터):

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
- `npm run dev` 개발 서버
- `npm run build` 프로덕션 빌드 (`prisma generate` 포함)
- `npm run start` 프로덕션 실행
- `npm run lint` 린트
- `npm run validate-env` 환경 변수 검증

### 데이터베이스
- `npm run db:generate` Prisma Client 생성
- `npm run db:push` 스키마 반영
- `npm run db:migrate:dev` 개발 마이그레이션
- `npm run db:migrate:deploy` 배포 마이그레이션
- `npm run db:status` 마이그레이션 상태 확인
- `npm run db:pull` 스키마 pull
- `npm run db:studio` Prisma Studio

### 시드/운영 스크립트
- `npm run db:seed` 전체 시드
- `npm run db:seed:achievements` 실적 시드
- `npm run db:seed:clients` 고객사/상품 시드
- `npm run db:seed:users` 사용자 시드
- `npm run db:check` DB 상태 점검
- `npm run db:security:check` Supabase 보안 점검
- `npm run db:security:harden` Supabase 보안 설정 보조

## 데이터 모델 요약

주요 Prisma 모델:
- 콘텐츠/운영: `Program`, `Product`, `Event`, `Inquiry`, `Document`, `CompanyNews`, `Achievement`, `Client`, `School`
- 사용자: `User`, `Account`, `Favorite`, `Review`, `EmailVerification`, `PhoneVerification`
- 알림/자동화: `G2BNotice`, `NotificationSetting`, `NotificationLog`, `AdminReadNotification`, `ConsultingLog`

자세한 내용은 `prisma/schema.prisma`를 참고하세요.

## 프로젝트 구조

```text
Touch_The_World/
├── app/                 # App Router 페이지 및 API 라우트
│   ├── admin/           # 관리자 UI
│   └── api/             # 서버 API (auth/chat/inquiry/cron 등)
├── components/          # UI 컴포넌트
├── lib/                 # 인증/DB/유틸/외부 연동 로직
├── prisma/              # Prisma 스키마
├── scripts/             # 운영/마이그레이션/시드 스크립트
├── public/              # 정적 파일
└── README.md
```

## 배포 (Vercel)

1. GitHub 저장소를 Vercel에 연결합니다.
2. 로컬 `.env`와 동일한 환경 변수를 Vercel에 등록합니다.
3. Build Command는 `npm run build`를 사용합니다.
4. `NEXTAUTH_URL`은 실제 배포 도메인으로 설정합니다.

`vercel.json`에는 하루 1회 G2B 크론 작업이 설정되어 있습니다.

## 참고

- 이 저장소에는 현재 `README.md` 외 별도 문서가 포함되어 있지 않습니다.
- 환경 변수 예시는 `.env.example`이 기준입니다.

## 라이선스

MIT
