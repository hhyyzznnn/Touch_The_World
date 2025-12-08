# 도메인 연결 가이드 (가비아 → Vercel)

가비아에서 호스팅 중인 도메인을 Vercel에 연결하는 방법입니다.

## 📋 사전 준비

- 가비아 도메인 관리자 접속 권한
- Vercel 프로젝트 배포 완료 상태

## 🔗 Vercel에서 도메인 추가

### 1. Vercel 대시보드에서 도메인 추가

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 연결하려는 프로젝트 선택
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Domains** 선택
5. **Add Domain** 버튼 클릭
6. 연결하려는 도메인 입력 (예: `touchtheworld.co.kr` 또는 `www.touchtheworld.co.kr`)
7. **Add** 클릭

### 2. DNS 설정 정보 확인

도메인을 추가하면 Vercel이 다음 정보를 제공합니다:

- **A 레코드**: `76.76.21.21` (또는 유사한 IP)
- **CNAME 레코드**: `cname.vercel-dns.com.` (또는 유사한 값)

**중요**: Vercel이 제공하는 정확한 값을 확인하세요. 프로젝트마다 다를 수 있습니다.

## ⚙️ 가비아 DNS 설정

### 1. 가비아 도메인 관리 페이지 접속

1. [가비아](https://www.gabia.com) 로그인
2. **도메인** > **도메인 관리** 메뉴로 이동
3. 연결하려는 도메인 선택
4. **DNS 관리** 또는 **네임서버 관리** 클릭

### 2. DNS 레코드 추가/수정

가비아 DNS 관리에서 다음 레코드를 설정합니다:

#### 방법 1: 루트 도메인 연결 (예: touchtheworld.co.kr)

**A 레코드 추가:**
```
타입: A
호스트: @ (또는 비워두기)
값/데이터: 76.76.21.21 (Vercel이 제공한 IP)
TTL: 3600 (또는 기본값)
```

**www 서브도메인 연결 (선택사항):**
```
타입: CNAME
호스트: www
값/데이터: cname.vercel-dns.com. (Vercel이 제공한 값)
TTL: 3600 (또는 기본값)
```

#### 방법 2: 서브도메인만 연결 (예: www.touchtheworld.co.kr)

**CNAME 레코드 추가:**
```
타입: CNAME
호스트: www (또는 원하는 서브도메인)
값/데이터: cname.vercel-dns.com. (Vercel이 제공한 값)
TTL: 3600 (또는 기본값)
```

### 3. 기존 레코드 확인 및 수정

⚠️ **주의사항:**
- 기존에 다른 A 레코드나 CNAME 레코드가 있다면 수정하거나 삭제해야 합니다
- 특히 다른 호스팅 서비스(예: 가비아 호스팅)를 사용 중이었다면 기존 레코드를 확인하세요
- 이메일 서버(MX 레코드) 등 다른 서비스는 그대로 유지하세요

## ⏱️ DNS 전파 대기

DNS 설정 변경 후 전파되는데 시간이 걸립니다:

- **일반적으로**: 1-24시간
- **최대**: 48시간까지 걸릴 수 있음
- **확인 방법**: 
  - [whatsmydns.net](https://www.whatsmydns.net)에서 전파 상태 확인
  - 또는 터미널에서: `nslookup yourdomain.com`

## ✅ 연결 확인

### 1. Vercel에서 확인

1. Vercel 대시보드 > 프로젝트 > **Domains**로 이동
2. 도메인 상태 확인:
   - ✅ **Valid Configuration**: 연결 완료
   - ⏳ **Pending**: DNS 전파 대기 중
   - ❌ **Invalid Configuration**: DNS 설정 오류

### 2. 브라우저에서 확인

DNS 전파가 완료되면:
- 도메인으로 접속 시 Vercel 사이트가 표시됩니다
- SSL 인증서는 Vercel이 자동으로 발급합니다 (Let's Encrypt)

## 🔒 SSL 인증서

Vercel은 자동으로 SSL 인증서를 발급합니다:
- **발급 시간**: DNS 전파 완료 후 몇 분 ~ 몇 시간
- **인증서 종류**: Let's Encrypt (무료)
- **자동 갱신**: Vercel이 자동으로 관리

## 🔄 루트 도메인과 www 도메인 모두 연결하기

두 도메인 모두 연결하려면:

1. **루트 도메인** (touchtheworld.co.kr):
   - A 레코드: `@` → `76.76.21.21`

2. **www 도메인** (www.touchtheworld.co.kr):
   - CNAME 레코드: `www` → `cname.vercel-dns.com.`

3. Vercel에서 두 도메인 모두 추가

4. Vercel이 자동으로 리다이렉트 설정 (선택 가능)

## 🛠️ 문제 해결

### DNS 전파가 안 될 때

1. **캐시 확인**: 브라우저 캐시 삭제 또는 시크릿 모드 사용
2. **DNS 캐시 플러시**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```
3. **다른 DNS 서버 사용**: Google DNS (8.8.8.8) 또는 Cloudflare DNS (1.1.1.1)로 변경

### Vercel에서 "Invalid Configuration" 오류

1. DNS 레코드가 정확한지 확인
2. TTL 값 확인 (너무 길면 변경 반영이 늦을 수 있음)
3. 가비아에서 레코드 저장 후 몇 분 기다린 후 다시 확인

### 기존 호스팅과 충돌

- 가비아 호스팅을 사용 중이었다면:
  - 호스팅 서비스 일시 중지 또는 해지
  - 또는 서브도메인으로 분리 (예: `www`는 Vercel, `mail`은 기존 호스팅)

## 📝 체크리스트

- [ ] Vercel에서 도메인 추가 완료
- [ ] 가비아 DNS 관리 페이지 접속
- [ ] A 레코드 또는 CNAME 레코드 추가/수정
- [ ] 기존 충돌하는 레코드 확인 및 수정
- [ ] DNS 전파 대기 (1-24시간)
- [ ] Vercel에서 도메인 상태 확인
- [ ] 브라우저에서 도메인 접속 테스트
- [ ] SSL 인증서 자동 발급 확인

## 🔗 참고 링크

- [Vercel 도메인 설정 가이드](https://vercel.com/docs/concepts/projects/domains)
- [가비아 도메인 관리](https://www.gabia.com)
- [DNS 전파 확인](https://www.whatsmydns.net)

---

**도메인 연결이 완료되면 `NEXTAUTH_URL` 환경 변수를 업데이트하는 것을 잊지 마세요!**
