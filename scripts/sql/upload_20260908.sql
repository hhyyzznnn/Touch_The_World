-- 카드뉴스 CDN 업로드 결과 (20260908) — 기록용 로그, DB에는 이 스크립트가 직접 반영함

-- 2026 특성화고 일본 유학 글로벌 전략 — ASO College Group MOU 협약 혜택
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_aso_global_career_strategy_2026',
  'PROGRAM_CARD_NEWS',
  '일본 유학',
  $pgtag$2026 특성화고 일본 유학 글로벌 전략 — ASO College Group MOU 협약 혜택$pgtag$,
  $pgtag$대한민국 특성화고 학생을 위한 ASO College Group과의 MOU 협약 혜택을 소개합니다. 입학 시 장학금부터 JLPT 수준별 입학 보장, 한국연락사무소 지원, 취업 개별면담까지 진학부터 취업까지 이어지는 6가지 특별혜택과 미래산업 전공 선택 확대 전략을 담았습니다.$pgtag$,
  $pgtag$## 2026 특성화고 일본 유학 글로벌 전략 — ASO College Group MOU 협약 혜택

> ASO COLLEGE GROUP과 함께 여는 글로벌 진학·취업의 새로운 길

대한민국 특성화고의 선택이 글로벌 커리어를 바꿉니다. MOU 체결교 학생을 위한 특별혜택을 안내합니다.

## MOU 체결교 학생 특별혜택 6가지

1. **입학 시 15만 엔 장학금 지급** — 협약교 학생의 새로운 도전을 실질적인 장학 혜택으로 응원합니다.
2. **JLPT 수준별 입학 보장** — JLPT 2급 이상은 본과 직행, 3급 이하는 일본어과 경유 후 본과 입학을 보장합니다.
3. **한국연락사무소 서비스 이용** — 입학 전 상담부터 현지 적응까지 한국에서 편리하게 밀착 지원받습니다.
4. **취업 시 개별면담 및 추천 가능** — 전공과 적성에 맞는 진로 상담으로 일본 기업 취업의 기회를 넓힙니다.
5. **캠퍼스 시설 자유 이용** — 체육관·학생식당·도서관·자습실 등 학교 시설을 자유롭게 이용합니다.
6. **동아리 활동·유학생 커뮤니티 참여** — 관심사를 나누고 서로 응원하며 일본 생활에 자연스럽게 적응합니다.

## 글로벌 진로 전략

- **미래산업 전공 선택 확대**: 자동차·IT·AI·디자인·관광 등 적성에 맞는 전문 분야를 선택할 수 있습니다.
- **실무교육부터 일본 취업까지**: 현장 중심의 전문교육과 진로 지도로 글로벌 커리어의 첫걸음을 시작합니다.

장학금부터 입학·취업·현지생활까지, 학생의 도전을 끝까지 지원합니다.

📞 1800-8078
🌐 www.asojuku.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUAAsERwvpklq6Lh0DeGfR4xcS5EA2m1sVTQ7N',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUAAsERwvpklq6Lh0DeGfR4xcS5EA2m1sVTQ7N', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoU38HTiunblO97m2Vp6ZWGajcYqkgdnE1MNKoI', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUqDUoZPO9A7j2kztRcFxLgUmZ30hYiPVnErWX', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUTMydbno7pdKtukLi5AHsGyVZ1oRvxQSclC46', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUuZHHihagqzJ9N6fjU7l1CMe4g83KvWERPTZo', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUhJWD19aLkNMi0neZEwOQsfG7rDvx5BKbaFlg', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUc25cFPiuKEt4biXQ9cYSVykWNO3sarhUqx76', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUC13fb7A4iNT9WZywgO2XQDevaCVxqslIt3S1', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUwhSbiIrHwFWdfylzRPVeq7KvU0rQ15C36OSA', 'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUrVVPk6ZuWI714bpzTKBotNYhHmEl6igsGCqU'],
  NULL,
  ARRAY['#일본', '#특성화고'],
  false,
  '2026-09-08T05:25:59.627Z', '2026-09-08T05:25:59.627Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-08T05:25:59.627Z';

-- 2026 특성화고 일본 유학 MOU 협약 혜택 — ASO College Group 진학·취업 지원
INSERT INTO "CompanyNews" (
  "id","type","category","title","summary","content",
  "imageUrl","imageUrls","link","hashtags","isPinned","createdAt","updatedAt"
) VALUES (
  'cardnews_aso_global_career_popup_2026',
  'COMPANY_NEWS',
  '일본 유학',
  $pgtag$2026 특성화고 일본 유학 MOU 협약 혜택 — ASO College Group 진학·취업 지원$pgtag$,
  $pgtag$특성화고의 선택이 글로벌 커리어를 바꿉니다. ASO College Group과의 MOU 협약으로 진학 경쟁력(장학금·입학보장), 현지 정착 지원, 글로벌 커리어까지 이어지는 혜택을 한눈에 확인하세요.$pgtag$,
  $pgtag$## 특성화고의 선택이 글로벌 커리어를 바꿉니다

대한민국 특성화고의 글로벌 전략(일본편) — ASO COLLEGE GROUP과의 MOU 협약 혜택입니다.

1. **진학 경쟁력** — 입학 시 15만 엔 장학금, JLPT 2급 이상 본과 직행
2. **맞춤형 입학 경로** — JLPT 3급 이하 일본어과 경유 후 본과 입학 보장
3. **현지 정착 지원** — 한국연락사무소 서비스, 캠퍼스 시설 자유 이용
4. **글로벌 커리어** — 취업 개별면담 및 추천 가능, 동아리·유학생 커뮤니티 참여

특성화고에서 세계로, 당신의 커리어는 지금 시작됩니다.

📞 MOU 체결 및 진학 상담 1800-8078
🌐 www.asojuku.co.kr$pgtag$,
  'https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUyym5FV4zCDEmeMoRlFx8gLPdr1upBU9fb5ji',
  ARRAY['https://sutyyadzsr.ufs.sh/f/Y3X1UgzNMLoUyym5FV4zCDEmeMoRlFx8gLPdr1upBU9fb5ji'],
  NULL,
  ARRAY['#일본', '#특성화고'],
  false,
  '2026-09-08T05:26:00.627Z', '2026-09-08T05:26:00.627Z'
)
ON CONFLICT ("id") DO UPDATE SET
  "title"     = EXCLUDED."title",
  "summary"   = EXCLUDED."summary",
  "content"   = EXCLUDED."content",
  "imageUrl"  = EXCLUDED."imageUrl",
  "imageUrls" = EXCLUDED."imageUrls",
  "hashtags"  = EXCLUDED."hashtags",
  "updatedAt" = '2026-09-08T05:26:00.627Z';
