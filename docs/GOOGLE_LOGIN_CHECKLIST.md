# 구글 간편 로그인 설정 체크리스트 ✅

> **참고**: 개인 Google 계정 또는 회사 Google 계정 사용 가능합니다.

## 📋 사전 준비사항

- [ ] Google 계정 준비 (개인 또는 회사 계정)
- [ ] Google Cloud Console 접근 가능
- [ ] Vercel 대시보드 접근 가능

---

## 1단계: Google Cloud Console 설정 (약 15분)

### 1.1 프로젝트 생성
- [ ] [Google Cloud Console](https://console.cloud.google.com/) 접속
- [ ] 상단 프로젝트 선택 → **새 프로젝트** 클릭
- [ ] 프로젝트 이름 입력: `Touch The World` (또는 원하는 이름)
- [ ] **만들기** 클릭
- [ ] 프로젝트 생성 완료 대기 (1-2분)

### 1.2 OAuth 동의 화면 설정
- [ ] 왼쪽 메뉴: **API 및 서비스** → **OAuth 동의 화면**
- [ ] **외부** 선택 → **만들기** 클릭
- [ ] 필수 정보 입력:
  - [ ] **앱 이름**: `Touch The World` (또는 원하는 이름)
  - [ ] **사용자 지원 이메일**: Google 계정 이메일 (개인 또는 회사)
  - [ ] **앱 로고**: (선택사항) 업로드
  - [ ] **앱 도메인**: `touchtheworld.co.kr` (또는 실제 도메인)
  - [ ] **개발자 연락처 정보**: Google 계정 이메일 (개인 또는 회사)
- [ ] **저장 후 계속** 클릭
- [ ] **범위** 단계에서 **저장 후 계속** 클릭 (기본 범위 사용)
- [ ] **테스트 사용자** 단계에서 (선택사항) 테스트 이메일 추가
- [ ] **대시보드로 돌아가기** 클릭

### 1.3 OAuth 2.0 클라이언트 ID 생성
- [ ] 왼쪽 메뉴: **API 및 서비스** → **사용자 인증 정보**
- [ ] 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
- [ ] **애플리케이션 유형**: **웹 애플리케이션** 선택
- [ ] **이름**: `Touch The World Web Client` (또는 원하는 이름)
- [ ] **승인된 리디렉션 URI** 추가:
  ```
  개발 환경:
  http://localhost:3000/api/auth/callback/google
  
  프로덕션 환경:
  https://touchtheworld.co.kr/api/auth/callback/google
  ```
  ⚠️ **주의**: 실제 도메인으로 변경하세요!
- [ ] **만들기** 클릭
- [ ] **클라이언트 ID** 복사 (나중에 사용)
- [ ] **클라이언트 보안 비밀번호** 복사 (나중에 사용)
- [ ] 팝업 창 닫기

---

## 2단계: 환경 변수 설정

### 2.1 NEXTAUTH_SECRET 생성
터미널에서 실행:
```bash
openssl rand -base64 32
```
- [ ] 생성된 시크릿 복사 (나중에 사용)

### 2.2 로컬 개발 환경 (.env 파일)
프로젝트 루트의 `.env` 파일에 추가:

```env
# 구글 OAuth
GOOGLE_CLIENT_ID="1단계에서-복사한-클라이언트-ID"
GOOGLE_CLIENT_SECRET="1단계에서-복사한-클라이언트-보안-비밀번호"

# NextAuth 설정
NEXTAUTH_SECRET="2.1에서-생성한-시크릿"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] `.env` 파일에 위 내용 추가
- [ ] 값들이 올바르게 입력되었는지 확인

### 2.3 Vercel 프로덕션 환경
- [ ] [Vercel Dashboard](https://vercel.com/dashboard) 접속
- [ ] 프로젝트 선택 → **Settings** → **Environment Variables**
- [ ] 다음 환경 변수 추가:
  - [ ] `GOOGLE_CLIENT_ID`: 1단계에서 복사한 클라이언트 ID
  - [ ] `GOOGLE_CLIENT_SECRET`: 1단계에서 복사한 클라이언트 보안 비밀번호
  - [ ] `NEXTAUTH_SECRET`: 2.1에서 생성한 시크릿
  - [ ] `NEXTAUTH_URL`: `https://touchtheworld.co.kr` (실제 도메인)
- [ ] 각 환경 변수 저장 확인
- [ ] **참고**: 환경 변수 추가 후 Vercel이 자동으로 재배포합니다

---

## 3단계: 프로덕션 도메인 추가 (배포 후)

⚠️ **중요**: Vercel 배포가 완료된 후 진행하세요.

- [ ] Google Cloud Console → **사용자 인증 정보** 접속
- [ ] 생성한 OAuth 클라이언트 ID 클릭
- [ ] **승인된 리디렉션 URI** 섹션에서 **URI 추가** 클릭
- [ ] 프로덕션 URL 입력:
  ```
  https://touchtheworld.co.kr/api/auth/callback/google
  ```
  (실제 도메인으로 변경)
- [ ] **저장** 클릭
- [ ] URI가 추가되었는지 확인

---

## 4단계: 테스트

### 4.1 로컬 테스트
- [ ] 개발 서버 실행:
  ```bash
  npm run dev
  ```
- [ ] 브라우저에서 `http://localhost:3000/login` 접속
- [ ] **구글** 버튼 클릭
- [ ] 구글 계정 선택 및 로그인
- [ ] 자동으로 회원가입/로그인 완료 확인
- [ ] 홈페이지로 리디렉션되는지 확인
- [ ] 사용자 메뉴에서 로그인 상태 확인

### 4.2 프로덕션 테스트
- [ ] Vercel 배포 완료 확인
- [ ] 프로덕션 URL에서 로그인 페이지 접속
- [ ] **구글** 버튼 클릭
- [ ] 구글 계정 선택 및 로그인
- [ ] 자동으로 회원가입/로그인 완료 확인
- [ ] 홈페이지로 리디렉션되는지 확인

---

## 🔍 문제 해결

### 문제: "redirect_uri_mismatch" 오류
**증상**: 구글 로그인 시 "redirect_uri_mismatch" 오류 발생

**해결 방법:**
1. Google Cloud Console → 사용자 인증 정보 확인
2. 리디렉션 URI가 정확히 일치하는지 확인:
   - 개발: `http://localhost:3000/api/auth/callback/google` (슬래시 없음)
   - 프로덕션: `https://your-domain.com/api/auth/callback/google` (슬래시 없음)
3. URI 끝에 슬래시(`/`)가 없는지 확인
4. HTTP/HTTPS가 올바른지 확인
5. 도메인이 정확한지 확인

### 문제: "invalid_client" 오류
**증상**: 구글 로그인 시 "invalid_client" 오류 발생

**해결 방법:**
1. 환경 변수 확인:
   ```bash
   # 로컬에서 확인
   cat .env | grep GOOGLE
   ```
2. Google Cloud Console에서 클라이언트 ID/Secret 재확인
3. Vercel 환경 변수 재설정
4. 클라이언트 ID/Secret에 공백이나 따옴표가 없는지 확인

### 문제: 로그인은 되지만 쿠키가 설정되지 않음
**증상**: 구글 로그인은 성공하지만 로그인 상태가 유지되지 않음

**해결 방법:**
1. 브라우저 개발자 도구 → Network 탭 열기
2. `/api/auth/callback/google` 요청 확인
3. 응답 상태 코드 확인 (200이어야 함)
4. 서버 로그 확인 (Vercel Functions Logs)
5. `NEXTAUTH_SECRET`이 올바르게 설정되었는지 확인
6. `NEXTAUTH_URL`이 올바른지 확인

### 문제: "OAuth 동의 화면이 승인되지 않음" 오류
**증상**: 구글 로그인 시 동의 화면 승인 오류

**해결 방법:**
1. Google Cloud Console → OAuth 동의 화면 확인
2. **게시 상태** 확인 (테스트 모드면 테스트 사용자 추가 필요)
3. 프로덕션 배포 시: **게시** 버튼 클릭하여 앱 게시
4. 검토 상태 확인 (필요시 Google 검토 제출)

---

## 📝 참고사항

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
- ✅ 구글 OAuth는 HTTPS 필수 (프로덕션)
- ✅ `NEXTAUTH_SECRET`은 반드시 안전하게 보관
- ✅ 클라이언트 Secret은 절대 공개하지 않음
- ✅ 리디렉션 URI는 정확히 일치해야 함
- ✅ 환경 변수는 `.gitignore`에 포함되어 있어 Git에 커밋되지 않음

### 프로덕션 배포 전 체크리스트
- [ ] Google Cloud Console에서 프로덕션 도메인 추가
- [ ] Vercel 환경 변수 모두 설정
- [ ] `NEXTAUTH_URL`이 프로덕션 도메인으로 설정
- [ ] OAuth 동의 화면 게시 (필요시)

---

## ✅ 완료 확인

모든 단계를 완료했다면:
- [ ] 로컬에서 구글 로그인 테스트 성공
- [ ] 프로덕션에서 구글 로그인 테스트 성공
- [ ] 자동 회원가입이 정상 작동
- [ ] 자동 로그인이 정상 작동
- [ ] 사용자 정보가 올바르게 저장됨

---

## 📚 관련 문서

- [상세 설정 가이드](./GOOGLE_LOGIN_SETUP.md)
- [NextAuth 공식 문서](https://next-auth.js.org/providers/google)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)

---

**작성일**: 2026-01-24  
**상태**: 구현 완료, 설정 대기 중
