-- 카드뉴스 CDN 업로드 결과 (20261024) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 인천 초등 AI 디지털 소통 역량 강화 프로젝트 1박 2일 — 직접 만들고, 스스로 도전하며, 함께 소통하는 배움
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_incheon_ai_digital_communication_2026',
  'PROGRAM_CARD_NEWS',
  ARRAY['국내 교육여행'],
  $pgtag$2026 인천 초등 AI 디지털 소통 역량 강화 프로젝트 1박 2일 — 직접 만들고, 스스로 도전하며, 함께 소통하는 배움$pgtag$,
  $pgtag$초등학교 4·5·6학년을 위한 인천 중심 1박 2일 교육여행입니다. 부천 로보파크 로봇 만들기, 전철 타기·푸드코트 주문 같은 스스로 도전하기, 인스파이어 리조트 르 스페이스, 월미바다열차·국립인천해양박물관·차이나타운 탐방까지 담았습니다.$pgtag$,
  $pgtag$## 2026 인천 초등 AI 디지털 소통 역량 강화 프로젝트 1박 2일 — 직접 만들고, 스스로 도전하며, 함께 소통하는 배움

> 체험이 자신감이 되고, 소통이 성장으로 이어지는 여행

초등학교 4·5·6학년을 대상으로 인천 지역을 중심으로 운영하는 1박 2일 프로그램입니다. 로봇을 직접 만들고, 전철과 식사를 스스로 해결해 보며, 친구와 함께 보고 느낀 것을 나누도록 구성했습니다.

### 이런 배움을 얻어요
- 로봇을 만들며 문제를 해결해요
- 전철을 타며 스스로 도전해요
- 식사를 선택하며 의사를 표현해요
- 친구와 함께 배우고 소통해요

### 1일차 — AI와 디지털 세상 속으로
- 학교 출발 → 애슐리 점심식사
- 로보파크 체험(부천) — 청소로봇 만들기, 관내 로봇 체험, 특강
- 전철 직접 타보기 체험 — 친구와 함께 이동하며 지키는 약속
- 인스파이어 리조트 체험 · 르 스페이스 관람 — 디지털 콘텐츠를 오감으로 경험
- 푸드코트에서 직접 저녁 먹어보기 — 먹고 싶은 메뉴를 고르고 주문해요
- 호텔 체크인

### 2일차 — 바다와 역사 속으로
- 호텔 뷔페 조식
- 월미바다열차 타보기 — 창밖으로 만나는 인천의 풍경
- 국립인천해양박물관 견학 (오딧세이전 포함)
- 차이나타운 점심식사
- 자유공원 · 짜장면박물관 등 인천 역사문화 탐방

### 아이들의 하루를 세심하게 준비합니다
- 전담 인솔 · 야간 경비 · 버스 내 간식
- 현수막 · 학생 명찰 · 귀가 기념품
- 현지 답사 서비스 지원 · 차량 지원 컨설팅

학교 일정과 인원에 맞춰 세부 프로그램을 조정해 드립니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUucIhSBgqzJ9N6fjU7l1CMe4g83KvWERPTZox',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUcO8T9diuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUV1ATOfZiH1cKdoxjhLn7rW92DE6FTRG8CMVs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUJejLx7UmrTNe2UKLRDFO8iV67tYwJxQCbAaZ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmChYMCWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUVIfrSHiZiH1cKdoxjhLn7rW92DE6FTRG8CMV', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURN1Lq9muL4UEYHXyDAqQtaoOgSnmcFJlGTkj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUZpp1S3kb1lfBSWUbzQmR7gGvJVsNTPeHuy40', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUvrkrrWKXrLtFohmSiyf7Clv4s0qQAWa6VPd5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhb1SnvaLkNMi0neZEwOQsfG7rDvx5BKbaFlg', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUTDj4ZAo7pdKtukLi5AHsGyVZ1oRvxQSclC46'],
  NULL,
  ARRAY['#인천', '#초등', '#학생'],
  false,
  '2026-10-24T13:05:25.888Z', '2026-10-24T13:05:25.888Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-24T13:05:25.888Z';

-- 국내비용으로 가는 일본 규슈 수학여행 — 학교 예산에 맞춰 고르는 4가지 일정
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_kyushu_domestic_budget_school_trip_2026',
  'PROGRAM_CARD_NEWS',
  ARRAY['국외 교육여행'],
  $pgtag$국내비용으로 가는 일본 규슈 수학여행 — 학교 예산에 맞춰 고르는 4가지 일정$pgtag$,
  $pgtag$항공 2박 3일부터 부관페리 왕복, 항공+페리 3박 4일, 항공 3박 4일까지 — 학교 예산과 일정에 맞춰 고르는 일본 규슈(후쿠오카·기타큐슈) 수학여행 4가지 구성입니다.$pgtag$,
  $pgtag$## 국내비용으로 가는 일본 규슈 수학여행 — 학교 예산에 맞춰 고르는 4가지 일정

