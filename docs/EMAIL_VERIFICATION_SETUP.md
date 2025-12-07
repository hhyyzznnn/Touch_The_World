# 이메일 인증 설정 가이드

## 📧 Resend 서비스 설정

### 1. Resend 계정 생성
1. [Resend 웹사이트](https://resend.com/) 접속
2. 회원가입 또는 로그인
3. 대시보드로 이동

### 2. API 키 생성
1. 대시보드에서 **API Keys** 메뉴 클릭
2. **Create API Key** 버튼 클릭
3. API 키 이름 입력 (예: "Touch The World")
4. 권한 선택: **Full Access** 또는 **Sending Access**
5. 생성된 API 키 복사 (한 번만 표시되므로 안전하게 보관)

### 3. 도메인 설정 (프로덕션)
1. 대시보드에서 **Domains** 메뉴 클릭
2. **Add Domain** 버튼 클릭
3. 도메인 입력 (예: `yourdomain.com`)
4. DNS 레코드 추가:
   - SPF 레코드
   - DKIM 레코드
   - DMARC 레코드 (선택사항)
5. DNS 설정 완료 후 **Verify** 버튼 클릭
6. 인증 완료까지 몇 분 소요될 수 있음

### 4. 발신 이메일 주소 설정
- **개발 환경**: Resend의 테스트 도메인 사용 가능 (`onboarding@resend.dev`)
- **프로덕션**: 본인 소유 도메인의 이메일 주소 사용 (예: `noreply@yourdomain.com`)

## 🔧 환경 변수 설정

`.env` 파일에 다음 변수 추가:

```env
# 이메일 인증 (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 환경 변수 설명
- `RESEND_API_KEY`: Resend 대시보드에서 생성한 API 키
- `RESEND_FROM_EMAIL`: 발신 이메일 주소 (도메인 인증 필요)

## 🧪 개발 환경 테스트

개발 환경에서는 `RESEND_API_KEY`를 설정하지 않아도 됩니다:
- 이메일 발송 대신 터미널에 인증 링크가 출력됩니다
- 실제 이메일 발송 없이 테스트 가능

터미널 출력 예시:
```
============================================================
📧 이메일 인증 링크 (개발 모드)
============================================================
받는 사람: user@example.com
인증 링크: http://localhost:3000/verify-email?token=xxxxx
============================================================
```

## ✅ 테스트

1. 개발 서버 재시작: `npm run dev`
2. `/register` 페이지 접속
3. 회원가입 진행
4. 이메일 인증 링크 확인:
   - 프로덕션: 실제 이메일 수신함 확인
   - 개발: 터미널 출력 확인
5. 링크 클릭하여 이메일 인증 완료

## 💰 비용

- **무료 플랜**: 월 3,000건 무료
- **유료 플랜**: $20/월부터 (월 50,000건)
- 자세한 내용: [Resend 가격](https://resend.com/pricing)

## 🔗 참고 링크

- [Resend 공식 문서](https://resend.com/docs)
- [Resend API 레퍼런스](https://resend.com/docs/api-reference)
- [도메인 인증 가이드](https://resend.com/docs/dashboard/domains/introduction)

