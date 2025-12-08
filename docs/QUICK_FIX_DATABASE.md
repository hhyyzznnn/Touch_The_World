# 데이터베이스 연결 오류 빠른 해결 가이드

## 🚨 현재 오류

```
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:5432`
```

이 오류는 **포트 5432**로 연결을 시도하고 있다는 의미입니다.

## ⚡ 빠른 해결 (3단계)

### 1단계: Vercel 환경 변수 확인 및 수정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. `DATABASE_URL` 찾기
5. **중요**: 환경 변수가 어떤 환경에 설정되어 있는지 확인
   - **Production** (프로덕션 배포용)
   - **Preview** (프리뷰 배포용)
   - **Development** (로컬 개발용)
6. **Edit** 클릭
7. 값 확인: **포트가 `:5432`인지 `:6543`인지 확인**
8. **모든 환경에 설정되어 있는지 확인** (Production, Preview 체크)

**만약 `:5432`라면:**
- `:5432` → `:6543`으로 변경
- `&pgbouncer=true` 파라미터 추가 (없는 경우)
- **중요**: Vercel에서는 따옴표(`"`) 없이 값만 입력

**올바른 형식:**
```
postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

### 2단계: 저장 및 재배포

1. **Save** 클릭
2. **Deployments** 탭으로 이동
3. 최신 배포가 **Building** 또는 **Ready** 상태인지 확인
4. 만약 재배포가 시작되지 않았다면:
   - 최신 배포 클릭
   - **Redeploy** 버튼 클릭

### 3단계: 배포 완료 대기 및 확인

1. 배포가 완료될 때까지 대기 (보통 2-5분)
2. 배포 완료 후 사이트 접속 테스트
3. 에러가 계속 발생하면:
   - **Deployments** > 최신 배포 > **Functions** 탭
   - 에러 로그 확인

## 🔍 환경 변수 값 확인 방법

### Vercel에서 직접 확인

1. Settings > Environment Variables
2. `DATABASE_URL` 옆의 **...** 메뉴 클릭
3. **View Value** 클릭 (또는 Edit로 들어가서 확인)
4. 포트 번호 확인:
   - ✅ `:6543` → 올바름
   - ❌ `:5432` → 수정 필요

### 텍스트로 확인

환경 변수 값을 복사해서 텍스트 에디터에 붙여넣으면:
- `pooler.supabase.com:5432` → 잘못됨
- `pooler.supabase.com:6543` → 올바름

## ⚠️ 주의사항

### Vercel 환경 변수 입력 시

**❌ 잘못된 방법:**
```
"postgresql://...@pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```
(따옴표 포함)

**✅ 올바른 방법:**
```
postgresql://...@pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```
(따옴표 없이 값만)

### 재배포 확인

환경 변수를 수정해도:
- **즉시 반영되지 않음**
- **재배포가 필요함**
- 재배포는 보통 자동으로 시작되지만, 수동으로도 가능

## 📋 체크리스트

- [ ] Vercel Dashboard 접속
- [ ] Settings > Environment Variables
- [ ] DATABASE_URL 값 확인 (포트 번호 확인)
- [ ] 포트가 `:5432`라면 `:6543`으로 변경
- [ ] `&pgbouncer=true` 파라미터 확인
- [ ] 따옴표 없이 저장
- [ ] Save 클릭
- [ ] Deployments 탭에서 재배포 확인
- [ ] 배포 완료 대기 (2-5분)
- [ ] 사이트 접속 테스트

## 🆘 여전히 안 되면

### 1. 환경 변수 환경 확인 (중요!)

Vercel은 환경 변수를 3가지 환경으로 나눕니다:
- **Production**: 프로덕션 도메인 배포
- **Preview**: PR/브랜치별 프리뷰 배포
- **Development**: 로컬 개발 (vercel dev)

**확인 방법:**
1. Settings > Environment Variables
2. `DATABASE_URL` 옆에 체크박스 확인:
   - ✅ Production 체크되어 있는지
   - ✅ Preview 체크되어 있는지
3. **모두 체크되어 있어야 합니다!**

**수정 방법:**
1. `DATABASE_URL` Edit 클릭
2. **Production** 체크박스 확인
3. **Preview** 체크박스 확인
4. Save 클릭

### 2. Supabase 프로젝트 상태 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 `futafhvqfxktxnraqbhd` 선택
3. 프로젝트 상태 확인:
   - ✅ **Active**: 정상
   - ⏸️ **Paused**: 일시 중지됨 → **Restore Project** 클릭
   - ❌ **Deleted**: 삭제됨

### 3. Supabase에서 최신 연결 정보 가져오기

1. Supabase Dashboard > Settings > Database
2. **Connection Pooling** 섹션
3. **Transaction** 모드 URL 복사
4. Vercel 환경 변수에 붙여넣기 (모든 환경에)

### 4. Vercel 로그 확인

1. Deployments > 최신 배포 클릭
2. **Functions** 탭
3. 에러 메시지 자세히 확인
4. **Build Logs**에서 Prisma 연결 시도 확인

### 5. 강제 재배포

환경 변수를 수정했는데도 재배포가 안 되면:
1. Deployments 탭
2. 최신 배포 클릭
3. **Redeploy** 버튼 클릭
4. 배포 완료 대기

---

**가장 흔한 원인**: 환경 변수에 포트 `:5432`가 남아있거나, 재배포가 완료되지 않은 경우입니다!
