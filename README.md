# TouchTheWorld - 교육 여행 플랫폼

학교와 지자체를 위한 교육 여행 및 체험학습 전문 플랫폼입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: TailwindCSS, ShadCN UI
- **데이터베이스**: Prisma ORM (MySQL/PostgreSQL)
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 실제 데이터베이스 정보로 수정하세요:

```env
# 데이터베이스 연결 문자열
# MySQL: mysql://user:password@host:port/database
# PostgreSQL: postgresql://user:password@host:port/database
# PlanetScale: mysql://username:password@host.planetscale.com/database?sslaccept=strict
# Supabase: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
DATABASE_URL="mysql://user:password@localhost:3306/touchtheworld"

# 관리자 로그인 비밀번호 (반드시 변경하세요!)
ADMIN_PASSWORD="admin123"
```

**중요**: 
- `DATABASE_URL`을 실제 데이터베이스 연결 정보로 변경하세요
- `ADMIN_PASSWORD`를 안전한 비밀번호로 변경하세요
- `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)

**📚 데이터베이스가 없다면?** 
→ [DATABASE_SETUP.md](./DATABASE_SETUP.md) 파일을 참고하세요. 실무에서 사용하기 좋은 클라우드 데이터베이스 서비스(PlanetScale, Supabase 등) 설정 가이드가 포함되어 있습니다.

### 3. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능

### 사용자 페이지

- **프로그램 목록/상세**: 카테고리별 필터링, 프로그램 상세 정보
- **행사 포트폴리오**: 학교별/연도별 필터링, 행사 상세 페이지
- **학교별 페이지**: 각 학교의 행사 기록 자동 생성
- **자료실**: 공문 템플릿, 안내문, 안전 매뉴얼 등 다운로드
- **문의하기**: 견적 요청 및 문의 폼

### 관리자 페이지

- **프로그램 관리**: CRUD 기능
- **행사 관리**: 행사 등록 및 관리
- **학교 관리**: 학교 정보 관리
- **문의 관리**: 문의 내역 조회 및 상태 변경
- **자료실 관리**: 문서 업로드 및 관리

## 프로젝트 구조

```
/app
  /admin          # 관리자 페이지
  /api            # API 라우트
  /documents      # 자료실
  /events         # 행사 포트폴리오
  /inquiry        # 문의하기
  /programs       # 프로그램
  /school         # 학교별 페이지
/components       # 재사용 컴포넌트
/lib              # 유틸리티 함수
/prisma           # Prisma 스키마
```

## 배포

Vercel에 배포하는 경우:

1. GitHub에 프로젝트를 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 데이터베이스 연결 설정

## 라이선스

MIT

