# 소셜 로그인 설정 가이드

## 🔐 OAuth 앱 생성

### 1. 카카오 로그인
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 플랫폼 설정 > Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (개발), `https://yourdomain.com` (프로덕션)
4. 카카오 로그인 > Redirect URI 등록
   - `http://localhost:3000/api/auth/callback/kakao` (개발)
   - `https://yourdomain.com/api/auth/callback/kakao` (프로덕션)
5. 앱 키 > REST API 키 복사
6. 카카오 로그인 > Client ID, Client Secret 복사

### 2. 네이버 로그인
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. 서비스 URL: `http://localhost:3000` (개발)
4. Callback URL: `http://localhost:3000/api/auth/callback/naver`
5. Client ID, Client Secret 복사

### 3. 구글 로그인
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 > 사용자 인증 정보
4. OAuth 2.0 클라이언트 ID 만들기
5. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://yourdomain.com/api/auth/callback/google` (프로덕션)
6. Client ID, Client Secret 복사

## 🔧 환경 변수 설정

`.env` 파일에 다음 변수 추가:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# 카카오
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 네이버
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 구글
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMS 인증 (선택사항)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## 📝 NEXTAUTH_SECRET 생성

터미널에서 실행:
```bash
openssl rand -base64 32
```

또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

## ✅ 테스트

1. 개발 서버 재시작: `npm run dev`
2. `/login` 페이지 접속
3. 소셜 로그인 버튼 클릭
4. 각 서비스 로그인 후 리디렉션 확인

