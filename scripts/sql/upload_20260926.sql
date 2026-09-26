-- 카드뉴스 CDN 업로드 결과 (20260926) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 추석 인사 — 풍요로운 한가위, 사랑과 감사가 가득한 행복한 추석 보내세요
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_chuseok_greeting_popup_2026',
  'COMPANY_NEWS',
  ARRAY['기타 프로그램'],
  $pgtag$2026 추석 인사 — 풍요로운 한가위, 사랑과 감사가 가득한 행복한 추석 보내세요$pgtag$,
  $pgtag$터치더월드 대표이사 박정주가 전하는 2026 추석 인사입니다. 한국어·일본어·영어·중국어 4개 국어로 인사드립니다.$pgtag$,
  $pgtag$## 2026 추석 인사 — 풍요로운 한가위, 사랑과 감사가 가득한 행복한 추석 보내세요

> 사랑과 감사가 가득한 행복한 추석 보내세요.

터치더월드 대표이사 박정주가 학교·기관 관계자 여러분과 함께해주신 모든 분들께 추석 인사를 드립니다.

- **한국어**: 풍요로운 한가위, 사랑과 감사가 가득한 행복한 추석 보내세요.
- **日本語**: 実り豊かな秋夕、感謝と愛に満ちた幸せな秋夕をお過ごしください。
- **English**: A Bountiful Chuseok — Wishing you a joyful Chuseok filled with love and gratitude.
- **中文**: 月满中秋，愿您度过一个充满爱与感恩的幸福中秋节。

---
📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUo6E4fwJaQEnRI6cKGiuSJO0MCP9lHe3s7LF2',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUo6E4fwJaQEnRI6cKGiuSJO0MCP9lHe3s7LF2', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUU5wKbD60Pc7ZASpuNrlm6DkfMobB984w35eK', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUZEW754b1lfBSWUbzQmR7gGvJVsNTPeHuy406', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUjvoiLkcBK8DaS6t3R29uH7U0qEZhrgAdocLY'],
  NULL,
  ARRAY['#터치더월드'],
  true,
  '2026-09-26T07:23:08.110Z', '2026-09-26T07:23:08.110Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-26T07:23:08.110Z';
