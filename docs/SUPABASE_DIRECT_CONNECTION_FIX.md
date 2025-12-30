# Supabase Direct Connection URL 확인 방법

## 🚨 현재 문제
- `pooler.supabase.com:5432`로 연결 시 인증 실패
- Prisma CLI가 작동하지 않음

## ✅ 해결 방법

### 1. Supabase Dashboard에서 Direct Connection URL 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (`futafhvqfxktxnraqbhd`)
3. **Settings** → **Database** 메뉴
4. **Connection String** 탭 선택
5. **URI** 형식 선택
6. **포트 5432**인 URL 복사

**참고:** 
- 일부 Supabase 프로젝트는 `pooler.supabase.com:5432`가 아닌 다른 형식일 수 있습니다
- 예: `db.[PROJECT_REF].supabase.co:5432` 또는 `[REGION].supabase.co:5432`

### 2. 또는 Session Pooling 모드 사용 (대안)

**포트 6543, pgbouncer=true 없음:**
```
postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**특징:**
- ✅ Prepared statements 지원 (Prisma CLI 호환)
- ✅ 세션 레벨 기능 지원
- ⚠️ Transaction Pooling보다 성능은 낮지만 CLI에는 충분

### 3. .env 파일 수정

**옵션 A: Direct Connection URL 사용 (Supabase Dashboard에서 복사)**
```env
# CLI용: Direct Connection
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[ACTUAL_DIRECT_URL]:5432/postgres?sslmode=require"

# 런타임용: Transaction Pooling
DATABASE_POOLING_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

**옵션 B: Session Pooling 사용 (간단한 해결책)**
```env
# CLI용: Session Pooling (포트 6543, pgbouncer=true 없음)
DATABASE_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

# 런타임용: Transaction Pooling
DATABASE_POOLING_URL="postgresql://postgres.futafhvqfxktxnraqbhd:tTw_2025%21Project_DB_pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### 4. 테스트

```bash
npx prisma db push
```

## 🔍 인증 실패 원인 확인

1. **비밀번호 확인**
   - Supabase Dashboard → Settings → Database → Database password
   - URL 인코딩 확인 (`!` → `%21`)

2. **프로젝트 레퍼런스 확인**
   - Settings → General → Reference ID
   - `futafhvqfxktxnraqbhd`가 맞는지 확인

3. **프로젝트 상태 확인**
   - 프로젝트가 일시 중지되지 않았는지 확인
   - Active 상태인지 확인

