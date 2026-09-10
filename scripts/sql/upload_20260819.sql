-- 카드뉴스 CDN 업로드 결과 (20260819) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 일본교육여행 — 역사·문화·미래산업을 만나는 특별한 배움
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_japan_2026_edu_trip_overview',
  'PROGRAM_CARD_NEWS',
  '국외 교육여행',
  $pgtag$2026 일본교육여행 — 역사·문화·미래산업을 만나는 특별한 배움$pgtag$,
  $pgtag$가까운 거리, 깊은 문화, 넓은 미래. 초·중·고 수학여행·현장체험학습을 학년·인원·예산·교육 목표에 맞춰 2박3일부터 1주일 이상까지 맞춤 설계합니다.$pgtag$,
  $pgtag$## 2026 일본교육여행 — 역사·문화·미래산업을 만나는 특별한 배움

> 가까운 거리, 깊은 문화, 넓은 미래. 교실 밖에서 시작되는 글로벌 배움을 경험합니다.

초·중·고등학교 수학여행 · 현장체험학습. 학년, 인원, 예산, 교육 목표에 맞춘 최적의 코스를 제안합니다. (추천 기간: 2박 3일 · 3박 4일 · 4박 5일 · 1주일 이상)

---

### 미래를 만나다
도쿄 과학관 · 나고야 자동차 산업 · 규슈 환경 탐구. 로봇·우주·제조·SDGs로 진로 탐색의 시야를 넓힙니다.

### 역사에서 배우다
교토·나라 세계유산, 히로시마·나가사키 평화 학습. 과거를 걷고 오늘의 시선으로 새롭게 해석합니다.

### 일본 문화를 직접 체험하다
기모노 · 다도 · 서도 · 전통 공예. 손끝에서 기억되는 일본의 미학을 체험합니다.

### 일본 친구와 함께하다
현지 학교 방문 · 공동 수업 · B&S 시티 투어. 언어를 넘어 서로의 일상을 만나고 우정을 쌓습니다.

### 지역마다 다른 배움
- **도쿄·요코하마** — 미래 기술과 현대 문화
- **오사카·교토·나라** — 역사와 전통 문화
- **후쿠오카·나가사키** — 평화와 환경 실천
- **나고야** — 제조 혁신과 진로 탐색

### 안전하게, 꼼꼼하게
출발 전 안전교육부터 현지 전담 가이드, 비상 대응 체계까지. 학생의 안전이 모든 여정의 최우선 기준입니다.

---

우리 학교만의 일본교육여행을 설계하세요.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUm8BvCqWVlRfzJYOHE5SByLtIgToQP6FxsZhk',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUm8BvCqWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUoT5gbhJaQEnRI6cKGiuSJO0MCP9lHe3s7LF2', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU0E8fIIyf6Wg1mIOscD4u2Tnw03qrpXB7FERQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUWl6eKyFSlgJbqTfzrA6YP9vu8Gp1y74EtnIQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUjpgQDgcBK8DaS6t3R29uH7U0qEZhrgAdocLY', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUtLieYa05Zk4bn7TUKSRE2LPNHv1s0qVD9gyx', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUfKxD2dYXJWu1oVDTHqP8vrcxMZCkl2Kis0fz', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFN9SjTwgfawsy2XEATGp9mPCWbIe37dhq0n5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgerxPCVXJUlt9KLoPkdygb370m1TYGDOHecs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUkBM5ia7bST6wKN7BFrCA8PlOnQYXtGdVWhvs'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-08-19T06:26:45.290Z', '2026-08-19T06:26:45.290Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-19T06:26:45.290Z';

-- 국내비용으로 떠나는 일본 후쿠오카 수학여행 — 2026/27
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_fukuoka_domestic_budget_trip_2026',
  'PROGRAM_CARD_NEWS',
  '국외 교육여행',
  $pgtag$국내비용으로 떠나는 일본 후쿠오카 수학여행 — 2026/27$pgtag$,
  $pgtag$인천 출발 직항 약 1시간 10분, 국내 수학여행 수준인 90만원대 목표 예산으로 떠나는 초·중·고등학생 대상 2박 3일 후쿠오카 글로벌 문화·자연·역사 체험 프로그램입니다.$pgtag$,
  $pgtag$## 국내비용으로 떠나는 일본 후쿠오카 수학여행 — 2026/27

