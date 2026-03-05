# BizM 연결 가이드라인

이 문서는 현재 코드베이스 기준으로 **회원가입 휴대폰 인증 알림톡(BizM)** 을 운영 연결하는 절차입니다.

## 1. 적용 범위

- 대상 기능: 회원가입 휴대폰 인증 코드 발송/검증
- 사용 API:
  - `POST /api/auth/verify-phone` (인증코드 발송)
  - `PUT /api/auth/verify-phone` (인증코드 검증)
- 관련 코드:
  - `app/api/auth/verify-phone/route.ts`
  - `lib/sms.ts`
  - `lib/kakao-alimtalk.ts`

## 2. 현재 구현 방식(중요)

현재 프로젝트는 OAuth 기반 발송 스펙(`POST /v2/send/kakao`)으로 구현되어 있습니다.

- 인증 정보: `KAKAO_BM_CLIENT_ID` + `KAKAO_BM_CLIENT_SECRET` (또는 `BIZM_CLIENT_ID`, `BIZM_CLIENT_SECRET` 별칭)
- 발신 키: `KAKAO_BM_SENDER_KEY` (또는 `BIZM_SENDER_KEY`)
- 템플릿 코드: `KAKAO_BM_VERIFICATION_TEMPLATE_CODE` (또는 `BIZM_VERIFICATION_TEMPLATE_CODE`)

참고:
- BizM `userid` 헤더 기반 `POST /v2/sender/send` 전환은 아직 미적용입니다.
- 전환 작업은 [BIZM_ALIMTALK_TODO.md](./BIZM_ALIMTALK_TODO.md) 기준으로 진행합니다.

## 3. 사전 준비

1. 카카오 채널 비즈니스 인증 완료
2. BizM 관리자에서 발신 프로필 등록
3. 인증번호 템플릿 등록/승인 완료
4. 템플릿 변수 `#{인증번호}` 포함 확인

## 4. 환경변수 설정

둘 중 하나의 키 세트를 사용하면 됩니다.

### 권장: `KAKAO_BM_*`

```env
KAKAO_BM_CLIENT_ID="..."
KAKAO_BM_CLIENT_SECRET="..."
KAKAO_BM_SENDER_KEY="..."
KAKAO_BM_VERIFICATION_TEMPLATE_CODE="..."
KAKAO_BM_BASE_URL="https://bizmsg-web.kakaoenterprise.com"
```

### 별칭: `BIZM_*`

```env
BIZM_CLIENT_ID="..."
BIZM_CLIENT_SECRET="..."
BIZM_SENDER_KEY="..."
BIZM_VERIFICATION_TEMPLATE_CODE="..."
BIZM_BASE_URL="https://bizmsg-web.kakaoenterprise.com"
```

선택값:

```env
KAKAO_BM_SENDER_NO="02xxxxxxxx"
# 또는
BIZM_SENDER_NO="02xxxxxxxx"
```

## 5. 배포 전 점검

1. 배포 환경(Vercel) 변수 등록
2. `NODE_ENV=production` 환경에서 테스트 수행
3. `npm run validate-env` 실행

주의:
- 개발환경(`NODE_ENV !== production`)은 실제 발송 대신 콘솔 출력으로 성공 처리됩니다.
- 실제 BizM 발송 검증은 반드시 운영 모드에서 확인해야 합니다.

## 6. 기능 동작 요약

### 인증코드 발송(`POST /api/auth/verify-phone`)

1. 휴대폰 형식 검증
2. 레이트리밋 검사
  - IP: 1분 5회
  - 번호: 5분 3회
3. 인증코드 DB 저장(유효 5분)
4. BizM 발송 시도
5. 실패 시 DB 코드 정리 후 `502` 반환

### 인증코드 검증(`PUT /api/auth/verify-phone`)

1. 레이트리밋 검사
  - IP: 5분 20회
  - 번호: 5분 10회
2. 코드 일치/만료 확인
3. 성공 시 `verified=true` 업데이트

## 7. API 테스트 예시

### 발송

```bash
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"01012345678"}'
```

### 검증

```bash
curl -X PUT http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"01012345678","code":"123456"}'
```

## 8. 장애 대응 체크리스트

1. 템플릿 코드 오탈자 확인
2. 발신 프로필 키(`SENDER_KEY`) 확인
3. BizM 계정 권한/잔액/발송 제한 확인
4. 서버 로그의 `알림톡 발송 실패` 메시지 확인
5. BizM 코드표로 실패 코드 해석  
   - https://alimtalk-center-api.bizmsg.kr/codeList.html

## 9. 운영 권장사항

1. 템플릿/발신키를 운영/스테이징 분리
2. 실패율 모니터링(일 단위) 및 알림 설정
3. 인증 요청 급증 시 레이트리밋 정책 재조정
4. `BIZM_USER_ID` 기반 표준 Sender API 전환은 별도 배포 계획으로 진행