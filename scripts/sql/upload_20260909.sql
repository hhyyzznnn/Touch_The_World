-- 카드뉴스 CDN 업로드 결과 (20260909) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 과천여자고등학교 인천 1일체험학습 — 도시·역사·체험을 한 번에
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_gwacheon_girls_incheon_daytrip_2026',
  'PROGRAM_CARD_NEWS',
  '체험학습',
  $pgtag$2026 과천여자고등학교 인천 1일체험학습 — 도시·역사·체험을 한 번에$pgtag$,
  $pgtag$과천여자고등학교 학생 110명·교사 7명이 인천 개항장, 국립인천해양박물관, 월미도를 둘러본 1일체험학습 프로그램을 소개합니다.$pgtag$,
  $pgtag$## 2026 과천여자고등학교 인천 1일체험학습 — 도시·역사·체험을 한 번에

> 도시·역사·체험을 한 번에 담은, 인천에서 배우는 특별한 하루

## Program Overview

- **일정** 2026.09.09(수)
- **대상** 과천여고 학생 110명·교사 7명
- **지역** 인천 일원

## One Day Route

학교 출발 → 인천 상상플랫폼 → 개항장·차이나타운 → 송도국제도시 → 체험 프로그램 → 학교 귀환

## STOP 01. 인천 상상플랫폼

창의성과 문화가 만나는 여행의 첫 장. 새로운 공간에서 오늘의 배움을 시작합니다.

## STOP 02. 개항장거리 & 차이나타운

역사와 문화가 살아 숨 쉬는 골목 여행. 도시의 기억을 따라 걸으며 현장에서 배웁니다.

## STOP 03. 박물관 도슨트 투어 · 국립인천해양박물관

전문 해설과 함께 깊어지는 배움. 바다를 통해 만나는 인천의 역사를 실감형 전시로 확장된 탐구의 시간으로 채웁니다.

## 월미도 & 팀별 맞춤 체험

함께라서 더 특별한 체험, 월미바다열차와 월미테마파크에서 즐거움의 순간을 만들고, 팀을 나눠 각자 원하는 프로그램으로 체험·탐방을 이어갑니다.

안전하게, 즐겁게, 의미 있게 — 배움이 여행이 되는 하루였습니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUQdfA22sbAgdxsk6pRLel1vjPhUQ3NrwfaSXy',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUQdfA22sbAgdxsk6pRLel1vjPhUQ3NrwfaSXy', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUvdBdQlKXrLtFohmSiyf7Clv4s0qQAWa6VPd5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUZYLg0vb1lfBSWUbzQmR7gGvJVsNTPeHuy406', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUQMuwNPOsbAgdxsk6pRLel1vjPhUQ3NrwfaSX', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUiNmAO1RmWtbG8ZzcQKndEYoT5sxaAJqjBk4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUPVQt9wLK5zYIDMjgva0ZRyACSolUQ39ePwxf', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUaY863w0jABw9mP06QKvLxUDH81OfkY2yXc4h', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUrwq2tmuWI714bpzTKBotNYhHmEl6igsGCqUv', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUAyKeecvpklq6Lh0DeGfR4xcS5EA2m1sVTQ7N', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFXIvEpwgfawsy2XEATGp9mPCWbIe37dhq0n5'],
  NULL,
  ARRAY['#인천', '#고등', '#학생'],
  false,
  '2026-09-09T07:43:19.958Z', '2026-09-09T07:43:19.958Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-09T07:43:19.958Z';
