# BizM 본인인증 알림톡 TODO

현재 상태:
- 회원가입 휴대폰 인증 API는 구현되어 있음.
- 알림톡 발송 유틸도 구현되어 있으나, 현재 호출 스펙은 OAuth + `/v2/send/kakao` 기준.
- BizM API 가이드(v2.29.1)의 핵심 발송 스펙은 `/v2/sender/send` + `userid` 헤더.

## 1. 콘솔 준비 작업

- [ ] 카카오 채널 비즈니스 인증 완료
- [ ] BizM 관리자에서 채널 등록
- [ ] 발신프로필키(`profile`, 40자) 확인
- [ ] 본인인증 알림톡 템플릿 등록/승인
- [ ] 템플릿 코드(`tmplId`) 확인
- [ ] 템플릿 변수 `#{인증번호}` 포함 확인

## 2. 환경변수 준비

최소 운영값:
- [ ] `BIZM_USER_ID` (BizM 계정명, userid 헤더용)
- [ ] `BIZM_SENDER_KEY` (발신프로필키, profile)
- [ ] `BIZM_VERIFICATION_TEMPLATE_CODE` (tmplId)
- [ ] `BIZM_BASE_URL=https://alimtalk-api.bizmsg.kr`

선택:
- [ ] `BIZM_USER_KEY` (잔액조회 등 계정 API 사용 시)
- [ ] `BIZM_SENDER_NO` (대체문자 기능 사용할 때)

## 3. 코드 변경 작업 (나중에 구현)

대상 파일:
- `lib/kakao-alimtalk.ts`
- `lib/sms.ts`

변경 체크리스트:
- [ ] 발송 API를 `/v2/sender/send`로 전환
- [ ] 헤더에 `userid` 추가
- [ ] 본문 배열 구조 적용(단건도 배열 1개)
- [ ] 알림톡 필수 필드 매핑 확인
  - `message_type` (AT/AI)
  - `phn`
  - `profile`
  - `tmplId`
  - `msg`
- [ ] 응답 파싱을 `code=success|fail` 기준으로 통일
- [ ] 실패 메시지를 API 응답 `message`로 노출
- [ ] 운영 실패 시 `verify-phone` API에서 502 반환 유지

## 4. 테스트 작업

- [ ] 운영 환경변수 입력 후 재배포
- [ ] 실제 번호로 인증코드 발송 테스트
- [ ] 인증코드 검증(`PUT /api/auth/verify-phone`) 테스트
- [ ] 레이트리밋 동작 확인(과호출 시 429)
- [ ] 실패코드 확인 및 원인 정리
  - 코드표: `https://alimtalk-center-api.bizmsg.kr/codeList.html`

## 5. 운영 전 최종 점검

- [ ] 발신 프로필/템플릿/수신번호 정책 위반 없는지 확인
- [ ] 템플릿 문구와 실제 `msg` 치환값 일치 확인
- [ ] 장애 시 폴백 정책(문자 대체 발송 여부) 결정
