# 연동 체크리스트 (카카오채널 / SNS 로그인 / 본인인증)

## 1) 카카오채널 연동 (메인 하단 `카카오톡 문의`)

### 코드 상태
- 완료: `Footer`가 아래 순서로 채널 URL을 읽어 버튼 링크를 구성함
  - `NEXT_PUBLIC_KAKAO_CHANNEL_URL`
  - `KAKAO_CHANNEL_URL`
  - `COMPANY_INFO.kakaoChannel`
- 완료: 값이 없으면 자동으로 `/inquiry`로 폴백

### 외부 설정
1. 카카오톡 채널 URL 또는 채널 ID 확인
2. `.env`에 `NEXT_PUBLIC_KAKAO_CHANNEL_URL` 또는 `KAKAO_CHANNEL_URL` 설정
3. 배포 환경 변수에도 동일하게 등록

---

## 2) SNS 간편 로그인 (카카오 / 네이버 / 구글)

### 코드 상태
- 완료: 로그인/회원가입 화면에서 3개 소셜 버튼 지원
- 완료: 서버 환경변수 기준으로 사용 가능한 제공자만 자동 활성화
- 완료: 로그인 성공 후 `/api/auth/callback`을 통해 앱 세션 쿠키 동기화

### 외부 설정
1. 각 플랫폼 개발자 콘솔에서 OAuth 앱 생성
2. Redirect URI 등록:
   - `https://<your-domain>/api/auth/callback/<provider>`
   - 로컬: `http://localhost:3000/api/auth/callback/<provider>`
3. `.env`에 클라이언트 ID/SECRET 등록
   - `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## 3) 회원가입 본인인증 (카카오 알림톡 / BizM)

### 코드 상태
- 완료: 회원가입 시 휴대폰 인증 필수
- 완료: 인증 코드 발송/검증 API 구현
- 완료: 발송 및 검증 레이트리밋 추가
  - 발송: IP 기준, 번호 기준
  - 검증: IP 기준, 번호 기준
- 완료: 알림톡 환경변수 `KAKAO_BM_*` + `BIZM_*` 별칭 모두 지원
- 완료: 운영 환경에서 설정이 없으면 실패, 개발환경에서는 콘솔 출력으로 대체

### 외부 설정
1. 비즈엠/카카오 비즈메시지 계약 및 발신프로필 준비
2. 알림톡 템플릿 심사 완료 (인증번호 템플릿)
3. `.env` 설정
   - `KAKAO_BM_CLIENT_ID`, `KAKAO_BM_CLIENT_SECRET`, `KAKAO_BM_SENDER_KEY`, `KAKAO_BM_VERIFICATION_TEMPLATE_CODE`
   - 또는 `BIZM_CLIENT_ID`, `BIZM_CLIENT_SECRET`, `BIZM_SENDER_KEY`, `BIZM_VERIFICATION_TEMPLATE_CODE`
4. 운영 환경에서 실제 번호로 발송/검증 테스트

---

## 권장 검증 시나리오
1. `.env` 설정 후 `npm run validate-env`
2. `npm run dev`로 로그인/회원가입 화면에서 버튼 활성화 확인
3. 각 소셜 로그인 1회씩 실제 계정 로그인 확인
4. 회원가입 휴대폰 인증 코드 발송/검증 성공 확인
5. 메인 하단 `카카오톡 문의` 버튼이 채널로 열리는지 확인
