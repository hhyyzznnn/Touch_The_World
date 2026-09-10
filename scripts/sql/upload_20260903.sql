-- 카드뉴스 CDN 업로드 결과 (20260903) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

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
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUL8VWdCjtWT9kdC5A7mlgBvzQ6GDahr3Lyn2U',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUL8VWdCjtWT9kdC5A7mlgBvzQ6GDahr3Lyn2U', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUWoGGxIFSlgJbqTfzrA6YP9vu8Gp1y74EtnIQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUjRiMWLbcBK8DaS6t3R29uH7U0qEZhrgAdocL', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUi0mourRmWtbG8ZzcQKndEYoT5sxaAJqjBk4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUr0wRgLuWI714bpzTKBotNYhHmEl6igsGCqUv', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoURcT9Q3muL4UEYHXyDAqQtaoOgSnmcFJlGTkj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUJ8kAu8uUmrTNe2UKLRDFO8iV67tYwJxQCbAa', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU6Z5Dmy8Ki6lvEAzSPyNtsMBx8dZ1fnhcp2g4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhyebxdTaLkNMi0neZEwOQsfG7rDvx5BKbaFl', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUe2rCpU1QG3zbOUuihwXK7ra6SM04NDWAYkBP'],
  NULL,
  ARRAY['#충남', '#특성화고'],
  false,
  '2026-09-03T10:38:52.530Z', '2026-09-03T10:38:52.530Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-03T10:38:52.530Z';

-- 2026 일본 후쿠오카 국제대면교류 3박4일 — 어느 작은 여자중학교의 아주 큰 이야기
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_fukuoka_junghwa_girls_exchange_2026',
  'PROGRAM_CARD_NEWS',
  '국외 교육여행',
  $pgtag$2026 일본 후쿠오카 국제대면교류 3박4일 — 어느 작은 여자중학교의 아주 큰 이야기$pgtag$,
  $pgtag$정화여자중학교 학생들이 2026년 8월 일본 후쿠오카로 떠난 3박4일 국제대면교류 이야기입니다. 사전 일본어·일본문화 교육부터 후쿠오카여학원중학교와의 수업·공동프로젝트·동아리 교류, 도시 답사까지 담았습니다.$pgtag$,
  $pgtag$## 2026 일본 후쿠오카 국제대면교류 3박4일 — 정화여자중학교 이야기

> 어느 작은 여자중학교의 아주 큰 일본 후쿠오카 연수 이야기

정화여자중학교 학생들이 2026년 8월, 3박4일 일정으로 일본 후쿠오카를 다녀왔습니다.

## 프로그램 구성

- **사전교육**: 일본문화 5시간 + 일본어 5시간, 총 10시간의 준비
- **도시 답사**: 후쿠오카타워·모모치해변·다자이후텐만구
- **자연·전통 체험**: 벳푸·유후인·긴린코·전통마을
- **국제교류**: 후쿠오카여학원중학교에서 수업·공동 프로젝트·동아리(현악) 체험
- **식사·숙박**: 호텔뷔페부터 회전스시·라면·오코노미야키·샤브샤브까지, 편안한 호텔과 꼼꼼한 동선으로 아이들의 안전을 최우선으로 준비

여행 중에도 학교와 학부모에게 실시간으로 사진과 소식을 공유해 안심할 수 있는 교류 프로그램으로 진행했습니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU7B3FRMdNFgObmhVnIuGCSqcij56QpZzA4Mtw',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU7B3FRMdNFgObmhVnIuGCSqcij56QpZzA4Mtw', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmeaTOPWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUivzHaSRmWtbG8ZzcQKndEYoT5sxaAJqjBk4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUR1beqfmuL4UEYHXyDAqQtaoOgSnmcFJlGTkj', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUn4AfGahWL7SstF9rKzQTGYhkpvNnXwHUaDg6', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUrO8NwduWI714bpzTKBotNYhHmEl6igsGCqUv', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUG253DO1lE4snd6Z9SMRJCIXcHVL0eGT1fYBQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUpFL3HOC3galydhriFfLwUM1evm2bDNCX6oQc', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwKbQVJrHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUrpPHCjuWI714bpzTKBotNYhHmEl6igsGCqUv'],
  NULL,
  ARRAY['#일본', '#중등'],
  false,
  '2026-09-03T10:38:53.530Z', '2026-09-03T10:38:53.530Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-03T10:38:53.530Z';

-- 스플라스 리솜 초중고 교육여행 — 미래설계·세계시민·역사문화 3종 프로그램
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_splasresort_edu_trip_popup_2026',
  'COMPANY_NEWS',
  '기타 프로그램',
  $pgtag$스플라스 리솜 초중고 교육여행 — 미래설계·세계시민·역사문화 3종 프로그램$pgtag$,
  $pgtag$스플라스 리솜 사계절 온천 워터파크 리조트에서 진행하는 초·중·고 맞춤형 교육여행 프로그램입니다. 미래설계·진로역량, 세계시민·지속가능성, 역사문화·독립운동정신 3가지 테마로 1일 체험학습부터 2박 3일까지 학교 상황에 맞춰 구성할 수 있습니다.$pgtag$,
  $pgtag$## 스플라스 리솜에서 만나는 특별한 교육여행

사계절 온천 워터파크 리조트 **스플라스 리솜**에서 초·중·고 학교급에 맞춘 몰입형 교육캠프를 운영합니다.

## 3가지 테마 프로그램

1. **미래설계·진로역량** — 창업, 취업, 진로, 리더십을 주제로 나의 가능성을 발견하고 미래를 설계합니다.
2. **세계시민·지속가능성** — 세계시민교육, ESG, 지속가능발전을 주제로 책임 있는 시민으로 성장합니다.
3. **역사문화·독립운동정신** — 윤봉길 의사 시낭송회·미니콘서트 등 역사 속 용기와 실천의 정신을 공연으로 만납니다.

1일 체험학습, 1박 2일, 2박 3일 중 학교 일정에 맞춰 선택할 수 있으며 학교 맞춤형 구성도 가능합니다.

📞 교육여행 프로그램 상담 1800-8078$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUqpSYjxO9A7j2kztRcFxLgUmZ30hYiPVnErWX',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUqpSYjxO9A7j2kztRcFxLgUmZ30hYiPVnErWX'],
  NULL,
  ARRAY['#충남', '#학생'],
  false,
  '2026-09-03T10:38:54.530Z', '2026-09-03T10:38:54.530Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-03T10:38:54.530Z';
