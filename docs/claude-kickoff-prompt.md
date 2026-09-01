# Claude Code 새 세션 시작용 프롬프트

새 채팅에서 카드뉴스 업로드나 보고서 작성 등을 이어서 시킬 때, 아래 내용을 그대로 복사해서 첫 메시지로 붙여넣으세요.
(작업 성격에 따라 맨 아래 "지금 시킬 일" 한 줄만 바꿔서 매번 재사용하면 됩니다.)

---

```
Touch The World(교육여행 전문 여행사) 홈페이지·카카오채널·유튜브 운영을 맡고 있어.
아래 3개 저장소와 관례를 숙지하고 시작해줘.

## 저장소
- ~/GitHub/Touch_The_World — 메인 Next.js 홈페이지 (Prisma+Supabase). DB는 SQL 대신
  네가 Prisma로 직접 읽기·쓰기해도 됨 (대량 삭제 등 되돌리기 어려운 작업만 사전 고지).
- ~/GitHub/kakao-channel-poster — 카카오톡 채널 "소식" 자동 등록 (Playwright 브라우저 자동화).
- ~/GitHub/cardnews-shorts — 카드뉴스 이미지를 유튜브 쇼츠 영상으로 자동 생성·업로드
  (GPT-4o 분석 → gpt-image-2 캐릭터 합성 → TTS+ffmpeg 영상 → YouTube Data API 업로드).

## 가장 자주 시키는 일: "카드뉴스 O개 폴더에 넣어뒀어. 통합 업로드"
1. Touch_The_World/public/company-news/ 안의 새 폴더(들) 확인. 이미지 전부 읽고 내용 파악
   (카톡 내보내기 파일명 순서가 실제 슬라이드 순서와 다를 때가 있음 — 내용으로 순서 재확인).
2. title/summary/content/hashtags/category 작성:
   - title: 검색 키워드(연도·지역·프로그램 종류)를 항상 맨 앞에, 후킹 문구는 " — " 뒤로
     (title이 페이지 <title>·OG·구조화 데이터에 그대로 쓰여 SEO 직결. 단 BOOK_CARD_NEWS는
     "책 제목 — 저자 저" 형식 유지)
   - hashtags: lib/news-constants.ts의 HASHTAG_POOL(지역+대상)에서만 골라 지역 1개+대상 1~2개,
     총 2~3개 (자유 생성 금지 — 표현이 매번 달라지면 검색·필터가 무의미해짐)
   - category: lib/news-constants.ts PROGRAM_CATEGORIES 8개 중 정확히 하나
3. scripts/upload-card-news.ts의 NEWS_ITEMS 배열에 추가 →
   `npx tsx scripts/upload-card-news.ts` 실행 (DB 직접 반영 + cardnews-shorts/input/에
   자동 사본 저장까지 스크립트가 처리) → NEWS_ITEMS를 빈 템플릿으로 다시 되돌리기
   (git diff 없어야 정상).
4. kakao-channel-poster에서 각 항목마다
   `npx tsx scripts/post-news.ts --id <id> --auto` 실행해서 즉시 등록.
   세션 만료 시(로그인 화면으로 리다이렉트) `npx tsx scripts/login.ts`로 재로그인 필요 —
   Enter 입력 없이 로그인 완료를 자동 감지하는 스크립트를 짜서 대신 띄워주면 됨.
5. cardnews-shorts에서 순서대로 실행 (전부 백그라운드로 돌리고 완료 기다리기):
   `python3 phase1_generate.py` → `phase2_video.py` → `phase3_upload.py`
   YouTube OAuth 토큰은 "테스트" 앱이라 7일마다 만료됨 — 만료 시
   `InstalledAppFlow.run_local_server()`로 재인증 브라우저를 띄워주면 됨(Enter 불필요,
   브라우저 콜백으로 자동 완료).

## 그 외 자주 시키는 일
- "업무보고서 작성해줘 (0000_업무보고서)" → Touch_The_World/reports/의 기존 HTML 형식
  (A4 페이지, summary-box, data-table, 완료/예정 색상 구분) 그대로 따라 작성. 실제로 끝난 일만
  "완료"로, 계획 단계인 건 "예정/진행 중"으로 정직하게 구분.
- "카드뉴스/유튜브 제목·형식 중 별로인 거 찾아서 최적화해줘" → 먼저 최신 베스트프랙티스를
  WebSearch로 확인하고, 규칙을 정해서 문서화(스크립트 주석 등)한 뒤 기존 데이터에도 소급 적용.
- 자동화 툴에 반복 실행 중 걸리는 버그(재시도 로직 없음, 1건짜리 배치 예외처리 없음 등)를
  발견하면 그때그때 고치고 간단히 커밋. 두 자동화 저장소 모두 git 관리 중이니 의미 있는
  단위로 커밋해두기.

## 지금 시킬 일
(여기에 오늘 요청할 내용을 적어주세요)
```

---

필요하면 이 파일 자체를 열어서 복사해 쓰셔도 되고, 대표님이 말씀하시는 내용에 맞게 마지막 "지금 시킬 일" 줄만 바꿔서 매번 붙여넣으시면 됩니다.
