# 구글 간편 로그인/회원가입 설정 가이드

> **💡 빠른 시작**: 체크리스트가 필요하시면 [GOOGLE_LOGIN_CHECKLIST.md](./GOOGLE_LOGIN_CHECKLIST.md)를 참고하세요.

## 📋 개요

구글 OAuth를 통한 간편 로그인/회원가입 기능이 구현되어 있습니다. 사용자가 구글 계정으로 간편하게 회원가입하고 로그인할 수 있습니다.

**⚠️ 사전 준비**: 개인 Google 계정 또는 회사 Google 계정 사용 가능합니다.

## ✅ 구현 완료 사항

- ✅ NextAuth v5를 통한 구글 OAuth 연동
- ✅ 구글 로그인 버튼 UI (로그인/회원가입 페이지)
- ✅ 자동 회원가입 (구글 계정으로 첫 로그인 시)
- ✅ 자동 로그인 (기존 구글 계정 사용자)
- ✅ 사용자 정보 자동 동기화 (이름, 이메일, 프로필 이미지)
- ✅ 우리 시스템 쿠키 자동 설정

## 🔧 사용자가 해야 할 작업

### 1. Google Cloud Console 설정

#### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 → **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: "Touch The World")
4. **만들기** 클릭

#### 1.2 OAuth 동의 화면 설정
1. 왼쪽 메뉴: **API 및 서비스** → **OAuth 동의 화면**
2. **외부** 선택 → **만들기**
3. 필수 정보 입력:
   - **앱 이름**: Touch The World (또는 원하는 이름)
   - **사용자 지원 이메일**: 본인 이메일
   - **앱 로고**: (선택사항) 업로드
   - **앱 도메인**: `touchtheworld.co.kr` (또는 실제 도메인)
   - **개발자 연락처 정보**: 본인 이메일
4. **저장 후 계속** 클릭
5. **범위** 단계에서 **저장 후 계속** 클릭 (기본 범위 사용)
6. **테스트 사용자** 단계에서 (선택사항) 테스트 이메일 추가
7. **대시보드로 돌아가기** 클릭

#### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 왼쪽 메뉴: **API 및 서비스** → **사용자 인증 정보**
2. 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
3. **애플리케이션 유형**: **웹 애플리케이션** 선택
4. **이름**: "Touch The World Web Client" (또는 원하는 이름)
5. **승인된 리디렉션 URI** 추가:
   ```
   개발 환경:
   http://localhost:3000/api/auth/callback/google
   
   프로덕션 환경:
   https://touchtheworld.co.kr/api/auth/callback/google
   ```
   (실제 도메인으로 변경하세요)
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### 2. 환경 변수 설정

#### 2.1 로컬 개발 환경 (.env 파일)
프로젝트 루트의 `.env` 파일에 다음을 추가:

```env
# 구글 OAuth
GOOGLE_CLIENT_ID="복사한-클라이언트-ID"
GOOGLE_CLIENT_SECRET="복사한-클라이언트-보안-비밀번호"

# NextAuth 설정 (필수)
NEXTAUTH_SECRET="랜덤-문자열-32자-이상"
NEXTAUTH_URL="http://localhost:3000"
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
# 터미널에서 실행
openssl rand -base64 32
```

#### 2.2 Vercel 프로덕션 환경
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 환경 변수 추가:
   - `GOOGLE_CLIENT_ID`: 구글 클라이언트 ID
   - `GOOGLE_CLIENT_SECRET`: 구글 클라이언트 보안 비밀번호
   - `NEXTAUTH_SECRET`: 로컬에서 생성한 시크릿 (또는 새로 생성)
   - `NEXTAUTH_URL`: `https://touchtheworld.co.kr` (실제 도메인)

### 3. Google Cloud Console에서 프로덕션 도메인 추가

프로덕션 배포 후:
1. Google Cloud Console → **사용자 인증 정보** → 생성한 OAuth 클라이언트 ID 클릭
2. **승인된 리디렉션 URI**에 프로덕션 URL 추가:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
3. **저장** 클릭

## 🧪 테스트 방법

### 로컬 테스트
1. 환경 변수 설정 확인
2. 개발 서버 실행:
   ```bash
   npm run dev
   ```
3. 브라우저에서 `http://localhost:3000/login` 접속
4. **구글** 버튼 클릭
5. 구글 계정 선택 및 로그인
6. 자동으로 회원가입/로그인 완료 확인

### 프로덕션 테스트
1. Vercel에 배포
2. 프로덕션 URL에서 로그인 페이지 접속
3. 구글 로그인 테스트

## 🔍 문제 해결

### 문제: "redirect_uri_mismatch" 오류
**원인**: Google Cloud Console에 등록한 리디렉션 URI와 실제 URI가 일치하지 않음

**해결 방법:**
1. Google Cloud Console → 사용자 인증 정보 확인
2. 리디렉션 URI가 정확히 일치하는지 확인:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 프로덕션: `https://your-domain.com/api/auth/callback/google`
3. URI 끝에 슬래시(`/`)가 없는지 확인

### 문제: "invalid_client" 오류
**원인**: 클라이언트 ID 또는 Secret이 잘못됨

**해결 방법:**
1. 환경 변수 확인:
   ```bash
   # 로컬에서 확인
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```
2. Google Cloud Console에서 클라이언트 ID/Secret 재확인
3. Vercel 환경 변수 재설정

### 문제: 로그인은 되지만 쿠키가 설정되지 않음
**원인**: 콜백 핸들러가 제대로 작동하지 않음

**해결 방법:**
1. 브라우저 개발자 도구 → Network 탭에서 `/api/auth/callback/google` 요청 확인
2. 서버 로그 확인 (Vercel Functions Logs)
3. `NEXTAUTH_SECRET`이 올바르게 설정되었는지 확인

## 📝 추가 정보

### 자동 회원가입 프로세스
1. 사용자가 구글 로그인 버튼 클릭
2. 구글 계정 선택 및 승인
3. NextAuth가 사용자 정보 가져오기
4. 이메일로 기존 사용자 확인
5. 없으면 자동으로 새 사용자 생성:
   - `username`: 이메일의 @ 앞부분 (영문/숫자만, 3-20자)
   - `email`: 구글 이메일
   - `name`: 구글 계정 이름
   - `image`: 구글 프로필 이미지
   - `emailVerified`: `true` (자동 인증)
6. 우리 시스템 쿠키 설정
7. 홈페이지로 리디렉션

### 보안 고려사항
- 구글 OAuth는 HTTPS 필수 (프로덕션)
- `NEXTAUTH_SECRET`은 반드시 안전하게 보관
- 클라이언트 Secret은 절대 공개하지 않음
- 리디렉션 URI는 정확히 일치해야 함

## 🎯 다음 단계

구글 로그인이 정상 작동하면:
1. 카카오 로그인 추가 (선택사항)
2. 네이버 로그인 추가 (선택사항)
3. 소셜 로그인 사용자 통계 확인
