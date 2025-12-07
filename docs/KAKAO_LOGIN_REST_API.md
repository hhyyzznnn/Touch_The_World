# 카카오 로그인 REST API 가이드

## 📋 개요

카카오 로그인은 OAuth 2.0 프로토콜을 기반으로 합니다. 두 가지 방법으로 구현할 수 있습니다:

1. **NextAuth 사용** (현재 구현 방식) - 간단하고 자동화됨
2. **직접 REST API 사용** - 더 세밀한 제어 가능

## 🔄 OAuth 2.0 플로우

```
1. 사용자 → 카카오 인증 페이지로 리디렉션
2. 카카오 → 인가 코드(code) 발급 → Redirect URI로 리디렉션
3. 서버 → 인가 코드로 액세스 토큰 발급 요청
4. 카카오 → 액세스 토큰 발급
5. 서버 → 액세스 토큰으로 사용자 정보 조회
6. 서버 → 사용자 정보로 로그인 처리
```

## 🚀 방법 1: NextAuth 사용 (현재 구현)

### 장점
- 자동으로 OAuth 플로우 처리
- 토큰 갱신 자동 처리
- 세션 관리 자동화
- 코드가 간단함

### 설정 방법

#### 1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **내 애플리케이션** > **애플리케이션 추가하기**
3. **플랫폼 설정** > **Web 플랫폼 등록**
   - 사이트 도메인: `http://localhost:3000` (개발)
   - 사이트 도메인: `https://yourdomain.com` (프로덕션)
4. **카카오 로그인** 활성화
5. **Redirect URI** 등록:
   - `http://localhost:3000/api/auth/callback/kakao` (개발)
   - `https://yourdomain.com/api/auth/callback/kakao` (프로덕션)
6. **카카오 로그인** > **동의항목** 설정:
   - 필수: 닉네임, 카카오계정(이메일)
   - 선택: 프로필 사진
7. **앱 키** 확인:
   - **REST API 키** (Client ID로 사용)
   - **카카오 로그인** > **Client Secret** 생성 및 복사

#### 2. 환경 변수 설정

`.env` 파일에 추가:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# 카카오
KAKAO_CLIENT_ID=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret
```

#### 3. NEXTAUTH_SECRET 생성

```bash
openssl rand -base64 32
```

또는 온라인 생성기: https://generate-secret.vercel.app/32

#### 4. 테스트

1. 개발 서버 재시작: `npm run dev`
2. `/login` 페이지 접속
3. 카카오 로그인 버튼 클릭
4. 카카오 계정으로 로그인
5. 리디렉션 확인

---

## 🔧 방법 2: 직접 REST API 사용

### 장점
- 더 세밀한 제어 가능
- 커스텀 로직 구현 가능
- NextAuth 의존성 없음

### 구현 단계

#### 1. 카카오 개발자 콘솔 설정

방법 1과 동일하지만, Redirect URI는 직접 만든 엔드포인트로 설정:

```
http://localhost:3000/api/auth/kakao/callback
```

#### 2. 인증 요청 (Authorization Code 요청)

**클라이언트 사이드** (`components/SocialLoginButtons.tsx`):

```typescript
const handleKakaoLogin = () => {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const REDIRECT_URI = `${window.location.origin}/api/auth/kakao/callback`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  
  window.location.href = KAKAO_AUTH_URL;
};
```

#### 3. 콜백 처리 (인가 코드 수신 및 액세스 토큰 발급)

**서버 사이드** (`app/api/auth/kakao/callback/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=no_code", request.url)
      );
    }

    // 1. 인가 코드로 액세스 토큰 발급
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/kakao/callback`,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL("/login?error=token_failed", request.url)
      );
    }

    // 2. 액세스 토큰으로 사용자 정보 조회
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.id) {
      return NextResponse.redirect(
        new URL("/login?error=user_fetch_failed", request.url)
      );
    }

    // 3. 사용자 정보 파싱
    const kakaoId = userData.id.toString();
    const email = userData.kakao_account?.email;
    const nickname = userData.kakao_account?.profile?.nickname;
    const profileImage = userData.kakao_account?.profile?.profile_image_url;

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.url)
      );
    }

    // 4. DB에서 사용자 확인 또는 생성
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: nickname || "사용자",
          image: profileImage || null,
          emailVerified: true,
          phoneVerified: false,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          image: profileImage || user.image,
        },
      });
    }

    // 5. Account 연결 (소셜 계정 정보 저장)
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "kakao",
          providerAccountId: kakaoId,
        },
      },
      update: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in
          ? Math.floor(Date.now() / 1000) + tokenData.expires_in
          : null,
        token_type: tokenData.token_type,
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "kakao",
        providerAccountId: kakaoId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in
          ? Math.floor(Date.now() / 1000) + tokenData.expires_in
          : null,
        token_type: tokenData.token_type,
      },
    });

    // 6. 세션 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Kakao login error:", error);
    return NextResponse.redirect(
      new URL("/login?error=callback_failed", request.url)
    );
  }
}
```