> 초·중·고등학생을 위한 2박 3일 글로벌 문화·자연·역사 체험. 국내 수학여행 수준의 예산으로 해외 현장교육의 경험을 확장합니다.

인천 출발 직항 기준 약 1시간 10분 — 제주도 수준의 이동 시간으로 학생들이 더 쉽게, 더 편안하게 글로벌 감각을 키울 수 있습니다.

---

### 지구가 들려주는 이야기
가마도 지옥, 유노하나 재배지, 아소 대관봉에서 온천·화산·칼데라의 생생한 지리 환경을 직접 관찰하고 체험합니다.

### 전통에서 오늘의 일본을 만나다
다자이후 텐만구의 학문적 상징성과 유후인 전통 거리, 일본식 정원, 오호리 공원에서 일본의 생활문화와 미학을 경험합니다.

### 즐거움도 배움이 됩니다
정갈한 현지 일정식, 무한리필 야키니쿠 뷔페, 자율성을 기르는 라라포트 자유식으로 식사 시간도 훌륭한 문화 체험이 됩니다. 전담 인솔교사와 한국어 가이드 동행, 3~4인실 단체 숙박 관리, 철저한 사전 안전 교육 및 현지 위기 대응 체계를 가동합니다.

### 교실 밖에서 이어지는 네 가지 교과
- **역사** — 다자이후 텐만구와 한일 교류의 맥락 이해
- **과학·지리** — 아소 화산과 벳부 온천 지열의 원리 관찰
- **문화·예술** — 유후인 전통 거리와 일본식 정원 체험
- **사회·경제** — 복합상업공간의 관광 및 서비스 구조 탐구

### 추천 동선
- **1안. 자연에서 도시로** — Day1 벳부 가마도 지옥 → 유후인 전통 거리 / Day2 아소 대관봉 → 다자이후 → 모모치 해변 / Day3 오호리 공원 → 라라포트 자유 체험
- **2안. 역사에서 자연으로** — Day1 다자이후 텐만구 → 아소 대관봉 / Day2 유노하나 → 가마도 지옥 → 유후인 / Day3 모모치 해변 → 오호리 공원 → 라라포트

### 90만원대 목표 예산
국내 수학여행 수준의 예산 목표로 해외 현장교육의 경험을 확장합니다. 항공, 숙박, 식사, 전용차량, 입장료를 포함한 통합 운영으로 예산의 효율성을 극대화합니다. 출발일, 인원, 항공 좌석, 환율, 선택 체험에 따라 학교별 최적화된 최종 견적을 제공합니다.

---

우리 학교의 다음 수학여행, 후쿠오카로 설계합니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwFlQQMrHwFWdfylzRPVeq7KvU0rQ15C36OSA',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwFlQQMrHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURrrZbumuL4UEYHXyDAqQtaoOgSnmcFJlGTkj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUtLWD7Om5Zk4bn7TUKSRE2LPNHv1s0qVD9gyx', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUbrNaGMILX1ljVw2Ud0ROP9CZk7sQvI3WbyuH', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUUkabtRm60Pc7ZASpuNrlm6DkfMobB984w35e', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFUXZETwgfawsy2XEATGp9mPCWbIe37dhq0n5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUWrCpMDQFSlgJbqTfzrA6YP9vu8Gp1y74EtnI', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU8li7F1kvWPxgtROoySe7wrziGIMcaqHk6sLB', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUtzbCjr5Zk4bn7TUKSRE2LPNHv1s0qVD9gyxa', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUtzwwCD5Zk4bn7TUKSRE2LPNHv1s0qVD9gyxa'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-08-19T06:26:46.290Z', '2026-08-19T06:26:46.290Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-08-19T06:26:46.290Z';
