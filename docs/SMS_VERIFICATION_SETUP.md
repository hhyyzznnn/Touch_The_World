# SMS 인증 설정 가이드

## 📱 Twilio 서비스 설정

### 1. Twilio 계정 생성
1. [Twilio 웹사이트](https://www.twilio.com/) 접속
2. **Sign up** 버튼 클릭하여 무료 계정 생성
3. 이메일 인증 완료
4. 전화번호 인증 완료 (무료 체험용 크레딧 제공)

### 2. 계정 정보 확인
1. Twilio 대시보드 접속
2. **Account SID** 확인 (대시보드 상단에 표시)
3. **Auth Token** 확인:
   - 대시보드에서 **Auth Token** 클릭
   - 토큰 표시 (기본적으로 마스킹되어 있음)
   - **Show** 버튼 클릭하여 전체 토큰 확인

### 3. 전화번호 구매 (프로덕션)
1. 대시보드에서 **Phone Numbers** > **Manage** > **Buy a number** 클릭
2. 국가 선택 (한국: +82)
3. 원하는 번호 선택
4. 구매 완료

### 4. 무료 체험 번호 사용 (개발/테스트)
- Twilio는 무료 체험 계정에 전화번호를 제공합니다
- 대시보드에서 **Phone Numbers** 메뉴에서 확인 가능
- 형식: `+1XXXXXXXXXX` (미국 번호)

## 🔧 환경 변수 설정

`.env` 파일에 다음 변수 추가:

```env
# SMS 인증 (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 환경 변수 설명
- `TWILIO_ACCOUNT_SID`: Twilio 대시보드에서 확인한 Account SID
- `TWILIO_AUTH_TOKEN`: Twilio 대시보드에서 확인한 Auth Token
- `TWILIO_PHONE_NUMBER`: Twilio에서 구매한 전화번호 (E.164 형식, + 포함)

### 전화번호 형식
- **E.164 형식** 사용 (국가 코드 포함)
- 예시:
  - 한국: `+821012345678`
  - 미국: `+1234567890`
  - 영국: `+441234567890`

## 🧪 개발 환경 테스트

개발 환경에서는 `TWILIO_ACCOUNT_SID`를 설정하지 않아도 됩니다:
- SMS 발송 대신 터미널에 인증 코드가 출력됩니다
- 실제 SMS 발송 없이 테스트 가능

터미널 출력 예시:
```
============================================================
📱 SMS 인증 코드 (개발 모드)
============================================================
받는 번호: +821012345678
인증 코드: 123456
============================================================
```

## ✅ 테스트

1. 개발 서버 재시작: `npm run dev`
2. `/register` 페이지 접속
3. 전화번호 입력
4. "인증 코드 발송" 버튼 클릭
5. 인증 코드 확인:
   - 프로덕션: 실제 SMS 수신함 확인
   - 개발: 터미널 출력 확인
6. 인증 코드 입력하여 인증 완료

## 💰 비용

### Twilio SMS 가격 (한국 기준)
- **한국 → 한국**: $0.0075/건 (약 10원)
- **한국 → 해외**: 국가별 상이
- **무료 체험**: $15 크레딧 제공 (약 2,000건)

### 대안 서비스 (한국)
- **CoolSMS**: 20원/건, 한국 서비스
- **알리고**: 20원/건, 한국 서비스
- **AWS SNS**: 국가별 가격 상이

## 🔒 보안 주의사항

1. **환경 변수 보안**
   - `.env` 파일을 Git에 커밋하지 마세요
   - `.gitignore`에 `.env` 추가 확인
   - 프로덕션에서는 환경 변수 관리 서비스 사용 (Vercel, AWS 등)

2. **Auth Token 보안**
   - Auth Token은 절대 공개하지 마세요
   - 토큰이 노출되면 즉시 재생성하세요

3. **전화번호 인증**
   - 인증 코드는 6자리 숫자로 생성됩니다
   - 코드 유효 시간: 10분
   - 코드는 한 번만 사용 가능합니다

## 🔗 참고 링크

- [Twilio 공식 문서](https://www.twilio.com/docs)
- [Twilio SMS 가이드](https://www.twilio.com/docs/sms)
- [Twilio 가격](https://www.twilio.com/pricing)
- [E.164 전화번호 형식](https://en.wikipedia.org/wiki/E.164)

## 🛠️ 대안 서비스 설정 (선택사항)

### CoolSMS를 사용하는 경우
1. [CoolSMS](https://www.coolsms.co.kr/) 회원가입
2. API 키 발급
3. `lib/sms.ts` 파일 수정하여 CoolSMS SDK 사용

### 알리고를 사용하는 경우
1. [알리고](https://www.aligo.in/) 회원가입
2. API 키 발급
3. `lib/sms.ts` 파일 수정하여 알리고 API 사용

