# Vercel 에러 모니터링 및 로그 확인 가이드

Vercel에 배포된 애플리케이션의 에러와 로그를 확인하는 방법입니다.

## 🔍 Vercel 대시보드에서 확인

### 1. 배포 로그 확인

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Deployments** 탭 클릭
4. 특정 배포를 클릭하여 상세 로그 확인

**확인할 수 있는 정보:**
- 빌드 로그 (Build Logs)
- 런타임 로그 (Runtime Logs)
- 함수 실행 로그 (Function Logs)
- 에러 메시지 및 스택 트레이스

### 2. 실시간 로그 스트리밍

**방법 1: Vercel 대시보드**
1. 프로젝트 선택
2. **Deployments** 탭
3. 최신 배포 클릭
4. **Functions** 탭에서 실시간 로그 확인

**방법 2: Vercel CLI**
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그 스트리밍
vercel logs [project-name] --follow
```

### 3. 함수 로그 확인

API 라우트나 Serverless Functions의 로그:

1. 프로젝트 > **Deployments** > 최신 배포
2. **Functions** 탭 클릭
3. 특정 함수 선택하여 로그 확인

**로그 레벨:**
- `console.log()` - 일반 로그
- `console.error()` - 에러 로그
- `console.warn()` - 경고 로그

## 🚨 에러 추적 방법

### 1. Vercel 대시보드 에러 확인

**Functions 탭에서:**
- 함수 실행 횟수
- 에러 발생 횟수
- 평균 실행 시간
- 에러 메시지 및 스택 트레이스

**Analytics 탭에서:**
- 페이지뷰 통계
- 성능 메트릭
- 에러율 추적

### 2. 브라우저 콘솔 확인

프로덕션 환경에서도 클라이언트 사이드 에러는 브라우저 콘솔에서 확인 가능:

1. 배포된 사이트 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭에서 에러 확인
4. **Network** 탭에서 API 요청 실패 확인

### 3. Next.js 에러 페이지

**에러 발생 시:**
- `app/error.tsx` - 에러 바운더리
- `app/not-found.tsx` - 404 페이지
- `app/global-error.tsx` - 전역 에러 (선택사항)

## 📊 모니터링 도구 통합

### 1. Vercel Analytics (기본 제공)

**활성화 방법:**
1. 프로젝트 > **Settings** > **Analytics**
2. **Enable Vercel Analytics** 활성화
3. 코드에 추가 (이미 설정되어 있을 수 있음):

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**확인할 수 있는 정보:**
- 페이지뷰
- 고유 방문자
- 평균 로딩 시간
- 에러율

### 2. Sentry 통합 (추천)

**설치:**
```bash
npm install @sentry/nextjs
```

**설정:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**환경 변수 추가 (Vercel):**
```
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

**장점:**
- 실시간 에러 알림
- 상세한 스택 트레이스
- 사용자 컨텍스트 정보
- 성능 모니터링

### 3. LogRocket 통합

**설치:**
```bash
npm install logrocket
```

**설정:**
```typescript
// lib/logrocket.ts
import LogRocket from 'logrocket';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_ID) {
  LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
}

export default LogRocket;
```

## 🔧 로깅 개선 방법

### 1. 구조화된 로깅

```typescript
// lib/logger.ts
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Sentry 등 외부 서비스로 전송
  // Sentry.captureException(error, { extra: context });
}

export function logInfo(message: string, data?: any) {
  console.log('[INFO]', {
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}
```

### 2. API 라우트 에러 처리

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // API 로직
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, {
      endpoint: '/api/example',
      method: 'GET',
    });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 3. 클라이언트 사이드 에러 처리

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, {
      digest: error.digest,
      page: window.location.pathname,
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## 📈 성능 모니터링

### 1. Vercel Speed Insights

**활성화:**
1. 프로젝트 > **Settings** > **Speed Insights**
2. **Enable Vercel Speed Insights** 활성화

**코드에 추가:**
```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**확인할 수 있는 정보:**
- Core Web Vitals (LCP, FID, CLS)
- 페이지별 성능 메트릭
- 사용자별 성능 데이터

### 2. Web Vitals 측정

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🚨 알림 설정

### 1. Vercel 알림

1. 프로젝트 > **Settings** > **Notifications**
2. 다음 이벤트에 대한 알림 설정:
   - 배포 실패
   - 배포 성공
   - 함수 에러
   - 성능 저하

### 2. 이메일 알림

- Vercel 대시보드에서 이메일 알림 설정
- Slack, Discord 등 웹훅 연동 가능

## 🔍 일반적인 에러 확인 방법

### 1. 500 에러 확인

**Vercel 대시보드:**
1. **Deployments** > 최신 배포
2. **Functions** 탭
3. 에러가 발생한 함수 확인
4. 로그에서 스택 트레이스 확인

**코드에서:**
```typescript
// API 라우트에서
try {
  // 로직
} catch (error) {
  console.error('API Error:', error);
  // 에러 로깅 서비스로 전송
}
```

### 2. 404 에러 확인

- `app/not-found.tsx` 페이지 확인
- 라우트 경로 확인
- 동적 라우트 파라미터 확인

### 3. 데이터베이스 에러

**Prisma 에러 확인:**
```typescript
try {
  const data = await prisma.user.findMany();
} catch (error) {
  console.error('Database Error:', {
    message: error.message,
    code: error.code,
    meta: error.meta,
  });
}
```

**확인 사항:**
- DATABASE_URL 환경 변수 확인
- Supabase 연결 상태 확인
- Prisma Client 생성 확인

## 📝 체크리스트

### 일일 확인
- [ ] Vercel 대시보드에서 최신 배포 상태 확인
- [ ] Functions 탭에서 에러 발생 여부 확인
- [ ] Analytics에서 에러율 확인

### 주간 확인
- [ ] 성능 메트릭 검토
- [ ] 에러 로그 분석
- [ ] 사용자 피드백 확인

### 월간 확인
- [ ] 전체 에러 트렌드 분석
- [ ] 성능 개선 사항 식별
- [ ] 모니터링 도구 최적화

## 🔗 유용한 링크

- [Vercel 로그 문서](https://vercel.com/docs/observability/logs)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Sentry Next.js 통합](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

---

**팁**: 프로덕션 환경에서는 항상 구조화된 로깅과 에러 추적 도구를 사용하는 것을 권장합니다!
