-- 카드뉴스 CDN 업로드 결과 (20261006) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 터치더월드 교육여행 소개 — 배움이 세상으로
INSERT INTO "CompanyNews" (
  "id","type","categories","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_touchtheworld_learning_world_2026',
  'PROGRAM_CARD_NEWS',
  ARRAY['기타 프로그램'],
  $pgtag$터치더월드 교육여행 소개 — 배움이 세상으로$pgtag$,
  $pgtag$28년 현장 노하우로 국내외 교육여행부터 교사 및 가족여행, 일본유학까지 — 여행을 넘어 학생 안에 남는 경험을 설계하는 터치더월드를 소개합니다.$pgtag$,
  $pgtag$## 터치더월드 교육여행 소개 — 배움이 세상으로

> 여행이 끝난 뒤에도 학생 안에 남는 경험을 설계합니다 — 28년 현장에서 답을 찾아온 교육여행의 경험

1996년부터 이어온 터치더월드는 목표부터 운영까지 한 흐름으로 연결되는 교육여행을 만듭니다. 이동이 아닌 경험을, 여행 전·중·후가 이어지는 배움을 설계합니다.

### 학교급별 맞춤 설계
- 초등학교 — 역사·문화·생태 체험학습
- 중학교 — 진로체험·공동체 주제별 탐구
- 고등학교 — 대학·기업 탐방, 전공·진학 연계
- 특성화고 — 전문학교 체험, 산업·해외 진로

### 국내부터 해외까지
- 국내 교육여행 — 지역의 역사·문화·생태·산업을 교실 밖에서 만나는 배움
- 해외 교육여행 — 대학·전문학교 탐방, 기업·산업현장 방문, 국제교류·문화체험
- 교사 및 가족여행 — 하나투어와 함께하는 특별한 여행 (ttw.hanatour.com)
- 일본유학 — 아소전문학교그룹과 연결되는 진학·현지 경험 (www.asojuku.co.kr)

### 준비 과정도 함께
교육목적 설정 → 일정·예산 검토 → 학교 내부 절차 → 세부 운영 준비까지, 처음 담당하시는 선생님도 흐름을 놓치지 않도록 함께 점검합니다.

학교급·인원·희망 시기·교육목적·지역·예산을 알려주시면 우리 학교에 맞는 여정을 함께 준비합니다.

📞 1800-8078
🌐 www.touchtheworld.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUJwkhVjUmrTNe2UKLRDFO8iV67tYwJxQCbAaZ',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUJwkhVjUmrTNe2UKLRDFO8iV67tYwJxQCbAaZ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUTUq98EOo7pdKtukLi5AHsGyVZ1oRvxQSclC4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUlulqfUNNY1WKyG52xDuAjm0kpqJZ3tB9Mngr', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUYiTthNzNMLoU3AIlab5GuSR7Qy4V8n9giExh', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUFSmJgrwgfawsy2XEATGp9mPCWbIe37dhq0n5', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUmuaJzCWVlRfzJYOHE5SByLtIgToQP6FxsZhk', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUcEvpmciuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUWcae4EFSlgJbqTfzrA6YP9vu8Gp1y74EtnIQ', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUTU0ukbxo7pdKtukLi5AHsGyVZ1oRvxQSclC4', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUcGbeaRiuKEt4biXQ9cYSVykWNO3sarhUqx76'],
  NULL,
  ARRAY['#학생', '#교사'],
  false,
  '2026-10-06T08:55:51.273Z', '2026-10-06T08:55:51.273Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-10-06T08:55:51.273Z';
