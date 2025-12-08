# Vercel 환경 변수 업데이트 가이드

## 🔧 DATABASE_URL 업데이트 (포트 6543으로 변경)

### 1. Vercel 대시보드 접속

1. [Vercel Dashboard](https://vercel.com/dashboard) 로그인
2. 프로젝트 선택

### 2. 환경 변수 수정

1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 선택
3. `DATABASE_URL` 찾기
4. **Edit** (또는 **...** 메뉴) 클릭

### 3. 연결 문자열 수정

**기존 (포트 5432):**
```
postgresql://...@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**수정 (포트 6543, Transaction Pooling):**
```
postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**중요 포인트:**
- 포트: `5432` → `6543`으로 변경
- `&pgbouncer=true` 파라미터 추가 (Transaction 모드)
- 나머지 부분(프로젝트 ID, 비밀번호 등)은 그대로 유지

### 4. 저장 및 재배포

1. **Save** 클릭
2. 자동으로 재배포가 시작됩니다
3. 또는 **Deployments** 탭에서 수동으로 **Redeploy** 클릭

### 5. 재배포 확인

1. **Deployments** 탭으로 이동
2. 최신 배포 상태 확인
3. 배포 완료 후 사이트 접속 테스트

## ✅ 확인 방법

### 배포 로그 확인

1. **Deployments** > 최신 배포 클릭
2. **Build Logs** 확인
3. Prisma 연결 성공 메시지 확인

### 사이트 동작 확인

1. 배포된 사이트 접속
2. 데이터베이스 연결이 필요한 페이지 테스트
3. 관리자 페이지 접속 테스트

## 🔍 문제 발생 시

### 여전히 연결 오류가 발생하면

1. **환경 변수 형식 확인:**
   - 포트가 `6543`인지 확인
   - `pgbouncer=true` 파라미터가 있는지 확인
   - 따옴표가 올바르게 설정되었는지 확인

2. **Supabase 프로젝트 상태 확인:**
   - Supabase Dashboard에서 프로젝트가 Active 상태인지 확인
   - 일시 중지된 경우 Restore Project 클릭

3. **Vercel 로그 확인:**
   - Deployments > Functions 탭
   - 에러 메시지 확인

## 📝 체크리스트

- [ ] Vercel Dashboard 접속
- [ ] Settings > Environment Variables 이동
- [ ] DATABASE_URL 찾기
- [ ] 포트를 5432 → 6543으로 변경
- [ ] `&pgbouncer=true` 파라미터 추가
- [ ] Save 클릭
- [ ] 재배포 완료 대기
- [ ] 배포 로그에서 연결 성공 확인
- [ ] 사이트 동작 테스트

---

**팁**: 환경 변수 변경 후 자동으로 재배포되므로, 배포가 완료될 때까지 기다리면 됩니다!
