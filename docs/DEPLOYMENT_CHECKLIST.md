# 배포 전 체크리스트

## 🚨 배포 전 필수 구현 항목

### 1. 에러 처리 및 에러 페이지
- [x] 404 페이지 (`app/not-found.tsx`) - ✅ 구현됨
- [ ] 500 에러 페이지 (`app/error.tsx`) - **필요**
- [ ] 전역 에러 바운더리
- [ ] API 에러 처리 강화 (현재 기본적인 처리만 있음)

### 2. 환경 변수 검증
- [ ] 배포 시 필수 환경 변수 검증 스크립트
- [ ] 환경 변수 누락 시 명확한 에러 메시지
- [ ] `.env.example` 파일 업데이트

### 3. 보안 강화
- [x] 관리자 인증 (비밀번호 기반) - ✅ 구현됨
- [ ] CSRF 보호 (API 라우트)
- [ ] Rate Limiting (문의 폼, 로그인 등)
- [ ] 입력 데이터 검증 강화 (XSS 방지)
- [ ] SQL Injection 방지 (Prisma 사용으로 기본 방어됨)

### 4. SEO 최적화
- [ ] 메타 태그 설정 (각 페이지별)
- [ ] Open Graph 태그
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] 구조화된 데이터 (JSON-LD)

### 5. 성능 최적화
- [x] 이미지 최적화 확인 (Next.js Image 컴포넌트 사용 중) - ✅ 모든 `<img>` 태그를 `<Image>`로 변경 완료
- [ ] 페이지 로딩 상태 개선 (Skeleton UI)
- [ ] API 응답 캐싱 전략
- [ ] 번들 크기 최적화 확인

### 6. 로깅 및 모니터링
- [ ] 에러 로깅 시스템 (Sentry, LogRocket 등)
- [ ] 프로덕션 로그 수집 계획
- [ ] 성능 모니터링 설정

### 7. 데이터 백업
- [ ] 데이터베이스 백업 계획 수립
- [ ] 백업 자동화 설정 (Supabase 자동 백업 확인)

### 8. 테스트
- [ ] 주요 기능 수동 테스트
- [ ] 모바일 반응형 테스트
- [ ] 브라우저 호환성 테스트

---

## 📋 배포 후 구현 가능한 항목

### 사용자 인증 관련
- [ ] 사용자 회원가입/로그인 활성화 (현재 구현되어 있지만 비활성화 가능)
- [ ] 소셜 로그인 활성화 (환경 변수만 설정하면 됨)
- [ ] 이메일 인증 활성화 (Resend API 키 설정)
- [ ] SMS 인증 활성화 (Twilio API 키 설정)
- [ ] 본인 인증 서비스 연동 (나이스, KG모빌리언스 등)

### 기능 개선
- [ ] 이메일 알림 기능 (문의 접수 시 관리자에게 알림)
- [ ] 페이지네이션 (대량 데이터 처리)
- [ ] 고급 검색 필터
- [ ] 통계 및 리포트 기능
- [ ] 사용자 프로필 관리
- [ ] 즐겨찾기 기능

### 부가 기능
- [ ] 댓글 시스템
- [ ] 공지사항 기능
- [ ] FAQ 페이지
- [ ] 다국어 지원

---

## 🔧 배포 전 환경 변수 확인

### 필수 환경 변수
```env
# 데이터베이스
DATABASE_URL=postgresql://...

# 관리자 인증
ADMIN_PASSWORD=your-secure-password

# NextAuth (사용자 로그인 사용 시)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# UploadThing
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

### 선택적 환경 변수 (배포 후 설정 가능)
```env
# 이메일 인증
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...

# SMS 인증
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# 소셜 로그인
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🎯 배포 우선순위

### Phase 1: 배포 전 필수 (1-2일)
1. 에러 페이지 구현
2. 환경 변수 검증
3. 보안 강화 (Rate Limiting, CSRF)
4. SEO 기본 설정
5. 로깅 시스템 설정

### Phase 2: 배포 직후 (1주일 내)
1. 모니터링 및 에러 추적
2. 성능 최적화
3. 사용자 피드백 수집

### Phase 3: 배포 후 개선 (1개월 내)
1. 사용자 인증 활성화
2. 이메일 알림 기능
3. 고급 기능 추가

---

## 📝 배포 체크리스트

### 배포 전 최종 확인
- [x] 모든 필수 환경 변수 설정
- [x] 데이터베이스 마이그레이션 완료
- [x] 빌드 테스트 통과 (`npm run build`) - ✅ Next.js 15 호환성 문제 해결 완료
- [x] TypeScript 타입 오류 수정 완료
- [x] Prisma Client 빌드 시 자동 생성 설정 완료
- [x] NextAuth v5 라우트 핸들러 호환성 해결 완료
- [x] useSearchParams Suspense boundary 설정 완료
- [ ] 프로덕션 환경 테스트
- [ ] 관리자 계정 생성 및 테스트
- [ ] 주요 페이지 접근 테스트
- [ ] 모바일 반응형 확인
- [ ] 이미지 업로드 테스트
- [ ] 문의 폼 테스트

### 배포 후 확인
- [x] Vercel 배포 성공 - ✅ 빌드 오류 모두 해결 완료
- [ ] 도메인 연결 확인
- [ ] SSL 인증서 확인 (Vercel 자동 설정)
- [ ] 모든 페이지 정상 작동 확인
- [ ] 관리자 페이지 접근 확인
- [ ] 에러 로깅 작동 확인
- [ ] 성능 모니터링 확인

### 해결된 배포 문제들 ✅
- ✅ Next.js 15 호환성: params와 searchParams를 Promise 타입으로 변경
- ✅ NextAuth v5: handlers를 올바르게 export
- ✅ Suspense Boundary: useSearchParams()를 Suspense로 감싸기
- ✅ Prisma Client: 빌드 시 자동 생성 설정
- ✅ TypeScript 타입 오류: 모든 타입 오류 수정 완료
- ✅ ESLint 오류: 이스케이프 따옴표, img 태그 경고 해결
- ✅ JSX 구문 오류: 중복 닫는 태그 수정

---

## 🔗 참고 문서

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 프로덕션 배포](https://nextjs.org/docs/deployment)
- [Supabase 프로덕션 설정](https://supabase.com/docs/guides/platform)

