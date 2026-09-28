-- 카드뉴스 CDN 업로드 결과 (20260928) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 일본 유학 성공 루틴 — 작은 습관이 큰 성장을 만듭니다
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_japan_study_routine_2026',
  'PROGRAM_CARD_NEWS',
  ARRAY['일본 유학'],
  $pgtag$2026 일본 유학 성공 루틴 — 작은 습관이 큰 성장을 만듭니다$pgtag$,
  $pgtag$물 한 잔으로 시작하는 아침부터 자기 전 3줄 일기까지, 일본 유학 생활에서 꾸준히 실천하면 좋은 10가지 습관을 정리했습니다.$pgtag$,
  $pgtag$## 2026 일본 유학 성공 루틴 — 작은 습관이 큰 성장을 만듭니다

> 완벽하게보다 꾸준하게, 작은 습관 하나가 유학 생활의 성패를 가릅니다

일본 유학을 준비하거나 이미 시작한 학생이라면, 거창한 계획보다 매일 실천하는 작은 루틴이 더 큰 힘을 발휘합니다. 언어 학습부터 생활 태도까지, 오늘부터 시작할 수 있는 10가지 습관을 정리했습니다.

### 아침·학습 습관
- 일어나면 가족과 물 한 잔 마시기 — 건강한 하루의 시작
- 일본어 한자 매일 10자씩 소리 내어 읽고 쓰기
- 아주 쉬운 책부터 많이 읽기 — 하루 20분, 재미있게 시작

### 기록·소통 습관
- 자기 전 하루 3줄 일기 쓰기 — 경험·감정·배움을 한 줄씩
- 하루 한 명에게 먼저 인사하기 — 모르는 사람에게도 용기 내어

### 몸과 마음을 위한 습관
- 좋아하는 운동 한 가지 꾸준히 하기 (하루 20분)
- 악기 한 가지 특기로 만들기 — 매일 조금씩 연습
- 주말엔 조조 영화 보러 가기 — 혼자서도 새로운 문화 즐기기

### 미래를 준비하는 습관
- 매일 AI를 사용해 보며 질문하고 배우기
- 좋은 일이 올 것이라 믿고 매일 최선을 다하기

일본 유학, 작은 습관부터 함께 설계해 드립니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUeiu3VFQG3zbOUuihwXK7ra6SM04NDWAYkBPZ',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUeiu3VFQG3zbOUuihwXK7ra6SM04NDWAYkBPZ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoULBueMajtWT9kdC5A7mlgBvzQ6GDahr3Lyn2U', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUo6gkq2JaQEnRI6cKGiuSJO0MCP9lHe3s7LF2', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUgbZ9lsuVXJUlt9KLoPkdygb370m1TYGDOHec', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUSmQiMvGATzu3WryKjgbwQO6XBcmYGvP74oCd', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU182odG98LMk4mWFoDtX9nQCjwhubGisxrRv1', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU6mc4jk8Ki6lvEAzSPyNtsMBx8dZ1fnhcp2g4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUebWsEfQG3zbOUuihwXK7ra6SM04NDWAYkBPZ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUPJ9AsJLK5zYIDMjgva0ZRyACSolUQ39ePwxf', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU3R9srOnblO97m2Vp6ZWGajcYqkgdnE1MNKoI', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUKzKqClfwYWuiU8LSVTfcamk05EvZzbrtpqjd'],
  NULL,
  ARRAY['#일본', '#학생'],
  false,
  '2026-09-28T03:59:40.615Z', '2026-09-28T03:59:40.615Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-28T03:59:40.615Z';
