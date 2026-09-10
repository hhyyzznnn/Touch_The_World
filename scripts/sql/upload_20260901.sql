-- 카드뉴스 CDN 업로드 결과 (20260901) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 서울시내 명소 도슨트 1일 체험학습 — 서울을 이해하고 설명하는 하루
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_seoul_docent_field_learning_2026',
  'PROGRAM_CARD_NEWS',
  '체험학습',
  $pgtag$서울시내 명소 도슨트 1일 체험학습 — 서울을 이해하고 설명하는 하루$pgtag$,
  $pgtag$서울시내 주요 명소를 전문 도슨트와 함께 걷는 1일 체험학습입니다. 조선의 중심과 근대 서울부터 독립운동의 역사, 세계사와의 만남까지 코스별 테마로 구성되며, 인원별 특별가로 최대 45%까지 할인됩니다.$pgtag$,
  $pgtag$## 서울시내 명소 도슨트 1일 체험학습 — 서울을 이해하고 설명하는 하루

> 서울을 구경하는 하루가 아니라, 서울을 이해하고 설명하는 하루. 두 번의 도슨트, 두 개의 서울, 한 번의 특별한 배움 — 역사·문화·예술·도시를 현장에서 만납니다.

---

### 보고·듣고·찾고·말하는 서울 도슨트 체험
1. **보고** — 건축물·유물·거리를 직접 관찰
2. **듣고** — 전문 도슨트의 역사와 인물 이야기
3. **찾고** — 활동지와 팀 미션으로 단서 찾기
4. **말하고** — 학생 도슨트로 친구에게 설명하기

### 코스 A. 조선의 중심과 근대 서울
오전 경복궁 도슨트 → 오후 정동·덕수궁 도슨트. 궁궐의 질서에서 근대 서울의 변화까지 한 번에 걷습니다.

### 코스 B. 서울 역사와 독립운동
오전 서대문형무소역사관 → 오후 정동길. 독립운동의 기억과 근대 서울의 길을 따라 걷습니다.

### 코스 D. 한국사와 세계사의 만남
오전 국립중앙박물관 → 오후 세계문화관 그리스·로마관. "그리스가 로마에게, 로마가 그리스에게" — 한국사와 세계사를 나란히 살펴봅니다.

### 코스 E. 한반도 5천 년 전쟁사와 호국 영웅의 발자취
오전 전쟁기념관 전쟁역사실 → 오후 전쟁기념관 6·25전쟁실. 전쟁의 역사 속에서 평화의 가치를 생각합니다.

---

### 인원별 특별가 (점심 포함)
| 참가 인원 | 정상가 | 특별가 |
|---|---|---|
| 1~15명 | 100,000원/1인 | **55,000원/1인** |
| 16~25명 | 90,000원/1인 | **45,000원/1인** |

학교별 일정과 코스는 맞춤 상담이 가능합니다.

---

서울을 구경하는 하루가 아니라, 서울을 이해하고 설명하는 하루를 만들어 드립니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUUV7bSf60Pc7ZASpuNrlm6DkfMobB984w35eK',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUUV7bSf60Pc7ZASpuNrlm6DkfMobB984w35eK', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUu5oTLWgqzJ9N6fjU7l1CMe4g83KvWERPTZox', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUVPoeBhZiH1cKdoxjhLn7rW92DE6FTRG8CMVs', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUa72CjM0jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUu265ODgqzJ9N6fjU7l1CMe4g83KvWERPTZox', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUGa9UOI1lE4snd6Z9SMRJCIXcHVL0eGT1fYBQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwIFMo4rHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUdh1NdJz3ASMsE152yTOf7qthwRuCYraJilVx', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUus3pj6gqzJ9N6fjU7l1CMe4g83KvWERPTZox', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUfxUJKzwYXJWu1oVDTHqP8vrcxMZCkl2Kis0f'],
  NULL,
  ARRAY['#서울', '#학생'],
  false,
  '2026-09-01T04:13:24.629Z', '2026-09-01T04:13:24.629Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-01T04:13:24.629Z';

-- 2026/27 특성화고 취업 두드림 캠프 — 꿈을 발견하고 미래를 준비하는 몰입형 진로 캠프
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_specialized_highschool_job_camp_2026',
  'PROGRAM_CARD_NEWS',
  '특성화고 프로그램',
  $pgtag$2026/27 특성화고 취업 두드림 캠프 — 꿈을 발견하고 미래를 준비하는 몰입형 진로 캠프$pgtag$,
  $pgtag$사계절 온천 워터파크 리조트 스플라스 리솜에서 진행하는 특성화고 전용 1박 2일 취업 두드림 캠프입니다. 몰입형 진로 프로그램으로 꿈을 발견하고 미래를 준비합니다.$pgtag$,
  $pgtag$## 2026/27 특성화고 취업 두드림 캠프 — 꿈을 발견하고 미래를 준비하는 몰입형 진로 캠프

> 스플라스 리솜을 활용한 특성화고를 위한 취업 두드림 캠프 프로그램, 1박 2일로 만나보세요.

사계절 온천 워터파크 리조트 **스플라스 리솜**에서 진행하는 특성화고 전용 진로 캠프입니다. 관광과 휴식을 더한 1박 2일 일정으로, 학생들이 부담 없이 참여하며 스스로 진로를 그려보는 몰입형 프로그램으로 구성했습니다.

---

우리 학교 학생들에게 맞는 일정과 프로그램 구성이 궁금하시다면 지금 바로 문의해 주세요.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUkRetBv7bST6wKN7BFrCA8PlOnQYXtGdVWhvs',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUkRetBv7bST6wKN7BFrCA8PlOnQYXtGdVWhvs'],
  NULL,
  ARRAY['#충남', '#특성화고'],
  false,
  '2026-09-01T04:13:25.629Z', '2026-09-01T04:13:25.629Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-01T04:13:25.629Z';
