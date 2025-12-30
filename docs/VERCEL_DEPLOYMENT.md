# Vercel 배포 체크리스트

## ✅ 배포 전 확인 사항

### 1. 환경 변수 설정 (Vercel Dashboard)

Vercel 프로젝트 설정 → Environment Variables에서 다음 변수들을 설정하세요:

#### 필수 환경 변수
- `DATABASE_POOLING_URL`: Supabase Connection Pooler URL (포트 6543)
- `NARA_BID_SERVICE_KEY`: 나라장터 API 서비스 키
- `RESEND_API_KEY`: Resend 이메일 발송 API 키
- `RESEND_FROM_EMAIL`: 발신 이메일 주소 (예: no-reply@touchtheworld.co.kr)
- `BID_NOTICE_RECIPIENT_EMAIL`: 기본 수신자 이메일 주소

#### 선택적 환경 변수
- `CRON_SECRET_KEY`: 크론 작업 보안 키 (설정 시 Authorization 헤더 필요)

### 2. Cron 작업 설정

`vercel.json`에 다음 설정이 포함되어 있습니다:
```json
{
  "crons": [
    {
      "path": "/api/cron/g2b-notification",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- **실행 시간**: 매일 오전 9시 (한국 시간 기준)
- **경로**: `/api/cron/g2b-notification`

### 3. 작동 방식

1. **매일 오전 9시 자동 실행**
   - 전날 오전 9시 이후 ~ 당일 오전 9시 이전에 등록된 공고 조회
   - 예: 12월 31일 오전 9시 실행 → 12월 30일 9시 이후 ~ 12월 31일 9시 이전 공고

2. **공고 조회**
   - 교육여행, 수학여행, 체험학습, 현장체험 키워드로 검색
   - 중복 제거 (이미 DB에 저장된 공고는 제외)

3. **이메일 발송**
   - 새 공고가 있으면 하나의 메일로 묶어서 발송
   - 제목: `[나라장터 알림] YYYY년 MM월 DD일 교육여행 입찰 공고 N건`

### 4. 배포 후 확인

배포 후 다음을 확인하세요:

1. **Vercel Dashboard → Cron Jobs**
   - 크론 작업이 등록되어 있는지 확인
   - 다음 실행 시간 확인

2. **수동 테스트**
   ```
   GET https://your-project.vercel.app/api/cron/g2b-notification
   Authorization: Bearer {CRON_SECRET_KEY}
   ```
   - 성공 시: `{ "success": true, "processed": N, "sent": N }`
   - 실패 시: 에러 메시지 확인

3. **로그 확인**
   - Vercel Dashboard → Functions → Logs
   - 실행 로그 및 에러 확인

### 5. 주의사항

- **첫 실행**: 배포 후 다음 날 오전 9시에 첫 실행됩니다
- **시간대**: Vercel Cron은 UTC 기준이므로 한국 시간 9시 = UTC 0시
- **에러 처리**: 에러 발생 시 로그에 기록되며, 다음 실행은 정상 진행됩니다
- **트래픽 제한**: 나라장터 API 일일 트래픽 제한(1000건) 확인 필요

### 6. 문제 해결

**크론이 실행되지 않는 경우:**
1. Vercel Pro 플랜 이상인지 확인 (Cron Jobs는 Pro 플랜 필요)
2. `vercel.json` 파일이 루트에 있는지 확인
3. 환경 변수가 모두 설정되어 있는지 확인

**이메일이 발송되지 않는 경우:**
1. `RESEND_API_KEY` 확인
2. `BID_NOTICE_RECIPIENT_EMAIL` 확인
3. Resend 대시보드에서 발송 이력 확인

**공고가 조회되지 않는 경우:**
1. `NARA_BID_SERVICE_KEY` 확인
2. 나라장터 API 일일 트래픽 제한 확인
3. Vercel 로그에서 API 응답 확인

