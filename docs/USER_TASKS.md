# 사용자가 해야 할 작업

## 1. DB 마이그레이션 (알림 읽음 처리)

알림 읽음 상태를 저장하려면 `AdminReadNotification` 테이블이 필요합니다.

**Supabase SQL Editor**에서 아래 파일 내용 실행:

```
migrations/add_admin_read_notification.sql
```

또는 직접 실행:

```sql
CREATE TABLE IF NOT EXISTS "AdminReadNotification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "adminUserId" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminReadNotification_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminReadNotification_adminUserId_notificationId_key" ON "AdminReadNotification"("adminUserId", "notificationId");
CREATE INDEX IF NOT EXISTS "AdminReadNotification_adminUserId_idx" ON "AdminReadNotification"("adminUserId");
CREATE INDEX IF NOT EXISTS "AdminReadNotification_notificationId_idx" ON "AdminReadNotification"("notificationId");
```

---

## 2. 카카오톡 공유 설정

카카오톡 채팅방으로 공유하려면 **카카오 디벨로퍼스** 설정이 필요합니다.

1. [카카오 디벨로퍼스](https://developers.kakao.com) 접속
2. 앱 생성 또는 기존 앱 선택
3. **앱 키** > **JavaScript 키** 복사
4. **플랫폼** > **Web** > **사이트 도메인**에 `localhost:3000`, `touchtheworld.co.kr` 등 추가
5. **제품** > **카카오톡 공유** 활성화
6. `.env`에 추가:

```
NEXT_PUBLIC_KAKAO_JS_KEY="발급받은_JavaScript_키"
```

`NEXT_PUBLIC_KAKAO_JS_KEY`가 없으면 카카오톡 버튼 클릭 시 링크 복사로 대체됩니다.

---

## 3. 기타 선택 사항

- **카카오톡 채널**: `lib/constants.ts`의 `kakaoChannel`에 채널 ID 입력 시 Footer "카카오톡 문의" 버튼 연결
- **카카오/네이버 로그인**: NextAuth Provider 설정 후 SocialLoginButtons 활성화