> 가까운 일본에서, 더 넓은 세상을 만납니다

학교 예산과 일정에 맞춰 이동 수단과 기간을 고르는 일본 규슈 수학여행입니다. 일정부터 견적까지 학교에 맞춰 설계합니다.

### 4가지 일정
| 구성 | 숙박 | 주요 방문 |
|---|---|---|
| 01. 항공 왕복 2박 3일 — 짧고 알찬 후쿠오카 핵심형 | 현지 호텔 2박 | 도시문화 · 다자이후 · 진로탐색 |
| 02. 부관페리 왕복 2박 3일 — 바닷길로 만나는 항구도시 | 선내 2박 · 일본 현지 탐방 1일 | 시모노세키 · 모지코 · 고쿠라 |
| 03. 항공 + 부관페리 3박 4일 — 하늘과 바다를 잇는 균형형 | 현지 호텔 2박 + 선내 1박 | 후쿠오카 · 학교교류 · 기타큐슈 |
| 04. 항공 왕복 3박 4일 — 배움과 체험을 넓히는 심화형 | 현지 호텔 3박 | 진로체험 · 역사문화 · 자연탐구 |

### 함께 넣을 수 있는 프로그램
- 학교교류
- 대학·전문학교 탐방
- 역사문화
- 과학환경

### 안내
- "국내비용"은 기획 콘셉트이며, 동일 조건 견적 비교 후 적용합니다.
- 가격·운항·방문기관은 출발지역, 인원, 시기에 따라 협의 후 확정됩니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUNJXB9vSxomPErOpCi4wDSJcTzeyZUnfRY31q',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUNJXB9vSxomPErOpCi4wDSJcTzeyZUnfRY31q'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-10-24T13:05:26.888Z', '2026-10-24T13:05:26.888Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-24T13:05:26.888Z';

-- 국내비용으로 가는 일본 오사카 수학여행 — 학교 예산에 맞춰 고르는 6가지 일정
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_osaka_domestic_budget_school_trip_2026',
  'PROGRAM_CARD_NEWS',
  ARRAY['국외 교육여행'],
  $pgtag$국내비용으로 가는 일본 오사카 수학여행 — 학교 예산에 맞춰 고르는 6가지 일정$pgtag$,
  $pgtag$팬스타 크루즈 왕복부터 팬스타+항공, 항공 왕복까지 — 오사카·교토·나라를 학교 예산과 일정에 맞춰 고르는 일본 오사카 수학여행 6가지 구성입니다.$pgtag$,
  $pgtag$## 국내비용으로 가는 일본 오사카 수학여행 — 학교 예산에 맞춰 고르는 6가지 일정

> 오사카에서 배우고, 간사이에서 꿈을 키우다

팬스타 크루즈와 항공을 조합해 학교 예산과 일정에 맞춰 고르는 일본 오사카 수학여행입니다. 일정부터 견적까지 학교에 맞춰 설계합니다.

### 6가지 일정
| 구성 | 숙박 | 주요 방문 |
|---|---|---|
| 01. 팬스타 왕복 2박 3일 — 바닷길로 떠나는 압축 체험형 | 선내 2박 · 현지 당일 탐방 | 오사카 핵심 문화탐방 |
| 02. 팬스타 왕복 4박 5일 — 크루즈와 현지 체험을 여유롭게 | 선내 2박 + 현지 호텔 2박 | 오사카 · 교토 · 나라 선택 |
| 03. 팬스타 + 항공 2박 3일 — 하늘과 바다를 함께 경험 | 선내 1박 + 현지 호텔 1박 | 오사카 핵심탐방 · 진로탐색 |
| 04. 팬스타 + 항공 3박 4일 — 교류와 배움을 더한 균형형 | 선내 1박 + 현지 호텔 2박 | 오사카 · 교토 · 학교교류 |
| 05. 항공 왕복 2박 3일 — 짧고 알찬 오사카 핵심형 | 현지 호텔 2박 | 역사문화 · 도시탐방 · 진로교육 |
| 06. 항공 왕복 3박 4일 — 간사이에서 넓히는 배움 | 현지 호텔 3박 | 오사카 · 교토 · 나라 선택 |

### 함께 넣을 수 있는 프로그램
- 학교교류
- 대학·기업 탐방
- 역사문화
- 진로체험

### 안내
- "국내비용"은 기획 콘셉트이며, 동일 조건 견적 비교 후 적용합니다.
- 운항·항공편·방문기관·가격은 출발일과 인원에 따라 협의 후 확정됩니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURliYiwmuL4UEYHXyDAqQtaoOgSnmcFJlGTkj',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURliYiwmuL4UEYHXyDAqQtaoOgSnmcFJlGTkj'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-10-24T13:05:27.888Z', '2026-10-24T13:05:27.888Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-24T13:05:27.888Z';