#### 4. 환경 변수 설정

`.env` 파일:

```env
# 카카오 (직접 REST API 사용)
KAKAO_CLIENT_ID=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000

# 클라이언트에서 사용 (선택사항)
NEXT_PUBLIC_KAKAO_CLIENT_ID=your-rest-api-key
```

---

## 📚 카카오 REST API 엔드포인트

### 1. 인증 요청
```
GET https://kauth.kakao.com/oauth/authorize
```

**파라미터:**
- `client_id`: REST API 키
- `redirect_uri`: Redirect URI
- `response_type`: `code`
- `scope`: `profile_nickname,account_email` (선택사항)

### 2. 액세스 토큰 발급
```
POST https://kauth.kakao.com/oauth/token
```

**파라미터:**
- `grant_type`: `authorization_code`
- `client_id`: REST API 키
- `client_secret`: Client Secret
- `redirect_uri`: Redirect URI
- `code`: 인가 코드

**응답:**
```json
{
  "access_token": "액세스 토큰",
  "token_type": "bearer",
  "refresh_token": "리프레시 토큰",
  "expires_in": 21599,
  "scope": "profile_nickname account_email",
  "refresh_token_expires_in": 5183999
}
```

### 3. 사용자 정보 조회
```
GET https://kapi.kakao.com/v2/user/me
```

**헤더:**
```
Authorization: Bearer {access_token}
```

**응답:**
```json
{
  "id": 123456789,
  "kakao_account": {
    "email": "user@example.com",
    "profile": {
      "nickname": "사용자",
      "profile_image_url": "https://...",
      "thumbnail_image_url": "https://..."
    }
  }
}
```

### 4. 토큰 갱신 (선택사항)
```
POST https://kauth.kakao.com/oauth/token
```

**파라미터:**
- `grant_type`: `refresh_token`
- `client_id`: REST API 키
- `client_secret`: Client Secret
- `refresh_token`: 리프레시 토큰

---

## 🔍 현재 프로젝트 상태

현재 프로젝트는 **NextAuth를 사용**하고 있습니다:

- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth 설정
- ✅ `components/SocialLoginButtons.tsx` - 소셜 로그인 버튼
- ✅ `app/api/auth/callback/route.ts` - 콜백 처리

**NextAuth를 계속 사용하는 것을 추천합니다:**
- 이미 구현되어 있음
- 자동으로 토큰 갱신 처리
- 세션 관리 자동화
- 코드가 간단하고 유지보수 용이

---

## ✅ 다음 단계

1. **카카오 개발자 콘솔에서 OAuth 앱 생성**
2. **환경 변수 설정** (`.env` 파일)
3. **테스트** (`/login` 페이지에서 카카오 로그인 버튼 클릭)

---

## 🔗 참고 링크

- [카카오 개발자 문서](https://developers.kakao.com/docs)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [카카오 로그인 동의항목](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite)
- [NextAuth 카카오 Provider](https://next-auth.js.org/providers/kakao)

